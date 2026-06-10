import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { OG_IMAGE_ALT } from './lib/og';

// Default share card for every route (subpages override og:title via
// metadata; this file-convention image wins everywhere). Build-time only:
// static export renders it once to /opengraph-image as a 1200x630 PNG.
export const dynamic = 'force-static';
export const alt = OG_IMAGE_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Light-theme tokens from globals.css. ImageResponse can't read CSS custom
// properties, so the values are mirrored here; keep in sync with :root.
const BG = '#f9f9f8';
const TEXT_PRIMARY = '#111110';
const TEXT_SECONDARY = '#6b6b68';
const ACCENT = '#0c7c59';

export default async function OpengraphImage() {
  // Embed the headshot at build time as a data URI (static export has no
  // runtime to serve relative assets to the OG renderer).
  const headshot = await readFile(
    path.join(process.cwd(), 'public', 'eric-caskey-1200.jpg'),
  );
  const headshotSrc = `data:image/jpeg;base64,${headshot.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          backgroundColor: BG,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ width: 20, height: '100%', backgroundColor: ACCENT }} />

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '72px 64px 56px 72px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: 22,
                color: ACCENT,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              Platform Engineering
            </div>
            <div
              style={{
                fontSize: 92,
                fontWeight: 700,
                color: TEXT_PRIMARY,
                letterSpacing: '-0.02em',
                lineHeight: 1.05,
                marginTop: 28,
              }}
            >
              Eric Caskey
            </div>
            <div
              style={{
                fontSize: 34,
                fontWeight: 500,
                color: TEXT_SECONDARY,
                lineHeight: 1.3,
                marginTop: 28,
                maxWidth: 640,
              }}
            >
              I build the systems other engineers depend on.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: ACCENT,
              }}
            />
            <div
              style={{
                fontSize: 24,
                color: TEXT_PRIMARY,
                fontWeight: 600,
                letterSpacing: '0.02em',
              }}
            >
              ericcaskey.com
            </div>
          </div>
        </div>

        <img
          src={headshotSrc}
          width={400}
          height={630}
          style={{ objectFit: 'cover', objectPosition: 'center top' }}
          alt=""
        />
      </div>
    ),
    { ...size },
  );
}
