# CI/CD Bar-Raiser Audit — `caskey-coding/frontend-ericcaskey`

**Date:** 2026-04-23
**Default branch:** `main` @ `238c33e`
**Scope:** Full `.github/workflows/**`, `package.json`, `next.config.ts`, `.nvmrc`, repo `CLAUDE.md`, linked specs.
**Time-box:** ~30 min. Branch protection / required checks not visible via API — flagged.

---

## Executive summary

Risk profile matches the brand's implied shape: content-driven static export (`next.config.ts:5` → `output: 'export'`), S3 + CloudFront, no runtime, no API routes, low-frequency human commits. CI surface is small (two workflows, ~210 lines combined) and does the basics correctly: pinned Node via `.nvmrc`, `npm ci` with committed lockfile, concurrency groups, artifact promotion from build → deploy, healthcheck-gated release, Discord notify.

**Headline problem:** long-lived AWS IAM user keys (`AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`) used for both S3 sync and CloudFront invalidation (`deploy-production.yml:48–51`). Same anti-pattern as in `ai-blog-web/.github/workflows/deploy-production.yml:55–58`. If both repos deploy into the same AWS account (which the shared specs workspace strongly suggests), a single leaked key blast-radius covers both personal brand and engineering brand. OIDC migration is the single highest-leverage fix.

### Per-dimension scores

| Dimension | Score | Note |
|---|---|---|
| 1. Correctness & reliability | **meets** | `npm ci`, `timeout-minutes`, PR concurrency cancel, build-once/deploy-once, healthcheck. |
| 2. Security & supply chain | **gap** | Static AWS keys; third-party actions pinned by major tag only; no Dependabot; workflow default `permissions: contents: write` wider than needed. |
| 3. Speed & cost | **gap** | `npm ci` runs 3× on a PR; `.next/cache` not cached; `paths-ignore` absent. |
| 4. Deploy & release | **meets** | Build-once/promote-many, env-gated `production`, healthcheck validates HTTP + body. |
| 5. Observability & feedback | **gap** | PR comment good; `GITHUB_STEP_SUMMARY` unused; no bundle-size trend. |
| 6. Developer experience | **meets** | Single PR workflow parallel, ~5–10 min. No local `npm run ci` script. |
| 7. Config integrity | **gap** | No `actionlint`; two workflows duplicate preamble 5×; NDA/voice patterns hard-coded in YAML. |

### Top 3 must-fix (P1)

1. **P1 — Replace IAM user keys with OIDC** (`deploy-production.yml:48–51`). Eliminates standing credential.
2. **P1 — Lock workflow-default `permissions: contents: write`** (`deploy-production.yml:11`) down to per-job. Only `create-release` needs `contents: write`.
3. **P1 — Pin third-party actions by 40-char SHA** (`deploy-production.yml:24,28,31,46,91,108` and `pr-validation.yml:18,77,87,97,107,150`). `tj-actions/changed-files` class of incident.

### Top 3 quick wins (< 1 hour)

1. Enable Dependabot for `github-actions` and `npm` — zero-code, protects against silent action-tag compromise and Next 15 security patches.
2. Cache `.next/cache` alongside the npm cache — cuts cold-build time from ~60s to ~20s on content-only PRs.
3. Extract `checkout → setup-node → npm ci` preamble into `.github/actions/setup-node-project/action.yml` — removes 4 duplicated blocks.

---

## Phase 1 — Inventory

### Workflows

| File | Triggers | Jobs | Concurrency | Top-level permissions | Environments |
|---|---|---|---|---|---|
| `deploy-production.yml` | `push: [main]` | `build` → `deploy` → `healthcheck` → `create-release` → `notify` | `deploy-production`, `cancel-in-progress: false` | `contents: write` | `deploy`, `notify` in `production` |
| `pr-validation.yml` | `pull_request: [main]` (opened/sync/reopened) | `nda-scan`, `voice-scan`, `lint` (parallel) → `build` → `pr-comment` | `pr-validation-${{ github.ref }}`, `cancel-in-progress: true` | `contents: read`, `pull-requests: write` | none |

### External actions and refs

All `actions/*` and `aws-actions/configure-aws-credentials@v4` pinned by floating major tag — flagged F3.

### Deploy targets

- S3 bucket: `ericcaskey.com` (`deploy-production.yml:14`)
- CloudFront distribution: `${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }}` (`:55`)
- Region: `us-east-1` (`:15`)

### Secrets referenced

`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `CLOUDFRONT_DISTRIBUTION_ID`, `DISCORD_WEBHOOK_URL`

### Release / versioning

`github-script@v7` creates `v${runNumber}` release with `generate_release_notes: true` on every successful deploy (`:87–95`). Tags are monotonically increasing run numbers, not semver.

### Branch protection

Not visible via public file contents — flagged F17.

### Trigger → jobs graph

```
push:main ──▶ deploy-production.yml
              build ──▶ deploy ──▶ healthcheck ──▶ create-release ──▶ notify (if: always)

