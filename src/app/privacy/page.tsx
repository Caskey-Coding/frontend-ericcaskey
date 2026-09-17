import { LAST_MODIFIED, formatUpdated } from '../lib/lastModified';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ogImage } from '../lib/og';
import { BreadcrumbJsonLd } from '../components/BreadcrumbJsonLd';

export const metadata: Metadata = {
  title: 'Privacy',
  description:
    'What ericcaskey.com collects and why: analytics in consent mode, a contact form that sends one email, and nothing else.',
  openGraph: {
    siteName: 'Eric Caskey',
    locale: 'en_US',
    type: 'website',
    title: 'Privacy',
    description:
      'What ericcaskey.com collects and why: analytics in consent mode, a contact form that sends one email, and nothing else.',
    url: 'https://ericcaskey.com/privacy',
    images: [ogImage],
  },
  alternates: { canonical: '/privacy' },
};

export default function Privacy() {
  return (
    <article className="sr flex flex-col gap-8">
      <BreadcrumbJsonLd name="Privacy" path="/privacy" />

      <header className="sr-pagehead">
        <p className="coord">
          <span>Privacy</span>
          <span className="sep" aria-hidden="true">·</span>
          <span>updated <time dateTime={LAST_MODIFIED.privacy}>{formatUpdated(LAST_MODIFIED.privacy)}</time></span>
        </p>
        <h1 className="page-title">Privacy</h1>
        <p className="sub">
          This site collects as little as it can. Here is exactly what happens
          with your data.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Analytics</h2>
        <p className="leading-relaxed text-pretty">
          ericcaskey.com uses Google Analytics 4 to count visits and see which
          pages get read. It runs in consent mode: for visitors in the
          European Economic Area, analytics storage is denied by default and
          no analytics cookie is set unless you opt in. Google&apos;s handling
          of that data is described in{' '}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google&apos;s privacy policy
          </a>
          . A content blocker removes analytics entirely, and the site works
          the same without it.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Contact form</h2>
        <p className="leading-relaxed text-pretty">
          When you submit the <Link href="/contact">contact form</Link>, your
          name, email address, and message are sent to Eric as one email
          through Amazon Simple Email Service. Nothing is written to a
          database. Your email address is set as the reply-to so Eric can
          answer you directly. If the send fails, the error, not your message,
          may appear in server logs, which AWS keeps for a limited time.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Preferences</h2>
        <p className="leading-relaxed text-pretty">
          Your light or dark theme choice is kept in your browser&apos;s local
          storage so it survives a reload. It never leaves your browser.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">What this site does not do</h2>
        <p className="leading-relaxed text-pretty">
          No accounts, no advertising, no third-party embeds, and no selling
          or sharing of data.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Questions</h2>
        <p className="leading-relaxed text-pretty">
          Questions about this policy go through the{' '}
          <Link href="/contact">contact page</Link>.
        </p>
      </section>
    </article>
  );
}
