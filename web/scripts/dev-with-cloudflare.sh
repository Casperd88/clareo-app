#!/usr/bin/env bash
set -euo pipefail

CF_CONFIG="${CF_TUNNEL_CONFIG:-./scripts/cloudflared.local.yml}"

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "❌ cloudflared not found. Install with: brew install cloudflared"
  exit 1
fi

echo "🌐 Starting Cloudflare named tunnel (config: ${CF_CONFIG})"
cloudflared tunnel --config "${CF_CONFIG}" run &
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
