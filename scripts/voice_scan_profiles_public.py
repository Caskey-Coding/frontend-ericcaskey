#!/usr/bin/env python3
# Vendored from caskeycoding-specs _shared/tooling at commit 77fb76f.
# Re-vendor by copying the upstream file over this one (keep this header).
# voice_scan_profiles_private.py is intentionally absent from this repo.
"""PUBLIC-SAFE voice/NDA scan profiles (FLEET-1b split).

This file is vendored into frontend-ericcaskey so the ericcaskey CI can run
the same scanner without pulling in caskeycoding-specs. Every term below
already appears verbatim in frontend-ericcaskey's PUBLIC inline
pr-validation.yml workflow, so vendoring them is not a new disclosure.
DO NOT add internal codenames or any specs-only rule here - those live in
voice_scan_profiles_private.py, which never leaves caskeycoding-specs.

The Rule/Profile dataclasses live here (not in voice_scan.py) so the public
profiles can be defined without a circular import: voice_scan.py imports
them back from this module.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field


@dataclass(frozen=True)
class Rule:
    """A single disallowed pattern.

    ``regex=False`` treats ``pattern`` as a literal substring (escaped before
    compiling), matching the plain ``grep`` the inline bash used. ``regex=True``
    preserves a pattern the bash passed to ``grep`` with word-boundaries or
    character classes (e.g. the specs 12-digit account-id pattern).
    """

    pattern: str
    reason: str
    regex: bool = False
    case_sensitive: bool = False

    def compiled(self) -> re.Pattern:
        body = self.pattern if self.regex else re.escape(self.pattern)
        flags = 0 if self.case_sensitive else re.IGNORECASE
        return re.compile(body, flags)


@dataclass(frozen=True)
class Profile:
    """A named ruleset + scan surface, mirroring one repo's current CI scan."""

    name: str
    provenance: str
    rules: list[Rule]
    default_paths: list[str] = field(default_factory=list)
    file_globs: tuple[str, ...] = (".ts", ".tsx", ".md")
    exclude_dirs: frozenset[str] = frozenset(
        {"node_modules", ".next", "out", "generated", ".git"}
    )
    # Path substrings that exempt a file (the file defines or documents the
    # terms, or is an internal workshop surface). Matched against the
    # forward-slash-normalized path.
    exclude_path_substrings: tuple[str, ...] = ()


# ---------------------------------------------------------------------------
# Frontend NDA terms, verbatim from frontend-ericcaskey's PUBLIC
# pr-validation.yml `nda-scan` job (case-insensitive). FLEET-1b disclosure
# correction (2026-08-27): only rules already present in a PUBLIC repo's
# workflow may live in this file - no rule or repo reference whose only
# provenance is a private repo. A former tenth rule was dropped on that
# basis; it was a strict subset of an existing rule, so coverage is
# unchanged.
# ---------------------------------------------------------------------------
_FRONTEND_NDA_RULES = [
    Rule("System Development Organization", "Internal org name"),
    Rule("Reliability org", "Internal org name"),
    Rule("VitalNet", "Internal tool name: 'VitalNet'"),
    Rule("engineer at Amazon who", "Disallowed attribution: 'engineer at Amazon who'"),
    Rule("At Amazon, I", "Disallowed attribution: 'At Amazon, I'"),
    Rule("At Amazon, I've", "Disallowed attribution: 'At Amazon, I've'"),
    Rule("At Amazon, I faced", "Disallowed attribution: 'At Amazon, I faced'"),
    Rule("per day in us-east-1", "Internal metric: execution rate per region"),
    Rule("account ID", "Potential internal detail: AWS account ID reference"),
]

# Voice / marketing rules. Verbatim from frontend-ericcaskey's `voice-scan` job
# (case-SENSITIVE grep, excludes PersonJsonLd.tsx whose jobTitle is structured
# schema, not rendered marketing copy).
# FLEET-1b correction (2026-08-27): the FLEET-1 extraction (#198) carried a
# "Senior Software Engineer" ban that ericcaskey's inline voice-scan bash never
# had, and that contradicts the 2026-07-07 title ruling (ericcaskey CLAUDE.md
# D1/D4 amendment: "Senior Software Engineer" IS the sanctioned rendered title;
# "Principal Engineer" is the banned one, and it stays banned below). Found the
# first time the profile actually ran against the repo, at vendoring time.
_VOICE_RULES = [
    Rule(
        "Principal Engineer", "Banned title: 'Principal Engineer'", case_sensitive=True
    ),
    Rule("cutting-edge", "Marketing adjective: 'cutting-edge'", case_sensitive=True),
    Rule("world-class", "Marketing adjective: 'world-class'", case_sensitive=True),
    Rule("passionate", "Marketing adjective: 'passionate'", case_sensitive=True),
    Rule(
        "thought leader", "Marketing adjective: 'thought leader'", case_sensitive=True
    ),
    Rule(
        "thought leadership",
        "Marketing adjective: 'thought leadership'",
        case_sensitive=True,
    ),
]

PUBLIC_PROFILES: dict[str, Profile] = {
    "frontend-nda": Profile(
        name="frontend-nda",
        provenance="frontend-ericcaskey pr-validation.yml nda-scan",
        rules=_FRONTEND_NDA_RULES,
        default_paths=["src", "public"],
    ),
    "voice": Profile(
        name="voice",
        provenance="frontend-ericcaskey pr-validation.yml voice-scan",
        rules=_VOICE_RULES,
        default_paths=["src"],
        exclude_path_substrings=("PersonJsonLd.tsx",),
    ),
}
