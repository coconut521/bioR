# 04 · 专栏与速查表设计

本文件定义 7 个专栏、36 张速查表的结构、内容清单、交互与数据契约。专栏不是「额外阅读」，而是主线的三种补充：**查方法、看反例、做判断**。

---

## 1. 专栏总览

| 专栏 | 文件 | 隐喻 | 回答的问题 | 主要用户动作 |
| --- | --- | --- | --- | --- |
| 生物绘图专区 | `bioviz.html` | 图鉴 / 画廊 | 「这个科研问题该画什么图？怎么做出投稿级？」 | 按问题选图、看图方、复制代码 |
| 生物信息专区 | `bioinfo.html` | 航线图 | 「从样本到结论要经过哪些站？R 在哪一站？」 | 点流程节点、查包与检查点 |
| 数据诊所 | `clinic.html` | 诊室 | 「我的分析设计/统计有没有问题？」 | 对症状、看诊断与处方 |
| 统计导航 | `stats-nav.html` | 路标 | 「我这个设计该用什么检验？」 | 回答决策树、拿报告模板 |
| R 代码急救室 | `triage.html` | 急救室 | 「这个报错什么意思？怎么修？」 | 搜报错、看病因与预防 |
| 数据集标本馆 | `datasets.html` | 标本馆 | 「有没有能练手的数据？变量是什么意思？」 | 预览、下载、看数据字典 |
| 课题工作台 | `project.html` | 工作台 | 「我离一篇完整分析还差什么？」 | 勾交付物、看图表槽位、导出日志 |

所有专栏共享：
- 顶部 kicker + 标题 + 一句 lede；
- 筛选 chips + 搜索 + 打印；
- 卡片/节点可深链接；
- 每个单元至少链接 1 章 + 1 张速查表；
- 空状态给建议关键词；
- 打印只打印当前筛选结果。

---

## 2. 生物绘图专区（BioViz Studio）

### 2.1 目标

把「画图」从「调包」变成「选图 + 论证 + 排版」：

1. 先问科研问题，再选图形；
2. 知道每种图的适用与不适用；
3. 能做出色盲友好、尺寸合规、图注完整的投稿图；
4. 能识别坏图。

### 2.2 页面结构

```text
┌ Hero：先问问题，再选图 ────────────────────────────────────────────┐
│ [ 我要展示… ] 分布 / 比较 / 关系 / 组成 / 趋势 / 组学 / 生存        │
├ 选图决策树 ─────────────────────────────────────────────────────────┤
│ 问题 → 数据形状 → 推荐图 → 替代图 → 不推荐图                        │
├ 图鉴（16 张配方卡） ────────────────────────────────────────────────┤
│ [全部] [分布] [比较] [关系] [组成] [趋势] [组学] [生存]              │
│ 卡片：图预览 / 何时用 / 代码 / 数据形状 / 期刊变体                   │
├ 图形解剖（交互热区） ───────────────────────────────────────────────┤
│ 面板标签 / 轴与单位 / n / 误差线 / 统计标注 / 图例 / 配色 / 尺寸     │
├ 期刊预设 + 配色库 ──────────────────────────────────────────────────┤
├ 改图前后（3 组） ───────────────────────────────────────────────────┤
├ 投稿前图形检查清单 ─────────────────────────────────────────────────┤
└ 论文拆图室（可选折叠） ─────────────────────────────────────────────┘
```

### 2.3 图鉴配方卡（16 张）

| # | 科研问题 | 推荐图 | 关键 geom | 不推荐 / 注意 |
| --- | --- | --- | --- | --- |
| 1 | 一组连续值的分布 | 直方图 + 密度 | `geom_histogram` / `geom_density` | 不要只画均值 |
| 2 | 多组分布比较 | 箱线图 + 个体点 | `geom_boxplot` + `geom_jitter` | 箱线图要标 n |
| 3 | 多组分布 + 形状 | 小提琴 / 雨云图 | `geom_violin` + `geom_boxplot` | 小 n 时小提琴会误导 |
| 4 | 两组配对前后 | 配对斜率图 | `geom_line` + `geom_point` | 不要用独立柱状图 |
| 5 | 两组/多组均值 + 误差 | 点估计 + CI | `stat_summary` / `geom_pointrange` | 柱状图+误差线会掩盖分布 |
| 6 | 两个连续变量关系 | 散点 + 拟合/CI | `geom_point` + `geom_smooth` | 相关不等于因果 |
| 7 | 分组关系（交互） | 分面散点 / 交互图 | `facet_wrap` / `interaction.plot` | 不要只画总回归线 |
| 8 | 时间趋势 | 线图 + 个体线 | `geom_line` | 不要用柱状图表示连续时间 |
| 9 | 组成（少数类别） | 堆叠/并排柱 | `geom_col` | 不要用 3D 饼图 |
| 10 | 相关性矩阵 | 相关热图 | `geom_tile` | 要标显著性与样本量 |
| 11 | 样本结构 | PCA 散点 | `geom_point` + `stat_ellipse` | 着色变量不要超过 2 个 |
| 12 | 基因/特征矩阵 | 热图 | `pheatmap` / `ComplexHeatmap` | 必须标准化/聚类说明 |
| 13 | 差异表达 | 火山图 | `geom_point` + 阈值线 | 同时展示 padj 与 log2FC |
| 14 | 富集结果 | 气泡图 / 条形图 | `geom_point` + size/color | 不要只按 p 排序 |
| 15 | 生存 | Kaplan–Meier | `ggsurvplot` | 必须带风险表与删失标记 |
| 16 | 多面板组合 | patchwork | `wrap_plots` + `plot_annotation` | 面板标签与配色要统一 |

每张卡字段：

