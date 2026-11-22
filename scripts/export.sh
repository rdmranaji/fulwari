#!/usr/bin/env bash
# Builds the static preview (no server): API routes are set aside, orders go to WhatsApp.
set -euo pipefail
cd "$(dirname "$0")/.."
mv app/api .api-off
trap 'mv .api-off app/api' EXIT
rm -rf .next out
STATIC_EXPORT=1 npx next build
[ "${REHOST:-0}" = "1" ] && python3 scripts/rehost.py out || true
