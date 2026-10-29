/* ============================================================
 * progress.js — learning state: chapter completion, mastery,
 * deliverables, last visited. Keys per docs/02 §6.1. All wrapped
 * in try/catch via BIOR.storage; corrupted data resets silently.
 * ============================================================ */
(function () {
  "use strict";
  var B = window.BIOR;

  var K = {
    progress: "bior.progress",
    mastery: "bior.mastery",
    last: "bior.last",
    deliverables: "bior.deliverables",
    checks: "bior.checks"
  };

  function ensure(obj) { return obj && obj.version === 1 ? obj : { version: 1 }; }

  var progress = {
    /* chapters: {ch06: {done:true, at:"ISO"}} */
    chapterDone: function (ch) {
      var p = ensure(B.storage.get(K.progress, null));
      return !!(p.chapters && p.chapters[ch] && p.chapters[ch].done);
    },
    chapterDoneAt: function (ch) {
      var p = ensure(B.storage.get(K.progress, null));
      return p.chapters && p.chapters[ch] ? p.chapters[ch].at : null;
    },
    setChapterDone: function (ch, done) {
      var p = ensure(B.storage.get(K.progress, null));
      p.chapters = p.chapters || {};
      p.chapters[ch] = { done: !!done, at: done ? new Date().toISOString() : null };
      if (!done) delete p.chapters[ch];
      B.storage.set(K.progress, p);
      B.emit("bior:progress", { ch: ch });
    },
    doneList: function () {
      var p = ensure(B.storage.get(K.progress, null));
      return Object.keys(p.chapters || {}).filter(function (k) { return p.chapters[k].done; });
    },

    /* mastery: {items:{"ch02-o1":"know"}} */
    getMastery: function (id) {
      var m = ensure(B.storage.get(K.mastery, null));
      return (m.items && m.items[id]) || null;
    },
    setMastery: function (id, state) {
      var m = ensure(B.storage.get(K.mastery, null));
      m.items = m.items || {};
      if (state) m.items[id] = state; else delete m.items[id];
      B.storage.set(K.mastery, m);
      B.emit("bior:mastery", { id: id, state: state });
    },
    masteryByChapter: function (ch) {
      var m = ensure(B.storage.get(K.mastery, null));
      var out = {};
      Object.keys(m.items || {}).forEach(function (k) {
        if (k.indexOf(ch + "-") === 0) out[k] = m.items[k];
      });
      return out;
    },

    /* deliverables: {items:{ch06:true}} */
    delivDone: function (ch) {
      var d = ensure(B.storage.get(K.deliverables, null));
      return !!(d.items && d.items[ch]);
    },
    setDeliv: function (ch, done) {
      var d = ensure(B.storage.get(K.deliverables, null));
      d.items = d.items || {};
      if (done) d.items[ch] = true; else delete d.items[ch];
      B.storage.set(K.deliverables, d);
      B.emit("bior:deliverables", { ch: ch });
    },

    /* checklist (self-test): {items:{"ch06-c1":true}} */
    getCheck: function (id) {
      var c = ensure(B.storage.get(K.checks, null));
      return !!(c.items && c.items[id]);
    },
    setCheck: function (id, on) {
      var c = ensure(B.storage.get(K.checks, null));
      c.items = c.items || {};
      if (on) c.items[id] = true; else delete c.items[id];
      B.storage.set(K.checks, c);
    },

    /* last visited chapter */
    getLast: function () {
      var v = null;
      try { v = localStorage.getItem(K.last); } catch (e) {}
      return v;
    },
    setLast: function (ch) {
      try { localStorage.setItem(K.last, ch); } catch (e) {}
    },

    resetAll: function () {
      Object.keys(K).forEach(function (k) { B.storage.remove(K[k]); });
      B.emit("bior:progress", { reset: true });
    }
  };

  window.BIOR.progress = progress;
})();
