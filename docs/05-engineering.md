# 05 · 工程架构与实现契约

本文件定义站点如何构建、数据如何流动、代码与图形如何保证正确。实现必须遵守这里的约束；违反约束的实现即使页面能打开，也算不合格。

---

## 1. 技术约束

与 `cpp_website` 保持一致：

- **纯静态**：HTML5 + CSS3 + 原生 JavaScript（ES2017+）。
- **零运行时依赖**：不引入 React/Vue/构建产物；浏览器端无 npm 包。
- **`file://` 可用**：双击 `index.html` 即可阅读；不使用 ES modules、`fetch()`、Web Worker、CDN。
- **零网络请求**：无外部字体、图标、图片、统计库；所有数据在 `assets/js/data/*.js` 的 `window.BIOR_*` 全局中。
- **UTF-8**：所有文件；中文文案 + 英文标识符。
- **无追踪**：无 analytics、无 cookie、无第三方脚本。
- **校验是硬门槛**：HTML、数据、示例输出、图形清单必须全部通过。

**允许的构建期依赖**（不进入站点运行时）：
- R + 指定包（生成数据、图、示例输出）；
- Node.js（校验、搜索索引、构建脚本）；
- 可选的 `svgo`（仅优化 SVG，非必需）。

---

## 2. 目录结构

```text
bioR/
├─ index.html
├─ chapters/
│  ├─ ch01-setup.html
│  ├─ ...
│  └─ ch18-rnaseq.html
├─ bioviz.html
├─ bioinfo.html
├─ clinic.html
├─ stats-nav.html
├─ triage.html
├─ datasets.html
├─ project.html
├─ cheatsheets.html
├─ glossary.html
├─ sandbox.html                 （Phase 4 可选，不进入主导航）
│
├─ assets/
│  ├─ css/
│  │  ├─ tokens.css             设计令牌（亮/暗）
│  │  ├─ base.css               重置、排版、基础元素
│  │  ├─ layout.css             顶栏、首页、章节栅格、页脚
│  │  ├─ components.css         Listing、图舞台、讲解器、表格、测验…
│  │  ├─ pages.css              专栏页专用布局
│  │  └─ print.css              打印
│  ├─ js/
│  │  ├─ theme-init.js          <head> 同步执行
│  │  ├─ nav.js                 顶栏、抽屉、页脚、pager
│  │  ├─ search.js              Ctrl+K 命令面板
│  │  ├─ highlight-r.js         R 语法高亮
│  │  ├─ listing.js             Listing 工具条、输出、复制/下载
│  │  ├─ stepper.js             讲解器引擎
│  │  ├─ quiz.js                测验
│  │  ├─ mastery.js             掌握度三态
│  │  ├─ glossary.js            术语 tooltip
│  │  ├─ progress.js            进度/交付物/最后访问
│  │  ├─ presenter.js           演示与带教模式
│  │  ├─ toc.js                 页面小节索引
│  │  └─ data/
│  │     ├─ course-toc.js       window.COURSE_TOC
│  │     ├─ chapter-config.js   window.BIOR_CONFIG（笔记/讲解器）
│  │     ├─ cheatsheets-data.js
│  │     ├─ glossary-data.js
│  │     ├─ datasets-data.js
│  │     ├─ bioviz-data.js
│  │     ├─ bioinfo-data.js
│  │     ├─ clinic-data.js
│  │     ├─ stats-tree-data.js
│  │     ├─ triage-data.js
│  │     ├─ deliverables-data.js
│  │     ├─ updates-data.js
│  │     └─ search-index.js     （生成物，勿手改）
│  ├─ figures/
│  │  ├─ chapters/              chXX-*.svg / .pdf
│  │  ├─ bioviz/                配方预览与前后对比
│  │  └─ manifest.json          图形清单（生成）
│  └─ data/
│     ├─ pika_physiology.csv
│     ├─ pika_repeated.csv
│     ├─ pika_survival.csv
│     ├─ pika_rnaseq_counts.csv
│     ├─ pika_rnaseq_metadata_raw.csv
│     ├─ pika_rnaseq_metadata_clean.csv
│     ├─ pika_annotation.csv
│     ├─ plate_reader_raw.csv
│     ├─ pika_lab_notebook.xlsx
│     ├─ data-dictionary.csv
│     └─ README.md
│
├─ tools/
│  ├─ generate-data.R
│  ├─ validate-data.R
│  ├─ render-figures.R
│  ├─ render-examples.R
│  ├─ check-examples.R
│  ├─ collect-errors.R
│  ├─ build-search-index.mjs
│  ├─ validate.mjs
│  ├─ lib/
│  │  ├─ extract-code.mjs
│  │  └─ normalize-output.mjs
│  ├─ figures/
│  │  ├─ registry.R
│  │  └─ fig_*.R
│  ├─ examples/
│  │  ├─ ch01-ex-01.R
│  │  ├─ ...
│  │  └─ expected/
│  │     ├─ ch01-ex-01.txt
│  │     └─ ...
│  ├─ renv.lock
│  └─ README.md
│
└─ docs/                        本设计文档集
```

