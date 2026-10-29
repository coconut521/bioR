/* ============================================================
 * theme-init.js — theme/fontscale preset, sync in <head>.
 * bior.theme: "light" | "dark" | "auto" (follow system; default light)
 * Exposes window.SiteTheme for nav.js reuse. Must not touch DOM content.
 * ============================================================ */
(function () {
  "use strict";
  var mql = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function stored() {
    /* ?theme=light|dark|auto overrides storage (deep-linking & visual audits) */
    try {
      var q = new URLSearchParams(location.search).get("theme");
      if (q === "light" || q === "dark" || q === "auto") return q;
    } catch (e) {}
    try {
      var t = localStorage.getItem("bior.theme");
      return (t === "light" || t === "dark" || t === "auto") ? t : "light";
    } catch (e) { return "light"; }
  }
  function effective(mode) {
    if (mode === "auto") return (mql && mql.matches) ? "dark" : "light";
    return mode;
  }
  function apply() {
    var eff = effective(stored());
    if (eff === "dark") document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");
    return eff;
  }

  apply();
  try {
    var f = parseFloat(localStorage.getItem("bior.fontscale"));
    if (f > 0) document.documentElement.style.fontSize = (16 * f) + "px";
  } catch (e) {}

  if (mql) {
    var onChange = function () { if (stored() === "auto") apply(); };
    if (mql.addEventListener) mql.addEventListener("change", onChange);
    else if (mql.addListener) mql.addListener(onChange);
  }

  window.SiteTheme = { stored: stored, effective: effective, apply: apply };
})();
