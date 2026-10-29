/* ============================================================
 * pages/chapter.js — chapter-page wiring:
 *   right rail (research question, field notes, section index, tools)
 *   cover actions (mark done / download chapter script / print)
 *   mobile "本章导航" toggle, last-visited bookkeeping.
 * ============================================================ */
(function () {
  "use strict";
  var esc = window.BIOR.escapeHtml;

  var ch = document.body.getAttribute("data-chapter");
  var toc = window.COURSE_TOC || [];
  var entry = null;
  for (var i = 0; i < toc.length; i++) { if (toc[i].id === ch) { entry = toc[i]; break; } }
  /* template chapters (ch00) are not in the TOC: synthesize from the cover */
  var pseudo = null;
  if (!entry) {
    var qEl = document.querySelector(".cover-question");
    var h1 = document.querySelector(".cover-copy h1");
    pseudo = {
      id: ch,
      title: h1 ? h1.textContent.replace(/^第 \d+ 章 /, "").trim() : ch,
      question: qEl ? qEl.textContent.replace(/^本章科研问题：/, "").trim() : ""
    };
  }
  var meta = entry || pseudo;

  var rel = /\/chapters\/[^/]*$/.test(decodeURIComponent(location.pathname)) ? "../" : "";

  /* ---------- give every content h2 in reading an id ---------- */
  function collectSections() {
    var reading = document.querySelector(".chapter-reading");
    if (!reading) return [];
    var out = [];
    reading.querySelectorAll("h2").forEach(function (h2) {
      if (h2.closest(".objectives")) return;
      if (!h2.id) h2.id = "sec-" + (out.length + 1);
      out.push({ id: h2.id, title: h2.textContent.trim() });
    });
    return out;
  }

  /* ---------- rail ---------- */
  function buildRail() {
    var rail = document.querySelector(".rail");
    if (!rail || !meta) return;
    var cfg = (window.BIOR_CONFIG && window.BIOR_CONFIG.chapters && window.BIOR_CONFIG.chapters[ch]) || {};
    var sections = collectSections();

    rail.innerHTML = "";

    if (meta.question) {
      var bq = document.createElement("div");
      bq.className = "rail-block";
      bq.innerHTML = '<span class="kicker">RESEARCH QUESTION</span>' +
        '<div class="rail-card"><p>' + esc(meta.question) + "</p>" +
        (document.querySelector(".explainer") ? '<button type="button" class="btn" data-open-explainer>打开讲解器</button>' : "") +
        "</div>";
      rail.appendChild(bq);
      var ob = bq.querySelector("[data-open-explainer]");
      if (ob) ob.addEventListener("click", function () {
        var ex = document.querySelector(".explainer");
        ex.scrollIntoView({ behavior: "smooth", block: "center" });
        ex.style.boxShadow = "0 0 0 3px var(--bio-blue-soft)";
        setTimeout(function () { ex.style.boxShadow = ""; }, 1200);
      });
    }

    if (cfg.notes && cfg.notes.length) {
      var bn = document.createElement("div");
      bn.className = "rail-block";
      bn.innerHTML = '<span class="kicker">FIELD NOTES</span>';
      var ul = document.createElement("ul");
      ul.className = "field-notes";
      cfg.notes.forEach(function (n) {
        var target = sections[n.section] ? sections[n.section].id : null;
        var li = document.createElement("li");
        if (target) li.setAttribute("data-section", target);
        li.innerHTML = '<a href="#' + (target || "main") + '"><b>' + esc(n.title) + "</b>" +
          (n.body ? "<small>" + esc(n.body) + "</small>" : "") + "</a>";
        ul.appendChild(li);
      });
      bn.appendChild(ul);
      rail.appendChild(bn);
    }

    if (sections.length) {
      var bt = document.createElement("div");
      bt.className = "rail-block";
      bt.innerHTML = '<span class="kicker">SECTIONS</span>';
      var ol = document.createElement("ul");
      ol.className = "rail-toc";
      sections.forEach(function (s) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = "#" + s.id;
        a.textContent = s.title.replace(/^\d+\.\s*/, "");
        li.appendChild(a);
        ol.appendChild(li);
      });
      bt.appendChild(ol);
      rail.appendChild(bt);
    }

    var tools = document.createElement("div");
    tools.className = "rail-block";
    tools.innerHTML = '<span class="kicker">TOOLS</span><div class="rail-tools">' +
      '<button type="button" class="btn" data-tool="copyall">复制全部代码</button>' +
      '<button type="button" class="btn" data-tool="script">下载本章脚本</button>' +
      '<button type="button" class="btn" data-tool="print">打印本章</button>' +
      '<button type="button" class="btn" data-tool="done">标记完成</button>' +
      "</div>";
    rail.appendChild(tools);

    tools.querySelector('[data-tool="copyall"]').addEventListener("click", function () {
      var parts = [];
      document.querySelectorAll(".listing-code .cl").forEach(function (ln) {
        parts.push(ln.textContent.replace(/\n$/, ""));
      });
      var text = parts.join("\n");
      window.BIOR.copyText("# —— bioR · " + entry.title + " 全部代码 ——\n" + text + "\n").then(function (ok) {
        var b = tools.querySelector('[data-tool="copyall"]');
        b.textContent = ok ? "已复制" : "复制失败";
        setTimeout(function () { b.textContent = "复制全部代码"; }, 1400);
      });
    });
    var scriptBtn = tools.querySelector('[data-tool="script"]');
    if (entry) {
      scriptBtn.addEventListener("click", function () {
        location.href = rel + "assets/scripts/" + ch + ".R";
      });
    } else {
      scriptBtn.style.display = "none";
    }
    tools.querySelector('[data-tool="print"]').addEventListener("click", function () { window.print(); });
    var doneBtn = tools.querySelector('[data-tool="done"]');
    syncDone();
    doneBtn.addEventListener("click", function () {
      var done = window.BIOR.progress.chapterDone(ch);
      window.BIOR.progress.setChapterDone(ch, !done);
      syncDone();
    });

    function syncDone() {
      var done = window.BIOR.progress.chapterDone(ch);
      doneBtn.textContent = done ? "已学完 ✓" : "标记完成";
      doneBtn.style.color = done ? "var(--bio-green)" : "";
      doneBtn.style.borderColor = done ? "var(--bio-green)" : "";
    }
  }

  /* ---------- cover actions ---------- */
  function buildCover() {
    var actions = document.querySelector(".cover-actions");
    if (!actions || !meta) return;
    actions.innerHTML = "";
    var done = window.BIOR.progress.chapterDone(ch);

    var bDone = document.createElement("button");
    bDone.type = "button";
    bDone.className = "btn btn-primary";
    syncDone();
    bDone.addEventListener("click", function () {
      window.BIOR.progress.setChapterDone(ch, !window.BIOR.progress.chapterDone(ch));
      syncDone();
    });
    actions.appendChild(bDone);

    if (entry) {  // template chapters have no assembled script
      var aScript = document.createElement("a");
      aScript.className = "btn";
      aScript.href = rel + "assets/scripts/" + ch + ".R";
      aScript.setAttribute("download", ch + ".R");
      aScript.textContent = "下载本章脚本";
      actions.appendChild(aScript);
    }

    var bPrint = document.createElement("button");
    bPrint.type = "button";
    bPrint.className = "btn";
    bPrint.textContent = "打印";
    bPrint.addEventListener("click", function () { window.print(); });
    actions.appendChild(bPrint);

    function syncDone() {
      var d = window.BIOR.progress.chapterDone(ch);
      bDone.textContent = d ? "已学完 ✓" : "标记完成";
    }
  }

  /* ---------- mobile rail toggle ---------- */
  function buildToggle() {
    if (!document.querySelector(".rail")) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn chapter-nav-toggle";
    btn.textContent = "本章导航";
    btn.setAttribute("aria-expanded", "false");
    var cover = document.querySelector(".chapter-cover");
    if (cover) cover.parentNode.insertBefore(btn, cover);
    btn.addEventListener("click", function () {
      var rail = document.querySelector(".rail");
      var open = rail.classList.toggle("rail-open");
      btn.setAttribute("aria-expanded", String(open));
    });
    document.querySelectorAll(".rail a").forEach(function (a) {
      a.addEventListener("click", function () {
        if (window.innerWidth <= 767) document.querySelector(".rail").classList.remove("rail-open");
      });
    });
  }

  /* ---------- self-test checklist persistence ---------- */
  function initChecklist() {
    document.querySelectorAll(".checklist[data-chapter]").forEach(function (list) {
      var chId = list.getAttribute("data-chapter");
      list.querySelectorAll('input[type="checkbox"]').forEach(function (input, idx) {
        var id = chId + "-c" + (idx + 1);
        input.checked = window.BIOR.progress.getCheck(id);
        input.addEventListener("change", function () {
          window.BIOR.progress.setCheck(id, input.checked);
        });
      });
    });
  }

  function init() {
    if (document.body.getAttribute("data-page") !== "chapter") return;
    buildCover();
    buildRail();
    buildToggle();
    initChecklist();
    if (ch) window.BIOR.progress.setLast(ch);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
