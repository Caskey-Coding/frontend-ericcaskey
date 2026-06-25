import type { Metadata } from 'next';
import { Inter, Newsreader, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import { PersonJsonLd } from './components/PersonJsonLd';
import { ogImage } from './lib/og';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// "Systems Readout" type pairing (home masthead): a refined serif for prose
// (bio, lead) and a monospace for structural labels / the wordmark headline.
const newsreader = Newsreader({
  subsets: ['latin'],
  display: 'swap',
  style: ['normal', 'italic'],
  variable: '--font-serif',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ericcaskey.com'),
  title: {
    default: 'Eric Caskey — Platform Engineering at Amazon Scale',
    template: '%s | Eric Caskey',
  },
  description:
    'Eric Caskey — I build the systems other engineers depend on. Platform engineering, workflow orchestration, safety-critical infrastructure at Amazon.',
  openGraph: {
    siteName: 'Eric Caskey',
    locale: 'en_US',
    type: 'website',
    url: 'https://ericcaskey.com',
    // Designed 1200x630 share card (src/app/og.png/route.ts). Subpages
    // that export their own openGraph re-add it via the same descriptor.
    images: [ogImage],
  },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: 'https://ericcaskey.com/' },
};

const themeInitScript = `(function(){try{var KEY='eric-caskey-theme';var LEGACY=['theme','caskey-site-theme'];var v=null;try{var u=new URL(window.location.href);var q=u.searchParams.get('theme');if(q==='dark'||q==='light'){v=q;u.searchParams.delete('theme');var next=u.pathname+(u.searchParams.toString()?'?'+u.searchParams:'')+u.hash;window.history.replaceState(null,'',next);localStorage.setItem(KEY,v);}}catch(e){}if(!v){var s=localStorage.getItem(KEY);if(s==='dark'||s==='light')v=s;}if(!v){for(var i=0;i<LEGACY.length;i++){var k=LEGACY[i];var lv=localStorage.getItem(k);if(lv==='dark'||lv==='light'){v=lv;localStorage.setItem(KEY,v);localStorage.removeItem(k);break;}}}var t=v||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);var m=document.getElementById('meta-theme-color');if(m)m.setAttribute('content',t==='dark'?'#111110':'#f9f9f8');}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-01C9GQ8W3Q';

  return (
    <html
      lang="en"
      className={`${inter.variable} ${newsreader.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <meta id="meta-theme-color" name="theme-color" content="#f9f9f8" />
        <PersonJsonLd />
        {gaId ? (
          <>
            <Script id="ga4-consent" strategy="beforeInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('consent', 'default', {
                  ad_storage: 'denied',
                  ad_user_data: 'denied',
                  ad_personalization: 'denied',
                  analytics_storage: 'granted',
                  wait_for_update: 500,
                });
                gtag('consent', 'default', {
                  ad_storage: 'denied',
                  ad_user_data: 'denied',
                  ad_personalization: 'denied',
                  analytics_storage: 'denied',
                  region: ['AT','BE','BG','CY','CZ','DE','DK','EE','ES','FI','FR','GR','HR','HU','IE','IT','LT','LU','LV','MT','NL','PL','PT','RO','SE','SI','SK','IS','LI','NO'],
                });
              `}
            </Script>
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
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Nav />
        <main
          id="main"
          className="flex-1 mx-auto w-full max-w-3xl px-6 py-12 md:py-20"
        >
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
