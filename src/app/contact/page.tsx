import type { Metadata } from 'next';
import { ContactForm } from '../components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with Eric Caskey — hiring, speaking, and engineering inquiries.',
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
        For hiring, speaking, or engineering inquiries — the form below is the
        fastest route. LinkedIn works too.
      </p>

      <ContactForm />

      <section
        className="flex flex-col gap-2 mt-4 pt-6 border-t text-sm"
        style={{
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-secondary)',
        }}
      >
        <p>
          <strong>Email:</strong> eric [at] ericcaskey.com
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
