/* ============================================================
 * pages/datasets.js — dataset zoo wiring:
 *   tabs (teaching / external), chapter + analysis filters,
 *   text search, data-dictionary viewer, hash deep links.
 * ============================================================ */
(function () {
  "use strict";
  var esc = window.BIOR.escapeHtml;
  var DATA = window.BIOR_DATASETS || [];

  var tab = "all";
  var chapter = "";
  var analysis = "";
  var q = "";

  function $(s) { return document.querySelector(s); }
  function $$(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }

  /* ---------- filter state -> DOM ---------- */
  function apply() {
    var teaching = $$(".ds-card");
    teaching.forEach(function (card) {
      var ok = tab !== "external";
      if (ok && chapter) {
        ok = (card.getAttribute("data-chapters") || "").split(",").indexOf(chapter) >= 0;
      }
      if (ok && analysis) {
        ok = (card.getAttribute("data-analyses") || "").split("|").indexOf(analysis) >= 0;
      }
      if (ok && q) {
        ok = (card.textContent || "").toLowerCase().indexOf(q) >= 0;
      }
      card.hidden = !ok;
    });
    $$(".ext-card").forEach(function (card) {
      card.hidden = tab === "teaching";
    });
    var nShown = teaching.filter(function (c) { return !c.hidden; }).length;
    var empty = $("#ds-empty");
    if (empty) empty.hidden = nShown > 0 || tab === "external";
    var extWrap = $("#ext-wrap");
    if (extWrap) extWrap.hidden = tab === "teaching";
    $("#ds-count") && ($("#ds-count").textContent = nShown + " 个教学数据集");
    $$(".filter-chip[data-tab]").forEach(function (chip) {
      chip.classList.toggle("active", chip.getAttribute("data-tab") === tab);
    });
    $$("#filter-chapter, #filter-analysis").forEach(function (el) {
      el.disabled = tab === "external";
    });
  }

  function initFilters() {
    var chips = $$(".filter-chip[data-tab]");
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        tab = chip.getAttribute("data-tab");
        apply();
      });
    });
    var chSel = $("#filter-chapter");
    if (chSel) {
      var chs = {};
      DATA.forEach(function (d) { (d.chapters || []).forEach(function (c) { chs[c] = true; }); });
      Object.keys(chs).sort().forEach(function (c) {
        var o = document.createElement("option");
        o.value = c; o.textContent = "第 " + c.replace("ch", "") + " 章";
        chSel.appendChild(o);
      });
      chSel.addEventListener("change", function () { chapter = chSel.value; apply(); });
    }
    var aSel = $("#filter-analysis");
    if (aSel) {
      var as = {};
      DATA.forEach(function (d) { (d.analyses || []).forEach(function (a) { as[a] = true; }); });
      Object.keys(as).sort().forEach(function (a) {
        var o = document.createElement("option");
        o.value = a; o.textContent = a;
        aSel.appendChild(o);
      });
      aSel.addEventListener("change", function () { analysis = aSel.value; apply(); });
    }
    var search = $("#filter-q");
    if (search) {
      search.addEventListener("input", function () { q = search.value.trim().toLowerCase(); apply(); });
    }
    var reset = $("#filter-reset");
    if (reset) {
      reset.addEventListener("click", function () {
        tab = "all"; chapter = ""; analysis = ""; q = "";
        if (chSel) chSel.value = "";
        if (aSel) aSel.value = "";
        if (search) search.value = "";
        apply();
      });
    }
  }

  /* ---------- dictionary viewer ---------- */
  function renderDict(id) {
    var out = $("#dict-output");
    if (!out) return;
    var ds = DATA.filter(function (d) { return d.id === id; })[0];
    if (!ds) {
      out.innerHTML = '<p class="small muted">未找到数据集：' + esc(id) + "</p>";
      return;
    }
    var rows = (ds.variables || []).map(function (v) {
      return "<tr><td><code>" + esc(v.name) + "</code></td><td>" + esc(v.type) +
        "</td><td>" + esc(v.unit) + "</td><td>" + v.missing +
        "</td><td>" + esc(v.range) + "</td><td>" + esc(v.desc) + "</td></tr>";
    }).join("");
    out.innerHTML =
      '<div class="dict-head"><b>' + esc(ds.title) + "</b>" +
      '<span class="dp-dim">' + ds.rows + " 行 × " + ds.cols + " 列 · " +
      (ds.variables || []).length + " 个变量</span>" +
      (ds.simulated ? '<span class="tag">模拟数据</span>' : "") +
      '<a href="' + esc(ds.file) + '" download>下载 CSV</a></div>' +
      '<div class="table-wrap"><table class="data-table dict-table">' +
      "<caption>" + esc(ds.id) + " · " + esc(ds.research_question || "") + "</caption>" +
      '<thead><tr><th scope="col">变量</th><th scope="col">类型</th><th scope="col">单位</th>' +
      '<th scope="col">缺失</th><th scope="col">范围</th><th scope="col">说明</th></tr></thead>' +
      "<tbody>" + rows + "</tbody></table></div>" +
      '<p class="small muted">缺失数来自数据字典；NA 的含义写在说明栏（如溶血）。</p>';
  }

  function initDict() {
    var sel = $("#dict-select");
    if (!sel) return;
    DATA.forEach(function (d) {
      var o = document.createElement("option");
      o.value = d.id; o.textContent = d.title;
      sel.appendChild(o);
    });
    sel.addEventListener("change", function () {
      renderDict(sel.value);
      if (history.replaceState) history.replaceState(null, "", "#" + sel.value);
    });
    /* card "数据字典" links: select the dataset and jump to the viewer */
    $$("[data-dict]").forEach(function (a) {
      a.addEventListener("click", function () {
        var id = a.getAttribute("data-dict");
        sel.value = id;
        renderDict(id);
        var sec = $("#dictionary");
        if (sec) sec.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
    renderDict(sel.value);
  }

  /* ---------- hash deep links ---------- */
  function initHash() {
    function go() {
      var id = (location.hash || "").replace(/^#/, "");
      if (!id) return;
      var card = document.getElementById(id);
      if (card) {
        tab = card.classList.contains("ext-card") ? "external" : "all";
        apply();
        var sel = $("#dict-select");
        if (sel && DATA.some(function (d) { return d.id === id; })) sel.value = id;
        renderDict(id);
        card.classList.add("hit");
        setTimeout(function () { card.classList.remove("hit"); }, 1600);
        card.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (id === "dictionary") {
        $("#dictionary") && $("#dictionary").scrollIntoView({ behavior: "smooth" });
      }
    }
    window.addEventListener("hashchange", go);
    go();
  }

  function init() {
    if (!DATA.length) return;
    initFilters();
    initDict();
    initHash();
    apply();
    var er = $("#empty-reset");
    if (er) er.addEventListener("click", function () {
      var r = $("#filter-reset");
      if (r) r.click();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
