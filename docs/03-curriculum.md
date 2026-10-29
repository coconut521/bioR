# 03 · 课程大纲：从语法到一篇可复现的研究

本文件定义 18 章的教学目标、科研情境、数据、任务、交付物与统计判断点。所有章节共享一条连续研究主线；每一章都必须在生物学科研里有明确用途。

---

## 1. 学习成果

完成核心 14 章后，学生应能：

1. 用 RStudio Project + 相对路径 + `renv` 组织一个可复现的分析项目。
2. 把仪器导出、实验记录、样本表整理成 tidy data，并写出数据字典。
3. 用 `dplyr` / `tidyr` 完成过滤、派生、分组汇总、宽长转换和多表连接。
4. 用 `ggplot2` 按科研问题选择图形，并输出符合期刊尺寸、字体、配色要求的图。
5. 根据研究设计选择描述统计与检验，报告效应量、置信区间和 p 值。
6. 完成 t 检验、Wilcoxon、ANOVA、回归，并检查假设与诊断。
7. 用 Quarto 生成一份从原始数据可重跑的报告。

完成进阶 4 章后，额外应能：

8. 识别伪重复，使用混合效应模型处理个体/批次嵌套。
9. 完成 Kaplan–Meier 与 Cox 生存分析。
10. 用 PCA、聚类和热图探索组学样本结构。
11. 完成 RNA-seq 差异表达与富集分析，并解释 FDR 与效应量。

贯穿全部章节的判断力目标：

- 知道 **n 是生物学重复数，不是细胞数/孔数/读数**。
- 知道 **p 值不是效应大小，也不是因果证据**。
- 知道 **多重比较必须校正**。
- 知道 **图必须能回答一个具体问题**，而不是「把数据都画出来」。
- 知道 **分析必须能从原始数据重跑**。

---

## 2. 连续研究主线

### 2.1 课题

> **低氧适应研究（教学模拟数据）**  
> 青藏高原不同海拔的高原鼠兔（*Ochotona curzoniae*）在体重、血红蛋白和基因表达上是否存在差异？性别是否修饰海拔效应？低氧处理是否影响生存与转录组？

这是一个虚构的教学课题，数据由脚本模拟生成。网站上必须标注：

> 本课题数据为教学模拟，不对应任何真实个体；所有统计结论仅用于方法训练。

### 2.2 研究设计

| 子研究 | 设计 | 样本 | 用途 |
| --- | --- | --- | --- |
| 生理调查 | 3 海拔 × 2 性别，每格 10 只 | 60 只 | 描述统计、t 检验、ANOVA、回归 |
| 重复测量 | 2 处理 × 3 时间点 | 12 只 × 3 = 36 条 | 配对检验、混合效应 |
| 生存实验 | 2 处理，随访 60 天 | 60 只 | Kaplan–Meier、Cox |
| 转录组 | 2 组 × 6 样本，2 批次 | 12 样本 × 2000 基因 | 整形、连接、PCA、热图、DESeq2、富集 |

### 2.3 数据文件

| 文件 | 行 × 列 | 关键变量 | 首次使用 |
| --- | --- | --- | --- |
| `pika_physiology.csv` | 60 × 11 | `id`, `altitude_m`, `altitude_group`, `sex`, `body_mass_g`, `body_length_mm`, `hemoglobin_g_l`, `hematocrit_pct`, `glucose_mmol_l`, `batch`, `measured_on` | ch03 |
| `pika_repeated.csv` | 36 × 6 | `id`, `treatment`, `timepoint`, `body_mass_g`, `hemoglobin_g_l`, `batch` | ch11 / ch15 |
| `pika_survival.csv` | 60 × 6 | `id`, `treatment`, `sex`, `body_mass_g`, `time_days`, `status` | ch16 |
| `pika_rnaseq_counts.csv` | 2000 × 14 | `gene_id`, `gene_name`, `C1–C6`, `H1–H6` | ch07 |
| `pika_rnaseq_metadata_raw.csv` | 12 × 5 | `sample_id`, `group`, `batch`, `sex`, `library_size` | ch07 |
| `pika_rnaseq_metadata_clean.csv` | 12 × 5 | 同上，已修复 ID | ch17 / ch18 |
| `pika_annotation.csv` | 2000 × 5 | `gene_id`, `symbol`, `description`, `go_bp`, `kegg_pathway` | ch18 |
| `pika_lab_notebook.xlsx` | 2 sheets | 采样日期、备注 | ch04 |
| `plate_reader_raw.csv` | 3 行元数据 + 96 行 | 酶标仪导出，含前导注释 | ch04 |

**有意埋入的教学问题**（必须在对应章节解决）：

