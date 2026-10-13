import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

// Keep the .png route: CloudFront rewrites extensionless routes to .html.
// The export build renders this card; no font or image fetch runs at request time.
export const OG_CARD_SIZE = { width: 1200, height: 630 };

// Inverse hero roles from globals.css. ImageResponse cannot read CSS variables.
const INK = '#13130f';
const PAPER = '#ece9df';
const MUTED = '#b5b3a3';
const ACCENT = '#73d5ab';

export async function renderOgCard(): Promise<ImageResponse> {
  const [avatar, font] = await Promise.all([
    readFile(path.join(process.cwd(), 'public', 'eric-caskey-avatar-320.jpg')),
    readFile(path.join(process.cwd(), 'assets', 'fonts', 'JetBrainsMono-Regular.ttf')),
  ]);

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '52px 64px', backgroundColor: INK, color: PAPER, fontFamily: 'JetBrains Mono' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ color: ACCENT, fontSize: 26 }}>$ whoami</div>
            <div style={{ marginTop: 18, fontSize: 76, lineHeight: 1.15, letterSpacing: '-0.04em' }}>Eric Caskey</div>
          </div>
          {/* ImageResponse needs an embedded img, not the Next Image component. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`data:image/jpeg;base64,${avatar.toString('base64')}`} width={112} height={112} alt="" style={{ borderRadius: 14 }} />
        </div>
        <div style={{ display: 'flex', marginTop: 42, fontSize: 26 }}>
          <span style={{ color: MUTED, width: 120 }}>role:</span>
          <span>Senior Software Engineer, Amazon</span>
        </div>
        <div style={{ display: 'flex', marginTop: 14, fontSize: 26 }}>
          <span style={{ color: MUTED, width: 120 }}>focus:</span>
          <span>Platform engineering / AI reliability</span>
        </div>
        <div style={{ display: 'flex', marginTop: 36, paddingTop: 26, borderTop: '1px solid #38382c', fontSize: 34, lineHeight: 1.3 }}>
          Safe by default. Validated before it ships.
        </div>
        <div style={{ display: 'flex', marginTop: 'auto', color: ACCENT, fontSize: 22 }}>ericcaskey.com</div>
      </div>
    ),
    {
      ...OG_CARD_SIZE,
      fonts: [{ name: 'JetBrains Mono', data: font, weight: 400, style: 'normal' }],
    },
  );
}