```js
{
  id: "box-jitter",
  title: "多组分布比较：箱线图 + 个体点",
  question: "三种海拔的体重分布是否不同？",
  category: "distribution",
  preview: "assets/figures/bioviz/box-jitter.svg",
  code: "ggplot(pika, aes(altitude_group, body_mass_g)) + ...",
  data_shape: "1 个分类变量 + 1 个连续变量",
  use_when: ["每组 n ≥ 5", "需要同时看中心与离散"],
  avoid_when: ["每组 n < 5", "只想展示均值"],
  journal_notes: "箱体不宜过宽；个体点透明度 .5；n 写进图注。",
  alternatives: ["violin", "dot-ci"],
  chapters: ["ch08", "ch09"],
  cheatsheets: ["ggplot-geoms", "figure-qa"]
}
```

### 2.4 选图决策树

分支逻辑（数据驱动，纯 JS）：

1. **你要回答什么？**
   - 一组数据的形状 → 分布
   - 组间差异 → 比较
   - 两个变量的关系 → 关系
   - 部分与整体 → 组成
   - 随时间变化 → 趋势
   - 样本/特征结构 → 组学
   - 时间到事件 → 生存
2. **数据形状？** 连续 / 分类 / 配对 / 计数 / 多元。
3. **n 大小？** 小 n（<5）→ 点图/配对图；大 n → 箱线/小提琴/散点。
4. **是否要展示个体？** 是 → 叠加点/线。
5. 输出：推荐图 + 替代图 + 不推荐图 + 一句理由 + 代码卡链接。

### 2.5 图形解剖

用一张虚构的 Figure 1（A/B/C 三面板）做热区：

| 热区 | 说明 | 常见错误 |
| --- | --- | --- |
| 面板标签 A/B/C | 左上角，统一字号 | 字号不一致、缺失 |
| 轴标题与单位 | 英文 + 单位 | 单位缺失、变量名不是人话 |
| n | 每组样本量 | 只写总数 |
| 误差线 | SD / SEM / 95% CI | 不说明含义 |
| 统计标注 | 检验、p 或 CI | 只放星号 |
| 图例 | 颜色/形状/线型 | 颜色是唯一编码 |
| 配色 | 色盲安全 | 彩虹色 |
| 尺寸 | 89 / 183mm | 导出后缩放到不可读 |

### 2.6 期刊预设

| 预设 | 单栏宽 | 双栏宽 | 字体 | 字号 | 线宽 | 导出 |
| --- | --- | --- | --- | --- | --- | --- |
| Nature 风格 | 89mm | 183mm | Arial/Helvetica | 5–7pt | 0.25–0.5pt | PDF/EPS，矢量 |
| Science 风格 | 55mm（1 栏） | 183mm | Helvetica | 6–8pt | 0.5pt | PDF/EPS |
| Cell 风格 | 85mm | 174mm | Arial | 6–8pt | 0.5pt | PDF/EPS |
| PLOS 风格 | 83mm | 173mm | Arial | 8–12pt | 0.5–1pt | TIFF/PDF |
| 通用报告 | 120mm | 180mm | 系统无衬线 | 8–10pt | 0.5pt | PDF/PNG 300dpi |

**必须在页面注明**：以上为常见区间，投稿前以目标期刊 Guide for Authors 为准。

### 2.7 配色库

- **Okabe–Ito（默认离散）**：`#000000 #E69F00 #56B4E9 #009E73 #F0E442 #0072B2 #D55E00 #CC79A7`
- **viridis（连续）**：`viridis` / `magma` / `cividis`
- **发散**：`RdBu`（以 0 为中心）、`PuOr`
- **不要**：`rainbow()`、`jet`、红绿唯一对比。
- 提供：色值复制、色盲模拟切换（deuteranopia/protanopia/tritanopia 的简化 CSS 滤镜或预生成对比图）、每组同时给形状/线型建议。

### 2.8 改图前后（3 组）

1. 柱状图 + SEM → 箱线 + 个体点 + n（说明分布被掩盖）。
2. 彩虹分组散点 → Okabe–Ito + 形状 + 分面（说明色盲与过载）。
3. 默认主题 + 位图 → 期刊主题 + 矢量 + 面板标签（说明排版）。

每张卡：左「Before」、右「After」、下方 3 条理由、代码差异。

### 2.9 投稿前图形检查清单

- [ ] 图回答一个明确问题，标题就是结论。
- [ ] 每组 n 写进图注。
- [ ] 误差线含义写明（SD/SEM/95% CI）。
- [ ] 统计检验与多重比较校正写明。
- [ ] 轴有单位；变量名可读。
- [ ] 配色色盲安全；颜色不是唯一编码。
- [ ] 字号 ≥ 5pt（最终尺寸下）；线宽 ≥ 0.25pt。
- [ ] 单栏/双栏尺寸正确；矢量格式。
- [ ] 面板标签统一；图例不重复。
- [ ] 图注可独立读懂。
- [ ] 原图代码可复跑，输出文件名有版本。

### 2.10 数据契约

```js
window.BIOR_BIOVIZ = {
  recipes: [ /* 16 cards, schema above */ ],
  palettes: [ { id, name, type: "discrete"|"continuous"|"diverging", colors: [], note } ],
  journalPresets: [ { id, name, single_mm, double_mm, font, pt, line_pt, formats, note } ],
  anatomy: { figure: "assets/figures/bioviz/figure-anatomy.svg", hotspots: [ { x, y, w, h, title, body } ] },
  makeovers: [ { id, before, after, reasons: [], code_diff } ]
};
```

---

## 3. 生物信息专区（Bioinformatics Atlas）

### 3.1 目标

让生物专业学生知道：

1. 一个组学流程有哪些站；
2. 哪一站属于 R，哪一站必须用 shell；
3. 每站的输入/输出、关键参数、检查点、常见失败；
4. 不把「跑通流程」当成「得到生物学结论」。

### 3.2 页面结构

