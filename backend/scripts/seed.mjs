// 耳边 · 一键灌入演示数据
//
// 用法：
//   DIRECTUS_URL=http://<host>:<port>/api \
//   DIRECTUS_ADMIN_EMAIL=... \
//   DIRECTUS_ADMIN_PASSWORD=... \
//   node scripts/seed.mjs
//
// 幂等：每个 collection 检测一下，如果已经有数据就整体跳过

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { Buffer } from 'node:buffer'

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
  console.error('请设置 DIRECTUS_ADMIN_EMAIL 和 DIRECTUS_ADMIN_PASSWORD')
  process.exit(1)
}

let token = ''

async function request(path, options = {}) {
  const url = `${DIRECTUS_URL}${path}`
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }
  if (!(options.body instanceof FormData) && options.body) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json'
  }
  const res = await fetch(url, { ...options, headers })
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

// ---------- 文件上传 ----------
async function uploadSvg(filename, svg, title) {
  const fd = new FormData()
  fd.append('title', title)
  fd.append('file', new Blob([svg], { type: 'image/svg+xml' }), filename)
  const res = await request('/files', { method: 'POST', body: fd })
  return res.data.id
}

async function listExistingFiles(titlePrefix) {
  const res = await request(`/files?filter[title][_starts_with]=${encodeURIComponent(titlePrefix)}&limit=20&fields=id,title`)
  return res.data || []
}

// ---------- 集合操作 ----------
async function listItems(collection, query = '') {
  const res = await request(`/items/${collection}${query ? '?' + query : ''}`)
  return res.data || []
}

async function createItem(collection, body) {
  const res = await request(`/items/${collection}`, { method: 'POST', body: JSON.stringify(body) })
  return res.data
}

async function ensureCollectionEmpty(name) {
  const rows = await listItems(name, 'limit=1&fields=id')
  return rows.length === 0
}

// ---------- 色块封面（5 个 tone）----------
const TONE_COLORS = {
  violet: '#7c4dff',
  rose: '#ff4d6d',
  blue: '#2196f3',
  gold: '#ffb300',
  emerald: '#00c853',
}