**规则**：
- 页面只引用 `assets/` 下的资源，不引用 `tools/`。
- `tools/` 不进入部署产物；部署只上传站点文件。
- `assets/data/` 是教学数据唯一来源；章节不得复制数据到自己的目录。

---

## 3. 运行时架构

### 3.1 加载顺序

每个页面 `<head>`：

```html
<script src="assets/js/theme-init.js"></script>
<link rel="stylesheet" href="assets/css/tokens.css">
<link rel="stylesheet" href="assets/css/base.css">
<link rel="stylesheet" href="assets/css/layout.css">
<link rel="stylesheet" href="assets/css/components.css">
<link rel="stylesheet" href="assets/css/pages.css">
```

`theme-init.js` 必须同步执行，在首屏前设置 `html[data-theme]` 与字号，避免闪烁。

章节页底部：

```html
<!-- 数据 -->
<script src="assets/js/data/course-toc.js"></script>
<script src="assets/js/data/chapter-config.js"></script>
<script src="assets/js/data/glossary-data.js"></script>
<script src="assets/js/data/datasets-data.js"></script>
<script src="assets/js/data/deliverables-data.js"></script>
<!-- 共享引擎 -->
<script src="assets/js/highlight-r.js"></script>
<script src="assets/js/nav.js"></script>
<script src="assets/js/progress.js"></script>
<script src="assets/js/toc.js"></script>
<script src="assets/js/listing.js"></script>
<script src="assets/js/stepper.js"></script>
<script src="assets/js/mastery.js"></script>
<script src="assets/js/quiz.js"></script>
<script src="assets/js/glossary.js"></script>
<script src="assets/js/presenter.js"></script>
<script src="assets/js/search.js"></script>
<!-- 页面专属 -->
<script src="assets/js/pages/chapter.js"></script>
```

顺序要求：
1. 数据先于 `nav.js`（导航需要 `COURSE_TOC`）。
2. `highlight-r.js` 先于 `listing.js` / `stepper.js`。
3. `search.js` 需要 `search-index.js`，放在最后即可。
4. 页面专属脚本最后。

### 3.2 页面类型检测

```html
<body data-page="chapter" data-chapter="ch06" data-part="II">
<body data-page="special" data-special="bioviz">
<body data-page="home">
<body data-page="reference" data-reference="cheatsheets">
```

`nav.js` 与页面脚本只读取这些属性，不靠 URL 猜测。

### 3.3 模块职责

| 模块 | 职责 | 不做什么 |
| --- | --- | --- |
| `theme-init.js` | 读写主题/字号，设置 `data-theme` | 不操作 DOM 内容 |
| `nav.js` | 顶栏、课程抽屉、页脚、pager、当前页高亮 | 不渲染正文 |
| `search.js` | `Ctrl K` 面板、过滤、键盘导航 | 不改变页面内容 |
| `highlight-r.js` | R 代码分词与 `<span class>` | 不执行代码 |
| `listing.js` | Listing 标题栏、工具、复制、下载、输出开关 | 不做单步逻辑 |
| `stepper.js` | 讲解器帧、变量表、控制条、打印末帧 | 不生成图 |
| `quiz.js` | 测验渲染、判分、解释 | 不写进度（交给 progress） |
| `mastery.js` | 学习目标三态 | 不计算分数 |
| `glossary.js` | 首次出现术语 tooltip | 不重复包裹 |
| `progress.js` | 章节完成、交付物、最后访问、重置 | 不做 UI 页面 |
| `presenter.js` | `?present=1` / `?teacher=1` | 不改变内容 |
| `toc.js` | 右栏小节索引与滚动高亮 | 不做全文目录 |
| `pages/*.js` | 该页的渲染与交互 | 不复制共享逻辑 |

