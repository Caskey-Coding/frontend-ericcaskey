#!/usr/bin/env bash
# Rollback health gate: retain the route checks and prove the live contact
# client bundle contains the exact production API URL. It never submits a form.
set -euo pipefail

BASE_URL="${1:-https://ericcaskey.com}"
BASE_URL="${BASE_URL%/}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -z "${NEXT_PUBLIC_CONTACT_API_URL:-}" ]; then
  echo "ERROR: NEXT_PUBLIC_CONTACT_API_URL is required for rollback health." >&2
  exit 1
fi

bash "$SCRIPT_DIR/healthcheck.sh" "$BASE_URL"

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT
CONTACT_HTML="$TMP_DIR/contact.html"

if ! curl -fsSL --max-time 10 -o "$CONTACT_HTML" "$BASE_URL/contact"; then
  echo "ERROR: unable to fetch the live /contact page." >&2
  exit 1
fi

mapfile -t ASSETS < <(
  grep -oE 'src="[^"]*_next/static/[^"]+"' "$CONTACT_HTML" \
    | sed -e 's/^src="//' -e 's/"$//' \
    | sort -u
)

if [ "${#ASSETS[@]}" -eq 0 ]; then
  echo "ERROR: live /contact did not reference any client assets." >&2
  exit 1
fi

for index in "${!ASSETS[@]}"; do
  asset="${ASSETS[$index]}"
  case "$asset" in
    http://*|https://*) asset_url="$asset" ;;
    //*) asset_url="${BASE_URL%%:*}:$asset" ;;
    /*) asset_url="$BASE_URL$asset" ;;
    *) asset_url="$BASE_URL/$asset" ;;
  esac

  asset_file="$TMP_DIR/asset-$index"
  if ! curl -fsSL --max-time 10 -o "$asset_file" "$asset_url"; then
    echo "ERROR: unable to fetch contact client asset: $asset_url" >&2
    exit 1
  fi
  if grep -qF -- "$NEXT_PUBLIC_CONTACT_API_URL" "$asset_file"; then
    echo "Rollback health passed: five routes and exact live contact API URL verified."
    exit 0
  fi
done

echo "ERROR: live contact client assets do not contain the exact expected contact API URL." >&2
exit 1