```text
┌ Hero：从样本到结论的航线 ──────────────────────────────────────────┐
│ [ Bulk RNA-seq ] [ 单细胞 ] [ 微生物组 ] [ 变异 ] [ 系统发育 ] [ 蛋白 ]│
├ 航线图（节点 + 连线） ──────────────────────────────────────────────┤
│ 点击节点 → 右侧抽屉：目的 / 工具 / 输入输出 / 检查点 / 常见失败       │
├ R 在哪一站（表格） ─────────────────────────────────────────────────┤
│ 步骤 / 推荐工具 / 是否 R / 为什么                                     │
├ 包图谱（按任务） ───────────────────────────────────────────────────┤
├ 文件格式野外指南 ───────────────────────────────────────────────────┤
├ 从 GEO 到差异基因（概念走查） ──────────────────────────────────────┤
├ 生信常见误区 ───────────────────────────────────────────────────────┤
└ 相关章节 / 速查表 ──────────────────────────────────────────────────┘
```

### 3.3 六条航线

| 航线 | 节点（示例） | R 的关键站 |
| --- | --- | --- |
| Bulk RNA-seq | 设计 → 建库 → FASTQ QC → 比对/定量 → counts → QC → DE → 富集 → 解释 | counts 之后：DESeq2、PCA、富集 |
| 单细胞 | 建库 → 比对 → 细胞调用 → 矩阵 → QC → 归一化 → 聚类 → 注释 → DE/轨迹 | Seurat 全流程 |
| 微生物组 | 采样 → 16S 扩增 → 测序 → ASV → 分类 → 多样性 → 组成/差异 | phyloseq、vegan |
| 变异 | 建库 → 比对 → 变异调用 → VCF → 注释 → 过滤 → 负荷/关联 | 注释后：R 统计与可视化 |
| 系统发育 | 序列 → 比对 → 修剪 → 建树 → 支持度 → 可视化 | ggtree、ape |
| 蛋白组 | 消化 → LC-MS → 搜库 → 蛋白/肽定量 → 差异 → 富集 | limma、富集、可视化 |

每条航线有一个「最小可复现命令/代码」折叠块：不要求真的能跑，展示输入输出与版本记录。

### 3.4 节点详情

```js
{
  id: "deseq2",
  workflow: "bulk-rnaseq",
  label: "差异表达",
  step: 7,
  purpose: "在负二项模型下估计处理效应，控制 FDR。",
  tools: ["DESeq2", "edgeR", "limma-voom"],
  inputs: ["整数 counts 矩阵", "样本表（group/batch）"],
  outputs: ["log2FC", "SE", "pvalue", "padj"],
  checkpoints: ["counts 为整数", "设计公式含批次", "每组 ≥3", "无完全混杂"],
  failures: ["design 只有一个水平", "counts 非整数", "批次与处理完全重合", "用 p 值代替 padj"],
  chapters: ["ch18"],
  cheatsheets: ["deseq2"]
}
```

### 3.5 「R 在哪一站」原则

| 步骤 | 推荐 | 是否 R | 说明 |
| --- | --- | --- | --- |
| FASTQ QC | FastQC/MultiQC | 否 | shell；R 读汇总报告 |
| 比对/定量 | STAR / salmon / featureCounts | 否（featureCounts 可在 R 内调用） | 重计算交给专用工具 |
| counts 之后 | DESeq2 / edgeR / limma | 是 | 统计建模与可视化 |
| 富集 | clusterProfiler / fgsea | 是 | 基因集分析 |
| 单细胞 | Seurat / Scanpy | 是（Seurat） | 大数据注意内存 |
| 系统发育 | IQ-TREE / RAxML + ggtree | 建树否，画树是 | 不要在 R 里手写建树算法 |
| 变异注释 | VEP / ANNOVAR | 否 | R 做后续统计 |

**页面文案**：不要为了「全 R」而把 shell 步骤硬塞进 R； reproducibility 比语言纯粹更重要。

### 3.6 包图谱

按任务分组：输入输出、QC、差异、富集、单细胞、微生物、系统发育、可视化、可复现。
每个包：名称、来源（CRAN/Bioconductor）、一句话用途、替代品、学习成本、是否在课程中使用。
不写「最好的包」，写「适用条件」。

### 3.7 文件格式野外指南

FASTA、FASTQ、GFF3、BED、BAM、VCF、Newick、MTX、h5ad、CSV/TSV、Excel。
每条：是什么、典型大小、谁产生、R 怎么读、常见坑（0-based vs 1-based、压缩、编码）。

### 3.8 从 GEO 到差异基因（概念走查）

1. 找数据集（GSE）；
2. 读样本表与设计；
3. 下载 counts / 或原始数据；
4. 检查分组与批次；
5. 选择 DE 工具；
6. 结果解释与富集；
7. 记录版本与参数。

**不提供自动下载脚本**（避免网络依赖与许可问题）；只给检索策略与检查清单。

### 3.9 生信常见误区

- 把技术重复当生物学重复；
- 批次与处理完全混杂；
- 用原始 counts 做 PCA/聚类；
- 只按 p 值选基因；
- 富集背景基因集错误；
- 生存分析丢删失；
- 单细胞把细胞数当 n；
- 不记录工具版本与参数；
- 把「跑通」当「结论正确」。

### 3.10 数据契约

```js
window.BIOR_BIOINFO = {
  workflows: [ { id, title, lede, nodes: [ { id, label, step, x, y, purpose, tools, inputs, outputs, checkpoints, failures, chapters, cheatsheets } ], edges: [ [from, to] ] } ],
  packages: [ { name, source, task, use, alternatives, cost, inCourse } ],
  formats: [ { id, name, what, who, read_in_r, pitfalls } ],
  myths: [ { id, title, body, chapters } ]
};
```

---

## 4. 数据诊所（Data Clinic）

### 4.1 目标

用「病例卡」训练科研判断力。每张卡是一个常见的错误分析场景：

- 症状（你看到的结论/图）；
- 红旗（设计或统计上的问题）；
- 诊断（为什么会错）；
- 处方（正确做法 + R 修复）；
- 预防（下次怎么避免）。

