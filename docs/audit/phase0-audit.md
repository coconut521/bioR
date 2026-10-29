# Phase 0 审计记录（设计令牌、站点外壳、流水线、首页、章节模板）

审计日期：2026-10-27 · 审计人：开发代理 · 范围：Phase 0 全部产出

## 一、自动代码审计（全部通过）

| 项 | 结果 |
| --- | --- |
| `bash tools/build-all.sh` 一键流水线 | 7 步全部通过 |
| `validate-data.R` | ALL PASS（60×11 生理表、36×6 重复测量、删失率 20%、counts 非负整数、3 处 ID 不一致等 37 项） |
| `check-examples.R` | ALL PASS（HTML 代码/输出与脚本逐字一致、可复跑） |
| `node tools/validate.mjs` | **0 errors** / 40 warnings（全部为「页面未建」的阶段性警告：chapters 0/18、cheatsheets 0/36、7 个专栏页未建） |
| JS 语法 `node --check` | 25 个文件全部通过 |
| 离线规则 | 无 fetch/import/eval/XMLHttpRequest/绝对 URL |
| CSS 令牌纪律 | tokens.css 之外无十六进制颜色 |
| 图形清单 | sha256 匹配、alt 40–160 字、图注含 n、SVG 14KB ≤ 150KB |
| 数据清单 | 9 文件 sha256 与行数匹配 |
| 搜索索引 | 94 条记录、meta hash 新鲜 |

## 二、视觉审计（Chrome 1440 / 390 × 亮暗主题）

方法：无头 Chrome 截图（tools/shot.sh）+ 应用内浏览器实测交互。

### 发现并已修复

1. **代码 Listing 背景 bug（严重）**：listing.js 生成 `div>code`（无 pre 包裹），
   base.css 的裸 `code` 选择器把米色 surface-2 糊上代码区，浅色代码文字不可读。
   修复：`.listing-code code { background: transparent; border: 0 }`。
2. **半透明高亮在暗底上的合成问题**：`.cl.is-current/.is-past` 的 rgba 叠加在部分合成路径下
   发白。修复：改为预混不透明色（`--bio-code-current/-past` 令牌），并把高亮简化为仅当前行。
3. **首页 Hero 断词**：4.3rem 字号下「路线」被拆成「路/线」。修复：字号
   `clamp(2.5rem, 3.8vw, 3.4rem)`，两行整齐。
4. **移动端顶栏溢出（390px）**：字号/演示按钮把汉堡菜单挤出视口（scrollWidth 480）。
   修复：≤767px 仅保留 品牌+搜索+主题+菜单（对齐 docs/02 §3.1）。
5. **右栏目录双重编号**：章节 h2 自带「1.」前缀 + rail 计数器重复。修复：渲染时剥离
   标题前缀编号。
6. **模板章（ch00）右栏/封面操作不注入**：chapter.js 依赖 COURSE_TOC 条目。
   修复：无条目时从封面合成 pseudo entry（下载脚本按钮正确隐藏）。
7. **`?theme=` 深链与顶栏主题切换冲突**：URL 参数一直压过 localStorage。
   修复：显式切换时用 replaceState 清除参数。
8. **测验答对后选项仍可点**（视觉态）：修复为答后一律禁用。
9. **数据预览空**：模板页漏加载 dataset-previews.js。已补；预览行由
   build-data-previews.mjs 从真实 CSV 生成。

### 已知非问题

- 无头 Chrome 最小布局宽度约 500px，<500px 的截图裁切是工具伪影；
  应用内浏览器实测 390px：scrollWidth=375，无页面级横向滚动，文本正常换行。
- 代码内 `<U+00D7>` 乱码曾出现：已在 common.R 强制 `LC_CTYPE=.UTF-8` 修复，
  tibble 输出现含真实「×」字形。

### 交互测试（全部通过）

标记完成 → localStorage 持久化并显示「已学完 ✓」；单步讲解器 4/4 帧正确高亮第 10 行；
测验判分/解释/进度 1/3；搜索「dplyr」命中章节+交付物并分组；抽屉 18 章+7 专栏+继续学习；
主题三态切换与持久化；术语 tooltip 首次出现包裹（3 处）。

## 三、Phase 0 验收清单（docs/07 §2）

- [x] file:// 结构就绪（全相对路径，本地服务器审计通过；无 fetch/module/CDN）
- [x] 9 个数据文件生成且两次运行 sha256 一致
- [x] validate-data.R 通过
- [x] 示例图由注册表生成、manifest 匹配
- [x] Listing 代码/输出与 expected 一致
- [x] 搜索可检索模板章（索引含全部数据源）
- [x] validate.mjs 0 errors
- [x] 390/768/1024/1440 无页面级横向滚动
- [x] 深色主题、打印样式、reduced-motion 规则就位

**结论：Phase 0 地基通过审计，进入 Phase 1（ch01–ch06 内容）。**

---

## 四、Phase 1 章节审计（滚动追加）