- `hemoglobin_g_l` 有 2 个 `NA`（ch02/ch04/ch10）。
- `pika_rnaseq_metadata_raw.csv` 中 `H-5`、`H-6` 与 counts 列名 `H5`、`H6` 不一致，`C3` 前有空格（ch07）。
- `plate_reader_raw.csv` 前 3 行是仪器注释（ch04）。
- 1 个样本在 PCA 中是技术离群点（ch17）。
- 生存数据含删失（ch16）。
- 批次与处理在设计上不完全平衡（ch15/ch18 讨论混杂，不伪造显著性）。

### 2.4 最终产出

核心轨完成时，工作台应能展示：

- Table 1：按海拔/性别的描述统计。
- Figure 1：体重与血红蛋白的分布 + 统计标注。
- Figure 2：海拔 × 性别交互。
- Figure 3：血红蛋白 ~ 海拔的回归。
- Methods / Results 段落草稿。
- `report.html` + `renv.lock` + 项目结构。

进阶轨追加：

- Figure 4：PCA + 热图。
- Figure 5：火山图 + 富集气泡图。
- 混合模型与生存分析结果表。

---

## 3. 章节依赖

```text
ch01 项目
  └─ ch02 向量
       └─ ch03 数据框
            └─ ch04 导入/QC
                 └─ ch05 函数/模拟
                      └─ ch06 数据整形
                           ├─ ch07 宽长/连接
                           │    └─ ch17 多变量 (进阶)
                           │         └─ ch18 转录组 (进阶)
                           ├─ ch08 ggplot2
                           │    └─ ch09 出版图
                           ├─ ch10 描述统计
                           │    ├─ ch11 两组
                           │    │    └─ ch12 多组
                           │    │         └─ ch13 回归
                           │    │              ├─ ch15 混合模型 (进阶)
                           │    │              └─ ch16 生存 (进阶)
                           │    └─ ch14 可复现报告（需 ch06–ch13）
                           └─ ch18 也依赖 ch10–ch13
```

- ch14 是核心轨的收束章，要求前面至少完成 ch06–ch13 的主要交付物。
- ch15–ch18 可独立选修，但 ch18 需要 ch07、ch10–ch13、ch17 的基础。
- 每章封面写清前置章节；不满足前置时给「建议先看」提示，不硬性锁死。

---

## 4. 四个研究阶段

| 阶段 | 章节 | 一句话 | 阶段产出 |
| --- | --- | --- | --- |
| I 准备数据 | ch01–ch05 | 把实验记录变成可信、可复现的数据 | 项目骨架、清洗后的表、QC 报告 |
| II 探索与可视化 | ch06–ch09 | 把表变成能回答问题的图和汇总 | Table 1、探索图、Figure 1 |
| III 统计推断 | ch10–ch13 | 从「看起来有差异」到「有多大、有多确定」 | 检验结果、效应量、模型表 |
| IV 交付与进阶 | ch14–ch18 | 把分析装配成报告，并进入组学 | 可复现报告、进阶图与模型 |

---

## 5. 核心章节（ch01–ch14）

### 第 1 章 从零开始：R、RStudio 与可复现项目

| 项 | 内容 |
| --- | --- |
| 一句话目标 | 能建立一个「双击就能重跑」的分析项目，而不是把脚本散落在桌面。 |
| 语法核心 | 对象与 `<-`；脚本 vs 控制台；注释；工作目录；`library()`；`?`；`sessionInfo()`；RStudio 四个面板；Project。 |
| 科研情境 | 课题第一天：拿到第一批体重和血样数据，先建立项目、目录和数据字典，原始数据只读。 |
| 数据 | 空项目；`pika_physiology.csv` 只读副本。 |
| 科研任务 | 创建 `pika-hypoxia/` 项目；建立 `data-raw/`、`data/`、`R/`、`figures/`、`reports/`；写 `README.md`；记录 R 与包版本。 |
| 交付物 | `00_setup.R`、`README.md`、`sessionInfo.txt` |
| 讲解器 | 项目目录树（HTML/SVG，非引擎） |
| 常见错误 | `setwd()` 绝对路径；中文/空格路径；每次重装包；把原始数据覆盖。 |
| 统计判断 | 先固定分析环境，再谈结果。 |
| 速查联动 | RStudio 快捷键、项目结构、`renv` |
| 时长 / 难度 | 60–75 min / ★ |
| 前置 | 无 |

**关键写法**：全站代码禁止 `setwd("C:/Users/...")`；统一用 `here::here()`。第 1 章就要解释为什么。

---

### 第 2 章 向量与数据类型：把测量值放进 R

