/* ============================================================
 * course-toc.js — window.COURSE_TOC (18 chapters) + window.BIOR_SPECIALS (7).
 * Contract: docs/05 §4.1. Chapter numbers never renumber; file names
 * are chNN-topic.html. Fields feed nav, home route, search, workbench.
 * ============================================================ */
(function () {
  "use strict";

  window.COURSE_TOC = [
    {
      id: "ch01", part: "I",
      title: "从零开始：R、RStudio 与可复现项目",
      short: "可复现项目",
      file: "chapters/ch01-setup.html",
      question: "同样的数据，换一台电脑还能跑出同样的结果吗？",
      summary: "建立 pika-hypoxia 项目骨架，理解脚本/控制台、相对路径与 sessionInfo。",
      keywords: ["RStudio", "Project", "here", "sessionInfo", "工作目录", "项目结构"],
      prereq: [], dataset: [], deliverable: ["00_setup.R", "README.md", "sessionInfo.txt"],
      minutes: 70, difficulty: 1, updated: "2026-10-28"
    },
    {
      id: "ch02", part: "I",
      title: "向量与数据类型：把测量值放进 R",
      short: "向量与类型",
      file: "chapters/ch02-vectors.html",
      question: "12 只鼠兔的血红蛋白里混着 2 个 NA，均值该怎么算？",
      summary: "向量、类型、NA、强制转换与逻辑索引；因子分组变量的正确用法。",
      keywords: ["向量", "NA", "is.na", "factor", "强制转换", "索引", "c()"],
      prereq: ["ch01"], dataset: ["pika-physiology"], deliverable: ["01_vectors.R", "hemoglobin_clean.csv"],
      minutes: 85, difficulty: 1, updated: "2026-10-28"
    },
    {
      id: "ch03", part: "I",
      title: "数据框与 tidy 数据：一张表就是一次实验",
      short: "数据框",
      file: "chapters/ch03-data-frames.html",
      question: "一张样本表怎样才算「一行一个个体」？",
      summary: "tibble、行列索引、glimpse；tidy 三原则与数据字典的写法。",
      keywords: ["data.frame", "tibble", "tidy data", "数据字典", "glimpse", "索引"],
      prereq: ["ch02"], dataset: ["pika-physiology"], deliverable: ["metadata_tidy.csv", "data_dictionary.csv"],
      minutes: 85, difficulty: 1, updated: "2026-10-28"
    },
    {
      id: "ch04", part: "I",
      title: "导入、导出与数据质量：从仪器到 R",
      short: "导入与 QC",
      file: "chapters/ch04-import-qc.html",
      question: "酶标仪 CSV、Excel 记录和样本表，怎样无损地进 R 并对得上？",
      summary: "readr/readxl 导入、列名清洗、类型与范围检查，产出可进补充材料的 QC 报告。",
      keywords: ["read_csv", "read_excel", "janitor", "skimr", "QC", "problems", "编码"],
      prereq: ["ch03"], dataset: ["plate-reader-raw", "pika-lab-notebook", "pika-rnaseq-metadata-raw"], deliverable: ["02_import_qc.R", "qc_report.csv"],
      minutes: 105, difficulty: 2, updated: "2026-10-28"
    },
    {
      id: "ch05", part: "I",
      title: "函数、控制流与模拟：把重复分析变成工具",
      short: "函数与模拟",
      file: "chapters/ch05-functions.html",
      question: "三个批次重复同一套 QC，为什么不该复制粘贴三次？",
      summary: "function/if/for、purrr 批处理；用模拟理解「n 越大均值越稳」。",
      keywords: ["function", "if", "for", "purrr", "map_dfr", "set.seed", "标准误", "模拟"],
      prereq: ["ch04"], dataset: ["pika-physiology"], deliverable: ["qc_functions.R", "fig_sampling_error.svg"],
      minutes: 105, difficulty: 2, updated: "2026-10-28"
    },
    {
      id: "ch06", part: "II",
      title: "数据整形：用 dplyr 把实验表变成答案",
      short: "dplyr 整形",
      file: "chapters/ch06-wrangling.html",
      question: "哪个海拔组、哪种性别的血红蛋白更高？高海拔的差异有多大？",
      summary: "filter/select/mutate/group_by/summarise；排除规则先于 p 值；导出 Table 1。",
      keywords: ["dplyr", "filter", "group_by", "summarise", "case_when", "Table 1", "排除规则"],
      prereq: ["ch05"], dataset: ["pika-physiology"], deliverable: ["table1_group.csv", "exclusions.csv"],
      minutes: 105, difficulty: 2, updated: "2026-10-28"
    },
    {
      id: "ch07", part: "II",
      title: "宽长转换与多表连接：当表达矩阵遇上样本表",
      short: "宽长与连接",
      file: "chapters/ch07-reshape-joins.html",
      question: "counts 列名 C1…H6 与样本表 H-5、 C3 对不上时，样本是怎么悄悄丢掉的？",
      summary: "pivot 宽长转换、join 键清洗、anti_join QC；12/12 匹配才继续分析。",
      keywords: ["pivot_longer", "pivot_wider", "left_join", "anti_join", "stringr", "ID 清洗"],
      prereq: ["ch06"], dataset: ["pika-rnaseq-counts", "pika-rnaseq-metadata-raw"], deliverable: ["expr_long.csv", "join_qc.csv"],
      minutes: 105, difficulty: 2, updated: "2026-10-28"
    },
    {
      id: "ch08", part: "II",
      title: "ggplot2 语法：把科研问题画成图",
      short: "ggplot2",
      file: "chapters/ch08-ggplot2.html",
      question: "「体重在不同海拔如何分布」应该画成什么图？为什么不是柱状图？",
      summary: "图形语法七层；为三个科研问题各选一张探索图并说明理由。",
      keywords: ["ggplot2", "aes", "geom_boxplot", "geom_jitter", "facet_wrap", "图层"],
      prereq: ["ch06"], dataset: ["pika-physiology"], deliverable: ["fig_explore_mass.svg", "fig_explore_hb.svg", "fig_explore_sex.svg"],
      minutes: 135, difficulty: 3, updated: "2026-10-28"
    },
    {
      id: "ch09", part: "II",
      title: "出版级图形：配色、排版、导出与图注",
      short: "出版级图形",
      file: "chapters/ch09-publication.html",
      question: "怎样把三张探索图拼成一张符合期刊规格、能独立读懂的 Figure 1？",
      summary: "Okabe–Ito 配色、89/183mm 尺寸、patchwork 拼图、可独立读懂的图注。",
      keywords: ["配色", "Okabe-Ito", "ggsave", "patchwork", "图注", "89mm", "色盲安全"],
      prereq: ["ch08"], dataset: ["pika-physiology"], deliverable: ["Figure1.pdf", "figure1_legend.md"],
      minutes: 135, difficulty: 3, updated: "2026-10-28"
    },
    {
      id: "ch10", part: "III",
      title: "描述统计与分布：先看数据，再做检验",
      short: "分布与描述",
      file: "chapters/ch10-descriptive.html",
      question: "血红蛋白右偏、体重有两个极端值，t 检验还能直接用吗？",
      summary: "均值/中位数、SD/IQR、分布图、离群值规则与变换决定。",
      keywords: ["描述统计", "中位数", "IQR", "shapiro", "log1p", "离群值", "偏态"],
      prereq: ["ch06"], dataset: ["pika-physiology"], deliverable: ["02_descriptive.R", "fig_distributions.svg"],
      minutes: 105, difficulty: 2, updated: "2026-10-28"
    },
    {
      id: "ch11", part: "III",
      title: "两组比较：t 检验与 Wilcoxon",
      short: "两组比较",
      file: "chapters/ch11-two-group.html",
      question: "低氧组与对照组体重差 14 g，这个差有多少把握？",
      summary: "独立/配对设计、前提检查、效应量与 95% CI 优先于 p 值。",
      keywords: ["t.test", "Wilcoxon", "Cohen d", "置信区间", "配对", "Welch", "效应量"],
      prereq: ["ch10"], dataset: ["pika-physiology", "pika-repeated"], deliverable: ["stats_two_group.csv", "methods_two_group.md"],
      minutes: 135, difficulty: 3, updated: "2026-10-28"
    },
    {
      id: "ch12", part: "III",
      title: "多组比较与方差分析：ANOVA 与事后检验",
      short: "ANOVA",
      file: "chapters/ch12-anova.html",
      question: "海拔 × 性别的交互是真的吗？三组两两 t 检验错在哪？",
      summary: "单/双因素 ANOVA、交互优先、emmeans/Tukey 校正与字母标记图。",
      keywords: ["aov", "ANOVA", "TukeyHSD", "emmeans", "交互", "事后比较", "字母标记"],
      prereq: ["ch11"], dataset: ["pika-physiology"], deliverable: ["stats_anova.csv", "fig_anova_letters.svg"],
      minutes: 135, difficulty: 3, updated: "2026-10-28"
    },
    {
      id: "ch13", part: "III",
      title: "回归与线性模型：从趋势到预测",
      short: "回归",
      file: "chapters/ch13-regression.html",
      question: "海拔每升高 100 m，血红蛋白平均变化多少？这算因果吗？",
      summary: "lm 拟合与诊断、broom 整理输出、斜率的 CI 与混杂因素讨论。",
      keywords: ["lm", "broom", "残差", "QQ 图", "R2", "混杂", "相关不等于因果"],
      prereq: ["ch12"], dataset: ["pika-physiology"], deliverable: ["stats_regression.csv", "fig_regression.svg"],
      minutes: 135, difficulty: 3, updated: "2026-10-28"
    },
    {
      id: "ch14", part: "IV",
      title: "让分析可复现：Quarto、renv 与项目交付",
      short: "可复现报告",
      file: "chapters/ch14-reproducible.html",
      question: "导师换了台电脑，你的报告还能一键重跑吗？",
      summary: "把 ch01–ch13 串成 report.qmd；renv 锁定环境；Git 最小命令。",
      keywords: ["Quarto", "renv", "Git", "render", "sessionInfo", "可复现"],
      prereq: ["ch06", "ch10", "ch11", "ch12", "ch13"], dataset: [], deliverable: ["report.html", "renv.lock"],
      minutes: 135, difficulty: 3, updated: "2026-10-28"
    },
    {
      id: "ch15", part: "IV",
      title: "混合效应与重复测量：别把伪重复当独立样本",
      short: "混合模型",
      file: "chapters/ch15-mixed-models.html",
      question: "同一只鼠兔测了 3 次，n 到底是 36 还是 12？",
      summary: "lmer 随机截距、ICC、个体嵌套；批次不 Balance 时的讨论。",
      keywords: ["lmer", "随机效应", "ICC", "伪重复", "重复测量", "lmerTest"],
      prereq: ["ch13"], dataset: ["pika-repeated"], deliverable: ["stats_mixed.csv"],
      minutes: 135, difficulty: 4, updated: "2026-10-28"
    },
    {
      id: "ch16", part: "IV",
      title: "生存分析：时间到事件",
      short: "生存分析",
      file: "chapters/ch16-survival.html",
      question: "到实验终点还活着的个体，信息该怎么用？",
      summary: "KM 曲线与删失、log-rank、Cox 模型与 PH 假设。",
      keywords: ["Surv", "survfit", "Cox", "删失", "log-rank", "风险比", "KM"],
      prereq: ["ch10"], dataset: ["pika-survival"], deliverable: ["fig_survival.svg", "stats_cox.csv"],
      minutes: 105, difficulty: 4, updated: "2026-10-28"
    },
    {
      id: "ch17", part: "IV",
      title: "多变量与聚类：PCA、热图与样本分群",
      short: "PCA 与聚类",
      file: "chapters/ch17-multivariate.html",
      question: "PCA 第一轴分离的是低氧处理，还是测序批次？",
      summary: "logCPM、PCA 着色、热图聚类；识别技术离群点，不把批次当发现。",
      keywords: ["prcomp", "PCA", "pheatmap", "hclust", "标准化", "批次效应", "离群样本"],
      prereq: ["ch07", "ch10"], dataset: ["pika-rnaseq-counts", "pika-rnaseq-metadata-clean"], deliverable: ["fig_pca.svg", "fig_heatmap.svg"],
      minutes: 135, difficulty: 4, updated: "2026-10-28"
    },
    {
      id: "ch18", part: "IV",
      title: "转录组差异分析：从 counts 到基因列表",
      short: "DESeq2",
      file: "chapters/ch18-rnaseq.html",
      question: "padj = 0.01 但 log2FC 只有 0.3，算不算生物学上有意义？",
      summary: "DESeq2 全流程：design 含批次、LFC 收缩、FDR、火山图与富集。",
      keywords: ["DESeq2", "padj", "FDR", "log2FC", "火山图", "clusterProfiler", "富集"],
      prereq: ["ch07", "ch12", "ch13", "ch17"], dataset: ["pika-rnaseq-counts", "pika-rnaseq-metadata-clean", "pika-annotation"], deliverable: ["de_results.csv", "fig_volcano.svg", "fig_enrichment.svg"],
      minutes: 165, difficulty: 5, updated: "2026-10-28"
    }
  ];

  var svg = function (paths) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + "</svg>";
  };

  window.BIOR_SPECIALS = [
    {
      id: "bioviz", title: "生物绘图专区", file: "bioviz.html",
      desc: "图鉴式图表配方：按科研问题选图，做出投稿级 Figure。",
      meta: "16 配方 · 决策树 · 期刊预设",
      icon: svg('<path d="M12 3a9 9 0 1 0 0 18c1.5 0 2.2-.9 2.2-2 0-.7-.4-1.2-.4-2 0-1.1.9-2 2-2H18a3 3 0 0 0 3-3c0-5-4-9-9-9Z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10.5" cy="7.5" r="1"/><circle cx="14.5" cy="7.5" r="1"/>')
    },
    {
      id: "bioinfo", title: "生物信息专区", file: "bioinfo.html",
      desc: "六条组学航线图：每站的输入输出、检查点，以及 R 在哪一站。",
      meta: "6 航线 · 包图谱 · 格式指南",
      icon: svg('<path d="M7 3v3M11 3v3M15 3v3M7 18v3M11 18v3M15 18v3M4 9h16a2 2 0 0 1 0 4H4a2 2 0 0 1 0-4Z"/>')
    },
    {
      id: "clinic", title: "数据诊所", file: "clinic.html",
      desc: "14 个分析病例：症状、红旗、诊断、处方与预防。",
      meta: "14 病例 · 红旗速筛",
      icon: svg('<path d="M12 5c-1.5-1.7-4-2-5.5-.5C4.6 6.4 5 9 7 11l5 5 5-5c2-2 2.4-4.6.5-6.5C16 3 13.5 3.3 12 5Z"/><path d="M12 8v4M10 10h4"/>')
    },
    {
      id: "stats-nav", title: "统计导航", file: "stats-nav.html",
      desc: "决策树选检验：结局类型 → 设计 → 前提 → 报告模板。",
      meta: "决策树 · 报告句型",
      icon: svg('<path d="M12 3v4M12 7c0 3-4 3-4 6s4 3 4 6M12 7c0 3 4 3 4 6s-4 3-4 6"/><path d="M6 16h4M14 16h4"/>')
    },
    {
      id: "triage", title: "R 代码急救室", file: "triage.html",
      desc: "40+ 条真实报错：报错原文 → 病因 → 修复 → 预防。",
      meta: "8 类分诊 · 调试五步法",
      icon: svg('<path d="M12 4 3.5 19h17L12 4Z"/><path d="M12 10v4M12 16.8v.4"/>')
    },
    {
      id: "datasets", title: "数据集标本馆", file: "datasets.html",
      desc: "9 个教学数据集 + 外部开放数据入口；数据字典齐全。",
      meta: "9 教学 · 8 外部入口",
      icon: svg('<path d="M4 8c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3Z"/><path d="M4 8v8c0 1.7 3.6 3 8 3s8-1.3 8-3V8"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>')
    },
    {
      id: "project", title: "课题工作台", file: "project.html",
      desc: "把 18 章变成一个课题：交付物看板、图表槽位、可复现清单。",
      meta: "18 交付物 · 5 图槽",
      icon: svg('<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M9 8V6a3 3 0 0 1 6 0v2M3 13h18"/>')
    }
  ];
})();
