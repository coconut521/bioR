/* ============================================================
 * glossary.js — wraps first occurrences of glossary terms in main
 * text with a hover tooltip. Skips code, listings, links, headings.
 * Data: window.BIOR_GLOSSARY = [{term, en, aliases, def, href}]
 * ============================================================ */
(function () {
  "use strict";

  var SKIP = { PRE: 1, CODE: 1, SCRIPT: 1, STYLE: 1, A: 1, KBD: 1, H1: 1, H2: 1, H3: 1, H4: 1, FIGCAPTION: 1, BUTTON: 1, TEXTAREA: 1, INPUT: 1, SUMMARY: 1 };
  var wrapped = false;

  function buildIndex() {
    var g = window.BIOR_GLOSSARY || [];
    var idx = [];
    g.forEach(function (t) {
      var names = [t.term].concat(t.aliases || []);
      names.forEach(function (n) {
        if (n && n.length >= 2) idx.push({ name: n, item: t, used: false });
      });
    });
    idx.sort(function (a, b) { return b.name.length - a.name.length; });
    return idx;
  }

  function wrapText(textNode, idx) {
    var text = textNode.nodeValue;
    var hit = null, hitAt = -1;
    for (var k = 0; k < idx.length; k++) {
      if (idx[k].used) continue;
      var at = text.indexOf(idx[k].name);
      if (at !== -1 && (hit === null || at < hitAt)) { hit = idx[k]; hitAt = at; }
    }
    if (!hit) return;
    idx[0]; // noop
    hit.used = true;
    var term = hit.item;
    var frag = document.createDocumentFragment();
    frag.appendChild(document.createTextNode(text.slice(0, hitAt)));
    var span = document.createElement("span");
    span.className = "gloss-term";
    span.setAttribute("tabindex", "0");
    span.setAttribute("role", "button");
    span.setAttribute("aria-label", term.term + "：" + (term.en || ""));
    span.textContent = hit.name;
    frag.appendChild(span);
    frag.appendChild(document.createTextNode(text.slice(hitAt + hit.name.length)));
    textNode.parentNode.replaceChild(frag, textNode);

    var tip = null;
    function show() {
      if (tip) return;
      tip = document.createElement("div");
      tip.className = "gloss-tip";
      tip.setAttribute("role", "tooltip");
      tip.innerHTML = "<b>" + term.term + "</b>" +
        (term.en ? '<span class="gt-en">' + term.en + "</span>" : "") +
        "<div>" + term.def + "</div>" +
        (term.href ? '<a href="' + term.href + '" style="color:inherit">→ 相关章节</a>' : "");
      document.body.appendChild(tip);
      var r = span.getBoundingClientRect();
      var tw = tip.offsetWidth, th = tip.offsetHeight;
      var x = Math.min(window.innerWidth - tw - 8, Math.max(8, r.left + r.width / 2 - tw / 2));
      var y = r.top - th - 8;
      if (y < 8) y = r.bottom + 8;
      tip.style.left = x + "px";
      tip.style.top = y + "px";
    }
    function hide() { if (tip) { tip.remove(); tip = null; } }
    span.addEventListener("mouseenter", show);
    span.addEventListener("mouseleave", hide);
    span.addEventListener("focus", show);
    span.addEventListener("blur", hide);
    window.addEventListener("scroll", hide, { passive: true });
  }

  function walk(node, idx) {
    if (wrapped) return;
    node.childNodes.forEach(function (n) {
      if (n.nodeType === 3) {
        if (n.nodeValue.trim()) wrapText(n, idx);
      } else if (n.nodeType === 1) {
        if (SKIP[n.tagName]) return;
        walk(n, idx);
      }
    });
  }

  function init() {
    if (!window.BIOR_GLOSSARY || !window.BIOR_GLOSSARY.length) return;
    var main = document.getElementById("main") || document.querySelector("main");
    if (!main) return;
    var idx = buildIndex();
    walk(main, idx);
    wrapped = true;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
