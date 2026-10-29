/* ============================================================
 * quiz.js — sequential quiz cards (mcq / tf / fill / mfill / code / plot).
 * Answers hidden until submitted; explanations inline; teacher mode
 * (?teacher=1) reveals. Does not write progress (doc 05 §3.3).
 * ============================================================ */
(function () {
  "use strict";
  var B = window.BIOR;
  var esc = B.escapeHtml;
  var TEACHER = /[?&]teacher=1/.test(location.search) ||
    (function () { try { return sessionStorage.getItem("bior.teacher") === "1"; } catch (e) { return false; } })();

  function norm(s) {
    return String(s).trim().toLowerCase().replace(/\s+/g, " ");
  }

  function initQuiz(section) {
    var dataEl = section.querySelector("script.quiz-data");
    if (!dataEl) return;
    var data;
    try { data = JSON.parse(dataEl.textContent); } catch (e) {
      if (window.console) console.warn("bad quiz JSON", e); return;
    }
    var qs = data.questions || [];
    if (!qs.length) return;

    var head = document.createElement("div");
    head.className = "quiz-head";
    var title = document.createElement("b");
    title.textContent = data.title || "随堂测验";
    var prog = document.createElement("span");
    prog.className = "quiz-progress";
    head.appendChild(title); head.appendChild(prog);
    var body = document.createElement("div");
    body.className = "quiz-body";
    var actions = document.createElement("div");
    actions.className = "quiz-actions";
    section.appendChild(head); section.appendChild(body); section.appendChild(actions);

    var i = 0, right = 0, wrong = 0, answered = false;

    function renderProgress() {
      prog.innerHTML = '<span class="qp-done">' + right + "</span> / " + qs.length +
        (wrong ? ' · <span class="qp-wrong">' + wrong + " 错</span>" : "");
    }

    function finish() {
      body.innerHTML = "";
      var sum = document.createElement("div");
      sum.className = "quiz-summary";
      sum.innerHTML = "<h3>测验完成</h3><div class='qs-score'>" + right + " / " + qs.length + "</div>";
      var msg = right === qs.length
        ? "全对。可以把这一章标记为「已学完」，然后看下一章的科研任务。"
        : "错题的解释再读一遍；统计相关错题回到本章「科研判断」小节。";
      sum.appendChild(Object.assign(document.createElement("p"), { textContent: msg }));
      body.appendChild(sum);
      actions.innerHTML = "";
      var restart = document.createElement("button");
      restart.className = "btn";
      restart.textContent = "重新开始";
      restart.addEventListener("click", function () { i = 0; right = 0; wrong = 0; renderProgress(); renderQ(); });
      actions.appendChild(restart);
      var hint = document.createElement("span");
      hint.className = "qa-hint";
      hint.textContent = "测验不计入进度；进度由「标记完成」控制。";
      actions.appendChild(hint);
    }

    function submitFill(input, q, explainBox, optBtns) {
      var val = norm(input.value);
      var ok = false;
      if (Array.isArray(q.answer)) ok = q.answer.some(function (a) { return norm(a) === val; });
      else ok = norm(q.answer) === val;
      showResult(ok, q, explainBox, optBtns, input.value);
    }

    function showResult(ok, q, explainBox, optBtns, given) {
      answered = true;
      if (ok) right++; else wrong++;
      renderProgress();
      explainBox.className = "quiz-explain" + (ok ? "" : " is-wrong");
      explainBox.innerHTML = "<p><b>" + (ok ? "✓ 正确。" : "✗ 不对。") + "</b> " + q.explain + "</p>";
      explainBox.hidden = false;
      if (optBtns) {
        optBtns.forEach(function (b) { b.disabled = true; });
      }
      var next = document.createElement("button");
      next.className = "btn btn-primary";
      next.textContent = i + 1 < qs.length ? "下一题 →" : "查看结果";
      next.addEventListener("click", function () {
        i += 1;
        if (i >= qs.length) finish(); else renderQ();
      });
      actions.innerHTML = "";
      actions.appendChild(next);
      next.focus();
    }

    function renderQ() {
      answered = false;
      actions.innerHTML = "";
      var q = qs[i];
      body.innerHTML = "";
      var no = document.createElement("p");
      no.className = "quiz-progress";
      no.style.margin = "0 0 8px";
      no.textContent = "第 " + (i + 1) + " 题 · " + (q.skill || "") + (TEACHER ? " · 带教模式" : "");
      body.appendChild(no);
      var qq = document.createElement("p");
      qq.className = "quiz-q";
      qq.innerHTML = q.q;
      body.appendChild(qq);
      if (q.code) {
        var pre = document.createElement("pre");
        pre.className = "quiz-code";
        pre.textContent = q.code;
        body.appendChild(pre);
      }
      var explainBox = document.createElement("div");
      explainBox.className = "quiz-explain";
      explainBox.hidden = true;

      var optBtns = [];

      if (q.type === "mcq" || q.type === "plot") {
        var opts = document.createElement("div");
        opts.className = "quiz-opts";
        q.options.forEach(function (opt, oi) {
          var b = document.createElement("button");
          b.type = "button";
          b.className = "quiz-opt";
          b.innerHTML = '<span class="qo-key">' + "ABCD"[oi] + "</span><span>" + opt + "</span>";
          b.addEventListener("click", function () {
            if (answered) return;
            opts.querySelectorAll(".quiz-opt").forEach(function (x, xi) {
              x.disabled = true;
              if (xi === q.answer) x.classList.add("correct");
            });
            if (oi !== q.answer) b.classList.add("wrong");
            showResult(oi === q.answer, q, explainBox, optBtns);
          });
          if (TEACHER && oi === q.answer) b.classList.add("correct");
          opts.appendChild(b);
          optBtns.push(b);
        });
        body.appendChild(opts);
      } else if (q.type === "tf") {
        var tf = document.createElement("div");
        tf.className = "quiz-opts";
        [["对", true], ["错", false]].forEach(function (pair, oi) {
          var b = document.createElement("button");
          b.type = "button";
          b.className = "quiz-opt";
          b.innerHTML = '<span class="qo-key">' + "TF"[oi] + "</span><span>" + pair[0] + "</span>";
          b.addEventListener("click", function () {
            if (answered) return;
            tf.querySelectorAll(".quiz-opt").forEach(function (x) { x.disabled = true; });
            if (pair[1] === q.answer) b.classList.add("correct"); else b.classList.add("wrong");
            showResult(pair[1] === q.answer, q, explainBox, optBtns);
          });
          if (TEACHER && pair[1] === q.answer) b.classList.add("correct");
          tf.appendChild(b);
          optBtns.push(b);
        });
        body.appendChild(tf);
      } else if (q.type === "fill" || q.type === "code") {
        var wrap = document.createElement("div");
        var input = document.createElement("input");
        input.className = "quiz-input";
        input.placeholder = q.type === "code" ? "填写缺失的代码" : "输入答案";
        input.setAttribute("aria-label", "答案输入框");
        input.addEventListener("keydown", function (ev) {
          if (ev.key === "Enter" && !answered && input.value.trim()) {
            submitFill(input, q, explainBox, optBtns);
          }
        });
        wrap.appendChild(input);
        body.appendChild(wrap);
        var check = document.createElement("button");
        check.className = "btn btn-primary";
        check.textContent = "提交";
        check.addEventListener("click", function () {
          if (!answered && input.value.trim()) submitFill(input, q, explainBox, optBtns);
        });
        actions.appendChild(check);
        actions.insertAdjacentHTML("beforeend", '<span class="qa-hint">回车也可提交</span>');
        setTimeout(function () { input.focus(); }, 0);
      } else if (q.type === "mfill") {
        var holder = document.createElement("div");
        holder.className = "quiz-opts";
        var parts = String(q.code).split("____");
        var inputs = [];
        holder.appendChild(Object.assign(document.createElement("p"), {
          innerHTML: "在代码的空格处填空（共 " + q.blanks.length + " 处）："
        }));
        var codeLine = document.createElement("pre");
        codeLine.className = "quiz-code";
        codeLine.innerHTML = "";
        var frag = document.createDocumentFragment();
        parts.forEach(function (p, pi) {
          frag.appendChild(document.createTextNode(p));
          if (pi < q.blanks.length) {
            var span = document.createElement("span");
            span.className = "quiz-blank";
            var inp = document.createElement("input");
            inp.setAttribute("aria-label", "第 " + (pi + 1) + " 空");
            span.appendChild(inp);
            frag.appendChild(span);
            inputs.push(inp);
          }
        });
        codeLine.appendChild(frag);
        holder.appendChild(codeLine);
        body.appendChild(holder);
        var mcheck = document.createElement("button");
        mcheck.className = "btn btn-primary";
        mcheck.textContent = "提交";
        mcheck.addEventListener("click", function () {
          if (answered) return;
          var allOk = q.blanks.every(function (bl, bi) {
            var v = norm(inputs[bi].value);
            var answers = Array.isArray(bl.answer) ? bl.answer : [bl.answer];
            return answers.some(function (a) { return norm(a) === v; });
          });
          inputs.forEach(function (inp, bi) {
            var v = norm(inp.value);
            var answers = Array.isArray(q.blanks[bi].answer) ? q.blanks[bi].answer : [q.blanks[bi].answer];
            var okThis = answers.some(function (a) { return norm(a) === v; });
            inp.style.borderBottomColor = okThis ? "var(--bio-green)" : "var(--bio-danger)";
          });
          showResult(allOk, q, explainBox, optBtns);
        });
        actions.appendChild(mcheck);
      }

      body.appendChild(explainBox);
    }

    renderProgress();
    renderQ();
  }

  function init() {
    document.querySelectorAll(".quiz[data-source]").forEach(initQuiz);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.BIOR.quizTeacher = function () { return TEACHER; };
})();
