const person = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Eric Caskey',
  jobTitle: 'Senior Software Engineer',
  worksFor: {
    '@type': 'Organization',
    name: 'Amazon',
  },
  url: 'https://ericcaskey.com',
  sameAs: [
    'https://www.linkedin.com/in/ericcaskey',
    'https://github.com/CaskeyCoding',
    'https://caskeycoding.com',
  ],
  knowsAbout: [
    'Platform Engineering',
    'Workflow Orchestration',
    'Fleet-Scale Infrastructure Monitoring',
    'Safety-Critical Distributed Systems',
    'Developer Tooling',
    'AWS',
    'AI-Augmented Engineering',
    'Marathon Running',
    'Investment Analysis',
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
