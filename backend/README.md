# 耳边后台

基于 [Directus](https://directus.io) 的后台 CMS，供运营直接增删改内容、banner、套餐、订单、主播、审核。

## 技术栈

- **Directus 11**（开源 headless CMS，自带管理 UI）
- **Postgres 16**（数据库）
- **Cloudflare R2**（音频 + 图片对象存储，S3 协议兼容）
- **Redis**（缓存，可选）

## 目录结构

```
backend/
├── docker-compose.yml     # 本地开发：起 Directus + Postgres + Redis
├── Dockerfile             # 生产镜像（Railway 用）
├── railway.json           # Railway 部署配置
├── .env.example           # 环境变量模板
├── package.json
├── scripts/
│   ├── schema.mjs         # 所有 collections 声明式定义
│   └── setup.mjs          # 应用 schema 到 Directus
└── snapshots/             # Directus schema 快照（备份用）
```

---

## 一、本地起服务（开发验证用）

```bash
cd backend
cp .env.example .env      # 可直接用，本地已经有合理默认值

docker compose up -d
# 首次会下载镜像 + 初始化 Postgres，约 2-3 分钟
```

跑起来后访问 http://localhost:8055

默认管理员账号：
- 邮箱：`admin@erbian.fm`
- 密码：`admin123`

**首次登录后建议立刻改密码**（右下角头像 → Admin → Change Password）

### 应用数据表结构

```bash
cd backend
node scripts/setup.mjs
```

这会按 `scripts/schema.mjs` 的定义在 Directus 里创建所有 collections + fields + 关系 + 公开读权限。幂等，重跑不会破坏数据。

完成后在后台左侧能看到所有菜单：内容（contents）、主播（anchors）、banner、套餐（vip_plans）、AI 时长包（ai_packs）、AI 角色（ai_roles）、订单（orders）、创作者审核（creator_uploads）等。

---

## 二、部署到 Railway

### 1. 开 Railway 账号

https://railway.app（可用 GitHub 登录）

### 2. 新建项目

- **New Project → Deploy from GitHub repo**
- 选 `tsaijack520-png/erbian-prototype`
- **Root Directory** 填 `backend`
- Railway 会识别 `Dockerfile` 自动构建

### 3. 在同一个项目里加 Postgres 插件

- **+ New → Database → PostgreSQL**
- Railway 自动生成 `DATABASE_URL` 等环境变量，Directus 会自动读

### 4. 配置环境变量

在 Directus 服务的 Variables 标签页，按 `.env.example` 添加以下关键变量：

| 变量 | 说明 |
|---|---|
| `KEY` | 随机 32 位字符串（用 `openssl rand -base64 32` 生成）|
| `SECRET` | 同上 |
| `ADMIN_EMAIL` | 首次启动创建的管理员邮箱 |
| `ADMIN_PASSWORD` | 首次启动创建的管理员密码 |
| `PUBLIC_URL` | Railway 给的域名，如 `https://xxx.up.railway.app`（部署后填，可先留空） |
| `CORS_ENABLED` | `true` |
| `CORS_ORIGIN` | `https://tsaijack520-png.github.io,http://localhost:5173` |
| `FILES_MAX_UPLOAD_SIZE` | `200mb` |
| `DB_CLIENT` | `pg`（Railway Postgres 插件需要；其余 DB_* Railway 会从 `DATABASE_URL` 自动映射，手动加下面这条更稳）|

**注意**：Railway 的 `DATABASE_URL` 格式是 `postgresql://user:pass@host:port/db`。Directus 能直接读 `DATABASE_URL`，也可以手动展开：
```
DB_HOST     = ${{Postgres.PGHOST}}
DB_PORT     = ${{Postgres.PGPORT}}
DB_DATABASE = ${{Postgres.PGDATABASE}}
DB_USER     = ${{Postgres.PGUSER}}
DB_PASSWORD = ${{Postgres.PGPASSWORD}}
```

### 5. 配对象存储（Cloudflare R2）

音频和图片不存 Railway，存 R2，能省流量钱且全球 CDN。

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com) → R2 → Create bucket
   - Bucket 名：`erbian-media`
