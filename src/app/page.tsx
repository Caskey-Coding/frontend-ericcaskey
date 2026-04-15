import Link from 'next/link';
import { Headshot } from './components/Headshot';

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Eric Caskey',
  url: 'https://ericcaskey.com',
  author: {
    '@type': 'Person',
    name: 'Eric Caskey',
    url: 'https://ericcaskey.com',
  },
};

export default function Home() {
  return (
    <article className="flex flex-col gap-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      <div className="grid md:grid-cols-[1fr_280px] gap-10 items-start">
        <header className="flex flex-col gap-5">
          <h1
            className="font-semibold tracking-tight leading-[1.05]"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}
          >
            Eric Caskey
          </h1>

          <p
            className="text-xl md:text-2xl leading-snug"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            I build the systems other engineers depend on.
          </p>

          <p className="text-base md:text-lg leading-relaxed">
            Ten years at enterprise scale — most of it spent making fleet-wide
            infrastructure safer, more predictable, and less demanding of the
            engineers who use it. At Amazon I architect a multi-region workflow
            orchestration platform maintaining 3 million active monitors and
            powering 500,000 daily automated actions. Before that I
            standardized monitoring across more than 2,750 application stages
            and built the MFA self-service portal that got 60,000 Prudential
            users through the first months of COVID. I write about how this
            work actually gets done at Caskey Engineering.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <a
              href="https://caskeycoding.com"
              rel="noopener"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded font-medium"
              style={{ background: 'var(--color-accent)', color: 'white' }}
            >
              Read the work →
            </a>
            <Link
              href="/about"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded font-medium border"
              style={{ borderColor: 'var(--color-border)' }}
            >
              About →
            </Link>
          </div>
        </header>

        <div className="md:pt-2">
          <Headshot alt="Eric Caskey, headshot" eager />
        </div>
      </div>
    </article>
  );
}
