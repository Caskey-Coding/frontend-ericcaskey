# ericcaskey.com — Content Spec
_Last updated: 2026-04-19_

This spec is the single source of truth for all copy and factual claims on ericcaskey.com. Any AI agent or human author updating site content should reconcile against these values before merging.

---

## 1. Canonical facts

These numbers must be consistent across every page, component, metadata tag, and JSON-LD block.

| Fact | Canonical value | Source |
|---|---|---|
| Career start date | 2013 (Remote Access Analyst, Prudential Financial) | About page |
| Career duration | **15 years** (2013–present; includes Prudential + Amazon) | Home page intro |
| Prudential tenure | Apr 2013 – Jun 2022 | Work page `employers` array |
| Amazon start date | Jun 2022 | Work page, About page |
| Amazon current role start | Aug 2024 | About page |
| Active monitors (Amazon) | 3 million | Home, About, Work, layout metadata |
| Daily automated actions (Amazon) | 500,000 | Home, About, Work, layout metadata |
| Application stages onboarded | 2,750+ | Home, About, Work |
| Monitors onboarded (monitoring platform) | 200,000+ | About, Work |
| MFA portal usage | 18,000+ times in 6 languages | About, Work |
| Administrative actions automated (Prudential) | 200,000+ | About, Work |
| Prudential VPN users (COVID) | 60,000 | Home, About, Work |
| QR-code activations | 300,000+ over 8 years | About |
| New-to-industry engineers hired/mentored | 8 (in New York) | About |
| Amazon platform services | 12-service orchestration platform | About |
| Caskey Coding sites delivered | 10 | About, Work |
| Caskey Coding dates | Feb 2015 – May 2018 | Work |
| NJ Army National Guard dates | Jul 2009 – Jun 2015 | Work |
| Sandy fuel safeguarded | 241,000 gallons | About, Work |
| Drain Guys SEO result | 2 → 52 monthly organic clicks in 6 months | Work |

---

## 2. Tone rules

### Voice
The site voice is confident and specific. It lets the numbers do the claiming; the prose stays plain.

### What to avoid
- **Challenge language**: Phrases like "if you are here looking for proof, that is where the proof lives" position the reader as a skeptic to be defeated. Remove them. An invitation is fine; a dare is not.
- **Title-dropping**: Do not reference level, band, or pay grade. The value "Scope, not labels" is a site-wide rule. The About page's values section already states it; enforce it everywhere.
- **Vague duration hedges**: Do not write "nearly a decade" or "over ten years." Use the canonical fact from §1.

### What to preserve
- First person singular, present tense for current work.
- Em-dash (—) as the default pause punctuation, not semicolons.
- Sentence fragments are fine in headers and value titles.
- Numbers written as numerals (3 million, not three million), except "eight engineers" (short count within a sentence reads better as a word).

---

## 3. Page-by-page contract

### 3.1 Home (`/`)

| Element | Required value |
|---|---|
| H1 | `Eric Caskey` |
| Subheadline | `I build the systems other engineers depend on.` |
| Intro paragraph opening | `Fifteen years at enterprise scale —` |
| Amazon description | "multi-region workflow orchestration platform maintaining 3 million active monitors and powering 500,000 daily automated actions" |
| Pre-Amazon description | "standardized monitoring across more than 2,750 application stages" + MFA portal + COVID VPN |
| CTA | "Read the work →" → caskeycoding.com, "About →" → /about |

### 3.2 About (`/about`)

