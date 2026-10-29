/* ============================================================
 * pages/stats-nav.js — four-question decision tree producing a
 * result card (test, R function, assumptions, effect size,
 * reporting template, pitfalls, chapter links) + sentence builder.
 * ============================================================ */
(function () {
  "use strict";

  var RESULTS = {
    describe: {
      test: "描述统计（不做检验）",
      fn: "summarise(mean, sd, median, IQR)",
      prereq: "先看图判断分布形状；偏态用中位数(IQR)。",
      effect: "不适用——描述不是推断。",
      report: "Values are reported as mean ± SD (or median with IQR where skewed).",
      avoid: "给描述统计配 p 值；把「看起来不同」写成显著。",
      ch: "ch10", cheat: "table1"
    },
    welch: {
      test: "Welch t 检验（两组独立）",
      fn: "t.test(y ~ g, data = d)  /* var.equal = FALSE 默认 */",
      prereq: "独立观测；近似正态（图 + Shapiro 辅助）；不要求方差齐。",
      effect: "Cohen's d + 95% CI",
      report: "A two-sided Welch t-test showed a mean difference of __ (95% CI __ to __; Cohen's d = __; p = __).",
      avoid: "用 Student 而方差不齐；只报 p 不报 CI。",
      ch: "ch11", cheat: "report-sentences"
    },
    paired: {
      test: "配对 t 检验",
      fn: "t.test(x, y, paired = TRUE)",
      prereq: "同一批个体两次测量；差值近似正态。",
      effect: "dz + 95% CI",
      report: "A paired t-test comparing __ and __ showed a mean change of __ (95% CI __ to __; p = __).",
      avoid: "把 36 行重复测量当 36 个独立个体。",
      ch: "ch11", cheat: "report-sentences"
    },
    wilcox: {
      test: "Wilcoxon 秩和 / 符号秩检验",
      fn: "wilcox.test(y ~ g) 或 wilcox.test(x, y, paired = TRUE)",
      prereq: "偏态、有序或离群值明显；配对版本看差值分布。",
      effect: "秩二列相关 r / 中位数差",
      report: "A Wilcoxon rank-sum test indicated __ (W = __, p = __); medians were __ and __.",
      avoid: "把 Wilcoxon 当「正态性检验不显著」的自动替补。",
      ch: "ch11", cheat: "report-sentences"
    },
    anova: {
      test: "单因素 ANOVA + Tukey 校正",
      fn: "aov(y ~ g); TukeyHSD(m)",
      prereq: "独立三组以上；残差近似正态、组内方差相近。",
      effect: "η² / ω²；事后比较用校正 p",
      report: "One-way ANOVA showed an overall group effect (F(__, __) = __, p = __); Tukey-adjusted pairwise comparisons __.",
      avoid: "三组两两 t 检验；总体显著就宣称某对显著。",
      ch: "ch12", cheat: "report-sentences"
    },
    kruskal: {
      test: "Kruskal–Wallis + Dunn 事后",
      fn: "kruskal.test(y ~ g); FSA::dunnTest()",
      prereq: "三组以上且偏态/有序；事后同样要校正。",
      effect: "ε²",
      report: "A Kruskal–Wallis test indicated __ (H(__) = __, p = __).",
      avoid: "不做事后校正就逐对比较。",
      ch: "ch12", cheat: "report-sentences"
    },
    mixed: {
      test: "线性混合效应模型",
      fn: "lmer(y ~ time * group + (1 | id))",
      prereq: "重复测量/层次结构；检查 singular fit 与 ICC。",
      effect: "固定效应 + ICC",
      report: "A linear mixed model with a random intercept for individual showed __ (β = __, 95% CI __ to __; p = __).",
      avoid: "把重复测量当独立样本（伪重复）。",
      ch: "ch15", cheat: "report-sentences"
    },
    lm: {
      test: "线性回归",
      fn: "lm(y ~ x1 + x2); tidy(conf.int = TRUE)",
      prereq: "连续结局；残差诊断（正态、异方差、杠杆）。",
      effect: "斜率 + 95% CI；R²、残差 SE",
      report: "In a linear model adjusting for __, __ was associated with __ (β = __, 95% CI __ to __; R² = __).",
      avoid: "相关当因果；把 R² 高当模型正确。",
      ch: "ch13", cheat: "report-sentences"
    },
    chisq: {
      test: "卡方 / Fisher 精确检验",
      fn: "chisq.test(table) 或 fisher.test(table)",
      prereq: "分类结局；期望频数 ≥ 5（否则 Fisher）；2×2 可 Yates 校正。",
      effect: "OR（2×2）/ Cramér's V",
      report: "The proportion of __ differed between groups (χ²(__) = __, p = __; OR = __, 95% CI __ to __).",
      avoid: "期望频数过小仍用卡方；忽略 2×2 的校正。",
      ch: "ch12", cheat: "report-sentences"
    },
    logistic: {
      test: "逻辑回归",
      fn: "glm(y ~ x, family = binomial)",
      prereq: "二分类结局；事件数充足（EPV）；线性可加（logit 尺度）。",
      effect: "OR + 95% CI",
      report: "In a logistic model, __ was associated with higher odds of __ (OR = __, 95% CI __ to __; p = __).",
      avoid: "把 log-odds 当 OR；事件太少仍拟合多变量模型。",
      ch: "ch13", cheat: "report-sentences"
    },
    survival: {
      test: "Kaplan–Meier + log-rank",
      fn: "survfit(Surv(time, status) ~ group); survdiff()",
      prereq: "生存时间 + 删失编码正确；比例风险大致成立（Cox 时检查）。",
      effect: "HR + 95% CI（Cox）",
      report: "Survival differed between groups (log-rank χ²(__) = __, p = __; HR = __, 95% CI __ to __).",
      avoid: "删失当缺失删除；忽略比例风险假设。",
      ch: "ch16", cheat: "report-sentences"
    }
  };

  var TREE = {
    start: {
      q: "结局变量是什么类型？",
      opts: [
        { label: "连续（体重、浓度、得分）", next: "continuous_goal" },
        { label: "二分类（存活/死亡、有无）", next: "binary_design" },
        { label: "生存时间（含删失）", result: "survival" },
        { label: "计数（次数、率）", result: "logistic" }
      ]
    },
    continuous_goal: {
      q: "你想回答什么？",
      opts: [
        { label: "只描述一组数据", result: "describe" },
        { label: "比较几组的均值", next: "continuous_groups" },
        { label: "看连续变量之间的关系", result: "lm" }
      ]
    },
    continuous_groups: {
      q: "几组？设计是什么？",
      opts: [
        { label: "两组，独立个体", next: "two_independent" },
        { label: "两组，同一批个体前后", result: "paired" },
        { label: "三组及以上，独立", next: "many_independent" },
        { label: "三组及以上，重复测量", result: "mixed" }
      ]
    },
    two_independent: {
      q: "分布与方差情况？",
      opts: [
        { label: "近似正态、方差相近", result: "welch" },
        { label: "近似正态、方差明显不齐", result: "welch" },
        { label: "明显偏态 / 有序 / 离群值多", result: "wilcox" }
      ]
    },
    many_independent: {
      q: "分布情况？",
      opts: [
        { label: "近似正态、方差相近", result: "anova" },
        { label: "明显偏态 / 有序", result: "kruskal" }
      ]
    },
    binary_design: {
      q: "设计与预测变量？",
      opts: [
        { label: "两组比例比较", result: "chisq" },
        { label: "多变量 / 调整混杂", result: "logistic" }
      ]
    }
  };

  var path = [];

  function $(s) { return document.querySelector(s); }
  function esc(s) { return window.BIOR.escapeHtml(s); }

  function show(nodeId) {
    var node = TREE[nodeId];
    var crumb = path.map(function (p) { return esc(p); }).join(" → ");
    $("#tree-crumb").innerHTML = crumb ? crumb + ' · <button type="button" class="btn" id="tree-restart">重新开始</button>' : "";
    $("#tree-q").textContent = node.q;
    var box = $("#tree-opts");
    box.innerHTML = "";
    node.opts.forEach(function (o) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "btn tree-opt";
      b.textContent = o.label;
      b.addEventListener("click", function () {
        path.push(o.label);
        if (o.result) result(o.result);
        else show(o.next);
      });
      box.appendChild(b);
    });
    $("#tree-result").innerHTML = "";
    var rr = $("#tree-restart");
    if (rr) rr.addEventListener("click", function () { path = []; show("start"); });
  }

  function result(key) {
    var r = RESULTS[key];
    $("#tree-crumb").innerHTML = path.map(function (p) { return esc(p); }).join(" → ") +
      ' · <button type="button" class="btn" id="tree-restart">重新开始</button>';
    $("#tree-q").textContent = "推荐结果";
    $("#tree-opts").innerHTML = "";
    $("#tree-result").innerHTML =
      '<div class="card result-card">' +
      '<h3>' + esc(r.test) + "</h3>" +
      '<p class="small"><b>R 函数</b>：<code>' + esc(r.fn) + "</code></p>" +
      '<p class="small"><b>前提</b>：' + esc(r.prereq) + "</p>" +
      '<p class="small"><b>效应量</b>：' + esc(r.effect) + "</p>" +
      '<p class="small"><b>报告模板</b>：' + esc(r.report) + "</p>" +
      '<p class="small"><b>不要做</b>：' + esc(r.avoid) + "</p>" +
      '<div class="uc-links"><a class="btn" href="chapters/' +
      ({"ch10": "ch10-descriptive", "ch11": "ch11-two-group", "ch12": "ch12-anova", "ch13": "ch13-regression", "ch16": "ch16-survival"}[r.ch] || "ch10-descriptive") +
      '.html">教材：' + esc(r.ch) + "</a>" +
      '<a class="btn" href="cheatsheets.html#' + esc(r.cheat) + '">速查：' + esc(r.cheat) + "</a></div></div>";
    var rr = $("#tree-restart");
    if (rr) rr.addEventListener("click", function () { path = []; show("start"); });
  }

  var SENT = {
    welch: "A two-sided Welch t-test showed a mean difference of __ (95% CI __ to __; Cohen's d = __; p = __).",
    paired: "A paired t-test comparing __ and __ showed a mean change of __ (95% CI __ to __; p = __).",
    wilcox: "A Wilcoxon rank-sum test indicated __ (W = __, p = __); medians were __ and __.",
    anova: "One-way ANOVA showed an overall group effect (F(__, __) = __, p = __); Tukey-adjusted pairwise comparisons __.",
    chisq: "The proportion of __ differed between groups (χ²(__) = __, p = __; OR = __, 95% CI __ to __).",
    cox: "Survival differed between groups (log-rank χ²(__) = __, p = __; HR = __, 95% CI __ to __)."
  };

  function init() {
    show("start");
    var sel = $("#sent-test");
    function renderSent() {
      var code = $("#sent-out code");
      var text = SENT[sel.value] || "";
      code.textContent = text;
      if (window.BIOR.highlightR) code.innerHTML = window.BIOR.highlightR(text).join("\n");
    }
    if (sel) { sel.addEventListener("change", renderSent); renderSent(); }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
