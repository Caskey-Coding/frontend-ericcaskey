#!/usr/bin/env bash
# Refuse any production artifact that does not contain the exact configured
# contact API URL. This script intentionally performs no AWS operations.
set -euo pipefail

EXPORT_DIR="${1:-out}"

if [ -z "${NEXT_PUBLIC_CONTACT_API_URL:-}" ]; then
  echo "ERROR: NEXT_PUBLIC_CONTACT_API_URL is required for a production artifact." >&2
  exit 1
fi

STATIC_DIR="${EXPORT_DIR%/}/_next/static"
if [ ! -d "$STATIC_DIR" ]; then
  echo "ERROR: static export directory is missing: $STATIC_DIR" >&2
  exit 1
fi

if ! grep -rqF -- "$NEXT_PUBLIC_CONTACT_API_URL" "$STATIC_DIR"; then
  echo "ERROR: built export does not contain the exact NEXT_PUBLIC_CONTACT_API_URL; refusing production use." >&2
  exit 1
fi

echo "Verified exact contact API URL in static export."
