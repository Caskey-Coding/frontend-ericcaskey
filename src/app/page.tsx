import Link from 'next/link';

export default function Home() {
  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
          Eric Caskey
        </h1>
        <p
          className="text-lg md:text-xl"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Platform Engineering at Amazon Scale
        </p>
      </header>

      <p className="text-base md:text-lg leading-relaxed">
        I build platform primitives for engineering organizations. At Amazon I
        own ICON Monitoring — standardized infrastructure observability across
        the Amazon fleet — and a workflow orchestration control plane
        supporting millions of executions across teams in Dublin, Seattle, San
        Jose, New York, Bangalore, and Sydney. That platform is on a path to
        General Availability for all of Amazon.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <a
          href="https://caskeycoding.com/case-studies"
          className="inline-flex items-center justify-center px-4 py-2 rounded font-medium"
          style={{ background: 'var(--color-accent)', color: 'white' }}
        >
          View Engineering Work →
        </a>
        <Link
          href="/about"
          className="inline-flex items-center justify-center px-4 py-2 rounded font-medium border"
          style={{ borderColor: 'var(--color-border)' }}
        >
          About Me →
        </Link>
      </div>
    </article>
  );
}
