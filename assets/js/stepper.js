/* ============================================================
 * stepper.js — two engines in one file:
 *  1) .ex-steps  : line-by-line stepper for example cards
 *  2) .explainer : frame engines (vector / dataframe / pipeline /
 *                  plot-grammar / stats / matrix / timeline)
 * Both pause by default, are keyboard reachable, and jump to the
 * last frame when printing. No auto-play on load.
 * ============================================================ */
(function () {
  "use strict";
  var B = window.BIOR;
  var esc = B.escapeHtml;
  var PLAY_MS = 1500;

  /* ---------------- shared control bar ---------------- */
  function buildControls(host, total, onChange, label) {
    var bar = document.createElement("div");
    bar.className = "stepper";
    bar.setAttribute("role", "group");
    bar.setAttribute("aria-label", label || "单步控制");

    var lab = document.createElement("span");
    lab.className = "st-label";
    lab.textContent = label || "单步";
    var count = document.createElement("span");
    count.className = "st-count";
    var btns = document.createElement("span");
    btns.className = "st-btns";

    var idx = 0, timer = null;
    var bReset = mk("⟲", "回到第一帧", function () { stop(); go(0); });
    var bPrev  = mk("‹", "上一帧", function () { stop(); go(idx - 1); });
    var bPlay  = mk("▶", "播放", function () { togglePlay(); });
    var bNext  = mk("›", "下一帧", function () { stop(); go(idx + 1); });
    var bLast  = mk("⏭", "跳到末帧", function () { stop(); go(total - 1); });
    [bReset, bPrev, bPlay, bNext, bLast].forEach(function (b) { btns.appendChild(b); });
    bar.appendChild(lab); bar.appendChild(count); bar.appendChild(btns);
    host.appendChild(bar);

    function mk(txt, title, fn) {
      var b = document.createElement("button");
      b.type = "button"; b.textContent = txt; b.title = title;
      b.setAttribute("aria-label", title);
      b.addEventListener("click", fn);
      return b;
    }
    function stop() {
      if (timer) { clearInterval(timer); timer = null; bPlay.textContent = "▶"; bPlay.title = "播放"; }
    }
    function togglePlay() {
      if (timer) { stop(); return; }
      if (idx >= total - 1) go(0);
      bPlay.textContent = "⏸"; bPlay.title = "暂停";
      timer = setInterval(function () {
        if (idx >= total - 1) { stop(); return; }
        go(idx + 1);
      }, PLAY_MS);
    }
    function go(i) {
      idx = Math.max(0, Math.min(total - 1, i));
      count.textContent = (idx + 1) + " / " + total;
      bPrev.disabled = idx === 0;
      bNext.disabled = idx === total - 1;
      onChange(idx);
    }
    go(0);
    return {
      go: function (i) { stop(); go(i); },
      last: function () { stop(); go(total - 1); },
      restore: function (i) { go(i); },
      index: function () { return idx; }
    };
  }

  /* ---------------- 1) example-card stepper ---------------- */
  function initExSteps(card) {
    var script = card.querySelector("script.ex-steps");
    if (!script) return;
    var data;
    try { data = JSON.parse(script.textContent); } catch (e) {
      if (window.console) console.warn("bad ex-steps JSON in", card.id, e); return;
    }
    var steps = (data && data.steps) || [];
    if (!steps.length) return;

    var box = document.createElement("div");
    box.className = "vars-box";
    var note = document.createElement("p");
    note.className = "vars-note";
    box.appendChild(note);
    var outLine = document.createElement("p");
    outLine.className = "vars-out";
    outLine.style.cssText = "font-family:var(--bio-mono);font-size:.78rem;color:var(--bio-code-muted);margin:0 0 6px;white-space:pre-wrap;";
    box.appendChild(outLine);
    var table = document.createElement("table");
    table.className = "vars-table";
    box.appendChild(table);

    var anchor = card.querySelector(".ex-output") || card.querySelector(".listing") || card.querySelector(".ex-head");
    anchor.insertAdjacentElement("afterend", box);

    var lines = card.querySelectorAll(".cl");
    function render(i) {
      var s = steps[i];
      lines.forEach(function (ln) {
        var no = parseInt(ln.getAttribute("data-line"), 10);
        ln.classList.toggle("is-current", no === s.line);
      });
      note.innerHTML = "<b>第 " + s.line + " 行</b> · " + esc(s.note || "");
      outLine.textContent = s.out ? "> " + s.out : "";
      var keys = Object.keys(s.vars || {});
      table.innerHTML = "";
      if (keys.length) {
        var cap = document.createElement("caption");
        cap.textContent = "variables";
        table.appendChild(cap);
        var tr = document.createElement("tr");
        keys.forEach(function (k) {
          var td1 = document.createElement("td");
          td1.innerHTML = "<b>" + esc(k) + "</b> = " + esc(String(s.vars[k]));
          tr.appendChild(td1);
        });
        table.appendChild(tr);
        table.style.display = "";
      } else {
        table.style.display = "none";
      }
    }
    var ctrl = buildControls(box, steps.length, render, "逐行讲解");
    // buildControls appended its bar as last child; keep DOM order: bar above content
    box.insertBefore(box.querySelector(".stepper"), box.firstChild);

    // show/hide via listing 单步 button
    var handler = function (ev) {
      if (ev.detail && ev.detail.example && card.id && ev.detail.example !== card.id) return;
      box.hidden = !box.hidden;
    };
    box.hidden = true;
    document.addEventListener("bior:toggle-steps", handler);

    // print: last frame
    var saved = 0;
    window.addEventListener("beforeprint", function () { saved = ctrl.index(); ctrl.last(); });
    window.addEventListener("afterprint", function () { ctrl.restore(saved); });
  }

  /* ---------------- 2) explainer engines ---------------- */
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function renderVector(f) {
    var w = el("div", "vec-cells");
    (f.cells || []).forEach(function (c) {
      var cell = el("div", "vec-cell" + (c.state ? " " + c.state : ""));
      cell.appendChild(el("span", "vc-val", esc(String(c.value))));
      if (c.type) cell.appendChild(el("small", null, esc(c.type)));
      w.appendChild(cell);
    });
    var wrap = el("div");
    wrap.appendChild(w);
    if (f.coerce) wrap.appendChild(el("p", "vec-coerce-note", "↷ " + esc(f.coerce)));
    return wrap;
  }

  function renderDataframe(f) {
    var t = el("table", "df-table");
    var hl = {}, dupe = {};
    (f.highlight || []).forEach(function (i) { hl[i] = 1; });
    (f.dupe || []).forEach(function (i) { dupe[i] = 1; });
    var thead = el("thead");
    var trh = el("tr");
    (f.columns || []).forEach(function (c) {
      var th = el("th", null, esc(c.name) + (c.type ? '<span class="df-type">' + esc(c.type) + "</span>" : ""));
      trh.appendChild(th);
    });
    thead.appendChild(trh); t.appendChild(thead);
    var tbody = el("tbody");
    (f.rows || []).forEach(function (row, ri) {
      var tr = el("tr", (hl[ri] ? "hl " : "") + (dupe[ri] ? "dupe" : ""));
      row.forEach(function (v) { tr.appendChild(el("td", null, esc(String(v)))); });
      tbody.appendChild(tr);
    });
    t.appendChild(tbody);
    return t;
  }

  function renderPipeline(f) {
    var w = el("div", "pipe-stages" + ((f.stages || []).length > 5 ? " scroll" : ""));
    (f.stages || []).forEach(function (s, i) {
      if (i > 0) w.appendChild(el("span", "pipe-arrow", "→"));
      var cls = "pipe-stage" + (i < f.active ? " done" : i === f.active ? " active" : "");
      var st = el("div", cls);
      st.appendChild(el("span", "ps-label", esc(s.label)));
      if (s.rows != null) st.appendChild(el("span", "ps-dim", "<b>" + s.rows + "</b> 行 × <b>" + s.cols + "</b> 列"));
      w.appendChild(st);
    });
    if ((f.stages || []).length > 5) {
      var wrap = el("div", "pipe-wrap");
      wrap.appendChild(w);
      wrap.appendChild(el("p", "pipe-hint", "横向滚动查看全部 " + f.stages.length + " 关"));
      return wrap;
    }
    return w;
  }

  function renderGrammar(f) {
    var w = el("div", "layers-stack");
    (f.layers || []).forEach(function (L) {
      w.appendChild(el("div", "layer-bar" + (L.on ? " on" : ""),
        esc(L.name) + (L.note ? '<span class="lg-note">' + esc(L.note) + "</span>" : "")));
    });
    var wrap = el("div");
    wrap.appendChild(w);
    if (f.preview) wrap.appendChild(el("p", "vars-note", "预览：当前图会" + esc(f.preview)));
    return wrap;
  }

  function renderStats(f) {
    var w = el("div", "stats-plot");
    var groups = f.groups || [];
    var maxV = 0;
    groups.forEach(function (g) { maxV = Math.max(maxV, g.mean + g.sd); });
    if (maxV <= 0) maxV = 1;
    var row = el("div", "stats-groups");
    groups.forEach(function (g) {
      var box = el("div", "stats-g");
      var h = Math.round((g.mean / maxV) * 110);
      var bar = el("div", "sg-bar" + (g.sd ? " err" : ""));
      bar.style.height = h + "px";
      if (g.sd) {
        var up = Math.round((g.sd / maxV) * 110);
        var band = el("span", "sg-iq");
        band.style.top = (h - up) + "px";
        band.style.height = (up * 2) + "px";
        bar.appendChild(band);
        var mean = el("span", "sg-mean");
        mean.style.bottom = "0";
        bar.appendChild(mean);
      }
      box.appendChild(bar);
      box.appendChild(el("span", "sg-cap", "<b>" + esc(g.label) + "</b>n=" + g.n + " · " + g.mean + "±" + g.sd));
      row.appendChild(box);
    });
    w.appendChild(row);
    var v = el("p", "stats-verdict");
    v.innerHTML = (f.p != null ? '<span class="sv-p">p = ' + esc(String(f.p)) + "</span> · " : "") +
      (f.effect ? esc(f.effect) : "");
    w.appendChild(v);
    return w;
  }

  function lerpColor(t) { /* blue-soft -> blue */
    var a = [226, 237, 247], b = [35, 98, 158];
    var r = Math.round(a[0] + (b[0] - a[0]) * t),
        g = Math.round(a[1] + (b[1] - a[1]) * t),
        bl = Math.round(a[2] + (b[2] - a[2]) * t);
    return "rgb(" + r + "," + g + "," + bl + ")";
  }

  function renderMatrix(f) {
    var cells = f.cells || [];
    var w = el("div");
    if (f.mode === "pca") {
      // derive 2D projection via two power iterations on covariance of rows
      var pts = pca2(cells);
      var sc = el("div");
      sc.style.cssText = "position:relative;height:190px;border:1px solid var(--bio-rule);background:var(--bio-surface);border-radius:6px;margin:0 auto;max-width:420px;";
      pts.forEach(function (p, i) {
        var d = el("span");
        d.style.cssText = "position:absolute;width:10px;height:10px;border-radius:50%;background:var(--bio-blue);transform:translate(-50%,-50%);left:" + (8 + p.x * 84) + "%;top:" + (8 + (1 - p.y) * 84) + "%;";
        d.title = (f.rowLabels && f.rowLabels[i]) ? f.rowLabels[i] : String(i);
        sc.appendChild(d);
      });
      w.appendChild(sc);
      w.appendChild(el("p", "mx-axis", "<span>PC1 →</span><span>↑ PC2</span>"));
      return w;
    }
    var g = el("div", "mx-grid");
    var flat = [];
    cells.forEach(function (r) { r.forEach(function (v) { flat.push(v); }); });
    var mn = Math.min.apply(null, flat), mx = Math.max.apply(null, flat);
    var span = (mx - mn) || 1;
    var cols = Math.max.apply(null, cells.map(function (r) { return r.length; }));
    var hasRows = !!(f.rowLabels && f.rowLabels.length);
    g.style.gridTemplateColumns = (hasRows ? "auto " : "") + "repeat(" + cols + ", 1fr)";
    cells.forEach(function (r, ri) {
      if (hasRows) {
        g.appendChild(el("div", "mx-rowlabel", esc(f.rowLabels[ri] || "")));
      }
      r.forEach(function (v, ci) {
        var t = (v - mn) / span;
        var c = el("div", "mx-cell", esc(String(v)));
        c.style.background = lerpColor(t);
        c.style.color = t > 0.55 ? "rgba(255,255,255,.85)" : "rgba(0,0,0,.65)";
        if (f.rowLabels && f.rowLabels[ri]) {
          c.title = f.rowLabels[ri] + (f.colLabels && f.colLabels[ci] ? " · " + f.colLabels[ci] : "");
        }
        g.appendChild(c);
      });
    });
    w.appendChild(g);
    if (f.colLabels) {
      var ax = el("div", "mx-axis");
      ax.style.display = "grid";
      ax.style.gridTemplateColumns = (hasRows ? "auto " : "") + "repeat(" + cols + ", 1fr)";
      ax.style.maxWidth = "520px";
      ax.style.margin = "6px auto 0";
      if (hasRows) ax.appendChild(el("span"));
      f.colLabels.forEach(function (s) {
        var sp = el("span", null, esc(s));
        sp.style.textAlign = "center";
        ax.appendChild(sp);
      });
      w.appendChild(ax);
    }
    return w;
  }

  function pca2(cells) {
    var n = cells.length, m = cells[0].length;
    var mu = new Array(m).fill(0);
    cells.forEach(function (r) { for (var j = 0; j < m; j++) mu[j] += r[j] / n; });
    var X = cells.map(function (r) { return r.map(function (v, j) { return v - mu[j]; }); });
    // rough top-2 projection via power iteration on X'X (display only)
    function powIter(seed, ortho) {
      var d = seed.slice();
      for (var it = 0; it < 12; it++) {
        var nd = new Array(m).fill(0);
        for (var i = 0; i < n; i++) {
          var dot = 0;
          for (var j = 0; j < m; j++) dot += X[i][j] * d[j];
          for (var j2 = 0; j2 < m; j2++) nd[j2] += X[i][j2] * dot;
        }
        if (ortho) {
          var pr = 0;
          for (var j3 = 0; j3 < m; j3++) pr += nd[j3] * ortho[j3];
          for (var j4 = 0; j4 < m; j4++) nd[j4] -= pr * ortho[j4];
        }
        var norm = Math.sqrt(nd.reduce(function (a, v) { return a + v * v; }, 0));
        if (!norm) return d;
        d = nd.map(function (v) { return v / norm; });
      }
      return d;
    }
    var seed1 = new Array(m).fill(1 / Math.sqrt(m));
    var d1 = powIter(seed1, null);
    var seed2 = new Array(m).fill(0); seed2[0] = 1;
    var d2 = powIter(seed2, d1);
    function scores(d) {
      return X.map(function (r) { return r.reduce(function (a, v, j) { return a + v * d[j]; }, 0); });
    }
    var s0 = scores(d1), s1 = scores(d2);
    var mm = function (a) { var lo = Math.min.apply(null, a), hi = Math.max.apply(null, a); return [lo, hi - lo || 1]; };
    var r0 = mm(s0), r1 = mm(s1);
    return s0.map(function (v, i) {
      return { x: (v - r0[0]) / r0[1], y: (s1[i] - r1[0]) / r1[1] };
    });
  }

  function renderTimeline(f) {
    var w = el("div", "tl-lanes");
    var subjects = f.subjects || [];
    var tMax = f.tMax || 0;
    subjects.forEach(function (s) {
      (s.events || []).forEach(function (e) { tMax = Math.max(tMax, e.t || 0); });
    });
    if (!tMax) tMax = 1;
    subjects.forEach(function (s) {
      var lane = el("div", "tl-lane");
      lane.appendChild(el("span", "tl-id", esc(s.id)));
      var track = el("div", "tl-track");
      var start = null, end = null;
      (s.events || []).forEach(function (e) {
        var pct = (e.t / tMax) * 100;
        if (e.type === "start") start = e.t;
        else if (e.type === "end" || e.type === "censor") {
          if (start != null) {
            var seg = el("span", "tl-seg" + (e.type === "censor" ? " censored" : ""));
            seg.style.left = (start / tMax) * 100 + "%";
            seg.style.width = Math.max(0.5, pct - (start / tMax) * 100) + "%";
            track.appendChild(seg);
          }
          var mk = el("span", "tl-mark" + (e.type === "censor" ? " censor-mark" : ""));
          mk.style.left = pct + "%";
          if (e.label) mk.title = e.label;
          track.appendChild(mk);
        } else {
          var ev = el("span", "tl-mark");
          ev.style.left = pct + "%";
          if (e.label) ev.title = e.label;
          track.appendChild(ev);
        }
      });
      lane.appendChild(track);
      w.appendChild(lane);
    });
    w.appendChild(el("div", "tl-axis", "<span>0</span><span>" + tMax + (f.unit || " d") + "</span>"));
    return w;
  }

  /* anatomy — a figure with one highlighted region per frame;
     frames: [{ src, alt, box: [x,y,w,h] in %, note }] */
  function renderAnatomy(f) {
    var wrap = el("div", "anatomy");
    var fig = el("div", "anatomy-fig");
    var img = document.createElement("img");
    img.src = f.src;
    img.alt = f.alt || "";
    fig.appendChild(img);
    if (f.box && f.box.length === 4) {
      var b = el("span", "anatomy-box");
      b.style.left = f.box[0] + "%";
      b.style.top = f.box[1] + "%";
      b.style.width = f.box[2] + "%";
      b.style.height = f.box[3] + "%";
      fig.appendChild(b);
    }
    wrap.appendChild(fig);
    return wrap;
  }

  var ENGINES = {
    "vector": renderVector,
    "dataframe": renderDataframe,
    "pipeline": renderPipeline,
    "plot-grammar": renderGrammar,
    "stats": renderStats,
    "matrix": renderMatrix,
    "timeline": renderTimeline,
    "anatomy": renderAnatomy
  };

  function initExplainer(box) {
    var dataEl = box.querySelector(".explainer-data");
    if (!dataEl) return;
    var data;
    try { data = JSON.parse(dataEl.textContent); } catch (e) {
      if (window.console) console.warn("bad explainer JSON", e); return;
    }
    var engine = box.getAttribute("data-engine") || "pipeline";
    var render = ENGINES[engine];
    if (!render) return;
    var frames = data.frames || [];
    if (!frames.length) return;

    var head = el("div", "explainer-head");
    head.appendChild(el("span", "kicker", "EXPLAINER · " + engine.toUpperCase()));
    head.appendChild(el("p", "ex-question", esc(data.question || "")));
    var stage = el("div", "explainer-stage");
    var noteEl = el("p", "vars-note");
    noteEl.style.margin = "10px 0 0";
    var body = el("div", "explainer-body");
    body.appendChild(stage); body.appendChild(noteEl);
    box.appendChild(head); box.appendChild(body);

    var ctrl = buildControls(body, frames.length, function (i) {
      stage.innerHTML = "";
      stage.appendChild(render(frames[i]));
      noteEl.innerHTML = frames[i].note ? esc(frames[i].note) : "";
    }, "讲解");
    // move bar above stage
    box.insertBefore(body.querySelector(".stepper"), body);

    var saved = 0;
    window.addEventListener("beforeprint", function () { saved = ctrl.index(); ctrl.last(); });
    window.addEventListener("afterprint", function () { ctrl.restore(saved); });
  }

  function init() {
    document.querySelectorAll(".example-card").forEach(initExSteps);
    document.querySelectorAll(".explainer").forEach(initExplainer);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
