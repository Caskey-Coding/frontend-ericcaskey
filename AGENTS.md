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

The precheck skips NDA/voice scans (cheap bash, ~30s in CI),
Playwright E2E (needs browser install), npm audit, and Lighthouse —
all still run in CI.

## CI kill switch (auto-managed)

The CI workflows respect an org-level repository variable `CI_PAUSED`.
When `true`, expensive jobs (lint, build, e2e, npm-audit,
claude-review, lighthouse) skip immediately and consume zero minutes.
`deploy-production` is NOT gated.

`CI_PAUSED` is auto-managed by
`caskey-coding/ai-blog-infra/.github/workflows/auto-pause-ci.yml`,
which polls org Actions billing every 2 hours and flips the variable
when usage crosses 90% of monthly free tier. To manually override:

```bash
gh variable set CI_PAUSED --org caskey-coding --body false
```

## Local deploy fallback

When the org has fully exhausted Actions minutes (Actions disabled
entirely, not just the soft kill switch), deploy from your laptop:

```bash
export CLOUDFRONT_DISTRIBUTION_ID=<your-distribution-id>
bash scripts/deploy.sh
```

Mirrors `deploy-production.yml`: builds the static export, syncs to
S3, invalidates CloudFront, runs the multi-route healthcheck.
Requires `aws` CLI configured with the same credentials the workflow
uses.
