/**
 * Regenerate the brand favicon set from inline SVGs.
 *
 * Outputs:
 *   - app/icon.svg         modern browsers; vector, scales to any size, uses
 *                          prefers-color-scheme to invert mark color
 *   - app/favicon.ico      legacy; 16/32/48 px multi-resolution, dark mark on
 *                          transparent (works on the most common light tab bar)
 *   - app/apple-icon.png   iOS home screen; 180 px, white mark on forest green
 *                          (home screen has no theme; solid bg = readable
 *                          everywhere)
 *   - app/icon-192.png     PWA / Android; 192 px, same forest-green + white mark
 *   - app/icon-512.png     PWA / Android maskable; 512 px, same forest-green +
 *                          white mark
 *
 * The SVG path mirrors components/logo.tsx so the favicon stays in lockstep
 * with the in-app brand mark. Only the color treatment differs per surface.
 *
 * Run: pnpm tsx scripts/build-icons.ts
 */
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";

const APP_DIR = resolve(process.cwd(), "app");

// ── Colors (kept in sync with app/globals.css tokens) ─────────────────
//   light mode fg #2e5846  (dark mark on light bg)
//   dark  mode fg #bdd6be  (light mark on dark bg)
const INK_LIGHT = "#2e5846";
const INK_DARK = "#bdd6be";
const BRAND = "#2e5846"; // accent (see app/globals.css --accent)

// ── Adaptive SVG (light + dark via prefers-color-scheme) ───────────────
//
// Modern browsers (Safari 12.1+, Chrome/Edge 76+, Firefox 67+) honor this in
// SVG favicons. The fallback paint (no media query match) is the dark mark,
// which is the right choice on the most common light tab bars.
const MARK_SVG_ADAPTIVE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <style>
    .mark { stroke: ${INK_LIGHT}; }
    @media (prefers-color-scheme: dark) {
      .mark { stroke: ${INK_DARK}; }
    }
  </style>
  <g class="mark" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="9" cy="16" r="5.5"/>
    <line x1="14.5" y1="10.5" x2="14.5" y2="21.5"/>
    <line x1="19" y1="7" x2="19" y2="25"/>
    <line x1="19" y1="16" x2="28" y2="7"/>
    <line x1="19" y1="16" x2="28" y2="25"/>
  </g>
</svg>`;

// ── Static SVGs (for surfaces that don't honor media queries) ───────────
//
// ICO legacy fallback: dark mark on transparent. Most browsers that fall
// back to /favicon.ico today are running on light UI surfaces, so a dark
// mark reads cleanly. Dark UI users on legacy browsers see a dim mark —
// acceptable for a vanishingly small cohort.
const MARK_SVG_DARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <g fill="none" stroke="${INK_LIGHT}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="9" cy="16" r="5.5"/>
    <line x1="14.5" y1="10.5" x2="14.5" y2="21.5"/>
    <line x1="19" y1="7" x2="19" y2="25"/>
    <line x1="19" y1="16" x2="28" y2="7"/>
    <line x1="19" y1="16" x2="28" y2="25"/>
  </g>
</svg>`;

// iOS home-screen + PWA: solid forest-green background, white mark. The home
// screen has no light/dark concept of its own, so a self-contained tile
// reads well on every wallpaper.
const MARK_SVG_TILE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="${BRAND}"/>
  <g fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="9" cy="16" r="5.5"/>
    <line x1="14.5" y1="10.5" x2="14.5" y2="21.5"/>
    <line x1="19" y1="7" x2="19" y2="25"/>
    <line x1="19" y1="16" x2="28" y2="7"/>
    <line x1="19" y1="16" x2="28" y2="25"/>
  </g>
</svg>`;

async function pngFromSvg(svg: string, size: number, padding: number) {
  const inner = size - padding * 2;
  return sharp(Buffer.from(svg))
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

// Tiny multi-resolution ICO encoder (PNG payloads inside). Modern Windows /
// macOS / Linux browsers all accept this since 2008+.
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
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    dirEntries.push(entry);
    blobs.push(png);
  }

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(frames.length, 4);

  return Buffer.concat([header, ...dirEntries, ...blobs]);
}

async function writeIco() {
  const sizes = [16, 32, 48];
  const frames = await Promise.all(
    sizes.map(async (size) => ({
      size,
      png: await pngFromSvg(MARK_SVG_DARK, size, Math.round(size * 0.12)),
    })),
  );
  await writeFile(resolve(APP_DIR, "favicon.ico"), encodeIco(frames));
}

async function writeSvg() {
  await writeFile(resolve(APP_DIR, "icon.svg"), MARK_SVG_ADAPTIVE);
}

async function writeTiledRaster(out: string, size: number) {
  // Tile surfaces (apple, PWA) use a forest-green square with the mark inset
  // ~16% from each edge so the rounded corners read cleanly.
  const padding = Math.round(size * 0.12);
  const buf = await pngFromSvg(MARK_SVG_TILE, size, padding);
  await writeFile(resolve(APP_DIR, out), buf);
}

async function main() {
  await writeSvg();
  await writeTiledRaster("apple-icon.png", 180);
  await writeTiledRaster("icon-192.png", 192);
  await writeTiledRaster("icon-512.png", 512);
  await writeIco();

  console.log(
    "Generated app/icon.svg (adaptive), app/favicon.ico (legacy, dark mark), app/apple-icon.png, app/icon-192.png, app/icon-512.png (all forest-green tiles)",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});