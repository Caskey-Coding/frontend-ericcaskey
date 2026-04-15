import type { Metadata } from 'next';
import { ContactForm } from '../components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with Eric Caskey — hiring, engineering, and press inquiries.',
};

const contactPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact Eric Caskey',
  url: 'https://ericcaskey.com/contact',
  mainEntity: {
    '@type': 'Person',
    name: 'Eric Caskey',
    url: 'https://ericcaskey.com',
  },
};

export default function Contact() {
  return (
    <article className="flex flex-col gap-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageJsonLd) }}
      />

      <header className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Contact
        </h1>
      </header>

      <p className="leading-relaxed">
        I read everything. I reply to serious inquiries within a week. The
        form below is the fastest route.
      </p>

      <ContactForm />

      <section
        className="flex flex-col gap-3 mt-4 pt-6 border-t text-sm"
        style={{
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-secondary)',
        }}
      >
        <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Direct
        </h2>
        <p>
          <strong>Email:</strong> eric at ericcaskey dot com
        </p>
        <p>
          <strong>LinkedIn:</strong>{' '}
          <a
            href="https://www.linkedin.com/in/ericcaskey"
            rel="me noopener"
            target="_blank"
          >
            linkedin.com/in/ericcaskey
          </a>
        </p>
        <p>
          <strong>GitHub:</strong>{' '}
          <a href="https://github.com/ecaskey" rel="me noopener" target="_blank">
            github.com/ecaskey
          </a>
        </p>
      </section>
    </article>
  );
}
