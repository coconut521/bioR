/* ============================================================
 * clinic-data.js — window.BIOR_CLINIC (14 cases + 6 red flags).
 * Contract: docs/04 §4.4 / §4.6. Static cards are generated into
 * clinic.html by tools/build-clinic-cards.mjs; clinic.js only
 * filters and runs the red-flag screener.
 * Text is plain (builder escapes); R snippets stay ASCII.
 * ============================================================ */
(function () {
  "use strict";

  window.BIOR_CLINIC = {
    generated: "2026-10-28",
    cases: [
      {
        id: "pseudoreplication",
        title: "30 个细胞来自 3 只鼠，n 是多少？",
        category: "design",
        symptom: "处理组 15 个细胞 vs 对照组 15 个细胞，t 检验 p = 0.001，结论「处理显著」。",
        red_flag: "把细胞、孔或切片当成独立生物学重复。",
        diagnosis: "细胞嵌套在个体内；以细胞为 n 会低估误差、放大自由度，p 值被虚假压低。",
        prescription: ["统计单位是个体：先按 mouse 汇总，每组 n = 3", "或用混合模型，把 cell 嵌套于 mouse", "图和表报告个体数 n，而不是细胞数"],
        r_fix: "library(lme4)\nm <- lmer(value ~ group + (1 | mouse), data = d)\nsummary(m)",
        prevention: "实验设计时先写下统计单位、生物学重复数与技术重复数。",
        chapters: ["ch15"],
        cheatsheets: ["table1"]
      },
      {
        id: "batch-confounded",
        title: "处理组全在批次 1，对照组全在批次 2",
        category: "design",
        symptom: "PCA 上两组完全分开，差异基因上千；结论「处理效应很强」。",
        red_flag: "处理与批次完全重合，效应无法分离。",
        diagnosis: "批次是混杂变量；模型里加 batch 会与 group 共线，参数无法估计。",
        prescription: ["重做实验：每组跨批次并随机化", "若无法重做，只能把结论降级为「批次/处理混合效应」", "记录批次，在下次设计中分层"],
        r_fix: "# 设计阶段随机化，而不是事后建模补救\nset.seed(1)\nassign <- sample(rep(c(\"ctrl\", \"trt\"), each = 3))",
        prevention: "上机/建库前按批次分层随机化，确保每组覆盖多个批次。",
        chapters: ["ch15", "ch18"],
        cheatsheets: ["figure-qc"]
      },
      {
        id: "optional-stopping",
        title: "p = 0.06，再补 3 个样本，p = 0.04",
        category: "stats",
        symptom: "第一次分析 p = 0.06；补到 n = 13 后 p = 0.04，报告「显著」。",
        red_flag: "看到结果后继续加样本（可选停止），未做校正。",
        diagnosis: "反复看结果、多次检验会抬高 I 类错误；最终 p 不是预先设计下的 p。",
        prescription: ["预先定样本量与停止规则", "报告全部阶段与所有检验", "把补样本后的结果标为探索性"],
        r_fix: "# 事前做功效分析，而不是事后补样本\nlibrary(pwr)\npwr.t.test(d = 0.8, power = 0.8, sig.level = 0.05)",
        prevention: "分析计划先写死 n、主要终点与停止规则。",
        chapters: ["ch11"],
        cheatsheets: ["power"]
      },
      {
        id: "multiple-testing",
        title: "20 个基因逐个 t 检验，3 个 p < 0.05",
        category: "stats",
        symptom: "20 个基因分别做两组 t 检验，3 个 p < 0.05，挑出来当「差异基因」。",
        red_flag: "多重比较未校正，且只报告显著者。",
        diagnosis: "20 次检验期望约 1 个假阳性；未校正的 p 不能作为基因列表依据。",
        prescription: ["BH/FDR 校正：p.adjust(p, method = \"BH\")", "或统一模型（limma / DESeq2）", "报告全部基因与校正阈值"],
        r_fix: "p <- c(0.01, 0.04, 0.03, 0.2, 0.6)\np_adj <- p.adjust(p, method = \"BH\")\ndata.frame(p, p_adj)",
        prevention: "分析前定好检验家族与 FDR 阈值。",
        chapters: ["ch11", "ch18"],
        cheatsheets: ["power"]
      },
      {
        id: "skewed-t",
        title: "血红蛋白右偏，直接做 t 检验",
        category: "stats",
        symptom: "两组血红蛋白分布右偏、各有离群值；t 检验 p = 0.03，报告均值差。",
        red_flag: "未看分布就选 t 检验，并用均值概括偏态数据。",
        diagnosis: "t 检验对偏态与离群值敏感；小样本下方差估计不稳。",
        prescription: ["先画分布/QQ；偏态用中位数(IQR)", "改用 Wilcoxon 秩和或对数变换", "报告效应量与 CI"],
        r_fix: "wilcox.test(hb ~ group, data = d, conf.int = TRUE)",
        prevention: "描述统计前先看图，按分布形状选检验。",
        chapters: ["ch10", "ch11"],
        cheatsheets: ["table1", "figure-qc"]
      },
      {
        id: "outlier-after-p",
        title: "先看 p 值，再决定删哪个离群值",
        category: "stats",
        symptom: "初版 p = 0.08；删掉 1 个「离群点」后 p = 0.03，报告后者。",
        red_flag: "排除规则在看到结果之后才定。",
        diagnosis: "事后排除会制造想要的结论；p 值不再可信。",
        prescription: ["预设离群规则（技术原因或 |z| > 3）", "报告敏感性分析：删/不删两种结果", "保留原始数据与排除日志"],
        r_fix: "d$outlier <- abs(scale(d$value)) > 3\n# 报告 with / without\nt.test(value ~ group, data = d)\nt.test(value ~ group, data = subset(d, !outlier))",
        prevention: "数据清理规则在揭盲/看结果前写进分析计划。",
        chapters: ["ch10", "ch06"],
        cheatsheets: ["figure-qc"]
      },
      {
        id: "bar-sem",
        title: "柱状图 + SEM，看起来两组差很多",
        category: "viz",
        symptom: "柱高表示均值，误差线 SEM；n = 3，读者以为差异很大。",
        red_flag: "柱状图掩盖分布；SEM 不是 95% CI。",
        diagnosis: "柱形把数据压缩成均值，隐藏偏态/离群；SEM 随 n 缩小，容易误导。",
        prescription: ["改箱线图/点图/雨云图，显示每个点", "误差线用 95% CI 并标 n", "图注写清统计量定义"],
        r_fix: "library(ggplot2)\nggplot(d, aes(group, value)) +\n  geom_boxplot(width = .4, outlier.shape = NA) +\n  geom_jitter(width = .08, alpha = .6)",
        prevention: "先画原始点，再决定是否叠加汇总。",
        chapters: ["ch08"],
        cheatsheets: ["geom-choice", "figure-qc"]
      },
      {
        id: "pairwise-t",
        title: "三组两两 t 检验，挑出显著的一对",
        category: "stats",
        symptom: "低/中/高三组做 3 次 t 检验，只有低 vs 高 p < 0.05，结论「低海拔与高海拔不同」。",
        red_flag: "三组以上未做整体检验与多重校正。",
        diagnosis: "多次两两比较抬高假阳性；缺少整体模型。",
        prescription: ["先做 ANOVA / Kruskal 整体检验", "事后用 Tukey / Dunn 校正", "报告整体 p 与校正后的两两 p"],
        r_fix: "m <- aov(value ~ group, data = d)\nsummary(m)\nTukeyHSD(m)",
        prevention: "组数 ≥ 3 时先定整体检验与事后方法。",
        chapters: ["ch12"],
        cheatsheets: ["report-sentences"]
      },
      {
        id: "ecological-fallacy",
        title: "把分组相关当个体相关",
        category: "stats",
        symptom: "按海拔组算均值，发现「海拔越高 Hb 越高」；个体层面却几乎无关。",
        red_flag: "用组均值推断个体（生态学谬误 / Simpson）。",
        diagnosis: "组间趋势与组内趋势可能相反；聚合会丢失个体变异。",
        prescription: ["个体层面建模，结论只针对个体", "组均值趋势仅作描述，不用于个体推断", "需要组效应时用足够组数的混合模型"],
        r_fix: "lm(hb ~ altitude, data = d)              # 个体层面\naggregate(hb ~ altitude_group, d, mean)  # 组层面，仅描述",
        prevention: "明确推断层级：结论针对个体还是组。",
        chapters: ["ch13", "ch15"],
        cheatsheets: ["report-sentences"]
      },
      {
        id: "ordinal-continuous",
        title: "有序评分当连续变量做线性回归",
        category: "stats",
        symptom: "疼痛评分 0–4 直接 lm，报告「每升 1 分疼痛增加 …」。",
        red_flag: "有序分类被当成等距连续变量。",
        diagnosis: "等级间距不一定相等；线性模型假设不成立。",
        prescription: ["有序模型（累积链接）或非参数检验", "报告中位数与分布", "不要解释「每 1 分」的线性斜率"],
        r_fix: "library(MASS)\npolr(factor(score, ordered = TRUE) ~ group, data = d, Hess = TRUE)",
        prevention: "变量的测量尺度决定模型类型。",
        chapters: ["ch13"],
        cheatsheets: ["data-dictionary"]
      },
      {
        id: "survival-censoring",
        title: "生存分析把删失样本删掉",
        category: "stats",
        symptom: "到终点仍存活的个体被剔除，KM 曲线下降更快，组间 p 更小。",
        red_flag: "删失被当作缺失删除。",
        diagnosis: "删失个体仍提供「至少活到某时」的信息；删除造成选择偏倚。",
        prescription: ["保留删失：Surv(time, event)", "KM 曲线 + log-rank；Cox 报告 HR/CI", "说明删失原因与比例"],
        r_fix: "library(survival)\nfit <- survfit(Surv(time, event) ~ group, data = d)\nplot(fit)\nsurvdiff(Surv(time, event) ~ group, data = d)",
        prevention: "随访数据记录事件/时间/删失原因，分析时全部纳入。",
        chapters: ["ch16"],
        cheatsheets: ["report-sentences"]
      },
      {
        id: "counts-pca",
        title: "原始 counts 直接 PCA，第一轴是批次",
        category: "omics",
        symptom: "PCA 第一轴把样本按建库批次分开，却被解释为「处理效应」。",
        red_flag: "未做表达量变换/归一化，技术偏差主导。",
        diagnosis: "counts 方差随均值增长，高表达基因支配 PCA；批次未校正。",
        prescription: ["logCPM / VST 稳定方差", "PCA 前检查批次并校正（removeBatchEffect）", "用归一化后的矩阵"],
        r_fix: "library(edgeR)\nlcpm <- cpm(y, log = TRUE)\npca <- prcomp(t(lcpm), scale. = TRUE)",
        prevention: "组学分析先归一化/变换，再看整体结构。",
        chapters: ["ch17"],
        cheatsheets: ["figure-qc"]
      },
      {
        id: "overfit",
        title: "n = 10，8 个预测变量",
        category: "stats",
        symptom: "R² = 0.92，所有预测变量显著；新样本预测一塌糊涂。",
        red_flag: "样本量远小于变量数，未做验证。",
        diagnosis: "过拟合：模型记住噪声；系数与 p 值不稳定。",
        prescription: ["减少变量或先降维（PCA）", "正则化（ridge / lasso）", "交叉验证评估预测"],
        r_fix: "library(glmnet)\ncv.glmnet(x, y, alpha = 1)  # lasso + CV",
        prevention: "先算样本量/事件数，再定变量上限；预注册主要模型。",
        chapters: ["ch13"],
        cheatsheets: ["power"]
      },
      {
        id: "manual-figure",
        title: "图是手改的，报告不可重跑",
        category: "repro",
        symptom: "PPT 里把误差线拉长、颜色改掉；换数据后图没更新。",
        red_flag: "图与数据脱节，无代码、无版本。",
        diagnosis: "手工编辑不可复现，审稿/复审无法追溯。",
        prescription: ["图由 R 脚本生成，数据和代码同版本", "Quarto/Rmd 一键渲染", "导出 SVG/PDF 并记录 sessionInfo"],
        r_fix: "library(ggplot2)\np <- ggplot(d, aes(group, value)) + geom_boxplot()\nggsave(\"fig/fig1.svg\", p, width = 89, height = 55, units = \"mm\")",
        prevention: "从第一张图开始就用代码生成，禁止手工改图。",
        chapters: ["ch14"],
        cheatsheets: ["quarto"]
      }
    ],
    redFlags: [
      {
        id: "unit",
        question: "你的 n 是独立生物学个体吗（而不是细胞、孔或切片）？",
        cases: ["pseudoreplication"]
      },
      {
        id: "batch",
        question: "处理组与对照组是否都覆盖了多个批次？",
        cases: ["batch-confounded"]
      },
      {
        id: "multiplicity",
        question: "三组以上比较时，是否做了整体检验与多重比较校正？",
        cases: ["multiple-testing", "pairwise-t"]
      },
      {
        id: "exclusion",
        question: "排除/清洗规则是否在看结果之前就已确定？",
        cases: ["outlier-after-p", "optional-stopping"]
      },
      {
        id: "code-figure",
        question: "图是否由代码从数据直接生成（而不是手工改图）？",
        cases: ["manual-figure", "bar-sem"]
      },
      {
        id: "effect-ci",
        question: "报告是否包含效应量与 95% CI（而不只是 p 值）？",
        cases: ["bar-sem", "optional-stopping"]
      }
    ]
  };
})();