### 3.4 全局命名

```js
window.BIOR = {
  version: "1.0.0",
  escapeHtml,
  copyText,
  formatDate,
  storage: { get, set, remove }
};
```

所有模块挂在 `window.BIOR` 下；不污染全局。数据文件挂 `window.BIOR_*`。JS 一律 IIFE，避免块级作用域外泄。

---

## 4. 数据契约

### 4.1 课程目录 `COURSE_TOC`

```js
window.COURSE_TOC = [
  {
    id: "ch06",
    part: "II",
    title: "第 6 章 数据整形：用 dplyr 把实验表变成答案",
    short: "数据整形",
    file: "chapters/ch06-wrangling.html",
    question: "不同海拔种群的体重差异是否真实存在？",
    summary: "用 filter/group_by/summarise 生成 Table 1，并记录排除规则。",
    keywords: ["dplyr", "group_by", "summarise", "Table 1", "排除规则"],
    prereq: ["ch05"],
    dataset: ["pika_physiology"],
    deliverable: ["table1_group.csv", "exclusions.csv"],
    minutes: 110,
    difficulty: 2,
    updated: "2026-10-27"
  }
];
```

`nav.js` 用 `part` 分组；首页用 `question` / `deliverable` / `minutes`；搜索用 `keywords` / `summary`。

### 4.2 章节配置 `BIOR_CONFIG`

```js
window.BIOR_CONFIG = {
  chapters: {
    ch06: {
      notes: [
        { section: 2, kicker: "FIELD NOTE", title: "先把排除规则写下来", body: "..." }
      ],
      demo: {
        cardId: "ch06-ex-03",
        engine: "pipeline",
        question: "每一步之后还剩多少行？",
        frames: [
          { rows: 60, cols: 11, note: "原始表" },
          { rows: 58, cols: 11, note: "排除缺失血红蛋白" },
          { rows: 6, cols: 5, note: "按海拔×性别汇总" }
        ]
      }
    }
  }
};
```

- `section`：章节 `h2` 的零基索引（含学习目标标题）。
- `notes`：右栏田野笔记；`body` 允许 HTML，必须转义代码尖括号。
- `demo`：一章最多一个主讲解器；`cardId` 必须存在。
- `frames` 是讲解器画面数据；`line` / `out` / `note` 仍来自 `.ex-steps`。

### 4.3 示例步骤 `.ex-steps`

```json
{
  "steps": [
    {
      "line": 4,
      "vars": { "pika": "60 × 11", "altitude_group": "factor(3)" },
      "out": "",
      "note": "导入后的数据框",
      "pipeline": { "rows": 60, "cols": 11 },
      "vector": { "cells": ["182", "176", "NA"] }
    }
  ]
}
```

字段：
- `line`：代码块物理行号（1 基）。
- `vars`：变量快照（字符串）。
- `out`：本步新增的控制台行；`""` 表示无输出。
- `note`：讲解。
- `pipeline` / `vector` / `matrix` / `timeline`：引擎专用，可省略。

约束：严格 JSON；不得写 HTML 实体；不得包含 `</script>`。

### 4.4 讲解器帧

| 引擎 | 帧结构 |
| --- | --- |
| `vector` | `{ cells: [{ value, type, state }], note }`；`state`: `normal` / `na` / `active` / `coerced` |
| `dataframe` | `{ columns: [{ name, type }], rows: [[...]], highlight: [rowIndex], note }` |
| `pipeline` | `{ stages: [{ label, rows, cols, note }], active }` 或 `{ rows, cols, note }` |
| `plot-grammar` | `{ layers: [{ name, on, note }], preview }` |
| `stats` | `{ groups: [{ label, mean, sd, n }], p, effect, note }` |
| `matrix` | `{ cells: [[...]], rowLabels, colLabels, mode: "heat" / "pca" / "tree", note }` |
| `timeline` | `{ subjects: [{ id, events: [{ t, type, label }] }], note }` |

所有帧只描述画面；不重复代码输出。

### 4.5 测验 `quiz-data`

