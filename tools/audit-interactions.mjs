#!/usr/bin/env node
/*
 * Interaction smoke tests for bioR. Loads selected pages in headless
 * Chrome, performs one representative user flow per page through real
 * DOM events, and asserts the visible outcome. Read-only for the site;
 * browser storage lives in a throwaway profile.
 *
 * Usage: node tools/audit-interactions.mjs
 * Env: CHROME_PATH (optional), BIOR_BASE (default http://127.0.0.1:8765)
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE = process.env.BIOR_BASE || "http://127.0.0.1:8765";
const CHROME = process.env.CHROME_PATH ||
  "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9338;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const HELPER = `
  const out = [];
  const check = (name, cond, detail) => out.push({ name, pass: !!cond, detail: detail == null ? "" : String(detail) });
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const type = (el, value) => { el.value = value; el.dispatchEvent(new Event("input", { bubbles: true })); };
  const pick = (el, value) => { el.value = value; el.dispatchEvent(new Event("change", { bubbles: true })); };
  const visible = (sel) => Array.from(document.querySelectorAll(sel)).filter((x) => !x.hidden).length;
`;

const TESTS = {
  "index.html": `
    check("18 章路线", document.querySelectorAll(".route-chapter").length === 18);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }));
    await wait(100);
    check("Ctrl+K 打开搜索", !!document.querySelector(".palette-backdrop.open"));
    const input = document.querySelector(".palette-input");
    type(input, "DESeq2");
    await wait(400);
    const items = document.querySelectorAll(".p-item");
    check("搜索返回结果", items.length > 0, items.length);
    check("结果含 DESeq2", items.length > 0 && /DESeq2/i.test(items[0].textContent));
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await wait(60);
    check("Esc 关闭搜索", !document.querySelector(".palette-backdrop.open"));
    document.querySelector("[data-nav-drawer]").click();
    await wait(120);
    check("课程抽屉打开", !!document.querySelector(".drawer.open, .drawer[aria-hidden='false']"));
    const close = document.querySelector("[data-drawer-close]");
    if (close) close.click();
    await wait(80);
  `,

  "cheatsheets.html": `
    check("36 张卡", document.querySelectorAll(".cheat-card").length === 36);
    document.querySelector('[data-cat="生物信息"]').click();
    await wait(40);
    const bio = visible(".cheat-card");
    check("生物信息分类非空且收窄", bio > 0 && bio < 36, bio);
    check("计数随分类更新", /^\\d+ \\/ 36/.test(document.getElementById("cheat-count").textContent),
      document.getElementById("cheat-count").textContent);
    document.getElementById("cheat-reset").click();
    await wait(40);
    type(document.getElementById("cheat-q"), "DESeq2");
    await wait(80);
    const hit = visible(".cheat-card");
    check("关键词搜索命中", hit > 0 && hit < 36, hit);
    document.getElementById("cheat-reset").click();
    await wait(40);
    check("重置恢复 36 张", visible(".cheat-card") === 36 && /36 \\/ 36/.test(document.getElementById("cheat-count").textContent));
    check("空态默认隐藏", document.getElementById("cheat-empty").hidden);
  `,

  "datasets.html": `
    check("9 个教学数据集", document.querySelectorAll(".ds-card").length === 9);
    pick(document.getElementById("filter-chapter"), "ch18");
    await wait(40);
    const byCh = visible(".ds-card");
    check("按章节筛选", byCh > 0 && byCh < 9, byCh);
    document.getElementById("filter-reset").click();
    await wait(40);
    document.querySelector('[data-tab="external"]').click();
    await wait(40);
    check("外部入口隐藏教学数据", visible(".ds-card") === 0);
    check("外部卡片显示", visible(".ext-card") > 0);
    document.getElementById("filter-reset").click();
    await wait(40);
    check("重置恢复 9 个", visible(".ds-card") === 9);
    const sel = document.getElementById("dict-select");
    if (sel && sel.options.length > 1) {
      pick(sel, sel.options[1].value);
      await wait(60);
      check("数据字典渲染", document.querySelectorAll("#dict-output .dict-table tbody tr").length > 0);
    }
  `,

  "bioviz.html": `
    check("9 张配方卡", document.querySelectorAll(".viz-card").length === 9);
    document.querySelector('[data-kind="survival"]').click();
    await wait(40);
    const n = visible(".viz-card");
    check("按图型筛选", n > 0 && n < 9, n);
    check("计数更新", document.getElementById("viz-count").textContent === n + " 张配方");
    document.querySelector('[data-kind=""]').click();
    await wait(40);
    check("全部恢复", visible(".viz-card") === 9);
  `,

  "triage.html": `
    check("50 条报错", document.querySelectorAll(".triage-card").length === 50);
    check("10 类分诊", document.querySelectorAll('#tri-cats .filter-chip[data-cat]:not([data-cat=""])').length === 10,
      document.querySelectorAll('#tri-cats .filter-chip[data-cat]:not([data-cat=""])').length);
    document.querySelectorAll("#tri-cats .filter-chip[data-cat]")[1].click();
    await wait(40);
    const c = visible(".triage-card");
    check("分类筛选收窄", c > 0 && c < 50, c);
    type(document.getElementById("tri-q"), "object");
    await wait(80);
    const q = visible(".triage-card");
    check("关键词搜索命中", q > 0 && q < 50, q);
    document.getElementById("tri-reset").click();
    await wait(40);
    check("重置恢复 50 条", visible(".triage-card") === 50);
  `,

  "clinic.html": `
    check("14 个病例", document.querySelectorAll(".clinic-card").length === 14);
    document.querySelector('#clinic-cats [data-cat="design"]').click();
    await wait(40);
    const c = visible(".clinic-card");
    check("病例分类筛选", c > 0 && c < 14, c);
    check("病例计数更新", /\\d+ \\/ 14/.test(document.getElementById("clinic-count").textContent));
    document.querySelector('#clinic-cats [data-cat=""]').click();
    await wait(40);
    document.querySelectorAll(".flag-card").forEach((card) => {
      const no = card.querySelector('[data-val="no"]');
      if (no) no.click();
    });
    await wait(80);
    check("红旗体检结果出现", !document.getElementById("flag-result").hidden);
    check("体检建议非空", document.getElementById("flag-result-list").childElementCount > 0);
    document.getElementById("flag-reset").click();
    await wait(50);
    check("重新体检后结果隐藏", document.getElementById("flag-result").hidden);
  `,

  "bioinfo.html": `
    check("6 条航线", document.querySelectorAll("#wf-tabs .filter-chip").length === 6);
    const tabs = document.querySelectorAll("#wf-tabs .filter-chip");
    const firstNodes = document.querySelectorAll("#route .route-node").length;
    check("默认航线有站点", firstNodes > 1, firstNodes);
    const firstLede = document.getElementById("wf-lede").textContent;
    tabs[1].click();
    await wait(80);
    const activeTab = document.querySelectorAll("#wf-tabs .filter-chip")[1];
    check("切换航线", activeTab.classList.contains("active") &&
      document.getElementById("wf-lede").textContent !== firstLede);
    check("站点重绘", document.querySelectorAll("#route .route-node").length > 1);
    const node = document.querySelectorAll("#route .route-node")[1];
    const before = document.getElementById("route-detail").textContent;
    node.click();
    await wait(60);
    check("站点详情更新", !!document.querySelector("#route .route-node.active") &&
      document.getElementById("route-detail").textContent !== before);
    check("包表 29 行", document.querySelectorAll("#pkg-groups .pkg-table tbody tr").length === 29,
      document.querySelectorAll("#pkg-groups .pkg-table tbody tr").length);
    check("9 条误区", document.querySelectorAll("#myths .myth-card").length === 9);
  `,

  "glossary.html": `
    check("22 个术语", document.querySelectorAll(".term-card").length === 22);
    document.querySelector('#gl-cats [data-cat="统计"]').click();
    await wait(40);
    const cat = visible(".term-card");
    check("分类筛选", cat > 0 && cat < 22, cat);
    document.getElementById("gl-reset").click();
    await wait(40);
    type(document.getElementById("gl-q"), "删失");
    await wait(60);
    const q = visible(".term-card");
    check("术语搜索", q > 0 && q < 22, q);
    document.getElementById("gl-reset").click();
    await wait(40);
    const p = document.querySelector('#gl-index [data-letter="P"]');
    if (p) { p.click(); await wait(50); }
    const letter = visible(".term-card");
    check("首字母索引", letter > 0 && letter < 22, letter);
    document.getElementById("gl-reset").click();
    await wait(40);
    check("重置恢复 22 个", visible(".term-card") === 22);
  `,

  "stats-nav.html": `
    check("决策树起点有选项", document.querySelectorAll("#tree-opts .tree-opt").length > 0);
    for (let i = 0; i < 8; i++) {
      const opts = document.querySelectorAll("#tree-opts .tree-opt");
      if (!opts.length) break;
      opts[0].click();
      await wait(60);
      if (document.querySelector("#tree-result h3")) break;
    }
    check("决策树给出推荐", !!document.querySelector("#tree-result h3"),
      document.querySelector("#tree-result h3") && document.querySelector("#tree-result h3").textContent);
    const sel = document.getElementById("sent-test");
    pick(sel, "cox");
    await wait(50);
    check("报告句型切换", /log-rank/i.test(document.querySelector("#sent-out code").textContent));
  `,

  "project.html": `
    const items = document.querySelectorAll(".deliv-item input[type=checkbox]");
    check("交付物清单非空", items.length > 0, items.length);
    const before = document.getElementById("deliv-count").textContent;
    if (items.length) {
      items[0].click();
      await wait(60);
      check("勾选交付物更新进度", document.getElementById("deliv-count").textContent !== before,
        document.getElementById("deliv-count").textContent);
      const saved = JSON.parse(localStorage.getItem("bior.deliverables") || "{}");
      check("交付物写入 localStorage", !!(saved.items && Object.keys(saved.items).length));
      items[0].click();
      await wait(40);
    }
    check("进度环存在", !!document.getElementById("wb-ring"));
    check("阶段进度条 4 行", document.querySelectorAll("#wb-stages .wb-stage-row").length === 4);
    check("图槽位存在", document.querySelectorAll("[id^='slot-fig']").length === 4);
  `,

  "chapters/ch15-mixed-models.html": `
    check("5 个示例卡", document.querySelectorAll(".example-card").length === 5);
    check("代码列表已生成", document.querySelectorAll(".listing").length === 5);
    const mastery = document.querySelector(".objectives .mastery-btns button");
    check("学习目标有掌握度按钮", !!mastery);
    if (mastery) {
      const no = Array.from(document.querySelectorAll(".objectives .mastery-btns button"))
        .find((b) => b.textContent === "不知道");
      no.click();
      await wait(40);
      check("点「不知道」后状态写入", no.getAttribute("aria-pressed") === "true" &&
        !!JSON.parse(localStorage.getItem("bior.mastery") || "{}").items["ch15-o1"]);
      no.click();
      await wait(30);
    }
    const chk = document.querySelector(".checklist input[type=checkbox]");
    check("自测清单可勾选", !!chk);
    if (chk) {
      chk.click();
      await wait(40);
      check("自测状态持久化", !!JSON.parse(localStorage.getItem("bior.checks") || "{}").items["ch15-c1"]);
      chk.click();
      await wait(30);
    }
    const quizOpt = document.querySelector(".quiz .quiz-opt");
    check("测验渲染选项", !!quizOpt);
    if (quizOpt) {
      quizOpt.click();
      await wait(60);
      check("测验给出正误反馈", document.querySelectorAll(".quiz-opt.correct").length > 0);
      check("测验解析展开", !document.querySelector(".quiz-explain").hidden);
    }
    const steps = document.querySelectorAll(".example-card .ex-steps");
    check("本章至少 2 个单步数据", steps.length >= 2, steps.length);
    const stepBtn = Array.from(document.querySelectorAll(".lh-actions button"))
      .find((b) => b.textContent === "单步");
    check("单步按钮存在", !!stepBtn);
    if (stepBtn) {
      stepBtn.click();
      await wait(100);
      check("单步面板打开", !!document.querySelector(".example-card .stepper"));
    }
    const railLinks = document.querySelectorAll(".rail-toc a");
    check("章节侧栏目录", railLinks.length >= 8, railLinks.length);
    check("侧栏锚点均存在", Array.from(railLinks).every((a) => {
      const id = decodeURIComponent((a.getAttribute("href") || "").replace(/^#/, ""));
      return id && document.getElementById(id);
    }));
    const explainer = document.querySelector(".explainer");
    if (explainer) {
      const next = explainer.querySelector(".explainer-controls button, .stepper button");
      check("讲解器有控制按钮", !!next);
      if (next) next.click();
    }
  `,

  "chapters/ch14-reproducible.html": `
    check("5 个示例卡", document.querySelectorAll(".example-card").length === 5);
    const stepBtn = Array.from(document.querySelectorAll(".lh-actions button"))
      .find((b) => b.textContent === "单步");
    check("ch14 示例有单步按钮", !!stepBtn);
    if (stepBtn) {
      stepBtn.click();
      await wait(100);
      const box = document.querySelector(".example-card .vars-box");
      check("单步面板打开", !!box && !box.hidden);
      if (box) {
        const buttons = box.querySelectorAll(".stepper button");
        check("单步控制有 5 个按钮", buttons.length === 5, buttons.length);
        if (buttons.length === 5) {
          buttons[4].click();
          await wait(40);
          check("末帧输出为 18 / 94", /18 \\/ 94/.test(box.querySelector(".vars-out").textContent),
            box.querySelector(".vars-out").textContent);
        }
      }
    }
  `,

  "chapters/ch17-multivariate.html": `
    const labels = document.querySelectorAll('.explainer[data-engine="matrix"] .mx-rowlabel');
    check("矩阵行标签 6 个", labels.length === 6, labels.length);
    check("矩阵行标签为 G00001–G00006",
      labels.length === 6 && labels[0].textContent === "G00001" && labels[5].textContent === "G00006",
      labels.length ? labels[0].textContent + "…" + labels[5].textContent : "");
    const pca = document.querySelector('[data-figure="ch17-pca"] img');
    check("PCA 图已加载", !!pca && pca.complete && pca.naturalWidth > 0);
  `,
};

function launch() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "bior-int-"));
  const args = [
    "--headless=new", `--remote-debugging-port=${PORT}`, "--remote-allow-origins=*",
    `--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check",
    "--disable-background-networking", "--disable-component-update", "--disable-extensions",
    "--disable-sync", "--disable-translate", "--mute-audio", "--window-size=1440,1000",
    "about:blank",
  ];
  return { proc: spawn(CHROME, args, { stdio: "ignore" }), profile };
}

async function waitTarget() {
  const end = Date.now() + 20000;
  while (Date.now() < end) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const page = list.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
      if (page) return page;
    } catch { /* retry */ }
    await sleep(200);
  }
  throw new Error("Chrome target unavailable");
}