### 4.2 页面结构

```text
┌ Hero：先诊断，再开药 ──────────────────────────────────────────────┐
│ [全部] [设计] [统计] [可视化] [可复现] [组学]                        │
├ 红旗速筛（6 个问题） ───────────────────────────────────────────────┤
│ n 是生物学重复吗？处理与批次混杂吗？多重比较校正了吗？…              │
├ 病例卡（14 张） ────────────────────────────────────────────────────┤
│ 症状 / 红旗 / 诊断 / 处方 / R 修复 / 预防 / 相关章节                 │
└ 相关速查 / 统计导航 ────────────────────────────────────────────────┘
```

### 4.3 14 个病例

| # | 病例 | 类别 | 核心问题 | 正确做法 | 关联 |
| --- | --- | --- | --- | --- | --- |
| 1 | 30 个细胞，3 只鼠 | 设计 | 伪重复 | 以个体为 n；混合模型/个体汇总 | ch15 |
| 2 | 处理组全在批次 1 | 设计 | 批次与处理完全混杂 | 重新设计/随机化；模型无法救 | ch15/ch18 |
| 3 | 看到 p=0.06 又补 3 个样本 | 统计 | 可选停止/p-hacking | 预先定样本量；报告全部 | ch11 |
| 4 | 20 个基因逐个 t 检验 | 统计 | 多重比较 | BH/FDR；MANOVA/统一模型 | ch11/ch18 |
| 5 | 偏态数据直接 t 检验 | 统计 | 前提不符 | 变换/Wilcoxon；看分布 | ch10/ch11 |
| 6 | 先看 p 再删离群值 | 统计 | 事后排除 | 预设规则；敏感性分析 | ch10/ch06 |
| 7 | 柱状图 + SEM | 可视化 | 掩盖分布 | 箱线/点图/雨云；标 n | ch08 |
| 8 | 三组两两 t 检验 | 统计 | 多重比较/设计 | ANOVA + 事后校正 | ch12 |
| 9 | 分组相关当个体相关 | 统计 | 生态学谬误/Simpson | 分层/混合模型 | ch13/ch15 |
| 10 | 有序变量当连续 | 统计 | 尺度错误 | 有序模型/非参数 | ch13 |
| 11 | 生存分析删掉删失 | 统计 | 选择偏倚 | KM/Cox 保留删失 | ch16 |
| 12 | 原始 counts 做 PCA | 组学 | 技术偏差 | logCPM/VST；看批次 | ch17 |
| 13 | n=10，8 个预测变量 | 统计 | 过拟合 | 降维/正则/减少变量 | ch13 |
| 14 | 图是手改的，报告不可重跑 | 可复现 | 图与数据脱节 | 图由代码生成；render | ch14 |

### 4.4 病例卡字段

```js
{
  id: "pseudoreplication",
  title: "30 个细胞来自 3 只鼠，n 是多少？",
  category: "design",
  symptom: "处理组 15 个细胞 vs 对照 15 个细胞，p = 0.001。",
  red_flag: "把细胞当独立个体。",
  diagnosis: "细胞是技术/生物学嵌套在个体内；误差被低估。",
  prescription: ["以个体为统计单位", "或混合模型：cell 嵌套于 mouse", "报告个体数 n=3"],
  r_fix: "lmer(value ~ group + (1 | mouse))",
  prevention: "实验设计时先写统计单位与 n。",
  chapters: ["ch15"],
  cheatsheets: ["mixed-models"]
}
```

### 4.5 红旗速筛（首页交互）

6 个是非题，全部来自真实病例：
1. 你的 n 是独立生物学个体吗？
2. 处理与批次是否完全重合？
3. 三组以上是否做了多重比较校正？
4. 是否在看过结果后改排除规则？
5. 图是否由代码生成？
6. 报告是否包含效应量与 CI？

答「否/不确定」→ 推荐对应病例 + 章节 + 速查表。不做评分。

### 4.6 数据契约

```js
window.BIOR_CLINIC = {
  cases: [ /* schema above */ ],
  redFlags: [ { id, question, cases: [] } ]
};
```

---

## 5. 统计导航（Stats Navigator）

### 5.1 目标

把「我该用什么检验」变成一棵可解释的决策树，并给出：

- 推荐检验 + R 函数；
- 前提检查；
- 效应量与报告模板；
- 对应章节与速查表；
- 常见误用。

### 5.2 页面结构

```text
┌ Hero：先设计，再选检验 ────────────────────────────────────────────┐
├ 决策树（单页问答） ─────────────────────────────────────────────────┤
│ 结局类型 → 组数/设计 → 配对? → 假设 → 结果卡                         │
├ 结果卡 ─────────────────────────────────────────────────────────────┤
│ 推荐检验 / R 函数 / 前提 / 效应量 / 报告句型 / 不要做什么 / 章节      │
├ 检验选择总表（可打印） ─────────────────────────────────────────────┤
├ 前提检查清单 ───────────────────────────────────────────────────────┤
├ 报告句型生成器 ─────────────────────────────────────────────────────┤
└ 相关速查 / 数据诊所 ────────────────────────────────────────────────┘
```

### 5.3 决策树

