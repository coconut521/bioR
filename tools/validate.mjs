// ============================================================
// validate.mjs — the site-wide gate (docs/05 §9.1).
//   node tools/validate.mjs          → 0 errors / 0 warnings to ship
// Exits 1 on any error; warnings are listed but pass during dev.
// ============================================================
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { join, dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import vm from "node:vm";
import { extractExamples, extractOutputs, extractJsonBlocks, extractIds, extractRefs, parseCsv, readText } from "./lib/extract-code.mjs";

const root = resolve(join(dirname(fileURLToPath(import.meta.url)), ".."));
let errors = 0, warnings = 0;
const err = (file, msg) => { errors++; console.log(`[error] ${relative(root, file) || file}: ${msg}`); };
const warn = (file, msg) => { warnings++; console.log(`[warn] ${relative(root, file) || file}: ${msg}`); };
const ok = (msg) => console.log(`[ok] ${msg}`);

// ============================================================
// sandbox-load data files
// ============================================================
const dataDir = join(root, "assets", "js", "data");
const window_ = {};
const vmctx = vm.createContext({ window: window_ });
const dataFiles = readdirSync(dataDir).filter((f) => f.endsWith(".js")).sort();
for (const f of dataFiles) {
  try { vm.runInContext(readFileSync(join(dataDir, f), "utf8"), vmctx, { filename: f }); }
  catch (e) { err(join(dataDir, f), `data file fails to execute: ${e.message}`); }
}
const TOC = window_.COURSE_TOC || [];
const SPECIALS = window_.BIOR_SPECIALS || [];
const DATASETS = window_.BIOR_DATASETS || [];

// ============================================================
// file inventory
// ============================================================
const pageFiles = [];
for (const f of readdirSync(root)) {
  if (f.endsWith(".html")) pageFiles.push(join(root, f));
}
const tplDir = join(root, "templates");
const chapterFiles = existsSync(join(root, "chapters"))
  ? readdirSync(join(root, "chapters")).filter((f) => f.endsWith(".html")).map((f) => join(root, "chapters", f)) : [];
if (existsSync(tplDir)) pageFiles.push(...readdirSync(tplDir).filter((f) => f.endsWith(".html")).map((f) => join(tplDir, f)));

const pages = pageFiles.map((p) => {
  const txt = readText(p);
  return { path: p, txt, ids: extractIds(txt), refs: extractRefs(txt) };
});

// ============================================================
// 1. links & anchors
// ============================================================
function resolveTarget(fromPage, href) {
  if (/^(https?:)?\/\//i.test(href) || href.startsWith("mailto:")) return null; // external, checked separately
  const [path, hash] = href.split("#");
  let baseDir = dirname(fromPage);
  let target = null;
  if (path === "") target = fromPage;
  else target = resolve(baseDir, decodeURIComponent(path));
  return { target, hash };
}

const externalRefs = [];
const ROLLOUT = new Set(["bioviz.html", "bioinfo.html", "clinic.html", "stats-nav.html",
  "triage.html", "datasets.html", "project.html", "cheatsheets.html", "glossary.html",
  "sandbox.html", "about.html"].concat(TOC.map((c) => c.file.replace(/^chapters\//, ""))));
for (const pg of pages) {
  const seen = new Set();
  for (const { attr, value } of pg.refs) {
    if (!value || value.startsWith("data:")) continue;
    if (/^(https?:)?\/\//i.test(value)) { externalRefs.push(value); continue; }
    if (value.startsWith("mailto:")) continue;
    const { target, hash } = resolveTarget(pg.path, value);
    if (target && !existsSync(target)) {
      const leaf = decodeURIComponent(value.split("#")[0]).split("/").pop().toLowerCase();
      if (ROLLOUT.has(leaf)) warn(pg.path, `link to not-yet-built page: ${value}`);
      else err(pg.path, `broken ${attr} -> ${value}`);
      continue;
    }
    if (hash) {
      const tp = target === pg.path ? pg : pages.find((x) => x.path === target);
      if (tp && !tp.ids.has(hash)) err(pg.path, `broken anchor #${hash} in ${value}`);
    }
    const key = attr + ":" + value;
    if (seen.has(key)) continue;
    seen.add(key);
  }
  // duplicate ids
  const all = [...pg.txt.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dup = all.filter((x, i) => all.indexOf(x) !== i);
  if (dup.length) err(pg.path, `duplicate ids: ${[...new Set(dup)].join(", ")}`);
}
ok(`links & anchors checked over ${pages.length} pages`);

// ============================================================
// 2. code blocks: escaping, pairs, scripts, expected files
// ============================================================
const exDir = join(root, "tools", "examples");
for (const pg of pages) {
  // unescaped < and > inside <pre><code> (entities allowed)
  for (const m of pg.txt.matchAll(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/g)) {
    const body = m[1];
    const bad = body.replace(/&(?:amp|lt|gt|quot|#39);/g, "");
    if (/[<>]|&(?!amp;|lt;|gt;|quot;|#39;)/.test(bad)) {
      err(pg.path, `unescaped <, > or & inside pre>code near: ${body.slice(0, 60).replace(/\n/g, " ")}...`);
    }
  }
  const examples = extractExamples(pg.txt, pg.path);
  const outputs = extractOutputs(pg.txt, pg.path);
  const outById = new Map(outputs.map((o) => [o.id, o]));
  for (const ex of examples) {
    if (!outById.has(ex.id)) err(pg.path, `data-example="${ex.id}" has no matching output block`);
    const script = join(exDir, ex.id + ".R");
    if (!existsSync(script)) err(pg.path, `data-example="${ex.id}" has no tools/examples/${ex.id}.R`);
    if (!existsSync(join(exDir, "expected", ex.id + ".txt")))
      err(pg.path, `data-example="${ex.id}" has no expected output (run render-examples.R)`);
  }
  for (const o of outputs) {
    if (!examples.some((e) => e.id === o.id)) err(pg.path, `output block for "${o.id}" has no code card on the page`);
  }
  // JSON blocks
  for (const cls of ["ex-steps", "quiz-data", "explainer-data"]) {
    for (const j of extractJsonBlocks(pg.txt, cls)) {
      if (j.__error) err(pg.path, `invalid JSON in script.${cls}: ${j.__error}`);
    }
  }
  // images
  const imgs = [...pg.txt.matchAll(/<img[^>]*>/g)].map((m) => m[0]);
  imgs.forEach((tag, i) => {
    const alt = /alt="([^"]*)"/.exec(tag);
    const src = /src="([^"]*)"/.exec(tag);
    if (!alt || !alt[1].trim()) err(pg.path, `img missing alt: ${src ? src[1] : "?"}`);
    else if (/\.(svg|png|jpg|pdf)$/i.test(alt[1])) err(pg.path, `img alt is a filename: ${alt[1]}`);
    if (!/width="/.test(tag) || !/height="/.test(tag)) err(pg.path, `img missing width/height: ${src ? src[1] : "?"}`);
    if (i === 0 && /loading="lazy"/.test(tag)) err(pg.path, "first image must not be lazy");
  });
  // quiz source
  const ds = pg.txt.match(/<section class="quiz" data-source="([^"]+)"/);
  const bodyCh = pg.txt.match(/<body[^>]*data-page="chapter"[^>]*data-chapter="([^"]+)"/);
  if (ds && bodyCh && ds[1] !== bodyCh[1]) err(pg.path, `quiz data-source "${ds[1]}" != chapter "${bodyCh[1]}"`);
}
ok("code blocks, JSON blocks, images checked");

// ============================================================
// 3. chapter structure (13 required blocks; template exempt)
// ============================================================
const REQUIRED = [
  ["crumbs", /class="crumbs"/],
  ["cover question", /cover-question/],
  ["objectives", /class="card objectives"/],
  ["research context", /class="research"/],
  ["research task", /class="research-task"/],
  ["error card", /class="danger error-card"/],
  ["stats callout", /<div class="stats">/],
  ["methods sentence", /methods-sentence/],
  ["keypoint", /class="keypoint"/],
  ["checklist", /class="checklist"/],
  ["quiz", /class="quiz" data-source=/],
  ["research log", /class="research-log"/],
  ["further", /class="further"/]
];
for (const pg of pages) {
  const m = pg.txt.match(/<body[^>]*data-page="chapter"[^>]*data-chapter="([^"]+)"/);
  if (!m) continue;
  if (m[1] === "ch00") continue; // template exempt from content completeness
  for (const [label, re] of REQUIRED) {
    if (!re.test(pg.txt)) err(pg.path, `chapter block missing: ${label}`);
  }
}
ok("chapter structure checked");

// ============================================================
// 4. data contracts
// ============================================================
const tocIds = new Set();
for (const c of TOC) {
  if (tocIds.has(c.id)) err(dataDir, `duplicate chapter id ${c.id}`);
  tocIds.add(c.id);
  const f = join(root, c.file);
  if (!existsSync(f)) warn(dataDir, `COURSE_TOC file not yet written: ${c.file}`);
  if (!["I", "II", "III", "IV"].includes(c.part)) err(dataDir, `${c.id}: bad part ${c.part}`);
  if (!Array.isArray(c.prereq) || c.prereq.some((p) => !tocIsKnown(p, TOC))) {
    // prereq validated after full pass; defer
  }
  for (const d of c.dataset || []) {
    if (!DATASETS.some((x) => x.id === d)) err(dataDir, `${c.id}: unknown dataset id ${d}`);
  }
  const script = join(root, "assets", "scripts", c.id + ".R");
  if (!existsSync(script)) err(dataDir, `missing chapter script ${c.id}.R (run build-chapter-scripts.mjs)`);
}
function tocIsKnown(p, toc) { return toc.some((c) => c.id === p); }
for (const c of TOC) {
  for (const p of c.prereq || []) {
    if (!tocIds.has(p)) err(dataDir, `${c.id}: unknown prereq ${p}`);
  }
}
const dsIds = new Set(DATASETS.map((d) => d.id));
if (new Set(dsIds).size !== DATASETS.length) err(dataDir, "duplicate dataset ids");
for (const s of SPECIALS) {
  if (!existsSync(join(root, s.file))) warn(dataDir, `special page not yet built: ${s.file}`);
}
ok(`data contracts: ${TOC.length} chapters, ${SPECIALS.length} specials, ${DATASETS.length} datasets`);

// ============================================================
// 5. figure manifest
// ============================================================
const manPath = join(root, "assets", "figures", "manifest.json");
if (!existsSync(manPath)) err(manPath, "manifest.json missing (run render-figures.R)");
else {
  const man = JSON.parse(readText(manPath));
  for (const f of man.figures || []) {
    const svgP = join(root, f.svg);
    const pdfP = join(root, f.pdf);
    if (!existsSync(svgP)) err(manPath, `svg missing: ${f.svg}`);
    if (!existsSync(pdfP)) err(manPath, `pdf missing: ${f.pdf}`);
    const alts = [...f.alt.matchAll(/[\u4e00-\u9fffA-Za-z0-9]/g)].length;
    if (alts < 40 || alts > 160) err(manPath, `${f.id}: alt length ${alts} outside 40..160`);
    if (!/图 ?\d/.test(f.caption)) err(manPath, `${f.id}: caption missing figure number`);
    if (!/n ?=/.test(f.caption)) err(manPath, `${f.id}: caption missing n`);
    if (existsSync(svgP)) {
      const sha = createHash("sha256").update(readFileSync(svgP)).digest("hex");
      if (sha !== f.sha256) err(manPath, `${f.id}: svg sha256 mismatch (re-run render-figures.R)`);
      const kb = statSync(svgP).size / 1024;
      if (kb > 150) err(manPath, `${f.id}: svg ${kb.toFixed(0)}KB over 150KB budget`);
    }
    // every referenced figure exists in manifest
    const refs = [...pages.map((p) => p.txt).join("\n").matchAll(/data-figure="([^"]+)"/g)].map((m) => m[1]);
    for (const r of refs) {
      if (!man.figures.some((x) => x.id === r)) err(manPath, `page references unregistered figure "${r}"`);
    }
  }
  ok(`figure manifest: ${(man.figures || []).length} figures verified`);
}

// ============================================================
// 6. data manifest (rows/cols/sha256 vs actual files)
// ============================================================
const dmanPath = join(root, "assets", "data", "data-manifest.json");
if (!existsSync(dmanPath)) err(dmanPath, "data-manifest.json missing");
else {
  const dman = JSON.parse(readText(dmanPath));
  for (const f of dman.files || []) {
    const p = join(root, "assets", "data", f.file);
    if (!existsSync(p)) { err(dmanPath, `data file missing: ${f.file}`); continue; }
    const sha = createHash("sha256").update(readFileSync(p)).digest("hex");
    if (sha !== f.sha256) err(dmanPath, `${f.file}: sha256 mismatch (re-run generate-data.R + validate-data.R)`);
    if (!/xlsx$/.test(f.file)) {
      let rows = parseCsv(readText(p)).length - 1;
      if (f.file === "plate_reader_raw.csv") rows -= 3;
      if (String(rows) !== String(f.rows)) err(dmanPath, `${f.file}: manifest rows ${f.rows} != actual ${rows}`);
    }
  }
  ok("data manifest verified");
}

// ============================================================
// 7. search index freshness
// ============================================================
const metaPath = join(dataDir, "search-index.meta.json");
if (!existsSync(join(dataDir, "search-index.js"))) err(dataDir, "search-index.js missing (run build-search-index.mjs)");
else if (!existsSync(metaPath)) err(dataDir, "search-index.meta.json missing");
else {
  const meta = JSON.parse(readText(metaPath));
  for (const s of meta.sources || []) {
    const p = join(dataDir, s.file);
    if (!existsSync(p)) { err(metaPath, `stale source ${s.file}`); continue; }
    const h = createHash("sha256").update(readFileSync(p)).digest("hex").slice(0, 16);
    if (h !== s.hash) err(metaPath, `search index stale for ${s.file} (re-run build-search-index.mjs)`);
  }
  ok("search index fresh");
}

// ============================================================
// 8. JS syntax + forbidden runtime patterns
// ============================================================
const jsDir = join(root, "assets", "js");
const jsFiles = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f.endsWith(".js")) jsFiles.push(p);
  }
})(jsDir);
for (const p of jsFiles) {
  const r = spawnSync(process.execPath, ["--check", p], { encoding: "utf8" });
  if (r.status !== 0) err(p, `JS syntax: ${r.stderr}`);
  const txt = readText(p);
  for (const bad of ["fetch(", "XMLHttpRequest", "import(", "eval("]) {
    if (txt.includes(bad)) err(p, `forbidden runtime pattern: ${bad}`);
  }
  if (/https?:\/\//.test(txt)) err(p, "absolute URL in runtime JS (breaks offline/file://)");
}
ok(`${jsFiles.length} JS files syntax-checked, offline rules enforced`);

// ============================================================
// 9. CSS: hex colors only in tokens.css
// ============================================================
const cssDir = join(root, "assets", "css");
for (const f of readdirSync(cssDir).filter((x) => x.endsWith(".css"))) {
  const p = join(cssDir, f);
  if (f === "tokens.css") continue;
  const hexes = [...readText(p).matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0]);
  if (hexes.length) err(p, `hex colors outside tokens.css: ${[...new Set(hexes)].join(", ")}`);
}
ok("CSS token discipline checked");

// ============================================================
// 10. completeness (warnings until 1.0 scope is reached)
// ============================================================
const CHEAT_N = (window_.BIOR_CHEATSHEETS || []).length;
if (CHEAT_N < 36) warn(dataDir, `cheatsheets: ${CHEAT_N}/36 (P0-P3 rollout)`);
const realChapters = chapterFiles.length;
if (realChapters < 18) warn(root, `chapters: ${realChapters}/18 written`);
if ((window_.BIOR_TRIAGE || { errors: [] }).errors.length < 40) warn(dataDir, "triage errors < 40 (Phase 3)");
for (const f of ["bioviz.html", "bioinfo.html", "clinic.html", "stats-nav.html", "triage.html", "datasets.html", "project.html", "cheatsheets.html", "glossary.html"]) {
  if (!existsSync(join(root, f))) warn(root, `page not built yet: ${f}`);
}

// ============================================================
// summary
// ============================================================
console.log("—".repeat(50));
console.log(`validate: ${errors} error(s), ${warnings} warning(s)`);
if (externalRefs.length) console.log(`(external refs found, none fetched: ${[...new Set(externalRefs)].length})`);
process.exit(errors > 0 ? 1 : 0);
