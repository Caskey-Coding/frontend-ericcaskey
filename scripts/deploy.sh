#!/usr/bin/env bash
# Local deploy fallback for when GitHub Actions is paused or out of
# minutes. Mirrors .github/workflows/deploy-production.yml. Requires
# the aws CLI configured (`aws configure` or AWS_* env vars) with
# S3 + CloudFront access.
#
# Usage:
#   export CLOUDFRONT_DISTRIBUTION_ID=<distribution-id>
#   export NEXT_PUBLIC_CONTACT_API_URL=<contact-api-endpoint>
#   bash scripts/deploy.sh
set -euo pipefail
cd "$(dirname "$0")/.."

: "${CLOUDFRONT_DISTRIBUTION_ID:?Required: set CLOUDFRONT_DISTRIBUTION_ID}"
# Without this the contact form POSTs relative /contact against CloudFront
# and every submission fails (B-070). Use the same value as the repo
# Actions variable: gh variable list | grep NEXT_PUBLIC_CONTACT_API_URL
: "${NEXT_PUBLIC_CONTACT_API_URL:?Required: set NEXT_PUBLIC_CONTACT_API_URL (contact form API endpoint)}"
export NEXT_PUBLIC_CONTACT_API_URL
S3_BUCKET="ericcaskey.com"

echo "==> npm ci + build (static export)"
npm ci
npm run build

echo "==> verify contact API URL baked into export"
if ! grep -rqF "$NEXT_PUBLIC_CONTACT_API_URL" out/_next/static/; then
  echo "ERROR: built export does not contain NEXT_PUBLIC_CONTACT_API_URL; refusing to deploy." >&2
  exit 1
fi

echo "==> aws s3 sync to s3://$S3_BUCKET"
aws s3 sync out/ "s3://$S3_BUCKET" --delete

echo "==> fix Content-Type on opengraph-image files"
# Next.js opengraph-image.tsx emits the PNG without a .png extension;
# s3 sync defaults extensionless files to application/octet-stream,
# which OG scrapers reject.
aws s3 cp "s3://$S3_BUCKET/" "s3://$S3_BUCKET/" \
  --recursive \
  --exclude "*" \
  --include "opengraph-image" \
  --include "*/opengraph-image" \
  --metadata-directive REPLACE \
  --content-type image/png \
  --cache-control "public, max-age=3600"

echo "==> CloudFront invalidation"
aws cloudfront create-invalidation \
  --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
  --paths "/*"

echo "==> healthcheck"
bash .github/scripts/healthcheck.sh https://ericcaskey.com

echo ""
echo "Local deploy complete."
