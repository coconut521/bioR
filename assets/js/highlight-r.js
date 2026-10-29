/* ============================================================
 * highlight-r.js — small R tokenizer producing per-line HTML.
 * Handles comments, strings, numbers, keywords, NULL/NA family and
 * function calls. Escapes & < > itself; input must be raw text.
 * Exposes window.BIOR.highlightR(code) -> array of HTML lines.
 * ============================================================ */
(function () {
  "use strict";
  var esc = function (s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  };

  var KEYWORDS = {
    "if": 1, "else": 1, "for": 1, "while": 1, "repeat": 1, "break": 1,
    "next": 1, "function": 1, "return": 1, "in": 1, "library": 0
  };
  var CONSTS = {
    "TRUE": 1, "FALSE": 1, "NULL": 1, "NA": 1, "NA_integer_": 1,
    "NA_real_": 1, "NA_character_": 1, "NA_complex_": 1, "Inf": 1, "NaN": 1
  };

  function hlLine(src) {
    var out = "", i = 0, n = src.length;
    while (i < n) {
      var ch = src.charAt(i);
      if (ch === "#") { out += '<span class="tok-cmt">' + esc(src.slice(i)) + "</span>"; break; }
      if (ch === '"' || ch === "'") {
        var q = ch, j = i + 1;
        while (j < n) {
          if (src.charAt(j) === "\\") j += 2;
          else if (src.charAt(j) === q) { j++; break; }
          else j++;
        }
        out += '<span class="tok-str">' + esc(src.slice(i, Math.min(j, n))) + "</span>";
        i = Math.min(j, n); continue;
      }
      if (/[0-9]/.test(ch) || (ch === "." && /[0-9]/.test(src.charAt(i + 1) || ""))) {
        var k = i;
        while (k < n && /[0-9a-fA-FxX._]/.test(src.charAt(k))) k++;
        // allow exponent forms like 1e-3 / 2.5E+4
        if ((src.charAt(k) === "e" || src.charAt(k) === "E") && /[0-9+\-]/.test(src.charAt(k + 1) || "")) {
          k += 2;
          while (k < n && /[0-9]/.test(src.charAt(k))) k++;
        }
        out += '<span class="tok-num">' + esc(src.slice(i, k)) + "</span>";
        i = k; continue;
      }
      if (/[A-Za-z.]/.test(ch)) {
        var m = i;
        while (m < n && /[\w.]/.test(src.charAt(m))) m++;
        var word = src.slice(i, m);
        var cls = null;
        if (KEYWORDS[word]) cls = "tok-kw";
        else if (CONSTS[word]) cls = "tok-null";
        else {
          var p = m;
          while (p < n && src.charAt(p) === " ") p++;
          if (src.charAt(p) === "(") cls = "tok-fn";
        }
        out += cls ? '<span class="' + cls + '">' + esc(word) + "</span>" : esc(word);
        i = m; continue;
      }
      out += esc(ch); i++;
    }
    return out || "&nbsp;";
  }

  window.BIOR = window.BIOR || {};
  window.BIOR.highlightR = function (code) {
    var lines = String(code).replace(/\r\n/g, "\n").split("\n");
    while (lines.length && lines[lines.length - 1] === "") lines.pop();
    return lines.map(hlLine);
  };
})();
