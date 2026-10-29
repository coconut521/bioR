# bioR build tools

构建期工具（不进入部署产物）。运行顺序见 `build-all.sh`：

```bash
bash tools/build-all.sh
# 或分步：
Rscript tools/generate-data.R     # 9 个教学数据文件（固定种子）
Rscript tools/validate-data.R     # 数据硬校验
Rscript tools/render-figures.R    # 注册表 → SVG + PDF + manifest
Rscript tools/render-examples.R   # 示例脚本 → expected/*.txt → 注入 HTML
Rscript tools/check-examples.R    # HTML 代码/输出与脚本逐字比对（硬闸门）
Rscript tools/collect-errors.R    # 真实触发 50 条 R 报错 → tools/errors/errors.json
node tools/build-data-previews.mjs
node tools/build-triage-data.mjs  # errors.json → triage-data.js
node tools/build-search-index.mjs # 全站搜索索引（须在 previews/triage 之后）
node tools/build-chapter-scripts.mjs
node tools/build-cheatsheet-cards.mjs # 速查表 → 静态卡片（真实锚点）
node tools/build-clinic-cards.mjs # 14 病例 + 6 红旗 → clinic.html 静态卡片
node tools/validate.mjs           # 全站校验：0 errors 才能交付
```

## 环境说明（本机）

- R 4.5.2 位于 `C:\Program Files\R\R-4.5.2`（不在 PATH 时 build-all.sh 会自动探测）。
- 所有 R 包安装在**项目本地库** `tools/rlib/`（`common.R` 自动挂载），不污染全局库。
  重建库：`Rscript tools/setup-packages.R`（含 lme4/lmerTest、survival、edgeR/DESeq2/limma、
  clusterProfiler、apeglm、pheatmap/vegan/hexbin 等进阶依赖）。
- Windows 编码：`common.R` 强制 `LC_CTYPE=.UTF-8`；R 生成的用户可见字符串一律 ASCII，
  中文只出现在由 Node/Write 工具产出的文件里。
- 示例输出注入用 `__EXPECTED_<id>__` 占位 + `data-expected="<id>"` 块刷新，可重复运行。
- 每个示例在独立 `Rscript --vanilla` 子进程（tools/run-example.R）中运行，避免包/函数互相遮蔽；
  子进程会过滤 Windows 启动时的 LC_CTYPE 警告，只保留示例本身的输出与报错。

## 文件

| 文件 | 作用 |
| --- | --- |
| lib/common.R | 路径/库路径/UTF-8、控制台输出捕获（withVisible 语义） |
| lib/extract-code.mjs | HTML/CSV 提取（校验与构建共用） |
| generate-data.R | 模拟数据（含教学点：NA、离群值、ID 不一致、批次、删失） |
| validate-data.R | 数据契约硬校验 |
| figures/{registry,theme,palettes}.R | 图注册表、期刊主题、Okabe–Ito 调色板 |
| figures/fig_*.R | 单图脚本：`build_figure(data)` 返回 ggplot |
| render-figures.R | 渲染 SVG+PDF、写 manifest（sha256） |
| render-examples.R / check-examples.R | 输出生成与 HTML 比对 |
| collect-errors.R | 真实触发 R 报错 → errors.json（报错卡唯一来源） |
| build-search-index.mjs | vm 沙盒收集数据 → search-index.js + meta |
| build-data-previews.mjs | 从真实 CSV 生成预览行 |
| build-chapter-scripts.mjs | 组装 assets/scripts/chNN.R（下载目标） |
| build-cheatsheet-cards.mjs | 速查表数据 → cheatsheets.html 静态卡片（锚点/打印/无 JS 可读） |
| build-clinic-cards.mjs | 病例/红旗数据 → clinic.html 静态卡片 + 速筛问题 |
| build-triage-data.mjs | errors.json → assets/js/data/triage-data.js（急救室数据） |
| validate.mjs | 全站校验（链接/锚点/id/转义/结构/清单/离线规则） |

## 复核工具（不参与构建）

```bash
python tools/audit-static.py                 # 29 页 HTML 结构/可访问性/元信息
node tools/audit-browser.mjs /tmp/bior-audit # 29 页 × 1440/390，截图+控制台/资源/溢出/破图
BIOR_ONLY=clinic.html node tools/audit-browser.mjs /tmp/x  # 只复核指定页
node tools/audit-interactions.mjs            # 13 页 75 项交互断言
```

`audit-browser.mjs` 与 `audit-interactions.mjs` 需要先启动 `python tools/dev-server.py`（端口 8765）。
