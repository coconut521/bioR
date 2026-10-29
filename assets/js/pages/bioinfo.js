/* ============================================================
 * pages/bioinfo.js — workflow routes, node detail, package atlas,
 * format guide and myths. All content comes from
 * assets/js/data/bioinfo-data.js; shell vs R is data (node.r).
 * ============================================================ */
(function () {
  "use strict";

  var B = window.BIOR_BIOINFO || { workflows: [], packages: [], formats: [], myths: [] };
  var TOC = window.COURSE_TOC || [];
  var SHEETS = window.BIOR_CHEATSHEETS || [];
  var wf = B.workflows[0];
  var nodeId = wf && wf.nodes[0] ? wf.nodes[0].id : "";

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function chapterLink(id) {
    var c = TOC.filter(function (x) { return x.id === id; })[0];
    return c ? '<a href="' + c.file + '">' + esc(c.id) + " · " + esc(c.short) + "</a>" : "";
  }
  function sheetLink(id) {
    var s = SHEETS.filter(function (x) { return x.id === id; })[0];
    return s ? '<a class="sheet-link" href="cheatsheets.html#' + esc(id) + '">速查 · ' + esc(s.title) + "</a>" : "";
  }

  function renderTabs() {
    var box = $("wf-tabs");
    if (!box) return;
    box.innerHTML = "";
    B.workflows.forEach(function (w) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "filter-chip" + (w.id === wf.id ? " active" : "");
      b.setAttribute("aria-pressed", w.id === wf.id ? "true" : "false");
      b.setAttribute("data-wf", w.id);
      b.textContent = w.title;
      box.appendChild(b);
    });
  }

  function renderRoute() {
    var route = $("route");
    var lede = $("wf-lede");
    if (!route) return;
    if (lede) lede.textContent = wf.lede;
    var hint = $("route-hint");
    if (hint) {
      var rn = wf.nodes.filter(function (n) { return n.r; }).length;
      hint.textContent = "共 " + wf.nodes.length + " 站（R " + rn + " 站 / shell " + (wf.nodes.length - rn) + " 站）；可横向滚动查看全部。";
    }
    route.innerHTML = "";
    wf.nodes.forEach(function (n) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "route-node" + (n.r ? " is-r" : "") + (n.id === nodeId ? " active" : "");
      b.setAttribute("data-node", n.id);
      b.setAttribute("aria-pressed", n.id === nodeId ? "true" : "false");
      b.innerHTML = '<span class="rn-step">' + String(n.step).padStart(2, "0") + "</span>" +
        '<span class="rn-label">' + esc(n.label) + "</span>" +
        (n.r ? '<span class="rn-r">R</span>' : '<span class="rn-shell">shell</span>');
      route.appendChild(b);
    });
    renderDetail();
  }

  function renderDetail() {
    var box = $("route-detail");
    if (!box) return;
    var n = wf.nodes.filter(function (x) { return x.id === nodeId; })[0] || wf.nodes[0];
    if (!n) { box.innerHTML = ""; return; }
    var tools = (n.tools || []).map(function (t) { return '<span class="rd-tool">' + esc(t) + "</span>"; }).join("");
    var list = function (arr, cls) {
      return "<ul class=" + cls + ">" + (arr || []).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>";
    };
    var links = (n.chapters || []).map(chapterLink).concat((n.cheatsheets || []).map(sheetLink)).join("");
    box.innerHTML =
      '<div class="rd-head">' +
        '<span class="tag">第 ' + n.step + " 站</span>" +
        '<span class="tag ' + (n.r ? "green" : "blue") + '">' + (n.r ? "R 站点" : "shell / 专用工具") + "</span>" +
        "<h3>" + esc(n.label) + "</h3>" +
      "</div>" +
      '<p class="rd-purpose">' + esc(n.purpose) + "</p>" +
      '<div class="rd-tools">' + tools + "</div>" +
      '<div class="rd-io">' +
        '<div><h4>输入</h4>' + list(n.inputs, "rd-list") + "</div>" +
        '<div><h4>输出</h4>' + list(n.outputs, "rd-list") + "</div>" +
      "</div>" +
      '<div class="rd-check"><h4>检查点</h4>' + list(n.checkpoints, "rd-list check") + "</div>" +
      '<div class="rd-fail"><h4>常见失败</h4>' + list(n.failures, "rd-list fail") + "</div>" +
      (links ? '<div class="rd-links">' + links + "</div>" : "");
  }

  function selectWf(id) {
    var w = B.workflows.filter(function (x) { return x.id === id; })[0];
    if (!w) return;
    wf = w;
    nodeId = w.nodes[0].id;
    renderTabs();
    renderRoute();
  }

  function renderPackages() {
    var box = $("pkg-groups");
    if (!box) return;
    var tasks = [];
    B.packages.forEach(function (p) { if (tasks.indexOf(p.task) < 0) tasks.push(p.task); });
    box.innerHTML = tasks.map(function (task) {
      var rows = B.packages.filter(function (p) { return p.task === task; }).map(function (p) {
        return "<tr>" +
          '<td><code>' + esc(p.name) + "</code>" + (p.inCourse ? ' <span class="in-course" title="课程使用">●</span>' : "") + "</td>" +
          '<td><span class="pkg-source">' + esc(p.source) + "</span></td>" +
          "<td>" + esc(p.use) + "</td>" +
          "<td>" + esc(p.alternatives) + "</td>" +
          '<td><span class="pkg-cost cost-' + (p.cost === "低" ? "low" : p.cost === "中" ? "mid" : "high") + '">' + esc(p.cost) + "</span></td>" +
          "</tr>";
      }).join("");
      return '<div class="pkg-block"><h3>' + esc(task) + "</h3>" +
        '<div class="table-wrap"><table class="data-table pkg-table"><thead><tr>' +
        '<th scope="col">包</th><th scope="col">来源</th><th scope="col">用途</th><th scope="col">替代</th><th scope="col">学习成本</th>' +
        "</tr></thead><tbody>" + rows + "</tbody></table></div></div>";
    }).join("");
  }

  function renderFormats() {
    var body = $("format-body");
    if (!body) return;
    body.innerHTML = B.formats.map(function (f) {
      return "<tr>" +
        "<td><b>" + esc(f.name) + "</b><br><code class=\"fmt-id\">" + esc(f.id) + "</code></td>" +
        "<td>" + esc(f.what) + "</td>" +
        "<td>" + esc(f.who) + "</td>" +
        '<td><code class="fmt-read">' + esc(f.read_in_r) + "</code></td>" +
        "<td>" + esc(f.pitfalls) + "</td>" +
        "</tr>";
    }).join("");
  }

  function renderMyths() {
    var box = $("myths");
    if (!box) return;
    box.innerHTML = B.myths.map(function (m) {
      var links = (m.chapters || []).map(chapterLink).join("");
      return '<article class="myth-card"><h3>' + esc(m.title) + "</h3><p>" + esc(m.body) + "</p>" +
        (links ? '<div class="myth-links">' + links + "</div>" : "") + "</article>";
    }).join("");
  }

  function init() {
    var tabs = $("wf-tabs");
    if (tabs) tabs.addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-wf]");
      if (b) selectWf(b.getAttribute("data-wf"));
    });
    var route = $("route");
    if (route) route.addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-node]");
      if (!b) return;
      nodeId = b.getAttribute("data-node");
      renderRoute();
    });
    if (wf) { renderTabs(); renderRoute(); }
    renderPackages();
    renderFormats();
    renderMyths();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
