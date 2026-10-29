/* ============================================================
 * listing.js — turns <pre class="ex-code" data-example="...">
 * into a bench: header bar (copy / download / output / steps),
 * highlighted lines with unselectable line numbers, raw-fidelity copy.
 * Runs after highlight-r.js. Does not implement stepping (stepper.js).
 * ============================================================ */
(function () {
  "use strict";
  var B = window.BIOR;

  function rel() {
    return /\/chapters\/[^/]*$/.test(decodeURIComponent(location.pathname)) ? "../" : "";
  }

  function buildCard(pre) {
    var raw = pre.textContent.replace(/\r\n/g, "\n").replace(/\n+$/, "\n");
    var id = pre.getAttribute("data-example") || "";
    var card = pre.closest(".example-card");
    var wrapper = document.createElement("div");
    wrapper.className = "listing";

    var head = document.createElement("div");
    head.className = "listing-head";
    var label = document.createElement("span");
    label.className = "lh-label";
    label.textContent = "LISTING " + id.replace(/^(.*?)-?(ex-\d+)$/, "$2").toUpperCase() + " · R · " +
      raw.split("\n").filter(function (l, i, a) { return !(i === a.length - 1 && l === ""); }).length + " lines";
    var actions = document.createElement("span");
    actions.className = "lh-actions";
    head.appendChild(label); head.appendChild(actions);

    var codeBox = document.createElement("div");
    codeBox.className = "listing-code";
    var code = document.createElement("code");
    code.className = "r";
    codeBox.appendChild(code);

    wrapper.appendChild(head); wrapper.appendChild(codeBox);
    pre.parentNode.insertBefore(wrapper, pre);
    pre.remove();

    var lines = B.highlightR(raw);
    lines.forEach(function (html, idx) {
      var span = document.createElement("span");
      span.className = "cl";
      span.setAttribute("data-line", String(idx + 1));
      span.innerHTML = html;
      code.appendChild(span);
    });

    function mkBtn(text, fn, title) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = text;
      if (title) { b.title = title; b.setAttribute("aria-label", title); }
      b.addEventListener("click", fn);
      return b;
    }

    actions.appendChild(mkBtn("复制", function () {
      B.copyText(raw).then(function (ok) {
        this.textContent = ok ? "已复制" : "复制失败";
        var btn = this;
        setTimeout(function () { btn.textContent = "复制"; }, 1400);
      }.bind(this));
    }, "复制原始代码"));

    actions.appendChild(mkBtn("下载 .R", function () {
      var blob = new Blob(["# bioR teaching script — " + id + "\n# Copy files from assets/data/ before running.\n\n" + raw],
        { type: "text/plain;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = id + ".R";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 3000);
    }, "下载为本章脚本片段"));

    var outBox = card && card.querySelector('.ex-output[data-output-for="' + id + '"]');
    if (outBox) {
      var btn = mkBtn("输出", function () {
        outBox.hidden = !outBox.hidden;
        btn.classList.toggle("on", !outBox.hidden);
      }, "显示/隐藏 R console 输出");
      actions.appendChild(btn);
    }

    var steps = card && card.querySelector("script.ex-steps");
    if (steps) {
      var sb = mkBtn("单步", function () {
        B.emit("bior:toggle-steps", { example: id });
      }, "逐行单步执行讲解");
      actions.appendChild(sb);
    }
  }

  function init() {
    document.querySelectorAll("pre.ex-code[data-example]").forEach(buildCard);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
