#!/usr/bin/env node
/*
 * Browser audit for bioR: loads every page in headless Chrome at desktop
 * and mobile widths, records runtime errors, failed requests, broken
 * images, document-level overflow, content-count expectations, and
 * viewport screenshots. Read-only: it never writes into the site.
 *
 * Usage: node tools/audit-browser.mjs [outputDir]
 * Env: CHROME_PATH (optional), BIOR_BASE (default http://127.0.0.1:8765)
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE = process.env.BIOR_BASE || "http://127.0.0.1:8765";
const CHROME = process.env.CHROME_PATH ||
  "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUT = path.resolve(process.argv[2] || path.join(os.tmpdir(), "bior-audit"));
const PORT = 9337;
const WIDTHS = [
  { name: "desktop", width: 1440, height: 1000, mobile: false },
  { name: "mobile", width: 390, height: 844, mobile: true },
];

const ROOT_PAGES = [
  "index.html", "cheatsheets.html", "datasets.html", "bioviz.html",
  "stats-nav.html", "project.html", "bioinfo.html", "clinic.html",
  "triage.html", "glossary.html", "about.html",
];
const CHAPTERS = fs.readdirSync(path.join(process.cwd(), "chapters"))
  .filter((f) => f.endsWith(".html")).sort()
  .map((f) => "chapters/" + f);

const EXPECT = {
  "index.html": [[".route-chapter", 18]],
  "cheatsheets.html": [[".cheat-card", 36]],
  "datasets.html": [[".ds-card", 9]],
  "bioviz.html": [[".viz-card", 9]],
  "bioinfo.html": [["#wf-tabs .filter-chip", 6]],
  "clinic.html": [[".clinic-card", 14]],
  "triage.html": [[".triage-card", 50]],
  "glossary.html": [[".term-card", 22]],
};
const EXAMPLES = { "ch01-setup.html": 6, "ch02-vectors.html": 6 };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function launchChrome() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "bior-chrome-"));
  const args = [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    "--remote-allow-origins=*",
    `--user-data-dir=${profile}`,
    "--no-first-run", "--no-default-browser-check",
    "--disable-background-networking", "--disable-component-update",
    "--disable-extensions", "--disable-sync", "--disable-translate",
    "--metrics-recording-only", "--mute-audio",
    "--window-size=1440,1000",
    "about:blank",
  ];
  const proc = spawn(CHROME, args, { stdio: "ignore" });
  return { proc, profile };
}

async function waitForTarget() {
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const list = await res.json();
      const page = list.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
      if (page) return page;
    } catch { /* chrome not ready */ }
    await sleep(200);
  }
  throw new Error("Chrome DevTools target did not appear");
}

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    const pending = new Map();
    const events = new Map();
    let seq = 0;
    ws.onopen = () => resolve({ ws, send, once });
    ws.onerror = reject;
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) {
        const { resolve: ok, reject: bad } = pending.get(msg.id);
        pending.delete(msg.id);
        msg.error ? bad(new Error(msg.error.message)) : ok(msg.result);
      } else if (msg.method && events.has(msg.method)) {
        for (const fn of events.get(msg.method)) fn(msg.params);
      }
    };
    function send(method, params = {}) {
      const id = ++seq;
      ws.send(JSON.stringify({ id, method, params }));
      return new Promise((ok, bad) => pending.set(id, { resolve: ok, reject: bad }));
    }
    function once(method, timeout = 7000) {
      return new Promise((ok, bad) => {
        const fn = (params) => { cleanup(); ok(params); };
        const timer = setTimeout(() => { cleanup(); bad(new Error("timeout " + method)); }, timeout);
        const cleanup = () => {
          clearTimeout(timer);
          const set = events.get(method);
          if (set) set.delete(fn);
        };
        if (!events.has(method)) events.set(method, new Set());
        events.get(method).add(fn);
      });
    }
  });
}

