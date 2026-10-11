/* MIZAN site interactions. No dependencies. */
(function () {
  "use strict";
  document.documentElement.classList.remove("js-off");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------------------------------------------------------- mobile nav */
  var toggle = $(".nav__toggle"), links = $("#nav-links");
  if (toggle && links) {
    var close = function () { toggle.setAttribute("aria-expanded", "false"); links.classList.remove("is-open"); };
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open));
      links.classList.toggle("is-open", open);
      if (open) { var f = links.querySelector("a"); if (f) f.focus(); }
    });
    links.addEventListener("click", function (e) { if (e.target.closest("a")) close(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") { close(); toggle.focus(); }
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".nav")) close();
    });
  }

  /* scroll spy: mark the section in view */
  if ("IntersectionObserver" in window) {
    var navA = $$(".nav__links a");
    var map = {};
    navA.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var a = map[e.target.id]; if (!a) return;
        if (e.isIntersecting) {
          navA.forEach(function (x) { x.classList.remove("is-here"); x.removeAttribute("aria-current"); });
          a.classList.add("is-here"); a.setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) spy.observe(el); });
  }

  /* ---------------------------------------------------------- hero: frame cells */
  $$(".cells").forEach(function (box) {
    var pat = box.getAttribute("data-pattern"), paused = +box.getAttribute("data-paused");
    var frag = document.createDocumentFragment();
    for (var i = 0; i < pat.length; i++) {
      var c = document.createElement("i");
      c.className = i >= paused ? "pause" : (pat[i] === "1" ? "miss" : "ok");
      frag.appendChild(c);
    }
    box.appendChild(frag);
  });

  /* ---------------------------------------------------------- hero: the switch */
  var sw = $("#mizan-switch"), twin = $("#twin");
  if (sw && twin) {
    var num = $("#on-num"), meta = $("#on-meta"), lab = $(".switch__label", sw), trade = $("#twin-trade");
    var runOn = $("#run-on");
    var cellsOn = $$(".cells i", runOn);
    var timer = null;
    var count = function (from, to, ms) {
      if (reduce) { num.textContent = String(to); return; }
      var t0 = performance.now();
      cancelAnimationFrame(timer);
      var step = function (t) {
        var k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3);
        num.textContent = String(Math.round(from + (to - from) * e));
        if (k < 1) timer = requestAnimationFrame(step);
      };
      timer = requestAnimationFrame(step);
    };
    var set = function (on) {
      sw.setAttribute("aria-pressed", String(on));
      twin.classList.toggle("is-on", on);
      runOn.setAttribute("data-state", on ? "on" : "off");
      lab.textContent = on ? "MIZAN is on" : "Switch on MIZAN";
      if (on) {
        count(64, 12, 900);
        meta.textContent = "expected accuracy 90.1\u00a0%";
        $("#pan-l-v").textContent = "12"; $("#pan-r-v").textContent = "90.1\u00a0%";
        trade.innerHTML = "MIZAN: <strong>12</strong> missed deadlines against 64, for <strong>0.6 points</strong> of expected accuracy (90.7\u00a0% to 90.1\u00a0%).";
        if (!reduce) cellsOn.forEach(function (c, i) { c.style.transitionDelay = (i * 6) + "ms"; });
      } else {
        cancelAnimationFrame(timer);
        num.textContent = "?";
        meta.textContent = "Switch on MIZAN to compare";
        $("#pan-l-v").textContent = "64"; $("#pan-r-v").textContent = "90.7\u00a0%";
        trade.innerHTML = "The trade: 52 fewer missed deadlines for <strong>0.6 points</strong> of expected accuracy (90.7\u00a0% to 90.1\u00a0%).";
        cellsOn.forEach(function (c) { c.style.transitionDelay = "0ms"; });
      }
    };
    sw.addEventListener("click", function () {
      var on = sw.getAttribute("aria-pressed") !== "true";
      set(on);
      if (on && window.innerWidth < 980) {
        var r = twin.getBoundingClientRect();
        if (r.top > window.innerHeight * 0.55) twin.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      }
    });
  }

  /* ---------------------------------------------------------- evidence ledger filter */
  var chips = $$(".filter .chip");
  chips.forEach(function (b) {
    b.addEventListener("click", function () {
      var f = b.getAttribute("data-filter");
      chips.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      $$(".ledger__t tbody tr").forEach(function (tr) {
        tr.hidden = !(f === "all" || tr.getAttribute("data-ev") === f);
      });
    });
  });

  /* ---------------------------------------------------------- video chapters */
  var vid = $("#demo-video");
  if (vid) {
    var last = $("#last-src"), err = $("#player-err");
    if (last && err) last.addEventListener("error", function () { err.hidden = false; });
    var chBtns = $$(".chapters button");
    chBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var t = parseFloat(b.getAttribute("data-t"));
        var go = function () { try { vid.currentTime = t; } catch (e) {} var p = vid.play(); if (p && p.catch) p.catch(function () {}); };
        if (vid.readyState >= 1) go();
        else { vid.preload = "metadata"; vid.addEventListener("loadedmetadata", go, { once: true }); vid.load(); }
      });
    });
    vid.addEventListener("timeupdate", function () {
      var t = vid.currentTime, cur = null;
      chBtns.forEach(function (b) { if (parseFloat(b.getAttribute("data-t")) <= t + 0.05) cur = b; });
      chBtns.forEach(function (b) { b.classList.toggle("is-now", b === cur); });
    });
  }

  /* ---------------------------------------------------------- poster viewer */
  var stage = $("#pv-stage"), img = $("#pv-img");
  if (stage && img) {
    var level = $("#pv-level"), desc = $("#pv-desc");
    var secBtns = $$(".pv__sec");
    var S = { s: 1, x: 0, y: 0, fit: 1 };
    var hiLoaded = false;
    var IW = 1589, IH = 2246; // natural size of the preview; hi-res keeps the same aspect

    var dims = function () { return { w: stage.clientWidth, h: stage.clientHeight }; };
    var fitScale = function () { var d = dims(); return Math.min(d.w / IW, d.h / IH); };
    var clamp = function () {
      var d = dims(), w = IW * S.s, h = IH * S.s;
      S.x = w <= d.w ? (d.w - w) / 2 : Math.min(0, Math.max(d.w - w, S.x));
      S.y = h <= d.h ? (d.h - h) / 2 : Math.min(0, Math.max(d.h - h, S.y));
    };
    var apply = function (anim) {
      clamp();
      stage.classList.toggle("no-anim", !anim || reduce);
      img.style.width = IW + "px"; img.style.height = IH + "px";
      img.style.transform = "translate(" + S.x + "px," + S.y + "px) scale(" + S.s + ")";
      var pct = Math.round(S.s / S.fit * 100);
      level.textContent = pct + " %";
      stage.classList.toggle("is-zoomed", pct > 101);
      if (!hiLoaded && pct > 140) {
        hiLoaded = true;
        var hi = new Image();
        hi.onload = function () { img.src = hi.src; };
        hi.src = img.getAttribute("data-hi");
      }
    };
    var zoomAt = function (factor, cx, cy, anim) {
      var d = dims();
      if (cx == null) { cx = d.w / 2; cy = d.h / 2; }
      var ns = Math.max(S.fit, Math.min(S.fit * 8, S.s * factor));
      S.x = cx - (cx - S.x) * (ns / S.s);
      S.y = cy - (cy - S.y) * (ns / S.s);
      S.s = ns; apply(anim);
    };
    var show = function (r, anim) { // r = [x, y, w, h] as fractions of the poster
      var d = dims();
      var s = Math.min(d.w / (r[2] * IW), d.h / (r[3] * IH));
      s = Math.max(S.fit, Math.min(S.fit * 8, s * 0.97));
      S.s = s;
      S.x = d.w / 2 - (r[0] + r[2] / 2) * IW * s;
      S.y = d.h / 2 - (r[1] + r[3] / 2) * IH * s;
      apply(anim);
    };
    var current = [0, 0, 1, 1];
    var init = function () { S.fit = fitScale(); show(current, false); };

    secBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        secBtns.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        current = b.getAttribute("data-r").split(",").map(Number);
        desc.textContent = b.getAttribute("data-d");
        show(current, true);
      });
    });
    $$(".pv__zoom button").forEach(function (b) {
      b.addEventListener("click", function () {
        var z = b.getAttribute("data-z");
        if (z === "in") zoomAt(1.4, null, null, true);
        else if (z === "out") zoomAt(1 / 1.4, null, null, true);
        else { secBtns[0].click(); }
      });
    });
    stage.addEventListener("keydown", function (e) {
      var step = 60, used = true;
      if (e.key === "ArrowLeft") S.x += step;
      else if (e.key === "ArrowRight") S.x -= step;
      else if (e.key === "ArrowUp") S.y += step;
      else if (e.key === "ArrowDown") S.y -= step;
      else if (e.key === "+" || e.key === "=") { zoomAt(1.4, null, null, true); e.preventDefault(); return; }
      else if (e.key === "-" || e.key === "_") { zoomAt(1 / 1.4, null, null, true); e.preventDefault(); return; }
      else if (e.key === "0") { secBtns[0].click(); e.preventDefault(); return; }
      else used = false;
      if (used) { e.preventDefault(); apply(false); }
    });
    stage.addEventListener("wheel", function (e) {
      if (!(e.ctrlKey || e.metaKey)) return; // keep normal page scrolling; pinch and ctrl+wheel zoom
      e.preventDefault();
      var r = stage.getBoundingClientRect();
      zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - r.left, e.clientY - r.top, false);
    }, { passive: false });

    /* pointer drag and two-finger pinch */
    var pts = {}, last = null, pinch0 = null;
    var count2 = function () { return Object.keys(pts).length; };
    stage.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "touch" && S.s <= S.fit * 1.01 && count2() === 0) {
        pts[e.pointerId] = e; // may become a pinch; single-finger pan is left to page scroll
        return;
      }
      pts[e.pointerId] = e;
      stage.setPointerCapture(e.pointerId);
      stage.classList.add("is-drag");
      last = { x: e.clientX, y: e.clientY };
    });
    stage.addEventListener("pointermove", function (e) {
      if (!pts[e.pointerId]) return;
      pts[e.pointerId] = e;
      var ids = Object.keys(pts);
      if (ids.length === 2) {
        var a = pts[ids[0]], b = pts[ids[1]];
        var dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        var r = stage.getBoundingClientRect();
        var cx = (a.clientX + b.clientX) / 2 - r.left, cy = (a.clientY + b.clientY) / 2 - r.top;
        if (pinch0) zoomAt(dist / pinch0, cx, cy, false);
        pinch0 = dist; last = null;
        stage.classList.add("is-drag");
        return;
      }
      if (!last) return;
      S.x += e.clientX - last.x; S.y += e.clientY - last.y;
      last = { x: e.clientX, y: e.clientY };
      apply(false);
    });
    var end = function (e) {
      delete pts[e.pointerId];
      if (count2() < 2) pinch0 = null;
      if (count2() === 0) { last = null; stage.classList.remove("is-drag"); }
    };
    stage.addEventListener("pointerup", end);
    stage.addEventListener("pointercancel", end);
    stage.addEventListener("dblclick", function (e) {
      var r = stage.getBoundingClientRect();
      zoomAt(1.8, e.clientX - r.left, e.clientY - r.top, true);
    });

    var ro = "ResizeObserver" in window ? new ResizeObserver(function () { init(); }) : null;
    if (ro) ro.observe(stage); else window.addEventListener("resize", init);
    if (img.complete) init(); else img.addEventListener("load", init, { once: true });
    init();
  }

  /* ---------------------------------------------------------- copy citation */
  var cb = $("#cite-copy"), bib = $("#cite-bib");
  if (cb && bib) {
    cb.addEventListener("click", function () {
      var txt = bib.textContent;
      var done = function () { cb.textContent = "Copied"; setTimeout(function () { cb.textContent = "Copy BibTeX"; }, 1800); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, function () { fallback(); });
      else fallback();
      function fallback() {
        var r = document.createRange(); r.selectNodeContents(bib);
        var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
        try { document.execCommand("copy"); done(); } catch (e) { cb.textContent = "Selected: press Ctrl+C"; }
      }
    });
  }
})();
