// 一键创建耳边所有 collections / fields / relations / 公开读权限
//
// 用法：
//   1. 先启动 Directus（docker compose up 或 Railway 上部署好）
//   2. 设置环境变量 DIRECTUS_URL / DIRECTUS_ADMIN_EMAIL / DIRECTUS_ADMIN_PASSWORD
//      或把它们写进 .env
//   3. node scripts/setup.mjs
//
// 幂等：已存在的 collection/field 会跳过

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { collections, publicReadCollections } from './schema.mjs'

// ---------- 读 .env ----------
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function loadEnv() {
  const envPath = resolve(__dirname, '..', '.env')
  try {
    const raw = readFileSync(envPath, 'utf8')
    raw.split('\n').forEach((line) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) return
      const eq = trimmed.indexOf('=')
      if (eq === -1) return
      const k = trimmed.slice(0, eq).trim()
      const v = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
      if (!process.env[k]) process.env[k] = v
    })
  } catch {}
}
loadEnv()

const DIRECTUS_URL = (process.env.DIRECTUS_URL || process.env.PUBLIC_URL || 'http://localhost:8055').replace(/\/$/, '')
const ADMIN_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL || process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('请在 .env 中设置 ADMIN_EMAIL 和 ADMIN_PASSWORD')
  process.exit(1)
}

// ---------- HTTP 工具 ----------
let token = ''

async function request(path, options = {}) {
  const url = `${DIRECTUS_URL}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const text = await res.text()
  let json
  try { json = text ? JSON.parse(text) : null } catch { json = text }
  if (!res.ok) {
    const err = new Error(`[${res.status}] ${options.method || 'GET'} ${path}: ${text.slice(0, 400)}`)
    err.status = res.status
    err.body = json
    throw err
  }
  return json
}

async function login() {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  })
  token = data.data.access_token
  console.log('✓ 管理员登录成功')
}

// ---------- Collection / Field 创建 ----------
async function collectionExists(name) {
  try {
    await request(`/collections/${name}`)
    return true
  } catch (e) {
    if (e.status === 403 || e.status === 404) return false
    throw e
  }
}

async function fieldExists(collection, field) {
  try {
    await request(`/fields/${collection}/${field}`)
    return true
  } catch (e) {
    if (e.status === 403 || e.status === 404) return false
    throw e
  }
}

async function createCollection(def) {
  if (await collectionExists(def.name)) {
    console.log(`  ↷ collection ${def.name} 已存在，跳过创建`)
    return
  }
  const body = {
    collection: def.name,
    meta: {
      icon: def.icon || 'folder',
      note: def.note || null,
      display_template: def.displayTemplate || null,
      singleton: !!def.singleton,
    },
    schema: { name: def.name },
    fields: [
      {
        field: 'id',
        type: 'uuid',
        meta: { hidden: true, interface: 'input', readonly: true, special: ['uuid'] },
        schema: { is_primary_key: true, length: 36, has_auto_increment: false },
      },
    ],
  }
  await request('/collections', { method: 'POST', body: JSON.stringify(body) })
  console.log(`✓ 创建 collection: ${def.name}`)
}

function buildFieldPayload(collection, f) {
  // 特殊：id 已随 collection 创建，不重复
  const payload = {
    field: f.field,
    type: f.type,
    meta: {
      interface: f.interface || null,
      special: f.special || null,
      options: f.options || null,
      note: f.note || null,
      readonly: !!f.readonly,
      hidden: !!f.hidden,
      required: !!f.required,
      sort: null,
      width: 'full',
    },
    schema: {
      is_nullable: !f.required,
      default_value: f.defaultValue !== undefined ? f.defaultValue : null,
    },
  }
  return payload
}

async function createField(collection, f) {
  if (f.field === 'id') return
  if (await fieldExists(collection, f.field)) {
    console.log(`  ↷ field ${collection}.${f.field} 已存在，跳过`)
    return
  }
  const payload = buildFieldPayload(collection, f)
  await request(`/fields/${collection}`, { method: 'POST', body: JSON.stringify(payload) })
  console.log(`  + ${collection}.${f.field}`)
}

// ---------- 关系（m2o）----------
async function ensureRelation(collection, field, relatedCollection) {
  // 查是否已存在
  try {
    const existing = await request(`/relations/${collection}/${field}`)
    if (existing && existing.data) return
  } catch (e) {
    if (e.status !== 404 && e.status !== 403) throw e
  }

  const body = {
    collection,
    field,
    related_collection: relatedCollection,
    schema: {
      on_delete: 'SET NULL',
    },
  }
  try {
    await request('/relations', { method: 'POST', body: JSON.stringify(body) })
  } catch (e) {
    const msg = (e?.message || '') + ''
    if (msg.includes('already exists') || e.status === 400) {
      console.log(`  ↷ relation ${collection}.${field} 已存在，跳过`)
      return
    }
    throw e
  }
  console.log(`  ↔ ${collection}.${field} → ${relatedCollection}`)
}

// ---------- 权限 ----------
// Directus 11：公开权限挂在 Public policy 上，不再用 role=null
let publicPolicyId = null

async function getPublicPolicyId() {
  if (publicPolicyId) return publicPolicyId
  const res = await request('/policies?filter[name][_eq]=$t:public_label&limit=1&fields=id,name')
  if (res?.data?.length) {
    publicPolicyId = res.data[0].id
    return publicPolicyId
  }
  throw new Error('找不到 Public policy（Directus 11 默认应有，请检查）')
}

async function grantPublicRead(collectionName) {
  const policyId = await getPublicPolicyId()
  const existing = await request(
    `/permissions?filter[collection][_eq]=${collectionName}&filter[action][_eq]=read&filter[policy][_eq]=${policyId}&limit=1`
  )
  if (existing?.data?.length) {
    return
  }
  const body = {
    collection: collectionName,
    action: 'read',
    policy: policyId,
    fields: ['*'],
    permissions: {},
    validation: null,
    presets: null,
  }
  await request('/permissions', { method: 'POST', body: JSON.stringify(body) })
  console.log(`  ✓ 公开读：${collectionName}`)
}

// ---------- 主流程 ----------
async function main() {
  console.log(`\n▶ 目标 Directus：${DIRECTUS_URL}\n`)

  await login()

  console.log('\n== 创建 collections ==')
  for (const def of collections) {
    await createCollection(def)
  }

  console.log('\n== 创建 fields ==')
  for (const def of collections) {
    // 处理关系字段，m2o 要求指向已存在的 collection，因此放后面
    const scalarFields = def.fields.filter((f) => !f.related)
    for (const f of scalarFields) {
      await createField(def.name, f)
    }
  }

  console.log('\n== 创建关系字段 (m2o) ==')
  for (const def of collections) {
    const relFields = def.fields.filter((f) => f.related)
    for (const f of relFields) {
      // 先建字段
      await createField(def.name, f)
      // 再建 relation
      await ensureRelation(def.name, f.field, f.related)
    }
  }

  console.log('\n== 开放公开读权限 ==')
  for (const c of publicReadCollections) {
    try {
      await grantPublicRead(c)
    } catch (e) {
      console.warn(`  ! 授权失败 ${c}: ${e.message}`)
    }
  }

  console.log('\n✔ 全部完成。登录 Directus UI 确认一下，然后可以开始在每个 collection 里录数据了。\n')
}

main().catch((e) => {
  console.error('\n✖ 失败：', e.message)
  if (e.body) console.error(JSON.stringify(e.body, null, 2))
  process.exit(1)
})
