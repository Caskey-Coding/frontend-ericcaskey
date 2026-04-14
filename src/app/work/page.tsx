import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Summary of platform engineering scope across Amazon and Prudential Financial. Links to full case studies on Caskey Engineering.',
};

const employers = [
  {
    name: 'Amazon',
    role: 'Senior Software Engineer, Platform',
    dates: '2023 – Present',
    impact:
      'ICON Monitoring (fleet-wide infrastructure observability) and a workflow orchestration control plane across six global offices, on a path to GA for all of Amazon.',
  },
  {
    name: 'Prudential Financial',
    role: 'Senior Cloud Engineer / SRE',
    dates: '2015 – 2023',
    impact:
      'Enterprise monitoring platform, COVID-era reporting continuity, RSA self-service MFA portal, and the MFA enrollment platform.',
  },
  {
    name: 'NJ Army National Guard',
    role: 'Soldier',
    dates: '2010 – 2016',
    impact: 'Service.',
  },
];

export default function Work() {
  return (
    <article className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Engineering Work
        </h1>
      </header>

      <p className="leading-relaxed">
        A summary of the engineering platforms I&apos;ve built and operated.
        For in-depth case studies and architecture writeups, see{' '}
        <a href="https://caskeycoding.com/case-studies" rel="me noopener">
          Caskey Engineering
        </a>
        .
      </p>

      <ul className="flex flex-col gap-6">
        {employers.map((e) => (
          <li
            key={e.name}
            className="border rounded-lg p-5"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-surface)',
            }}
          >
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-1">
              <h2 className="font-semibold">{e.name}</h2>
              <span
                className="text-sm"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {e.dates}
              </span>
            </div>
            <p
              className="text-sm mt-1"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {e.role}
            </p>
            <p className="mt-3 leading-relaxed">{e.impact}</p>
          </li>
        ))}
      </ul>

      <div>
        <a
          href="https://caskeycoding.com/case-studies"
          className="inline-flex items-center justify-center px-4 py-2 rounded font-medium"
          style={{ background: 'var(--color-accent)', color: 'white' }}
        >
          See full case studies →
        </a>
      </div>
    </article>
  );
}
