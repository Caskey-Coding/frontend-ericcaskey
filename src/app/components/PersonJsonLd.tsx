export const PERSON_ID = 'https://ericcaskey.com/#person';
export const PERSON_SAME_AS = [
  'https://caskeycoding.com',
  'https://specself.ai',
  'https://www.linkedin.com/in/ericrcaskey',
  'https://github.com/CaskeyCoding',
];

const person = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  // Stable global id for the person entity. Every Person node across both
  // ericcaskey.com and caskeycoding.com shares this @id so search engines
  // collapse them into one entity (key signal for a Knowledge Panel) rather
  // than treating the two domains as competing pages about a shared name.
  '@id': PERSON_ID,
  name: 'Eric Caskey',
  url: 'https://ericcaskey.com',
  image: 'https://ericcaskey.com/eric-caskey-1200.jpg',
  sameAs: PERSON_SAME_AS,
  jobTitle: 'Senior Software Engineer',
  description: 'Eric Caskey is a Senior Software Engineer at Amazon and a platform engineer based in New Jersey. He has spent fifteen years across five roles making production infrastructure safe enough to automate: at Amazon since June 2022, and at Prudential Financial for nine years before that. He writes about safety-critical platforms and AI reliability at Caskey Engineering.',
  worksFor: {
    '@type': 'Organization',
    name: 'Amazon',
    url: 'https://www.amazon.com',
    sameAs: 'https://www.wikidata.org/wiki/Q3884',
  },
  affiliation: { '@id': 'https://caskeycoding.com/#organization' },
  homeLocation: {
    '@type': 'Place',
    address: {
      '@type': 'PostalAddress',
      addressRegion: 'NJ',
      addressCountry: 'US',
    },
  },
  hasOccupation: { '@type': 'Occupation', name: 'Senior Software Engineer' },
  knowsAbout: [
    'Platform Engineering',
    'Workflow Orchestration',
    'Safety-Critical Distributed Systems',
    'Fleet-Scale Infrastructure Monitoring',
    'AI-Augmented Engineering',
    'Spec-Driven Development',
    'Developer Tooling',
    'AWS',
    'Site Reliability Engineering',
  ],
};

export function PersonJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
    />
  );
}