```json
{
  "title": "测验：数据整形",
  "questions": [
    {
      "type": "mcq",
      "q": "按海拔分组计算均值，最直接的写法是？",
      "options": ["group_by() + summarise()", "pivot_longer()", "left_join()", "geom_boxplot()"],
      "answer": 0,
      "explain": "分组汇总用 group_by() 定义组，summarise() 计算每组统计量。",
      "skill": "syntax",
      "difficulty": 1
    },
    {
      "type": "plot",
      "q": "要同时展示三组分布与个体值，哪张图最合适？",
      "options": ["box-jitter", "stacked-bar", "pie", "3d-bar"],
      "answer": 0,
      "explain": "箱线图给分布，个体点给 n 与离群值。",
      "skill": "viz",
      "difficulty": 2
    }
  ]
}
```

题型：`mcq`、`tf`、`fill`、`mfill`、`code`、`plot`。
- `fill`：`answer` 可字符串或数组；`ci` 大小写不敏感。
- `mfill`：`code` 中 `____` 与 `blanks[]` 一一对应，数量必须相等。
- `plot`：`options` 是图鉴 id；选项显示缩略图。
- `skill`: `syntax` / `stats` / `biology` / `viz` / `repro`；用于首页「需要回看」。

### 4.6 速查表、术语、数据集

见 [04-specials.md](04-specials.md) 第 9 节与各专栏的数据契约。所有数据文件必须以 `window.BIOR_* = ...;` 结尾，严格 JSON 兼容（可用 JSON.parse 验证值）。

### 4.7 图形清单 `manifest.json`

```json
{
  "generated": "2026-10-27T12:00:00Z",
  "figures": [
    {
      "id": "ch08-mass-by-altitude",
      "chapter": "ch08",
      "svg": "assets/figures/chapters/ch08-mass-by-altitude.svg",
      "pdf": "assets/figures/chapters/ch08-mass-by-altitude.pdf",
      "width_mm": 89,
      "height_mm": 70,
      "alt": "箱线图显示高海拔组体重中位数低于低海拔组，个体点重叠明显。",
      "caption": "图 8.2 · 不同海拔的体重分布；n = 20/20/20；箱体为 IQR，须线为 1.5×IQR。",
      "source": "tools/figures/fig_ch08_mass.R",
      "data": ["pika_physiology.csv"],
      "sha256": "..."
    }
  ]
}
```

校验：
- 文件存在；`sha256` 与文件一致。
- `alt` 40–160 字，描述结论。
- `caption` 含 `n` 与图号。
- 所有章节引用的图 id 都在清单中。

### 4.8 数据清单 `data-manifest.json`

```json
{
  "generated": "2026-10-27T12:00:00Z",
  "files": [
    {
      "file": "pika_physiology.csv",
      "rows": 60,
      "cols": 11,
      "simulated": true,
      "sha256": "...",
      "description": "高原鼠兔生理调查（教学模拟）",
      "chapters": ["ch03", "ch06", "ch08", "ch10", "ch11", "ch12", "ch13"]
    }
  ]
}
```

---

## 5. 教学数据生成

### 5.1 脚本

`tools/generate-data.R`：

1. `set.seed(20261027)`；
2. 生成 60 只个体：3 海拔 × 2 性别 × 10；
3. 生成体重、体长、血红蛋白、红细胞压积、血糖；加入批次与测量日期；血红蛋白右偏，体重含 2 个预设极端值（用于 ch10 的离群值教学）；
4. 故意设置 2 个 `NA` 血红蛋白；
5. 生成重复测量 12 只 × 3 时间点；
6. 生成生存数据 60 只，含删失；
7. 生成 2000 基因 × 12 样本的负二项 counts；设置 80 个差异基因 + 批次效应；
8. 生成 annotation（GO/KEGG 基因集）；
9. 生成 `plate_reader_raw.csv`（前 3 行注释）；
10. 生成 `pika_lab_notebook.xlsx`（两个 sheet）；
11. 生成 raw metadata（含 ID 不一致）；
12. 生成 clean metadata；
13. 写 `data-manifest.json` 与 `data-dictionary.csv`。

### 5.2 规则

- 所有数据为**模拟**；文件头/README/数据集卡必须标注。
- 固定种子；重复运行结果一致。
- 不生成任何真实个体、患者或可识别信息。
- 数值范围要生物学上可信（体重、血红蛋白、血糖单位合理）。
- 计数矩阵必须是非负整数；DE 基因有真实 fold change，不是随机标签。
- 批次效应要能被 PCA 看见，但不能完全混淆处理（否则 DE 无法教）。
- 生存数据含至少 20% 删失。
- 重复测量数据含个体随机效应（ICC 约 0.4–0.6）。
- 生成后运行 `validate-data.R`。

