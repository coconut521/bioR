/* ============================================================
 * data-preview.js — renders <div class="data-preview" data-dataset="...">
 * from window.BIOR_DATASETS (+ generated BIOR_DATASET_PREVIEWS).
 * Shows header types row, first N rows, NA badges, dictionary link.
 * ============================================================ */
(function () {
  "use strict";
  var esc = window.BIOR.escapeHtml;

  function initPreview(el) {
    var id = el.getAttribute("data-dataset");
    var n = parseInt(el.getAttribute("data-rows") || "6", 10);
    var ds = (window.BIOR_DATASETS || []).filter(function (d) { return d.id === id; })[0];
    if (!ds) {
      el.innerHTML = '<div class="dp-head">数据集未登记：' + esc(id) + "</div>";
      return;
    }
    var preview = ds.preview || [];
    var cols = preview.length ? Object.keys(preview[0]) : (ds.variables || []).slice(0, 6).map(function (v) { return v.name; });
    var typeOf = function (col) {
      var v = (ds.variables || []).filter(function (x) { return x.name === col; })[0];
      return v ? "<" + v.type + ">" : "";
    };

    var compact = el.getAttribute("data-compact") === "1";
    var head = document.createElement("div");
    head.className = "dp-head";
    if (compact) {
      head.innerHTML = '<span class="dp-dim">前 ' + Math.min(n, preview.length) + " 行预览</span>";
    } else {
      head.innerHTML = "<b>" + esc(ds.title) + "</b>" +
        '<span class="dp-dim">' + ds.rows + " 行 × " + ds.cols + " 列 · 前 " + Math.min(n, preview.length) + " 行</span>" +
        (ds.simulated ? '<span class="tag">模拟数据</span>' : "") +
        '<a href="datasets.html#' + esc(ds.id) + '">查看数据字典 →</a>';
    }
    el.appendChild(head);

    var scroll = document.createElement("div");
    scroll.className = "dp-scroll";
    var table = document.createElement("table");
    table.className = "dp-table";
    var cap = document.createElement("caption");
    if (!compact) {
      cap.className = "small muted";
      cap.style.textAlign = "left";
      cap.style.padding = "8px 12px 0";
      cap.textContent = "数据预览（只读；完整文件通过下载链接获取）";
      table.appendChild(cap);
    }

    if (preview.length) {
      var thead = document.createElement("thead");
      var trh = document.createElement("tr");
      cols.forEach(function (c) {
        var th = document.createElement("th");
        th.scope = "col";
        th.textContent = c;
        trh.appendChild(th);
      });
      thead.appendChild(trh);
      table.appendChild(thead);
      var trt = document.createElement("tr");
      trt.className = "dp-types";
      cols.forEach(function (c) {
        var td = document.createElement("td");
        td.textContent = typeOf(c);
        trt.appendChild(td);
      });
      table.appendChild(trt);
      var tbody = document.createElement("tbody");
      preview.slice(0, n).forEach(function (row) {
        var tr = document.createElement("tr");
        cols.forEach(function (c) {
          var td = document.createElement("td");
          var v = row[c];
          if (v === null || v === undefined || v === "NA") {
            td.innerHTML = '<span class="na-badge">NA</span>';
          } else {
            td.textContent = v;
          }
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
    } else {
      var tr0 = document.createElement("tr");
      var td0 = document.createElement("td");
      td0.textContent = "预览尚未生成：运行 node tools/build-data-previews.mjs";
      tr0.appendChild(td0);
      table.appendChild(tr0);
    }
    scroll.appendChild(table);
    el.appendChild(scroll);

    if (!compact) {
      var foot = document.createElement("div");
      foot.className = "dp-foot";
      foot.innerHTML = "n 的定义：一行 = 一个个体（统计单位）。完整变量说明见数据字典；文件为教学模拟数据。";
      el.appendChild(foot);
    }
  }

  function init() {
    document.querySelectorAll(".data-preview[data-dataset]").forEach(initPreview);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      // dataset previews merge on DOMContentLoaded too; run after
      setTimeout(init, 0);
    });
  } else setTimeout(init, 0);
})();