### ch01 · 从零开始（2026-10-28）
- 6 个 Listing（对象/赋值/here/glimpse/版本/args）输出全部真实且机器无关（basename 防路径泄漏）。
- 手绘 SVG 项目目录树（role="img" + title/desc）；数据预览接 dataset-previews。
- 3 条真实报错卡（cannot open file / no package called / could not find function）。
- 视觉：封面、右栏（3 条田野笔记）、任务卡、错误卡、方法学句、页尾 pager 全部正确。
- 修复：field-notes small 改为块级（标题/正文换行）；pager 链接文字换行。

### ch02 · 向量与数据类型（2026-10-28）
- 6 个 Listing 全部自包含；mean NA 传播、is.na 逻辑索引、coercion 警告、factor/table。
- 2 张注册图：ch02-hb-strip（NA 位置画「?」）、ch02-mean-na（三种均值对比，123.85 vs 148.62）。
  修复：scale_colour_manual 的 `NA =` 名字不合法 → `"NA" =`；NA 标记需固定 y 位置。
- 视觉：1440/亮暗、代码高亮、图形舞台、vector 讲解器帧（vector cells 含 na/active 状态）全部正确。
- 修复：章节头 mobile 规则（≤767px 隐藏字号/演示按钮）防止 header 溢出。

### ch03 · 数据框与 tidy 数据（2026-10-28）
- 5 个 Listing（glimpse/索引/ID 唯一性/有序因子/tribble 字典）；dataframe 讲解器 3 帧
  （tidy 行 → 重复 ID 红线 → 宽表反例）。
- **抓到引擎 bug**：stepper.js `el("tr" + " hl")` 把类名拼进标签名 → createElement 抛异常 →
  dataframe 讲解器舞台空白。修复为 el("tr", "hl")；交互复测高亮/dupe 正常。
- 示例脚本 R 字符串保持 ASCII（中文经 pillar 输出会被转义成 \uXXXX）。
- validate 0 errors；截图审计通过。

### ch04 · 导入与 QC（2026-10-28）
- 5 个 Listing：裸导入（1×99）→ skip=3 + rename（4 列）→ Excel 双 sheet + incidents →
  4 项 QC 检查 → qc tibble 汇总；2 张注册图（ch04-qc-dashboard 四面板、ch04-od600-hist）。
- 修复：ch04-ex-05 tibble 少一个右括号（R 与 HTML 同步改）；多行警告在 capture 里
  带 \n → warning 处理器按 message 同样 strsplit；expected 写 CRLF → bioR_write_lines
  wb 模式；REPRO norm() 对两侧同时 strip \r。
- load_data 特例：plate_reader_raw.csv 以 skip=3 读入（与页面示例一致）。
- trim_ws = FALSE 保住 " C3" 教学错位；janitor 弃用（locale 警告）改显式 rename。
- 视觉：1440 亮色全页截图通过；多行警告在 console 块内换行正确。

### ch05 · 函数、控制流与模拟（2026-10-28）
- 5 个 Listing：qc_summary(df)（stopifnot 校验）→ for/预分配 + T/F 陷阱 →
  map2_dfr 三批次 QC → tryCatch 坏文件留痕 → replicate 1000 次抽样（σ/√n 对照）。
- 注册图 ch05-sampling-error（SE 随 n 下降，模拟 vs 理论虚线重合；caption 补 n = 过验证）。
- 修复：ex-02/ex-05 输出泄漏 tempfile 随机路径 → 批次标签列替代文件名；
  map2 参数顺序反了（标签被当路径）→ qc_batch(batch, path)；
  ex-03 误写 round(x <- …, 1) 赋值混入输出 → 拆行。
- **抓到讲解器契约 bug**：pipeline/stats 引擎数据必须包在 frames 数组里
  （initExplainer 以 frames 为步进单位，顶层 stages/groups 会被静默跳过）。
  ch05 两个讲解器改为 2 帧 pipeline / 3 帧 stats 后正常渲染。
- validate 0 error / 35 warn（全部为未建页 ROLLOUT）；1440 亮色全页截图审计通过。

### ch06 · dplyr 数据整形（2026-10-28）
- 5 个 Listing：filter 排除 + 反选被排行 → case_when 分级（60 只吞并反例）→
  group_by+summarise（3 组）→ n() vs sum(!is.na()) 两张对账表 → 端到端 Table 1（6 组）+ aggregate 对照。
- pipeline 讲解器 4 帧：60 行 → 58 行 → 6 组 → 6 行（active 逐步高亮）。
- 修复：TOC 文件名契约是 ch06-wrangling.html（此前误写 ch06-data-shaping.html）→ 重命名；
  TOC question 与封面不一致 → 同步；data-part I→II、kicker 改 STAGE II · EXPLORE；
  ex-02 坏顺序演示原标签恰好等价（没吞并）→ 改为宽条件前置（heavy 60 反例）；
  输出从 16 行截断 → 10 行整，关键数字不再落入隐藏段。
- 视觉：1440 亮色全页通过；错误卡、任务卡、讲解器、三张汇总表全部正常。

### 数据集标本馆 datasets.html（2026-10-28）
- 结构：special-hero → 筛选栏（全部/教学/外部 + 章节/分析下拉 + 搜索 + 重置）→ 9 张教学卡片
  （标签/维度/研究问题/变量提示/下载/字典/章节入口/紧凑预览）→ 8 张外部入口卡（适合/许可/引用/工具）
  → 数据字典查看器（下拉 + 11 变量表 + CSV 下载）→ 来源许可表 → 引用规范 → 延伸。
