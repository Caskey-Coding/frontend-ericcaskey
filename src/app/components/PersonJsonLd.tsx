const person = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Eric Caskey',
  url: 'https://ericcaskey.com',
  image: 'https://ericcaskey.com/eric-caskey-1200.jpg',
  sameAs: [
    'https://caskeycoding.com',
    'https://www.linkedin.com/in/ericcaskey',
    'https://github.com/ecaskey',
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