```text
Q1 结局变量类型？
├─ 连续型
│  ├─ 目的：描述一组 → 均值/中位数 + SD/IQR（不做检验）
│  ├─ 目的：两组独立
│  │   ├─ 正态且方差齐 → Student t
│  │   ├─ 正态但方差不齐 → Welch t
│  │   └─ 明显偏态/有序 → Wilcoxon rank-sum
│  ├─ 目的：两组配对
│  │   ├─ 差值正态 → paired t
│  │   └─ 差值偏态 → Wilcoxon signed-rank
│  ├─ 目的：3+ 组独立
│  │   ├─ 正态且方差齐 → one-way ANOVA + Tukey/emmeans
│  │   └─ 否则 → Kruskal–Wallis + Dunn
│  ├─ 目的：3+ 组重复测量
│  │   ├─ 正态 → repeated-measures ANOVA / mixed model
│  │   └─ 否则 → Friedman + 事后
│  ├─ 目的：两个因素 → two-way ANOVA + 交互
│  └─ 目的：关系/预测 → 线性回归 / 逻辑回归（二分类结局）
├─ 二分类
│  ├─ 两组独立 → χ² / Fisher exact；效应量 OR/RR
│  ├─ 配对 → McNemar
│  └─ 调整混杂 → logistic regression
├─ 计数
│  ├─ 列联表 → χ² / Fisher
│  └─ 率/过离散 → Poisson / negative binomial
├─ 时间到事件
│  ├─ 组间 → KM + log-rank
│  └─ 调整 → Cox；检查 PH
├─ 多变量/组学
│  ├─ 样本结构 → PCA / 聚类
│  ├─ 组间整体差异 → PERMANOVA
│  └─ 特征差异 → DE + FDR
└─ 一致性/相关
   ├─ 两个连续变量 → Pearson / Spearman
   └─ 测量一致性 → ICC / Bland–Altman
```

每个叶节点字段：

```js
{
  id: "welch-t",
  test: "Welch two-sample t-test",
  r_function: "t.test(y ~ group, data = d, var.equal = FALSE)",
  assumptions: ["独立个体", "近似正态或 n 足够大"],
  effect_size: "Cohen's d + 95% CI",
  report: "Welch's t-test: t(df) = ..., p = ..., mean difference = ... (95% CI ...), d = ...",
  avoid: ["不要因为 Levene 显著就自动改用 Wilcoxon", "不要忽略配对设计"],
  chapters: ["ch11"],
  cheatsheets: ["test-selection", "reporting"]
}
```

### 5.4 前提检查清单

- 独立性（最重要，不能靠检验补救）；
- 配对/重复测量；
- 正态性（残差/差值，不是原始数据；大 n 时不要机械检验）；
- 方差齐性；
- 离群值规则；
- 多重比较；
- 效应量与 CI；
- 缺失机制。

### 5.5 报告句型生成器

输入：n1、mean1、sd1、n2、mean2、sd2、差值、95% CI、统计量、df、p、效应量。
输出中英文模板：

> 低氧组体重（mean ± SD, n = 10）为 168 ± 12 g，对照组为 182 ± 14 g；Welch t 检验显示平均差 −14 g（95% CI −25 to −3），t(17.2) = −2.61，p = 0.018，Cohen's d = −1.08。

生成器只拼接用户输入，不计算统计量，避免「网页算错」。

### 5.6 数据契约

```js
window.BIOR_STATS_TREE = {
  root: "outcome-type",
  nodes: {
    "outcome-type": { question: "结局变量类型？", options: [ { label, next } ] },
    ...
  },
  results: { "welch-t": { ... } }
};
```

---

## 6. R 代码急救室（R Triage）

### 6.1 目标

让学习者在 3 分钟内从「报错截图」走到「知道原因 + 知道怎么改 + 知道怎么预防」。

### 6.2 页面结构

```text
┌ Hero：先看报错，再改代码 ──────────────────────────────────────────┐
│ 搜索：粘贴报错关键词，如 "object not found" / "cannot open file"     │
├ 分诊台（8 类） ─────────────────────────────────────────────────────┤
│ 对象/函数 / 类型 / 包 / 路径与编码 / join / 绘图 / 建模 / Bioconductor│
├ 报错卡（40+） ──────────────────────────────────────────────────────┤
│ 报错原文 / 最小复现 / 病因 / 修复 / 预防 / 相关章节                   │
├ 调试五步法 ─────────────────────────────────────────────────────────┤
├ 提问模板（reprex） ─────────────────────────────────────────────────┤
└ sessionInfo 复制 ───────────────────────────────────────────────────┘
```

### 6.3 报错卡字段

```js
{
  id: "object-not-found",
  message: "Error in eval(predvars, data, env): object 'body_mass' not found",
  category: "object-function",
  minimal: "mean(body_mass)",
  cause: "变量名拼写错误，或数据框列名不是独立对象。",
  fix: ["检查 names(df)", "用 df$body_mass 或 with(df, mean(body_mass))"],
  prevent: "用 RStudio 自动补全；先 glimpse(df)。",
  chapters: ["ch02", "ch06"],
  cheatsheets: ["vectors", "dplyr"]
}
```

### 6.4 分诊分类与示例（40+）

| 类别 | 示例报错 |
| --- | --- |
| 对象/函数 | `object 'x' not found`；`could not find function "foo"`；`object of type 'closure' is not subsettable` |
| 类型/长度 | `NAs introduced by coercion`；`non-numeric argument to mathematical function`；`the condition has length > 1`；`argument is of length zero`；`replacement has 1 row, data has 0` |
| 包/环境 | `there is no package called 'ggplot2'`；`package or namespace load failed`；`Bioconductor version is too old` |
| 路径/编码 | `cannot open file 'data.csv'`；`'\U' used without hex digits`；`invalid multibyte string`；`line 1 did not have N elements` |
| 数据整形 | `Join columns must be present`；`Can't join due to incompatible types`；`Column names must be unique`；`Can't convert character to double` |
| 因子/模型 | `contrasts can be applied only to factors with 2 or more levels`；`model matrix is rank deficient`；`system is computationally singular`；`singular fit` |
| 绘图 | `Aesthetics must be either length 1 or the same as the data`；`Continuous value supplied to discrete scale`；`stat_count() can only have an x or y`；`Removed N rows containing missing values`；`figure margins too large` |
| Bioconductor/组学 | `counts must be integers`；`design contains a factor with only one level`；`unable to find an inherited method for function 'assay'`；`there is no package called 'org.Hs.eg.db'`；`cannot allocate vector of size` |