### 5.3 `validate-data.R` 检查

- 行数/列数/ID 唯一；
- 分组 n 与设计一致；
- 缺失数量符合预期（血红蛋白 2 个）；
- 数值范围与单位；
- counts 全为非负整数；
- counts 列名与 clean metadata 完全匹配；
- raw metadata 至少有 3 个可修复的不匹配（用于 ch07）；
- 生存 `status` 只有 0/1，时间 > 0；
- 重复测量每个个体 3 个时间点；
- 写出 `data-manifest.json` 的 sha256。

---

## 6. 图形流水线

### 6.1 原则

- **网页中的统计图必须由 R 生成**；HTML 只放 `<img>`。
- 示意图（流程、层级、解剖热区）用 HTML/SVG 手写。
- 图内文字英文；图注中文。
- 默认色盲安全；默认无彩虹。
- 每张图有 id、脚本、数据、alt、caption、尺寸。

### 6.2 注册表

`tools/figures/registry.R`：

```r
FIGURES <- list(
  list(
    id = "ch08-mass-by-altitude",
    chapter = "ch08",
    script = "fig_ch08_mass.R",
    width_mm = 89, height_mm = 70,
    alt = "箱线图显示高海拔组体重中位数低于低海拔组，个体点重叠明显。",
    caption = "图 8.2 · 不同海拔的体重分布；n = 20/20/20；箱体为 IQR。",
    data = c("pika_physiology.csv")
  )
)
```

`render-figures.R` 遍历注册表，`source()` 对应脚本，调用 `build_figure(data)` 返回 `ggplot` 对象，然后：
- `svglite::svglite(width_mm/25.4, height_mm/25.4)` 输出 SVG；
- `cairo_pdf()` 输出 PDF（出版版）；
- 计算 sha256，写 `manifest.json`。

### 6.3 图脚本约定

```r
build_figure <- function(data) {
  ggplot(data$pika, aes(altitude_group, body_mass_g, fill = altitude_group)) +
    geom_boxplot(width = .55, outlier.shape = NA) +
    geom_jitter(width = .12, alpha = .45, size = 1.4) +
    scale_fill_manual(values = okabe_ito(c("low", "mid", "high"))) +
    labs(x = "Altitude group", y = "Body mass (g)") +
    theme_bio(base_size = 8)
}
```

- 不直接 `ggsave()` 到页面路径；由渲染器统一导出。
- 不写中文轴标签。
- 不手动设置绝对像素尺寸；用 mm。
- 主题 `theme_bio()` 统一定义在 `tools/figures/theme.R`。
- 调色板 `okabe_ito()` 统一在 `tools/figures/palettes.R`。
- 图脚本只读 `assets/data/`，不写数据。

### 6.4 网页显示

```html
<figure class="plot-stage" id="fig-ch08-mass">
  <div class="plot-stage-head">
    <span>图 8.2 · 不同海拔的体重分布</span>
    <a href="../assets/figures/chapters/ch08-mass-by-altitude.pdf" download>PDF</a>
  </div>
  <div class="plot-stage-canvas">
    <img src="../assets/figures/chapters/ch08-mass-by-altitude.svg"
         alt="箱线图显示高海拔组体重中位数低于低海拔组，个体点重叠明显。"
         loading="lazy" width="712" height="560">
  </div>
  <figcaption>箱线图叠加个体点；n = 20/20/20；箱体为 IQR，须线为 1.5×IQR。</figcaption>
  <details class="plot-code"><summary>查看绘图代码</summary> ... </details>
</figure>
```

- 图舞台背景固定浅色（深色模式下也不反色），保证统计图颜色准确。
- `width` / `height` 写内在尺寸，避免布局抖动。
- 首屏图不 lazy；下方图 lazy。
- SVG 文件上限 150KB；超过则简化或改 PNG 2x。

### 6.5 图形验收

- [ ] 图由脚本生成，清单 sha256 匹配。
- [ ] `alt` 描述结论，不是「一张图」。
- [ ] 图注含 n、误差线/统计定义。
- [ ] 轴有单位；英文标签。
- [ ] 分组颜色色盲安全；不是唯一编码。
- [ ] 尺寸符合注册表；PDF 可下载。
- [ ] 深色模式下图面不变色、不刺眼。
- [ ] 打印时图与图注不分离。

---

## 7. 示例输出正确性流水线

这是本项目最重要的工程约束。

