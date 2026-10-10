import { spawn, spawnSync } from "node:child_process";
import { watch } from "node:fs";
// Next watches application code; this watcher regenerates content artifacts.
const next = spawn("pnpm", ["exec", "next", "dev", ...process.argv.slice(2)], {
  stdio: "inherit",
});
let timer;
const watcher = watch("content/tools", () => {
  clearTimeout(timer);
  timer = setTimeout(
    () => spawnSync("pnpm", ["catalog:build"], { stdio: "inherit" }),
    150,
  );
});
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    watcher.close();
    next.kill(signal);
  });
next.on("exit", (code) => {
  watcher.close();
  process.exit(code ?? 0);
});