| 项 | 内容 |
| --- | --- |
| 一句话目标 | 能判断一列数据是什么类型，并正确处理 `NA`、因子和强制转换。 |
| 语法核心 | `c()`；numeric/integer/character/logical/factor；`NA`；`is.na()`；强制转换；`[]` 与逻辑索引；`seq()`、`rep()`；`length()`；`mean(na.rm = TRUE)`；`summary()`。 |
| 科研情境 | 12 只鼠兔的血红蛋白测量值，其中 2 只溶血失败；性别与海拔分组要作为因子。 |
| 数据 | `pika_physiology.csv` 的 `hemoglobin_g_l`、`sex`、`altitude_group`。 |
| 科研任务 | 手工录入 12 个值（含 `NA`）；检查范围；计算均值/中位数；输出清洗后的向量。 |
| 交付物 | `01_vectors.R`、`hemoglobin_clean.csv` |
| 讲解器 | `vector`：单元格、类型标签、`NA`、强制转换箭头。 |
| 常见错误 | `x == NA`；`"NA"` 不是缺失；因子被当成整数；逻辑索引长度不符；回收规则。 |
| 统计判断 | 缺失不是 0；删除缺失必须在报告中说明。 |
| 速查联动 | 向量索引、`NA` 处理、类型转换 |
| 时长 / 难度 | 75–90 min / ★ |

**base R 对照**：`mean(x[!is.na(x)])` vs `mean(x, na.rm = TRUE)`。

---

### 第 3 章 数据框与 tidy 数据：一张表就是一次实验

| 项 | 内容 |
| --- | --- |
| 一句话目标 | 能判断一张表是否符合 tidy data，并写出一份数据字典。 |
| 语法核心 | `data.frame` / `tibble`；`readr::read_csv()`（最小用法，第 4 章展开）；`$`；`[row, col]`；`str()` / `glimpse()`；`names()`；`nrow()` / `ncol()`；tidy 三原则；长宽表。 |
| 科研情境 | 样本表：一行必须是一个个体，一列必须是一个变量；分组不能藏在列名里。 |
| 数据 | `pika_physiology.csv`（60 行）。 |
| 科研任务 | 检查 ID 唯一性；统一列名；把 `altitude_group` 设为有序因子；写 `data_dictionary.csv`（变量、类型、单位、缺失、允许范围）。 |
| 交付物 | `metadata_tidy.csv`、`data_dictionary.csv` |
| 讲解器 | `dataframe`：行=个体、列=变量、类型、重复 ID 高亮。 |
| 常见错误 | 一行一个孔/一次测量；分组写进列名；单位混用；ID 重复；把注释行当数据。 |
| 统计判断 | 统计单位必须在数据字典里写清：个体、批次、时间点。 |
| 速查联动 | 数据框索引、tibble、数据字典模板 |
| 时长 / 难度 | 75–90 min / ★ |

---

### 第 4 章 导入、导出与数据质量：从仪器到 R

| 项 | 内容 |
| --- | --- |
| 一句话目标 | 能把三种来源的数据无损导入，并在分析前完成 QC。 |
| 语法核心 | `readr::read_csv()`、`readxl::read_excel()`、`write_csv()`；`skip`、`col_types`、`problems()`；`janitor::clean_names()`；`skimr::skim()`；缺失、重复、范围检查；`anti_join()` 检查 ID。 |
| 科研情境 | 酶标仪 CSV 有前导注释；实验记录在 Excel；测序样本表是 CSV；三者必须能对上。 |
| 数据 | `plate_reader_raw.csv`、`pika_lab_notebook.xlsx`、`pika_rnaseq_metadata_raw.csv`。 |
| 科研任务 | 写 `02_import_qc.R`：导入 → 清洗列名 → 类型检查 → 缺失统计 → 重复检查 → 范围检查 → 输出 QC 表。 |
| 交付物 | `02_import_qc.R`、`qc_report.csv` |
| 讲解器 | `pipeline`：导入 → 类型 → 缺失 → 重复 → 范围 → 可分析。 |
| 常见错误 | `read.csv()` 与 `read_csv()` 混用；Excel 日期变数值；编码错误；解析失败被忽略；`check.names` 改名。 |
| 统计判断 | 先 QC 再分析；QC 结果要能进入补充材料。 |
| 速查联动 | 导入导出、数据质量、文件路径 |
| 时长 / 难度 | 90–120 min / ★★ |

---

### 第 5 章 函数、控制流与模拟：把重复分析变成工具

