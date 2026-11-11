# FSAFE-22: frontend dependency triage

Refreshed 2026-11-10 against `main` at
`cf9b0cd0b58a83d41def91c33ea2271af363ae43` (after #201). The directory keeps
its original 2026-10-20 name; every count, table and JSON file below is from
the 2026-11-10 refresh unless a line says otherwise.

This is triage, not a dependency repair or runtime security certification.

- Production dependency audit (`npm audit --omit=dev`): **0** findings.
- Full audit (`npm audit`): **12** package records (3 high, 9 moderate),
  carrying 7 distinct GHSA identifiers. Exit code 1.
- Open Dependabot alerts: **6** (1 high, 3 medium, 2 low), all with
  `development` scope and `transitive` relationship.
- No finding reaches the deployed site. The production site is a static
  export; every remaining package is used only by lint tooling or the local
  E2E test server.

No manifest or lock change is made here.

## Procedure

Run from a fresh worktree of the source commit. Node 22.17.0 and npm 10.9.2
were used locally; `.nvmrc` pins Node 20, which was not executed here.

```sh
npm ci --no-audit --no-fund
npm audit --json > npm-findings.json          # full; exits 1 when findings exist
npm audit --omit=dev --json > omit-dev.json   # production graph only; not committed (0 findings)
gh api repos/Caskey-Coding/frontend-ericcaskey/dependabot/alerts --paginate \
  -q '[.[]|select(.state=="open")]' > open-pages.txt
node -e 'const fs=require("fs");fs.writeFileSync("alerts.json",JSON.stringify(fs.readFileSync("open-pages.txt","utf8").trim().split("\n").flatMap(l=>JSON.parse(l))))'
node installed.js npm-findings.json <source-sha> > installed.json
```

The `gh api` call is read-only. `installed.js` reads `package-lock.json`,
each installed `package.json` and the audit file; it is reproduced in the
appendix below. Supporting lookups used for the tables:

```sh
gh api repos/Caskey-Coding/frontend-ericcaskey/dependabot/alerts --paginate \
  -q '.[]|select(.state!="open")|[.number,.state,.dependency.package.name,.security_advisory.ghsa_id,(.fixed_at//""),(.dismissed_at//"")]|@tsv'
MSYS_NO_PATHCONV=1 gh api advisories/<GHSA-ID>   # published_at, withdrawn_at, ranges
npm ls <package> --all
npm view serve version dependencies.compression dependencies.ajv
```

## Files

- `alerts.json`: the six open Dependabot alert records, unedited, as one array.
- `npm-findings.json`: unedited `npm audit --json` output. Its `fixAvailable`
  proposals are data, not approved upgrades.
- `installed.json`: lock and installed manifest observations for the twelve
  audit node paths (all twelve installed versions match the lock), plus the
  19 declared consumer edges that resolve to them. Lock sha256
  `3e1a1f7598e1972d4c996c073d27418526530e2f7540c84f68f6676a5ce1308c`.
  This does not prove installed bytes, active module loads or affected inputs.

## Open Dependabot alerts

All six concern `package-lock.json`.

| Alert | Package, locked version | Severity | GHSA | First patched | Consumer path | Runtime or dev | Reachable from the deployed site |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 45 | compression 1.8.1 | high | GHSA-vc2v-76pw-4v95 | 1.8.2 | serve 14.2.6 (exact pin) | dev | No. Local E2E server only |
| 48 | fast-uri 3.1.8 | medium | GHSA-wjr9-j795-jxcr | 3.1.9 | serve, ajv 8.18.0 (`^3.0.1`) | dev | No. Local E2E server only |
| 49 | fast-uri 3.1.8 | low | GHSA-333x-w4r6-6crp | 3.1.9 | serve, ajv | dev | No. Local E2E server only |
| 50 | fast-uri 3.1.8 | medium | GHSA-w74x-v6f9-j3xg | 3.1.9 | serve, ajv | dev | No. Local E2E server only |
| 51 | fast-uri 3.1.8 | low | GHSA-xhq7-xmqj-769h | 3.1.9 | serve, ajv | dev | No. Local E2E server only |
| 53 | minimatch 10.2.5 | medium | GHSA-g3hv-75wg-m249 | 11.0.1 | eslint-config-next, typescript-eslint 8.65.0, typescript-estree (`^10.2.2`) | dev | No. Lint only |

The fast-uri advisories were published between 2026-10-23 and 2026-11-01,
after #201's candidate 3.1.8 was chosen. The minimatch advisory was published
2026-10-30; alert 53 opened when #201 merged. Neither is a regression
introduced by a version change.

## npm audit records

| Record | Severity | Kind | Source advisory | Graph | Runtime or dev |
| --- | --- | --- | --- | --- | --- |
| compression | high | direct advisory | GHSA-vc2v-76pw-4v95 | serve | dev |
| serve | high | propagated | via compression | root devDependency | dev |
| zod | high | direct advisory | GHSA-mrhx-c7xc-m3w5 (`<4.6.6`) | eslint-plugin-react-hooks 7.1.1 (`^3.25.0 \|\| ^4.0.0`) | dev |
| fast-uri | moderate | direct advisory | four GHSAs, alerts 48 to 51 | serve, ajv | dev |
| minimatch | moderate | direct advisory | GHSA-g3hv-75wg-m249 | typescript-estree | dev |
| @typescript-eslint/typescript-estree | moderate | propagated | via minimatch | typescript-eslint | dev |
| @typescript-eslint/parser | moderate | propagated | via typescript-estree | typescript-eslint | dev |
| @typescript-eslint/utils | moderate | propagated | via typescript-estree | typescript-eslint | dev |
| @typescript-eslint/type-utils | moderate | propagated | via typescript-estree, utils | typescript-eslint | dev |
| @typescript-eslint/eslint-plugin | moderate | propagated | via parser, type-utils, utils | typescript-eslint | dev |
| typescript-eslint | moderate | propagated | via the four above | eslint-config-next | dev |
| eslint-config-next | moderate | propagated | via typescript-eslint | root devDependency | dev |

zod has no open hosted alert: alert 52 was auto-dismissed by Dependabot on
2026-11-03 (development scope). Nobody dismissed it by hand, and the
installed zod 4.4.3 remains inside the advisory range, so npm still
reports it.

## Change since the 2026-10-21 snapshot

| Measure | 2026-10-21 (source `bde92dd`) | 2026-11-10 (source `cf9b0cd`) |
| --- | --- | --- |
| Open Dependabot alerts | 10 (7 high, 3 medium) | 6 (1 high, 3 medium, 2 low) |
| Full npm audit records | 11 (10 high, 1 moderate) | 12 (3 high, 9 moderate) |
| Distinct GHSAs in npm audit | 14 | 7 |
| Production-only npm audit | not recorded | 0 |

Hosted alerts closed as `fixed` on 2026-11-10 when #201 merged: 25 to 31,
34, 37 to 43 (fast-uri, brace-expansion both copies, browserslist,
baseline-browser-mapping). Sharp alert 47 was already fixed on 2026-10-18.
#201's own body reports the step on `main` just before it: full audit 15
(6 high) to 12 (3 high), production audit 1 moderate to 0. Those
before-values are reported by #201, not re-observed here.

The braces finding (GHSA-vfj7-8cjw-p6xm) left the npm report without a
version change: braces is still 3.0.3, and the advisory shows `withdrawn_at`
2026-10-23.

## Follow-up disposition

- **FSAFE-89** (fast-uri, brace-expansion, browserslist,
  baseline-browser-mapping): its candidates landed in #201 and the original
  alerts are fixed. The four new fast-uri advisories need 3.1.9, which is
  published and satisfies ajv's `^3.0.1`. This is a new in-range candidate,
  not yet installed or tested.
- **FSAFE-90** (compression via serve): unresolved. Registry-latest serve
  14.2.7 still pins compression exactly at 1.8.1. npm proposes serve 10.0.2,
  a major downgrade, which is not approved.
- **FSAFE-91** (braces): no longer applicable. The advisory is withdrawn.
- **minimatch** (alert 53): no supported in-range fix observed. typescript-estree
  8.72.2 (registry latest) still declares `^10.2.2`, and the newest 10.x is
  10.2.6, below the 11.0.1 fix. npm proposes eslint-config-next 16.4.6, but
  that version still declares typescript-eslint `^8.56.0` and npm marks every
  typescript-eslint through 8.72.2 as affected. That proposal is unverified.
- **zod**: 4.6.7 is published and satisfies eslint-plugin-react-hooks'
  `^3.25.0 || ^4.0.0`. This is an in-range candidate, not yet tested.

Every candidate above is a registry declaration, not a tested artifact.

## Reachability

- `next.config.ts` declares a static export. The deploy workflow builds
  `out/` and uploads it to static hosting; no Node server runs any
  dependency in production. `npm audit --omit=dev` reports nothing.
- `serve` (and so compression, ajv and fast-uri) is a devDependency used by
  `playwright.config.ts` as `npx serve out -l 3000 --no-clipboard` for local
  and CI E2E runs, bound to a local port.
- eslint-config-next, typescript-eslint, minimatch and zod run only under
  `npm run lint`, on repository source.

These are source and graph observations. No advisory probe was run.

## Release recommendation

Two holds were combined on 2026-10-21; they are now separated.

- **Dependency hold: lift.** No runtime finding remains, and every open
  alert is a development dependency outside the deployed static export.
  The three remaining high records (compression, serve, zod) are dev-only.
  FSAFE-90, the fast-uri and zod candidates, and the minimatch chain stay
  open as tooling follow-ups, not release blockers.
- **Deploy review: still required per merge.** A merge to `main` rebuilds and
  redeploys the whole site, including for documentation-only paths. Observed
  on 2026-11-10: the `production` environment has no protection rules; the
  deploy workflow now fails a build that lacks the contact API variable, and
  that variable is set; the last three production deploy runs (including
  `cf9b0cd`) succeeded. These are observations, not a fresh deploy review,
  which remains the merging agent's gate.

## Evidence map

| Criterion | Evidence | Boundary | Gap |
| --- | --- | --- | --- |
| Current hosted alerts | `alerts.json`, six open records, read-only API | Hosted metadata, 2026-11-10 | GitHub's analyzed commit is not reported |
| Current npm findings | `npm-findings.json` (12 records, 7 GHSAs); production audit 0 | Registry advisory metadata on a fresh `npm ci` | Advisory behavior not executed |
| Runtime vs dev classification | `installed.json` (all `dev: true`), `npm ls`, production audit 0 | Lock and manifest graph | Loaded modules not traced |
| Reachability | Static export config, E2E server command, lint scripts | Source inspection | No advisory probe |
| Follow-up scope | Registry ranges for serve, ajv, typescript-estree, eslint-plugin-react-hooks | Registry declarations | Candidates not installed or tested |
| Release recommendation | Production audit 0; environment and workflow observations | Metadata and source | Fresh per-merge deploy review not performed here |

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
