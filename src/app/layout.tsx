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

const themeInitScript = `(function(){try{var KEY='eric-caskey-theme';var LEGACY=['theme','caskey-site-theme'];var v=null;try{var u=new URL(window.location.href);var q=u.searchParams.get('theme');if(q==='dark'||q==='light'){v=q;u.searchParams.delete('theme');var next=u.pathname+(u.searchParams.toString()?'?'+u.searchParams:'')+u.hash;window.history.replaceState(null,'',next);localStorage.setItem(KEY,v);}}catch(e){}if(!v){var s=localStorage.getItem(KEY);if(s==='dark'||s==='light')v=s;}if(!v){for(var i=0;i<LEGACY.length;i++){var k=LEGACY[i];var lv=localStorage.getItem(k);if(lv==='dark'||lv==='light'){v=lv;localStorage.setItem(KEY,v);localStorage.removeItem(k);break;}}}var t=v||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);var m=document.getElementById('meta-theme-color');if(m)m.setAttribute('content',t==='dark'?'#111110':'#f9f9f8');}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <meta id="meta-theme-color" name="theme-color" content="#f9f9f8" />
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
