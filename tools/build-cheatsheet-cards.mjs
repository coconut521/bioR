/* ============================================================
 * build-cheatsheet-cards.mjs — renders window.BIOR_CHEATSHEETS into
 * static card HTML inside cheatsheets.html (between markers), using
 * the same R tokenizer as the browser. Static HTML keeps anchors,
 * print layout and no-JS readability; JS only filters/copies.
 * Run: node tools/build-cheatsheet-cards.mjs
 * ============================================================ */
import fs from "node:fs";
import vm from "node:vm";

const root = process.cwd();
const dataTxt = fs.readFileSync(`${root}/assets/js/data/cheatsheets-data.js`, "utf8");
const hlTxt = fs.readFileSync(`${root}/assets/js/highlight-r.js`, "utf8");
const tocTxt = fs.readFileSync(`${root}/assets/js/data/course-toc.js`, "utf8");

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(hlTxt, sandbox);
vm.runInContext(tocTxt, sandbox);
vm.runInContext(dataTxt, sandbox);
const SHEETS = sandbox.window.BIOR_CHEATSHEETS || [];
const TOC = sandbox.window.COURSE_TOC || [];
const highlightR = sandbox.window.BIOR.highlightR;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const decodeEnt = (s) => String(s)
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
/* text fields are stored entity-encoded (same as table cells):
   decode once, then escape for safe plain-text output */
const txt = (s) => esc(decodeEnt(s == null ? "" : s));

const CAT_ORDER = ["基础语法", "数据处理", "导入与路径", "可视化", "统计建模", "科研工具", "生物信息"];
const sortKey = (s) => CAT_ORDER.indexOf(s.category);

function tableHtml(header, rows) {
  return '<div class="table-wrap"><table class="data-table">' +
    "<thead><tr>" + (header || []).map((h) => `<th scope="col">${esc(h)}</th>`).join("") + "</tr></thead>" +
    "<tbody>" +
    (rows || []).map((r) => "<tr>" + r.map((c) => `<td>${c}</td>`).join("") + "</tr>").join("") +
    "</tbody></table></div>";
}

function codeHtml(code) {
  const raw = decodeEnt(code);
  // static HTML keeps only escaped source text; the page script
  // highlights it at load via window.BIOR.highlightR (validator
  // requires no raw markup inside pre>code).
  return `<pre class="ex-code cc-code"><code class="r">${esc(raw)}</code></pre>`;
}

function decisionHtml(s) {
  return '<ol class="small" style="margin:0 0 10px;padding-left:20px">' +
    s.steps.map((x) => `<li>${txt(x)}</li>`).join("") + "</ol>" +
    (s.header && s.rows && s.rows.length ? tableHtml(s.header, s.rows) : "");
}

function cardHtml(s) {
  const body =
    s.type === "code" && s.code ? codeHtml(s.code)
      : s.type === "decision" ? decisionHtml(s)
        : tableHtml(s.header, s.rows);
  const notes = (s.notes && s.notes.length)
    ? '<ul class="cc-notes">' + s.notes.map((n) => `<li>${txt(n)}</li>`).join("") + "</ul>"
    : "";
  const chapters = (s.chapters || []).map((c) => {
    const t = TOC.filter((x) => x.id === c)[0];
    return `<a href="${t ? t.file : "index.html#route"}">${c.toUpperCase()}</a>`;
  }).join("");
  const tag = s.type === "code" ? "代码" : s.type === "decision" ? "决策流" : "表格";
  return `<article class="cheat-card" id="${s.id}" data-cat="${txt(s.category)}" data-research="${s.research ? 1 : 0}">
  <div class="cc-head"><span class="tag">${txt(s.category)}</span><span class="tag blue">${tag}</span>${s.research ? '<span class="tag green">RESEARCH TOOL</span>' : ""}
    <h3>${txt(s.title)}</h3>
    <p class="cc-desc">${txt(s.desc)}</p>
  </div>
  <div class="cc-body">${body}</div>
  ${notes}
  <div class="cc-foot">
    <button type="button" class="btn" data-copy="${s.id}">复制${s.type === "code" ? "代码" : "表格"}</button>
    <span class="cc-chapters">${chapters}</span>
    <span class="cc-tip">${esc(s.tip || "")}</span>
  </div>
</article>`;
}

const cards = SHEETS.slice().sort((a, b) => sortKey(a) - sortKey(b)).map(cardHtml).join("\n\n");
const pagePath = `${root}/cheatsheets.html`;
let page = fs.readFileSync(pagePath, "utf8");
const START = "<!-- CHEAT_CARDS_START -->";
const END = "<!-- CHEAT_CARDS_END -->";
if (!page.includes(START) || !page.includes(END)) {
  console.error("markers missing in cheatsheets.html");
  process.exit(1);
}
page = page.slice(0, page.indexOf(START) + START.length) + "\n" + cards + "\n" + page.slice(page.indexOf(END));
fs.writeFileSync(pagePath, page, "utf8");
console.log(`build-cheatsheet-cards: ${SHEETS.length} cards written (${cards.length} bytes)`);
