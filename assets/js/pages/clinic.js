/* ============================================================
 * pages/clinic.js — case filters, R highlighting, red-flag screener.
 * Cards/flags are static HTML generated from clinic-data.js; this
 * script never rewrites case content.
 * ============================================================ */
(function () {
  "use strict";

  function $$(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }

  var cat = "";

  function applyFilter() {
    var shown = 0;
    $$(".clinic-card").forEach(function (card) {
      var ok = !cat || card.getAttribute("data-cat") === cat;
      card.hidden = !ok;
      if (ok) shown++;
    });
    var count = document.getElementById("clinic-count");
    if (count) count.textContent = shown + " / 14 个病例";
    var empty = document.getElementById("clinic-empty");
    if (empty) empty.hidden = shown > 0;
    $$("#clinic-cats .filter-chip").forEach(function (chip) {
      chip.classList.toggle("active", (chip.getAttribute("data-cat") || "") === cat);
    });
  }

  function highlight() {
    if (!window.BIOR || !window.BIOR.highlightR) return;
    $$(".clinic-card pre code.r").forEach(function (el) {
      if (el.querySelector("span")) return;
      el.innerHTML = window.BIOR.highlightR(el.textContent).join("\n");
    });
  }

  /* ---------- red-flag screener ---------- */
  var answers = [];
  var CASES = (window.BIOR_CLINIC && window.BIOR_CLINIC.cases) || [];

  function caseTitle(id) {
    for (var i = 0; i < CASES.length; i++) if (CASES[i].id === id) return CASES[i].title;
    return id;
  }

  function recalc() {
    var panel = document.getElementById("flag-result");
    var list = document.getElementById("flag-result-list");
    if (!panel || !list) return;
    var ids = [];
    $$(".flag-card").forEach(function (card, qi) {
      var a = answers[qi];
      if (a !== "no" && a !== "unsure") return;
      (card.getAttribute("data-cases") || "").split(",").forEach(function (id) {
        if (id && ids.indexOf(id) < 0) ids.push(id);
      });
    });
    var answered = answers.some(function (a) { return !!a; });
    panel.hidden = !answered;
    if (!answered) return;
    list.innerHTML = "";
    if (!ids.length) {
      var p = document.createElement("p");
      p.className = "small muted";
      p.textContent = "这六面红旗都通过了。把它们写进分析计划，再开始跑模型。";
      list.appendChild(p);
      return;
    }
    ids.forEach(function (id) {
      var a = document.createElement("a");
      a.className = "flag-rec";
      a.href = "#case-" + id;
      a.textContent = caseTitle(id);
      list.appendChild(a);
    });
  }

  function initFlags() {
    $$(".flag-card").forEach(function (card, qi) {
      Array.prototype.forEach.call(card.querySelectorAll(".flag-btn"), function (btn) {
        btn.addEventListener("click", function () {
          answers[qi] = btn.getAttribute("data-val");
          Array.prototype.forEach.call(card.querySelectorAll(".flag-btn"), function (b) {
            b.setAttribute("aria-pressed", b === btn ? "true" : "false");
          });
          recalc();
        });
      });
    });
    var reset = document.getElementById("flag-reset");
    if (reset) reset.addEventListener("click", function () {
      answers = [];
      $$(".flag-btn").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
      recalc();
      var first = document.querySelector(".flag-card");
      if (first) first.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function init() {
    $$("#clinic-cats .filter-chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        cat = chip.getAttribute("data-cat") || "";
        applyFilter();
      });
    });
    highlight();
    applyFilter();
    initFlags();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
