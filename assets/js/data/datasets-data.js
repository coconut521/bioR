/* ============================================================
 * datasets-data.js — window.BIOR_DATASETS
 * 9 teaching datasets (all simulated). Preview rows live in the
 * generated assets/js/data/dataset-previews.js (build tool reads the
 * actual CSVs) and are merged at runtime — previews are never
 * hand-written. Contract: docs/04 §7.3.
 * ============================================================ */
(function () {
  "use strict";
  window.BIOR_DATASETS = [
    {
      id: "pika-physiology",
      title: "高原鼠兔生理调查（教学模拟）",
      file: "assets/data/pika_physiology.csv",
      rows: 60, cols: 11, simulated: true,
      license: "CC0（教学模拟数据，固定种子生成）",
      research_question: "海拔与性别是否与体重、血红蛋白等生理指标相关？",
      variables: [
        { name: "id", type: "chr", unit: "—", missing: 0, range: "P001–P060", desc: "个体编号，每行一个个体" },
        { name: "altitude_m", type: "dbl", unit: "m", missing: 0, range: "3200 / 4100 / 5000", desc: "采样点海拔，三个水平" },
        { name: "altitude_group", type: "fct", unit: "—", missing: 0, range: "low, mid, high", desc: "海拔分组（有序因子）" },
        { name: "sex", type: "fct", unit: "—", missing: 0, range: "F, M", desc: "性别" },
        { name: "body_mass_g", type: "dbl", unit: "g", missing: 0, range: "118–232", desc: "体重；含 2 个预设极端值（ch10 教学）" },
        { name: "body_length_mm", type: "dbl", unit: "mm", missing: 0, range: "150–230", desc: "体长" },
        { name: "hemoglobin_g_l", type: "dbl", unit: "g/L", missing: 2, range: "110–240", desc: "血红蛋白；右偏分布，含 2 个 NA" },
        { name: "hematocrit_pct", type: "dbl", unit: "%", missing: 0, range: "35–62", desc: "红细胞压积" },
        { name: "glucose_mmol_l", type: "dbl", unit: "mmol/L", missing: 0, range: "4.2–11.8", desc: "血糖" },
        { name: "batch", type: "fct", unit: "—", missing: 0, range: "B1, B2, B3", desc: "测量批次" },
        { name: "measured_on", type: "date", unit: "—", missing: 0, range: "2026-05-01…", desc: "测量日期" }
      ],
      chapters: ["ch03", "ch06", "ch08", "ch10", "ch11", "ch12", "ch13"],
      analyses: ["描述统计", "t 检验", "ANOVA", "回归"]
    },
    {
      id: "pika-repeated",
      title: "重复测量：低氧处理 × 3 时间点（教学模拟）",
      file: "assets/data/pika_repeated.csv",
      rows: 36, cols: 6, simulated: true,
      license: "CC0（教学模拟数据）",
      research_question: "低氧处理对体重和血红蛋白的影响是否随时间变化？（个体内相关 ICC≈0.5）",
      variables: [
        { name: "id", type: "chr", unit: "—", missing: 0, range: "R01–R12", desc: "个体编号；每只测 3 次" },
        { name: "treatment", type: "fct", unit: "—", missing: 0, range: "control, hypoxia", desc: "处理组" },
        { name: "timepoint", type: "fct", unit: "—", missing: 0, range: "T0, T14, T28", desc: "时间点（天）" },
        { name: "body_mass_g", type: "dbl", unit: "g", missing: 0, range: "120–220", desc: "体重" },
        { name: "hemoglobin_g_l", type: "dbl", unit: "g/L", missing: 0, range: "115–225", desc: "血红蛋白" },
        { name: "batch", type: "fct", unit: "—", missing: 0, range: "B1, B2", desc: "测量批次" }
      ],
      chapters: ["ch11", "ch15"],
      analyses: ["配对检验", "混合效应模型"]
    },
    {
      id: "pika-survival",
      title: "生存实验：低氧 vs 对照（教学模拟）",
      file: "assets/data/pika_survival.csv",
      rows: 60, cols: 6, simulated: true,
      license: "CC0（教学模拟数据）",
      research_question: "低氧处理是否改变存活到终点的时间？（含删失）",
      variables: [
        { name: "id", type: "chr", unit: "—", missing: 0, range: "S001–S060", desc: "个体编号" },
        { name: "treatment", type: "fct", unit: "—", missing: 0, range: "control, hypoxia", desc: "处理组" },
        { name: "sex", type: "fct", unit: "—", missing: 0, range: "F, M", desc: "性别" },
        { name: "body_mass_g", type: "dbl", unit: "g", missing: 0, range: "118–226", desc: "基线体重" },
        { name: "time_days", type: "dbl", unit: "天", missing: 0, range: "3–60", desc: "事件时间或随访终点" },
        { name: "status", type: "dbl", unit: "—", missing: 0, range: "0 = 删失, 1 = 死亡", desc: "事件指示；删失约 25%" }
      ],
      chapters: ["ch13", "ch16"],
      analyses: ["Kaplan–Meier", "log-rank", "Cox 回归"]
    },
    {
      id: "pika-rnaseq-counts",
      title: "RNA-seq counts 矩阵（教学模拟）",
      file: "assets/data/pika_rnaseq_counts.csv",
      rows: 2000, cols: 14, simulated: true,
      license: "CC0（教学模拟数据；负二项生成，含 80 个真差异基因 + 批次效应）",
      research_question: "低氧 vs 对照的基因表达差异是什么？批次效应有多大？",
      variables: [
        { name: "gene_id", type: "chr", unit: "—", missing: 0, range: "G00001–G02000", desc: "基因 ID（join 键）" },
        { name: "gene_name", type: "chr", unit: "—", missing: 0, range: "基因符号", desc: "基因名" },
        { name: "C1–C6", type: "int", unit: "counts", missing: 0, range: "0–10^5", desc: "对照组 6 个样本的原始计数（非负整数）" },
        { name: "H1–H6", type: "int", unit: "counts", missing: 0, range: "0–10^5", desc: "低氧组 6 个样本的原始计数" }
      ],
      chapters: ["ch07", "ch17", "ch18"],
      analyses: ["宽长转换", "PCA", "差异表达"]
    },
    {
      id: "pika-rnaseq-metadata-raw",
      title: "RNA-seq 样本表 · 原始版（教学模拟）",
      file: "assets/data/pika_rnaseq_metadata_raw.csv",
      rows: 12, cols: 5, simulated: true,
      license: "CC0（教学模拟数据）",
      research_question: "样本表的 ID 能和 counts 列名对上吗？（故意埋入 3 处不一致）",
      variables: [
        { name: "sample_id", type: "chr", unit: "—", missing: 0, range: "C1…H6（含 H-5、H-6、\" C3\"）", desc: "样本 ID；与 counts 列名存在 3 处不一致（ch07 教学）" },
        { name: "group", type: "chr", unit: "—", missing: 0, range: "control, hypoxia", desc: "分组" },
        { name: "batch", type: "chr", unit: "—", missing: 0, range: "batch1, batch2", desc: "测序批次" },
        { name: "sex", type: "chr", unit: "—", missing: 0, range: "F, M", desc: "性别" },
        { name: "library_size", type: "dbl", unit: "reads", missing: 0, range: "2×10^6–4×10^7", desc: "文库大小" }
      ],
      chapters: ["ch04", "ch07"],
      analyses: ["导入 QC", "join 检查"]
    },
    {
      id: "pika-rnaseq-metadata-clean",
      title: "RNA-seq 样本表 · 清洗版（教学模拟）",
      file: "assets/data/pika_rnaseq_metadata_clean.csv",
      rows: 12, cols: 5, simulated: true,
      license: "CC0（教学模拟数据）",
      research_question: "清洗后的样本表如何与 counts 矩阵 12/12 匹配？",
      variables: [
        { name: "sample_id", type: "chr", unit: "—", missing: 0, range: "C1…H6", desc: "已修复的样本 ID，与 counts 列名一致" },
        { name: "group", type: "fct", unit: "—", missing: 0, range: "control, hypoxia", desc: "分组" },
        { name: "batch", type: "fct", unit: "—", missing: 0, range: "batch1, batch2", desc: "测序批次" },
        { name: "sex", type: "fct", unit: "—", missing: 0, range: "F, M", desc: "性别" },
        { name: "library_size", type: "dbl", unit: "reads", missing: 0, range: "同 raw 版", desc: "文库大小" }
      ],
      chapters: ["ch17", "ch18"],
      analyses: ["PCA", "差异表达"]
    },
    {
      id: "pika-annotation",
      title: "基因注释表（教学模拟）",
      file: "assets/data/pika_annotation.csv",
      rows: 2000, cols: 5, simulated: true,
      license: "CC0（教学模拟数据；GO/KEGG 条目为示意）",
      research_question: "差异基因落在哪些 GO/KEGG 条目上？",
      variables: [
        { name: "gene_id", type: "chr", unit: "—", missing: 0, range: "G00001–G02000", desc: "基因 ID（与 counts 键一致）" },
        { name: "symbol", type: "chr", unit: "—", missing: 0, range: "基因符号", desc: "基因符号" },
        { name: "description", type: "chr", unit: "—", missing: 0, range: "功能描述", desc: "一句话功能" },
        { name: "go_bp", type: "chr", unit: "—", missing: 0, range: "GO:…;…", desc: "GO 生物过程条目（分号分隔）" },
        { name: "kegg_pathway", type: "chr", unit: "—", missing: 0, range: "pathway id;…", desc: "KEGG 通路（分号分隔）" }
      ],
      chapters: ["ch18"],
      analyses: ["富集分析"]
    },
    {
      id: "plate-reader-raw",
      title: "酶标仪原始导出（教学模拟）",
      file: "assets/data/plate_reader_raw.csv",
      rows: 96, cols: 4, simulated: true,
      license: "CC0（教学模拟数据；前 3 行为仪器注释行）",
      research_question: "仪器导出的前导注释怎样跳过？96 孔读数如何变成 tidy 表？",
      variables: [
        { name: "# 注释行 ×3", type: "—", unit: "—", missing: 0, range: "设备/日期/模式", desc: "read_csv 需 skip = 3（ch04 教学）" },
        { name: "well", type: "chr", unit: "—", missing: 0, range: "A01–H12", desc: "孔位" },
        { name: "od600", type: "dbl", unit: "OD", missing: 0, range: "0.02–1.6", desc: "OD600 读数" },
        { name: "temperature_c", type: "dbl", unit: "°C", missing: 0, range: "36.4–37.6", desc: "测量温度" },
        { name: "cycle", type: "int", unit: "—", missing: 0, range: "1", desc: "动力学循环编号" }
      ],
      chapters: ["ch04"],
      analyses: ["导入", "tidy 转换"]
    },
    {
      id: "pika-lab-notebook",
      title: "实验记录 Excel（教学模拟）",
      file: "assets/data/pika_lab_notebook.xlsx",
      rows: 60, cols: 5, simulated: true,
      license: "CC0（教学模拟数据；两个 sheet）",
      research_question: "Excel 记录里的采样日期与备注怎样并入样本表？",
      variables: [
        { name: "sheet: samples", type: "tbl", unit: "—", missing: 0, range: "60 行", desc: "id、采样日期、称重人、备注" },
        { name: "sheet: incidents", type: "tbl", unit: "—", missing: 0, range: "5 行", desc: "异常事件（溶血、拒食等），解释部分 NA" }
      ],
      chapters: ["ch04"],
      analyses: ["read_excel", "多 sheet 处理"]
    }
  ];

  /* merge generated previews (rows only); guard for build-time vm sandbox */
  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", function () {
      var pv = window.BIOR_DATASET_PREVIEWS || {};
      window.BIOR_DATASETS.forEach(function (d) {
        if (pv[d.id]) d.preview = pv[d.id];
      });
    });
  }
})();