| 项 | 内容 |
| --- | --- |
| 一句话目标 | 能把重复三次以上的分析写成函数，并用模拟理解抽样误差。 |
| 语法核心 | `if/else`、`for`、`while`；`function()`、参数、返回值；`stopifnot()`；`purrr::map()` / `map_dfr()`；`replicate()`；`set.seed()`；`tryCatch()`。 |
| 科研情境 | 三个批次各自一个 CSV；需要同一套 QC；同时用模拟回答「为什么 n 越大均值越稳」。 |
| 数据 | 三个批次的文件；`pika_physiology.csv`。 |
| 科研任务 | 写 `qc_summary(df)`；用 `map_dfr()` 批量跑三个文件；模拟 1000 次抽样，画标准误随 n 变化图。 |
| 交付物 | `R/qc_functions.R`、`fig_sampling_error.svg` |
| 讲解器 | `pipeline`（函数调用与映射）+ `stats`（抽样分布）。 |
| 常见错误 | 循环里不断 `c()` 增长向量；`T`/`F` 可被覆盖；函数依赖全局变量；`set.seed()` 放在循环内；静默回收。 |
| 统计判断 | 标准误不是标准差；模拟是理解统计的工具，不是替代设计。 |
| 速查联动 | 函数、`purrr`、模拟与功效 |
| 时长 / 难度 | 90–120 min / ★★ |

---

### 第 6 章 数据整形：用 dplyr 把实验表变成答案

| 项 | 内容 |
| --- | --- |
| 一句话目标 | 能用一组动词从原始表生成按组汇总的 Table 1。 |
| 语法核心 | `filter()`、`select()`、`mutate()`、`arrange()`、`group_by()`、`summarise()`、`across()`、`count()`、`distinct()`、`case_when()`；原生管道；`n()` vs `sum(!is.na())`；`ungroup()`。 |
| 科研情境 | 按海拔和性别计算 n、均值、SD、中位数、IQR；派生条件因子；记录排除规则。 |
| 数据 | `pika_physiology.csv`。 |
| 科研任务 | 写排除规则（缺失血红蛋白、体重范围异常）；生成 Table 1；生成排除日志；导出 CSV。 |
| 交付物 | `table1_group.csv`、`exclusions.csv` |
| 讲解器 | `pipeline`：原始 60 行 → filter 58 行 → group 6 组 → summarise 6 行；每步显示行数。 |
| 常见错误 | `summarise()` 后忘记 `ungroup()`；`n()` 把 `NA` 算进去；`mean()` 未设 `na.rm`；`case_when()` 顺序；列名遮蔽。 |
| 统计判断 | 排除规则必须在看 p 值之前定；Table 1 要写清均值±SD 还是中位数(IQR)。 |
| 速查联动 | dplyr 动词、Table 1 模板 |
| 时长 / 难度 | 90–120 min / ★★ |

**base R 对照**：`aggregate()` / `tapply()` 与 `dplyr` 并排。

---

### 第 7 章 宽长转换与多表连接：当表达矩阵遇上样本表

| 项 | 内容 |
| --- | --- |
| 一句话目标 | 能把 2000 × 12 的表达矩阵与 12 行样本表正确连接，且不丢样本。 |
| 语法核心 | `pivot_longer()` / `pivot_wider()`；`left_join()` / `inner_join()` / `anti_join()`；连接键；`separate()` / `unite()`；`stringr::str_detect()` / `str_replace()` / `str_trim()`；`parse_number()`。 |
| 科研情境 | counts 列名是 `C1…H6`；样本表里出现 `H-5`、`H-6`、` C3`；直接 join 会静默丢 3 个样本。 |
| 数据 | `pika_rnaseq_counts.csv`、`pika_rnaseq_metadata_raw.csv`。 |
| 科研任务 | 先 `anti_join()` 找不匹配；清洗 ID；检查 12/12 全部匹配；转长表；输出连接 QC。 |
| 交付物 | `expr_long.csv`、`join_qc.csv` |
| 讲解器 | `dataframe`：join 键、匹配/未匹配行、多对多警告。 |
| 常见错误 | 多对多连接导致行数膨胀；大小写/空格；join 后不检查行数；`pivot_longer()` 列选择错误；数值列被当字符。 |
| 统计判断 | 连接是分析的一部分；丢样本会改变 n，必须在 QC 中可见。 |
| 速查联动 | tidyr、join、stringr |
| 时长 / 难度 | 90–120 min / ★★ |

---

### 第 8 章 ggplot2 语法：把科研问题画成图