function connect(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    const pending = new Map();
    const listeners = new Map();
    let seq = 0;
    ws.onopen = () => resolve({ ws, send, on, once });
    ws.onerror = reject;
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) {
        const p = pending.get(msg.id);
        pending.delete(msg.id);
        msg.error ? p.bad(new Error(msg.error.message)) : p.ok(msg.result);
      } else if (msg.method && listeners.has(msg.method)) {
        for (const fn of listeners.get(msg.method)) fn(msg.params);
      }
    };
    function send(method, params = {}) {
      const id = ++seq;
      ws.send(JSON.stringify({ id, method, params }));
      return new Promise((ok, bad) => pending.set(id, { ok, bad }));
    }
    function on(method, fn) {
      if (!listeners.has(method)) listeners.set(method, new Set());
      listeners.get(method).add(fn);
    }
    function once(method, timeout = 10000) {
      return new Promise((ok, bad) => {
        const fn = (p) => { clearTimeout(timer); listeners.get(method).delete(fn); ok(p); };
        const timer = setTimeout(() => { listeners.get(method).delete(fn); bad(new Error("timeout " + method)); }, timeout);
        on(method, fn);
      });
    }
  });
}

async function main() {
  const { proc, profile } = launch();
  let ws;
  try {
    const target = await waitTarget();
    const conn = await connect(target.webSocketDebuggerUrl);
    ws = conn.ws;
    const { send, once } = conn;
    await send("Page.enable");
    await send("Runtime.enable");

    const runtimeErrors = [];
    let collecting = false;
    conn.on("Runtime.exceptionThrown", (p) => {
      if (!collecting) return;
      const d = p.exceptionDetails || {};
      runtimeErrors.push((d.exception?.description || d.text || "exception").replace(/\\s+/g, " ").slice(0, 300));
    });

    const results = [];
    for (const [page, body] of Object.entries(TESTS)) {
      const url = `${BASE}/${page}`;
      collecting = false;
      const load = once("Page.loadEventFired");
      await send("Page.navigate", { url });
      try { await load; } catch { /* handled by checks */ }
      await sleep(650);
      runtimeErrors.length = 0;
      collecting = true;
      const ev = await send("Runtime.evaluate", {
        expression: `(async function () {${HELPER}${body}\nreturn { out, href: location.href };})()`,
        awaitPromise: true, returnByValue: true,
      });
      collecting = false;
      let out = [];
      let detail = "";
      if (ev.exceptionDetails) {
        detail = ev.exceptionDetails.exception?.description || ev.exceptionDetails.text || "evaluate failed";
        out = [{ name: "脚本执行", pass: false, detail }];
      } else {
        out = ev.result.value.out || [];
      }
      const fails = out.filter((x) => !x.pass);
      results.push({ page, checks: out, fails: fails.length, runtimeErrors: [...runtimeErrors] });
      const status = fails.length || runtimeErrors.length ? "FAIL" : "ok";
      console.log(`[${status}] ${page} (${out.length} checks)`);
      for (const f of fails) console.log(`   - ${f.name}: ${f.detail}`);
      for (const e of runtimeErrors) console.log(`   ! ${e}`);
    }
    const summary = {
      base: BASE,
      generated: new Date().toISOString(),
      pages: Object.keys(TESTS).length,
      failingPages: results.filter((r) => r.fails || r.runtimeErrors.length).length,
      results,
    };
    const outPath = path.join(os.tmpdir(), "bior-interactions.json");
    fs.writeFileSync(outPath, JSON.stringify(summary, null, 2));
    console.log(`\n${summary.failingPages} failing pages; report: ${outPath}`);
    process.exitCode = summary.failingPages ? 1 : 0;
  } finally {
    try { if (ws) ws.close(); } catch { /* ignore */ }
    proc.kill();
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch { /* ignore */ }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
