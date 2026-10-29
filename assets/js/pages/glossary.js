/* ============================================================
 * pages/glossary.js — glossary page renderer: category chips,
 * text search, English initial index, term cards.
 * ============================================================ */
(function () {
  "use strict";

  var DATA = window.BIOR_GLOSSARY || [];
  var cat = "", q = "", letter = "";

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function initial(term) {
    var m = String(term.en || "").trim().match(/^[A-Za-z]/);
    return m ? m[0].toUpperCase() : "#";
  }

  function card(t) {
    var art = document.createElement("article");
    art.className = "term-card";
    art.id = "term-" + t.id;
    art.setAttribute("data-cat", t.cat || "");
    art.setAttribute("data-letter", initial(t));
    art.innerHTML =
      '<div class="term-head"><h3>' + esc(t.term) +
        ' <span class="term-en">' + esc(t.en) + "</span></h3>" +
        '<span class="term-cat">' + esc(t.cat || "") + "</span></div>" +
      '<p class="term-def">' + esc(t.def) + "</p>" +
      (t.formula ? '<div class="term-formula"><span>公式</span><code>' + esc(t.formula) + "</code></div>" : "") +
      (t.r ? '<div class="term-r"><span>R</span><code>' + esc(t.r) + "</code></div>" : "") +
      (t.href ? '<div class="term-foot"><a href="' + esc(t.href) + '">相关章节 →</a></div>' : "");
    return art;
  }

  function buildIndex() {
    var box = $("gl-index");
    if (!box) return;
    var letters = [];
    DATA.forEach(function (t) {
      var L = initial(t);
      if (letters.indexOf(L) < 0) letters.push(L);
    });
    letters.sort();
    box.innerHTML = '<button type="button" class="gl-letter active" data-letter="">全部</button>' +
      letters.map(function (L) { return '<button type="button" class="gl-letter" data-letter="' + L + '">' + L + "</button>"; }).join("");
  }

  function matches(t) {
    if (cat && t.cat !== cat) return false;
    if (letter && initial(t) !== letter) return false;
    if (!q) return true;
    var hay = [t.term, t.en, t.def, t.r || "", t.formula || ""].join(" ").toLowerCase();
    return hay.indexOf(q) >= 0;
  }

  function apply() {
    var grid = $("term-grid");
    if (!grid) return;
    var shown = 0;
    grid.innerHTML = "";
    DATA.forEach(function (t) {
      if (!matches(t)) return;
      grid.appendChild(card(t));
      shown++;
    });
    var count = $("gl-count");
    if (count) count.textContent = shown + " / " + DATA.length + " 个术语" +
      (cat ? " · " + cat : "") + (letter ? " · " + letter : "");
    var empty = $("gl-empty");
    if (empty) empty.hidden = shown > 0;
    Array.prototype.forEach.call(document.querySelectorAll("#gl-cats .filter-chip"), function (b) {
      b.classList.toggle("active", (b.getAttribute("data-cat") || "") === cat);
    });
    Array.prototype.forEach.call(document.querySelectorAll(".gl-letter"), function (b) {
      b.classList.toggle("active", (b.getAttribute("data-letter") || "") === letter);
    });
  }

  function init() {
    buildIndex();
    var catBox = $("gl-cats");
    if (catBox) catBox.addEventListener("click", function (e) {
      var b = e.target.closest(".filter-chip");
      if (!b) return;
      cat = b.getAttribute("data-cat") || "";
      apply();
    });
    var idx = $("gl-index");
    if (idx) idx.addEventListener("click", function (e) {
      var b = e.target.closest(".gl-letter");
      if (!b) return;
      letter = b.getAttribute("data-letter") || "";
      apply();
    });
    var input = $("gl-q");
    if (input) input.addEventListener("input", function () {
      q = input.value.trim().toLowerCase();
      apply();
    });
    var reset = $("gl-reset");
    if (reset) reset.addEventListener("click", function () {
      cat = ""; q = ""; letter = "";
      if (input) input.value = "";
      apply();
    });
    apply();
    if (location.hash.indexOf("#term-") === 0) {
      var t = document.getElementById(location.hash.slice(1));
      if (t) t.scrollIntoView({ behavior: "instant", block: "start" });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
