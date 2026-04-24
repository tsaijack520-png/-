FROM directus/directus:11

# Directus 官方镜像已包含完整运行环境
# 自定义 extensions 可在这里 COPY 进来：
# COPY ./extensions /directus/extensions

# snapshots 用于把 schema 文件带入镜像，deploy 时 bootstrap 会自动 apply
COPY ./snapshots /directus/snapshots

EXPOSE 8055

# 启动逻辑：首次启动时 bootstrap 初始化数据库 + apply schema snapshot
# 交给 railway.json 的 startCommand 执行
