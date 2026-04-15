import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import { PersonJsonLd } from './components/PersonJsonLd';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ericcaskey.com'),
  title: {
    default: 'Eric Caskey — Platform engineer',
    template: '%s — Eric Caskey',
  },
  description:
    'Eric Caskey — I build the systems other engineers depend on. Platform engineering, workflow orchestration, safety-critical infrastructure at Amazon.',
  openGraph: {
    siteName: 'Eric Caskey',
    locale: 'en_US',
    type: 'website',
    url: 'https://ericcaskey.com',
    images: ['/eric-caskey-1200.jpg'],
  },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: '/' },
};

const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') {
      document.documentElement.setAttribute('data-theme', stored);
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <PersonJsonLd />
        {gaId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        ) : null}
      </head>
      <body className="min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1 mx-auto w-full max-w-3xl px-6 py-12 md:py-20">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
