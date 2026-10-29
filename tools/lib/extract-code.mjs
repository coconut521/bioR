// ============================================================
// lib/extract-code.mjs — shared HTML/CSV extraction helpers for the
// bioR build pipeline (validate.mjs, build-* scripts). No deps.
// ============================================================
import { readFileSync } from "node:fs";

export function readText(p) {
  return readFileSync(p, "utf8");
}

function unescapeHtml(s) {
  return s
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

export function normLines(arr) {
  const out = arr.map((l) => l.replace(/[ \t]+$/, ""));
  while (out.length && out[0] === "") out.shift();
  while (out.length && out[out.length - 1] === "") out.pop();
  return out;
}

/** pre.ex-code[data-example] -> [{ id, page, code }] */
export function extractExamples(txt, page) {
  const re = /<pre class="ex-code" data-example="([^"]+)"><code class="r">([\s\S]*?)<\/code><\/pre>/g;
  const out = [];
  let m;
  while ((m = re.exec(txt))) {
    out.push({ id: m[1], page, code: normLines(unescapeHtml(m[2]).split("\n")) });
  }
  return out;
}

/** output blocks -> [{ id, lines }] — id from the enclosing ex-output's data-output-for */
export function extractOutputs(txt, page) {
  const out = [];
  const re = /data-output-for="([^"]+)"/g;
  let m;
  while ((m = re.exec(txt))) {
    const next = txt.indexOf('data-output-for', m.index + 10);
    const seg = txt.slice(m.index, next === -1 ? txt.length : next);
    const code = /<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/.exec(seg);
    if (code) out.push({ id: m[1], page, lines: normLines(unescapeHtml(code[1]).split("\n")) });
  }
  return out;
}

/** <script type="application/json" class="CLS">{...}</script> -> parsed */
export function extractJsonBlocks(txt, cls) {
  const re = new RegExp(`<script type="application/json" class="${cls}">([\\s\\S]*?)</script>`, "g");
  const out = [];
  let m;
  while ((m = re.exec(txt))) {
    try {
      out.push(JSON.parse(m[1]));
    } catch (e) {
      out.push({ __error: String(e) });
    }
  }
  return out;
}

export function extractIds(txt) {
  const set = new Set();
  const re = / id="([^"]+)"/g;
  let m;
  while ((m = re.exec(txt))) set.add(m[1]);
  return set;
}

export function extractRefs(txt) {
  // [attr href/src] links & resources, relative or same-page anchors
  const refs = [];
  const re = /\s(href|src)="([^"]*)"/g;
  let m;
  while ((m = re.exec(txt))) refs.push({ attr: m[1], value: m[2] });
  return refs;
}

/** minimal CSV parser: quotes, escaped quotes, CRLF */
export function parseCsv(text) {
  const rows = [];
  let row = [], field = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQ = false;
      } else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

export function firstDiff(a, b) {
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) {
    const x = i < a.length ? a[i] : "<missing>";
    const y = i < b.length ? b[i] : "<missing>";
    if (x !== y) return `line ${i + 1}:\n  html: ${x}\n  src : ${y}`;
  }
  return "length mismatch";
}
