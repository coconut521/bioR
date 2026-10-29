/* ============================================================
 * pages/cheatsheets.js — cheatsheet page wiring only:
 *   category/research filters, text search, per-card copy,
 *   hash deep links. Cards themselves are generated at build time
 *   by tools/build-cheatsheet-cards.mjs (static HTML, real anchors).
 * ============================================================ */
(function () {
  "use strict";
  var DATA = window.BIOR_CHEATSHEETS || [];
  var byId = {};
  DATA.forEach(function (s) { byId[s.id] = s; });

  var cat = "";
  var q = "";
  var researchOnly = false;

  function $(s) { return document.querySelector(s); }
  function $$(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }

  function decodeEnt(s) {
    var ta = document.createElement("textarea");
    ta.innerHTML = s;
    return ta.value;
  }

  function rowsToTsv(header, rows) {
    var lines = [];
    if (header) lines.push(header.join("\t"));
    rows.forEach(function (r) {
      lines.push(r.map(function (c) { return decodeEnt(c).replace(/\t/g, " "); }).join("\t"));
    });
    return lines.join("\n");
  }

  function copyPayload(s) {
    if (s.type === "code") return decodeEnt(s.code);
    if (s.type === "decision") {
      var text = (s.steps || []).map(function (x, i) { return (i + 1) + ". " + x; }).join("\n");
      if (s.header && s.rows && s.rows.length) text += "\n\n" + rowsToTsv(s.header, s.rows);
      return text;
    }
    return rowsToTsv(s.header, s.rows);
  }

  function copyText(text, btn) {
    function done(ok) {
      var old = btn.getAttribute("data-label") || btn.textContent;
      btn.textContent = ok ? "已复制 ✓" : "复制失败";
      setTimeout(function () { btn.textContent = old; }, 1400);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { fallback(); });
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      done(ok);
    }
  }

  function apply() {
    var shown = 0;
    $$(".cheat-card").forEach(function (card) {
      var ok = true;
      if (cat && card.getAttribute("data-cat") !== cat) ok = false;
      if (ok && researchOnly && card.getAttribute("data-research") !== "1") ok = false;
      if (ok && q) ok = (card.textContent || "").toLowerCase().indexOf(q) >= 0;
      card.hidden = !ok;
      if (ok) shown++;
    });
    var count = $("#cheat-count");
    if (count) count.textContent = shown + " / " + DATA.length + " 张速查表";
    var empty = $("#cheat-empty");
    if (empty) empty.hidden = shown > 0;
    $$(".filter-chip[data-cat]").forEach(function (chip) {
      chip.classList.toggle("active", (chip.getAttribute("data-cat") || "") === cat);
    });
    var rb = $("#cheat-research");
    if (rb) rb.classList.toggle("active", researchOnly);
  }

  function initFilters() {
    $$(".filter-chip[data-cat]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        cat = chip.getAttribute("data-cat") || "";
        apply();
      });
    });
    var rb = $("#cheat-research");
    if (rb) rb.addEventListener("click", function () { researchOnly = !researchOnly; apply(); });
    var search = $("#cheat-q");
    if (search) search.addEventListener("input", function () { q = search.value.trim().toLowerCase(); apply(); });
    var reset = $("#cheat-reset");
    if (reset) reset.addEventListener("click", function () {
      cat = ""; q = ""; researchOnly = false;
      if (search) search.value = "";
      apply();
    });
    $$("[data-copy]").forEach(function (btn) {
      btn.setAttribute("data-label", btn.textContent);
      btn.addEventListener("click", function () {
        var s = byId[btn.getAttribute("data-copy")];
        if (s) copyText(copyPayload(s), btn);
      });
    });
  }

  function initHash() {
    var ALIAS = { import: "import-export" };
    function go() {
      var id = (location.hash || "").replace(/^#/, "");
      if (!id) return;
      id = ALIAS[id] || id;
      var card = document.getElementById(id);
      if (!card || !card.classList.contains("cheat-card")) return;
      cat = ""; q = ""; researchOnly = false;
      var search = $("#cheat-q");
      if (search) search.value = "";
      apply();
      card.classList.add("hit");
      setTimeout(function () { card.classList.remove("hit"); }, 1600);
      card.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    window.addEventListener("hashchange", go);
    go();
  }

  function highlightCodes() {
    if (!window.BIOR.highlightR) return;
    $$(".cheat-card .cc-code code.r").forEach(function (codeEl) {
      codeEl.innerHTML = window.BIOR.highlightR(codeEl.textContent).join("\n");
    });
  }

  function init() {
    if (!DATA.length || !$(".cheat-card")) return;
    highlightCodes();
    initFilters();
    initHash();
    apply();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