每类至少 5 条，合计 40+。报错原文必须来自真实运行（由 `tools/collect-errors.R` 生成/核对），不凭记忆写。

### 6.5 调试五步法

1. 读报错最后一行：错误类型 + 对象/函数名。
2. 定位最小复现：删到只剩触发错误的几行。
3. 检查输入：`str()` / `glimpse()` / `names()` / `class()` / `dim()`。
4. 检查环境：包版本、工作目录、对象是否存在。
5. 搜索/提问：贴 `sessionInfo()` + `reprex()`，不贴截图。

### 6.6 数据契约

```js
window.BIOR_TRIAGE = {
  errors: [ /* schema above */ ],
  categories: [ { id, label, desc } ],
  debugSteps: [ ... ]
};
```

---

## 7. 数据集标本馆（Dataset Zoo）

### 7.1 目标

让学习者知道：

- 每个数据集的研究问题、变量、单位、n；
- 数据是模拟还是真实、许可是什么；
- 适合练哪一章；
- 怎么引用。

### 7.2 页面结构

```text
┌ Hero：先看标本标签，再动手 ────────────────────────────────────────┐
│ [教学数据] [外部开放数据] [按章节] [按分析类型]                       │
├ 数据集卡（9 个教学 + 8 个外部入口） ────────────────────────────────┤
│ 名称 / 行×列 / 研究问题 / 变量 / 模拟? / 用于章节 / 下载 / 预览       │
├ 数据字典查看器 ─────────────────────────────────────────────────────┤
├ 数据来源与许可 ─────────────────────────────────────────────────────┤
└ 引用与使用规范 ─────────────────────────────────────────────────────┘
```

### 7.3 数据集卡字段

```js
{
  id: "pika-physiology",
  title: "高原鼠兔生理调查（教学模拟）",
  file: "assets/data/pika_physiology.csv",
  rows: 60, cols: 11,
  simulated: true,
  license: "CC0（教学模拟数据）",
  research_question: "海拔与性别是否影响体重和血红蛋白？",
  variables: [ { name, type, unit, missing, range, desc } ],
  chapters: ["ch03", "ch06", "ch08", "ch10", "ch11", "ch12", "ch13"],
  analyses: ["描述统计", "t 检验", "ANOVA", "回归"],
  preview: [ /* first 6 rows */ ]
}
```

### 7.4 外部开放数据入口

只给链接与检索策略，不自动下载：
GEO、ArrayExpress、SRA、Ensembl、UCSC、UniProt、PDB、KEGG、GO、GBIF、Dryad、Zenodo、Figshare。
每条：适合什么、许可注意、如何引用、需要什么工具。

### 7.5 数据使用规范

- 教学模拟数据必须标注 `simulated: true`；
- 真实数据必须写许可与来源；
- 不收录患者级数据；
- 外部数据不镜像、不自动抓取；
- 下载文件名与数据字典一致；
- 数据字典是数据卡的一部分，不可省略。

---

## 8. 课题工作台（Project Workbench）

### 8.1 目标

把 18 章从「课程清单」变成「一个正在进行的研究」。用户随时能看到：

- 研究问题与设计；
- 已经产出了什么；
- 还缺什么；
- 下一步做什么；
- 这份分析是否可复现。

### 8.2 页面结构

```text
┌ 研究问题卡 ─────────────────────────────────────────────────────────┐
│ 问题 / 设计 / n / 数据 / 统计单位                                     │
├ 进度总览 ───────────────────────────────────────────────────────────┤
│ 阶段 I 5/5 · 阶段 II 3/4 · 阶段 III 1/4 · 阶段 IV 0/5                │
├ 交付物看板（18 项） ────────────────────────────────────────────────┤
│ ☑ ch06 table1_group.csv      ☐ ch09 Figure1.pdf                     │
├ 图表槽位 ───────────────────────────────────────────────────────────┤
│ Figure 1 [占位] 需要 ch08+ch09   Figure 2 [占位] 需要 ch12           │
├ 方法学清单 ─────────────────────────────────────────────────────────┤
│ 设计 / 统计 / 软件版本 / 数据可得性                                   │
├ 可复现清单 ─────────────────────────────────────────────────────────┤
│ 原始数据只读 / 相对路径 / renv / Quarto / 图由代码生成                │
├ [ 导出研究日志 PDF ] [ 下一步 → ] ──────────────────────────────────┘
```

### 8.3 交付物清单

| 章节 | 交付物 | 工作台标签 |
| --- | --- | --- |
| ch01 | `00_setup.R`、`README.md`、`sessionInfo.txt` | 项目骨架 |
| ch02 | `01_vectors.R`、`hemoglobin_clean.csv` | 清洗向量 |
| ch03 | `metadata_tidy.csv`、`data_dictionary.csv` | 数据字典 |
| ch04 | `02_import_qc.R`、`qc_report.csv` | 导入 QC |
| ch05 | `R/qc_functions.R`、`fig_sampling_error.svg` | 函数与模拟 |
| ch06 | `table1_group.csv`、`exclusions.csv` | Table 1 |
| ch07 | `expr_long.csv`、`join_qc.csv` | 表达长表 |
| ch08 | 3 张探索图 | 探索图组 |
| ch09 | `Figure1.pdf`、`figure1_legend.md` | Figure 1 |
| ch10 | `02_descriptive.R`、`fig_distributions.svg` | 分布报告 |
| ch11 | `stats_two_group.csv`、`methods_two_group.md` | 两组结果 |
| ch12 | `stats_anova.csv`、`fig_anova_letters.svg` | ANOVA |
| ch13 | `stats_regression.csv`、`fig_regression.svg` | 回归 |
| ch14 | `report.html`、`renv.lock` | 可复现报告 |
| ch15 | `stats_mixed.csv` | 混合模型 |
| ch16 | `fig_survival.svg`、`stats_cox.csv` | 生存 |
| ch17 | `fig_pca.svg`、`fig_heatmap.svg` | PCA/热图 |
| ch18 | `de_results.csv`、`fig_volcano.svg`、`fig_enrichment.svg` | DE/富集 |

