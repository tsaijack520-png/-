# 耳边 · VPS 部署指南

后端 docker compose（Postgres + Redis + Directus），前端**不进容器**：dist 直接放主机
`/var/www/erbian/`，由主机已有的 nginx serve、`/api/` 反代到 127.0.0.1:8055。

> 一键发版：`bash deploy/build-and-push.sh`（本地构建两份 dist —— mock 给 GH Pages、`/api` 给 VPS —— 自动 rsync）。下面是手动版本与初始化步骤。

---

## 1. 前置要求

- VPS：≥ 2 核 4G，Debian/Ubuntu 或 CentOS 均可
- 已安装 **Docker ≥ 24** 和 **docker compose v2**
- 一个可解析到 VPS IP 的域名（比如 `admin.your-domain.com`）
- 建议前置 Caddy / Traefik / Nginx 做 HTTPS；本 compose 监听 HTTP

快速装 docker：
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # 重新登录生效
```

---

## 2. 拉代码 + 配置

假设你把整包解压到 `/opt/erbian`：
```bash
cd /opt/erbian/deploy
cp .env.example .env
vim .env
```

`.env` 需要填的关键值：

| 变量 | 说明 |
|---|---|
| `PUBLIC_URL` | Directus 的公网地址，如 `https://admin.your-domain.com`，生成文件 URL 用 |
| `VITE_API_BASE_URL` | 前端接口前缀；同域反代保持默认 `/api` |
| `CORS_ORIGIN` | 允许的前端来源。同域时可填 `*` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | 超管账号 |
| `DIRECTUS_KEY` / `DIRECTUS_SECRET` | `openssl rand -base64 32` 生成两个 |
| `POSTGRES_PASSWORD` | 数据库强密码 |
| `WEB_PORT` | 主机暴露端口，默认 80；若前置反代改为 8080 |

要上 R2：参考 `.env.example` 最下面的块。不填就用本地 docker volume 存文件。

---

## 3. 起服务

```bash
cd /opt/erbian/deploy
docker compose up -d
```

只起 postgres + redis + directus，directus 监听 `127.0.0.1:8055`（不暴露公网）。
看日志：
```bash
docker compose logs -f directus
```
出现 `Server started at ...:8055` 即就绪。

主机 nginx vhost（参考 VPS 上 `/etc/nginx/sites-enabled/erbian.conf`）：
- `root /var/www/erbian` + SPA `try_files`
- `location /api/ → proxy_pass http://127.0.0.1:8055/`
- `location /api/assets/ → proxy_pass http://127.0.0.1:8055/assets/`

前端发布：
```bash
cd frontend
VITE_API_BASE_URL=/api npm run build
rsync -avz --delete dist/ root@<vps>:/var/www/erbian/
```
（或直接 `bash deploy/build-and-push.sh`。）

验证：
- 前端：`http://<vps-ip>:8086/`
- 后台：`http://<vps-ip>:8086/api/admin`

---

## 4. 初始化 collections（一次性）

后台启动后里面还是空的。在本地跑：
```bash
cd backend
DIRECTUS_URL=https://admin.your-domain.com \
DIRECTUS_ADMIN_EMAIL=<ADMIN_EMAIL> \
DIRECTUS_ADMIN_PASSWORD=<ADMIN_PASSWORD> \
node scripts/setup.mjs
```

幂等，可以重跑。完成后登录 Directus 就能看到：内容 / 主播 / banner / 套餐 / 订单 / 审核 等菜单。

（如果你不想在本地跑 node，可以 `docker compose exec directus sh`，然后把 scripts 目录拷进容器里跑。）

---

## 5. 日常运维

```bash
# 查看所有服务状态
docker compose ps

# 拉新版本前端代码后重新发布（本地构建 → rsync 主机）
bash deploy/build-and-push.sh

# 重启后端
docker compose restart directus

# 进 DB shell（临时排查用）
docker compose exec postgres psql -U directus

# 备份数据库
docker compose exec postgres pg_dump -U directus directus > backup-$(date +%F).sql

# 备份上传文件（本地存储时）
docker run --rm -v erbian_uploads:/src -v $(pwd):/dest alpine \
  tar czf /dest/uploads-$(date +%F).tar.gz -C /src .
```

卷名字是 `<目录名>_uploads`，如果 compose 目录叫 `deploy`，那就是 `deploy_uploads`（`docker volume ls` 能看到）。

---

## 6. 加 HTTPS（推荐）

最省事用 Caddy 做前置：

```bash
# /etc/caddy/Caddyfile
admin.your-domain.com {
  reverse_proxy localhost:80
}
```

Caddy 会自动申请并续签 Let's Encrypt 证书。如果你已经有 Nginx，也可以简单 proxy_pass。

---

## 7. 升级

```bash
cd /opt/erbian
git pull
cd deploy
docker compose up -d --build
```

`bootstrap` 命令幂等，不会破数据。Directus 大版本升级前建议先备份 DB。

---

## 常见问题

**Q: 浏览器打开空白？**  
检查 `/var/www/erbian/index.html` 是否引用了存在的 `assets/index-*.js`；不行就在本地重 `bash deploy/build-and-push.sh`。常见是 `VITE_API_BASE_URL` 没烘进 bundle，bundle 退回 mock 显示假数据。

**Q: 前端报 CORS？**  
`CORS_ORIGIN` 加上前端域名（逗号分隔，不带尾斜杠），`docker compose up -d` 刷新。

**Q: 上传文件 413？**  
`FILES_MAX_UPLOAD_SIZE` 调大，并确认主机 nginx vhost 的 `client_max_body_size` 够（VPS 上 `erbian.conf` 默认 200M，超过这个值需要一起改）。

**Q: 怎么看后端错误？**  
```bash
docker compose logs --tail=200 directus
```

**Q: 数据库想拉到本地？**  
`docker compose exec postgres pg_dump -U directus directus | gzip > db.sql.gz`，scp 下来即可。