### 7.1 双向来源

每个 Listing 有两份表示：

1. **页面中的代码与输出**（HTML）；
2. **脚本与期望输出**（`tools/examples/`）。

HTML：

```html
<pre class="ex-code" data-example="ch06-ex-03"><code class="r">pika |&gt;
  group_by(altitude_group) |&gt;
  summarise(mean_mass = mean(body_mass_g, na.rm = TRUE))</code></pre>

<div class="ex-output" data-output-for="ch06-ex-03">
  <div class="ex-output-label">R console</div>
  <pre><code class="output-text"># A tibble: 3 × 2
  altitude_group mean_mass
  &lt;fct&gt;              &lt;dbl&gt;
1 low                 182.
2 mid                 176.
3 high                169.</code></pre>
</div>
```

脚本：

```r
# tools/examples/ch06-ex-03.R
pika <- readr::read_csv(here::here("assets/data/pika_physiology.csv"))
pika |>
  dplyr::group_by(altitude_group) |>
  dplyr::summarise(mean_mass = mean(body_mass_g, na.rm = TRUE))
```

期望输出：

```text
tools/examples/expected/ch06-ex-03.txt
```

### 7.2 `render-examples.R`

- 在干净 R session 中运行每个脚本；
- 捕获 `stdout` / `message` / `warning`；
- 归一化：去尾部空格、统一换行、去掉 ANSI 颜色、保留 `# A tibble` 格式；
- 写 `expected/*.txt`；
- 对绘图示例，同时记录图形 id；
- 对故意报错的示例，捕获错误文本到 `.error.txt`。

### 7.3 `check-examples.R`

1. 从 HTML 提取所有 `data-example` 的代码文本；
2. 与 `tools/examples/<id>.R` 比对（忽略行尾空格与换行风格）；
3. 从 HTML 提取 `data-output-for` 的输出文本；
4. 与 `expected/<id>.txt` 比对（归一化后）；
5. 检查每个 Listing 都有对应脚本；每个脚本都被页面引用；
6. 失败时输出文件、行号、第一处差异。

**规则**：
- 代码块必须可独立运行（含 `library()` / 数据读取），或在脚本头部注明 `# fragment: requires ch06 data`。
- 随机示例必须 `set.seed()`；否则输出不可比。
- 不允许 `data-output-pending` 之类绕过。
- 输出中的 tibble 宽度、打印选项要固定：脚本开头统一 `options(width = 80, tibble.print_max = 10)`。
- R 版本与包版本由 `renv.lock` 固定。

### 7.4 报错卡

`collect-errors.R` 用最小复现代码触发真实报错，保存：
- 完整错误文本；
- R 版本；
- 触发代码。

页面中的报错原文必须与生成文件一致；不允许凭记忆写。

---

## 8. 搜索索引

`build-search-index.mjs`：

1. 用 `node:vm` 在沙箱中执行 `assets/js/data/*.js`，提供 `window` 对象；
2. 收集 `COURSE_TOC`、`BIOR_CHEATSHEETS`、`BIOR_BIOVIZ`、`BIOR_BIOINFO`、`BIOR_CLINIC`、`BIOR_STATS_TREE`、`BIOR_TRIAGE`、`BIOR_DATASETS`、`BIOR_GLOSSARY`；
3. 生成扁平记录：
   ```js
   { type: "chapter", id: "ch06", title, text, href, keywords }
   ```
4. 写 `assets/js/data/search-index.js`；
5. 写 `assets/js/data/search-index.meta.json`（记录源文件 hash）。

`search.js`：
- 中文子串匹配；英文小写 token 前缀；
- 结果分组；
- 高亮只操作文本节点，不插入 HTML；
- 最多 8 条/组；
- 不做网络请求。

校验：
- 索引 meta 与数据文件 hash 一致；
- 每条记录 `href` 存在；
- 索引体积 ≤ 120KB（gzip 前）。

---

## 9. 校验器

### 9.1 `tools/validate.mjs`

必须检查：

**HTML**
- 本地链接/锚点存在；
- 重复 `id`；
- `<pre><code>` 中未转义的 `<`、`>`、`&`；
- 未知标签/属性（白名单）；
- 必填章节块（封面、目标、研究情境、任务、常见错误、统计判断、方法学、小结、自测、quiz、研究日志）；
- quiz `data-source` 与章节 id 一致；
- 图片 `alt` 非空且不是文件名；
- `loading="lazy"` 仅用于非首屏图。

