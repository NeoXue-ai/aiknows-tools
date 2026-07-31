/**
 * Compress findly screenshots from Desktop into aiknows public/.
 *
 * - Reads Desktop/findly_results/images/{slug}/screenshot.{png,jpg,jpeg}
 * - Converts each to WebP at 1200px wide, quality 80
 * - Writes to public/screenshots/{slug}.webp
 * - Runs 8 in parallel, skips failures, leaves originals untouched
 *
 * Usage: pnpm tsx scripts/compress-findly-screenshots.ts
 */

import { readdir, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, join } from "node:path";
import sharp from "sharp";

const SRC = "/Users/lonnie/Desktop/findly_results/images";
const OUT = resolve(process.cwd(), "public/screenshots");
const WIDTH = 1200;
const QUALITY = 80;
const CONCURRENCY = 8;

type Job = { folder: string; src: string; dest: string };

async function listJobs(): Promise<Job[]> {
  const folders = await readdir(SRC);
  const jobs: Job[] = [];
  for (const folder of folders) {
    const folderPath = join(SRC, folder);
    const statResult = await stat(folderPath).catch(() => null);
    if (!statResult?.isDirectory()) continue;
    for (const ext of ["png", "jpg", "jpeg", "webp"]) {
      const src = join(folderPath, `screenshot.${ext}`);
      if (existsSync(src)) {
        jobs.push({ folder, src, dest: join(OUT, `${folder}.webp`) });
        break;
      }
    }
  }
  return jobs;
}

async function runWithPool<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>) {
  const results: R[] = new Array(items.length);
  let idx = 0;
  const workers = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (idx < items.length) {
      const i = idx++;
      results[i] = await fn(items[i]!);
    }
  });
  await Promise.all(workers);
  return results;
}

async function compressOne(job: Job): Promise<{ ok: boolean; error?: string; srcBytes?: number; outBytes?: number }> {
  try {
    const srcStat = await stat(job.src);
    const buf = await sharp(job.src)
      .rotate()
      .resize({ width: WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 4 })
      .toBuffer();
    await writeFile(job.dest, buf);
    return { ok: true, srcBytes: srcStat.size, outBytes: buf.length };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

async function main() {
  if (!existsSync(OUT)) {
    const { mkdir } = await import("node:fs/promises");
    await mkdir(OUT, { recursive: true });
  }
  const jobs = await listJobs();
  console.log(`[compress] Found ${jobs.length} screenshots in ${SRC}`);
  console.log(`[compress] Output: ${OUT}`);
  console.log(`[compress] Target: ${WIDTH}px wide WebP @ q${QUALITY}, ${CONCURRENCY} concurrent`);

  const startedAt = Date.now();
  let done = 0;
  let ok = 0;
  let failed = 0;
  let totalSrcBytes = 0;
  let totalOutBytes = 0;
  const failures: { folder: string; error: string }[] = [];

  // Print progress every 5%
  const reportEvery = Math.max(50, Math.floor(jobs.length / 20));

  await runWithPool(jobs, CONCURRENCY, async (job) => {
    const r = await compressOne(job);
    done++;
    if (r.ok) {
      ok++;
      totalSrcBytes += r.srcBytes ?? 0;
      totalOutBytes += r.outBytes ?? 0;
    } else {
      failed++;
      failures.push({ folder: job.folder, error: r.error ?? "unknown" });
    }
    if (done % reportEvery === 0 || done === jobs.length) {
      const pct = ((done / jobs.length) * 100).toFixed(1);
      const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
      process.stdout.write(`\r[compress] ${done}/${jobs.length} (${pct}%) · ${elapsed}s · ok:${ok} fail:${failed}`);
    }
  });

  console.log("\n");
  console.log(`[compress] Done in ${((Date.now() - startedAt) / 1000).toFixed(1)}s`);
  console.log(`[compress] Success: ${ok}, Failed: ${failed}`);
  console.log(`[compress] Source size: ${(totalSrcBytes / 1024 / 1024).toFixed(1)} MB`);
  console.log(`[compress] Output size: ${(totalOutBytes / 1024 / 1024).toFixed(1)} MB`);
  console.log(`[compress] Ratio: ${totalSrcBytes > 0 ? ((totalOutBytes / totalSrcBytes) * 100).toFixed(1) : "n/a"}%`);

  if (failures.length > 0) {
    console.log(`[compress] First 10 failures:`);
    failures.slice(0, 10).forEach((f) => console.log(`  ${f.folder}: ${f.error}`));
  }
}

main().catch((err) => {
  console.error("[compress] Failed:", err);
  process.exit(1);
});