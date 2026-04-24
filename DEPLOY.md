# 耳边 · 部署交付包

一份可直接上 VPS 的完整栈，读 `deploy/README.md` 一条 compose 起来。

## 目录

```
backend/     Directus 后台（镜像 + schema 初始化脚本）
frontend/    React 前端（多阶段 Dockerfile + nginx 配置）
deploy/      VPS 生产 docker-compose + .env 模板 + 运维文档 ← 从这开始
```

## 一分钟上手

```bash
scp 耳边_deploy_*.tar.gz user@vps:/opt/
ssh user@vps
cd /opt && tar xzf 耳边_deploy_*.tar.gz && cd erbian/deploy
cp .env.example .env
vim .env                      # 填域名、密码、key/secret
docker compose up -d --build
```

服务起来后在本地一次性初始化后台 collections：
```bash
cd backend
DIRECTUS_URL=https://<你的域名> \
DIRECTUS_ADMIN_EMAIL=<.env 里 ADMIN_EMAIL> \
DIRECTUS_ADMIN_PASSWORD=<.env 里 ADMIN_PASSWORD> \
node scripts/setup.mjs
```

完整步骤、HTTPS 配置、备份恢复、常见问题全部在 **[deploy/README.md](./deploy/README.md)**。