- 交互实测（in-app browser）：外部入口 → 8 ext / 0 teaching / 章节下拉禁用；教学数据 + ch17 →
  2 张正确卡片；字典切 pika-survival → 6 变量 + hash 同步；#pika-annotation 深链 → 滚动 1498px +
  字典预选 + 卡片高亮（1.6s 后自动移除）。
- 修复：data-preview 新增 data-compact 模式（卡片内不再重复标题/说明/脚注）；
  卡片指向未建章节的文件名错误（ch11/ch17/ch18）→ 对齐 COURSE_TOC 实际文件名；
  data-dict 点击 → 选中字典并滚动；空状态「清除筛选」接上重置。
- validate 0 error；外部链接 8 条仅记录不抓取。

### 速查表 cheatsheets.html（2026-10-28）
- 21 张（19 P0 + purrr/功效，均为章节已引用）；4 种卡片：table 13 / items 4 / code 2 / decision 2；
  6 类分类 + RESEARCH TOOL 过滤 + 搜索 + 复制（表格→TSV、代码→原文）+ 章节反链。
- 架构：数据单源 window.BIOR_CHEATSHEETS（search-index 收录 21 条 cheat 记录）；
  **静态卡片由 tools/build-cheatsheet-cards.mjs 构建期生成**——保证真实锚点（#table1 等）、
  打印不跨页、无 JS 可读；页面脚本只做筛选/复制/深链。
- 修复：JS 渲染导致静态锚点校验失败 → 改为构建期卡片；静态 pre>code 内不得含高亮标签
  （校验器要求转义原文）→ 运行时 BIOR.highlightR 高亮；notes/tip 实体双重转义 → 文本字段
  先解码再转义；卡片排序由标题长度改为 P0 原始顺序；#import 旧锚点 → 别名为 import-export。
- 交互实测（in-app browser）：科研工具 5/21、RESEARCH TOOL 开关、复制反馈「已复制 ✓」、
  #data-dictionary 深链滚动 + 高亮、代码卡 31 个高亮 token。
- 管线：build-all.sh 第 6 步加入卡片生成；README 同步。validate 0 error。

### Phase 1 验收（2026-10-28）
- 一键管线 `bash tools/build-all.sh` 全绿：数据 9 文件 → 37 项数据校验 → 6 图 → 示例注入 →
  REPRO 硬闸门 ALL PASS → 搜索 115 条 → 18 章脚本 → 速查卡 21 张 → validate 0 error / 51 warn（全部为规划内未建页）。
- 端到端 Table 1：运行 assets/scripts/ch06.R → data/table1_group.csv（6 × 6，Σn = 58）+
  data/exclusions.csv（2 行，rule = hemoglobin missing），与页面数字逐位一致。
- 首页联动：路线阶段 I（ch01–05）与 II（ch06–09）卡片、105 min、交付物、前置全部正确；
  hero 统计改为实时 21 速查；七个专栏卡链接 datasets/cheatsheets 均已可达。
- 新增工具：build-cheatsheet-cards.mjs（已入 build-all.sh 与 README；CI 走同一脚本）。

### ch07 · 宽长转换与多表连接（2026-10-28）
- 5 个 Listing：pivot_longer（24000×4）→ 双向 anti_join（3 处不一致：␣C3 / H-5 / H-6）→
  str_trim+str_replace 清洗（12/12）→ left_join 三条对账（行数/NA/反向）→ 端到端两交付物。
- dataframe 讲解器 3 帧：脏键（␣ 可见空格符号）→ join 后 group=NA（行在信息丢）→ 清洗后全连上。
  修复：tibble/HTML 会折叠前导空格 → 讲解器用 ␣C3 显式展示；确认 tr.hl 蓝底高亮生效。
- 教学要点：readr 默认 trim_ws=TRUE 会掩盖空格问题 → 示例显式 trim_ws=FALSE；多对多 Warning 卡诚实标注 Warning。
- validate 0 error；1440 全页截图审计通过。

### ch08 · ggplot2 语法（2026-10-28）
- 5 个 Listing：data/aes/geom 首图 → 五数概括（为什么不用柱状图）→ mapping vs setting（hb×海拔，58 点）→
  facet_wrap（分面比较模式）→ ggsave 三张交付图（89 mm，TRUE×3）。
- plot-grammar 讲解器 5 帧：空坐标轴 → +箱线 → +散点 → +色板/标签/主题；逐层说明。
- 新增 2 张注册图：ch08-hb-altitude（按性别色+形状+拟合线）、ch08-mass-sex-facet（F/M 分面）；
  修复：海拔组默认字母序（high/low/mid）→ 3 个 ch08 图统一 factor(low,mid,high)；图 8.2 同步重渲染。
- 修复：ex-03 的 class(p$layers[[1]]) 输出 LayerInstance 与解释不符 → 改 $geom（GeomPoint 对齐）。
- validate 0 error；8 张图 manifest 校验通过；1440 全页截图审计通过。

### ch09 · 出版级图形（2026-10-28）
- 5 个 Listing：theme_bw+细节 → 有序因子与具名色板 → patchwork 拼图+标签 → 183mm cairo_pdf 导出 →
  10 行英文图注写 figure1_legend.md。
