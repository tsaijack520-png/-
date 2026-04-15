# 耳边 MVP 开发拆解文档

## 1. 文档目标
本文件用于把《耳边 MVP 产品需求文档（PRD）》进一步拆成研发可执行结构，帮助产品、设计、前端、后端、测试快速对齐。

适用范围：
- MVP 版本开发
- 技术方案初步讨论
- 排期与任务拆分
- GitHub issue / project 初始化

---

## 2. MVP 交付目标
本期只交付 4 个核心模块：
1. 内容消费
2. AI 实时陪伴
3. 主播生态基础版
4. 基础变现体系

不交付：
- 私信定制
- 排行榜
- 复杂亲密度系统
- 直播
- 公会
- 复杂礼物互动

---

## 3. 建议技术分层

### 3.1 客户端（用户端 App / H5）
负责：
- 首页、分类、详情、播放、我的页面
- AI 角色选择与对话界面
- 会员/单条/时长包支付流程
- 收藏、继续收听、已购内容展示

### 3.2 主播端后台
负责：
- 主播登录
- 音频上传
- 内容管理
- 数据看板
- 收益查看

### 3.3 平台管理后台
负责：
- 主播审核
- 内容审核
- 用户与订单管理
- 下架、驳回、内容状态流转

### 3.4 服务端
负责：
- 用户账户与权限
- 内容管理
- 播放授权
- 系列/分集管理
- 订单与支付回调
- 会员权益
- AI 会话、角色、记忆、时长扣减
- 审核工作流

### 3.5 媒体与 AI 基础设施
负责：
- 音频对象存储
- CDN 分发
- AI 对话模型接入
- TTS / ASR 接入
- 音频上传转码（如需要）

---

## 4. 页面拆解

## 4.1 用户端页面

### 4.1.1 登录/注册页
**目标**：完成最小用户身份接入。

**核心元素**：
- 手机号/验证码登录，或第三方快捷登录
- 用户协议 / 隐私政策确认

**前端任务**：
- 登录表单
- 登录状态持久化

**后端任务**：
- 登录接口
- 用户基础资料初始化

---

### 4.1.2 首页
**目标**：让用户快速开始试听。

**核心模块**：
- 顶部 banner / 新人引导位
- 推荐内容流
- 分类快捷入口
- 连载专区
- 会员专区入口

**前端任务**：
- 内容卡片列表
- 推荐区块 UI
- 列表分页加载

**后端任务**：
- 首页推荐内容接口
- 新人活动位配置接口（可简化为配置项）

---

### 4.1.3 分类页
**目标**：按偏好快速找到内容。

**核心模块**：
- 角色标签
- 场景标签
- 排序筛选
- 内容列表

**前端任务**：
- 筛选切换
- 列表刷新

**后端任务**：
- 标签列表接口
- 内容筛选查询接口

---

### 4.1.4 内容详情页
**目标**：承接试听和付费转化。

**核心模块**：
- 封面、标题、主播、标签
- 内容简介
- 试听按钮
- 单次解锁按钮
- VIP 开通入口
- 系列信息 / 分集入口
- 收藏按钮

**前端任务**：
- 详情展示
- 试听播放器状态管理
- 购买弹层

**后端任务**：
- 内容详情接口
- 试听地址签发
- 权益校验

---

### 4.1.5 播放页
**目标**：稳定播放完整内容。

**核心模块**：
- 播放/暂停
- 播放进度
- 剩余时长
- 上一集/下一集（系列内容）
- 收藏 / 返回详情

**前端任务**：
- 音频播放器封装
- 播放进度持久化

**后端任务**：
- 播放授权接口
- 最近收听记录更新接口

---

### 4.1.6 连载系列详情页
**目标**：支持追更型内容消费。

**核心模块**：
- 系列封面
- 系列简介
- 集数列表
- 更新状态
- 当前已收听进度

**前端任务**：
- 集数列表 UI
- 已收听状态展示

**后端任务**：
- 系列详情接口
- 分集列表接口

---

### 4.1.7 AI 角色选择页
**目标**：让用户快速选择陪伴角色。

**核心模块**：
- 角色卡片
- 角色简介
- 性格标签
- 基础偏好设置入口
- 剩余时长显示

**前端任务**：
- 角色列表页
- 角色设置弹层

**后端任务**：
- 角色列表接口
- 用户角色偏好保存接口

---

### 4.1.8 AI 对话页
**目标**：完成可用的实时语音陪伴。

**核心模块**：
- 当前角色信息
- 语音输入状态
- AI 回复播放状态
- 剩余时长
- 结束会话
- 时长不足购买引导

**前端任务**：
- 麦克风权限
- 语音采集 / 状态提示
- AI 回复音频播放
- 会话计时器

