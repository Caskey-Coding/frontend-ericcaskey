# Off-site action pack: ranking ericcaskey.com for "Eric Caskey"

The on-site technical SEO is done (Person JSON-LD with shared `@id` + reciprocal
`sameAs` across both domains). The bare-name SERP is now an **off-site authority +
disambiguation** problem, not an on-page one. These are the levers, in order of impact.
Everything here needs your logins, so it's owner-action.

## 1. Point the high-authority profiles you own at ericcaskey.com

These already rank for your name, so the backlink + reciprocal `sameAs` is what
unlocks a future Knowledge Panel.

**LinkedIn** (linkedin.com/in/ericrcaskey)
- Edit intro -> Contact info -> Website. Add: `https://ericcaskey.com`, type **Personal website**.
- About section, last line, paste:
  > Portfolio and engineering writing: https://ericcaskey.com

**GitHub** (github.com/CaskeyCoding — your personal profile)
- Profile -> Edit -> Website field. Change from caskeycoding.com to: `https://ericcaskey.com`
  (your *personal* site should be the canonical link; caskeycoding can live in the profile README).
- Profile README, add a line: `🌐 [ericcaskey.com](https://ericcaskey.com)`

Reciprocity check: ericcaskey.com already lists both of these in `sameAs`, so once the
profiles link back, the loop is closed in both directions.

## 2. Create a Wikidata item (strongest single disambiguation signal)

Google reads Wikidata directly to decide which "Eric Caskey" is which. A minimal item
is enough to seed an entity.

- Go to wikidata.org -> Create a new Item (log in first; free).
- **Label:** Eric Caskey
- **Description:** software engineer (this is what disambiguates you from the other Eric Caskeys)
- Statements to add:
  - `instance of (P31)` -> human (Q5)
  - `occupation (P106)` -> software engineer (Q82594)
  - `employer (P108)` -> Amazon (Q3884)
  - `official website (P856)` -> https://ericcaskey.com
  - `GitHub username (P2037)` -> CaskeyCoding
- Note: notability matters on Wikidata; a bare-bones person item can be flagged. Keep it
  factual and sourced (link the LinkedIn / site as references) to reduce deletion risk.

## 3. Google Search Console (10 min, gives you real data)

You're currently diagnosing from one anecdotal search. GSC tells you your actual average
position for "Eric Caskey" and flags any crawled-not-indexed pages.

- search.google.com/search-console -> add **both** domains (use the Domain property, verified via DNS TXT in Route 53).
- Submit sitemaps: `https://ericcaskey.com/sitemap.xml` and `https://caskeycoding.com/sitemap.xml`.
- Performance -> filter query = "eric caskey" to see where you actually sit.
- URL Inspection -> Request Indexing on the homepage after the schema change deploys (forces a re-crawl).

## 4. A couple of credible third-party links (quality > volume)

- dev.to or Hashnode profile with website = ericcaskey.com (and cross-post one existing blog essay).
- That's enough. Do NOT buy links or submit to directory farms; for a personal-brand
  query that risks a spam association and won't outrank LinkedIn anyway.

## Reality check on timing

The schema change (shared `@id`) is committed locally but goes live only after a build +
S3 deploy + CloudFront invalidation, and then Google has to re-crawl (days to weeks).
Items 1-3 above are what actually flip the bare-name SERP; the schema is the prerequisite
that lets a Knowledge Panel form once the off-site signals are in place.
