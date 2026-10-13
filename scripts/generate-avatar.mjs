// Deterministic derivatives of the real portrait; no retouching or metadata.
// Run manually with the sharp version provided by the pinned Next.js install.
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
const asset = name => fileURLToPath(new URL(`../public/${name}`, import.meta.url));
for (const size of [160, 320]) {
  for (const format of ['avif', 'webp', 'jpeg']) {
    const extension = format === 'jpeg' ? 'jpg' : format;
    await sharp(asset('eric-caskey-1200.jpg'))
      .extract({ left: 145, top: 70, width: 800, height: 800 })
      .resize(size, size)
      .toFormat(format, { quality: format === 'avif' ? 65 : 85 })
      .toFile(asset(`eric-caskey-avatar-${size}.${extension}`));
  }
}