- **新增 engine：anatomy**（图形解剖）——frames 各含 {src, box:[x%,y%,w%,h%], note}，
  用 SVG viewBox 坐标精确换算热区（A 标签/轴/散点/图例/拟合线/全图 6 帧）；stepper 复用翻帧控件。
  视觉复核 frame 1 热区准确命中 A 标签；其余帧坐标由 SVG 文本坐标数学换算。
- 新注册图 ch09-figure1（183×105mm，patchwork A/B）；TOC ch09 问题与封面同步。
- 修复：ch09-ex-01 base_size 输出确认为 9；ex-04 device=cairo_pdf（函数名不加引号）。
- validate 0 error；1440 全页截图审计通过。

### ch10 · 描述统计与分布（2026-10-28）
- 5 个 Listing：三组五数概括 + hb 四数 → 三个 Shapiro（0.011/0.152/0.565）→ 1.5×IQR 标记
  （P017/P023/P048，界 146.5–204.3）→ log 前后均值SD → fig_distributions 导出。
- stats 讲解器 2 帧：三组 mean±SD（差 11 g vs SD 16 g）→ 全部 vs 去掉 232 g（均值 +1.0/SD +1.6，中位数 0.4）。
- 新注册图 ch10-distributions（A 直方图+密度、B 箱线+3 橙点标记）；图注写明「未删除」。
- 教学口径：Shapiro 显著 ≠ 必须变换（hb p=0.152 不拒绝，log 仅作敏感性）；先规则后结果。
- validate 0 error；1440 全页截图审计通过（10 图 manifest 校验）。

### ch11 · 两组比较（2026-10-28）
- 5 个 Listing：Welch t（−8.6 g，CI −17.2..−0.08，p=0.048）→ 方差比 3.20 与
  Student/Welch p 并排（0.0467/0.0479）→ Cohen's d −0.52（CI −1.04..−0.01）→
  配对 T0/T28（+2.53 g，CI −5.35..10.4，p=0.446；Wilcoxon 0.4375）→ 三行结果表 + methods.md。
- stats 讲解器 2 帧：F/M 均值±SD（方差差 3.2 倍）→ 同 d=0.52、n 翻 4 倍 p 变小的概念帧。
- 修复：broom 的 var.test 消息刷屏 → suppressMessages；effectsize 取列破坏类属性 → 取 $ 字段；
  file.exists 少 c()；ex-02 输出 12 行截断 → 具名向量压到 6 行（Welch p 不再被藏）。
- validate 0 error；1440 截图审计通过。

### ch12 · ANOVA 与事后检验（2026-10-28）
- 5 个 Listing：单因素 ANOVA（F(2,57)=3.449, p=0.0385）→ 双因素（A p=.0281、B p=.0345、
  **A:B p=.1214 不显著**）→ Levene 0.786 / Kruskal 0.030 → Tukey（0.977/0.054/0.086 全不显著）→
  方差表 CSV + cld 字母图（三组全 a）。
- 新注册图 ch12-anova-letters（均值±SE + Tukey 字母，89×55）。
- 教学要点：总显著 ≠ 两两显著；交互无证据（p=.121）时主效应可解释，但 ch08 分面视觉差异 ≠ 交互。
- 修复：multcomp/multcompView 未安装 → 装入项目库；car/emmeans 加载消息 → suppressPackageStartupMessages；
  cld 默认 sidak 与 TukeyHSD 结论不一致 → 显式 adjust="tukey" 使字母与 p 对账（全 a）。
- validate 0 error；1440 截图审计通过。

### ch13 · 回归与线性模型（2026-10-28）
- 5 个 Listing：hb~海拔+性别（斜率 0.0163，CI 0.0125–0.0200；sexM 4.58 ns）→ glance（R².593/
  sigma 10.3）→ augment 诊断（残差 Shapiro .073、max hat .063、3 个 |std.resid|>2）→
  log-log 异速（1.04，CI .51–1.57）→ 三模型结果表 + 回归图 + glm OR 3.86。
- anatomy 讲解器 4 帧（拟合线/CI 带/残差/外推边界）——偏离 docs 的 stats+matrix，
  因 anatomy 更贴合「拟合线、残差、杠杆点」教学目标（记录在案）。
- **管线架构修复（重要）**：示例此前在同一 R 会话运行，ch12 的 multcomp 附带 MASS，
  MASS::select 遮蔽 dplyr::select → ch13 报错。改为 tools/run-example.R 子进程隔离执行
  （bioR_run_example_child），并过滤 Windows Rscript 启动 LC 警告；暴露并修复 ch13-ex-02/04
  自身缺 library(dplyr)。
- 修复：3 个 geom_smooth 脚本的 shape 继承警告 → inherit.aes=FALSE + 显式映射；海拔组因子序。
- validate 0 error；1440 截图审计通过（图 13.1 CI 带正确）。

### ch14 · 可复现分析（2026-10-28）
- 5 个 Listing：脚本/示例盘点（18/74）→ 数据图盘点（11/12）→ report.qmd 骨架（params+chunks）→
  session_info.json → README 五步；pipeline 讲解器 3 帧（数据→build-all→图表→render）。
