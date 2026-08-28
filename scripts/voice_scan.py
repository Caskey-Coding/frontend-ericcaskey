#!/usr/bin/env python3
# Vendored from caskeycoding-specs _shared/tooling at commit 77fb76f.
# Re-vendor by copying the upstream file over this one (keep this header).
# voice_scan_profiles_private.py is intentionally absent from this repo.
"""Repo-agnostic voice / NDA content scanner (FLEET-1).

One shared implementation of the disallowed-content scan that, until now, was
duplicated as inline bash across the fleet repos' ``pr-validation.yml``
workflows. Per the fleet's determinism test
(`_shared/tooling/001-agent-and-skill-fleet.md`), a deterministic *enforcement*
check belongs in a script run by a hook/CI, not re-typed per repo; the
``disclosure-auditor`` agent stays for the judgment calls this can't make.

The rules are NOT identical across repos, so this is deliberately NOT a flat
union. Each repo's current behavior is preserved as a named **profile**, with
the patterns, case-sensitivity, file globs, and path exclusions its CI uses
today. The acceptance bar for this CLI is behavior-preserving: it must exit
clean against each repo's current content. Profiles load from a public module
always, plus a private module when present (vendored copies run without it).

Usage:
    voice_scan.py --profile frontend-nda --root path/to/repo [paths...]
    voice_scan.py --profile voice        --root path/to/repo
    voice_scan.py --profile <name>       --files a.md b.md     # CI changed-files
    voice_scan.py --list-profiles

Exit code 1 on any violation (with a report), 0 when clean.
"""

from __future__ import annotations

import argparse
import os
import re
from dataclasses import dataclass

# Rule/Profile and the public-safe profiles live in voice_scan_profiles_public
# (FLEET-1b split): that file is vendored into frontend-ericcaskey, so it owns
# the dataclasses to avoid a circular import. Re-exported here for callers.
from voice_scan_profiles_public import PUBLIC_PROFILES, Profile, Rule

try:
    # Specs-private profiles (internal codenames). Absent in a vendored copy of
    # this scanner, which must still run the public profiles.
    from voice_scan_profiles_private import PRIVATE_PROFILES
except ImportError:
    PRIVATE_PROFILES: dict[str, Profile] = {}

PROFILES: dict[str, Profile] = {**PUBLIC_PROFILES, **PRIVATE_PROFILES}


@dataclass(frozen=True)
class Violation:
    rule: Rule
    path: str
    line_no: int
    line: str


def _is_excluded(rel_path: str, profile: Profile) -> bool:
    norm = rel_path.replace(os.sep, "/")
    return any(sub in norm for sub in profile.exclude_path_substrings)


def iter_files(root: str, profile: Profile, paths: list[str]) -> list[str]:
    """Yield files under ``paths`` (relative to ``root``) matching the profile globs."""
    out: list[str] = []
    for base in paths:
        abs_base = os.path.join(root, base)
        if os.path.isfile(abs_base):
            if abs_base.endswith(profile.file_globs) and not _is_excluded(
                os.path.relpath(abs_base, root), profile
            ):
                out.append(abs_base)
            continue
        for dirpath, dirnames, filenames in os.walk(abs_base):
            dirnames[:] = [d for d in dirnames if d not in profile.exclude_dirs]
            for fn in filenames:
                if not fn.endswith(profile.file_globs):
                    continue
                full = os.path.join(dirpath, fn)
                if _is_excluded(os.path.relpath(full, root), profile):
                    continue
                out.append(full)
    return sorted(set(out))


def scan_file(path: str, profile: Profile, *, display: str) -> list[Violation]:
    try:
        with open(path, encoding="utf-8", errors="replace") as fh:
            lines = fh.readlines()
    except OSError:
        return []
    compiled = [(r, r.compiled()) for r in profile.rules]
    found: list[Violation] = []
    for idx, line in enumerate(lines, start=1):
        for rule, pat in compiled:
            if pat.search(line):
                found.append(Violation(rule, display, idx, line.rstrip("\n")))
    return found


def scan(
    profile: Profile,
    *,
    root: str = ".",
    paths: list[str] | None = None,
    files: list[str] | None = None,
) -> list[Violation]:
    """Scan either an explicit ``files`` list (CI changed-files) or walk ``paths``."""
    violations: list[Violation] = []
    if files:
        for f in files:
            if not f.endswith(profile.file_globs):
                continue
            if _is_excluded(f, profile):
                continue
            full = f if os.path.isabs(f) else os.path.join(root, f)
            if os.path.isfile(full):
                violations.extend(scan_file(full, profile, display=f))
        return violations
    scan_paths = paths or profile.default_paths
    for full in iter_files(root, profile, scan_paths):
        rel = os.path.relpath(full, root).replace(os.sep, "/")
        violations.extend(scan_file(full, profile, display=rel))
    return violations


def _format_report(profile: Profile, violations: list[Violation]) -> str:
    grouped: dict[str, list[Violation]] = {}
    for v in violations:
        grouped.setdefault(v.rule.reason, []).append(v)
    out = [f"{profile.name} scan found {len(violations)} violation(s):"]
    for reason, vs in grouped.items():
        out.append(f"\n### {reason}")
        for v in vs:
            out.append(f"  {v.path}:{v.line_no}: {v.line.strip()}")
    return "\n".join(out)


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Repo-agnostic voice/NDA content scan.")
    ap.add_argument("--profile", choices=sorted(PROFILES), help="ruleset to apply")
    ap.add_argument("--root", default=".", help="repo root (default: cwd)")
    ap.add_argument(
        "paths", nargs="*", help="dirs/files to scan (override profile default)"
    )
    ap.add_argument(
        "--files",
        default="",
        help="explicit newline/comma-separated file list (CI changed-files mode)",
    )
    ap.add_argument("--list-profiles", action="store_true")
    args = ap.parse_args(argv)

    if args.list_profiles:
        for name, p in sorted(PROFILES.items()):
            print(f"{name}: {len(p.rules)} rules  ({p.provenance})")
        return 0

    if not args.profile:
        ap.error("--profile is required (or use --list-profiles)")

    profile = PROFILES[args.profile]
    files = [f.strip() for f in re.split(r"[\n,]", args.files) if f.strip()] or None
    violations = scan(profile, root=args.root, paths=args.paths or None, files=files)
    if violations:
        print(_format_report(profile, violations))
        return 1
    print(f"{profile.name} scan passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
