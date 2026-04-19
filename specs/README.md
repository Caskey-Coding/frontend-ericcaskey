# ericcaskey.com Specs

SDD package for the ericcaskey.com personal authority site.

## What lives here

- `steering/` — created when the first file is needed. Add a file when a
  convention needs to outlive a session and isn't already in caskeycoding-specs.

## What lives in caskeycoding-specs

All strategic specs for this site live in the org specs repo. Read them there:

| Topic | Path |
|-------|------|
| Canonical copy and tone rules | `ericcaskey-com/content/001-canonical-copy.md` |
| Site architecture and component inventory | `ericcaskey-com/frontend/001-site-architecture.md` |
| Brand brief and design decisions | `ericcaskey-com/discovery/` |
| Cross-domain design system | `_shared/architecture/002-cross-domain-design-system.md` |
| NDA and voice guidelines | `caskeycoding-com/content-strategy/steering/` |
| Org-wide ADRs | `decision/` |

## When to add more spec files

Add a `specs/steering/` file when a convention needs to survive across sessions and
is not already captured in caskeycoding-specs. Add a `specs/decision/ADR-NNN.md` when
an architectural decision gets made that is specific to this repo and not covered by the
org-wide ADRs. Do not add files to fill a template.