- 环境说明：本机无 Quarto/renv CLI，页面如实说明外部依赖；示例产出 qmd/session_info/README 脚手架。
- validate 0 error；截图审计通过。

### 生物绘图专区 bioviz.html（2026-10-28）
- 8 张静态配方卡（分布 3 / 比较 2 / 关系 2 / 趋势 1 / 组学 1）+ 分类筛选 + 语法高亮；
  图形解剖（复用 anatomy 6 帧，fig9 热区）；配色库表；期刊预设；3 个反例卡；检查清单链接。
- 修复：卡片内 pre 横向溢出 → overflow-x:auto + 字号 .7rem（真实滚动，不裁切内容）。
- validate 0 error；截图 + 筛选逻辑审计通过。

### 统计导航 stats-nav.html（2026-10-28）
- 决策树 4 问 → 12 种结果卡（推荐检验/R 函数/前提/效应量/报告模板/不要做/章节+速查链接）；
  13 行检验总表；4 类前提清单；6 选 1 报告句型生成器。
- 交互实测：连续→只描述 → 结果卡「描述统计（不做检验）」+ R 函数正确；重开/面包屑正常。
- validate 0 error；截图审计通过。

### 课题工作台 project.html（2026-10-28）
- 研究问题卡（设计/n/统计单位/数据性质）；进度环 + 4 阶段条（0/5·0/4·0/4·0/5）；
  18 项交付物看板（localStorage 勾选、逐项文件清单）；4 图表槽位（依赖章节联动）；
  方法学/可复现清单；导出研究日志（打印）。数据源 BIOR_DELIVERABLES + BIOR.progress。
- validate 0 error；截图审计通过（0% 初始态布局正确）。

### R 代码急救室 triage.html（2026-10-28）
- 数据先行：tools/collect-errors.R 扩到 43 个配方（10 类），全部在 R 4.5.2 实际触发；
  tools/build-triage-data.mjs → assets/js/data/triage-data.js；页面只读生成数据，报错原文/最小复现零手写。
- 页面：43 张报错卡（错误/警告色标、分类、id、报错原文、最小复现、病因/修复/预防、章节+速查链接）；
  分类筛选 + 搜索 + 重置 + 空态；调试五步法；reprex 提问模板；来源说明 + noscript 回退。
- 卡片标题取最后一行 `!` 核心错误（dplyr/cli 分层报错）；其余上下文置于引用块；正文全部 textContent 转义。
- 交互实测（IAB）：建模 8 卡且计数同步；搜索无结果 → 空态；重置回 43 卡；分类 active 正确。
- 修复：triage-grid 误用 unit-grid → 2 列 520px；代码/消息换行（pre-wrap）避免横向裁切；
  章节/速查标签取 COURSE_TOC / BIOR_CHEATSHEETS（原按对象取数组失败）；错误色用 danger token；
  深链接初始化顺序 + load 后 scrollTo；清除 triage-data 中 eval 字样（validator 运行时规则）。
- 遗留说明：IAB 命中旧缓存脚本，深链接滚动以直接 scrollTo 调用验证；headless 对远距离 hash 截图
  出现整页偏移伪影，不用于判定布局。
- validate 0 error（16 warnings 均为未建页/章节/速查）；1440 / 520 / dark 截图审计通过。

### 数据诊所 clinic.html（2026-10-28）
- 14 个病例（设计 2 / 统计 9 / 可视化 1 / 可复现 1 / 组学 1），字段完整：
  症状、红旗、诊断、处方（ol）、R 修复、预防、章节+速查链接；6 面红旗速筛（是/否/不确定）。
- 架构：assets/js/data/clinic-data.js（唯一内容源）→ tools/build-clinic-cards.mjs 生成 clinic.html
  静态卡片与速筛问题（真实锚点 #case-*、可打印、无 JS 可读）；clinic.js 只做筛选/高亮/速筛推荐。
- 交互实测（IAB）：第 1 题答「否」→ 推荐 pseudoreplication；「统计」筛选 9/14 且计数同步；
  「重新体检」清空 aria-pressed 并隐藏结果面板。速筛结果面板 aria-live=polite。
- 内容审计修正：生态学谬误处方改为个体 lm + 组均值仅描述（避免 3 组随机效应）；
  ordinal 病例 polr 改用 ordered 因子；全部 chapter/sheet/flag 引用经脚本核对存在。
- 修复：flag 卡按钮在等高卡内底对齐（flex + margin-top:auto）；移动端 clinic-grid 1 列；
  clinic-data 的 R 片段保持 ASCII，静态卡片经 HTML 转义。
- validate 0 error（20 warnings 为 ch15–18 / bioinfo / glossary / 速查进度）；
  1440 / 520 / dark 截图审计通过。

### 生物信息专区 bioinfo.html（2026-10-28）
- 六条航线（Bulk 9 / 单细胞 9 / 微生物 7 / 变异 7 / 系统发育 6 / 蛋白组 6 = 44 站），
  每站字段：目的、工具、输入、输出、检查点、常见失败、章节+速查；r=true 的站点标绿边与 R 标签。