| 项 | 内容 |
| --- | --- |
| 一句话目标 | 能根据问题选择 geom，并解释每一层给图加了什么。 |
| 语法核心 | 图形语法；`ggplot()` + `aes()`；`geom_boxplot()` / `geom_jitter()` / `geom_point()` / `geom_smooth()` / `geom_col()` / `geom_line()`；mapping vs setting；`facet_wrap()`；`scale_*()`；`labs()`；`theme_*()`。 |
| 科研情境 | 三个探索问题：体重随海拔如何分布？血红蛋白与海拔什么关系？性别是否改变模式？ |
| 数据 | `pika_physiology.csv`。 |
| 科研任务 | 为三个问题各选一张图；写出「为什么不是柱状图」；加 `n`、单位、颜色；导出探索图。 |
| 交付物 | `fig_explore_mass.svg`、`fig_explore_hb.svg`、`fig_explore_sex.svg` |
| 讲解器 | `plot-grammar`：data → aes → geom → stat → scale → facet → theme 逐层叠加。 |
| 常见错误 | 柱状图+误差线掩盖分布；箱线图不显示 n；overplotting；把连续变量映射到离散颜色；`geom_col()` 默认堆叠。 |
| 统计判断 | 图先于检验；图要显示分布和 n，而不是只显示均值。 |
| 速查联动 | ggplot 语法、常用 geom、标度与主题 |
| 时长 / 难度 | 120–150 min / ★★★ |

---

### 第 9 章 出版级图形：配色、排版、导出与图注

| 项 | 内容 |
| --- | --- |
| 一句话目标 | 能把探索图升级为符合期刊尺寸与无障碍要求的 Figure 1。 |
| 语法核心 | Okabe–Ito / viridis 配色；`scale_fill_manual()`；`theme_classic()` / `theme_bw()`；`theme()` 细节；`patchwork` 拼图；`annotate()`；`tag`；`ggsave()`；`ragg` / `svglite`；单栏 89mm / 双栏 183mm。 |
| 科研情境 | 投稿要求：单栏 89mm、字体 7–9pt、色盲友好、图注含 n 与描述统计、PDF 矢量。 |
| 数据 | ch08 的三张图 + ch06 的 Table 1。 |
| 科研任务 | 拼 Figure 1（A 分布、B 关系；为 C 交互面板留位置）；统一颜色；加面板标签；写英文图注。 |
| 交付物 | `Figure1.pdf`、`figure1_legend.md` |
| 讲解器 | 图形解剖（HTML/SVG 热区）：面板标签、轴单位、n、误差线定义、统计标注、图例、配色。 |
| 常见错误 | 彩虹色；字号过小；导出位图；图注不写 n；误差线含义不明；多图配色不一致。 |
| 统计判断 | 图注必须能独立读懂；误差线要说明是 SD、SEM 还是 CI。 |
| 速查联动 | 期刊导出规格、配色安全、patchwork |
| 时长 / 难度 | 120–150 min / ★★★ |
| 联动 | 生物绘图专区 |

---

### 第 10 章 描述统计与分布：先看数据，再做检验

| 项 | 内容 |
| --- | --- |
| 一句话目标 | 能描述分布、识别离群值，并决定是否需要变换。 |
| 语法核心 | `mean()` / `sd()` / `median()` / `IQR()` / `quantile()`；`summary()`；`hist()` / `density()` / `boxplot()`；`shapiro.test()`；`scale()`；`log1p()`；`table()` / `xtabs()`；`janitor::tabyl()`。 |
| 科研情境 | 血红蛋白右偏、体重有 2 个极端值；直接 t 检验是否合适？ |
| 数据 | `pika_physiology.csv`。 |
| 科研任务 | 画分布面板；报告均值±SD 与中位数(IQR)；用预先定义的规则标记离群值；决定是否 log 变换；写分析决定。 |
| 交付物 | `02_descriptive.R`、`fig_distributions.svg` |
| 讲解器 | `stats`：均值 vs 中位数、抽样分布、离群值影响。 |
| 常见错误 | 用正态性检验机械决定一切；大样本下 shapiro 过度敏感；先看 p 再删离群值；SD 与 SEM 混用；偏态数据报告 mean±SD。 |
| 统计判断 | 分布形状决定描述统计与检验；变换要在看结果前决定并记录。 |
| 速查联动 | 描述统计、报告句型 |
| 时长 / 难度 | 90–120 min / ★★ |

---

### 第 11 章 两组比较：t 检验与 Wilcoxon

| 项 | 内容 |
| --- | --- |
| 一句话目标 | 能根据设计选择 t 检验或 Wilcoxon，并报告效应量与置信区间。 |
| 语法核心 | `t.test()`（独立/配对/公式接口）；`wilcox.test()`；`confint()`；`effectsize::cohens_d()`；`rstatix::t_test()` / `wilcox_test()`；`pwr` 入门。 |
| 科研情境 | 低氧处理 vs 对照的体重差；同一批个体处理前后的配对比较。 |
| 数据 | `pika_physiology.csv`（性别两组）、`pika_repeated.csv`（配对）。 |
| 科研任务 | 先写设计（独立/配对、双侧、α）；检查假设；选检验；报告均值差、95% CI、效应量、p；画带个体点的图。 |
| 交付物 | `stats_two_group.csv`、`methods_two_group.md` |
| 讲解器 | `stats`：两组分布重叠、p 值模拟、效应量与 n 的关系。 |
| 常见错误 | 用正态性检验当开关；方差不齐仍用 Student；单侧检验无事先理由；把 p=0.05 当生物意义；多重比较。 |
| 统计判断 | 先设计后检验；效应量 + CI 比 p 值更重要；不显著 ≠ 无差异。 |
| 速查联动 | 检验选择、报告句型、效应量 |
| 时长 / 难度 | 120–150 min / ★★★ |

