/* ============================================================
 * pages/bioviz.js — BioViz recipe filters + code highlighting.
 * Recipes are static HTML (real anchors, no-JS readable); this
 * script only filters by kind and highlights the R snippets.
 * ============================================================ */
(function () {
  "use strict";
  var kind = "";

  function $$(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }

  function highlight() {
    if (!window.BIOR || !window.BIOR.highlightR) return;
    $$(".viz-card pre code.r").forEach(function (el) {
      if (el.querySelector("span")) return;
      var lines = window.BIOR.highlightR(el.textContent);
      el.innerHTML = lines.join("\n");
    });
  }

  function apply() {
    var shown = 0;
    $$(".viz-card").forEach(function (card) {
      var kinds = (card.getAttribute("data-kind") || "").split(" ");
      var ok = !kind || kinds.indexOf(kind) >= 0;
      card.hidden = !ok;
      if (ok) shown++;
    });
    var c = document.getElementById("viz-count");
    if (c) c.textContent = shown + " 张配方";
    var empty = document.getElementById("viz-empty");
    if (empty) empty.hidden = shown > 0;
    $$(".filter-chip[data-kind]").forEach(function (chip) {
      chip.classList.toggle("active", (chip.getAttribute("data-kind") || "") === kind);
    });
  }

  function init() {
    $$(".filter-chip[data-kind]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        kind = chip.getAttribute("data-kind") || "";
        apply();
      });
    });
    highlight();
    apply();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
