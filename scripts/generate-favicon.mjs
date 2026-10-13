import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';

// public/icon.svg contains JetBrains Mono 2.304's original ec outlines.
// Keep 16/32/48px entries for browser tabs and the existing favicon contract.
const svg = await readFile(new URL('../public/icon.svg', import.meta.url));
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map((size) => sharp(svg).resize(size, size).png().toBuffer()));
const directory = Buffer.alloc(6 + sizes.length * 16);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(sizes.length, 4);
let offset = directory.length;
for (let i = 0; i < sizes.length; i++) {
  const entry = 6 + i * 16;
  directory[entry] = sizes[i];
  directory[entry + 1] = sizes[i];
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(images[i].length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += images[i].length;
}
await writeFile(new URL('../public/favicon.ico', import.meta.url), Buffer.concat([directory, ...images]));
