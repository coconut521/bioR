/* ============================================================
 * chapter-config.js — window.BIOR_CONFIG
 * Per-chapter extras: right-rail field notes and the chapter's main
 * explainer pointer. `section` is the zero-based index of the h2 that
 * the note anchors to (index counts ALL h2 in .chapter-reading).
 * Contract: docs/05 §4.2.
 * ============================================================ */
(function () {
  "use strict";
  window.BIOR_CONFIG = {
    chapters: {
      ch18: {
        notes: [
          { section: 0, title: "先看设计再建模", body: "group 与 batch 完全重合；~batch+group 不满秩，只能 ~group 并写限制。" },
          { section: 1, title: "padj 才是列表标准", body: "74 个名义显著，收缩+双阈值后 54 个；效应量与 FDR 一起报。" },
          { section: 3, title: "富集为空要如实写", body: "72 个基因、最小 p.adjust≈0.82；没有通路通过 FDR 0.05。" }
        ],
        demo: { cardId: "ch18-ex-02", engine: "pipeline", question: "从 counts 到基因列表，经过了哪些关？" }
      },
      ch17: {
        notes: [
          { section: 0, title: "先 log 再 PCA", body: "原始 counts 的方差随均值增长；logCPM 后才适合比较样本。" },
          { section: 1, title: "PC1 只解释 12.8%", body: "分群明显不等于解释力强；剩余变异仍很大，别过度解读。" },
          { section: 3, title: "热图先看设计", body: "group 与 batch 注释条完全同色；聚类分群不能归因于处理。" }
        ],
        demo: { cardId: "ch17-ex-01", engine: "matrix", question: "为什么要先做 log 变换？" }
      },
      ch16: {
        notes: [
          { section: 0, title: "删失不是缺失", body: "status=0 的个体贡献「至少活到 t」；删掉会低估生存。" },
          { section: 1, title: "中位生存带 CI", body: "46 天（35–未达）；只报点估计会让读者以为很精确。" },
          { section: 3, title: "先查 PH 再解释 HR", body: "cox.zph p=.88；若曲线交叉，单一 HR 可能没有意义。" }
        ],
        demo: { cardId: "ch16-ex-04", engine: "timeline", question: "删失个体在时间线上发生了什么？" }
      },
      ch15: {
        notes: [
          { section: 0, title: "n 是个体，不是行", body: "12 只 × 3 次 = 36 行，但独立个体只有 12 只；统计单位由设计决定。" },
          { section: 2, title: "ICC 先看再建模", body: "ICC ≈ 0.72：个体间方差占大部分；忽略个体等于丢掉结构。" },
          { section: 4, title: "singular 不是小事", body: "随机效应方差估成 0 时，先简化随机结构，再解释固定效应。" }
        ],
        demo: { cardId: "ch15-ex-01", engine: "dataframe", question: "36 行数据，为什么只有 12 个独立个体？" }
      },
      ch14: {
        notes: [
          { section: 0, title: "先盘点再打包", body: "脚本/数据/图数字对得上，结构才完整。" },
          { section: 1, title: "报告数字来自代码", body: "手写 n=60 会让报告在数据变化后撒谎。" },
          { section: 3, title: "五步 README", body: "打开项目→restore→build-all→render→validate。" }
        ],
        demo: { cardId: "ch14-ex-03", engine: "pipeline", question: "「一键重跑」到底重跑了什么？" }
      },
      ch13: {
        notes: [
          { section: 0, title: "系数=调整后效应", body: "其他变量不变时 x 每加 1 单位 y 的平均变化；必须带 CI。" },
          { section: 2, title: "先诊断再解释", body: "残差、杠杆、|std.resid|>2；模型不对劲，斜率也不可信。" },
          { section: 4, title: "log-log 是弹性", body: "斜率 1.04 = 体长每 +1%，体重约 +1%；不是每毫米克数。" }
        ],
        demo: { cardId: "ch13-ex-03", engine: "anatomy", question: "一条回归线由什么构成？" }
      },
      ch12: {
        notes: [
          { section: 0, title: "不要两两 t", body: "三组三次检验把族错误率抬到约 14%；ANOVA + 校正。" },
          { section: 1, title: "交互优先", body: "先看 A:B 的 p；显著就分层解释，不解释主效应。" },
          { section: 3, title: "总显著 ≠ 两两显著", body: "Tukey 最小 p=0.054：诚实写「未定位到具体对」。" }
        ],
        demo: { cardId: "ch12-ex-02", engine: "stats", question: "组间差异与组内波动：F 值在比什么？" }
      },
      ch11: {
        notes: [
          { section: 0, title: "默认 Welch", body: "方差齐性不假设；Student 只在明确理由时用。" },
          { section: 2, title: "p 与 d 成对报告", body: "estimate + 95% CI + 效应量，缺一不可。" },
          { section: 3, title: "配对必须配对", body: "36 行是 12 个个体；当独立两组会把 n 虚增 3 倍。" }
        ],
        demo: { cardId: "ch11-ex-01", engine: "stats", question: "p 值、效应量与 n：谁在说话？" }
      },
      ch10: {
        notes: [
          { section: 0, title: "均值 vs 中位数", body: "两者差得远 = 偏态信号；描述统计跟着分布走。" },
          { section: 1, title: "Shapiro 只是参考", body: "p 显著 ≠ 必须变换；看图、看幅度、看影响。" },
          { section: 2, title: "标记不删除", body: "1.5×IQR 规则先定义；离群值留在图里。" }
        ],
        demo: { cardId: "ch10-ex-03", engine: "stats", question: "均值与离群值：一个数字能被拉多远？" }
      },
      ch09: {
        notes: [
          { section: 0, title: "先定尺寸再字号", body: "89/183 mm；终稿 7–9 pt，窗口里看不出来。" },
          { section: 1, title: "命名色板", body: "颜色绑定水平名；再加形状/线型冗余编码。" },
          { section: 2, title: "图注独立可读", body: "n、误差定义、剔除原因、拟合方法、软件版本。" }
        ],
        demo: { cardId: "ch09-ex-03", engine: "anatomy", question: "一张投稿图由哪些部件组成？" }
      },
      ch08: {
        notes: [
          { section: 0, title: "七层语法", body: "data → aes → geom → scale → facet → theme，每层一个决定。" },
          { section: 1, title: "箱线 + 散点", body: "小 n 组间比较：显示分布与 n，别用均值柱。" },
          { section: 3, title: "共享标度", body: "分面比较模式时不要 scales = \"free_y\"。" }
        ],
        demo: { cardId: "ch08-ex-01", engine: "plot-grammar", question: "每一层给图加了什么？" }
      },
      ch07: {
        notes: [
          { section: 0, title: "宽表 → 长表", body: "2000 × 12 = 24000 行；收列前分清标识列与样本列。" },
          { section: 2, title: "先 anti_join 再 join", body: "双向查不匹配；readr 默认 trim_ws 会掩盖空格。" },
          { section: 3, title: "行数对账", body: "24000 → 24000、group 零 NA、反向 anti_join 为空。" }
        ],
        demo: { cardId: "ch07-ex-04", engine: "dataframe", question: "连接键对不上时，行去哪里了？" }
      },
      ch06: {
        notes: [
          { section: 0, title: "排除规则先于 p 值", body: "规则写进脚本头部；exclusions.csv 是证据链。" },
          { section: 2, title: "n() 数行数", body: "summarise 里 n() 把 NA 也算进去；有效 n 用 sum(!is.na())。" },
          { section: 4, title: "Table 1 写清格式", body: "均值±SD 还是中位数(IQR)由分布决定，并写进表注。" }
        ],
        demo: { cardId: "ch06-ex-05", engine: "pipeline", question: "从原始表到 Table 1，表经历了什么？" }
      },
      ch05: {
        notes: [
          { section: 0, title: "重复三次就写成函数", body: "qc_summary(df) 输入校验用 stopifnot，别靠自觉。" },
          { section: 1, title: "别在循环里 c()", body: "先 numeric(n) 再填空位；T/F 不是保留字，会被覆盖。" },
          { section: 4, title: "SE ≠ SD", body: "模拟告诉你的：n 变大，均值变稳的是标准误；标准差不变。" }
        ],
        demo: { cardId: "ch05-ex-02", engine: "pipeline", question: "三个批次怎么用同一个函数跑完？" }
      },
      ch04: {
        notes: [
          { section: 0, title: "别信仪器导出", body: "裸导入不报错但全错：dim + names 必须对照源文件。" },
          { section: 3, title: "expected 先于 found", body: "QC 表的 expected 来自数据字典（设计），不是事后编的。" },
          { section: 4, title: "QC 进补充材料", body: "qc_report.csv 是排除规则与有效 n 的证据链。" }
        ],
        demo: { cardId: "ch04-ex-01", engine: "pipeline", question: "裸导入到底错在哪？" }
      },
      ch03: {
        notes: [
          { section: 0, title: "一行 = 一个个体", body: "id 重复是 QC 头号红旗；duplicated + distinct 双保险。" },
          { section: 2, title: "先查 ID 再统计", body: "重复个体虚增 n、做小 p 值（第 15 章伪重复）。" },
          { section: 4, title: "字典写统计单位", body: "60 行是个体；重复测量 36 行仍是 12 个个体。" }
        ],
        demo: { cardId: "ch03-ex-01", engine: "dataframe", question: "这一行，是一个个体吗？" }
      },
      ch02: {
        notes: [
          { section: 1, title: "NA 是位置不是零", body: "溶血 = 这个位置没有值；写 NA，别写 0。" },
          { section: 2, title: "先定缺失规则", body: "na.rm = TRUE 前想清楚：剔除的 2 例有理由，且报告里写有效 n = 10。" },
          { section: 3, title: "永远 is.na()", body: "x == NA 全是 NA；比较前先想缺失。" }
        ],
        demo: { cardId: "ch02-ex-01", engine: "vector", question: "这个向量里到底存了什么？" }
      },
      ch01: {
        notes: [
          { section: 1, title: "脚本 vs 控制台", body: "想留到明天的代码一律进脚本；控制台只做试探。" },
          { section: 2, title: "setwd 是合作杀手", body: "绝对路径只在你机器上成立；here::here() 从项目根出发。" },
          { section: 4, title: "版本就是 Methods", body: "R 版本 + 包版本写进 README，审稿人靠它重跑。" }
        ],
        demo: { cardId: "ch01-ex-04", engine: "pipeline", question: "拿到数据的第一步是什么？" }
      },
      /* filled per chapter as content lands; example shape:
      ch06: {
        notes: [
          { section: 2, title: "先把排除规则写下来", body: "排除规则要在看 p 值之前定死并写入 exclusions.csv。" }
        ],
        demo: { cardId: "ch06-ex-03", engine: "pipeline", question: "每一步之后还剩多少行？" }
      }
      */
    }
  };
})();