**数据**
- 严格 JSON 块可 `JSON.parse`；
- `COURSE_TOC` 与文件存在、id 唯一、part 合法；
- 章节引用的速查/专栏/数据集 id 存在；
- 交付物 id 唯一且被工作台引用；
- `BIOR_CONFIG` 的 `cardId` 存在、`section` 在范围内；
- 图形 id 在 manifest 中、alt/caption 合规；
- 数据集文件存在、manifest rows/cols 匹配。

**JS/CSS**
- `node --check` 所有 `assets/js/*.js`；
- 页面内联脚本语法；
- CSS 中除 `tokens.css` 外不得出现十六进制颜色（warn，不 fail？建议 fail）；
- 不使用 `fetch(`、`import `、`XMLHttpRequest`、`http://`、`https://`（外部链接页除外，需白名单）。

**一致性**
- 搜索索引新鲜；
- 站点更新 feed 与页面日期一致；
- 打印样式包含 `.v2-rail`/工具条隐藏规则。

输出：错误数、警告数、文件:行号。**0 errors / 0 warnings** 才能提交。

### 9.2 `validate-data.R`

见 5.3。

### 9.3 `check-examples.R`

见 7.3。

### 9.4 一键检查

```bash
Rscript tools/generate-data.R
Rscript tools/validate-data.R
Rscript tools/render-figures.R
Rscript tools/render-examples.R
Rscript tools/check-examples.R
node tools/build-search-index.mjs
node tools/validate.mjs
```

CI 中按此顺序执行；任何一步非零退出即失败。

---

## 10. 性能预算

| 资源 | 预算 |
| --- | --- |
| 单章 HTML | ≤ 250KB（不含图） |
| 全部 CSS（未压缩） | ≤ 80KB |
| 核心 JS（未压缩） | ≤ 150KB |
| 搜索索引 | ≤ 120KB |
| 单张 SVG | ≤ 150KB |
| 单章总资源（首屏） | ≤ 700KB |
| 单章总资源（全部图） | ≤ 1.5MB |

措施：
- 图 `loading="lazy"`；首屏图例外。
- 搜索输入 120ms debounce。
- 不做大数组深拷贝；数据只在初始化时解析。
- CSS 用系统字体，不加载 webfont。
- 不在滚动事件里做重计算；用 `IntersectionObserver`。
- 讲解器只在进入视口后初始化。

---

## 11. 无障碍与打印实现

- `:focus-visible` 全局 2px 蓝环。
- 跳转链接 `.skip-link`。
- `aria-expanded` / `aria-controls` 用于抽屉、折叠。
- 讲解器控制按钮有 `aria-label`。
- 图 `<img alt>`；示意图 `<svg role="img"><title>`。
- 表格 `<caption>` + `<th scope>`。
- `prefers-reduced-motion` 禁用过渡与自动播放。
- 打印：`@media print` 隐藏顶栏/右栏/工具条/搜索/quiz 按钮；`.plot-stage` 不分页；`h2` 前分页可选。
- 深色模式：图舞台固定浅色底；代码块仍深色。

---

## 12. 安全与隐私

- 无网络请求；无第三方分析。
- 外链（数据集馆）加 `rel="noopener noreferrer"`，不自动打开。
- 搜索输入只用于文本匹配，插入 DOM 前转义。
- 数据文件视为可信内容，但渲染时仍转义代码块。
- localStorage 只存学习状态；提供一键清除。
- 不收集任何个人信息。
- 构建期 `node:vm` 只执行本站数据文件，不执行用户输入。

---

## 13. 部署

- 任意静态托管：GitHub Pages、Netlify、对象存储、内网文件服务器。
- 所有路径相对；支持部署在子目录（如 `/r-course/`）。
- 不需要重写规则；`file://` 也工作。
- 缓存：HTML 短缓存；CSS/JS/图长缓存 + 文件名带版本或查询串（构建时注入 `?v=`）。
- 部署产物排除 `tools/`、`docs/`、`node_modules/`。
- 可提供 zip 下载，解压双击 `index.html`。

---

## 14. 代码规范

### 14.1 JavaScript

- IIFE + `"use strict";`。
- `const` 优先，`let` 必要；不用 `var`。
- 分号；2 空格缩进。
- DOM 查询缓存；避免每帧查询。
- 事件委托用于卡片列表。
- 不拼 HTML 字符串插入用户输入；用 `textContent` 或转义函数。
- 所有 localStorage 读写包 `try/catch`。
- 注释英文；UI 文案中文。