---

### 第 12 章 多组比较与方差分析：ANOVA 与事后检验

| 项 | 内容 |
| --- | --- |
| 一句话目标 | 能分析三组以上和双因素设计，并正确做事后比较与交互解释。 |
| 语法核心 | `aov()`；`anova()`；双因素与交互；`emmeans()`；`TukeyHSD()`；`car::leveneTest()`；`kruskal.test()`；`FSA::dunnTest()`；`interaction.plot()`；紧凑字母。 |
| 科研情境 | 三个海拔的体重；海拔 × 性别；交互是否真实？ |
| 数据 | `pika_physiology.csv`。 |
| 科研任务 | 拟合双因素模型；检查残差；若交互显著，按性别分层解释；事后比较；生成字母标记图；写 Results。 |
| 交付物 | `stats_anova.csv`、`fig_anova_letters.svg` |
| 讲解器 | `stats`：组间/组内方差分解；交互图。 |
| 常见错误 | 三组两两 t 检验；忽略交互直接看主效应；事后不做校正；不平衡设计；残差异常仍用 ANOVA。 |
| 统计判断 | 交互优先于主效应；事后比较必须校正；字母标记要能自解释。 |
| 速查联动 | ANOVA、事后比较、报告句型 |
| 时长 / 难度 | 120–150 min / ★★★ |

---

### 第 13 章 回归与线性模型：从趋势到预测

| 项 | 内容 |
| --- | --- |
| 一句话目标 | 能拟合、诊断并解释一个线性模型，知道相关不等于因果。 |
| 语法核心 | `lm()`；公式；`summary()`；`coef()` / `confint()`；`broom::tidy()` / `glance()` / `augment()`；残差图、QQ 图；`predict()`；`geom_smooth(method = "lm")`；`glm()` 逻辑回归入门。 |
| 科研情境 | 海拔与血红蛋白的线性趋势；体重与体长的异速关系；低氧存活与否的逻辑回归。 |
| 数据 | `pika_physiology.csv`、`pika_survival.csv`（仅作二分类演示）。 |
| 科研任务 | 拟合 `hemoglobin ~ altitude_m + sex`；检查诊断；报告斜率、95% CI、R²；画带 CI 的回归图；讨论混杂。 |
| 交付物 | `stats_regression.csv`、`fig_regression.svg` |
| 讲解器 | `stats` + `matrix`：拟合线、残差、杠杆点。 |
| 常见错误 | 相关当因果；R² 高就认为模型好；外推；共线性；把有序变量当连续；n 小变量多。 |
| 统计判断 | 模型是工具，不是真理；诊断和设计决定解释边界。 |
| 速查联动 | 回归诊断、模型报告 |
| 时长 / 难度 | 120–150 min / ★★★ |

---

### 第 14 章 让分析可复现：Quarto、renv 与项目交付

| 项 | 内容 |
| --- | --- |
| 一句话目标 | 能从原始数据一键重跑整份报告，并把环境交给合作者。 |
| 语法核心 | Quarto / R Markdown；代码块与 inline code；`params`；`render`；`renv::init()` / `snapshot()` / `restore()`；`sessionInfo()`；Git 最小命令（`init` / `add` / `commit` / `status` / `diff`）。 |
| 科研情境 | 导师要求：「把你现在的分析发我，我换台电脑也能跑。」 |
| 数据 | 前面所有交付物。 |
| 科研任务 | 把 ch01–ch13 串成一个 `report.qmd`；参数化数据路径；渲染 HTML/PDF；生成 `renv.lock`；写 README 与运行说明。 |
| 交付物 | `report.html`、`renv.lock`、项目快照 |
| 讲解器 | `pipeline`：原始数据 → 脚本 → 图/表 → 报告；每次 render 重跑。 |
| 常见错误 | 绝对路径；手动改图；不记录包版本；报告与脚本不同步；把中间文件当原始数据。 |
| 统计判断 | 可复现不是附加项，是结果可信的一部分。 |
| 速查联动 | Quarto、renv、Git |
| 时长 / 难度 | 120–150 min / ★★★ |
| 联动 | 课题工作台 |

---

## 6. 进阶章节（ch15–ch18）

### 第 15 章 混合效应与重复测量：别把伪重复当独立样本

