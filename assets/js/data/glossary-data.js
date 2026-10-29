/* ============================================================
 * glossary-data.js — window.BIOR_GLOSSARY
 * Tooltip source + glossary page. Fields: id, term, en, def, href
 * (tooltip); cat, r, formula (glossary page; formula optional).
 * def is plain text; href is relative from root-level pages.
 * ============================================================ */
(function () {
  "use strict";
  window.BIOR_GLOSSARY = [
    { id: "p-value", term: "p 值", en: "p-value", cat: "统计", r: "t.test(); summary(lm)", def: "在假设为真的前提下，观察到当前或更极端数据的概率。不是效应大小，也不是结论为真的概率。", href: "chapters/ch11-two-group.html" },
    { id: "effect-size", term: "效应量", en: "effect size", cat: "统计", r: "effectsize::cohens_d()", def: "差异或关联的实际大小，如均值差、Cohen's d、log2FC。报告结论必须围绕它与置信区间。", href: "chapters/ch11-two-group.html" },
    { id: "ci", term: "置信区间", en: "confidence interval (CI)", cat: "统计", r: "confint(); t.test()$conf.int", def: "估计值的不确定范围；95% CI 指在重复抽样意义下区间覆盖真参数的比例。", href: "chapters/ch11-two-group.html" },
    { id: "fdr", term: "错误发现率", en: "FDR (false discovery rate)", cat: "统计", r: "p.adjust(p, method = \"BH\")", def: "多重检验校正的目标：被拒绝的原假设中假阳性的期望比例；常用 Benjamini–Hochberg 法。", href: "chapters/ch18-rnaseq.html" },
    { id: "pseudoreplication", term: "伪重复", en: "pseudoreplication", cat: "统计", r: "lmerTest::lmer(y ~ trt + (1 | id))", def: "把技术重复或嵌套观测当成独立生物学重复，导致误差被低估、p 值虚小。", href: "chapters/ch15-mixed-models.html" },
    { id: "tidy-data", term: "整洁数据", en: "tidy data", cat: "R", r: "tidyr::pivot_longer()", def: "一行一个观测、一列一个变量、一张表一个分析单位的数据组织方式。", href: "chapters/ch03-data-frames.html" },
    { id: "tibble", term: "tibble", en: "tibble", cat: "R", r: "tibble::tibble()", def: "tidyverse 的现代数据框：不自动改名、打印只显示前 10 行并标注列类型。", href: "chapters/ch03-data-frames.html" },
    { id: "pipe", term: "管道", en: "native pipe (|>)", cat: "R", r: "x |> f()", def: "把左侧结果传给右侧函数的写法；R 4.1 起的原生管道是 |>，magrittr 的是 %>%。", href: "chapters/ch06-wrangling.html" },
    { id: "factor", term: "因子", en: "factor", cat: "R", r: "factor(x, levels = ...)", def: "带水平集合的分类变量；分组变量应设为因子以控制水平顺序与参照组。", href: "chapters/ch02-vectors.html" },
    { id: "na", term: "缺失值", en: "NA", cat: "R", r: "is.na(x)", def: "「Not Available」：测量缺失的标记。缺失不是 0；比较要用 is.na() 而不是 == NA。", href: "chapters/ch02-vectors.html" },
    { id: "censoring", term: "删失", en: "censoring", cat: "统计", r: "survival::Surv(time, status)", def: "生存分析中事件未在观察期内发生（或中途失访）；删失是信息，不是缺失，不能删除。", href: "chapters/ch16-survival.html" },
    { id: "pca", term: "主成分分析", en: "PCA (principal component analysis)", cat: "统计", r: "prcomp(t(lcpm), scale. = TRUE)", def: "把高维数据投影到方差最大的正交方向；组学中用于看样本结构与批次效应。", href: "chapters/ch17-multivariate.html" },
    { id: "batch-effect", term: "批次效应", en: "batch effect", cat: "生物", r: "DESeq2 设计中的 batch 项", def: "由处理日期、测序批次等非生物学因素引入的系统性差异；设计与模型都要考虑。", href: "chapters/ch17-multivariate.html" },
    { id: "confounding", term: "混杂", en: "confounding", cat: "统计", r: "table(group, batch)", def: "同时影响处理与结局的第三变量；存在混杂时相关不能解释为因果。", href: "chapters/ch13-regression.html" },
    { id: "se-sd", term: "标准误", en: "standard error (SE)", cat: "统计", r: "sd(x) / sqrt(length(x))", formula: "SE = SD / √n", def: "均值抽样波动的大小 = SD/√n。标准差描述个体离散，标准误描述均值估计的精度。", href: "chapters/ch05-functions.html" },
    { id: "log2fc", term: "对数倍数变化", en: "log2 fold change", cat: "生物", r: "DESeq2::results()", def: "两组表达量之比取以 2 为底的对数；正值为上调。解释要结合 padj 与表达量。", href: "chapters/ch18-rnaseq.html" },
    { id: "volcano", term: "火山图", en: "volcano plot", cat: "生物", r: "ggplot2 + geom_point()", def: "x 轴 log2FC、y 轴 −log10(padj) 的散点图；同时展示效应量与显著性。", href: "chapters/ch18-rnaseq.html" },
    { id: "km", term: "Kaplan–Meier 曲线", en: "Kaplan–Meier curve", cat: "统计", r: "survival::survfit()", def: "随时间递减的生存概率估计，带删失标记；组间差异用 log-rank 检验。", href: "chapters/ch16-survival.html" },
    { id: "data-dictionary", term: "数据字典", en: "data dictionary", cat: "R", r: "readr::read_csv(); 手工维护模板", def: "逐变量记录名称、类型、单位、允许范围、缺失含义与统计单位的文档。", href: "chapters/ch03-data-frames.html" },
    { id: "bio-replicate", term: "生物学重复", en: "biological replicate", cat: "生物", r: "dplyr::n_distinct(d$id)", def: "独立的生物学个体或样本；n 指它，而不是细胞数、孔数或读数。", href: "chapters/ch15-mixed-models.html" },
    { id: "multiple-comparison", term: "多重比较", en: "multiple comparisons", cat: "统计", r: "p.adjust(); TukeyHSD()", def: "同时检验多个假设会放大假阳性；需要 Tukey、Bonferroni 或 BH 等校正。", href: "chapters/ch12-anova.html" },
    { id: "icc", term: "组内相关系数", en: "ICC (intraclass correlation)", cat: "统计", r: "performance::icc()", formula: "ICC = σ²_between / (σ²_between + σ²_within)", def: "同一嵌套单位内观测的相关程度；重复测量数据用混合模型时要报告。", href: "chapters/ch15-mixed-models.html" }
  ];
})();
