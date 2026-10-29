/* ============================================================
 * pages/home.js — home page: continue card, research route (4 stages),
 * today's task, workbench summary, recent updates, specials, glossary chips.
 * Data: COURSE_TOC, BIOR_SPECIALS, BIOR_DELIVERABLES, BIOR_UPDATES, BIOR_GLOSSARY.
 * ============================================================ */
(function () {
  "use strict";
  var esc = window.BIOR.escapeHtml;

  var PART_LABEL = { I: "阶段 I · 准备数据", II: "阶段 II · 探索与可视化", III: "阶段 III · 统计推断", IV: "阶段 IV · 交付与进阶" };
  var PART_DESC = {
    I: "把实验记录变成可信、可复现的数据",
    II: "把表变成能回答问题的图和汇总",
    III: "从「看起来有差异」到「有多大、有多确定」",
    IV: "把分析装配成报告，并进入组学"
  };

  function nextChapter() {
    var toc = window.COURSE_TOC || [];
    var last = window.BIOR.progress.getLast();
    var byId = {};
    toc.forEach(function (c) { byId[c.id] = c; });
    if (last && byId[last] && !window.BIOR.progress.chapterDone(last)) return byId[last];
    for (var i = 0; i < toc.length; i++) {
      if (!window.BIOR.progress.chapterDone(toc[i].id)) return toc[i];
    }
    return null;
  }

  function whyNow(entry) {
    if (!entry) return "";
    var i = (window.COURSE_TOC || []).indexOf(entry);
    var prev = window.COURSE_TOC[i - 1];
    if (!prev) return "从这里开始：装好 R，建好第一个可复现项目。";
    if (prev.deliverable && prev.deliverable.length) {
      return "上一章产出了 " + prev.deliverable[0] + "，本章会直接用到它。";
    }
    return "完成「" + (prev.short || prev.title) + "」后就可以学这一章。";
  }

  function buildContinue() {
    var box = document.getElementById("continue");
    if (!box) return;
    var entry = nextChapter();
    if (!entry) {
      box.innerHTML = '<span class="kicker">CONTINUE</span><p class="cc-title">全部完成 🎉</p>' +
        '<p class="cc-q">18 章已全部学完。去课题工作台把交付物与图表槽位整理成一份研究日志。</p>' +
        '<div class="cc-actions"><a class="btn btn-primary" href="project.html">打开工作台</a></div>';
      return;
    }
    box.innerHTML = '<span class="kicker">CONTINUE</span>' +
      '<p class="cc-title">' + esc(entry.id.replace("ch", "第 ") + " 章 · " + entry.title) + "</p>" +
      '<p class="cc-q">' + esc(entry.question || entry.summary || "") + "</p>" +
      '<div class="cc-actions"><a class="btn btn-primary" href="' + entry.file + '">继续学习 →</a>' +
      '<a class="btn" href="#route">研究路线</a></div>';
  }

  function buildRoute() {
    var route = document.getElementById("route-list");
    if (!route) return;
    var toc = window.COURSE_TOC || [];
    var next = nextChapter();
    var html = "";
    ["I", "II", "III", "IV"].forEach(function (part) {
      var chapters = toc.filter(function (c) { return c.part === part; });
      if (!chapters.length) return;
      html += '<div class="stage"><div class="stage-head">' +
        '<span class="stage-no">' + part + "</span><h3>" + esc(PART_LABEL[part]) + "</h3>" +
        '<span class="stage-range">' + esc(chapters[0].id + "–" + chapters[chapters.length - 1].id + " · " + (PART_DESC[part] || "")) + "</span></div>" +
        '<div class="stage-chapters">';
      chapters.forEach(function (c) {
        var cls = "route-chapter";
        var state = '<span class="ch-state" aria-hidden="true"></span>';
        if (window.BIOR.progress.chapterDone(c.id)) cls += " is-done";
        else if (next && next.id === c.id) cls += " is-next";
        var pre = c.prereq && c.prereq.length ? c.prereq.map(function (p) { return "ch" + p.replace("ch", ""); }).join(" ") : "无";
        html += '<a class="' + cls + '" href="' + c.file + '">' + state +
          '<span class="ch-top"><span class="ch-no">' + c.id.slice(2) + "</span>" +
          '<span class="ch-title">' + esc(c.title) + "</span></span>" +
          '<span class="ch-q">' + esc(c.question || "") + "</span>" +
          '<span class="ch-meta"><span>' + c.minutes + " min</span>" +
          (c.deliverable && c.deliverable.length ? "<span>交付 " + esc(c.deliverable[0]) + "</span>" : "") +
          "<span>前置 " + esc(pre) + "</span></span></a>";
      });
      html += "</div></div>";
    });
    route.innerHTML = html;
  }

  function buildTask() {
    var el = document.getElementById("today-task");
    if (!el) return;
    var entry = nextChapter();
    if (!entry) { el.innerHTML = '<p class="empty">全部章节已完成。</p>'; return; }
    el.innerHTML = '<p class="p-row"><a href="' + entry.file + '"><b>' + esc(entry.id.replace("ch", "第 ") + " 章 · " + entry.title) + "</b></a></p>" +
      '<p class="small muted" style="margin:6px 0 10px">' + esc(whyNow(entry)) + "</p>" +
      (entry.deliverable && entry.deliverable.length
        ? '<p class="small">本章交付：<code>' + esc(entry.deliverable.join("</code>、<code>")) + "</code></p>" : "") +
      (entry.minutes ? '<p class="small muted">预计 ' + entry.minutes + " 分钟（含练习）。</p>" : "");
  }

  function buildWorkbench() {
    var el = document.getElementById("wb-summary");
    if (!el) return;
    var d = window.BIOR_DELIVERABLES || [];
    var done = d.filter(function (x) { return window.BIOR.progress.delivDone(x.ch); }).length;
    var byPart = {};
    d.forEach(function (x) {
      var p = x.part || "IV";
      byPart[p] = byPart[p] || { total: 0, done: 0 };
      byPart[p].total += 1;
      if (window.BIOR.progress.delivDone(x.ch)) byPart[p].done += 1;
    });
    var rows = Object.keys(byPart).map(function (p) {
      var s = byPart[p];
      var pct = Math.round((s.done / s.total) * 100);
      return '<div class="p-row"><span>' + esc(PART_LABEL[p] || p) + "</span>" +
        '<span class="wb-bar" style="flex:1;max-width:90px;height:6px;border-radius:999px;background:var(--bio-surface-2);overflow:hidden"><i style="display:block;height:100%;width:' + pct + '%;background:var(--bio-blue)"></i></span>' +
        "<span>" + s.done + "/" + s.total + "</span></div>";
    }).join("");
    el.innerHTML = "<p>交付物完成 <b>" + done + " / " + d.length + "</b></p>" + rows +
      '<p style="margin-top:10px"><a class="small" href="project.html">打开课题工作台 →</a></p>';
  }

  function buildUpdates() {
    var el = document.getElementById("recent-updates");
    if (!el) return;
    var u = window.BIOR_UPDATES || [];
    if (!u.length) { el.innerHTML = '<p class="empty">暂无更新记录。</p>'; return; }
    el.innerHTML = u.slice(0, 5).map(function (x) {
      return '<div class="p-row"><a href="' + x.href + '">' + esc(x.title) + "</a>" +
        '<span class="p-date">' + esc(x.date) + "</span></div>";
    }).join("");
  }

  function buildWeak() {
    var el = document.getElementById("review-panel");
    if (!el) return;
    var m = (window.BIOR.progress.chapterDone && []) || [];
    var items = [];
    try {
      var raw = window.BIOR.storage.get("bior.mastery", null);
      if (raw && raw.items) {
        Object.keys(raw.items).forEach(function (k) {
          if (raw.items[k] === "no") items.push(k);
        });
      }
    } catch (e) {}
    if (!items.length) {
      el.innerHTML = '<p class="empty">还没有标记「不知道」的学习目标。在章节的学习目标里标记后，回看清单会出现在这里。</p>';
      return;
    }
    el.innerHTML = items.slice(0, 6).map(function (k) {
      var chId = k.split("-")[0];
      var entry = (window.COURSE_TOC || []).filter(function (c) { return c.id === chId; })[0];
      return '<div class="p-row"><a href="' + (entry ? entry.file : "#") + '">' + esc(chId.replace("ch", "第 ") + "章 · 目标 " + k.split("-o")[1]) + "</a><span class='p-date'>不知道</span></div>";
    }).join("") + '<p class="small muted" style="margin-top:8px">共 ' + items.length + " 条需要回看。</p>";
  }

  function buildSpecials() {
    var box = document.getElementById("specials-list");
    if (!box) return;
    var specials = window.BIOR_SPECIALS || [];
    box.innerHTML = specials.map(function (s) {
      return '<a class="special-card" href="' + s.file + '">' +
        '<span class="sc-icon" aria-hidden="true">' + (s.icon || "") + "</span>" +
        "<b>" + esc(s.title) + "</b><small>" + esc(s.desc || "") + "</small>" +
        '<span class="sc-count">' + esc(s.meta || "") + "</span></a>";
    }).join("");
  }

  function buildChips() {
    var box = document.getElementById("gloss-chips");
    if (!box) return;
    var g = (window.BIOR_GLOSSARY || []).slice(0, 10);
    box.innerHTML = g.map(function (t) {
      return '<a class="chip" href="glossary.html#' + esc(t.id || "") + '">' + esc(t.term) + "</a>";
    }).join("");
  }

  function buildStats() {
    var el = document.getElementById("hero-stats");
    if (!el) return;
    var toc = window.COURSE_TOC || [];
    var specials = window.BIOR_SPECIALS || [];
    var cheatN = (window.BIOR_CHEATSHEETS || []).length;
    el.innerHTML =
      "<span><b>" + toc.length + "</b> 章</span>" +
      "<span><b>" + specials.length + "</b> 专栏</span>" +
      "<span><b>" + (cheatN || 36) + "</b> 速查表</span>" +
      "<span><b>9</b> 教学数据集</span>";
  }

  function init() {
    if (document.body.getAttribute("data-page") !== "home") return;
    buildStats();
    buildContinue();
    buildRoute();
    buildTask();
    buildWorkbench();
    buildUpdates();
    buildWeak();
    buildSpecials();
    buildChips();
    document.addEventListener("bior:progress", function () {
      buildContinue(); buildRoute(); buildTask(); buildWorkbench(); buildWeak();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