- 页面：航线切换 + 横向站点线 + 右侧固定详情面板（移动端改为下方）；
  「R 在哪一站」7 行表；包图谱 29 个包（9 任务，来源/用途/替代/学习成本/课程标记）；
  格式指南 11 种（含 0-based/1-based、MTX 方向等坑）；GEO 七步走查；9 条误区；noscript 说明。
- 数据契约：assets/js/data/bioinfo-data.js（BIOR_BIOINFO）；x/y 与 edges 按节点顺序派生。
- 交互实测（IAB）：切「单细胞」→ 9 站、lede/hint 同步（R 6 / shell 3）；点第 4 站 →
  详情「矩阵与对象」+ R 站点标签；active 节点正确。
- 修复：`.route` 与首页课程路线类名冲突导致节点竖排 → 改 `.wf-route` + flex-direction:row；
  44 站计数由数据核对后修正（原误写 48）；格式表 `import()` 触发 validator 运行时规则 →
  改为 `rtracklayer::import（GFF3/BED）`；移动端给三张表设 min-width 改为横向滚动。
- 内容审计：R 表与节点 r 标记对齐（featureCounts 标「部分」）；单细胞 DE 强调 pseudobulk；
  富集背景/批次混杂/删失等误区与病例页一致。
- validate 0 error（20 warnings 全部为未建 ch15–18 与 glossary/速查进度）；
  1440 / 520 / dark 截图审计通过。

### ch15 · 混合效应与重复测量（2026-10-28）
- 5 个 Listing（36 行 vs 12 只 → ICC → 固定效应/emmeans → batch 随机效应/AIC → stats_mixed.csv）；
  新注册图 ch15-trajectories（12 只 × 3 次个体轨迹，89×60）；dataframe 讲解器 3 帧（同一 id 三行 → 36 行/12 只 → 按行算 n=36 的后果）。
- 真实输出：ex1 estimate −3.46、SE 5.18→8.53、df 34→10、p 0.51→0.69；ex2 方差 178.4/69.7、ICC 0.719；
  ex3 处理 −3.46（p .693）、T14 +4.03（p .25）、T28 −0.36（p .917）；ex4 AIC 287.6→289.6、LRT p .79；
  ex5 4 行固定效应 + 95% CI、ICC .684、max p .35（如实写「无证据」）。
- 报错来源扩充：collect-errors.R 新增 lmer 单水平随机效应、无随机项两条真实错误（45 条）；
  ch15 常见错误引用真实文本（含 contrasts 单水平因子）。triage 计数同步 45。
- **全站修复（重要）**：chapter.js 的 section 索引把「学习目标」h2 计入，导致 ch05–ch14 侧注整体错位一格；
  改为跳过 `.objectives` 后重新编号。实测 ch15 三条 FIELD NOTES 分别锚到「重复测量」「方差分解」「组数太少」。
- 内容审计修正：方法与交付物从「只有 SE/df」补为 95% CI（Wald，estimate ± 1.96 SE），方法学句与 CSV 列一致；
  对照 R 表/病例页确认「n=个体」；常见错误不再手写调用栈，只引用采集到的 conditionMessage。
- validate 0 error（16 warnings：ch16–18、glossary、速查进度）；1440 / 520 截图 + IAB 交互审计通过。

### ch16 · 生存分析（2026-10-28）
- 5 个 Listing（事件/删失计数 → KM 中位生存 → log-rank/Cox → cox.zph → KM 图+风险表+Cox 表）；
  新注册图 ch16-km（183×90，KM + 删失刻线 + 风险表）；timeline 讲解器 2 帧（删失时间线、风险集）。
- **数据修复（重要）**：pika_survival.csv 原先删失时间未截尾（最长 155 天，数据字典写 ≤60）。
  generate-data.R 改为 pmin(60, time_raw)，status 仍按 60 天判定；重新生成、validate-data 全通过。
- 真实输出：对照 30/21 事件/9 删失、中位随访 45；低氧 30/27/3、31；KM 中位 46（35–未达）vs 31（22–44）；
  log-rank χ² 6.67（p .0098）；Cox HR 2.13（1.19–3.84，p .0114）；cox.zph p .881；风险表 30/26/18/8 与 30/22/12/2。
- 发现并修正手写风险人数（原写 28，实际 26）——再次由真实输出核对；交付图与表同脚本同次运行。
- 报错来源扩充：coxph/survfit 响应非 Surv、survdiff 单组、survreg 时间 ≤0 四条真实错误（共 49 条）；
  triage 计数与 META 同步。图例与风险表顺序统一为 control 在上。
- 内容审计：HR 解释为相对风险；中位生存缺失写「未达」；删失保留在风险集；PH 只写「无证据反对」。
- validate 0 error（13 warnings：ch17–18、glossary、速查进度）；1440 / 520 / dark 截图 + IAB 交互审计通过。

### ch17 · 多变量与聚类（2026-10-28）
- 5 个 Listing（counts→logCPM → PCA 方差/组中心 → fig_pca → pheatmap fig_heatmap → hclust 交叉表）；
  新注册图 ch17-pca（89×70）与 ch17-heatmap（183×90，前 60 高变基因）；matrix 讲解器 2 帧（原始 counts vs logCPM）。
- 真实输出：2000→1996 基因、12 样本、logCPM 1.75–12.96；PC1 12.8%、PC2 9.7%；组中心 PC1 ±15.1；
  hclust 两簇 = 6 control/6 batch1 与 6 hypoxia/6 batch2（完全混杂）。
