#!/usr/bin/env bash
set -euo pipefail

HOSTNAME="${CF_TUNNEL_HOSTNAME:-local.tryclareo.com}"
TARGET_URL="${CF_TUNNEL_TARGET_URL:-http://127.0.0.1:5173}"

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "❌ cloudflared not found. Install with: brew install cloudflared"
  exit 1
fi

echo "🌐 Starting Cloudflare tunnel: https://${HOSTNAME} -> ${TARGET_URL}"
cloudflared tunnel --url "${TARGET_URL}" --hostname "${HOSTNAME}" --no-autoupdate &
CF_PID=$!

cleanup() {
  if kill -0 "$CF_PID" >/dev/null 2>&1; then
    echo "\n🛑 Stopping Cloudflare tunnel..."
    kill "$CF_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT INT TERM

echo "⚡ Starting Vite dev server..."
npm run dev:vite