function makeToneSvg(tone) {
  const color = TONE_COLORS[tone]
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0.55"/>
    </linearGradient>
  </defs>
  <rect width="800" height="450" fill="url(#g)"/>
  <text x="400" y="225" text-anchor="middle" dominant-baseline="middle"
        font-family="-apple-system, sans-serif" font-size="56" font-weight="600"
        fill="white" opacity="0.85">${tone}</text>
</svg>`
}

async function ensureToneCovers() {
  const map = {}
  const existing = await listExistingFiles('tone-')
  for (const f of existing) {
    const m = f.title.match(/^tone-(violet|rose|blue|gold|emerald)$/)
    if (m) map[m[1]] = f.id
  }
  for (const tone of Object.keys(TONE_COLORS)) {
    if (map[tone]) continue
    const id = await uploadSvg(`tone-${tone}.svg`, makeToneSvg(tone), `tone-${tone}`)
    map[tone] = id
    console.log(`  ↑ tone cover: ${tone} → ${id}`)
  }
  return map
}

// ---------- 数据：anchors ----------
const ANCHORS = [
  { oldId: 'anchor-xiaoduo', name: '小耳朵', tone: 'violet',
    tagline: '偏温柔慢语速，擅长把深夜情绪接住。',
    intro: '睡前陪伴与轻安慰内容为主，更新节奏稳定。',
    update_note: '本周已更新 3 条内容，其中 1 条进入首页运营位。',
    follower_label: '12.8 万订阅', schedule_label: '通常在 22:30 - 01:00 上新',
    tags: ['睡前陪伴', '女友音', '温柔慢语速'] },
  { oldId: 'anchor-ashu', name: '阿述', tone: 'rose',
    tagline: '更有剧情张力，适合角色扮演与高回应感内容。',
    intro: '主打角色进入感和连续剧情，高回应感内容为主。',
    update_note: '新系列刚开更，连续 2 条内容进入分类热榜。',
    follower_label: '8.4 万订阅', schedule_label: '通常在 20:00 - 23:00 上新',
    tags: ['角色扮演', '霸总音', '情绪拉扯'] },
  { oldId: 'anchor-mianxia', name: '眠夏', tone: 'rose',
    tagline: '安抚情绪向陪伴，擅长哄人和好。',
    intro: '主打情绪安抚和关系修复，慢节奏低刺激。',
    update_note: '近期主推《别生气了，我来哄你》，复听率高。',
    follower_label: '6.2 万订阅', schedule_label: '通常在 21:00 - 23:30 上新',
    tags: ['女友音', '和好', '安抚'] },
  { oldId: 'anchor-senyu', name: '森屿', tone: 'blue',
    tagline: '轻撒娇向学妹音，剧情感舒服。',
    intro: '偏向轻剧情和黏人感的会员向内容。',
    update_note: '会员专区上新两条，复播率稳定。',
    follower_label: '4.8 万订阅', schedule_label: '通常在 19:00 - 22:00 上新',
    tags: ['学妹音', '轻剧情', 'VIP'] },
  { oldId: 'anchor-jiangce', name: '江策', tone: 'gold',
    tagline: '清醒鼓劲早安音，把节奏理顺。',
    intro: '主攻早安叫醒和工作日陪伴，语速明快。',
    update_note: '早安专栏每周 3 更，工作日循环必备。',
    follower_label: '5.1 万订阅', schedule_label: '通常在 06:30 - 08:00 上新',
    tags: ['男友音', '早安', '晨间'] },
]

const NAME_TO_ANCHOR = {
  '小耳朵': 'anchor-xiaoduo',
  '阿述': 'anchor-ashu',
  '眠夏': 'anchor-mianxia',
  '森屿': 'anchor-senyu',
  '江策': 'anchor-jiangce',
}

// ---------- 数据：series ----------
const SERIES = [
  { oldId: 's1', title: '今晚别挂电话', meta: '更新至第 8 集 · 情绪陪伴向', tone: 'violet', sort_order: 1 },
  { oldId: 's2', title: '学妹来敲门', meta: '更新至第 5 集 · 轻剧情向', tone: 'rose', sort_order: 2 },
  { oldId: 's3', title: '早安专属叫醒单', meta: '更新至第 4 集 · 晨间陪伴向', tone: 'gold', sort_order: 3 },
  { oldId: 's4', title: '等你回线', meta: '更新至第 2 集 · 持续连载中', tone: 'rose', sort_order: 4 },
]

// ---------- 数据：contents ----------
// 顺序对应 published_at（最新在前）
const CONTENTS = [
  { oldId: 'c1', title: '今晚我只陪你睡', creatorName: '小耳朵', seriesOldId: 's1', episode: 3,
    duration_seconds: 1080, badge: '热门', badge_tone: 'default', tone: 'violet',
    sort_tags: ['最热', '连载中'], role: '女友音', scene: '睡前陪伴',
    eyebrow: '女友音 · 睡前陪伴 · 连载第 3 集',
    description: '失眠的时候，就戴上耳机吧。她会轻轻和你说话，陪你慢慢安静下来。',
    unlock_label: '单集解锁 ¥9.9', is_vip_only: false, price_credits: 99 },
  { oldId: 'c2', title: '别生气了，我来哄你', creatorName: '眠夏', seriesOldId: 's2', episode: null,
    duration_seconds: 720, badge: '新品', badge_tone: 'default', tone: 'rose',
    sort_tags: ['最新', '最热'], role: '女友音', scene: '吵架和好',
    eyebrow: '女友音 · 吵架和好 · 单集内容',
    description: '适合在情绪别扭的时候反复回听，让关系重新慢下来。',
    unlock_label: '单集解锁 ¥9.9', is_vip_only: false, price_credits: 99 },
  { oldId: 'c3', title: '学妹今天只想黏着你', creatorName: '森屿', seriesOldId: 's2', episode: null,
    duration_seconds: 960, badge: 'VIP', badge_tone: 'vip', tone: 'blue',
    sort_tags: ['会员可听', '最热'], role: '学妹音', scene: '情景剧',
    eyebrow: '学妹音 · 轻剧情 · 会员可听',
    description: '偏轻松撒娇感的陪伴内容，适合在通勤和碎片时间进入状态。',
    unlock_label: '开通 VIP 立即收听', is_vip_only: true, price_credits: 0 },
  { oldId: 'category-1', title: '今晚我只陪你睡', creatorName: '小耳朵', seriesOldId: 's1', episode: 3,
    duration_seconds: 1080, badge: '试听中', badge_tone: 'default', tone: 'violet',
    sort_tags: ['最热', '连载中'], role: '女友音', scene: '睡前陪伴',
    eyebrow: '女友音 · 睡前陪伴 · 连载第 3 集',
    description: '失眠的时候，就戴上耳机吧。她会轻轻和你说话，陪你慢慢安静下来。',
    unlock_label: '单集解锁 ¥9.9', is_vip_only: false, price_credits: 99 },
  { oldId: 'category-2', title: '再靠近一点，我就哄你睡', creatorName: '小耳朵', seriesOldId: 's1', episode: 4,
    duration_seconds: 900, badge: '最新', badge_tone: 'default', tone: 'rose',
    sort_tags: ['最新'], role: '女友音', scene: '睡前陪伴',
    eyebrow: '女友音 · 睡前陪伴 · 新近上新',
    description: '更贴近耳边呢喃的一集，适合在入睡前反复回听。',
    unlock_label: '单集解锁 ¥8.8', is_vip_only: false, price_credits: 88 },
  { oldId: 'category-3', title: '学妹今天只想黏着你', creatorName: '森屿', seriesOldId: 's2', episode: null,
    duration_seconds: 960, badge: 'VIP', badge_tone: 'vip', tone: 'blue',
    sort_tags: ['会员可听', '最热'], role: '学妹音', scene: '情景剧',
    eyebrow: '学妹音 · 情景剧 · 会员精选',
    description: '轻剧情和亲密感更强，适合想要明显角色关系推进的时候。',
    unlock_label: '开通 VIP 立即收听', is_vip_only: true, price_credits: 0 },
  { oldId: 'category-4', title: '早安，今天也要先听我的', creatorName: '江策', seriesOldId: 's3', episode: 2,
    duration_seconds: 600, badge: '最热', badge_tone: 'default', tone: 'gold',
    sort_tags: ['最热'], role: '男友音', scene: '早安叫醒',
    eyebrow: '男友音 · 早安叫醒 · 晨间专栏',
    description: '语气清醒但不压迫，适合让起床这件事没那么痛苦。',
    unlock_label: '单集解锁 ¥6.6', is_vip_only: false, price_credits: 66 },
  { oldId: 'category-5', title: '别生气了，我来哄你', creatorName: '眠夏', seriesOldId: 's2', episode: null,
    duration_seconds: 720, badge: '¥9.9', badge_tone: 'default', tone: 'emerald',
    sort_tags: ['最热'], role: '女友音', scene: '吵架和好',
    eyebrow: '女友音 · 吵架和好 · 单集内容',
    description: '在关系别扭的情绪里，用更慢更软的方式把气氛拉回来。',
    unlock_label: '单集解锁 ¥9.9', is_vip_only: false, price_credits: 99 },
  { oldId: 'category-6', title: '今晚我会一直在线等你', creatorName: '阿述', seriesOldId: 's4', episode: 1,
    duration_seconds: 1200, badge: '连载中', badge_tone: 'default', tone: 'rose',
    sort_tags: ['连载中', '最新'], role: '霸总音', scene: '角色扮演',
    eyebrow: '霸总音 · 角色扮演 · 连载中',
    description: '更偏剧情推进和高回应感，适合想要明显角色张力的时候。',
    unlock_label: '单集解锁 ¥12.8', is_vip_only: false, price_credits: 128 },
]

// ---------- 数据：feature_tiles / banners / home_sections / recommended ----------
const FEATURE_TILES = [
  { title: '睡前陪伴', subtitle: '低干扰慢节奏内容', tone: 'violet', icon_key: 'sleep', to: '/category/filter/scene', sort_order: 1 },
  { title: '耳虫', subtitle: '高复听率短片段', tone: 'blue', icon_key: 'earworm', to: '/home/section/asmr', sort_order: 2 },
  { title: '叫醒专栏', subtitle: '晨间收听入口', tone: 'gold', icon_key: 'wake-up', to: '/category/filter/scene', sort_order: 3 },
  { title: '情景剧场', subtitle: '剧情向内容合集', tone: 'rose', icon_key: 'story', to: '/category/filter/role', sort_order: 4 },
]

const BANNERS = [
  { eyebrow: '连载更新', title: '今晚别挂电话',
    subtitle: '最新一集已上线，可直接接续收听。',
    meta: '深夜热播 · 情绪陪伴', tone: 'violet',
    target_type: 'content', target_oldId: 'c1',
    primary_action_label: '立即收听',
    secondary_action_label: '查看系列', secondary_action_to: '/home/section/series',
    sort_order: 1 },
  { eyebrow: '主播上新', title: '主播小耳朵上新',
    subtitle: '主页新增 3 条内容，可按系列或单集浏览。',
    meta: '主播直达 · 睡前陪伴', tone: 'rose',
    target_type: 'anchor', target_oldId: 'anchor-xiaoduo',
    primary_action_label: '进入主页',
    secondary_action_label: '查看推荐', secondary_action_to: '/home/section/recommended',
    sort_order: 2 },
  { eyebrow: '耳虫精选', title: '耳虫专区：高复听片段精选',
    subtitle: '这一组片段复播率高，适合先听片段再进入正片。',
    meta: '高复听率 · 片段精选', tone: 'blue',
    target_type: 'content', target_oldId: 'c3',
    primary_action_label: '收听片段',
    secondary_action_label: '查看耳虫', secondary_action_to: '/home/section/asmr',
    sort_order: 3 },
  { eyebrow: '晨间更新', title: '早安叫醒内容更新',
    subtitle: '晨间专栏新增内容，可直接加入明早播放。',
    meta: '早安更新 · 轻日常', tone: 'gold',
    target_type: 'content', target_oldId: 'category-4',
    primary_action_label: '试听叫醒',
    secondary_action_label: '筛选场景', secondary_action_to: '/category/filter/scene',
    sort_order: 4 },
  { eyebrow: '系列开更', title: '阿述新系列上线',
    subtitle: '新系列首批内容已上线，可从第一集开始追更。',
    meta: '主播直达 · 角色扮演', tone: 'emerald',
    target_type: 'anchor', target_oldId: 'anchor-ashu',
    primary_action_label: '查看主播',
    secondary_action_label: '筛选角色', secondary_action_to: '/category/filter/role',
    sort_order: 5 },
]

const HOME_SECTIONS = [
  { section_key: 'asmr', title: 'ASMR 专区', subtitle: '睡前、耳虫、叫醒都在这里',
    description: '高频单集合集，随时挑随时听。',
    contentOldIds: ['category-1', 'category-2', 'c1', 'c2', 'category-4', 'c3'] },
  { section_key: 'recommended', title: '今日推荐', subtitle: '今晚先从这几条开始',
    description: '按热度和更新节奏精选的一批内容。',
    contentOldIds: ['c1', 'c2', 'c3', 'category-4', 'category-5'] },
  { section_key: 'series', title: '连载专区', subtitle: '更新中的内容都在这里',
    description: '追更的时候从这里把系列一次找齐。',
    contentOldIds: ['c1', 'category-1', 'c3', 'category-6'] },
]

const RECOMMENDED = [
  { contentOldId: 'c1', sort_order: 1 },
  { contentOldId: 'c2', sort_order: 2 },
  { contentOldId: 'c3', sort_order: 3 },
]

// ---------- 数据：vip_plans / ai_packs / ai_roles ----------
const VIP_PLANS = [
  { type: 'subscription', title: '月度会员', price: '¥28/月',
    desc: '会员内容全解锁，连续剧随时听。', recommended: false, sort_order: 1 },
  { type: 'subscription', title: '年度会员', price: '¥228/年',
    desc: '长期收听性价比更高，每月折算更低。',
    bonus: '赠送 120 点数', recommended: true, sort_order: 2 },
  { type: 'credit', title: '轻量点数包', price: '¥18',
    desc: '少量点数补充，解锁单集或 AI 时长。',
    bonus: '60 点数', recommended: false, sort_order: 3 },
  { type: 'credit', title: '常用点数包', price: '¥45',
    desc: '追更与夜聊均适用，性价比均衡。',
    bonus: '180 点数 + 20 点赠送', recommended: true, sort_order: 4 },
  { type: 'credit', title: '重度陪伴点数包', price: '¥98',
    desc: '高频购买单集与 AI 时长首选。',
    bonus: '420 点数 + 优先体验新角色', recommended: false, sort_order: 5 },
]

const AI_PACKS = [
  { title: '夜聊补充包', price: '¥18', minutes: 15,
    description: '偶尔睡前补一段陪伴时长。', recommended: false, sort_order: 1 },
  { title: '连续陪伴包', price: '¥45', minutes: 45,
    description: '一周高频使用，含 5 分钟赠送。',
    bonus: '额外赠送 5 分钟', recommended: true, sort_order: 2 },
  { title: '重度陪伴月包', price: '¥98', minutes: 120,
    description: '固定角色长期对话，单分钟成本更低。',
    bonus: '附带优先体验新角色', recommended: false, sort_order: 3 },
]

const AI_ROLES = [
  { role_key: 'lanlan', name: '晚安岚岚', subtitle: '温柔收尾型陪伴',
    relationship: '固定深夜陪伴',
    intro: '失眠或加班后情绪难落地时，慢语速低刺激，帮你慢慢安静下来。',
    scene: '睡前安抚 / 晚安陪伴',
    traits: ['温柔', '慢语速', '记忆感'], tone: 'violet',
    memory_template: '你上次说最近加班多，睡前不太安静。今晚继续从这里开始。',
    starter_prompts: ['今天有点累，想先安静一会儿', '你先陪我把脑子放空下来', '可以轻轻跟我说说晚安吗'] },
  { role_key: 'chenxi', name: '晨曦学姐', subtitle: '清醒鼓劲型陪伴',
    relationship: '清醒的早间陪伴',
    intro: '通勤、起床或状态松散的时候，语气明快，帮你把节奏重新理顺。',
    scene: '早安叫醒 / 日常陪聊',
    traits: ['清爽', '鼓励式', '轻日常'], tone: 'blue',
    memory_template: '想把作息往前拉，但前一天晚上总收不住。',
    starter_prompts: ['明天别忘了提醒我早点睡', '陪我把明天要做的事排一下', '来一句清醒一点的早安台词'] },
  { role_key: 'jiuce', name: '久策', subtitle: '高掌控感角色陪伴',
    relationship: '剧情感角色陪伴',
    intro: '角色扮演与情绪拉扯感，高回应、专属称呼，适合想要强剧情感的时候。',
    scene: '角色扮演 / 情绪安抚',
    traits: ['克制', '占有感', '高回应'], tone: 'rose',
    memory_template: '偏好剧情张力强、高回应、固定称呼的角色型内容。',
    starter_prompts: ['今天你要怎么哄我', '继续上次那段剧情', '先叫我一声固定称呼'] },
]

// ---------- 主流程 ----------
async function main() {
  console.log(`\n▶ 目标 Directus：${DIRECTUS_URL}\n`)
  await login()

  console.log('\n== tone 占位封面 ==')
  const toneCover = await ensureToneCovers()

  // anchors
  console.log('\n== anchors ==')
  const anchorMap = {}
  if (await ensureCollectionEmpty('anchors')) {
    for (const a of ANCHORS) {
      const row = await createItem('anchors', {
        name: a.name, tagline: a.tagline, intro: a.intro,
        update_note: a.update_note, follower_label: a.follower_label,
        schedule_label: a.schedule_label, tags: a.tags, tone: a.tone,
        cover: toneCover[a.tone], is_active: true,
      })
      anchorMap[a.oldId] = row.id
      console.log(`  + ${a.name} → ${row.id}`)
    }
  } else {
    const rows = await listItems('anchors', 'fields=id,name&limit=50')
    for (const r of rows) {
      const found = ANCHORS.find((a) => a.name === r.name)
      if (found) anchorMap[found.oldId] = r.id
    }
    console.log('  ↷ 已有数据，建立映射后跳过')
  }

  // series
  console.log('\n== series ==')
  const seriesMap = {}
  if (await ensureCollectionEmpty('series')) {
    for (const s of SERIES) {
      const row = await createItem('series', {
        title: s.title, meta: s.meta, tone: s.tone,
        cover: toneCover[s.tone], sort_order: s.sort_order, is_active: true,
      })
      seriesMap[s.oldId] = row.id
      console.log(`  + ${s.title} → ${row.id}`)
    }
  } else {
    const rows = await listItems('series', 'fields=id,title&limit=50')
    for (const r of rows) {
      const found = SERIES.find((s) => s.title === r.title)
      if (found) seriesMap[found.oldId] = r.id
    }
    console.log('  ↷ 已有数据，建立映射后跳过')
  }

  // contents
  console.log('\n== contents ==')
  const contentMap = {}
  if (await ensureCollectionEmpty('contents')) {
    const now = Date.now()
    for (let i = 0; i < CONTENTS.length; i++) {
      const c = CONTENTS[i]
      const creatorOldId = NAME_TO_ANCHOR[c.creatorName]
      const publishedAt = new Date(now - i * 6 * 3600 * 1000).toISOString()
      const row = await createItem('contents', {
        title: c.title, eyebrow: c.eyebrow, description: c.description,
        creator: anchorMap[creatorOldId] || null,
        series: c.seriesOldId ? (seriesMap[c.seriesOldId] || null) : null,
        series_episode_number: c.episode,
        duration_seconds: c.duration_seconds,
        cover: toneCover[c.tone],
        role: c.role, scene: c.scene,
        sort_tags: c.sort_tags,
        badge: c.badge, badge_tone: c.badge_tone, tone: c.tone,
        price_credits: c.price_credits,
        unlock_label: c.unlock_label,
        is_vip_only: c.is_vip_only,
        status: 'published',
        published_at: publishedAt,
      })
      contentMap[c.oldId] = row.id
      console.log(`  + ${c.oldId} (${c.title}) → ${row.id}`)
    }
  } else {
    console.log('  ↷ 已有数据，跳过（不重建映射，banners/sections 跳过）')
  }

  // feature_tiles
  console.log('\n== feature_tiles ==')
  if (await ensureCollectionEmpty('feature_tiles')) {
    for (const t of FEATURE_TILES) {
      await createItem('feature_tiles', { ...t, is_active: true })
      console.log(`  + ${t.title}`)
    }
  } else {
    console.log('  ↷ 已有数据，跳过')
  }

  // banners
  console.log('\n== banners ==')
  if (await ensureCollectionEmpty('banners')) {
    for (const b of BANNERS) {
      const body = {
        eyebrow: b.eyebrow, title: b.title, subtitle: b.subtitle, meta: b.meta,
        tone: b.tone, target_type: b.target_type,
        primary_action_label: b.primary_action_label,
        secondary_action_label: b.secondary_action_label,
        secondary_action_to: b.secondary_action_to,
        sort_order: b.sort_order, is_active: true,
      }
      if (b.target_type === 'content') {
        body.target_content = contentMap[b.target_oldId] || null
      } else if (b.target_type === 'anchor') {
        body.target_anchor = anchorMap[b.target_oldId] || null
      }
      await createItem('banners', body)
      console.log(`  + ${b.title}`)
    }
  } else {
    console.log('  ↷ 已有数据，跳过')
  }

  // home_sections
  console.log('\n== home_sections ==')
  if (await ensureCollectionEmpty('home_sections')) {
    for (const s of HOME_SECTIONS) {
      const ids = s.contentOldIds.map((oid) => contentMap[oid]).filter(Boolean)
      await createItem('home_sections', {
        section_key: s.section_key, title: s.title, subtitle: s.subtitle,
        description: s.description, content_ids: ids,
      })
      console.log(`  + ${s.section_key} (${ids.length} 条)`)
    }
  } else {
    console.log('  ↷ 已有数据，跳过')
  }

  // recommended_contents
  console.log('\n== recommended_contents ==')
  if (await ensureCollectionEmpty('recommended_contents')) {
    for (const r of RECOMMENDED) {
      await createItem('recommended_contents', {
        content: contentMap[r.contentOldId], sort_order: r.sort_order, is_active: true,
      })
      console.log(`  + ${r.contentOldId}`)
    }
  } else {
    console.log('  ↷ 已有数据，跳过')
  }

  // vip_plans
  console.log('\n== vip_plans ==')
  if (await ensureCollectionEmpty('vip_plans')) {
    for (const v of VIP_PLANS) {
      await createItem('vip_plans', { ...v, is_active: true })
      console.log(`  + ${v.title}`)
    }
  } else {
    console.log('  ↷ 已有数据，跳过')
  }

  // ai_packs
  console.log('\n== ai_packs ==')
  if (await ensureCollectionEmpty('ai_packs')) {
    for (const p of AI_PACKS) {
      await createItem('ai_packs', { ...p, is_active: true })
      console.log(`  + ${p.title}`)
    }
  } else {
    console.log('  ↷ 已有数据，跳过')
  }

  // ai_roles
  console.log('\n== ai_roles ==')
  if (await ensureCollectionEmpty('ai_roles')) {
    for (const r of AI_ROLES) {
      await createItem('ai_roles', { ...r, is_active: true })
      console.log(`  + ${r.name}`)
    }
  } else {
    console.log('  ↷ 已有数据，跳过')
  }

  console.log('\n✔ seed 完成。前端走 /api 应该能看到完整 demo。')
}

main().catch((e) => {
  console.error('\n✖ 失败：', e.message)
  if (e.body) console.error(JSON.stringify(e.body, null, 2))
  process.exit(1)
})
