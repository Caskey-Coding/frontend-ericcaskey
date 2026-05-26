#!/usr/bin/env bash
# Local deploy fallback for when GitHub Actions is paused or out of
# minutes. Mirrors .github/workflows/deploy-production.yml. Requires
# the aws CLI configured (`aws configure` or AWS_* env vars) with
# S3 + CloudFront access.
#
# Usage:
#   export CLOUDFRONT_DISTRIBUTION_ID=<distribution-id>
#   bash scripts/deploy.sh
set -euo pipefail
cd "$(dirname "$0")/.."

: "${CLOUDFRONT_DISTRIBUTION_ID:?Required: set CLOUDFRONT_DISTRIBUTION_ID}"
S3_BUCKET="ericcaskey.com"

echo "==> npm ci + build (static export)"
npm ci
npm run build

echo "==> aws s3 sync to s3://$S3_BUCKET"
aws s3 sync out/ "s3://$S3_BUCKET" --delete

echo "==> CloudFront invalidation"
aws cloudfront create-invalidation \
  --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
  --paths "/*"

echo "==> healthcheck"
bash .github/scripts/healthcheck.sh https://ericcaskey.com

echo ""
echo "Local deploy complete."
