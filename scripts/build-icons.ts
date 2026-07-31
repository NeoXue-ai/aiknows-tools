/**
 * Regenerate the brand favicon set from public/logo.png.
 *
 * Outputs:
 *   - app/icon.svg         (modern browsers; vector, scales to any size)
 *   - app/favicon.ico      (legacy; 16/32/48 px multi-resolution)
 *   - app/apple-icon.png   (iOS home screen; 180 px)
 *   - app/icon-192.png     (PWA / Android; 192 px)
 *   - app/icon-512.png     (PWA / Android maskable; 512 px)
 *
 * Run: pnpm tsx scripts/build-icons.ts
 */
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";

const ROOT = resolve(process.cwd(), "..");
const SOURCE = resolve(process.cwd(), "public/logo.png");
const APP_DIR = resolve(process.cwd(), "app");

// Same path as components/logo.tsx — kept in lockstep so the favicon matches
// the in-app brand mark.
const MARK_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <g fill="none" stroke="#2578F8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="9" cy="16" r="5.5"/>
    <line x1="14.5" y1="10.5" x2="14.5" y2="21.5"/>
    <line x1="19" y1="7" x2="19" y2="25"/>
    <line x1="19" y1="16" x2="28" y2="7"/>
    <line x1="19" y1="16" x2="28" y2="25"/>
  </g>
</svg>`.trim();

async function pngFromSvg(size: number, padding = 2) {
  const inner = size - padding * 2;
  return sharp(Buffer.from(MARK_SVG))
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}

// Tiny multi-resolution ICO encoder. The .ico format is a 6-byte ICONDIR
// header, N * 16-byte ICONDIRENTRY directory entries, then N image blobs.
// We embed PNG payloads (supported by every Windows version since Vista
// and all modern macOS/Linux browsers).
function encodeIco(frames: { size: number; png: Buffer }[]): Buffer {
  const headerSize = 6;
  const entrySize = 16;
  const dirSize = headerSize + entrySize * frames.length;
  const dirEntries: Buffer[] = [];
  const blobs: Buffer[] = [];
  let offset = dirSize;

  for (const { size, png } of frames) {
    const widthByte = size >= 256 ? 0 : size;
    const heightByte = size >= 256 ? 0 : size;
    const entry = Buffer.alloc(entrySize);
    entry.writeUInt8(widthByte, 0);
    entry.writeUInt8(heightByte, 1);
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bit count
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    dirEntries.push(entry);
    blobs.push(png);
  }

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type = icon
  header.writeUInt16LE(frames.length, 4);

  return Buffer.concat([header, ...dirEntries, ...blobs]);
}

async function writeIco() {
  const sizes = [16, 32, 48];
  const frames = await Promise.all(
    sizes.map(async (size) => ({ size, png: await pngFromSvg(size) })),
  );
  const ico = encodeIco(frames);
  await writeFile(resolve(APP_DIR, "favicon.ico"), ico);
}

async function writeSvg() {
  await writeFile(resolve(APP_DIR, "icon.svg"), MARK_SVG);
}

async function writeRaster(out: string, size: number) {
  const buf = await pngFromSvg(size, Math.round(size * 0.08));
  await writeFile(resolve(APP_DIR, out), buf);
}

async function main() {
  // Confirm source exists; if public/logo.png gets removed in the future we
  // can rebuild from the inline SVG above without breaking this script.
  await readFile(SOURCE).catch(() => undefined);

  await writeSvg();
  await writeRaster("apple-icon.png", 180);
  await writeRaster("icon-192.png", 192);
  await writeRaster("icon-512.png", 512);
  await writeIco();

  console.log("Generated app/icon.svg, app/favicon.ico, app/apple-icon.png, app/icon-192.png, app/icon-512.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});