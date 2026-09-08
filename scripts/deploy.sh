#!/usr/bin/env bash
# Local production build and shared safe uploader. Required environment:
# CLOUDFRONT_DISTRIBUTION_ID and NEXT_PUBLIC_CONTACT_API_URL.
set -euo pipefail
cd "$(dirname "$0")/.."
: "${CLOUDFRONT_DISTRIBUTION_ID:?Required: set CLOUDFRONT_DISTRIBUTION_ID}"
: "${NEXT_PUBLIC_CONTACT_API_URL:?Required: set NEXT_PUBLIC_CONTACT_API_URL}"
export NEXT_PUBLIC_CONTACT_API_URL
npm ci
npm run build
node scripts/deploy.mjs --no-build
