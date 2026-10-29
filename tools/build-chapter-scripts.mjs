// ============================================================
// build-chapter-scripts.mjs — concatenates tools/examples/chNN-ex-*.R
// into assets/scripts/chNN.R (the "下载本章脚本" target).
// Run: node tools/build-chapter-scripts.mjs
// ============================================================
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const window_ = {};
vm.runInContext(readFileSync(join(root, "assets/js/data/course-toc.js"), "utf8"),
  vm.createContext({ window: window_ }));
const toc = window_.COURSE_TOC || [];

const exDir = join(root, "tools", "examples");
const outDir = join(root, "assets", "scripts");
mkdirSync(outDir, { recursive: true });

let n = 0;
for (const ch of toc) {
  const files = readdirSync(exDir)
    .filter((f) => f.startsWith(ch.id + "-ex-") && f.endsWith(".R"))
    .sort();
  let body;
  if (files.length) {
    body = files.map((f) =>
      `# ---- ${f} ----\n` + readFileSync(join(exDir, f), "utf8").trimEnd()
    ).join("\n\n") + "\n";
  } else {
    body = `# ${ch.id}: this chapter has no runnable example scripts yet.\n` +
           `# Follow along in RStudio; the deliverables are file-based tasks.\n`;
  }
  const header =
    `# ============================================================\n` +
    `# bioR · ${ch.title}\n` +
    `# All example code for ${ch.id}, auto-assembled from tools/examples/.\n` +
    `# Regenerate: node tools/build-chapter-scripts.mjs\n` +
    `# Data: copy assets/data/ into your project before running.\n` +
    `# ============================================================\n\n`;
  writeFileSync(join(outDir, ch.id + ".R"), header + body, "utf8");
  n++;
}
console.log(`build-chapter-scripts: ${n} chapter scripts written`);
