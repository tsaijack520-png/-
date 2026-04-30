# 耳边 iOS 套壳 · 同事接手指引

> 给云帆/泰格的组长。这份是把云帆 MacBook Air M1 上跑不动模拟器的工程，转交到一台资源更宽裕的 Mac 继续验证用的。**所有 web 端合规改造和 Capacitor 套壳都已经做完，commit 都在 main 分支**。你这边只需要 clone → 编译 → 跑模拟器/真机看效果。

## 一、仓库地址（任选其一）

```
GitHub: https://github.com/tsaijack520-png/erbian-prototype.git
GitLab: https://gitlab.qmpexevcqy.work/yunfan/erbian.git
```

最新 commit：`3ea3b0c feat(ios): wrap with Capacitor 8 + native plugins for App Store`

## 二、Mac 必备

- **macOS 14+**（Sonoma 或更新；最好 macOS 15 Sequoia 或 26 Tahoe）
- **Xcode 15.4+**（推荐 16.x；如果是 macOS 26，必须 Xcode 26）
- **Node 20+**（用 `node --version` 验证；推荐用 nvm 装）
- **iOS Simulator runtime**：在 Xcode → Settings → Components 里下载一个 iOS（任意版本即可，**iOS 17 比 iOS 26 省 ~30% 内存**，8GB Mac 推荐 iOS 17）
- **CocoaPods**（`brew install cocoapods`，Capacitor 8 一些插件还在用 Pods）
- **可选**：你的 iPhone + USB 数据线（如果走真机更快）

## 三、第一次 setup（10 分钟）

```bash
git clone https://github.com/tsaijack520-png/erbian-prototype.git
cd erbian-prototype/frontend

# 装前端依赖
npm install

# 配置后端地址（指向耳边 VPS 已部署的后端）
cat > .env.local <<'EOF'
VITE_API_BASE_URL=http://145.223.88.222:8086/api
EOF

# 构建前端 dist
npm run build

# 同步到 iOS 工程
npx cap sync ios
```

## 四、用 Xcode 打开工程

```bash
open ios/App/App.xcodeproj
```

进 Xcode 后：

1. **左侧最上面**点蓝色 App 图标 → 中央切到 **Signing & Capabilities** 标签
2. **Team** 下拉选**你自己的 Apple ID**（不是云帆的 —— 每个人都用自己的 Personal Team）
3. **Bundle Identifier** 保持 `fm.erbian.app`（如果报"不是唯一的"错，加个后缀比如 `fm.erbian.app.yourname`）
4. 顶部工具栏中央设备选择器 → 选一个 iPhone simulator（推荐 iPhone 16，如果只有 iPhone 17 系列也行）
5. 按 **Cmd + R** 编译并启动

第一次会下载 SPM 依赖（约 1-2 分钟）。

## 五、预期效果

App 启动后会看到：
- 米色启动屏 → React 主页加载
- 进入 **AI 陪伴 → 任意角色** 会弹 **17+ 年龄分级浮层**（必须勾选确认才能进对话）
- AI 对话框输入 "做爱" / "自杀" 会被红色卡片拦截（内容守门）
- AI 回复的气泡右下角有 **举报** 按钮 → 弹底部 sheet
- 内容详情页有 **分享给朋友** 按钮 → 弹 iOS 系统分享面板（这是 Capacitor `@capacitor/share` 原生 API）
- 播放器暂停/继续按钮按下时有触觉反馈（Haptics，模拟器可能不明显，真机有震动）
- 我的 → 账号与设置 → 滚到底有 **已拉黑创作者** 和 **我的举报记录** 两个 section
- `/me/vip`、`/ai/packs` 都是"敬请期待"占位页（V1 不上支付，符合 App Store Guideline 3.1.1）

## 六、踩过的坑（避免重复）

### 坑 1：模拟器 runtime 注册失败
**症状**：`xcodebuild -downloadPlatform iOS` 显示下完了但 `xcrun simctl list runtimes` 是空的。
**原因**：macOS 26 + Xcode 26 一个已知 bug，CLI 安装 simulator runtime 容易卡在最后注册步骤。
**对策**：**第一次装 simulator runtime 一律走 Xcode UI**（Settings → Components → 点 GET），不要用命令行。

### 坑 2：8GB Mac 跑 iOS 26 模拟器内存不够
**症状**：模拟器卡在 Apple logo 或转圈，系统 App（Calendar / SpringBoard）启动 30 秒被 watchdog 杀掉。
**原因**：iOS 26 模拟器需要 4-5 GB 内存，8GB Mac 余量不够。
**对策**：装 **iOS 17 simulator runtime**（更轻），或者用 **真机调试**（推荐）。

### 坑 3：BrowserRouter 改成 HashRouter
**说明**：Capacitor 加载本地 `file://` 协议的 SPA，BrowserRouter 路由会全挂，必须用 HashRouter。
**已改**：`frontend/src/App.tsx` 已经是 HashRouter，不用动。

### 坑 4：vite base 必须是 `'./'`
**说明**：本地 file:// 加载相对路径资源。
**已改**：`frontend/vite.config.ts` 已设 `base: './'`。

### 坑 5：VPS 后端是 HTTP（145.223.88.222 没 HTTPS）
**已配**：`Info.plist` 里加了 ATS 例外允许该 IP。但 Apple 审核可能问，长期看 VPS 应该上 HTTPS。

### 坑 6：Push Notifications capability 需付费 Apple Developer Program
**已知**：免费 Apple ID 加 Push Notifications capability 会报错。**先不要勾它**，能编译能跑模拟器；要真上 TestFlight 时再付费 $99/年。

## 七、走真机（如果模拟器还是不行）

1. iPhone 用线连 Mac → 信任电脑
2. iPhone 设置 → 隐私与安全性 → **开发者模式** → 打开 → 重启
3. Xcode 顶部设备选你这台 iPhone → Cmd+R
4. iPhone 上首次运行会要求"信任开发者"：iPhone 设置 → 通用 → VPN与设备管理 → 找到你的 Apple ID → 信任
5. 免费 Apple ID 限制：同时最多 3 个 sideload App、每 7 天要重签（重新 Cmd+R）

## 八、需要云帆决策的事

跑通后告诉云帆，让他拍板：
- ✅ 模拟器 / 真机能跑通了，截图发回来
- ❓ 是否准备付费 $99/年 Apple Developer Program → 决定下一步走 TestFlight 还是继续 sideload
- ❓ 准备走 App Store Connect 创建 App，需要一组上架素材（图标 1024x1024、5 张截图、隐私政策 URL、年龄分级问卷）

## 九、出错联系

任何编译/启动报错，把 Xcode 输出（**View → Navigators → Reports**）截图发回来。常见错误处理：
- "No such module 'Capacitor'" → 重新 `npx cap sync ios`
- "Signing for "App" requires a development team" → 回 Step 四第 2 步选 Team
- "Cannot launch app: Could not launch ... process launch failed" → 用真机重试
