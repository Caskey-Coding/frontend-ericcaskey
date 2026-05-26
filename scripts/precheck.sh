#!/usr/bin/env bash
# Run the gates that PR validation runs in GitHub Actions, locally and
# for free. Saves Actions minutes by catching failures here instead of
# in the cloud. See AGENTS.md for context.
set -e
cd "$(dirname "$0")/.."

echo "==> lint"
npm run lint

echo "==> typecheck"
npm run typecheck

echo "==> build (static export)"
npm run build

echo ""
echo "Local precheck passed. Safe to push."
echo "Note: NDA + voice scan + Playwright E2E + npm audit still run in CI."