**后端任务**：
- 创建会话接口
- 语音识别 / 模型调用 / TTS 编排
- 时长扣减逻辑
- 会话结束写回记忆

---

### 4.1.9 会员购买页
**目标**：提高订阅转化。

**核心模块**：
- 套餐卡
- 权益说明
- 支付按钮

**后端任务**：
- 会员套餐接口
- 下单接口
- 支付回调处理

---

### 4.1.10 AI 时长包购买页
**目标**：为 AI 场景提供直接付费入口。

**核心模块**：
- 时长包档位
- 剩余时长展示
- 支付按钮

**后端任务**：
- 时长包套餐接口
- 下单接口
- 支付回调与余额更新

---

### 4.1.11 我的页
**目标**：承载用户资产与历史。

**核心模块**：
- 会员状态
- 已购内容
- 收藏
- 最近收听
- AI 剩余时长

**后端任务**：
- 用户资产聚合接口

---

## 4.2 主播端页面

### 4.2.1 主播登录页
- 主播后台登录
- 主播身份校验

### 4.2.2 数据概览页
- 今日播放
- 今日试听
- 今日解锁
- 累计收益

### 4.2.3 上传音频页
- 上传文件
- 填写标题/简介/标签/价格
- 选择系列
- 提交审核

### 4.2.4 内容管理页
- 查看内容状态
- 编辑内容
- 下架内容

### 4.2.5 收益页
- 累计收益
- 可结算收益
- 收入趋势图

---

## 4.3 平台管理后台页面
- 主播审核页
- 内容审核页
- 用户管理页
- 订单管理页
- 内容下架/驳回页

---

## 5. 后端模块拆解

### 5.1 用户模块
**职责**：用户注册登录、资料、会员状态、角色偏好、资产聚合。

**核心能力**：
- 用户注册登录
- 用户资料查询与更新
- 会员状态查询
- AI 时长余额查询
- 收藏/收听历史

---

### 5.2 内容模块
**职责**：内容发布、展示、试听、播放、系列管理。

**核心能力**：
- 内容列表
- 内容详情
- 音频试听授权
- 音频正式播放授权
- 系列 / 分集组织
- 内容上下架状态

---

### 5.3 标签与分类模块
**职责**：角色标签、场景标签的配置与查询。

**核心能力**：
- 标签配置
- 标签查询
- 内容绑定标签

---

### 5.4 AI 陪伴模块
**职责**：角色管理、AI 会话、记忆、时长消耗。

**核心能力**：
- 角色列表
- 角色配置
- 创建/关闭会话
- 保存轻量记忆
- 用户剩余时长扣减
- 风险对话降级

---

### 5.5 支付与订单模块
**职责**：统一支付链路与权益发放。

**核心能力**：
- 下单
- 支付回调
- 订单查询
- 会员权益发放
- 单条内容解锁发放
- AI 时长余额增加

---

### 5.6 主播模块
**职责**：主播审核、内容上传、数据看板、收益统计。

**核心能力**：
- 主播申请与审核
- 主播信息查询
- 音频上传记录
- 内容统计
- 收益统计

---

### 5.7 审核模块
**职责**：处理主播、内容、AI 安全边界。

**核心能力**：
- 内容审核状态流转
- 驳回原因记录
- 敏感内容标记
- AI 输入输出策略挂载点

---

## 6. 数据实体建议

### 6.1 user
- id
- mobile / third_party_id
- nickname
- avatar
- created_at
- status

### 6.2 user_membership
- id
- user_id
- plan_id
- status
- start_at
- end_at

### 6.3 ai_balance
- id
- user_id
- remaining_seconds
- updated_at

### 6.4 ai_character
- id
- name
- avatar
- persona_summary
- tone_style
- relation_type
- status

### 6.5 user_character_profile
- id
- user_id
- character_id
- preferred_call_name
- tone_preference
- updated_at

### 6.6 ai_session
- id
- user_id
- character_id
- started_at
- ended_at
- consumed_seconds
- status

### 6.7 ai_memory
- id
- user_id
- character_id
- memory_type
- memory_content
- updated_at

### 6.8 host
- id
- display_name
- avatar
- intro
- status
- revenue_share_ratio

### 6.9 audio_series
- id
- title
- cover_url
- intro
- status
- is_finished
- host_id

### 6.10 audio_content
- id
- title
- cover_url
- intro
- host_id
- series_id
- duration_seconds
- price_amount
- is_vip_free
- status
- trial_seconds
- audio_url
- published_at

### 6.11 tag
- id
- name
- type
- status

### 6.12 content_tag_relation
- id
- content_id
- tag_id

### 6.13 favorite
- id
- user_id
- content_id or series_id
- created_at

### 6.14 playback_history
- id
- user_id
- content_id
- progress_seconds
- updated_at

