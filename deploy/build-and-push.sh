#!/usr/bin/env bash
# 一键构建前端两份 dist 并发布：
#   1) frontend/dist (VITE_API_BASE_URL=/api) → rsync 到 VPS:/var/www/erbian/
#   2) 仓库根 index.html + assets/ (mock 模式) → 给 GitHub Pages
#
# 用法：bash deploy/build-and-push.sh [vps-host]
#   vps-host 默认 root@145.223.88.222，私钥默认 ~/Downloads/id_ed25519.bin
set -euo pipefail

VPS_HOST="${1:-root@145.223.88.222}"
VPS_KEY="${VPS_KEY:-$HOME/Downloads/id_ed25519.bin}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT/frontend"

echo "▶ 构建 mock 模式（GitHub Pages 用）"
rm -rf dist
npx vite build
echo "  → 同步到仓库根（GH Pages source）"
rm -f "$ROOT/index.html"
rm -rf "$ROOT/assets"
cp dist/index.html "$ROOT/index.html"
cp -r dist/assets "$ROOT/assets"

echo
echo "▶ 构建 /api 模式（VPS 用）"
rm -rf dist
VITE_API_BASE_URL=/api npx vite build

echo
echo "▶ rsync 到 VPS $VPS_HOST:/var/www/erbian/"
rsync -avz --delete \
  -e "ssh -i $VPS_KEY -o ConnectTimeout=20" \
  dist/ "$VPS_HOST:/var/www/erbian/"

echo
echo "✔ 完成。"
echo "  - GH Pages：commit + push 后 https://tsaijack520-png.github.io/erbian-prototype/ 自动更新"
echo "  - VPS：    http://145.223.88.222:8086/ 立即生效"
