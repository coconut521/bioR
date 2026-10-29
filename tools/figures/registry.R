# ============================================================
# registry.R — FIGURES: single source of truth for every rendered
# figure. render-figures.R consumes this; validate.mjs cross-checks
# the HTML <figure data-figure="..."> tags against the manifest.
# Contract: docs/05 §4.7/§6.2.
# ============================================================

FIGURES <- list(
  list(
    id = "ch08-mass-by-altitude",
    chapter = "ch08",
    script = "fig_ch08_mass.R",
    width_mm = 89, height_mm = 70,
    alt = "箱线图显示高海拔组体重中位数低于低海拔组，低海拔组最高；三组均叠加个体点，组间分布重叠明显，差异幅度有限。",
    caption = "图 8.2 · 不同海拔的体重分布；n = 20/20/20；箱体为 IQR，须线为 1.5×IQR；箱内横线为中位数。",
    data = c("pika_physiology.csv")
  ),
  list(
    id = "ch02-hb-strip",
    chapter = "ch02",
    script = "fig_ch02_hb_strip.R",
    width_mm = 89, height_mm = 55,
    alt = "条带图显示 12 个血红蛋白测量值，第 4 与第 9 个位置为问号标记的 NA，虚线为剔除缺失后的均值；缺失是位置而不是零。",
    caption = "图 2.1 · 12 个血红蛋白测量值（本章教学向量）；n = 12，其中 2 个 NA；虚线为均值 148.6 g/L（na.rm = TRUE）。",
    data = c()
  ),
  list(
    id = "ch02-mean-na",
    chapter = "ch02",
    script = "fig_ch02_mean_na.R",
    width_mm = 89, height_mm = 55,
    alt = "三根柱子对比同一向量的三种均值：传播 NA 无结果、剔除缺失得 148.6、把缺失当零得 123.9；处理缺失的方式直接改变结论。",
    caption = "图 2.2 · 同一向量的三种均值；n = 12（有效 n = 10）；na.rm = TRUE 是正确做法，NA 当零是常见错误。",
    data = c()
  ),
  list(
    id = "ch04-qc-dashboard",
    chapter = "ch04",
    script = "fig_ch04_qc_dashboard.R",
    width_mm = 89, height_mm = 42,
    alt = "四块绿色 PASS 面板：行数 60、ID 唯一 60、血红蛋白缺失 2、体重越界 0——导入 QC 四项检查全部通过。",
    caption = "图 4.2 · 导入 QC 四项检查；n = 60；缺失计数与数据字典对账（血红蛋白 2 个 NA = 溶血）。",
    data = c("pika_physiology.csv")
  ),
  list(
    id = "ch04-od600-hist",
    chapter = "ch04",
    script = "fig_ch04_od600_hist.R",
    width_mm = 89, height_mm = 55,
    alt = "96 孔 OD600 读数的直方图，主峰在 0.2 到 0.6 之间，右尾延伸到 1.4；范围检查确认没有负值和爆表孔。",
    caption = "图 4.1 · 96 孔 OD600 分布（skip = 3 导入）；n = 96；组距 0.1。",
    data = c("plate_reader_raw.csv")
  ),
  list(
    id = "ch05-sampling-error",
    chapter = "ch05",
    script = "fig_ch05_sampling.R",
    width_mm = 89, height_mm = 55,
    alt = "折线图显示 1000 次模拟抽样中样本均值的标准差随 n 增大而下降：n=2 时约 8.2 g/L，n=80 时约 1.4 g/L；虚线为理论标准误 σ/√n，两者几乎重合。",
    caption = "图 5.1 · 均值的标准误随 n 变化；n = 2/5/10/20/40/80（每个 n 模拟 1000 次，σ = 12 g/L），实线为模拟值，虚线为理论值 σ/√n；纵轴是均值的标准差（标准误），不是单个观测的标准差。",
    data = c()
  ),
  list(
    id = "ch08-hb-altitude",
    chapter = "ch08",
    script = "fig_ch08_hb_altitude.R",
    width_mm = 89, height_mm = 55,
    alt = "散点图显示血红蛋白随海拔升高而上升：低海拔约 149 g/L，高海拔约 178 g/L；雌雄两组分别用圆点与三角并各自拟合直线，两条线斜率接近。",
    caption = "图 8.3 · 血红蛋白与采样海拔的关系；n = 58（2 个溶血 NA 剔除），按性别分色并区分形状（色盲安全）；直线为线性拟合，不带置信带；海拔为三个采样点，直线仅作趋势示意。",
    data = c("pika_physiology.csv")
  ),
  list(
    id = "ch08-mass-sex-facet",
    chapter = "ch08",
    script = "fig_ch08_mass_sex_facet.R",
    width_mm = 89, height_mm = 65,
    alt = "两个并排面板（雌性、雄性）的箱线图：雌性组间中位数差异明显，雄性三组更接近；点表示个体，箱体为 IQR，每组 n 写在图注。",
    caption = "图 8.4 · 体重按海拔组分面（左 F、右 M）；n = 10/组；箱体为 IQR、须线为 1.5×IQR；叠加个体点以显示分布。",
    data = c("pika_physiology.csv")
  ),
  list(
    id = "ch09-figure1",
    chapter = "ch09",
    script = "fig_ch09_figure1.R",
    width_mm = 183, height_mm = 105,
    alt = "双面板组合图：A 面板为体重按海拔组的箱线图叠加个体点，B 面板为血红蛋白对海拔的散点图并按性别配色与形状；两个面板左上角分别有加粗标签 A 与 B，共享一套色板。",
    caption = "图 9.1 · Figure 1 的成稿：A 体重分布（n = 20/组），B 血红蛋白 × 海拔（n = 58，按性别）；双栏 183 mm，面板标签 A/B；误差与统计说明见图注模板。",
    data = c("pika_physiology.csv")
  ),
  list(
    id = "ch10-distributions",
    chapter = "ch10",
    script = "fig_ch10_distributions.R",
    width_mm = 183, height_mm = 70,
    alt = "双面板分布图：A 面板为血红蛋白直方图叠加密度曲线，右尾略长；B 面板为体重箱线图叠加个体点，三个橙色点标为 IQR 规则离群值（118、215、232 g）。",
    caption = "图 10.1 · 描述性分布面板：A 血红蛋白（n = 58，组距 5 g/L；密度曲线显示右偏）；B 体重（n = 60；橙点为超出 1.5×IQR 规则的 3 个个体）；离群值按预先定义的规则标记，未删除。",
    data = c("pika_physiology.csv")
  ),
  list(
    id = "ch12-anova-letters",
    chapter = "ch12",
    script = "fig_ch12_anova_letters.R",
    width_mm = 89, height_mm = 55,
    alt = "三组体重的均值±SE 点线图，三组上方都标着字母 a；纵轴为体重，横轴为海拔组；提示方差分析总体显著但事后两两比较均无显著差异。",
    caption = "图 12.1 · 体重按海拔组的均值 ± SE 与紧凑字母；n = 20/组；字母来自 Tukey 校正的两两比较（emmeans + multcomp）——三组共享 a，说明总体 F 检验显著但没有任何一对在 0.05 水平上不同。",
    data = c("pika_physiology.csv")
  ),
  list(
    id = "ch13-regression",
    chapter = "ch13",
    script = "fig_ch13_regression.R",
    width_mm = 89, height_mm = 55,
    alt = "血红蛋白对海拔的散点图（按性别分色与形状），叠加一条线性拟合线与浅蓝色 95% 置信带；海拔越高血红蛋白越高，置信带在采样点之间略宽。",
    caption = "图 13.1 · 血红蛋白与海拔的线性拟合；n = 58；斜率 0.0163 g/L 每米（95% CI 0.0125–0.0200），R² = 0.59；阴影为拟合线的 95% 置信带（不是预测带）；海拔仅 3 个采样点，直线不外推。",
    data = c("pika_physiology.csv")
  ),
  list(
    id = "ch15-trajectories",
    chapter = "ch15",
    script = "fig_ch15_trajectories.R",
    width_mm = 89, height_mm = 60,
    alt = "12 只鼠兔在三次访视的体重轨迹，按处理组分色：每个个体一条细线，粗线加点为组均值；个体间差异明显，组均值变化平缓，提示个体随机截距不可忽略。",
    caption = "图 15.1 · 三次访视的个体体重轨迹；n = 12 只 × 3 次 = 36 条测量；细线为个体，粗线为处理组均值；同一只鼠兔的重复测量不独立，分析必须用随机截距（ICC ≈ 0.72）。",
    data = c("pika_repeated.csv")
  ),
  list(
    id = "ch16-km",
    chapter = "ch16",
    script = "fig_ch16_km.R",
    width_mm = 183, height_mm = 90,
    alt = "低氧组与对照组的 Kaplan–Meier 生存曲线：低氧组下降更快，60 天时生存概率约 0.08；曲线上的短竖线为删失，下方为 0/20/40/60 天的风险人数。",
    caption = "图 16.1 · 60 天生存曲线与风险表；n = 30/30；低氧组中位生存 31 天（95% CI 22–44），对照组 46 天（35–未达）；log-rank p = 0.0098；竖线为删失，删失个体仍留在风险集。",
    data = c("pika_survival.csv")
  ),
  list(
    id = "ch17-pca",
    chapter = "ch17",
    script = "fig_ch17_pca.R",
    width_mm = 89, height_mm = 70,
    alt = "12 个 RNA-seq 样本的 PCA 散点图：对照组 6 个点聚在 PC1 左侧，低氧组 6 个点聚在右侧；颜色表示分组、形状表示批次，两种标记完全重合。",
    caption = "图 17.1 · logCPM 表达的 PCA；n = 12（每组 6）；PC1 解释 12.8%、PC2 解释 9.7% 的方差；颜色为 group、形状为 batch——本设计中处理与批次完全重合，PC1 无法区分二者。",
    data = c("pika_rnaseq_counts.csv", "pika_rnaseq_metadata_clean.csv")
  ),
  list(
    id = "ch17-heatmap",
    chapter = "ch17",
    script = "fig_ch17_heatmap.R",
    width_mm = 183, height_mm = 90,
    alt = "12 个样本 × 前 60 个高变基因的热图，按基因做 z-score；样本按 control 6 个、hypoxia 6 个排列，两组的颜色模式明显不同，但组与批次重合使差异无法归因。",
    caption = "图 17.2 · 前 60 个高变基因的热图；n = 12 个样本；每行按基因做 z-score；样本按 group 排序（C1–C6 对照，H1–H6 低氧）；组间模式差异明显，但 group 与 batch 完全重合，热图不能证明处理效应。",
    data = c("pika_rnaseq_counts.csv", "pika_rnaseq_metadata_clean.csv")
  ),
  list(
    id = "ch18-volcano",
    chapter = "ch18",
    script = "fig_ch18_volcano.R",
    width_mm = 89, height_mm = 70,
    alt = "火山图显示收缩后的 log2 倍数变化与 -log10(padj)：灰色六边形为非显著基因的二维密度分箱；49 个基因满足 padj<0.05 且 log2FC>1（橙色点），5 个满足 log2FC<-1（蓝色点）。",
    caption = "图 18.1 · 差异表达火山图（apeglm 收缩）；n = 12 个样本、1995 个可检验基因；灰色六边形为非显著基因的二维密度分箱；阈值 padj < 0.05 且 |log2FC| > 1；上调 49 个、下调 5 个；group 与 batch 完全重合，差异不能单独归因于低氧。",
    data = c("pika_rnaseq_counts.csv", "pika_rnaseq_metadata_clean.csv")
  ),
  list(
    id = "ch18-enrichment",
    chapter = "ch18",
    script = "fig_ch18_enrichment.R",
    width_mm = 120, height_mm = 80,
    alt = "KEGG 过表达富集气泡图：氧化磷酸化、糖酵解、吞噬体等通路的基因比例与基因数；所有通路的 p.adjust 均在 0.8 以上，没有通路通过 FDR 0.05。",
    caption = "图 18.2 · KEGG 过表达富集（自定义 TERM2GENE）；n = 72 个差异基因；点大小为基因数、颜色为 p.adjust；本数据中最小 p.adjust 约 0.82，没有任何通路通过 FDR 0.05——如实报告「无显著富集」，不强行解释。",
    data = c("pika_rnaseq_counts.csv", "pika_rnaseq_metadata_clean.csv", "pika_annotation.csv")
  )
)