pull_request:main ──▶ pr-validation.yml
                      nda-scan ┐
                      voice-scan├──▶ build ──▶ pr-comment (if: always)
                      lint     ┘
```

---

## Phase 2 — Findings

### Findings table

| ID | Severity | Label | File:line | Dimension | Finding | Effort |
|---|---|---|---|---|---|---|
| F1 | P1 | Risk | `deploy-production.yml:48–51` | Security | Static AWS IAM keys instead of OIDC federation | M |
| F2 | P1 | Risk | `deploy-production.yml:11` | Security | Workflow-level `permissions: contents: write` inherited by all 5 jobs; only `create-release` needs it | S |
| F3 | P1 | Risk | `deploy-production.yml:49`, `pr-validation.yml:*` | Security | Third-party + first-party actions pinned to floating major tag (`@v4`) not SHA | M |
| F4 | P2 | Defect | `deploy-production.yml:114–120` | Observability | `notify` job runs `if: always()` on `needs: [deploy, healthcheck, create-release]`. If `build` fails, `deploy` never runs, notify is skipped — no failure signal on build failures | S |
| F5 | P2 | Opinion | `pr-validation.yml:104–121` vs `:123–138` | Speed | `lint` and `build` each run `npm ci`; neither shares install | M |
| F6 | P2 | Risk | `pr-validation.yml:31–43`, `:82–94` | Config | NDA and voice scan patterns are inline shell `scan` calls; no unit tests, no single source of truth | M |
| F7 | P2 | Defect | `pr-validation.yml:60` | Correctness | `scan "account ID" ...` without `-w`/word boundary would fire on "GitHub Actions account ID" in docs | S |
| F8 | P2 | Opinion | `pr-validation.yml:27,76` | Correctness | `set +e` masks helper-shell errors | S |
| F9 | P2 | Risk | `deploy-production.yml:7–9` | Correctness | `concurrency.cancel-in-progress: false` correct for deploy, but two rapid pushes queue and both overwrite | M |
| F10 | P2 | Risk | `deploy-production.yml:52–56` | Deploy | `aws s3 sync --delete` followed by CloudFront invalidation is not transactional — 30–60s window where edge-cached HTML 404s on deleted bundles | M |
| F11 | P3 | Opinion | `deploy-production.yml:62–80` | Observability | Healthcheck greps for "Eric Caskey" in body — good. But doesn't check sub-routes, so `trailingSlash` regression (§Op-Lesson §2; `trailingSlash: false` in `next.config.ts:6`) would not be caught | S |
| F12 | P3 | Risk | `next.config.ts:6` ↔ unknown CloudFront function | Config | §Op-Lesson §2: `trailingSlash: false` must match CloudFront url-rewrite in `ericcaskey-com/infra/`. No CI check | M |
| F13 | P3 | Opinion | `pr-validation.yml:161–173` | Observability | `find-existing-comment-by-body-contains(...)` — use hidden HTML marker | S |
| F14 | P3 | Opinion | `deploy-production.yml:87–95` | Release | `v${runNumber}` release tag not reversible on `gh run rerun` | S |
| F15 | P3 | Opinion | Repo root | DX | No `npm run ci` script composing `lint && typecheck && build` locally | S |
| F16 | P3 | Opinion | `.github/` | Security | No `dependabot.yml` (confirmed absent) | S |
| F17 | P3 | Risk | (not visible) | Correctness | Branch protection / required checks on `main` cannot be inspected | S |
| F18 | P3 | Opinion | — | Observability | No observed flake rate or p50/p95 wall-clock in this pass | S |
| F19 | P3 | Risk | `pr-validation.yml:149–155` | Speed | PR artifact retained 3 days at full `out/` size (~2 MB with images) | S |
| F20 | P3 | Risk | `pr-validation.yml:1–8` | Speed | No `paths-ignore:`; docs-only PR still runs nda/voice/lint/build/pr-comment | S |

---

## Proof for every P1

### F1 — Static AWS keys instead of OIDC

```yaml
# .github/workflows/deploy-production.yml:46–51
- uses: aws-actions/configure-aws-credentials@v4
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: ${{ env.AWS_REGION }}
```

**Failure mode:** `AWS_ACCESS_KEY_ID` is a long-lived IAM user credential stored in GitHub Secrets. Any workflow, any composed action, any `npm` postinstall script in a future variant of the pipeline can exfiltrate it via the `secrets` context when referenced. Sibling `ai-blog-web` uses the same pattern, so a single leak burns both brands. Unlike a short-lived OIDC-issued `sts:AssumeRole` token (max 1 h), these keys live until manual rotation.

**Recommendation:**
1. Create IAM role `GitHubActions-EricCaskeyDeploy` with trust policy on `token.actions.githubusercontent.com` scoped to `repo:caskey-coding/frontend-ericcaskey:ref:refs/heads/main` (do not widen to `repo:caskey-coding/*:*`).
2. Add `id-token: write` to the `deploy` job permissions.
3. Replace lines 48–51 with `role-to-assume: arn:aws:iam::ACCOUNT:role/GitHubActions-EricCaskeyDeploy`, `role-session-name: gha-${{ github.run_id }}`.

Docs: https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services

### F2 — Workflow-level permissions too wide

```yaml
# .github/workflows/deploy-production.yml:11
permissions:
  contents: write
```

**Failure mode:** Permission inherited by `build`, `deploy`, `healthcheck`, `create-release`, `notify`. Only `create-release` (the `github-script` call) needs `contents: write`. If any transitive npm dependency is compromised (e.g. `event-stream` 2018, `node-ipc` 2022, `ua-parser-js` 2021), its postinstall can `curl $GITHUB_API/git/refs/heads/main -X PATCH` with the inherited token and rewrite history.

**Recommendation:**
```yaml
permissions: {}

jobs:
  build:
    permissions: { contents: read }
  deploy:
    permissions: { id-token: write, contents: read }  # after F1
  create-release:
    permissions: { contents: write }
  notify:
    permissions: {}
```

### F3 — Action refs not SHA-pinned

`@v4` is a floating tag. The `aws-actions/configure-aws-credentials` repository owner (or a compromised maintainer) can retag `v4` between runs — this is the `tj-actions/changed-files` March 2025 class of incident. No Dependabot (F16) means no automated sweep either.

**Recommendation:** Pin every `uses:` to 40-char SHA with a trailing comment:
```yaml
- uses: aws-actions/configure-aws-credentials@e3dd6a429d7300a6a4c196c26e071d42e0343502  # v4.0.2
```

---

## Operational Lessons §2–§5 coverage

| Lesson | Applicable? | CI check exists? | Finding |
|---|---|---|---|
| §2 `trailingSlash` ↔ CloudFront rewrite fn | **Yes.** `next.config.ts:6` sets `trailingSlash: false`. Infra for `EricCaskeyFrontendStack` lives elsewhere. | No | F12 |
| §2 Cognito pool IDs ↔ frontend env | No. `CLAUDE.md:3` says no runtime, no API routes, no auth. | N/A | Skip. |
| §2 Backend models ↔ frontend types | No. No backend in this repo's scope. | N/A | Skip. |
| §3 Ruff pin drift | No. JavaScript repo. | N/A | Skip. |
| §4 Lazy-import heavy SDKs | No. No Python, no Lambda. | N/A | Skip. |
| §5 `cdk deploy --all` context-gating | No. No CDK in this repo. | N/A | Skip. |

**Outstanding op-lesson gap:** F12. Minimal check: in the `healthcheck` job, `curl -sI https://ericcaskey.com/portfolio` and grep for 200.

---

## Positive observations

1. **`next.config.ts:5` `output: 'export'`** correctly paired with `images: { unoptimized: true }`.
2. **Build-once, promote-many** (`deploy-production.yml:34–39` uploads `out/`; `:44–48` downloads). Deployed bytes = PR-tested bytes.
3. **Healthcheck asserts body content, not just status** (`:72–75`, grep for "Eric Caskey"). Catches `errorResponses` fallback-to-home-page failure mode.
4. **PR concurrency cancellation** + deploy concurrency `cancel-in-progress: false` (`pr-validation.yml:9–11`, `deploy-production.yml:7–9`). Right pattern.
5. **Every job has `timeout-minutes`**.
6. **PR sticky comment via `updateComment`** (`pr-validation.yml:181–195`) avoids spam.
7. **NDA and voice scans run on PRs**.
8. **`environment: production`** gates deploy — env-scoped secrets + optional reviewers.

---

## Cross-repo patterns

1. **Reusable `deploy-static-s3-cloudfront.yml`** — same shape in `frontend-ericcaskey` and `ai-blog-web`: static export, OIDC, s3 sync, invalidation, body-grep healthcheck, Discord notify. One reusable workflow collapses ~160 lines of duplication.
2. **Composite `actions/setup-node-project`** — appears 5× across workflows in this repo alone, plus `ai-blog-web`. One place to pin SHAs.
3. **Shared NDA/voice scan CLI** — pull inline bash into Node/Python script in `caskeycoding-specs/_shared/tools/content-scan/`, consumed by every brand repo. Today a PR that edits the banned-phrase list in one repo doesn't propagate.
