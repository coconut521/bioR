/* ============================================================
 * mastery.js — three-state mastery buttons for learning objectives.
 * State stored per objective id "chNN-oM"; "不知道" items surface on
 * the home "需要回看" panel. No scores, no ranking.
 * ============================================================ */
(function () {
  "use strict";

  var STATES = [
    { key: "know", label: "知道" },
    { key: "unsure", label: "不确定" },
    { key: "no", label: "不知道" }
  ];

  function initObjectives(section) {
    var ch = document.body.getAttribute("data-chapter");
    if (!ch) return;
    var lis = section.querySelectorAll("ul > li");
    lis.forEach(function (li, idx) {
      var id = ch + "-o" + (idx + 1);
      li.setAttribute("data-mastery-id", id);
      var btns = document.createElement("span");
      btns.className = "mastery-btns";
      btns.setAttribute("role", "group");
      btns.setAttribute("aria-label", "掌握度");
      var cur = window.BIOR.progress.getMastery(id);
      STATES.forEach(function (s) {
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = s.label;
        b.setAttribute("aria-pressed", String(cur === s.key));
        b.addEventListener("click", function () {
          var now = window.BIOR.progress.getMastery(id);
          var next = now === s.key ? null : s.key;
          window.BIOR.progress.setMastery(id, next);
          btns.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
          if (next) b.setAttribute("aria-pressed", "true");
          li.classList.remove("mastery-know", "mastery-unsure", "mastery-no");
          if (next) li.classList.add("mastery-" + next);
        });
        btns.appendChild(b);
      });
      li.appendChild(btns);
      if (cur) li.classList.add("mastery-" + cur);
    });
  }

  function init() {
    document.querySelectorAll(".objectives").forEach(initObjectives);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