- **引擎修复**：matrix 引擎从未被使用，`.mx-grid` 无列数导致每格独占一行、整页巨长；
  改为按 cells 列数设置 grid-template-columns，列标签用同列网格对齐，并加行/列 title。
- 图预算修复：ch17-heatmap 100 基因 SVG 198KB 超 150KB → 改为 60 基因（124KB）；章节图注/alt 同步，
  示例 4 仍交付 top 500 版 fig_heatmap.svg。
- 内容审计：PCA 分离明确写「group 与 batch 完全重合，不能归因」；热图/聚类结论同样限定；
  常见错误全部引用采集文本（路径、non-conformable、select 列不存在）。
- validate 0 error（9 warnings：ch18、glossary、速查进度）；1440 / 520 截图 + IAB 交互审计通过
  （matrix 24 格 4 列、notes 锚点、quiz 0/8、热图加载）。

### ch18 · 转录组差异分析（2026-10-28）
- 5 个 Listing（设计交叉表 → DESeq 计数 → apeglm 收缩+火山 → clusterProfiler 富集 → de_results + 富集图）；
  新注册图 ch18-volcano（89×70）与 ch18-enrichment（120×80）；pipeline 讲解器 3 帧（counts→模型→基因列表）。
- 真实输出：design 交叉表 control 6/0、hypoxia 0/6（完全混杂）；1995 可检验、74 padj<0.05、65 上调/7 下调（未收缩）；
  收缩后 49 上调/5 下调（54 个）；KEGG 4 个 term 的 p.adjust 0.821/0.821/0.821/0.836（无显著富集）；
  de_results 1996 行、min padj 2.6e-06。
- 教学主线：`~batch+group` 真实报错（收集入库）→ 只能 `~group` 并写明限制；富集为空如实报告。
- **图预算修复**：火山图 1995 个 SVG 点 290KB 超 150KB → 非显著基因改 2D hexbin 密度（20KB），显著基因保留彩色点；
  alt/图注同步说明分箱。富集脚本无显著通路，图注明确「无 FDR<0.05」。
- **引擎修复**：pipeline 7 站换行成 5+2、维度文本断裂 → >5 站改为横向滚动（150px/站）+「横向滚动查看全部 7 关」提示；
  counts 标签去掉重复维度。
- 报错来源扩充：DESeq2 不满秩真实错误（50 条）；triage 计数/META 同步。
- validate 0 error（2 warnings：glossary、速查进度）；1440 截图 + 示例硬校验通过；ch18 为 18/18 章完成。

### 速查表 36/36（2026-10-28）
- 新增 15 张：stringr/正则、forcats、检验选择、ANOVA 事后、回归诊断、混合模型、生存、PCA/聚类/热图、
  renv、Git、DESeq2、富集、Seurat、phyloseq、生物格式；分类新增「生物信息」（7 类）。
- 每张含定义/表或代码/notes/章节链接/research 标记；数据实体编码后由 build-cheatsheet-cards 静态生成
  （49,597 bytes，36 张，真实锚点）。
- 修正页面静态文案：21→36 张、6→7 类；cheat-count 36/36。
- IAB 实测：生物信息筛选 5/36（deseq2/enrichment/seurat/phyloseq/bio-formats）；搜索/复制沿用既有逻辑。
- ch15–ch18 延伸链接改为新速查锚点（mixed-models/survival/pca-cluster-heatmap/deseq2/enrichment），
  validator 锚点 0 error；1440 / 520 截图审计通过。

### 术语表 glossary.html（2026-10-28）
- 22 条术语扩展为 cat（R/统计/生物）、r（函数）、formula（SE/ICC）；三分类卡：
  中文名 + 英文名 + 定义 + 公式 + R 函数 + 相关章节。
- 页面：分类 chips、文本搜索、英文首字母索引、计数、空态、reset、noscript；正文 tooltip 数据同源。
- IAB 实测：统计 12/22；搜索「删失」2 条（censoring + KM）；首字母 P 3 条（p-value/pseudoreplication/PCA）；
  reset 回 22。搜索框文案缩短避免截断；1440 / 520 截图审计通过。

### 关于与许可 about.html（2026-10-28）
- 发现页脚 /「更多」里的 about.html 从未创建（validator 不检查 nav.js 生成链接）→ 补页：
  站点定位、模拟数据声明、构建与校验流程、离线/隐私、许可与第三方软件、版本表。
- 移除硬编码构建日期（时钟不一致），保留 v1.0.0；页脚死链修复；1440 截图审计通过。

### 最终交付门（2026-10-28）
- `bash tools/build-all.sh` 全流程 exit 0：generate → validate-data → figures → examples → check →
  collect-errors（50）→ previews/triage/search/chapter-scripts/cheatsheets/clinic → validate。
- build-all 顺序修复：data-previews / triage-data 必须在 search-index 之前（否则 meta stale）。
- **validate: 0 error(s), 0 warning(s)**；11 个根页面链接/锚点通过；18 图 manifest；9 数据集 manifest；
  37 JS 语法/离线规则；CSS token 纪律。
