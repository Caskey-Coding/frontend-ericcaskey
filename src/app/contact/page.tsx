import type { Metadata } from 'next';
import { ContactForm } from '../components/ContactForm';
import { ogImage } from '../lib/og';
import { BreadcrumbJsonLd } from '../components/BreadcrumbJsonLd';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with Eric Caskey: hiring, engineering, and press inquiries.',
  openGraph: {
    title: 'Contact',
    description: 'Get in touch with Eric Caskey: hiring, engineering, and press inquiries.',
    url: 'https://ericcaskey.com/contact',
    images: [ogImage],
  },
  alternates: { canonical: '/contact' },
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
    <article className="sr flex flex-col gap-8">
      <BreadcrumbJsonLd name="Contact" path="/contact" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageJsonLd) }}
      />

      <header className="sr-pagehead">
        <p className="coord">
          <span>Contact</span>
          <span className="sep">·</span>
          <span>replies &lt; 1 week</span>
        </p>
        <h1 className="text-3xl md:text-4xl">Contact</h1>
        <p className="sub">
          I read everything. I reply to serious inquiries within a week. The
          form below is the fastest route.
        </p>
      </header>

      <ContactForm />

      <section className="flex flex-col gap-4 mt-2 pt-8 border-t border-border">
        <h2 className="text-xl font-semibold">Direct</h2>
        <div className="sr-tiles sr-tiles--3">
          <div className="sr-tile">
            <span className="k">Email</span>
            <span className="t">e at ericcaskey dot com</span>
          </div>
          <a
            className="sr-tile link-plain"
            href="https://www.linkedin.com/in/ericrcaskey"
            rel="me noopener"
            target="_blank"
          >
            <span className="k">LinkedIn</span>
            <span className="t">/in/ericrcaskey →</span>
          </a>
          <a
            className="sr-tile link-plain"
            href="https://github.com/CaskeyCoding"
            rel="me noopener"
            target="_blank"
          >
            <span className="k">GitHub</span>
            <span className="t">/CaskeyCoding →</span>
          </a>
        </div>
      </section>
    </article>
  );
}
