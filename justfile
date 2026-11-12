set windows-shell := ["cmd.exe", "/c"]

nda-scan:
    python scripts/voice_scan.py --profile frontend-nda --root .

voice-scan:
    python scripts/voice_scan.py --profile voice --root .

public-assets:
    python scripts/check-public-assets.py

rollback-safety:
    python tests/test_rollback_safety.py

deploy-tests:
    node --test tests/deploy.test.mjs

lint:
    npm run lint

typecheck:
    npm run typecheck

build:
    npm run build

e2e:
    npm run test:e2e

audit:
    npm audit --omit=dev --audit-level=high
