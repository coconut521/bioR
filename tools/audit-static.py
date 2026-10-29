#!/usr/bin/env python3
"""Static accessibility/structure audit for the bioR site.

Checks metadata, heading outline, duplicate ids, image/button/form
basics, offline resources, leftover build markers and obvious TODOs.
Read-only; prints issues grouped by page.
"""
from __future__ import annotations

import json
import re
import sys
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGES = sorted([ROOT / "index.html", ROOT / "about.html", ROOT / "glossary.html",
                ROOT / "cheatsheets.html", ROOT / "datasets.html", ROOT / "project.html",
                ROOT / "bioviz.html", ROOT / "bioinfo.html", ROOT / "clinic.html",
                ROOT / "stats-nav.html", ROOT / "triage.html"] +
               list((ROOT / "chapters").glob("*.html")))


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: Counter[str] = Counter()
        self.headings: list[tuple[int, str]] = []
        self.images: list[dict] = []
        self.buttons: list[dict] = []
        self.inputs: list[dict] = []
        self.tables: list[dict] = []
        self.links: list[dict] = []
        self.scripts: list[dict] = []
        self.styles: list[dict] = []
        self.main_count = 0
        self.in_table = 0
        self.table_has_th = False
        self.cur_heading = None
        self.heading_text: list[str] = []
        self.examples: list[str] = []
        self.figures: list[str] = []
        self.label_depth = 0

    def handle_starttag(self, tag, attrs):
        a = {k.lower(): (v if v is not None else "") for k, v in attrs}
        if "id" in a:
            self.ids[a["id"]] += 1
        if tag in ("h1", "h2", "h3", "h4", "h5", "h6"):
            self.cur_heading = int(tag[1])
            self.heading_text = []
        elif tag == "img":
            self.images.append(a)
        elif tag == "button":
            self.buttons.append(a)
        elif tag in ("input", "select", "textarea"):
            self.inputs.append({"tag": tag, "wrapped": self.label_depth > 0, **a})
        elif tag == "table":
            self.in_table += 1
            self.table_has_th = False
        elif tag == "th" and self.in_table:
            self.table_has_th = True
        elif tag == "a":
            self.links.append(a)
        elif tag == "script":
            self.scripts.append(a)
        elif tag == "link":
            self.styles.append(a)
        elif tag == "main":
            self.main_count += 1
        elif tag == "label":
            self.label_depth += 1
        if "data-example" in a:
            self.examples.append(a["data-example"])
        if "data-figure" in a:
            self.figures.append(a["data-figure"])

    def handle_endtag(self, tag):
        if tag in ("h1", "h2", "h3", "h4", "h5", "h6") and self.cur_heading is not None:
            self.headings.append((self.cur_heading, "".join(self.heading_text).strip()))
            self.cur_heading = None
        elif tag == "table" and self.in_table:
            self.tables.append({"has_th": self.table_has_th})
            self.in_table -= 1
        elif tag == "label" and self.label_depth:
            self.label_depth -= 1

    def handle_data(self, data):
        if self.cur_heading is not None:
            self.heading_text.append(data)