| 项 | 内容 |
| --- | --- |
| 一句话目标 | 能识别嵌套结构，用随机效应避免伪重复。 |
| 语法核心 | `lme4::lmer()`；`lmerTest`；随机截距/斜率；`VarCorr()`；`ranef()`；`performance::icc()`；`emmeans()`；模型比较；`DHARMa` 残差。 |
| 科研情境 | 同一只鼠兔测 3 次；3 个批次；把 36 条当 36 个独立个体是伪重复。 |
| 数据 | `pika_repeated.csv`。 |
| 科研任务 | 比较 `lm` 与 `lmer`；加个体随机截距；报告 ICC 与固定效应；解释 singular fit。 |
| 交付物 | `stats_mixed.csv` |
| 讲解器 | `dataframe` + `stats`：嵌套结构、方差分配。 |
| 常见错误 | 细胞/孔当 n；忽略批次；随机效应组数太少；singular fit 直接忽略；用 lmer 的 p 值不看自由度。 |
| 统计判断 | 统计单位 = 独立生物学个体；重复测量必须建模。 |
| 速查联动 | 混合模型 |
| 时长 / 难度 | 120–150 min / ★★★★ |

---

### 第 16 章 生存分析：时间到事件

| 项 | 内容 |
| --- | --- |
| 一句话目标 | 能正确处理删失，画 KM 曲线并解释风险比。 |
| 语法核心 | `Surv()`；`survfit()`；`survdiff()`；`coxph()`；`cox.zph()`；`survminer::ggsurvplot()`；中位生存期；风险集。 |
| 科研情境 | 低氧 vs 对照小鼠 60 天生存；部分个体到终点仍存活（删失）。 |
| 数据 | `pika_survival.csv`。 |
| 科研任务 | 画 KM 曲线（含风险表）；log-rank；Cox 模型；报告 HR、95% CI、PH 检验。 |
| 交付物 | `fig_survival.svg`、`stats_cox.csv` |
| 讲解器 | `timeline`：个体时间线、删失、风险集。 |
| 常见错误 | 丢弃删失；用 t 检验比较生存时间；忽略 PH 假设；把 HR 当绝对风险；immortal time bias。 |
| 统计判断 | 删失是信息，不是缺失；HR 是相对风险。 |
| 速查联动 | 生存分析 |
| 时长 / 难度 | 90–120 min / ★★★★ |

---

### 第 17 章 多变量与聚类：PCA、热图与样本分群

| 项 | 内容 |
| --- | --- |
| 一句话目标 | 能判断样本结构、发现离群点，并避免把批次效应当生物学发现。 |
| 语法核心 | `prcomp()`；`scale. = TRUE`；`factoextra::fviz_pca_ind()`；`pheatmap()` / `ComplexHeatmap`；`hclust()`；`kmeans()`；距离与聚类；`vegan::adonis2()` 入门。 |
| 科研情境 | 12 个 RNA-seq 样本，2 组 2 批次；PCA 第一轴是处理还是批次？ |
| 数据 | `pika_rnaseq_counts.csv`、`pika_rnaseq_metadata_clean.csv`。 |
| 科研任务 | 对 logCPM 做 PCA；按 group/batch 着色；识别离群样本；画 top 500 变异基因热图。 |
| 交付物 | `fig_pca.svg`、`fig_heatmap.svg` |
| 讲解器 | `matrix`：矩阵 → 标准化 → PCA 投影 → 聚类。 |
| 常见错误 | 原始 counts 直接 PCA；不标准化；把批次当处理；聚类距离随意；过度解释 PC1。 |
| 统计判断 | 无监督分析先看结构，不先看分组；批次是混杂。 |
| 速查联动 | PCA、热图、聚类 |
| 时长 / 难度 | 120–150 min / ★★★★ |

---

### 第 18 章 转录组差异分析：从 counts 到基因列表

| 项 | 内容 |
| --- | --- |
| 一句话目标 | 能完成一个可解释的 DE 分析，并正确使用 FDR 与效应量。 |
| 语法核心 | `DESeqDataSetFromMatrix()`；`DESeq()`；`results()`；`lfcShrink()`（`apeglm`）；`plotMA()`；`plotPCA()`；火山图；`clusterProfiler::enricher()` + 自定义 `TERM2GENE`；`org.*.eg.db` 的概念。 |
| 科研情境 | 低氧 vs 对照 6 vs 6；2 个批次；需要基因列表、火山图、GO/KEGG 富集。 |
| 数据 | counts、clean metadata、annotation。 |
| 科研任务 | 构建 DESeq2 对象；设计 `~ batch + group`；过滤低表达；DE；收缩；按 FDR 与 log2FC 双阈值筛选；火山图；富集气泡图。 |
| 交付物 | `de_results.csv`、`fig_volcano.svg`、`fig_enrichment.svg` |
| 讲解器 | `pipeline` + `matrix`：counts → 归一化 → 模型 → shrunken LFC → FDR → 基因集。 |
| 常见错误 | 原始 counts 直接比较；设计公式漏 batch；用 p 值不用 padj；只按 FC 不看表达；基因 ID 不匹配；富集背景基因集错误。 |
| 统计判断 | FDR 控制的是发现集；log2FC 阈值要有理由；富集结果是假设生成。 |
| 速查联动 | DESeq2、富集、Bioconductor |
| 时长 / 难度 | 150–180 min / ★★★★★ |
| 联动 | 生物信息专区 |