| Element | Required value |
|---|---|
| Opening paragraph subject | `Prudential Financial` linked to [Medium success story](https://medium.com/@wforceorg/success-story-eric-caskey-prudential-financial-d2d2e7258f49), `target="_blank" rel="noopener noreferrer"` |
| Prudential paragraph closer | No title or level claim |
| Amazon paragraph 1 | Monitoring lifecycle platform — 2,750 stages, 200,000 monitors, 8 engineers |
| Amazon paragraph 2 | Current role — 12-service orchestration, 3M monitors, 500K actions |
| Values titles | Exact strings from §4 — do not paraphrase |
| Blockquote | `Build the systems other engineers depend on. Write honestly about how it goes.` |
| "On writing" section closer | Must end after "a working notebook where the arguments get worked out in full." No proof/challenge line. |

### 3.3 Work (`/work`)

| Element | Required value |
|---|---|
| Intro | `A decade of the career in four rows.` — **Note: update to "fifteen-year" or "career" framing to match home page** |
| Amazon role | `Platform engineer`, `Jun 2022 – Present` |
| Amazon impact | Matches §1 canonical numbers |
| Prudential role | `Remote Access SRE → Senior Remote Access SRE`, `Apr 2013 – Jun 2022` |
| Caskey Coding | `Owner, operator`, `Feb 2015 – May 2018` |
| NJ Guard | `Military Police Officer, 50th Brigade Special Troops Battalion`, `Jul 2009 – Jun 2015` |

> **Open issue:** The Work page intro currently reads "A decade of the career in four rows." This should be updated to align with the 15-year framing on the Home page. Suggested: "Fifteen years in four rows." File a follow-up CR.

### 3.4 Writing (`/writing`)

No factual claims; confirm essay URLs remain valid on each deploy.

### 3.5 Contact (`/contact`)

No factual claims.

---

## 4. Values (canonical strings)

These must not be paraphrased. Copy verbatim.

1. **Safety is not a tax on velocity.**
   > It is what makes velocity trustworthy at scale. Every guardrail I build has to explain not just what failed, but why, what would make it pass, and who owns remediation.

2. **Structure before code.**
   > Design before you dive in. The hard part is rarely the implementation — it is the thinking that has to precede it. Specs, folder structure, decision logs. The structure does not follow the AI; the AI follows the structure.

3. **Scope, not labels.**
   > A title is a claim; scale is evidence. I would rather describe the systems I am responsible for than the level I am paid at.

4. **Earned lessons only.**
   > I write what I have learned by getting it wrong first, in production. The things I would have done differently are the things worth writing about.

---

## 5. SEO / metadata contracts

| Tag | Value |
|---|---|
| `<title>` default | `Eric Caskey — Platform Engineering at Amazon Scale` |
| `<meta description>` | `Eric Caskey — I build the systems other engineers depend on. Platform engineering, workflow orchestration, safety-critical infrastructure at Amazon.` |
| OG `siteName` | `Eric Caskey` |
| OG `url` | `https://ericcaskey.com` |
| OG image | `/eric-caskey-1200.jpg` |
| Twitter card | `summary_large_image` |
| `PersonJsonLd` sameAs | Must include LinkedIn and GitHub; keep in sync with Footer links |

---

## 6. Link registry

| Anchor | Destination | Notes |
|---|---|---|
| "Prudential Financial" (About p.1) | `https://medium.com/@wforceorg/success-story-eric-caskey-prudential-financial-d2d2e7258f49` | `target="_blank" rel="noopener noreferrer"` — plain `<a>`, not `CrossSiteLink` |
| "Caskey Engineering" (all pages) | `https://caskeycoding.com` | Use `CrossSiteLink` component |
| "Read the work →" (Home CTA) | `https://caskeycoding.com` | `CrossSiteLink` with `className="btn-primary"` |
| LinkedIn | `https://www.linkedin.com/in/ericcaskey` | `rel="me noopener"` |
| GitHub | `https://github.com/CaskeyCoding` | `rel="me noopener"` |

---

## 7. Open items / follow-up CRs

| # | Description | Priority |
|---|---|---|
| 1 | Work page intro: "A decade of the career" → "Fifteen years" | Medium |
| 2 | Verify `PersonJsonLd` sameAs array includes both LinkedIn and GitHub | Low |
| 3 | `writing/page.tsx` essay `publishedDate` for 2026 essays — replace with real dates when published | Low |
| 4 | Confirm `llms.txt` and `sitemap.ts` reflect the 15-year career fact | Low |

---

## 8. Change log

| Date | Change | PR |
|---|---|---|
| 2026-04-19 | Home: "Ten years" → "Fifteen years"; About: Prudential link added; About: removed "proof lives" closer | #8 |
| 2026-04-19 | This spec created | — |