- 交付内容：18 章、9 个专栏/参考页（7 专栏 + 术语表 + 关于）、36 速查、22 术语、9 数据集、50 条真实报错、
  14 病例、6 航线/44 站、18 张注册图；全站 file:// 可用、无网络请求。

## 全站复核（2026-10-29）

**范围**：29 个 HTML 页面（11 根页面 + 18 章）× 桌面 1440 / 移动 390；代码审计 + 视觉审计 + 关键交互。
新增可重复审计工具：`tools/audit-static.py`（HTML 结构/可访问性）、`tools/audit-browser.mjs`
（逐页加载、控制台/资源错误、破图、横向溢出、截图）、`tools/audit-interactions.mjs`（13 页 77 项交互断言）。

### 修复（均为复核中新发现）

- **章节导航崩溃**：glossary.html / about.html 漏载 `progress.js`，`nav.js` 在 `continueHtml()` 读
  `BIOR.progress.getLast()` 抛 TypeError → 两页补脚本；`nav.js` 同时加空值保护。
- **演示模式失效**：index.html 漏载 `presenter.js`，点「演示模式」只跳 URL 不进入模式 → 补载。
- **测验解析不显示**：`quiz.js` 更新解析内容但没有取消 `explainBox.hidden` → 显示解析。
- **自测清单无持久化**：18 章 `.checklist` 复选框没有绑定 `progress.getCheck/setCheck` → 在
  `pages/chapter.js` 绑定并恢复状态。
- **进阶章节缺单步数据**：写作规范要求每章至少 2 个 `.ex-steps`，ch15–ch18 为 0 → 为每章前两个示例
  补步骤（行号/变量/输出与脚本一致），单步按钮恢复；静态审计新增每章至少 2 个的硬检查。
- **ch14 单步数据过期**：步骤 JSON 写「18 / 74」，实际示例脚本 94 → 改为「18 / 94」。
- **ch04 QC 图代码错误**：`aes(y, 1)` 把四块检查全部画在 y=1，页面只剩一块绿色 PASS；
  改为 `aes(x=1, y=y)` + y 范围 0.4–4.6；注册表图注编号与 HTML 对齐（4.1 OD600 / 4.2 QC）。
- **ch17 热图标签错误**：脚本实际取前 60 个高变基因，轴标签却写 `Top 100 variable genes`
  → 改为 `Top 60`，重渲染 SVG。
- **矩阵引擎行标签不可见**：`G00001–G00006` 只在 hover title 中，图注却按行引用 → 新增可见行标签列，
  列标签对齐；桌面截图复核。
- **Bioviz 生存筛选为空**：有「生存」筛选 chip 但无对应配方卡，且 ch18 仍标「待上线」→ 新增 KM/风险表
  配方卡（第 9 张），同步 kicker、cover-meta、计数与 ch18 链接；project.html 的 fig4「ch16，待上线」去掉。
- **术语索引按钮截断**：`.gl-letter` 固定 28px，把「全部」挤成「全」→ 首按钮宽度 auto。
- **首页章节标题孤字**：路线卡长标题出现单字「R」独占一行 → `text-wrap: balance`。
- **移动筛选栏搜索框被挤成「搜」**：`.filter-search` 在 767px 以下 `min-width:0` → 改 `min-width:240px`，
  搜索框恢复整行可读宽度；桌面无变化。
- **搜索面板 Esc**：原先只在输入框聚焦时关闭；补 document 级 Esc 关闭。
- **可访问性标题层级**：bioviz / cheatsheets / datasets 的 h1→h3、ch01 的 h2→h4 跳级 →
  增加 `.sr-only` 分组标题（不改变视觉）；`sr-only` 工具类加入 base.css。
- **构建校验回归**：新增 Bioviz 代码块中的 `<-` 未转义，validator 报错 → 改为 `&lt;-`。

### 复核结果

- `bash tools/build-all.sh`：exit 0；validate-data ALL PASS；18 图渲染；check-examples ALL PASS（92 个章节
  示例 + 2 模板）；collect-errors 50；builders 全部完成；**validate: 0 error(s), 0 warning(s)**。
- 静态审计：29 页，0 问题（标题层级、重复 ID、图片 alt/尺寸、脚本样式引用、空链接、残留占位、
  meta/title/description、main/h1 唯一性）。
- 浏览器审计：58 个页面×视口组合全部通过；无 JS 异常、无失败请求、无破图、文档横向溢出 0；
  页面内容计数（18 章 / 36 速查 / 9 数据集 / 50 报错 / 14 病例 / 22 术语 / 6 航线）与数据源一致。
- 交互审计：13 页 77 项断言全部通过（Ctrl+K 搜索、Esc、抽屉、分类/关键词筛选与重置、红旗体检、
  航线切换、决策树、交付勾选、掌握度、自测、测验解析、单步末帧 18/94、章节单步、矩阵行标签）。
- 视觉审计：29 页桌面/移动截图总览 + 重点组件放大（ch04 QC、ch15 轨迹/数据框、ch16 KM/时间线、
  ch17 矩阵/PCA/热图、ch18 火山/富集/管线、ch14 管线、Bioviz 新配方、术语与筛选栏）；
  修复后复查通过。未提交（项目非 git 仓库；交付门已满足）。
