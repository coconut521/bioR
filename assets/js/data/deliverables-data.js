/* ============================================================
 * deliverables-data.js — window.BIOR_DELIVERABLES
 * One entry per chapter deliverable group; {ch, part, label, files[]}.
 * The workbench board and home summary read this. Contract: docs/04 §8.3.
 * ============================================================ */
(function () {
  "use strict";
  window.BIOR_DELIVERABLES = [
    { ch: "ch01", part: "I", label: "项目骨架", files: ["00_setup.R", "README.md", "sessionInfo.txt"] },
    { ch: "ch02", part: "I", label: "清洗向量", files: ["01_vectors.R", "hemoglobin_clean.csv"] },
    { ch: "ch03", part: "I", label: "数据字典", files: ["metadata_tidy.csv", "data_dictionary.csv"] },
    { ch: "ch04", part: "I", label: "导入 QC", files: ["02_import_qc.R", "qc_report.csv"] },
    { ch: "ch05", part: "I", label: "函数与模拟", files: ["qc_functions.R", "fig_sampling_error.svg"] },
    { ch: "ch06", part: "II", label: "Table 1", files: ["table1_group.csv", "exclusions.csv"] },
    { ch: "ch07", part: "II", label: "表达长表", files: ["expr_long.csv", "join_qc.csv"] },
    { ch: "ch08", part: "II", label: "探索图组", files: ["fig_explore_mass.svg", "fig_explore_hb.svg", "fig_explore_sex.svg"] },
    { ch: "ch09", part: "II", label: "Figure 1", files: ["Figure1.pdf", "figure1_legend.md"] },
    { ch: "ch10", part: "III", label: "分布报告", files: ["02_descriptive.R", "fig_distributions.svg"] },
    { ch: "ch11", part: "III", label: "两组结果", files: ["stats_two_group.csv", "methods_two_group.md"] },
    { ch: "ch12", part: "III", label: "ANOVA", files: ["stats_anova.csv", "fig_anova_letters.svg"] },
    { ch: "ch13", part: "III", label: "回归", files: ["stats_regression.csv", "fig_regression.svg"] },
    { ch: "ch14", part: "IV", label: "可复现报告", files: ["report.html", "renv.lock"] },
    { ch: "ch15", part: "IV", label: "混合模型", files: ["stats_mixed.csv"] },
    { ch: "ch16", part: "IV", label: "生存", files: ["fig_survival.svg", "stats_cox.csv"] },
    { ch: "ch17", part: "IV", label: "PCA/热图", files: ["fig_pca.svg", "fig_heatmap.svg"] },
    { ch: "ch18", part: "IV", label: "DE/富集", files: ["de_results.csv", "fig_volcano.svg", "fig_enrichment.svg"] }
  ];
})();
