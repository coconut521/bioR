/* ============================================================
 * build-clinic-cards.mjs — renders window.BIOR_CLINIC into static
 * case cards and red-flag questions inside clinic.html. Static HTML
 * keeps anchors, printing and no-JS readability; clinic.js only
 * filters and runs the screener.
 * Run: node tools/build-clinic-cards.mjs
 * ============================================================ */
import fs from "node:fs";
import vm from "node:vm";

const root = process.cwd();
const sandbox = { window: {} };
vm.createContext(sandbox);
for (const f of [
  "assets/js/data/course-toc.js",
  "assets/js/data/cheatsheets-data.js",
  "assets/js/data/clinic-data.js"
]) vm.runInContext(fs.readFileSync(`${root}/${f}`, "utf8"), sandbox);

const CLINIC = sandbox.window.BIOR_CLINIC;
const TOC = sandbox.window.COURSE_TOC || [];
const SHEETS = sandbox.window.BIOR_CHEATSHEETS || [];
if (!CLINIC) {
  console.error("BIOR_CLINIC missing");
  process.exit(1);
}

const esc = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const CAT = { design: "设计", stats: "统计", viz: "可视化", repro: "可复现", omics: "组学" };

function chapterLinks(ids) {
  return (ids || []).map((id) => {
    const c = TOC.filter((x) => x.id === id)[0];
    return c ? `<a href="${c.file}">${c.id} · ${esc(c.short)}</a>` : "";
  }).join("");
}
function sheetLinks(ids) {
  return (ids || []).map((id) => {
    const s = SHEETS.filter((x) => x.id === id)[0];
    return s ? `<a class="sheet-link" href="cheatsheets.html#${id}">速查 · ${esc(s.title)}</a>` : "";
  }).join("");
}

function cardHtml(c, i) {
  const num = String(i + 1).padStart(2, "0");
  const rx = (c.prescription || []).map((x) => `<li>${esc(x)}</li>`).join("");
  return `<article class="clinic-card" id="case-${c.id}" data-cat="${esc(c.category)}">
  <div class="cl-head">
    <span class="tag">${CAT[c.category] || esc(c.category)}</span>
    <span class="tag blue">CASE ${num}</span>
    <h3>${esc(c.title)}</h3>
  </div>
  <dl class="cl-rows">
    <dt>症状</dt><dd>${esc(c.symptom)}</dd>
    <dt class="red">红旗</dt><dd class="red-flag">${esc(c.red_flag)}</dd>
    <dt>诊断</dt><dd>${esc(c.diagnosis)}</dd>
    <dt>处方</dt><dd><ol class="cl-rx-list">${rx}</ol></dd>
  </dl>
  <div class="cl-code">
    <div class="cl-label">R 修复</div>
    <pre class="ex-code"><code class="r">${esc(c.r_fix)}</code></pre>
  </div>
  <div class="cl-foot">
    <p class="cl-prevent"><b>预防</b>${esc(c.prevention)}</p>
    <div class="cl-links">${chapterLinks(c.chapters)}${sheetLinks(c.cheatsheets)}</div>
  </div>
</article>`;
}

function flagHtml(f, i) {
  return `<div class="flag-card" data-cases="${esc((f.cases || []).join(","))}">
  <h3><span>${i + 1}</span>${esc(f.question)}</h3>
  <div class="flag-opts" role="group" aria-label="${esc(f.question)}">
    <button type="button" class="flag-btn" data-val="yes" aria-pressed="false">是</button>
    <button type="button" class="flag-btn" data-val="no" aria-pressed="false">否</button>
    <button type="button" class="flag-btn" data-val="unsure" aria-pressed="false">不确定</button>
  </div>
</div>`;
}

const cases = CLINIC.cases.map(cardHtml).join("\n\n");
const flags = CLINIC.redFlags.map(flagHtml).join("\n\n");

function inject(page, start, end, body, label) {
  const p = `${root}/${page}`;
  let html = fs.readFileSync(p, "utf8");
  if (!html.includes(start) || !html.includes(end)) {
    console.error(`markers missing in ${page}: ${label}`);
    process.exit(1);
  }
  html = html.slice(0, html.indexOf(start) + start.length) + "\n" + body + "\n" +
    html.slice(html.indexOf(end));
  fs.writeFileSync(p, html, "utf8");
}

inject("clinic.html", "<!-- CLINIC_CASES_START -->", "<!-- CLINIC_CASES_END -->", cases, "cases");
inject("clinic.html", "<!-- CLINIC_FLAGS_START -->", "<!-- CLINIC_FLAGS_END -->", flags, "flags");
console.log(`build-clinic-cards: ${CLINIC.cases.length} cases, ${CLINIC.redFlags.length} flags written`);