const AUDIT_EXPR = `(async function () {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  document.documentElement.style.scrollBehavior = "auto";

  // Walk past lazy-loaded images so every <img> has a chance to decode.
  const allImages = Array.from(document.images);
  for (const im of allImages) {
    im.loading = "eager";
    const r = im.getBoundingClientRect();
    if (r.top > window.innerHeight * 0.8 || r.bottom < 0) {
      im.scrollIntoView({ block: "center" });
      await wait(90);
    }
  }
  const pending = allImages.filter((im) => !im.complete);
  if (pending.length) {
    await Promise.race([
      Promise.all(pending.map((im) => new Promise((res) => {
        im.addEventListener("load", res, { once: true });
        im.addEventListener("error", res, { once: true });
      }))),
      wait(2500),
    ]);
  }
  await wait(200);
  window.scrollTo(0, 0);
  await wait(300);

  const de = document.documentElement;
  const inner = window.innerWidth;
  const overflow = de.scrollWidth - inner;
  const overEls = overflow > 1 ? Array.from(document.querySelectorAll("main *"))
    .filter((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      if (cs.position === "fixed" || cs.display === "none" || cs.visibility === "hidden") return false;
      if (el.closest(".pipe-wrap, .table-wrap, .code-scroll, pre")) return false;
      return r.width > 0 && (r.right > inner + 1 || r.left < -1);
    })
    .slice(0, 8)
    .map((el) => {
      const r = el.getBoundingClientRect();
      return (el.tagName.toLowerCase() + "." + String(el.className || "").split(" ").filter(Boolean).slice(0, 2).join(".") +
        " [" + Math.round(r.left) + "," + Math.round(r.right) + "]").slice(0, 100);
    }) : [];

  const images = Array.from(document.images);
  const broken = images.filter((im) => !im.complete || im.naturalWidth === 0)
    .map((im) => im.getAttribute("src"));

  const namelessButtons = Array.from(document.querySelectorAll("button"))
    .filter((b) => !b.textContent.trim() && !b.getAttribute("aria-label") && !b.title)
    .map((b) => b.id || b.className || "button");

  const emptyLinks = Array.from(document.querySelectorAll("a"))
    .filter((a) => !a.getAttribute("href") || a.getAttribute("href").trim() === "#")
    .map((a) => (a.textContent || "").trim().slice(0, 40));

  const g = window;
  const globals = ["COURSE_TOC", "BIOR_SPECIALS", "BIOR_CHEATSHEETS", "BIOR_DATASETS",
    "BIOR_DELIVERABLES", "BIOR_TRIAGE", "BIOR_CLINIC", "BIOR_BIOINFO", "BIOR_GLOSSARY",
    "BIOR_CONFIG", "BIOR_DISC", "BIOR_SEARCH_INDEX"].filter((k) => g[k] != null);

  return {
    title: document.title,
    h1: Array.from(document.querySelectorAll("h1")).map((h) => h.textContent.trim()),
    main: document.querySelectorAll("main").length,
    bodyText: document.body.innerText.trim().length,
    viewport: inner + "x" + window.innerHeight,
    docWidth: de.scrollWidth,
    bodyHeight: document.body.scrollHeight,
    overflow,
    overEls,
    brokenImages: broken,
    images: images.length,
    figImages: document.querySelectorAll("figure img").length,
    examples: document.querySelectorAll(".example-card").length,
    outputs: document.querySelectorAll("[data-output-for]").length,
    namelessButtons,
    emptyLinks,
    globals,
    fonts: document.fonts ? document.fonts.status : "n/a",
    counts: {
      routeChapter: document.querySelectorAll(".route-chapter").length,
      cheatCard: document.querySelectorAll(".cheat-card").length,
      dsCard: document.querySelectorAll(".ds-card").length,
      vizCard: document.querySelectorAll(".viz-card").length,
      clinicCard: document.querySelectorAll(".clinic-card").length,
      triageCard: document.querySelectorAll(".triage-card").length,
      termCard: document.querySelectorAll(".term-card").length,
      wfTabs: document.querySelectorAll("#wf-tabs .filter-chip").length,
      routeNodes: document.querySelectorAll("#route .route-node").length,
    },
  };
})()`;

