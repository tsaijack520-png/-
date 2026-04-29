import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'
import './index.css'
import { bootstrapNative, hideSplashScreen } from './utils/nativeBootstrap'

const rootEl = document.getElementById('root')!
createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

void bootstrapNative((token) => {
  // 推送 token 缓存到 localStorage 供后续与后端绑定
  try {
    localStorage.setItem('earbian_push_token', token)
  } catch (err) {
    console.warn('保存推送 token 失败:', err)
  }
})

// React 首屏渲染完一帧后再隐藏启动屏，避免白屏
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    void hideSplashScreen()
  })
})
