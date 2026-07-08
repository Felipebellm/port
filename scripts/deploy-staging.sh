#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/port-staging"
cd "$APP_DIR"

echo "==> [1/3] Syncing to latest develop (discarding any local drift)..."
git fetch origin develop
git reset --hard origin/develop
git clean -fd

echo "==> [2/3] Building frontend..."
cd frontend
npm ci --prefer-offline
npm run build

if [[ ! -f dist/index.html ]]; then
  echo "ERROR: build failed - dist/index.html not found" >&2
  exit 1
fi

echo "==> [3/3] Done. nginx serves dist/ directly, no reload needed for content-only changes."