function countIssues(page, r, errors) {
  const issues = [];
  for (const [sel, want] of EXPECT[page] || []) {
    const got = sel === ".route-chapter" ? r.counts.routeChapter
      : sel === ".cheat-card" ? r.counts.cheatCard
      : sel === ".ds-card" ? r.counts.dsCard
      : sel === ".viz-card" ? r.counts.vizCard
      : sel === ".clinic-card" ? r.counts.clinicCard
      : sel === ".triage-card" ? r.counts.triageCard
      : sel === ".term-card" ? r.counts.termCard
      : sel === "#wf-tabs .filter-chip" ? r.counts.wfTabs : -1;
    if (got !== want) issues.push(`${sel} 期望 ${want}，实际 ${got}`);
  }
  const base = page.split("/").pop();
  if (page.startsWith("chapters/")) {
    const want = EXAMPLES[base] || 5;
    if (r.examples !== want) issues.push(`示例期望 ${want}，实际 ${r.examples}`);
    if (r.outputs !== r.examples) issues.push(`示例 ${r.examples} / 输出 ${r.outputs} 不配对`);
  }
  if (page === "bioinfo.html") {
    const nodes = globalThis.__bioinfoNodeExpectation;
    if (nodes && r.counts.routeNodes !== nodes) {
      issues.push(`航线节点期望 ${nodes}，实际 ${r.counts.routeNodes}`);
    }
  }
  if (!r.title) issues.push("标题为空");
  if (r.h1.length !== 1) issues.push(`h1 数量 ${r.h1.length}`);
  if (r.main !== 1) issues.push(`main 数量 ${r.main}`);
  if (r.bodyText < 500) issues.push(`正文过短 ${r.bodyText}`);
  if (r.overflow > 1) issues.push(`文档横向溢出 ${r.overflow}px ${r.overEls.join(" | ")}`);
  if (r.brokenImages.length) issues.push(`破图 ${r.brokenImages.join(", ")}`);
  if (r.namelessButtons.length) issues.push(`无名按钮 ${r.namelessButtons.join(", ")}`);
  if (r.emptyLinks.length) issues.push(`空链接 ${r.emptyLinks.length} 个`);
  if (errors.length) issues.push(`运行时错误 ${errors.length}: ` + errors.slice(0, 4).join(" | "));
  return issues;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const { proc, profile } = launchChrome();
  let ws;
  try {
    const target = await waitForTarget();
    const conn = await connect(target.webSocketDebuggerUrl);
    ws = conn.ws;
    const { send, once } = conn;
    await send("Page.enable");
    await send("Runtime.enable");
    await send("Log.enable");
    await send("Network.enable");
    await send("Network.setCacheDisabled", { cacheDisabled: true });

    const runtimeErrors = [];
    let collecting = false;
    const clear = () => { runtimeErrors.length = 0; collecting = true; };
    const addErr = (kind, text) => {
      if (!collecting) return;
      if (!text || /favicon\.ico/.test(text)) return;
      runtimeErrors.push(`${kind}: ${String(text).replace(/\s+/g, " ").slice(0, 260)}`);
    };
    conn.ws.addEventListener ?? null;
    // Attach protocol event listeners through the same message dispatcher.
    // connect() exposes only send/once, so subscribe via a small helper:
    const onEvent = (method, fn) => {
      // Re-create a listener in the event map by using a no-op once pattern is
      // not suitable for repeated events; use the protocol socket directly.
      // The dispatcher supports events registered through `subscribe`.
      subscribe(method, fn);
    };
    // `subscribe` is defined by patching the connection object below.
    // (Kept local so the audit script stays dependency-free.)
    function subscribe(method, fn) {
      if (!subscribe.map.has(method)) subscribe.map.set(method, new Set());
      subscribe.map.get(method).add(fn);
    }
    subscribe.map = new Map();
    // Replace the WebSocket dispatcher's event lookup with our map.
    ws.onmessage = ((orig) => (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.method && subscribe.map.has(msg.method)) {
        for (const fn of subscribe.map.get(msg.method)) fn(msg.params);
      }
      orig(ev);
    })(ws.onmessage);

    onEvent("Runtime.exceptionThrown", (p) => {
      const d = p.exceptionDetails || {};
      addErr("exception", d.exception?.description || d.text || "unknown");
    });
    onEvent("Runtime.consoleAPICalled", (p) => {
      if (p.type !== "error" && p.type !== "assert") return;
      const text = (p.args || []).map((a) => a.value ?? a.description ?? a.type).join(" ");
      addErr("console." + p.type, text);
    });
    onEvent("Log.entryAdded", (p) => {
      const e = p.entry || {};
      if (e.level !== "error") return;
      if (/favicon\.ico/.test((e.url || "") + " " + (e.text || ""))) return;
      addErr("log", (e.text || "") + (e.url ? " " + e.url : ""));
    });
    onEvent("Network.loadingFailed", (p) => {
      if (p.canceled) return;
      addErr("network", p.errorText || "request failed");
    });
    onEvent("Network.responseReceived", (p) => {
      const r = p.response || {};
      if (r.status >= 400 && !/favicon\.ico/.test(r.url || "")) {
        addErr("http", `${r.status} ${r.url}`);
      }
    });

    const only = (process.env.BIOR_ONLY || "").split(",").map((x) => x.trim()).filter(Boolean);
    const pages = [...ROOT_PAGES, ...CHAPTERS]
      .filter((p) => !only.length || only.includes(p) || only.includes(p.split("/").pop()));
    const report = [];
    for (const vp of WIDTHS) {
      await send("Emulation.setDeviceMetricsOverride", {
        width: vp.width, height: vp.height, deviceScaleFactor: 1, mobile: vp.mobile,
      });
      const shotDir = path.join(OUT, vp.name);
      fs.mkdirSync(shotDir, { recursive: true });
      for (const page of pages) {
        const url = `${BASE}/${page}`;
        clear();
        const load = once("Page.loadEventFired", 10000);
        await send("Page.navigate", { url });
        try { await load; } catch { addErr("page", "load timeout"); }
        await sleep(650);
        let r;
        try {
          const ev = await send("Runtime.evaluate", {
            expression: AUDIT_EXPR, awaitPromise: true, returnByValue: true,
            userGesture: false,
          });
          if (ev.exceptionDetails) {
            addErr("evaluate", ev.exceptionDetails.exception?.description || ev.exceptionDetails.text);
            r = { title: "", h1: [], main: 0, bodyText: 0, viewport: "", overflow: 0,
                  overEls: [], brokenImages: [], images: 0, figImages: 0, examples: 0,
                  outputs: 0, namelessButtons: [], emptyLinks: [], globals: [], fonts: "n/a",
                  counts: {} };
          } else {
            r = ev.result.value;
          }
        } catch (e) {
          addErr("evaluate", String(e.message || e));
          r = { title: "", h1: [], main: 0, bodyText: 0, viewport: "", overflow: 0,
                overEls: [], brokenImages: [], images: 0, figImages: 0, examples: 0,
                outputs: 0, namelessButtons: [], emptyLinks: [], globals: [], fonts: "n/a",
                counts: {} };
        }
        if (page === "bioinfo.html" && r.globals.includes("BIOR_BIOINFO")) {
          // Node expectation from the page itself keeps the count data-driven.
          const ev = await send("Runtime.evaluate", {
            expression: "window.BIOR_BIOINFO.workflows[0].nodes.length",
            returnByValue: true,
          });
          globalThis.__bioinfoNodeExpectation = ev.result.value;
        }
        const errors = [...runtimeErrors];
        collecting = false;
        const issues = countIssues(page, r, errors);
        const shotName = page.replace(/[\/]/g, "_").replace(/\.html$/, "") + ".png";
        try {
          const shot = await send("Page.captureScreenshot", {
            format: "png", fromSurface: true, captureBeyondViewport: false,
          });
          fs.writeFileSync(path.join(shotDir, shotName), Buffer.from(shot.data, "base64"));
        } catch (e) {
          issues.push("截图失败: " + e.message);
        }
        report.push({
          page, viewport: vp.name, width: vp.width,
          title: r.title, overflow: r.overflow, images: r.images, examples: r.examples,
          counts: r.counts, errors, issues, shot: path.join(vp.name, shotName),
        });
        process.stdout.write(`[${vp.name}] ${page} ${issues.length ? "FAIL" : "ok"}\n`);
      }
    }
    const summary = {
      base: BASE, generated: new Date().toISOString(),
      pages: pages.length, viewports: WIDTHS.map((v) => v.name),
      failures: report.filter((x) => x.issues.length).length,
      report,
    };
    fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(summary, null, 2));
    console.log("\nAUDIT SUMMARY");
    for (const row of report) {
      if (!row.issues.length) continue;
      console.log(`\n${row.page} @ ${row.viewport} (${row.width})`);
      for (const issue of row.issues) console.log("  - " + issue);
      for (const err of row.errors.slice(0, 6)) console.log("    error: " + err);
    }
    console.log(`\n${summary.failures} failing page/viewport combinations; report: ${path.join(OUT, "report.json")}`);
    process.exitCode = summary.failures ? 1 : 0;
  } finally {
    try { if (ws) ws.close(); } catch { /* ignore */ }
    proc.kill();
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch { /* ignore */ }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
