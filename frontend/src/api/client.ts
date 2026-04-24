// Directus REST client
//
// 读取 VITE_API_BASE_URL；未配置则 isApiEnabled 返回 false，调用方应走 mock
// 所有列表接口默认带 filter[is_active][_eq]=true + sort=sort_order 的便捷方法

const RAW_BASE = import.meta.env.VITE_API_BASE_URL ?? ''
const BASE_URL = RAW_BASE.replace(/\/$/, '')

export function isApiEnabled(): boolean {
  return Boolean(BASE_URL)
}

export function apiBaseUrl(): string {
  return BASE_URL
}

export function assetUrl(fileId: string | null | undefined): string | undefined {
  if (!fileId || !BASE_URL) return undefined
  return `${BASE_URL}/assets/${fileId}`
}

export interface DirectusListQuery {
  fields?: string[]
  filter?: Record<string, unknown>
  sort?: string[]
  limit?: number
  deep?: Record<string, unknown>
}

function buildQueryString(query?: DirectusListQuery): string {
  if (!query) return ''
  const params = new URLSearchParams()

  if (query.fields?.length) params.set('fields', query.fields.join(','))
  if (query.sort?.length) params.set('sort', query.sort.join(','))
  if (query.limit) params.set('limit', String(query.limit))
  if (query.filter) params.set('filter', JSON.stringify(query.filter))
  if (query.deep) params.set('deep', JSON.stringify(query.deep))

  const str = params.toString()
  return str ? `?${str}` : ''
}

export async function directusFetch<T>(path: string, query?: DirectusListQuery): Promise<T> {
  if (!BASE_URL) throw new Error('VITE_API_BASE_URL not set')

  const url = `${BASE_URL}${path}${buildQueryString(query)}`
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) {
    throw new Error(`Directus ${res.status}: ${path}`)
  }
  const json = (await res.json()) as { data: T }
  return json.data
}

export async function directusList<T>(collection: string, query?: DirectusListQuery): Promise<T[]> {
  return directusFetch<T[]>(`/items/${collection}`, query)
}

export async function directusGet<T>(collection: string, id: string, query?: DirectusListQuery): Promise<T> {
  return directusFetch<T>(`/items/${collection}/${id}`, query)
}