### 8.4 图表槽位

- Figure 1：体重/血红蛋白分布 + 统计（ch08+ch09+ch11）
- Figure 2：海拔 × 性别交互（ch12）
- Figure 3：血红蛋白 ~ 海拔回归（ch13）
- Figure 4：PCA + 热图（ch17）
- Figure 5：火山图 + 富集（ch18）
- Table 1：基线描述（ch06）
- Table 2：模型结果（ch11–ch13）

未完成显示占位与所需章节，不显示假图。

### 8.5 可复现清单

- [ ] 原始数据只读，未被覆盖。
- [ ] 所有路径相对项目根目录。
- [ ] 脚本按编号可顺序运行。
- [ ] 图由脚本生成，无手动修改。
- [ ] `renv.lock` 已提交。
- [ ] `sessionInfo()` 已记录。
- [ ] 报告可 `render` 重跑。
- [ ] README 写清运行顺序与依赖。
- [ ] 数据字典与最终表一致。
- [ ] 输出文件命名含版本/日期。

### 8.6 导出研究日志

打印当前工作台为 A4 PDF：
- 研究问题与设计；
- 交付物完成表；
- 图表槽位状态；
- 方法学段；
- 可复现清单；
- 生成日期与 `sessionInfo` 摘要。

只打印工作台，不打印全站。

---

## 9. 速查表（36 张）

### 9.1 分类与清单

| # | 分类 | 表名 | 内容要点 | 优先级 | 科研工具 |
| --- | --- | --- | --- | --- | --- |
| 1 | 基础语法 | R 基础语法与运算符 | 赋值、算术、比较、逻辑、管道、`%in%`、常用常量 | P0 | |
| 2 | 基础语法 | 向量与索引 | `c()`、类型、`[]`、逻辑索引、命名、`seq`/`rep` | P0 | |
| 3 | 基础语法 | 缺失值、类型与强制转换 | `NA`/`NaN`/`NULL`、`is.na`、转换阶梯、因子 | P0 | |
| 4 | 基础语法 | 数据框与 tibble | 行列索引、`$`、`str`/`glimpse`、tidy 原则 | P0 | |
| 5 | 数据处理 | dplyr 动词 | filter/select/mutate/arrange/group_by/summarise/across | P0 | |
| 6 | 数据处理 | tidyr 宽长转换 | pivot_longer/wider、separate/unite、缺失组合 | P0 | |
| 7 | 数据处理 | 多表连接 | left/inner/full/anti/semi、键、行数检查 | P0 | |
| 8 | 数据处理 | stringr 与正则 | 检测、替换、提取、大小写、空格 | P1 | |
| 9 | 数据处理 | forcats 因子 | 水平重排、合并、其他水平、有序因子 | P1 | |
| 10 | 数据处理 | purrr 与 apply 家族 | map/map_dfr/walk、匿名函数、错误捕获 | P1 | |
| 11 | 导入与路径 | 导入导出 | read_csv/read_excel/write_csv/writexl、类型与编码 | P0 | |
| 12 | 导入与路径 | 项目路径与 here | Project、相对路径、`here()`、文件名规范 | P0 | |
| 13 | 可视化 | ggplot2 语法 | data/aes/geom/stat/scale/facet/theme | P0 | |
| 14 | 可视化 | geom 选择 | 分布/比较/关系/组成/趋势/组学/生存 | P0 | |
| 15 | 可视化 | 标度、配色与色盲安全 | Okabe–Ito、viridis、发散色、图例 | P0 | |
| 16 | 可视化 | 主题、拼图与期刊导出 | theme、patchwork、ggsave、尺寸/字体/格式 | P0 | |
| 17 | 可视化 | 图形质检清单 | n、单位、误差线、统计、面板、可读性 | P0 | |
| 18 | 统计建模 | 描述统计与 Table 1 | mean/SD、median/IQR、n、缺失、分组 | P0 | |
| 19 | 统计建模 | 统计检验选择 | 结局类型 × 设计 × 假设 → 检验 | P0 | ✔ |
| 20 | 统计建模 | ANOVA 与事后比较 | 单/双因素、交互、Tukey/emmeans、字母 | P1 | |
| 21 | 统计建模 | 回归与诊断 | lm/glm、系数、CI、残差、QQ、杠杆 | P1 | |
| 22 | 统计建模 | 混合效应模型 | lmer、随机截距/斜率、ICC、singular fit | P2 | |
| 23 | 统计建模 | 生存分析 | Surv/survfit/coxph、删失、HR、PH | P2 | |
| 24 | 统计建模 | PCA、聚类与热图 | prcomp、scale、pheatmap、hclust | P2 | |
| 25 | 科研工具 | RStudio 快捷键 | 运行、补全、注释、重排、历史、面板 | P0 | ✔ |
| 26 | 科研工具 | Quarto / R Markdown | chunk、inline、参数、render、输出格式 | P0 | ✔ |
| 27 | 科研工具 | renv 与环境复现 | init/snapshot/restore、lockfile、缓存 | P1 | ✔ |
| 28 | 科研工具 | Git 最小命令 | init/add/commit/status/diff/log、忽略文件 | P1 | ✔ |
| 29 | 科研工具 | 数据字典模板 | 变量、类型、单位、缺失、范围、统计单位 | P0 | ✔ |
| 30 | 科研工具 | 样本量与功效 | pwr、效应量、α、power、模拟 | P2 | ✔ |
| 31 | 科研工具 | 统计报告句型 | Methods/Results 中英文模板、CI、效应量 | P0 | ✔ |
| 32 | 生物信息 | DESeq2 差异分析 | counts、design、results、shrink、padj、火山 | P2 | ✔ |
| 33 | 生物信息 | 富集分析 | ORA/GSEA、背景、TERM2GENE、FDR | P2 | ✔ |
| 34 | 生物信息 | 单细胞 Seurat 最小流程 | 矩阵、QC、归一化、聚类、注释、DE | P3 | ✔ |
| 35 | 生物信息 | 微生物组 phyloseq + ggtree | 导入、多样性、组成、树、可视化 | P3 | ✔ |
| 36 | 生物信息 | 生物数据库与文件格式 | GEO/Ensembl/UniProt/PDB/KEGG；FASTA/FASTQ/GFF/BAM/VCF | P2 | ✔ |

