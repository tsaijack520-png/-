import { useEffect, useRef, useState } from 'react'

// 极简 async 数据 hook：调 loader(), 拿 data/loading
// 配合 data/source 的 loadXxx 使用（内置 mock 回退，调用方不需处理 error）

export function useAppData<T>(loader: () => Promise<T>, deps: ReadonlyArray<unknown> = []): {
  data: T | null
  loading: boolean
  reload: () => void
} {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)
  const loaderRef = useRef(loader)
  loaderRef.current = loader

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    loaderRef.current().then((result) => {
      if (cancelled) return
      setData(result)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  return { data, loading, reload: () => setTick((n) => n + 1) }
}
