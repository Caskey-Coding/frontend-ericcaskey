import { renderOgCard } from '../lib/og-card';

// Static route handler: the export build bakes the rendered card into
// out/og.png. See src/app/lib/og-card.tsx for why this is a .png route
// instead of the opengraph-image file convention.
export const dynamic = 'force-static';

export async function GET(): Promise<Response> {
  return renderOgCard();
}