def audit(path: Path) -> dict:
    raw = path.read_text(encoding="utf-8")
    p = PageParser()
    p.feed(raw)
    rel = path.relative_to(ROOT).as_posix()
    issues: list[str] = []

    if not re.search(r'<html[^>]+lang="zh-CN"', raw):
        issues.append("html lang 不是 zh-CN")
    if '<meta charset="UTF-8">' not in raw:
        issues.append("缺少 UTF-8 charset")
    if 'name="viewport"' not in raw:
        issues.append("缺少 viewport")
    title = re.search(r"<title>(.*?)</title>", raw, re.S)
    if not title or not title.group(1).strip():
        issues.append("缺少 title")
    desc = re.search(r'<meta name="description" content="([^"]*)"', raw)
    if not desc or len(desc.group(1).strip()) < 20:
        issues.append("缺少/过短 meta description")
    if p.main_count != 1:
        issues.append(f"main 数量={p.main_count}")

    h1s = [h for h in p.headings if h[0] == 1]
    if len(h1s) != 1:
        issues.append(f"h1 数量={len(h1s)}")
    last = 0
    for level, text in p.headings:
        if not text:
            issues.append(f"空标题 h{level}")
        if last and level > last + 1:
            issues.append(f"标题跳级 h{last}→h{level}: {text[:30]}")
        last = level

    for ident, n in p.ids.items():
        if n > 1:
            issues.append(f"重复 id: {ident} ×{n}")

    for img in p.images:
        src = img.get("src", "")
        if not src:
            issues.append("img 缺少 src")
        elif not (path.parent / src).exists():
            issues.append(f"img 文件不存在: {src}")
        if "alt" not in img:
            issues.append(f"img 缺少 alt: {src[:60]}")
        if src.lower().endswith(".svg") and ("width" not in img or "height" not in img):
            issues.append(f"内容图缺少 width/height: {src[-50:]}")

    for b in p.buttons:
        if not b.get("type"):
            issues.append("button 缺少 type")

    for inp in p.inputs:
        wrapped = inp.get("wrapped") and inp.get("type") in ("checkbox", "radio")
        if not wrapped and not (inp.get("aria-label") or inp.get("id") or inp.get("name")):
            issues.append(f"{inp['tag']} 缺少可访问名称")

    for t in p.tables:
        if not t["has_th"]:
            issues.append("table 没有任何 th")

    for a in p.links:
        href = a.get("href")
        if href is None:
            issues.append("a 缺少 href")
        elif href.strip() in ("", "#"):
            issues.append("空链接 href")

    for s in p.scripts:
        src = s.get("src", "")
        if src.startswith(("http://", "https://", "//")):
            issues.append(f"外部脚本: {src}")
        if src and not (path.parent / src).exists():
            issues.append(f"脚本不存在: {src}")
    for st in p.styles:
        href = st.get("href", "")
        if href.startswith(("http://", "https://", "//")):
            issues.append(f"外部样式: {href}")
        if href and not (path.parent / href).exists():
            issues.append(f"样式不存在: {href}")

    if "__EXPECTED_" in raw:
        issues.append("残留 __EXPECTED_ 占位")
    for pat in ("TODO", "FIXME", "lorem ipsum"):
        if pat.lower() in raw.lower():
            issues.append(f"残留 {pat}")
    dup_ex = [x for x, n in Counter(p.examples).items() if n > 1]
    for x in dup_ex:
        issues.append(f"重复 data-example: {x}")
    if rel.startswith("chapters/"):
        steps = raw.count('class="ex-steps"')
        if steps < 2:
            issues.append(f"单步数据 {steps} 个，低于每章 2 个的写作规范")

    return {
        "page": rel,
        "issues": issues,
        "headings": len(p.headings),
        "images": len(p.images),
        "examples": len(p.examples),
        "figures": p.figures,
    }


def audit_assets() -> list[str]:
    issues: list[str] = []
    for f in sorted((ROOT / "assets" / "js").rglob("*.js")):
        txt = f.read_text(encoding="utf-8")
        rel = f.relative_to(ROOT).as_posix()
        for pat in ("console.log(", "TODO", "FIXME", "debugger"):
            if pat in txt:
                issues.append(f"{rel}: 残留 {pat}")
    return issues


def main() -> int:
    rows = [audit(p) for p in PAGES]
    bad = [r for r in rows if r["issues"]]
    print(json.dumps({
        "pages": len(rows),
        "pages_with_issues": len(bad),
        "issues": bad,
        "asset_issues": audit_assets(),
    }, ensure_ascii=False, indent=2))
    return 0 if not bad else 1


if __name__ == "__main__":
    sys.exit(main())