P0 = 首批必须；P1 = 核心轨补充；P2 = 进阶轨；P3 = 生信专区扩展。

**科研工具类（#25–#31）是本站与普通 R 教程的主要差异**：不只查函数，还查「怎么做科研」——项目环境、版本控制、数据字典、样本量、报告句型。后续可扩展 Zotero / Fiji / Inkscape 等软件衔接表，但不进入 1.0。

### 9.2 卡片类型

| 类型 | 用途 | 示例 |
| --- | --- | --- |
| `table` | 对照/选择表 | 检验选择、geom 选择 |
| `code` | 可复制代码块 | dplyr、DESeq2 |
| `items` | 函数/参数条目 | stringr、forcats |
| `decision` | 决策流程 | 统计检验选择、样本量 |

### 9.3 数据契约

```js
window.BIOR_CHEATSHEETS = [{
  id: "dplyr-verbs",
  title: "dplyr 动词",
  short: "dplyr",
  category: "数据处理",
  desc: "一行一个动作，用管道串起来。",
  type: "table",
  header: ["动词", "作用", "科研场景"],
  rows: [ ["filter()", "按条件保留行", "排除缺失血红蛋白"], ... ],
  code: null,
  notes: ["group_by() 后记得 ungroup()"],
  tip: "先 filter 再 mutate，能减少计算量。",
  research: false,
  chapters: ["ch06"],
  updated: "2026-10-27"
}];
```

渲染规则：
- `table`：表头 + 行；单元格允许 HTML，但 `<` 必须转义。
- `code`：代码块 + notes。
- `items`：函数名 + 说明两列表。
- `decision`：步骤列表 + 结果表。
- 复制：`code` 复制整段；`table`/`items` 复制为制表符分隔文本；`decision` 复制为编号列表。
- 搜索索引包含标题、分类、行文本、notes、code。
- 科研工具卡显示 `RESEARCH TOOL` 徽标，并在分类筛选中可单独过滤。

### 9.4 速查表验收

- [ ] 每张表有唯一 `id`、分类、`updated`、关联章节。
- [ ] 表格单元格中的 `<`、`>`、`&` 已转义。
- [ ] 代码型表的代码可复制、可运行。
- [ ] 所有统计结论与章节一致；不出现「p<0.05 即显著优于」。
- [ ] 科研工具表覆盖 RStudio、Quarto、renv、Git、数据字典、报告句型。
- [ ] 打印时卡片不跨页，表头重复。

---

## 10. 专栏之间的交叉链接

```text
绘图专区 ── 每张配方 → ch08/ch09 + ggplot 速查
生信专区 ── 每个节点 → ch17/ch18 + DESeq2/富集速查
数据诊所 ── 每个病例 → 对应章节 + 统计导航 + 速查
统计导航 ── 每个结果 → 章节 + 报告句型 + 检验选择表
代码急救 ── 每条报错 → 最可能出错的章节 + 相关速查
数据集馆 ── 每个数据集 → 使用它的章节
工作台   ── 每个交付物 → 章节 + 图表槽位
```

原则：**任何专栏单元都不是孤岛**；至少有一个入口和一个出口。

---

## 11. 备选创意与取舍

以下想法有价值，但不单独开专栏；它们被折叠进现有结构，避免站点膨胀。

| 创意 | 处理 | 理由 |
| --- | --- | --- |
| 论文拆图室 | 作为绘图专区的折叠区 | 与图鉴共享图、代码、解剖热区；单独开页会重复 |
| 复现档案室 | 作为课题工作台的可复现清单 + ch14 | 复现是交付的一部分，不是独立阅读 |
| 期刊风格画廊 | 作为绘图专区的「期刊预设」 | 与图鉴配方卡共享导出规格 |
| 统计句型生成器 | 作为统计导航的报告模板 | 与检验选择结果绑定，避免孤立工具 |
| 实验设计/功效模拟器 | 先做「样本量与功效」速查；进阶再做交互 | 交互模拟需要更多统计审核，v1 不冒险 |
| 30 天科研 R 挑战 | 暂缓 | 需要持续运营与每日内容，超出静态站维护能力 |
| 代码审阅室（提交代码换反馈） | 不做 | 需要后端、隐私与人力；与离线站冲突 |
| 数据故事墙（用户案例） | 暂缓 | 需要投稿、授权与审核流程 |
| 术语图谱 | 作为术语表 + tooltip | 已有 glossary，不重复造可视化 |

**筛选标准**：
1. 是否直接帮助「完成一个科研任务」；
2. 是否能复用现有数据/组件；
3. 是否能在纯静态、离线条件下维护；
4. 是否需要持续运营或后端。

四项中任一不满足，默认折叠或暂缓。

---

## 12. 专栏验收清单

- [ ] 7 个专栏都有明确的隐喻和主交互。
- [ ] 每个单元可深链接，且能在 2 次点击内回到相关章节。
- [ ] 每个单元有「适用 / 不适用」或「正确 / 错误」的判断内容，不只是资料堆。
- [ ] 所有代码/数值可追溯；无手写统计结果。
- [ ] 搜索覆盖全部专栏；空状态有建议。
- [ ] 打印当前筛选结果可用。
- [ ] 36 张速查表按 P0/P1/P2/P3 分批实现，P0 不晚于 Phase 2。
