# Agent guide — frontend-ericcaskey

## Before pushing: run the precheck

```bash
bash scripts/precheck.sh
```

This runs lint + typecheck + build — the same gates PR validation
runs in GitHub Actions, locally and for free. If it fails, fix and
re-run before `git push`.

**Why this matters**: every CI run on this repo costs minutes on a
metered monthly budget. Agents that "push and let CI tell me what's
wrong" burn 5-10x more minutes than agents that precheck locally.

The precheck skips the NDA/voice scans (cheap bash, ~30s in CI),
Playwright E2E (needs browser install), npm audit, and Lighthouse —
all still run in CI.

## CI kill switch

The CI workflows respect an org-level repository variable `CI_PAUSED`.
Setting it to `true` in `Settings → Secrets and variables → Actions →
Variables` makes expensive jobs (lint, build, e2e, npm-audit,
claude-review, lighthouse) skip immediately and consume zero minutes.
`deploy-production` is NOT gated and still fires on merge to `main`.

Use `CI_PAUSED=true` when over the monthly minute budget or AFK.
Unset (or set to any other value) to resume.