2. R2 → Manage R2 API Tokens → Create API token
   - Permissions：`Object Read & Write`
   - Specify bucket：`erbian-media`
   - 生成的 Access Key ID / Secret Access Key 记下来
3. Bucket 页面查 **Account ID**（在 R2 首页右侧）
4. Railway 的 Directus 服务追加环境变量：

```
STORAGE_LOCATIONS                 = r2
STORAGE_R2_DRIVER                 = s3
STORAGE_R2_KEY                    = <access-key-id>
STORAGE_R2_SECRET                 = <secret-access-key>
STORAGE_R2_BUCKET                 = erbian-media
STORAGE_R2_REGION                 = auto
STORAGE_R2_ENDPOINT               = https://<account-id>.r2.cloudflarestorage.com
STORAGE_R2_FORCE_PATH_STYLE       = true
```

（可选）绑定 R2 公开域名：R2 bucket → Settings → Public access → Custom Domains → 添加你的域名，然后在环境变量再加：
```
STORAGE_R2_ROOT = https://cdn.erbian.fm/
```
文件 URL 就会是 `https://cdn.erbian.fm/xxx.mp3`，前端直接用，不经过 Directus 转发。

### 6. 部署 + 初始化

保存变量后 Railway 会重新部署。等到 Deploy 状态变绿、点 "View Logs" 看到 `Server started at ...:8055`。

拿到 Railway 分配的域名（形如 `erbian-admin-production.up.railway.app`），在本地跑一次 setup：

```bash
cd backend
DIRECTUS_URL=https://<your-railway-domain> \
DIRECTUS_ADMIN_EMAIL=admin@erbian.fm \
DIRECTUS_ADMIN_PASSWORD=<你设的密码> \
node scripts/setup.mjs
```

所有 collection / field / 权限建完。

---

## 三、给运营录入内容的步骤

登录后台 `https://<your-railway-domain>`，左侧菜单的操作顺序建议：

1. **主播 (anchors)**：先建主播（填 name/intro/头像/标签），这是内容的关联主表
2. **系列 (series)**：如果内容是连载，先建系列
3. **内容 (contents)**：上传音频 + 封面 + 选主播 + 选系列 + 标签 + 定价，`status` 设 `published` 才会在前端展示
4. **推荐位 (recommended_contents)**：勾选哪些已发布内容进"今日推荐"
5. **Banner (banners)**：配首页轮播，target_type 选 content/anchor/url
6. **VIP 套餐 (vip_plans)** 和 **AI 时长包 (ai_packs)**：配价格、推荐标
7. **AI 角色 (ai_roles)**：配角色 intro / starter_prompts / 性格 traits

所有 `is_active = false` 的条目前端不显示。上下架直接切这个开关。

---

## 四、下一步（本轮不做）

- iOS 原生打包（Capacitor）+ Apple IAP 接入：`orders.apple_transaction_id` 和 `vip_plans.apple_product_id` 字段已预留
- Web 支付（如果不等 iOS）：加 Stripe 或微信/支付宝渠道
- 音频流式播放优化、断点续传（现在直接走 R2 URL 即可）

---

## 常见问题

**Q: 前端 fetch 后台报 CORS？**  
A: 确认 `CORS_ORIGIN` 包含前端域名，逗号分隔，不带尾斜杠。

**Q: setup.mjs 报 403？**  
A: 账号密码对不上，或管理员被错误设置成了 non-admin 角色。去 UI 确认 admin@erbian.fm 的 role 是 Administrator。

**Q: 音频上传失败？**  
A: 检查 R2 token 权限是否包含 Write，检查 `FILES_MAX_UPLOAD_SIZE` 是否够大。

**Q: 怎么备份数据？**  
A: Railway Postgres 可一键 Export。Directus 自身支持 `npx directus schema snapshot ./snapshots/xxx.yaml` 导出结构。
