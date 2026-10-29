/* ============================================================
 * presenter.js — presentation & teacher modes (view-only):
 *   ?present=1  hides chrome, arrow keys page between h2 sections, Esc exits
 *   ?teacher=1  or Ctrl+Alt+T reveals quiz answers (quiz.js reads it)
 * Neither mode writes state (teacher flag in sessionStorage only).
 * ============================================================ */
(function () {
  "use strict";

  var presenting = /[?&]present=1/.test(location.search);
  var sections = [];

  function collect() {
    sections = Array.prototype.slice.call(
      document.querySelectorAll("#main > h2, #main > section > h2, .chapter-reading > h2")
    );
  }

  function currentIdx() {
    var best = 0, bestTop = -Infinity;
    sections.forEach(function (s, i) {
      var top = s.getBoundingClientRect().top;
      if (top <= 140 && top > bestTop) { bestTop = top; best = i; }
    });
    return best;
  }

  function go(dir) {
    if (!sections.length) collect();
    var i = Math.max(0, Math.min(sections.length - 1, currentIdx() + dir));
    sections[i].scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function applyPresent(on) {
    document.body.classList.toggle("presenting", on);
  }

  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape" && presenting) {
      presenting = false;
      applyPresent(false);
      history.replaceState(null, "", location.pathname + location.search.replace(/[?&]present=1/, ""));
      return;
    }
    if (ev.ctrlKey && ev.altKey && (ev.key === "T" || ev.key === "t")) {
      try { sessionStorage.setItem("bior.teacher", sessionStorage.getItem("bior.teacher") === "1" ? "0" : "1"); } catch (e) {}
      return;
    }
    if (!presenting) return;
    if (ev.key === "ArrowRight" || ev.key === "PageDown") { ev.preventDefault(); go(1); }
    if (ev.key === "ArrowLeft" || ev.key === "PageUp") { ev.preventDefault(); go(-1); }
  });

  if (presenting) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () { applyPresent(true); });
    } else applyPresent(true);
  }
})();
