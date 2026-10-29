/* ============================================================
 * nav.js — editorial header / course drawer / footer / chapter pager.
 * Reads data-page / data-chapter from <body> and window.COURSE_TOC,
 * window.BIOR_SPECIALS from assets/js/data/course-toc.js.
 * file:// safe: IIFE, no modules, no requests.
 * ============================================================ */
(function () {
  "use strict";
  var esc = window.BIOR.escapeHtml;

  var path = decodeURIComponent(location.pathname);
  var prefix = /\/chapters\/[^/]*$/.test(path) ? "../" : "";
  var here = (path.split("/").pop() || "index.html").toLowerCase();

  var THEME_ORDER = ["light", "dark", "auto"];
  var THEME_LABEL = { light: "亮色", dark: "暗色", auto: "自动" };
  var THEME_FULL = { light: "亮色", dark: "暗色", auto: "跟随系统" };

  var PART_LABEL = { I: "阶段 I · 准备数据", II: "阶段 II · 探索与可视化", III: "阶段 III · 统计推断", IV: "阶段 IV · 交付与进阶" };

  var ICONS = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8"/></svg>',
    theme: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
    db: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><ellipse cx="12" cy="6" rx="7.5" ry="3"/><path d="M4.5 6v12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3"/></svg>',
    box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Z"/><path d="M4 7.5 12 12l8-4.5M12 12v9"/></svg>',
    present: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><rect x="3" y="4.5" width="18" height="12" rx="1.5"/><path d="M12 16.5V20M9 20h6"/></svg>'
  };

  function icon(name) { return ICONS[name] || ""; }

  /* ---------------- theme & font ---------------- */
  function nextTheme(mode) {
    return THEME_ORDER[(THEME_ORDER.indexOf(mode) + 1) % THEME_ORDER.length];
  }
  function refreshThemeBtn() {
    var btn = document.querySelector("[data-role=theme-btn]");
    if (!btn) return;
    var mode = window.SiteTheme.stored();
    var eff = window.SiteTheme.effective(mode);
    btn.setAttribute("aria-label", "切换主题，当前" + THEME_FULL[mode]);
    btn.title = mode === "auto"
      ? "跟随系统（当前" + (eff === "dark" ? "暗色" : "亮色") + "）；点击切换到亮色"
      : "当前" + THEME_FULL[mode] + "；点击切换到" + THEME_FULL[nextTheme(mode)];
  }
  window.SiteUI = {
    toggleTheme: function () {
      /* an explicit user choice outranks the ?theme= deep-link param */
      if (/[?&]theme=/.test(location.search)) {
        history.replaceState(null, "", location.pathname + location.search.replace(/[?&]theme=[^&]*/, ""));
      }
      var next = nextTheme(window.SiteTheme.stored());
      try { localStorage.setItem("bior.theme", next); } catch (e) {}
      window.SiteTheme.apply();
      refreshThemeBtn();
    },
    fontStep: function (dir) {
      var cur = parseFloat(document.documentElement.style.fontSize) / 16 || 1;
      var next = Math.min(1.4, Math.max(0.8, Math.round((cur + dir * 0.1) * 10) / 10));
      document.documentElement.style.fontSize = (16 * next) + "px";
      try { localStorage.setItem("bior.fontscale", String(next)); } catch (e) {}
    }
  };

  function tocEntryByFile() {
    var toc = window.COURSE_TOC || [];
    for (var i = 0; i < toc.length; i++) {
      if (toc[i].file && toc[i].file.split("/").pop().toLowerCase() === here) return toc[i];
    }
    return null;
  }

  /* ---------------- header ---------------- */
  var NAV_MAIN = [
    { href: "index.html", label: "首页" },
    { drawer: true, label: "课程" },
    { href: "bioviz.html", label: "绘图" },
    { href: "bioinfo.html", label: "生信" },
    { href: "cheatsheets.html", label: "速查" }
  ];
  var NAV_MORE = [
    { href: "clinic.html", label: "数据诊所" },
    { href: "stats-nav.html", label: "统计导航" },
    { href: "triage.html", label: "代码急救室" },
    { href: "datasets.html", label: "数据集标本馆" },
    { href: "project.html", label: "课题工作台" },
    { href: "glossary.html", label: "术语表" },
    { href: "about.html", label: "关于" }
  ];

  function navLink(item) {
    if (item.drawer) {
      return '<button type="button" data-nav-drawer>课程 <span class="nav-caret" aria-hidden="true">▾</span></button>';
    }
    var active = here === item.href.toLowerCase() ? ' class="active" aria-current="page"' : "";
    return '<a href="' + prefix + item.href + '"' + active + ">" + item.label + "</a>";
  }

  function buildHeader() {
    var moreActive = NAV_MORE.some(function (m) { return here === m.href.toLowerCase(); });
    var html =
      '<a class="skip-link" href="#main">跳到正文</a>' +
      '<div class="header-inner">' +
        '<a class="brand" href="' + prefix + 'index.html">' +
          '<span class="logo" aria-hidden="true">R</span>' +
          '<span class="brand-text"><b>bioR</b><small>R FOR BIOLOGY</small></span>' +
        "</a>" +
        '<nav class="header-nav" aria-label="主导航">' +
          NAV_MAIN.map(navLink).join("") +
          '<span class="nav-more' + (moreActive ? " open-active" : "") + '"><a href="' + prefix + 'clinic.html" class="' + (moreActive ? "active" : "") + '" data-more-btn>更多</a>' +
            '<span class="nav-more-menu" role="menu">' +
              NAV_MORE.map(function (m) {
                var active = here === m.href.toLowerCase() ? ' class="active" aria-current="page"' : "";
                return '<a href="' + prefix + m.href + '"' + active + " role=\"menuitem\">" + m.label + "</a>";
              }).join("") +
            "</span></span>" +
        "</nav>" +
        '<div class="header-actions">' +
          '<button class="palette-btn" type="button" data-palette title="搜索全站（Ctrl+K）" aria-label="搜索全站">' +
            icon("search") + "<span>搜索</span><kbd>Ctrl K</kbd></button>" +
          '<span class="action-caption" aria-hidden="true">字号</span>' +
          '<button class="icon-btn" type="button" data-role="font-minus" title="减小字号" aria-label="减小字号">A−</button>' +
          '<button class="icon-btn" type="button" data-role="font-plus" title="增大字号" aria-label="增大字号">A+</button>' +
          '<button class="icon-btn" type="button" data-role="theme-btn" title="切换主题" aria-label="切换主题">' + icon("theme") + "</button>" +
          '<button class="icon-btn" type="button" data-role="present-btn" title="演示模式（隐藏导航，方向键翻页）" aria-label="演示模式">' + icon("present") + "</button>" +
        "</div>" +
        '<button class="icon-btn menu-btn" type="button" data-nav-menu aria-label="打开菜单" aria-expanded="false">' + icon("menu") + "</button>" +
      "</div>";

    var header = document.createElement("header");
    header.className = "site-header";
    header.innerHTML = html;
    document.body.insertBefore(header, document.body.firstChild);

    header.querySelector("[data-role=theme-btn]").addEventListener("click", window.SiteUI.toggleTheme);
    header.querySelector("[data-role=font-minus]").addEventListener("click", function () { window.SiteUI.fontStep(-1); });
    header.querySelector("[data-role=font-plus]").addEventListener("click", function () { window.SiteUI.fontStep(1); });
    header.querySelector("[data-role=present-btn]").addEventListener("click", function () {
      location.href = location.pathname + "?present=1";
    });
    header.querySelector("[data-nav-drawer]").addEventListener("click", openDrawer);
    var menuBtn = header.querySelector("[data-nav-menu]");
    menuBtn.addEventListener("click", function () {
      var open = header.classList.toggle("nav-open");
      menuBtn.setAttribute("aria-expanded", String(open));
      if (open) openDrawer();
    });
    var more = header.querySelector(".nav-more");
    var moreBtn = header.querySelector("[data-more-btn]");
    moreBtn.addEventListener("click", function (ev) {
      ev.preventDefault();
      more.classList.toggle("open");
    });
    document.addEventListener("click", function (ev) {
      if (!more.contains(ev.target)) more.classList.remove("open");
    });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") more.classList.remove("open");
    });
    refreshThemeBtn();
  }

  /* ---------------- drawer ---------------- */
  function continueHtml() {
    var toc = window.COURSE_TOC || [];
    var progress = window.BIOR && window.BIOR.progress;
    var done = function (id) { return !!(progress && progress.chapterDone(id)); };
    var last = progress ? progress.getLast() : null;
    var entry = null;
    if (last) entry = toc.find(function (c) { return c.id === last && !done(c.id); });
    if (!entry) entry = toc.find(function (c) { return !done(c.id); });
    if (!entry) return '<p class="small muted">18 章全部完成。可以直接去课题工作台整理交付物。</p>';
    return '<a class="d-item drawer-continue" href="' + prefix + entry.file + '">' +
      '<span class="d-no">' + entry.id.toUpperCase() + "</span>" +
      "<span><b>继续学习：" + esc(entry.title) + "</b><small>" + esc(entry.question || "") + "</small></span></a>";
  }

  function buildDrawer() {
    var toc = window.COURSE_TOC || [];
    var specials = window.BIOR_SPECIALS || [];
    var html = '<div class="drawer-panel" role="dialog" aria-modal="true" aria-label="课程与专栏目录">' +
      '<div class="drawer-head"><span class="kicker">COURSE INDEX</span>' +
      '<button type="button" class="icon-btn" data-drawer-close aria-label="关闭">' + icon("close") + "</button></div>" +
      continueHtml() +
      "<h3>主线课程 · 18 章</h3>";
    var lastPart = null;
    toc.forEach(function (c) {
      if (c.part !== lastPart) {
        lastPart = c.part;
        html += '<p class="small muted" style="margin:10px 0 2px;font-family:var(--bio-mono);font-size:.66rem;letter-spacing:.12em">' + esc(PART_LABEL[c.part] || "") + "</p>";
      }
      var active = here === c.file.split("/").pop().toLowerCase();
      html += '<a class="d-item' + (active ? " active" : "") + '" href="' + prefix + c.file + '">' +
        '<span class="d-no">' + c.id.slice(2) + "</span>" +
        "<span><b>" + esc(c.title) + "</b><small>" + esc(c.question || "") + "</small></span></a>";
    });
    html += "<h3>专栏</h3>";
    specials.forEach(function (s) {
      if (!s.file) return;
      html += '<a class="d-item" href="' + prefix + s.file + '">' +
        '<span class="d-no">' + esc((s.id || "??").slice(0, 2).toUpperCase()) + "</span>" +
        "<span><b>" + esc(s.title) + "</b><small>" + esc(s.desc || "") + "</small></span></a>";
    });
    html += "</div>";

    var box = document.createElement("div");
    box.className = "drawer";
    box.setAttribute("aria-hidden", "true");
    box.innerHTML = html;
    document.body.appendChild(box);
    box.addEventListener("click", function (ev) {
      if (ev.target === box || ev.target.closest("[data-drawer-close]")) closeDrawer();
    });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && box.classList.contains("open")) closeDrawer();
    });
  }
  function openDrawer() {
    var box = document.querySelector(".drawer");
    if (!box) return;
    box.classList.add("open");
    box.setAttribute("aria-hidden", "false");
    var first = box.querySelector("a, button");
    if (first) first.focus();
  }
  function closeDrawer() {
    var box = document.querySelector(".drawer");
    if (!box) return;
    box.classList.remove("open");
    box.setAttribute("aria-hidden", "true");
    var menuBtn = document.querySelector("[data-nav-menu]");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
  }

  /* ---------------- footer ---------------- */
  function footerCol(title, links) {
    return "<div><h4>" + title + "</h4><ul>" +
      links.map(function (l) {
        return '<li><a href="' + prefix + l[0] + '">' + l[1] + "</a></li>";
      }).join("") + "</ul></div>";
  }

  function buildFooter() {
    var toc = window.COURSE_TOC || [];
    var first6 = toc.slice(0, 6).map(function (c) {
      return [c.file, c.id.replace("ch", "第 ") + " 章 · " + (c.short || c.title)];
    });
    var f = document.createElement("footer");
    f.className = "site-footer";
    f.innerHTML = '<div class="footer-inner">' +
      '<div class="footer-brand"><b>bioR · 生物科研 R 语言工作台</b>' +
      "<p>把 R 学成一条从实验台走到论文图的研究路线。设计语言参考 cpp_website/v2（纸墨编辑部风），内容面向生物科研场景。</p></div>" +
      footerCol("课程", first6.concat([["index.html#route", "全部 18 章 →"]])) +
      footerCol("专栏", [
        ["bioviz.html", "生物绘图专区"],
        ["bioinfo.html", "生物信息专区"],
        ["clinic.html", "数据诊所"],
        ["stats-nav.html", "统计导航"],
        ["triage.html", "R 代码急救室"],
        ["datasets.html", "数据集标本馆"]
      ]) +
      footerCol("参考", [
        ["cheatsheets.html", "速查表"],
        ["glossary.html", "术语表"],
        ["project.html", "课题工作台"],
        ["about.html", "关于与许可"]
      ]) +
      "</div>" +
      '<div class="footer-legal"><span>本站内容为教学模拟数据，不构成临床或科研结论。</span>' +
      "<span>离线可用 · 无追踪 · v" + (window.BIOR.version || "1.0.0") + "</span></div>";
    document.body.appendChild(f);
  }

  /* ---------------- chapter pager ---------------- */
  function buildPager() {
    if (document.body.getAttribute("data-page") !== "chapter") return;
    var toc = window.COURSE_TOC || [];
    var entry = tocEntryByFile();
    if (!entry) return;
    var idx = toc.indexOf(entry);
    var prev = toc[idx - 1], next = toc[idx + 1];
    var pager = document.createElement("nav");
    pager.className = "pager";
    pager.setAttribute("aria-label", "章节翻页");
    function side(c, dir) {
      if (!c) return '<span aria-hidden="true"></span>';
      return '<a class="' + (dir === 1 ? "pager-next" : "") + '" href="' + prefix + c.file + '">' +
        '<span class="p-dir">' + (dir === 1 ? "下一章 →" : "← 上一章") + "</span>" +
        "<b>" + esc(c.id.replace("ch", "第 ") + " 章 · " + c.title) + "</b></a>";
    }
    pager.innerHTML = side(prev, -1) +
      '<a class="p-index" href="' + prefix + 'index.html#route"><span class="p-dir">返回</span><b>研究路线</b></a>' +
      side(next, 1);
    var main = document.getElementById("main") || document.querySelector("main");
    if (main) main.appendChild(pager);
  }

  function init() {
    buildHeader();
    buildDrawer();
    buildFooter();
    buildPager();
    if (window.matchMedia) {
      var mq = window.matchMedia("(prefers-color-scheme: dark)");
      var onMq = function () { refreshThemeBtn(); };
      if (mq.addEventListener) mq.addEventListener("change", onMq);
      else if (mq.addListener) mq.addListener(onMq);
    }
    window.addEventListener("storage", function (e) {
      if (e.key === "bior.theme") {
        window.SiteTheme.apply();
        refreshThemeBtn();
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