---

## 7. 每章的固定结构

每个章节文件必须包含以下块（顺序固定）：

1. 封面：编号、标题、科研问题、元信息。
2. 学习目标（4–6 条）。
3. `.research` 研究情境。
4. 正文小节（3–6 个 `<h2>`）。
5. `.research` 科研任务（带步骤与检查点）。
6. 常见错误（至少 3 条；含真实报错文本）。
7. `.stats` 科研判断（3–5 条）。
8. 方法学一句话（英文 + 中文解释）。
9. 小结 `.keypoint`。
10. 自测 checklist（6–8 条）。
11. Quiz（6–10 题）。
12. 研究日志（交付物 + 下一章用途）。
13. 延伸（速查表 / 专栏 / 数据集）。

**不允许**：
- 一章里塞两个互不相关的科研问题；
- 只有语法示例、没有科研任务；
- 只有「预期输出」、没有可运行脚本；
- 用「显然」「众所周知」跳过统计前提。

---

## 8. 教学法与课时

| 模式 | 安排 | 说明 |
| --- | --- | --- |
| 一学期课程（本科） | 每周 3 学时 × 16 周 | ch01–ch14 + 2 周复习/项目答辩；进阶章选讲 |
| 研究生工作坊 | 6 次 × 3 小时 | ch01–ch04 合并、ch06–ch09、ch10–ch13、ch14、ch17–ch18 |
| 自学 | 每章 60–180 min | 每章至少完成「科研任务」与 quiz |
| 实验组内培训 | 按需 | 统计导航 + 数据诊所 + 对应章节 |

每章建议配 1 个「课堂 10 分钟」问题：
- ch02：为什么缺失不能填 0？
- ch06：为什么先定排除规则再看 p？
- ch09：为什么箱线图比柱状图更适合这组数据？
- ch11：p=0.049 意味着什么？
- ch15：30 个细胞来自 3 只鼠，n 是多少？
- ch18：padj=0.01 但 log2FC=0.3，算不算生物学显著？

---

## 9. 统计正确性规则（内容审核用）

1. **n 的定义**：每个数据集必须写明统计单位；示例中不得把技术重复当生物学重复。
2. **检验前提**：每处检验必须写设计（独立/配对、双侧/单侧、α）、假设检查、效应量与 CI。
3. **p 值语言**：不使用「证明」「显著优于」作为因果结论；使用「在本数据中，差异为…，95% CI…」。
4. **多重比较**：三组以上或大量基因/指标必须校正；说明方法（Tukey、Benjamini–Hochberg 等）。
5. **缺失与排除**：缺失处理、离群值规则必须在看主要结果前定义，并在报告中说明。
6. **相关与因果**：回归/相关章节必须讨论混杂、反向因果、外推限制。
7. **图与统计一致**：图注中的误差线、n、检验必须与脚本输出一致。
8. **输出可复现**：所有数值、p 值、图由脚本生成；网页中的数字必须能追溯到 `tools/` 的生成记录。

---

## 10. 不在范围内

明确不教，避免课程膨胀：

- 从 FASTQ 做比对/定量（需 shell、STAR/salmon；只在生信专区指路）。
- 临床数据/真实患者数据分析。
- 深度学习、机器学习建模。
- Shiny 应用开发（只作为部署方向提一句）。
- Python 与 R 的互操作。
- 复杂多水平模型、贝叶斯统计（进阶章只到随机截距）。
- 单细胞完整分析（生信专区给最小流程与包索引，不设主线章节）。

---

## 11. 课程验收清单

- [ ] 18 章每章都有封面科研问题、研究情境、科研任务、交付物、方法学句式。
- [ ] 每章至少 3 个 Listing、1 个图/表/讲解器。
- [ ] 每章至少 3 条真实 R 报错与修复。
- [ ] 每章至少 3 条统计判断，且不重复。
- [ ] 每个交付物被工作台与后续章节引用。
- [ ] 数据字典、n 定义、缺失/排除规则齐全。
- [ ] 所有输出由图/表生成脚本产生，网页无手写数值。
- [ ] 统计审核人签字（或记录审核日期与版本）。
