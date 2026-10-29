/* ============================================================
 * toc.js — scrollspy for the chapter right rail: keeps the current
 * h2 highlighted in .rail-toc and the matching field note marked.
 * ============================================================ */
(function () {
  "use strict";

  function init() {
    var tocLinks = document.querySelectorAll(".rail-toc a[href^='#']");
    if (!tocLinks.length) return;
    var map = [];
    tocLinks.forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      var target = document.getElementById(id);
      if (target) map.push({ id: id, el: target, link: a });
    });
    if (!map.length) return;

    var current = -1;
    function setActive(i) {
      if (i === current) return;
      current = i;
      tocLinks.forEach(function (a) { a.parentNode.classList.remove("current"); });
      map[i].link.parentNode.classList.add("current");
      document.querySelectorAll(".field-notes li[data-section]").forEach(function (li) {
        li.classList.toggle("current", li.getAttribute("data-section") === map[i].id);
      });
    }

    if ("IntersectionObserver" in window) {
      var visible = {};
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          visible[en.target.id] = en.isIntersecting ? en.intersectionRatio : 0;
        });
        var best = -1, bestVal = 0;
        map.forEach(function (m, i) {
          var v = visible[m.id] || 0;
          if (v > bestVal) { bestVal = v; best = i; }
        });
        if (best === -1) {
          // none visible: pick the last section above viewport
          var below = -1;
          map.forEach(function (m, i) {
            if (m.el.getBoundingClientRect().top < 140) below = i;
          });
          best = below === -1 ? 0 : below;
        }
        setActive(best);
      }, { rootMargin: "-72px 0px -40% 0px", threshold: [0, 0.15, 0.5, 1] });
      map.forEach(function (m) { io.observe(m.el); });
    } else {
      var onScroll = function () {
        var idx = 0;
        map.forEach(function (m, i) {
          if (m.el.getBoundingClientRect().top < 140) idx = i;
        });
        setActive(idx);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
