const person = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  // Stable global id for the person entity. Every Person node across both
  // ericcaskey.com and caskeycoding.com shares this @id so search engines
  // collapse them into one entity (key signal for a Knowledge Panel) rather
  // than treating the two domains as competing pages about a shared name.
  '@id': 'https://ericcaskey.com/#person',
  name: 'Eric Caskey',
  url: 'https://ericcaskey.com',
  image: 'https://ericcaskey.com/eric-caskey-1200.jpg',
  sameAs: [
    'https://caskeycoding.com',
    'https://www.linkedin.com/in/ericrcaskey',
    'https://github.com/CaskeyCoding',
  ],
  jobTitle: 'Senior Software Engineer',
  worksFor: { '@type': 'Organization', name: 'Amazon' },
  knowsAbout: [
    'Platform Engineering',
    'Workflow Orchestration',
    'Safety-Critical Distributed Systems',
    'AI-Augmented Engineering',
    'Infrastructure Monitoring at Scale',
    'Spec-Driven Development',
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