### 14.2 CSS

- 只用 `tokens.css` 的变量。
- BEM 风格类名：`.listing__head` 或扁平 `.listing-head`（项目统一用扁平短横线）。
- 不使用 `!important`，打印与工具类除外。
- 移动端优先？项目以桌面阅读为主，但每个组件必须写窄屏规则。
- 阴影只给浮层；正文卡片用 1px 线。

### 14.3 R

- R ≥ 4.2；主路径用原生管道 `|>`；`%>%` 只在对照中出现。
- 变量/函数 `snake_case`。
- 路径一律 `here::here()`；禁止 `setwd()`。
- 显式 `na.rm = TRUE`。
- 随机过程 `set.seed()`。
- 不覆盖 `T` / `F`。
- 图内英文标签。
- 脚本按编号：`00_setup.R`、`01_vectors.R`……
- 包版本由 `renv` 固定。

### 14.4 文件命名

- 页面：`chNN-topic.html`；专栏：`lowercase.html`。
- 数据：`snake_case.csv`。
- 图：`chNN-description.svg`。
- 示例：`chNN-ex-NN.R`。
- 速查 id：`kebab-case`。
- 不使用空格、中文文件名、大写扩展名。

---

## 15. 测试清单

### 15.1 自动

- [ ] 数据生成可复现（两次运行 sha256 一致，时间戳除外）。
- [ ] 所有示例代码与输出一致。
- [ ] 所有图由注册表生成，清单匹配。
- [ ] 所有页面链接/锚点有效。
- [ ] 所有 JSON 可解析。
- [ ] 搜索索引新鲜。
- [ ] JS 语法通过。

### 15.2 手动（每个 Phase 结束）

- [ ] `file://` 打开首页、一章、一个专栏；控制台无错误。
- [ ] 主题三态、字号持久化。
- [ ] `Ctrl K` 搜索、键盘导航。
- [ ] 讲解器单步/播放/暂停/打印末帧。
- [ ] 测验判分、解释、重开。
- [ ] 进度/掌握度/交付物/重置。
- [ ] 打印章节（A4）与工作台。
- [ ] 390 / 768 / 1024 / 1440 宽度无页面横向滚动。
- [ ] 色盲模拟下分组可区分。
- [ ] `prefers-reduced-motion` 无自动动画。
- [ ] 深色模式图舞台不变色。
- [ ] 键盘可完成搜索、测验、抽屉。

---

## 16. 新增内容步骤

### 16.1 新增一章

1. 在 `docs/03-curriculum.md` 登记章节（若改变结构）。
2. 复制 `templates/chapter-template.html`（Phase 0 创建）。
3. 写正文与组件；每个 Listing 加 `data-example`。
4. 在 `tools/examples/` 写同名 `.R`。
5. 运行 `render-examples.R` 生成期望输出。
6. 在 `render-figures.R` 注册图。
7. 在 `COURSE_TOC` 加条目；在 `BIOR_CONFIG` 加笔记/讲解器。
8. 在 `deliverables-data.js` 加交付物。
9. 运行全套校验。

### 16.2 新增速查表

1. 在 `cheatsheets-data.js` 追加对象；
2. 唯一 `id`、分类、`updated`、关联章节；
3. 代码/表格转义；
4. 运行 `build-search-index.mjs` + `validate.mjs`。

### 16.3 新增专栏单元

1. 在对应 `*-data.js` 追加；
2. 补 `chapters` / `cheatsheets` 交叉链接；
3. 若需图，注册并生成；
4. 运行校验。

---

## 17. 工程验收清单

- [ ] 所有页面 `file://` 可打开，无控制台错误。
- [ ] 无 `fetch` / ES module / CDN / webfont / 外部图片。
- [ ] 所有代码 Listing 有脚本、有期望输出，且校验通过。
- [ ] 所有统计图在 manifest 中，alt/caption 合规。
- [ ] 数据可重复生成，manifest sha256 匹配。
- [ ] `node tools/validate.mjs` 0 errors / 0 warnings。
- [ ] 单章首屏 ≤ 700KB；单图 ≤ 150KB。
- [ ] 打印、深色、窄屏、键盘、色盲、reduced-motion 全部通过。
- [ ] 部署产物不含 `tools/`、`docs/`、`node_modules/`。