### 6.15 order
- id
- user_id
- order_type
- target_id
- amount
- status
- paid_at
- channel

### 6.16 entitlement
- id
- user_id
- entitlement_type
- target_id
- start_at
- end_at
- status

### 6.17 review_task
- id
- review_type
- target_id
- status
- reviewer_id
- reject_reason
- created_at

### 6.18 host_income_stat
- id
- host_id
- content_id
- gross_amount
- host_amount
- platform_amount
- stat_date

---

## 7. API 草案

## 7.1 用户端 API

### 用户
- `POST /api/auth/login`
- `GET /api/user/profile`
- `GET /api/user/assets`

### 首页与分类
- `GET /api/home`
- `GET /api/tags`
- `GET /api/contents`
- `GET /api/series`

### 内容
- `GET /api/contents/:id`
- `GET /api/contents/:id/trial`
- `GET /api/contents/:id/play`
- `POST /api/contents/:id/favorite`
- `POST /api/contents/:id/unlock`

### 系列
- `GET /api/series/:id`
- `GET /api/series/:id/episodes`

### 播放记录
- `POST /api/playback/history`
- `GET /api/playback/recent`

### AI
- `GET /api/ai/characters`
- `POST /api/ai/profile`
- `POST /api/ai/sessions`
- `POST /api/ai/sessions/:id/message`
- `POST /api/ai/sessions/:id/end`
- `GET /api/ai/balance`

### 支付
- `GET /api/plans/membership`
- `GET /api/plans/ai-balance`
- `POST /api/orders`
- `POST /api/payments/callback`
- `GET /api/orders`

---

## 7.2 主播端 API
- `POST /api/host/login`
- `GET /api/host/dashboard`
- `POST /api/host/contents`
- `PUT /api/host/contents/:id`
- `GET /api/host/contents`
- `POST /api/host/contents/:id/offline`
- `GET /api/host/income`

---

## 7.3 平台管理 API
- `GET /api/admin/hosts/reviews`
- `POST /api/admin/hosts/:id/approve`
- `POST /api/admin/hosts/:id/reject`
- `GET /api/admin/contents/reviews`
- `POST /api/admin/contents/:id/approve`
- `POST /api/admin/contents/:id/reject`
- `GET /api/admin/orders`
- `GET /api/admin/users`
- `POST /api/admin/contents/:id/offline`

---

## 8. 状态机建议

### 8.1 内容状态
- draft
- pending_review
- approved
- rejected
- online
- offline

### 8.2 订单状态
- created
- paying
- paid
- failed
- refunded

### 8.3 AI 会话状态
- created
- active
- ended
- interrupted

### 8.4 主播状态
- applying
- approved
- rejected
- disabled

---

## 9. 埋点建议

### 9.1 内容消费埋点
- 首页曝光
- 分类点击
- 内容详情曝光
- 试听开始
- 试听结束
- 单条解锁点击
- VIP 开通点击
- 完整播放完成
- 收藏点击

### 9.2 AI 埋点
- AI 页曝光
- 角色点击
- 会话开始
- 会话结束
- 购买时长包点击
- 免费试用转付费

### 9.3 主播端埋点
- 上传开始
- 上传成功
- 提交审核
- 审核通过
- 审核驳回

---

## 10. 推荐开发顺序

### Phase 1：基础骨架
- 登录
- 首页 / 分类 / 详情 / 播放
- 内容表结构
- 主播上传后台骨架

### Phase 2：付费闭环
- 试听
- 单条解锁
- 会员
- 订单系统
- 支付回调

### Phase 3：AI 陪伴
- 角色配置
- 会话创建
- 语音链路
- 时长扣减
- 轻量记忆

### Phase 4：供给与审核
- 主播审核
- 内容审核
- 数据看板
- 收益统计

---

## 11. 测试重点
- 试听结束后是否正确拦截完整播放
- 解锁后权益是否即时生效
- 会员是否正确覆盖会员内容
- AI 时长是否准确扣减
- 支付回调重复触发时是否幂等
- 内容审核驳回后是否无法上架
- 已下架内容是否无法继续购买

---

## 12. GitHub 项目初始化建议
如果后续接入 GitHub，建议最少建立以下结构：
- `docs/`：PRD、开发拆解、任务清单
- `frontend/`：用户端项目
- `admin/`：主播端/平台后台
- `server/`：服务端
- `infra/`：部署与环境配置

建议优先创建以下 issue 分类：
- product
- frontend
- backend
- ai
- admin
- ops

---

## 13. 结论
本文件的目标不是代替技术设计，而是把 PRD 转成能直接进入研发排期的骨架。下一步最适合做的是：
1. 按模块创建 GitHub issues；
2. 明确前后端技术栈；
3. 按 P0/P1/P2 建立开发看板。
