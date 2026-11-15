# FSAFE-22: frontend dependency triage

Corrected 2026-11-15. An independent review found that the 2026-11-10 refresh
stated that no finding reaches the deployed site and recommended lifting the
dependency hold, which its source and graph evidence does not show, and that
several status, registry and environment claims had no saved receipt. This
revision states deployed applicability as unknown, removes the hold-lifting
recommendation, binds each remaining claim to a committed file, a Git object
or a hosted CI log, and labels the rest as reported without a saved receipt.
The three JSON files are unchanged.

Refreshed against `main` at `cf9b0cd0b58a83d41def91c33ea2271af363ae43`
(after #201). The directory keeps its original 2026-10-20 name. The JSON
files were generated on 2026-11-10 local time (`installed.json`
`observed_at` is `2026-11-11T02:25:39.543Z`).

This is triage, not a dependency repair, a runtime security certification or
a release decision.

## Summary

- Open Dependabot alerts: **6** (1 high, 3 medium, 2 low), all with
  `development` scope and `transitive` relationship. Receipt: `alerts.json`.
- Full npm audit: **12** package records (3 high, 9 moderate), carrying 7
  distinct GHSA identifiers. Receipt: `npm-findings.json`
  (`metadata.vulnerabilities`). The local run's exit code 1 is reported, not
  saved.
- Production-graph npm audit: hosted receipt only (see
  [Hosted receipt](#hosted-receipt)). The local `npm audit --omit=dev` output
  was not saved.
- Deployed applicability: **UNKNOWN**. Every alerted package is marked
  `dev: true` in the lock, and source configuration places each one in lint
  or the local E2E server. That is build-time and source-graph evidence
  only, not proof of non-exposure. No deployed artifact was inspected and no
  advisory probe was run.

No manifest or lock change is made here, and this audit lifts no hold.

## Procedure

This is the recipe the refresh reports running from a fresh worktree of the
source commit with Node 22.17.0 and npm 10.9.2 (`.nvmrc` pins Node 20, which
was not executed locally). Only `alerts.json`, `npm-findings.json` and
`installed.json` were saved. The worktree identity, the `npm ci` exit status,
the local audit exit codes and the `omit-dev.json` output were not saved, so
the fresh isolated installation is reported, not receipted. The
`installation` field in `installed.json` is the generator's own description,
not an execution receipt.

```sh
npm ci --no-audit --no-fund
npm audit --json > npm-findings.json          # full; exits 1 when findings exist
npm audit --omit=dev --json > omit-dev.json   # production graph only; not saved
gh api repos/Caskey-Coding/frontend-ericcaskey/dependabot/alerts --paginate \
  -q '[.[]|select(.state=="open")]' > open-pages.txt
node -e 'const fs=require("fs");fs.writeFileSync("alerts.json",JSON.stringify(fs.readFileSync("open-pages.txt","utf8").trim().split("\n").flatMap(l=>JSON.parse(l))))'
node installed.js npm-findings.json <source-sha> > installed.json
```

The `gh api` call is read-only. `installed.js` reads `package-lock.json`,
each installed `package.json` and the audit file; it is reproduced in the
appendix below. The refresh reports these supporting lookups; none of their
outputs was saved, so every claim that rests only on them is marked
"reported, not saved" below:

```sh
gh api repos/Caskey-Coding/frontend-ericcaskey/dependabot/alerts --paginate \
  -q '.[]|select(.state!="open")|[.number,.state,.dependency.package.name,.security_advisory.ghsa_id,(.fixed_at//""),(.dismissed_at//"")]|@tsv'
MSYS_NO_PATHCONV=1 gh api advisories/<GHSA-ID>   # published_at, withdrawn_at, ranges
npm ls <package> --all
npm view serve version dependencies.compression dependencies.ajv
```

### Hosted receipt

PR validation run 42946333175 ran on the PR head
`f9f6cdfa5d096e8eba1734a5ded046914d487f1b`, whose `package-lock.json` and
`package.json` are byte-identical in Git to `cf9b0cd`. Its `npm audit
(advisory)` job (Node 20.20.2, npm 10.8.2 from `.nvmrc`) logged:

- `npm ci`: `added 438 packages, and audited 445 packages`, followed by
  `12 vulnerabilities (9 moderate, 3 high)`, which matches
  `npm-findings.json`.
- `npm audit --omit=dev --audit-level=high`: `found 0 vulnerabilities`,
  step conclusion `success`.

Boundary: a hosted CI install of the same lock on 2026-11-11, not the local
worktree that produced the JSON files. The job is `continue-on-error`, so
its success alone would prove nothing; the log line above is the receipt.
Actions logs expire, so this receipt is time-limited. It shows the npm
advisory database reported no finding in the production dependency graph at
that time. It does not observe the deployed artifact.

## Files

- `alerts.json`: the six open Dependabot alert records, unedited, as one array.
- `npm-findings.json`: unedited `npm audit --json` output. Its `fixAvailable`
  proposals are data, not approved upgrades.
- `installed.json`: lock and installed manifest observations for the twelve
  audit node paths (all twelve installed versions match the lock), plus the
  19 declared consumer edges that resolve to them. Lock sha256
  `3e1a1f7598e1972d4c996c073d27418526530e2f7540c84f68f6676a5ce1308c` was
  computed over the checked-out bytes; it differs from a hash of the Git blob
  only by line-ending conversion. This does not prove installed bytes,
  active module loads or affected inputs.

## FSAFE-9 baseline reconciliation

The FSAFE-9 snapshot of 2026-10-17 recorded 11 open alerts, 0 critical:
25, 26, 27, 28, 30, 31, 37, 41, 42, 45, 47.

| Alert | Package | Open on 2026-10-21 (`alerts.json` at `d25698e`) | Open on 2026-11-10 (`alerts.json`) | Reported closure | Closure receipt |
| --- | --- | --- | --- | --- | --- |
| 25 | fast-uri | yes | no | fixed 2026-11-10 by #201 | reported, not saved |
| 26 | fast-uri | yes | no | fixed 2026-11-10 by #201 | reported, not saved |
| 27 | fast-uri | yes | no | fixed 2026-11-10 by #201 | reported, not saved |
| 28 | fast-uri | yes | no | fixed 2026-11-10 by #201 | reported, not saved |
| 30 | browserslist | yes | no | fixed 2026-11-10 by #201 | reported, not saved |
| 31 | baseline-browser-mapping | yes | no | fixed 2026-11-10 by #201 | reported, not saved |
| 37 | fast-uri | yes | no | fixed 2026-11-10 by #201 | reported, not saved |
| 41 | brace-expansion | yes | no | fixed 2026-11-10 by #201 | reported, not saved |
| 42 | brace-expansion | yes | no | fixed 2026-11-10 by #201 | reported, not saved |
| 45 | compression | yes | yes | still open | `alerts.json` |
| 47 | sharp | no | no | fixed 2026-10-18 | reported, not saved |

Derivation: of the 11 baseline IDs, 10 are absent from the current open set
and 1 (45) remains; 5 alerts opened after the baseline (48, 49, 50, 51, 53);
11 minus 10 plus 5 gives the current 6. Absence from the open set is
receipted. How each alert closed (fixed or dismissed, when and by whom) is
reported, not saved. No baseline ID is unaccounted for.

## Open Dependabot alerts

All six concern `package-lock.json`. Consumer paths and locked versions are
from `installed.json`; GHSA, severity and first patched version are from
`alerts.json`. "Configured use" is a source observation; it does not
establish deployed applicability.

| Alert | Package, locked version | Severity | GHSA | First patched | Consumer path | Lock scope | Configured use | Deployed applicability |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 45 | compression 1.8.1 | high | GHSA-vc2v-76pw-4v95 | 1.8.2 | serve 14.2.6 (exact pin `1.8.1`) | dev | Local E2E static server | Unknown |
| 48 | fast-uri 3.1.8 | medium | GHSA-wjr9-j795-jxcr | 3.1.9 | serve, ajv 8.18.0 (`^3.0.1`) | dev | Local E2E static server | Unknown |
| 49 | fast-uri 3.1.8 | low | GHSA-333x-w4r6-6crp | 3.1.9 | serve, ajv | dev | Local E2E static server | Unknown |
| 50 | fast-uri 3.1.8 | medium | GHSA-w74x-v6f9-j3xg | 3.1.9 | serve, ajv | dev | Local E2E static server | Unknown |
| 51 | fast-uri 3.1.8 | low | GHSA-xhq7-xmqj-769h | 3.1.9 | serve, ajv | dev | Local E2E static server | Unknown |
| 53 | minimatch 10.2.5 | medium | GHSA-g3hv-75wg-m249 | 11.0.1 | eslint-config-next, typescript-eslint 8.65.0, typescript-estree (`^10.2.2`) | dev | Lint | Unknown |

`first_patched_version` is a historical advisory field, not an upgrade
instruction.

Timing, from `alerts.json` and #201's merge metadata: the four fast-uri
advisories were published on 2026-10-23 and their alerts opened between
2026-10-30 and 2026-11-01. The minimatch advisory was published on
2026-10-30; alert 53 opened at 2026-11-10T22:22:05Z, ten seconds after #201
merged (2026-11-10T22:21:55Z).

## npm audit records

From `npm-findings.json`; lock scope from `installed.json`.

| Record | Severity | Kind | Source advisory | Graph | Lock scope |
| --- | --- | --- | --- | --- | --- |
| compression | high | direct advisory | GHSA-vc2v-76pw-4v95 | serve | dev |
| serve | high | propagated | via compression | root devDependency | dev |
| zod | high | direct advisory | GHSA-mrhx-c7xc-m3w5 (`<4.6.6`) | eslint-plugin-react-hooks (`^3.25.0 \|\| ^4.0.0`) | dev |
| fast-uri | moderate | direct advisory | four GHSAs, alerts 48 to 51 | serve, ajv | dev |
| minimatch | moderate | direct advisory | GHSA-g3hv-75wg-m249 | typescript-estree | dev |
| @typescript-eslint/typescript-estree | moderate | propagated | via minimatch | typescript-eslint | dev |
| @typescript-eslint/parser | moderate | propagated | via typescript-estree | typescript-eslint | dev |
| @typescript-eslint/utils | moderate | propagated | via typescript-estree | typescript-eslint | dev |
| @typescript-eslint/type-utils | moderate | propagated | via typescript-estree, utils | typescript-eslint | dev |
| @typescript-eslint/eslint-plugin | moderate | propagated | via parser, type-utils, utils | typescript-eslint | dev |
| typescript-eslint | moderate | propagated | via the four above | eslint-config-next | dev |
| eslint-config-next | moderate | propagated | via typescript-eslint | root devDependency | dev |

zod has no record in the open-alert set (`alerts.json`). The refresh reported
that hosted alert 52 for zod was auto-dismissed by Dependabot on 2026-11-03
as development scope; the closed-alert listing behind that statement was not
saved, so the alert's state, date and actor are unverified here. The locked
and installed zod is 4.4.3 (`installed.json`), inside the advisory range
`<4.6.6` (`npm-findings.json`), so npm still reports it.

## Change since the 2026-10-21 snapshot

The 2026-10-21 column is read from the committed files at `d25698e` (the
2026-10-21 revision of this directory, source `bde92dd`).

| Measure | 2026-10-21 (source `bde92dd`) | 2026-11-10 (source `cf9b0cd`) |
| --- | --- | --- |
| Open Dependabot alerts | 10 (7 high, 3 medium) | 6 (1 high, 3 medium, 2 low) |
| Full npm audit records | 11 (10 high, 1 moderate) | 12 (3 high, 9 moderate) |
| Distinct GHSAs in npm audit | 14 | 7 |
| Production-only npm audit | not recorded | 0 in the hosted receipt; local output not saved |

The refresh reported that hosted alerts 25 to 31, 34 and 37 to 43 closed as
`fixed` on 2026-11-10 when #201 merged, and that sharp alert 47 was fixed on
2026-10-18. The closed-alert listing was not saved, so these states and dates
are unverified here. #201's own body reports full audit 15 (6 high) to 12
(3 high) and production audit 1 moderate to 0 for the step on `main` just
before it; those values are #201's report, not re-observed here.

braces 3.0.3 with GHSA-vfj7-8cjw-p6xm appears in `npm-findings.json` at
`d25698e` and not in the current `npm-findings.json`, while the lock at
`cf9b0cd` still resolves braces 3.0.3. The refresh attributed this to the
advisory being withdrawn on 2026-10-23; the advisory lookup was not saved,
so the withdrawal is unverified here.

## Follow-up disposition

No child item is completed, closed or repurposed by this audit. Registry
versions below come from lookups that were not saved; they are historical
declarations, not tested artifacts or upgrade instructions.

- **FSAFE-89** (fast-uri, brace-expansion, browserslist,
  baseline-browser-mapping): its original alerts are absent from the current
  open set after #201. Its status is unchanged by this audit. The four new
  fast-uri advisories (alerts 48 to 51) are outside FSAFE-89's original
  scope.
- **fast-uri, alerts 48 to 51**: child scope pending publication. It must
  reconcile with FSAFE-89 and PR #191 before any lock change. The advisories
  list 3.1.9 as first patched, and 3.1.9 satisfies ajv's `^3.0.1` by semver.
  The refresh reported 3.1.9 as published (not saved). Not installed or
  tested.
- **FSAFE-90** (compression alert 45 via serve): unresolved. serve 14.2.6
  pins compression exactly at 1.8.1 (`installed.json`). `npm-findings.json`
  proposes serve 10.0.2 with `isSemVerMajor: true`, a major downgrade that is
  not approved. The refresh reported that registry-latest serve 14.2.7 still
  pins compression 1.8.1 (not saved).
- **FSAFE-91** (braces): status unchanged by this audit. braces no longer
  appears in the current npm report; the reported withdrawal is unverified.
  Any change to FSAFE-91 needs its own reviewed disposition.
- **minimatch, alert 53**: child scope pending publication. typescript-estree
  8.65.0 declares minimatch `^10.2.2` (`installed.json`), and the advisory
  range is `>=7.0.0 <11.0.1`. `npm-findings.json` proposes eslint-config-next
  16.4.6 and lists every typescript-eslint through 8.72.2 as affected, so
  that proposal is unverified. The refresh reported that typescript-estree
  8.72.2 is registry-latest and still declares `^10.2.2`, and that the newest
  10.x is 10.2.6 (not saved). No in-range fix is established; no major
  migration, override or downgrade is proposed.
- **zod, GHSA-mrhx-c7xc-m3w5**: child scope pending publication. A version
  at or above 4.6.6 within 4.x would satisfy eslint-plugin-react-hooks'
  `^3.25.0 || ^4.0.0` by semver. The refresh reported 4.6.7 as published (not
  saved). Not installed or tested.

## Configured use and applicability

These are source and graph observations. No advisory probe was run, module
loading was not traced, and no deployed artifact was inspected, so deployed
applicability of every finding remains unknown.

- `next.config.ts` declares `output: 'export'` and `images: { unoptimized:
  true }`. `deploy-production.yml` builds the export and uploads it to static
  hosting. This is configuration intent, not an observation of what the
  deployed build loaded or shipped.
- `serve` (and so compression, ajv and fast-uri) is a devDependency used by
  `playwright.config.ts` as `npx serve out -l 3000 --no-clipboard` for local
  and CI E2E runs, bound to a local port.
- eslint-config-next, typescript-eslint, minimatch and zod are reached
  through lint dependencies (`installed.json` edges); `npm run lint` is the
  configured entry point.
- sharp (FSAFE-9 alert 47) resolves at 0.35.5 in the lock at `cf9b0cd` as an
  optional dependency of next, not a dev-only package. The export config sets
  unoptimized images, and two manual scripts
  (`scripts/generate-avatar.mjs`, `scripts/generate-favicon.mjs`) import it.
  Whether sharp loads during `next build` was not traced, and its deployed
  applicability is unknown. Its alert closure is reported, not saved.

## Release and deploy

- This audit lifts no hold and makes no release recommendation. Each release,
  including a merge of this documentation, needs its own operation-specific
  review.
- A merge to `main` rebuilds and redeploys the whole site, including for
  documentation-only paths: `deploy-production.yml` triggers on every push to
  `main` with no path filter.
- The 2026-11-10 refresh also reported production environment, contact
  variable and recent deploy-run observations. They had no saved receipts and
  are not relied on here.

## Evidence map

| Criterion | Evidence | Boundary | Grade | Gap |
| --- | --- | --- | --- | --- |
| FSAFE-9 baseline reconciled by count and ID | Baseline table; `alerts.json` at `d25698e` and current | Committed open-alert sets | Weak | Closure state, date and actor not saved |
| Current hosted alerts | `alerts.json`, six open records | Hosted metadata, 2026-11-10 | Adequate | GitHub's analyzed commit is not reported |
| Current full npm findings | `npm-findings.json` (12 records, 7 GHSAs); hosted log shows the same 12 | Registry advisory metadata | Adequate for counts; Weak for same-worktree linkage | Local exit code and worktree identity not saved |
| Production-graph npm audit | Hosted log: `found 0 vulnerabilities` at `f9f6cdf` | Hosted CI install of the same lock, Node 20 | Adequate at that boundary | Local output not saved; log retention is limited |
| Fresh isolated installation | `installed.json` (timestamp, versions, hashes) | Recorded manifest observations | Weak | Worktree identity and `npm ci` result not saved |
| Lock scope per alerted package | `installed.json` (all `dev: true`, 19 edges) | Lock and manifest graph | Adequate | Loaded modules not traced |
| Deployed applicability | None observed | Source configuration only | Missing | Unknown; needs an observation of the deployed artifact |
| Closed, dismissed and withdrawn statuses | None saved | Reported only | Missing | Recover the closed-alert listing and advisory records |
| Follow-up candidates | Semver ranges in committed JSON | Declarations only | Weak | Registry lookups not saved; candidates not installed or tested |
| Child scope for new findings | None published at this revision | Not applicable | Missing | Publish child scopes for fast-uri 48 to 51, minimatch 53, zod |
| Merge blast radius | `deploy-production.yml` trigger | Workflow configuration | Adequate | Actual deploy review belongs to each release |

## Appendix: installed.js

```js
// usage: node installed.js <npm-audit-full.json> <source_sha>  (run from the repository root after npm ci)
const fs = require("fs"), c = require("crypto");
const sha = (f) => c.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
const lock = JSON.parse(fs.readFileSync("package-lock.json", "utf8")).packages;
const audit = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const paths = [...new Set(Object.values(audit.vulnerabilities).flatMap((v) => v.nodes))].sort();
const nameOf = (p) => lock[p].name || p.slice(p.lastIndexOf("node_modules/") + 13);
const resolve = (from, name) => {
  let p = from;
  for (;;) {
    const t = (p ? p + "/" : "") + "node_modules/" + name;
    if (lock[t]) return t;
    if (!p) return null;
    const i = p.lastIndexOf("/node_modules/");
    p = i < 0 ? "" : p.slice(0, i);
  }
};
const records = paths.map((p) => {
  const m = JSON.parse(fs.readFileSync(p + "/package.json", "utf8"));
  return {
    path: p, package: nameOf(p), locked_version: lock[p].version, installed_version: m.version,
    version_matches: lock[p].version === m.version, dev: !!lock[p].dev, optional: !!lock[p].optional,
    manifest_sha256: sha(p + "/package.json"), dependencies: m.dependencies || {},
    engines: m.engines || null, lifecycle: Object.fromEntries(Object.entries(m.scripts || {}).filter(([k]) => /^(pre|post)?install$|^prepare$/.test(k))),
  };
});
const declared_edges = [];
for (const [k, e] of Object.entries(lock)) {
  for (const field of ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"]) {
    for (const [name, range] of Object.entries(e[field] || {})) {
      const r = resolve(k, name);
      if (r && paths.includes(r)) declared_edges.push({ consumer_path: k || ".", field, package: name, declared_range: range, resolved_path: r, locked_version: lock[r].version });
    }
  }
}
console.log(JSON.stringify({
  source_ref: process.argv[3], observed_at: new Date().toISOString(),
  installation: `Fresh worktree npm ci --no-audit --no-fund; Node ${process.versions.node}; .nvmrc pins Node ${fs.readFileSync(".nvmrc", "utf8").trim()}.`,
  package_lock_sha256: sha("package-lock.json"), manifest_sha256: sha("package.json"),
  records, declared_edges,
  boundary: "Manifest versions and declared graph only, not tarball byte integrity, loaded versions, affected inputs or deployed applicability.",
}, null, 2));
```
