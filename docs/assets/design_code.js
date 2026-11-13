/* Toledo add-ons — vanilla JS, no dependencies.
   Each add-on is opt-in by markup, idempotent, and safe to call again
   (Zensical instant navigation re-runs it through document$).
   Motion is skipped under prefers-reduced-motion. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;
  root.classList.add("tm-js");

  function css(name) {
    return getComputedStyle(document.body || root).getPropertyValue(name).trim();
  }
  // Light theme only: no toggle, no dark palette.
  root.setAttribute("data-theme", "light");

  /* ── nav: .tm-nav gets .is-scrolled, a progress bar, and scroll-spy ─ */
  function nav() {
    var el = document.querySelector(".tm-nav:not([data-tm-bound])");
    if (!el) return;
    el.setAttribute("data-tm-bound", "");
    var bar = el.querySelector(".tm-nav__progress");
    var links = Array.prototype.slice.call(el.querySelectorAll(".tm-nav__links a"));
    var scroller = el.closest("[data-tm-scroller]") || window;
    function metrics() {
      if (scroller === window) return { y: window.scrollY, max: document.documentElement.scrollHeight - innerHeight };
      return { y: scroller.scrollTop, max: scroller.scrollHeight - scroller.clientHeight };
    }
    // a.hash, not the href attribute: Zensical rewrites "#papers" into an absolute URL
    links = links.filter(function (a) { return a.hash; });
    var targets = links.map(function (a) { return document.getElementById(decodeURIComponent(a.hash.slice(1))); });
    var ticking = false;
    function update() {
      ticking = false;
      var m = metrics();
      el.classList.toggle("is-scrolled", m.y > 24);
      if (bar) bar.style.setProperty("--tm-progress", m.max > 0 ? Math.min(1, m.y / m.max) : 0);
      // scroll-spy: the last section whose top has passed 40% of the view
      var view = scroller === window ? { top: 0, h: innerHeight } : { top: scroller.getBoundingClientRect().top, h: scroller.clientHeight };
      var line = view.top + view.h * 0.4, active = -1;
      targets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top <= line) active = i; });
      if (m.max > 0 && m.y >= m.max - 2) active = targets.length - 1; // bottom of page: last link
      links.forEach(function (a, i) {
        a.classList.toggle("is-active", i === active);
        if (i === active) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current");
      });
    }
    (scroller === window ? window : scroller).addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ── reveal: .tm-reveal fades up once on entering the viewport ────── */
  function reveal() {
    var els = document.querySelectorAll(".tm-reveal:not(.is-in)");
    if (reduce || !("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("is-in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (e) {
      var sibs = e.parentElement ? e.parentElement.querySelectorAll(":scope > .tm-reveal") : [];
      e.style.setProperty("--tm-i", Math.min(6, Array.prototype.indexOf.call(sibs, e)));
      io.observe(e);
    });
  }

  /* ── spotlight: cursor-following tint on .tm-card ─────────────────── */
  function spotlight() {
    if (reduce) return;
    document.querySelectorAll(".tm-card:not([data-tm-spot])").forEach(function (c) {
      c.setAttribute("data-tm-spot", "");
      c.addEventListener("pointermove", function (ev) {
        var r = c.getBoundingClientRect();
        c.style.setProperty("--mx", ev.clientX - r.left + "px");
        c.style.setProperty("--my", ev.clientY - r.top + "px");
      });
    });
  }

  /* ── filter: [data-tm-filter] builds chips from cards' data-tags ──── */
  function filter() {
    document.querySelectorAll("[data-tm-filter]:not([data-tm-bound])").forEach(function (box) {
      box.setAttribute("data-tm-bound", "");
      var cards = Array.prototype.slice.call(box.querySelectorAll("[data-tags]"));
      var counts = {}, order = [];
      cards.forEach(function (c) {
        c.getAttribute("data-tags").split(",").forEach(function (t) {
          t = t.trim(); if (!t) return;
          if (!(t in counts)) { counts[t] = 0; order.push(t); }
          counts[t]++;
        });
      });
      var bar = box.querySelector(".tm-chips");
      if (!bar) { bar = document.createElement("div"); bar.className = "tm-chips"; box.insertBefore(bar, box.firstChild); }
      bar.setAttribute("role", "group");
      bar.setAttribute("aria-label", "Filter projects");
      bar.innerHTML = "";
      function chip(label, n, value) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "tm-chip"; b.dataset.filter = value;
        b.setAttribute("aria-pressed", value === "*" ? "true" : "false");
        b.innerHTML = label + ' <span class="tm-chip__count">' + n + "</span>";
        bar.appendChild(b);
      }
      chip("All", cards.length, "*");
      order.forEach(function (t) { chip(t, counts[t], t); });
      bar.addEventListener("click", function (ev) {
        var b = ev.target.closest(".tm-chip"); if (!b) return;
        var v = b.dataset.filter;
        bar.querySelectorAll(".tm-chip").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        cards.forEach(function (c) {
          var tags = c.getAttribute("data-tags").split(",").map(function (s) { return s.trim(); });
          c.classList.toggle("is-hidden", v !== "*" && tags.indexOf(v) < 0);
        });
      });
    });
  }

  /* ── authors: highlight self, collapse long lists ─────────────────── */
  function authors() {
    document.querySelectorAll(".tm-pub__authors:not([data-tm-bound])").forEach(function (p) {
      p.setAttribute("data-tm-bound", "");
      var self = new RegExp(p.closest("[data-tm-self]") ? p.closest("[data-tm-self]").getAttribute("data-tm-self") : "Toledo");
      var names = p.textContent.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
      function esc(s) { return s.replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
      function fmt(list) { return list.map(function (n) { return self.test(n) ? "<mark>" + esc(n) + "</mark>" : esc(n); }).join(", "); }
      var full = fmt(names);
      var limit = 6;
      if (names.length <= limit + 2) { p.innerHTML = full; return; }
      var me = names.findIndex(function (n) { return self.test(n); });
      var keep = names.slice(0, 3);
      var hidden = names.length - 3 - 1 - (me > 2 && me < names.length - 1 ? 1 : 0);
      var shortHtml = fmt(keep) + ", … " + (me > 2 && me < names.length - 1 ? fmt([names[me]]) + ", … " : "") + fmt([names[names.length - 1]]);
      p.innerHTML = shortHtml + ' <button type="button" class="tm-pub__more" aria-expanded="false">+' + hidden + " more</button>";
      p.addEventListener("click", function (ev) {
        if (!ev.target.classList.contains("tm-pub__more")) return;
        p.innerHTML = full;
      });
    });
  }

  /* ── field: the hero's living point cloud ─────────────────────────────
     Six soft clusters of points — a nod to an embedding of single cells —
     drift slowly; nearby points link with hairlines; the cursor lights
     the points around it in the accent. */
  function field() {
    document.querySelectorAll("canvas.tm-hero__field:not([data-tm-bound])").forEach(function (cv) {
      cv.setAttribute("data-tm-bound", "");
      var ctx = cv.getContext("2d");
      var W = 0, H = 0, dpr = Math.min(2, window.devicePixelRatio || 1);
      var pts = [], mouse = { x: -9999, y: -9999 };
      var col = {};
      var SCALE = 3;                        // area of the network: 2 = 200% of the original (spread, links, cursor reach)
      var EDGE = 1;                         // edge reach: nodes link up to this multiple of the current distance (1 = as before)
      var NODE = 2;                         // dot size: 1 = original, 2 = kept as now
      var LEVELS = [1, 0.75, 0.5, 0.25, 0.125, 0.065]; // accent strength per point, picked at random
      function readColors() { col = { ink: css("--ink-3"), accent: css("--accent"), line: css("--line") }; }
      function rnd(a, b) { return a + Math.random() * (b - a); }
      function gauss() { return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5; }
      function seed() {
        pts = [];
        var n = Math.round(Math.min(220, (W * H) / 4200));
        var k = 6, centres = [];
        // Clusters live in the right part of the hero so the name reads on plain paper.
        var x0 = W < 760 ? 0.55 : 0.6;
        for (var i = 0; i < k; i++) centres.push({ x: rnd(W * x0, W * 0.95), y: rnd(H * 0.15, H * 0.85), s: rnd(30, W < 760 ? 60 : 90) * SCALE });
        for (var j = 0; j < n; j++) {
          var c = centres[j % k];
          pts.push({ x: c.x + gauss() * c.s, y: c.y + gauss() * c.s, vx: rnd(-0.12, 0.12), vy: rnd(-0.12, 0.12), hx: 0, hy: 0, r: rnd(1, 2.2) * NODE, lv: LEVELS[Math.floor(Math.random() * LEVELS.length)], c: c });
        }
        pts.forEach(function (p) { p.hx = p.x; p.hy = p.y; });
      }
      function size() {
        var r = cv.getBoundingClientRect();
        W = r.width; H = r.height;
        cv.width = W * dpr; cv.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        seed(); draw();
      }
      function draw() {
        ctx.clearRect(0, 0, W, H);
        var dim = W < 760 ? 0.5 : 1; // quieter behind text on phones
        var linkD = 46 * SCALE * EDGE;
        ctx.lineWidth = 1;
        for (var i = 0; i < pts.length; i++) {
          var a = pts[i];
          for (var j = i + 1; j < pts.length; j++) {
            var b = pts[j], dx = a.x - b.x, dy = a.y - b.y, d = dx * dx + dy * dy;
            if (d < linkD * linkD) {
              ctx.globalAlpha = 0.5 * dim * (1 - Math.sqrt(d) / linkD);
              ctx.strokeStyle = col.line; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
            }
          }
        }
        for (var k = 0; k < pts.length; k++) {
          var p = pts[k];
          ctx.globalAlpha = p.lv * dim;
          ctx.fillStyle = col.accent;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      var running = true;
      function step() {
        if (!running) return;
        for (var i = 0; i < pts.length; i++) {
          var p = pts[i];
          p.vx += (p.hx - p.x) * 0.0009 + (Math.random() - 0.5) * 0.02;
          p.vy += (p.hy - p.y) * 0.0009 + (Math.random() - 0.5) * 0.02;
          var dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
          if (d2 < 9000 * SCALE * SCALE) { p.vx += dx / d2 * 2.2 * SCALE; p.vy += dy / d2 * 2.2 * SCALE; }
          p.vx *= 0.97; p.vy *= 0.97;
          p.x += p.vx; p.y += p.vy;
        }
        draw();
        requestAnimationFrame(step);
      }
      var host = cv.parentElement;
      host.addEventListener("pointermove", function (e) { var r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; if (reduce) draw(); });
      host.addEventListener("pointerleave", function () { mouse.x = mouse.y = -9999; if (reduce) draw(); });
      readColors(); size();
      if ("ResizeObserver" in window) new ResizeObserver(function () { if (Math.abs(cv.getBoundingClientRect().width - W) > 2) size(); }).observe(cv);
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (es) {
          var vis = es[0].isIntersecting;
          if (vis && !running && !reduce) { running = true; step(); }
          if (!vis) running = false;
        }).observe(cv);
      }
      if (!reduce) step(); else running = false;
    });
  }

  function init() { nav(); filter(); authors(); spotlight(); reveal(); field(); }
  window.Toledo = { init: init };

  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(init); // Zensical / Material instant navigation
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
