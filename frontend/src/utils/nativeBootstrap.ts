import { Capacitor } from '@capacitor/core'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'
import { PushNotifications } from '@capacitor/push-notifications'
import { Network } from '@capacitor/network'

export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform()
}

export function getPlatform(): string {
  return Capacitor.getPlatform()
}

/**
 * 应用启动时调用一次：
 * - 设置状态栏样式与背景色
 * - 注册推送 token（Apple Guideline 4.2 要求 App 具备原生能力，即使后端未接也要走通注册）
 * - React 渲染完成后再隐藏启动屏（避免白屏）
 * - 监听网络状态供 UI 离线兜底
 */
export async function bootstrapNative(onPushTokenReady?: (token: string) => void): Promise<void> {
  if (!isNativePlatform()) {
    return
  }

  try {
    await StatusBar.setStyle({ style: Style.Dark })
    await StatusBar.setBackgroundColor({ color: '#fff5ed' })
  } catch (err) {
    console.warn('StatusBar 初始化失败:', err)
  }

  try {
    const permission = await PushNotifications.checkPermissions()
    let granted = permission.receive === 'granted'
    if (permission.receive === 'prompt' || permission.receive === 'prompt-with-rationale') {
      const requested = await PushNotifications.requestPermissions()
      granted = requested.receive === 'granted'
    }
    if (granted) {
      await PushNotifications.register()
      PushNotifications.addListener('registration', (token) => {
        if (onPushTokenReady) onPushTokenReady(token.value)
      })
      PushNotifications.addListener('registrationError', (err) => {
        console.warn('推送注册失败:', err)
      })
    }
  } catch (err) {
    console.warn('推送初始化跳过:', err)
  }

  try {
    Network.addListener('networkStatusChange', (status) => {
      window.dispatchEvent(new CustomEvent('erbian:network', { detail: status }))
    })
  } catch (err) {
    console.warn('Network 监听失败:', err)
  }
}

export async function hideSplashScreen(): Promise<void> {
  if (!isNativePlatform()) {
    return
  }
  try {
    await SplashScreen.hide({ fadeOutDuration: 250 })
  } catch (err) {
    console.warn('SplashScreen 隐藏失败:', err)
  }
}
