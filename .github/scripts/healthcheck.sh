#!/usr/bin/env bash
#
# Multi-route smoke test for ericcaskey.com. Five routes, each asserts:
#   1. HTTP 200
#   2. A route-specific body marker (catches CloudFront errorResponses
#      fallback which would otherwise hide a missing key with a 200).
#
# Usage:
#   bash healthcheck.sh https://ericcaskey.com
#
set -uo pipefail

BASE_URL="${1:-https://ericcaskey.com}"
FAIL=0
TOTAL=0

# (path, case-insensitive grep-E regex)
ROUTES=(
  "/|eric caskey"
  "/about|(about|prudential|career|years)"
  "/work|(work|prudential|amazon|timeline)"
  "/writing|(writing|essay|reading)"
  "/contact|(contact|message|email)"
)

check() {
  local path="$1"
  local pattern="$2"
  local url="${BASE_URL}${path}"
  local tmp
  tmp=$(mktemp)
  local status
  status=$(curl -sL --max-time 10 -o "$tmp" -w "%{http_code}" "$url")
  TOTAL=$((TOTAL + 1))
  if [ "$status" != "200" ]; then
    echo "  ❌ ${path} : HTTP ${status}"
    FAIL=$((FAIL + 1))
  elif ! grep -qiE "$pattern" "$tmp"; then
    echo "  ❌ ${path} : HTTP 200 but body did not match /${pattern}/ (CloudFront fallback?)"
    FAIL=$((FAIL + 1))
  else
    echo "  ✅ ${path} : 200 + body match"
  fi
  rm -f "$tmp"
}

echo "Healthcheck: ${BASE_URL}"
for entry in "${ROUTES[@]}"; do
  IFS='|' read -r path pattern <<< "$entry"
  check "$path" "$pattern"
done

if [ "$FAIL" -gt 0 ]; then
  echo ""
  echo "Healthcheck failed: ${FAIL}/${TOTAL} route(s) did not match."
  exit 1
fi
echo ""
echo "Healthcheck passed: ${TOTAL}/${TOTAL} routes returned 200 with expected content."
