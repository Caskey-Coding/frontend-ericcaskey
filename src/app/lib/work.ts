export interface WorkMetric {
  label: string;
  value: string;
}

export interface Employer {
  company: string;
  role: string;
  dates: string;
  oneLineImpact: string;
  metrics?: WorkMetric[];
  href?: string;
}

// Home and /work render these same records. Each figure appears once, in its
// owning employer's evidence rows, rather than repeating in prose and chips.
export const employers: Employer[] = [
  {
    company: 'Amazon',
    role: 'Software Engineer → Senior Software Engineer',
    dates: 'Jun 2022 – Present',
    oneLineImpact:
      'Architected a workflow orchestration platform built safe by default: validation guardrails run before every automated change, and a spec-as-code system gives AI coding agents curated context instead of raw access. I also own the monitoring platform that standardizes monitors across application stages.',
    metrics: [
      { label: 'guardrails', value: '500,000 cumulative safety checks' },
      { label: 'monitoring', value: '3 million monitors' },
      { label: 'monitoring coverage', value: '2,750+ application stages' },
    ],
    href: 'https://caskeycoding.com/case-studies/workflow-orchestration',
  },
  {
    company: 'Prudential Financial',
    role: 'Remote Access Analyst → Senior Remote Access SRE → Cloud Engineer, SRE',
    dates: 'Apr 2013 – Jun 2022',
    oneLineImpact:
      'Built the MFA self-service portal, automated administrative work, and kept the VPN running through the early months of COVID.',
    metrics: [
      { label: 'MFA self-service', value: 'over 18,000 uses' },
      { label: 'portal languages', value: 'six languages' },
      { label: 'automation', value: '200,000+ administrative actions' },
      { label: 'VPN continuity', value: '60,000 corporate users' },
    ],
    href: 'https://caskeycoding.com/case-studies/mfa-at-scale',
  },
  {
    company: 'Workforce Opportunity Services',
    role: 'Consultant',
    dates: '2011 – 2013',
    oneLineImpact:
      "Launched my technology career as a WOS consultant, rapidly learning enterprise IT environments and contributing to Prudential's remote access platform operations.",
  },
  {
    company: 'Caskey Coding, LLC',
    role: 'Owner, operator',
    dates: 'Feb 2015 – May 2018',
    oneLineImpact:
      'Ran a New Jersey WordPress shop. Delivered ten sites for small businesses and community organizations. SEO work for The Drain Guys took monthly organic clicks from 2 to 52 in six months.',
  },
  {
    company: 'NJ Army National Guard',
    role: 'Military Police Officer, 50th Brigade Special Troops Battalion',
    dates: 'Jul 2009 – Jun 2015',
    oneLineImpact:
      'Reached senior Specialist rank. Activated for 2012 Superstorm Sandy recovery, assigned to safeguard and distribute 241,000 gallons of FEMA fuel for nearly a month.',
  },
];

export const featuredWork = employers.slice(0, 2);

export interface PersonalProject {
  name: string;
  kind: string;
  context: string;
  dates?: string;
  description: string;
  href: string;
  cta: string;
  status: 'shipped' | 'active';
  statusMeaning: string;
}

export const personalProjects: PersonalProject[] = [
  {
    name: 'Ballast',
    kind: 'Open source',
    context: 'Independent AI project · Open source',
    description:
      'An open-source RAG system with a guardrails gateway, engineered to refuse when it should.',
    href: 'https://caskeycoding.com/case-studies/ballast',
    cta: 'Read how Ballast handles trust',
    status: 'shipped',
    statusMeaning: 'Public versioned release',
  },
  {
    name: 'SpecSelf',
    kind: 'Project',
    context: 'Personal project',
    dates: '2026 – Present',
    description:
      'An operating system for a life, run like a spec-driven codebase: principles, goals, and decisions as versioned spec files, with AI agents that read but never write.',
    href: 'https://specself.ai',
    cta: 'SpecSelf Starter at specself.ai',
    status: 'active',
    statusMeaning: 'Current development with an evolving spec',
  },
];
