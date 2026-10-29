# bioR · 生物科研 R 语言教学站

> 中文版 README（English version: [README.md](README.md)）

一个完全离线、零运行时依赖的 R 语言教学网站，面向生物学本科生、研究生和实验科研人员。全部 18 章绑定同一条连续科研主线——高原鼠兔低氧适应研究（教学模拟）——让语法始终服务于一次真实分析：从整理实验记录，到做出投稿级图形，再到可复现整个分析流水线。

**状态**：v1.0.0——已建成、已审计、已交付。29 个 HTML 页面，全部生成输出经过校验（见 [docs/audit/phase0-audit.md](docs/audit/phase0-audit.md)）。开发者文档：[DEV.md](DEV.md)。

---

## 快速开始

无需安装、无需服务器、无需联网。双击 `index.html` 即可学习（支持 `file://` 打开）。

也可以本地起一个静态服务：

```bash
python tools/dev-server.py     # http://127.0.0.1:8765
```

重新生成数据、图形、示例输出与搜索索引的方法见 [DEV.md](DEV.md)。

---

## 站点内容

| 模块 | 规模 | 说明 |
| --- | --- | --- |
| 主线课程 | 18 章 | 14 章核心 + 4 章进阶；约 45–55 学时；一条鼠兔低氧研究主线 |
| 生物绘图专区（`bioviz.html`） | 9 张配方卡 | 图形解剖讲解器、期刊预设、配色库、投稿检查清单 |
| 生物信息专区（`bioinfo.html`） | 6 条航线 / 44 站 | 每站标注 shell / R 分工、包图谱、文件格式指南 |
| 数据诊所（`clinic.html`） | 14 个病例 + 6 面红旗 | 症状 → 诊断 → 处方 → 预防 |
| R 代码急救室（`triage.html`） | 50 条真实报错 | 由脚本在 R 4.5.2 中实际触发采集；病因 → 修复 → 预防 |
| 统计导航（`stats-nav.html`） | 决策树 + 6 个模板 | 选检验、效应量、报告句型 |
| 数据集标本馆（`datasets.html`） | 9 个模拟数据集 + 8 个外部入口 | 数据字典、预览、章节直达 |
| 课题工作台（`project.html`） | 18 组交付物、4 个图表槽位 | 进度跟踪、可复现清单 |
| 速查表（`cheatsheets.html`） | 36 张卡、7 类 | 表格/代码可复制、可打印 |
| 术语表（`glossary.html`） | 22 条术语 | R / 统计 / 生物三视角，公式 + 章节链接 |
| 注册图形 | 18 张图 | 由注册表渲染，每条图注都报告 n |

另有 `about.html`（版本表、构建流程、许可说明）。

全部教学数据为**固定种子（20261027）模拟生成**，不含任何真实动物或患者数据。

---

## 内容可信度规则

1. **不发明输出。** 站点上所有 `R console` 输出、统计量、p 值和图形都由 `tools/` 下脚本生成，并在每次构建时硬校验（`check-examples: ALL PASS`）。
2. **统计判断优先于语法。** 章节讲设计、前提、效应量与置信区间；数据诊所与统计导航专门练判断。
3. **零运行时依赖。** 纯 HTML/CSS/vanilla JS：无 CDN、无网络字体、不在浏览器里跑 R，`file://` 离线可用。
4. **tidyverse 主轨 + base R 对照轨。** 每张代码卡都给 base R 对照。
5. **图形标签用英文、讲解用中文**——图形可直接进论文，讲解用母语。

---

## 仓库结构

```text
bioR/
├─ index.html            首页：研究路线、继续学习、工作台摘要
├─ chapters/             18 章页面（ch01 … ch18）
├─ bioviz.html           生物绘图专区
├─ bioinfo.html          生物信息专区
├─ clinic.html           数据诊所
├─ triage.html           R 代码急救室（真实报错卡）
├─ stats-nav.html        统计导航
├─ datasets.html         数据集标本馆
├─ project.html          课题工作台
├─ cheatsheets.html      36 张速查卡
├─ glossary.html         术语表
├─ about.html            关于、构建流程、版本表
├─ assets/               css / js / data / figures / scripts（运行时资产）
├─ data/                 章节交付物（学生输出示例）
├─ figures/              章节交付物图形
├─ docs/                 设计与工程文档（中文）+ 审计记录
├─ tools/                R + Node 构建流水线与审计脚本
└─ .github/workflows/    CI：push 时运行 tools/build-all.sh
```

`tools/rlib/`（本地 R 包库，约 750 MB）不入库；用 `Rscript tools/setup-packages.R` 重建。

---

## 构建与校验

一条命令重新生成并校验全部内容：

```bash
bash tools/build-all.sh
```

流水线：生成数据 → 校验数据 → 渲染图形 → 渲染示例输出 → **硬比对输出** → 采集真实 R 报错 → node 构建器（预览、急救室、搜索索引、章节脚本、速查卡、病例卡）→ `validate.mjs`。

交付门：`validate: 0 error(s), 0 warning(s)` 且 `check-examples: ALL PASS`。

环境搭建、分步命令与审计工具见 [DEV.md](DEV.md)。

---

## 文档

- [DEV.md](DEV.md) — 开发者指南（英文）：环境、流水线、数据契约、审计、约定。
- `docs/01…08` — 设计系统、信息架构、课程、专栏、工程契约、作者规范、路线图、ADR（中文）。
- [docs/audit/phase0-audit.md](docs/audit/phase0-audit.md) — 站点完成前的完整代码 + 视觉审计记录。
- [README.md](README.md) — 英文版 README。

## 许可

暂无许可文件；分发内容或代码前请先补充。
