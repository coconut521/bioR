/* ============================================================
 * pages/project.js — workbench wiring: progress ring and stage
 * bars, deliverable checklist bound to BIOR.progress, figure
 * slots, and print-to-PDF research log export.
 * ============================================================ */
(function () {
  "use strict";
  var DEL = window.BIOR_DELIVERABLES || [];
  var PART_LABEL = { I: "阶段 I · 准备数据", II: "阶段 II · 探索", III: "阶段 III · 推断", IV: "阶段 IV · 交付" };
  var esc = window.BIOR.escapeHtml;

  function $(s) { return document.querySelector(s); }
  function $$(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }

  function buildBoard() {
    var grid = $("#deliv-grid");
    if (!grid) return;
    grid.innerHTML = DEL.map(function (d) {
      var done = window.BIOR.progress.delivDone(d.ch);
      return '<label class="deliv-item' + (done ? " done" : "") + '" data-ch="' + esc(d.ch) + '">' +
        '<input type="checkbox"' + (done ? " checked" : "") + ' aria-label="' + esc(d.ch + " " + d.label) + '">' +
        "<span><b>" + esc(d.ch.replace("ch", "第 ") + " 章 · " + d.label) + "</b>" +
        '<span class="dv-file">' + d.files.map(esc).join(" · ") + "</span>" +
        '<span class="dv-ch">' + esc(PART_LABEL[d.part] || d.part) + "</span></span></label>";
    }).join("");
    grid.addEventListener("change", function (e) {
      var input = e.target.closest("input[type='checkbox']");
      if (!input) return;
      var item = input.closest(".deliv-item");
      var ch = item.getAttribute("data-ch");
      window.BIOR.progress.setDeliv(ch, input.checked);
      item.classList.toggle("done", input.checked);
      refresh();
    });
  }

  function refresh() {
    var done = DEL.filter(function (d) { return window.BIOR.progress.delivDone(d.ch); }).length;
    var pct = DEL.length ? Math.round((done / DEL.length) * 100) : 0;
    var ring = $("#wb-ring");
    if (ring) { ring.style.setProperty("--p", pct); }
    var pctEl = $("#wb-pct");
    if (pctEl) pctEl.textContent = pct + "%";
    var cnt = $("#deliv-count");
    if (cnt) cnt.textContent = done + " / " + DEL.length + " 组交付物完成";

    var stages = $("#wb-stages");
    if (stages) {
      stages.innerHTML = ["I", "II", "III", "IV"].map(function (p) {
        var rows = DEL.filter(function (d) { return d.part === p; });
        var d = rows.filter(function (x) { return window.BIOR.progress.delivDone(x.ch); }).length;
        var w = rows.length ? Math.round((d / rows.length) * 100) : 0;
        return '<div class="wb-stage-row"><span style="width:150px">' + esc(PART_LABEL[p]) + "</span>" +
          '<span class="wb-bar"><i style="width:' + w + '%"></i></span>' +
          "<span>" + d + "/" + rows.length + "</span></div>";
      }).join("");
    }

    var slots = {
      "slot-fig1": ["ch08", "ch09"],
      "slot-fig2": ["ch12"],
      "slot-fig3": ["ch13"],
      "slot-fig4": ["ch16"]
    };
    Object.keys(slots).forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var need = slots[id];
      var ready = need.every(function (c) { return window.BIOR.progress.delivDone(c); });
      el.classList.toggle("filled", ready);
      var note = el.querySelector("[data-slot-state]");
      if (note) note.textContent = ready ? "已填充：可以放进论文图集"
        : "需要 " + need.map(function (c) { return c.toUpperCase(); }).join(" + ");
    });
  }

  function initExport() {
    var btn = $("#export-log");
    if (!btn) return;
    btn.addEventListener("click", function () {
      window.print();
    });
  }

  function init() {
    buildBoard();
    refresh();
    initExport();
    document.addEventListener("bior:progress", refresh);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
