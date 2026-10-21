# FSAFE-22: frontend dependency triage

Assessment date: 2026-10-21. This directory keeps the date specified by the
accepted brief. Source: `bde92dd3f66098d3c0b48ce9406a9418be407bf2`.
Governing work: FSAFE-22 in
[Caskey Coding BACKLOG](https://github.com/Caskey-Coding/caskeycoding-specs/blob/16f8e40690cf4828daf927d35f52f6f154ba441a/BACKLOG.md),
with `briefs/FSAFE-TRIAGE-WAVE-2.md`.

This is triage, not a dependency repair or runtime security certification.
Ten hosted alerts remain open (seven high, three medium). The separate npm
audit exits 1 with eleven affected package records (ten high, one moderate);
these include propagated parent effects and are not eleven hosted alerts.
No manifest or lock resolution changes.

## Evidence and reconciliation

- `alerts.json` is the unedited single-page GitHub API response for open
  alerts. Its ten records equal the earlier paginated collection. The API
  does not provide an analyzed source SHA.
- `npm-findings.json` is the unedited `npm audit --json` output from the
  isolated baseline installation, including its proposed fixes. Those
  proposals are data, not approved upgrades.
- `installed.json` records thirteen locked/installed manifest observations,
  including the twelve paths named by the eleven npm records and sharp.
  All thirteen observed versions match the lock. Manifest hashes and incoming
  declared ranges are included. This does not prove all installed bytes,
  active module loads, affected inputs or deployment provenance.
- The FSAFE-9 snapshot had eleven open alerts. The same ten alert numbers
  remain open; sharp alert 47 is now fixed, with `fixed_at`
  `2026-10-18T22:49:23Z` and no dismissal. The observed lock and installed
  sharp are 0.35.5, within Next 16.4.1's `^0.35.5` optional range.
  This is hosted source state and local metadata, not live remediation.
- Recent lock history includes Next-group PR181 and dependency batch PR189.
  Current mainline already contains those changes; no duplicate upgrade is
  proposed here. REFINE-138 PR180 is closed unmerged and is not a dependency
  repair. This report does not validate that PR's owner's supersession claims.

The older snapshot, original command streams, hashes, current metadata and
review receipts are retained privately. The prior snapshot's immutable raw
vulnerability receipt was hash-verified before extracting this repository.

## Hosted alert disposition

All listed alerts concern `package-lock.json`. Affected-range checks and
candidate declarations are metadata checks, not advisory reproductions.

| Alert | Package and locked version | Severity | GHSA | Disposition |
| --- | --- | --- | --- | --- |
| 45 | compression 1.8.1 | high | GHSA-vc2v-76pw-4v95 | FSAFE-90: parent pin blocks a simple lock refresh |
| 42 | brace-expansion 1.1.18 | medium | GHSA-q2hr-2g5m-vwhr | FSAFE-89: assess 1.1.21 within the existing range |
| 41 | brace-expansion 5.0.9 | medium | GHSA-q2hr-2g5m-vwhr | FSAFE-89: assess 5.0.12 within the existing range |
| 37 | fast-uri 3.1.5 | high | GHSA-qw65-cvwx-89v3 | FSAFE-89: assess 3.1.8, including npm-only findings |
| 31 | baseline-browser-mapping 2.10.32 | medium | GHSA-w5vr-8v7q-w6rv | FSAFE-89: assess 2.11.0 within both consumer ranges |
| 30 | browserslist 4.28.2 | high | GHSA-73wf-gq98-2v4g | FSAFE-89: assess 4.28.7 |
| 28 | fast-uri 3.1.5 | high | GHSA-jqff-g426-hqxp | FSAFE-89 |
| 27 | fast-uri 3.1.5 | high | GHSA-f65p-4m7j-42xc | FSAFE-89 |
| 26 | fast-uri 3.1.5 | high | GHSA-fph4-wmhf-6fwf | FSAFE-89 |
| 25 | fast-uri 3.1.5 | high | GHSA-5jgf-p345-68v8 | FSAFE-89 |

The npm report contains fourteen distinct GHSA identifiers. Five are absent
from the ten-alert hosted set:

| npm-only identifier | Package | Follow-up |
| --- | --- | --- |
| GHSA-qhr7-859c-m2p7 | brace-expansion | FSAFE-89 |
| GHSA-6j4f-fj2g-mc7p | brace-expansion | FSAFE-89 |
| GHSA-c83g-rgw3-j3cx | browserslist | FSAFE-89 |
| GHSA-hrr3-gc8f-f4qj | fast-uri | FSAFE-89 |
| GHSA-vfj7-8cjw-p6xm | braces | FSAFE-91 |

Every npm package record is assigned: FSAFE-89 owns baseline-browser-mapping,
brace-expansion, browserslist and fast-uri; FSAFE-90 owns compression and
its propagated serve record; FSAFE-91 owns braces, micromatch, fast-glob,
@next/eslint-plugin-next and eslint-config-next.

## Graph, candidate limits and source applicability

FSAFE-89 candidates were observed through registry metadata only. They have
not been installed, executed or checked against downloaded tarball bytes.
Historical first-patched fields are not current-version recommendations.
The declared ranges permit the named versions:

- minimatch 3.1.5 uses brace-expansion `^1.1.7`; the nested minimatch 10.2.5
  uses `^5.0.5`. Both copies must be assessed.
- serve's AJV 8.18.0 uses fast-uri `^3.0.1`.
- Babel's compilation-target helper uses browserslist `^4.24.0`.
- browserslist uses baseline-browser-mapping `^2.10.12`; Next also uses
  `^2.9.19`. The latter is a production dependency declaration, so the
  package must not be described as universally dev-only.

FSAFE-90 remains unresolved: installed and registry-latest serve 14.2.6
pins compression exactly to 1.8.1. Although compression 1.8.2 exists, it
does not satisfy that pin. npm proposes a major downgrade to serve 10.0.2;
no downgrade, override or unsupported graph is approved.

FSAFE-91 remains unresolved: registry-latest braces is 3.0.3, still covered
by the npm advisory. The graph is eslint-config-next 16.4.1 →
@next/eslint-plugin-next 16.4.1 → fast-glob 3.3.1 → micromatch 4.0.8 →
braces 3.0.3. npm proposes eslint-config-next 14.2.35, a major downgrade.
That is not an approved remediation. A future supported-parent correction
or explicitly reviewed migration needs separate evidence.

Source inspection found the following bounded consumers:

- `next.config.ts` declares a static export and unoptimized images.
  The workflow uploads `out/` to S3/CloudFront. This describes the intended
  serving architecture, not proof of every deployed asset or exposure.
- ESLint/Babel/glob dependencies are build/lint tooling in the inspected
  graph. Their presence is not proof of an affected input or non-exposure.
- `playwright.config.ts` uses `npx serve out -l 3000 --no-clipboard` for
  local E2E. Compression and AJV therefore have a declared test-server
  consumer. No advisory probe or live-server attribution was performed.
- Sharp is imported by manual avatar/favicon scripts. Those scripts were
  inspected, not run. The config disables Next image optimization, but that
  does not certify all sharp inputs or native binaries.
- DOMPurify is absent from this lock and the selected source scan. It has no
  hosted alert in this repository's observed set; this is not a universal
  absence claim about external code.

## Validation and release boundary

The baseline used an isolated `npm ci --no-audit --no-fund` with Node
22.17.0 and npm 10.9.2. The workflow declares Node 20; that engine was not
executed in this assessment. The existing lock flags one install-script
package, unrs-resolver 1.12.2. Ordinary npm logs do not independently attest
every hook invocation. No shared installation occurred.

The item excludes installs outside the worktree. The brief's overview says
“no installs”, while its installed-artifact requirement and step 1 explicitly
require a fresh worktree npm ci. This assessment follows that specific
worktree-only baseline instruction; it performs no dependency upgrade.

Baseline lint passed. JSON parsing, all-record disposition, declared-range
checks and publication checks are retained with the final review evidence.
These are triage and repository checks, not vulnerability behavior tests.
No artificial mutation was needed.

A merge into main triggers the entire production workflow even for these
documentation paths. The last observed mainline deployment run was completed
successfully; that metadata is not a new release approval or an asset-level
verification. Source publication and any deployment must retain final-head
CI, disclosure and actual frontend blast-radius/idle/configuration/rollback
checks. The item excludes deploys; this triage grants no new production,
permission, exposure or spend authority.

| Criterion | Evidence | Boundary / grade | Remaining gap |
| --- | --- | --- | --- |
| Reconcile all hosted findings | Ten raw alerts, prior eleven-number snapshot, fixed alert 47 | Metadata, Adequate | GitHub analyzed SHA unknown |
| Include separate npm findings | Eleven records, fourteen GHSAs, five additional IDs | Audit metadata, Adequate | Advisory behavior unexecuted |
| Inspect installed applicability | Thirteen matching manifests and declared consumer graph | Owned installation metadata, Adequate | Loaded/deployed versions and affected inputs unknown |
| Scope supported follow-ups | FSAFE-89/90/91 mapping; registry declarations and exact parent pins | Source/metadata, Adequate | Artifact verification, repair tests and compatibility remain |
| Preserve release boundaries | Unchanged manifests/lock; main push deploy trigger inspected | Source intent, Adequate | Actual production release evidence remains held |

No source upgrade, alert dismissal, shared runtime restart, configuration,
credential, permission or registration change was performed. The findings
remain unresolved except for the separately observed historical sharp fix.
