/* =====================================================================
   WAYFARE · motion layer
   Soft fade between views, hero video reel, lazy video manager, split-text
   and reveal-on-scroll, parallax, pinned horizontal strip, text-mask video,
   marquee, card tilt, magnetic buttons, video montage player and the
   Motion on/off control.

   OS "reduce motion" only disables smooth-scroll hijacking (Lenis). The
   visible Motion button (bottom right) pauses every video and ambient loop.
   ===================================================================== */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const G = window.gsap, ST = window.ScrollTrigger;
  const hasG = !!(G && ST);
  if (hasG) G.registerPlugin(ST);
  const reduceOS = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const pad2 = n => String(n).padStart(2, '0');

  let motionOn = true;
  try { motionOn = localStorage.getItem('wf-motion') !== 'off'; } catch (e) { /* storage blocked */ }

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (hasG && !reduceOS && window.Lenis) {
    lenis = new window.Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 0.95 });
    lenis.on('scroll', ST.update);
    G.ticker.add(t => lenis.raf(t * 1000));
    G.ticker.lagSmoothing(0);
    window.__lenis = lenis;
  }

  /* ---------- video manager ---------- */
  const visibleVids = new Set();
  function playV(v, force) {
    if (!v || (!motionOn && !force)) return;
    const p = v.play();
    if (p && p.catch) p.catch(() => {});
  }
  function makeVidIO() {
    return new IntersectionObserver(entries => entries.forEach(en => {
      const v = en.target;
      if (en.isIntersecting) {
        if (!v.getAttribute('src') && v.dataset.src) { v.preload = 'auto'; v.src = v.dataset.src; }
        visibleVids.add(v); playV(v);
      } else { visibleVids.delete(v); v.pause(); }
    }), { rootMargin: '240px 0px' });
  }
  const globalIO = makeVidIO();
  $$('.site-foot video[data-src]').forEach(v => globalIO.observe(v));
  let vidIO = null;

  function bindHoverVideos(root) {
    if (!fine) return;
    $$('[data-hover-video]', root).forEach(card => {
      if (card._hv) return;
      card._hv = true;
      const v = $('video', card);
      if (!v) return;
      card.addEventListener('pointerenter', () => {
        if (!motionOn) return;
        if (!v.getAttribute('src')) v.src = card.dataset.hoverVideo;
        card.classList.add('is-playing'); playV(v);
      });
      card.addEventListener('pointerleave', () => { card.classList.remove('is-playing'); v.pause(); });
    });
  }

  /* ---------- hero film reel ---------- */
  const hero = { el: null, vids: [], btns: [], cur: 0, elapsed: 0, D: 7.5, visible: true, io: null, num: null };
  function heroPrime(i) {
    const v = hero.vids[i];
    if (v && !v.getAttribute('src') && v.dataset.hsrc) { v.preload = 'auto'; v.src = v.dataset.hsrc; }
  }
  function heroSetup(root) {
    const h = $('[data-hero]', root);
    hero.el = h;
    if (!h) return;
    hero.vids = $$('.hero-vid', h);
    hero.btns = $$('[data-scene]', h);
    hero.num = $('[data-scene-n]', h);
    hero.cur = 0; hero.elapsed = 0; hero.visible = true;
    hero.vids.forEach(v => { v.loop = true; });
    hero.btns.forEach(b => b.addEventListener('click', () => heroShow(+b.dataset.scene)));
    hero.io = new IntersectionObserver(([en]) => { hero.visible = en.isIntersecting; heroSync(); }, { threshold: 0.02 });
    hero.io.observe(h);
    // restart the first clip's Ken Burns move once it is on screen
    const first = hero.vids[0];
    if (first && motionOn) { first.classList.remove('on'); requestAnimationFrame(() => requestAnimationFrame(() => first.classList.add('on'))); }
    heroPrime(1);
    heroSync();
  }
  function heroTeardown() {
    if (hero.io) hero.io.disconnect();
    hero.el = null; hero.vids = []; hero.btns = [];
  }
  function heroShow(i) {
    if (!hero.el) return;
    const n = hero.vids.length;
    i = (i + n) % n;
    const prev = hero.vids[hero.cur], next = hero.vids[i];
    heroPrime(i); heroPrime((i + 1) % n);
    hero.cur = i; hero.elapsed = 0;
    try { next.currentTime = 0; } catch (e) { /* not loaded yet */ }
    next.classList.add('on');
    if (prev && prev !== next) {
      prev.classList.remove('on');
      setTimeout(() => { if (!prev.classList.contains('on')) prev.pause(); }, 1500);
    }
    hero.btns.forEach((b, k) => {
      b.classList.toggle('on', k === i);
      const bar = $('.sbar i', b);
      if (bar) bar.style.transform = k < i ? 'scaleX(1)' : 'scaleX(0)';
    });
    if (hero.num) hero.num.textContent = pad2(i + 1);
    heroSync();
  }
  function heroSync() {
    if (!hero.el) return;
    const v = hero.vids[hero.cur];
    if (motionOn && hero.visible && !film.open) playV(v); else if (v) v.pause();
  }
  function heroTick(dt) {
    if (!hero.el || !motionOn || !hero.visible || film.open) return;
    hero.elapsed += dt;
    const p = Math.min(1, hero.elapsed / hero.D);
    const bar = hero.btns[hero.cur] && $('.sbar i', hero.btns[hero.cur]);
    if (bar) bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    if (p >= 1) heroShow(hero.cur + 1);
  }

  /* ---------- marquee ---------- */
  const mq = { el: null, x: 0, w: 0 };
  function mqSetup(root) { mq.el = $('[data-marquee]', root); mq.x = 0; mq.w = 0; }
  function mqTick(dt) {
    if (!mq.el || !motionOn) return;
    if (!mq.w) mq.w = mq.el.scrollWidth / 2;
    if (!mq.w) return;
    const speed = (60 + Math.min(1400, Math.abs(scroll.vel)) * 0.9) * scroll.dir;
    mq.x -= speed * dt;
    if (mq.x <= -mq.w) mq.x += mq.w;
    if (mq.x > 0) mq.x -= mq.w;
    mq.el.style.transform = 'translate3d(' + mq.x.toFixed(2) + 'px,0,0)';
  }

  /* ---------- split text ---------- */
  function splitText(el) {
    if (el.dataset.splitDone) return;
    el.dataset.splitDone = '1';
    const walk = node => {
      Array.from(node.childNodes).forEach(ch => {
        if (ch.nodeType === 3) {
          const frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach(p => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            const wi = document.createElement('span'); wi.className = 'wi'; wi.textContent = p;
            w.appendChild(wi); frag.appendChild(w);
          });
          ch.replaceWith(frag);
        } else if (ch.nodeType === 1 && ch.tagName !== 'BR' && !ch.classList.contains('w')) walk(ch);
      });
    };
    walk(el);
  }

  /* ---------- intro (plays when a view appears) ---------- */
  function fromIf(tl, targets, vars, pos) {
    const list = Array.isArray(targets) ? targets.filter(Boolean) : (targets ? [targets] : []);
    if (list.length) tl.from(list, vars, pos);
  }
  function buildIntro(root) {
    const tl = G.timeline({ paused: true, defaults: { ease: 'expo.out' } });
    const h = $('[data-hero]', root);
    if (h) {
      fromIf(tl, $('.hero-reel', h), { scale: 1.1, duration: 2.4 }, 0);
      const fades = $$('.hero-in [data-fade]', h);
      fromIf(tl, fades[0], { y: 14, opacity: 0, duration: 0.9 }, 0.15);
      fromIf(tl, $$('.hero-title .wi', h), { yPercent: 105, duration: 1.1, stagger: 0.05 }, 0.25);
      fromIf(tl, fades.slice(1), { y: 24, opacity: 0, duration: 1, stagger: 0.1 }, 0.55);
      fromIf(tl, $$('.hero-foot [data-fade], .scene', h), { y: 16, opacity: 0, duration: 0.9, stagger: 0.06 }, 0.75);
    }
    const b = $('.pbanner', root);
    if (b) {
      fromIf(tl, $('[data-banner-media] > *', b), { scale: 1.1, duration: 2 }, 0);
      fromIf(tl, $('.pb-in .kicker', b), { y: 12, opacity: 0, duration: 0.8 }, 0.05);
      fromIf(tl, $$('.pb-title .wi', b), { yPercent: 105, duration: 1, stagger: 0.045 }, 0.1);
      fromIf(tl, $$('.pb-in [data-fade]', b), { y: 18, opacity: 0, duration: 0.9, stagger: 0.08 }, 0.35);
    }
    return tl;
  }

  /* ---------- scroll choreography ---------- */
  const doneClear = 'transform,opacity';
  function revealScroll(root) {
    $$('[data-split]', root).forEach(el => {
      if (el.closest('[data-hero], .pbanner')) return;
      const words = $$('.wi', el);
      if (words.length) G.from(words, { yPercent: 105, duration: 1.05, ease: 'expo.out', stagger: 0.04, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
    $$('[data-reveal]', root).forEach(el => G.from(el, { y: 40, opacity: 0, duration: 1.1, ease: 'expo.out', clearProps: doneClear, scrollTrigger: { trigger: el, start: 'top 96%', once: true } }));
    $$('[data-stagger]', root).forEach(el => {
      const kids = Array.from(el.children);
      if (kids.length) G.from(kids, { y: 46, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.07, clearProps: doneClear, scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
    });
    $$('.sec-h p, .sec-h .btn, .routes-copy > p, .routes-copy .eyebrow, .branch-copy > p, .branch-copy .eyebrow, .addr, .branch-copy .row, .finale-in .lede, .finale-in .cta-row, .finale-in .kicker, .band-film .kicker, .band-film p, .hs-head .eyebrow, .hs-count, .rev-shell > *, .pd-blurb, .pd-incl', root).forEach(el =>
      G.from(el, { y: 30, opacity: 0, duration: 1.2, ease: 'expo.out', clearProps: doneClear, scrollTrigger: { trigger: el, start: 'top 92%', once: true } }));
    $$('.rrow', root).forEach((el, i) => G.from(el, { x: 40, opacity: 0, duration: 1, delay: i * 0.05, ease: 'expo.out', clearProps: doneClear, scrollTrigger: { trigger: el.closest('.rlist'), start: 'top 88%', once: true } }));
    // media tiles open from a slightly inset frame
    $$('.bt, .bc', root).forEach(el => {
      const m = $('img,video', el);
      const tl = G.timeline({ scrollTrigger: { trigger: el, start: 'top 94%', once: true } });
      tl.fromTo(el, { clipPath: 'inset(8% 6% 8% 6% round 16px)' }, { clipPath: 'inset(0% 0% 0% 0% round 16px)', duration: 1.3, ease: 'expo.out', clearProps: 'clipPath' });
      if (m) tl.from(m, { scale: 1.16, duration: 1.6, ease: 'expo.out' }, 0);
      const caps = $$('.btc, figcaption', el);
      if (caps.length) tl.from(caps, { y: 14, opacity: 0, duration: 0.9, stagger: 0.08 }, 0.3);
    });
    // numbers count up
    $$('[data-count]', root).forEach(el => {
      const raw = el.textContent;
      const m = raw.match(/^(\D*?)(\d[\d,]*(?:\.\d+)?)([\s\S]*)$/);
      if (!m) return;
      const pre = m[1], num = m[2], post = m[3];
      const dec = (num.split('.')[1] || '').length;
      const target = parseFloat(num.replace(/,/g, ''));
      const o = { v: 0 };
      const fmt = v => pre + v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + post;
      el.textContent = fmt(0);
      G.to(o, { v: target, duration: 1.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top bottom', once: true },
        onUpdate: () => { el.textContent = fmt(o.v); }, onComplete: () => { el.textContent = raw; } });
    });
    $$('.fill, .meter i, .ct i', root).forEach(el => G.from(el, { scaleX: 0, duration: 1.5, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top bottom', once: true } }));
    const bars = $$('.chart .cbar path', root);
    if (bars.length) G.from(bars, { scaleY: 0, transformOrigin: '50% 100%', duration: 1.3, ease: 'expo.out', stagger: 0.05, scrollTrigger: { trigger: bars[0].closest('svg'), start: 'top 88%', once: true } });
    $$('.spark .ln', root).forEach(p => {
      const L = p.getTotalLength ? p.getTotalLength() : 200;
      G.fromTo(p, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.out', scrollTrigger: { trigger: p, start: 'top 96%', once: true } });
    });
    $$('[data-typelog]', root).forEach(log => {
      const lines = $$('.ln', log);
      if (lines.length) G.from(lines, { opacity: 0, duration: 0.35, stagger: 0.16, ease: 'none', scrollTrigger: { trigger: log, start: 'top 92%', once: true } });
    });
    $$('.day', root).forEach(d => G.from(d, { x: 36, opacity: 0, duration: 1.1, ease: 'expo.out', clearProps: doneClear, scrollTrigger: { trigger: d, start: 'top 90%', once: true } }));
    const phones = $$('[data-phones] .phone-w', root);
    if (phones.length) G.from(phones, { y: 160, rotationX: 38, opacity: 0, transformPerspective: 1400, duration: 1.8, ease: 'expo.out', stagger: 0.14, clearProps: doneClear, scrollTrigger: { trigger: phones[0].parentElement, start: 'top 88%', once: true } });
    const ticket = $('.ticket', root);
    if (ticket) {
      G.from(ticket, { y: 80, rotationX: 24, opacity: 0, transformPerspective: 1400, duration: 1.6, ease: 'expo.out', delay: 0.15, clearProps: doneClear });
      const stamp = $('.stamp', ticket);
      if (stamp) G.from(stamp, { scale: 2.6, opacity: 0, rotate: -30, duration: 0.7, ease: 'back.out(2)', delay: 1.1 });
    }
  }

  function parallaxIn(root) {
    $$('[data-parallax]', root).forEach(m => G.fromTo(m, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: m.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
    $$('.pc-media img', root).forEach(m => G.fromTo(m, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: m.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
  }

  function ambientScroll(root) {
    parallaxIn(root);
    const h = $('[data-hero]', root);
    if (h) {
      G.to($('.hero-reel', h), { yPercent: 14, ease: 'none', scrollTrigger: { trigger: h, start: 'top top', end: 'bottom top', scrub: true } });
      G.to($('.hero-in', h), { y: -140, opacity: 0, ease: 'none', scrollTrigger: { trigger: h, start: 'top top', end: 'bottom 25%', scrub: true } });
      G.to($('.hero-foot', h), { y: -60, opacity: 0, ease: 'none', scrollTrigger: { trigger: h, start: '30% top', end: 'bottom 40%', scrub: true } });
    }
    const b = $('.pbanner', root);
    if (b) {
      G.to($('[data-banner-media]', b), { yPercent: 18, ease: 'none', scrollTrigger: { trigger: b, start: 'top top', end: 'bottom top', scrub: true } });
      G.to($('.pb-in', b), { y: -60, opacity: 0.15, ease: 'none', scrollTrigger: { trigger: b, start: '25% top', end: 'bottom top', scrub: true } });
    }
    hstrip(root);
    maskfilm(root);
    const itinLine = $('.itin-line', root);
    if (itinLine) G.fromTo(itinLine, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: itinLine.parentElement, start: 'top 75%', end: 'bottom 60%', scrub: true } });
    const finale = $('.finale', root);
    if (finale) G.fromTo($('.finale video', root), { scale: 1.25 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: finale, start: 'top bottom', end: 'center center', scrub: true } });
  }

  function hstrip(root) {
    const sec = $('[data-hstrip]', root);
    if (!sec) return;
    const track = $('[data-hs-track]', sec), cnt = $('[data-hs-n]', sec);
    const cards = $$('.dcard[data-ap]', track);
    if (window.innerWidth < 1025 || !motionOn) { sec.classList.add('is-native'); return; }
    sec.classList.remove('is-native');
    const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const tw = G.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: sec, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: self => { if (cnt) cnt.textContent = pad2(Math.min(cards.length, Math.round(self.progress * (cards.length - 1)) + 1)); }
      }
    });
    cards.forEach(c => {
      const img = $('.dc-media img', c);
      if (img) G.fromTo(img, { xPercent: -7 }, { xPercent: 7, ease: 'none', scrollTrigger: { trigger: c, containerAnimation: tw, start: 'left right', end: 'right left', scrub: true } });
    });
  }

  function maskfilm(root) {
    const sec = $('[data-maskfilm]', root);
    if (!sec) return;
    const mask = $('.mf-mask', sec), cap = $('.mf-cap', sec), txt = $('.mf-mask span', sec), scrim = $('.mf-scrim', sec);
    if (!motionOn) { G.set([cap, scrim], { opacity: 1 }); return; }
    const tl = G.timeline({ scrollTrigger: { trigger: sec, start: 'top top', end: '+=150%', pin: true, scrub: 1 } });
    tl.fromTo(txt, { scale: 0.86 }, { scale: 16, transformOrigin: '57% 52%', ease: 'power2.in', duration: 1 }, 0)
      .to(mask, { opacity: 0, duration: 0.32, ease: 'none' }, 0.6)
      .to(scrim, { opacity: 1, duration: 0.2, ease: 'none' }, 0.7)
      .fromTo(cap, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' }, 0.74);
  }

  function routeArc(root) {
    const svg = $('.pb-route', root);
    if (!svg) return;
    const path = $('[data-draw]', svg), plane = $('[data-plane]', svg);
    if (!path || !path.getTotalLength) return;
    const L = path.getTotalLength();
    path.style.strokeDasharray = L;
    const place = p => {
      const a = path.getPointAtLength(Math.min(L - 0.6, L * p));
      const b = path.getPointAtLength(Math.min(L, L * p + 0.6));
      const ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
      plane.setAttribute('transform', 'translate(' + a.x.toFixed(1) + ' ' + a.y.toFixed(1) + ') rotate(' + (ang + 90).toFixed(1) + ') scale(1.5)');
      path.style.strokeDashoffset = L * (1 - p);
    };
    if (!motionOn) { place(1); return; }
    const o = { p: 0 };
    place(0);
    G.to(o, { p: 1, duration: 5, ease: 'power1.inOut', repeat: -1, repeatDelay: 1.4, delay: 0.6, onUpdate: () => { if (motionOn) place(o.p); } });
  }

  /* ---------- countdown (fare hold) ---------- */
  let timers = [];
  function countdowns(root) {
    $$('[data-countdown]', root).forEach(el => {
      let s = +el.dataset.countdown;
      timers.push(setInterval(() => { s = Math.max(0, s - 1); el.textContent = pad2(Math.floor(s / 60)) + ':' + pad2(s % 60); }, 1000));
    });
  }

  /* ---------- globe hook ---------- */
  function globeMount(root) {
    const stage = $('#globeStage', root);
    if (!stage) return;
    const start = () => { if (window.WayfareGlobe && document.body.contains(stage)) window.WayfareGlobe.mount(stage, { origin: window.WF.state.trip.from }); };
    if (window.WayfareGlobe) start();
    else {
      window.addEventListener('wayfare-globe-ready', start, { once: true });
      setTimeout(() => { if (!window.WayfareGlobe && document.body.contains(stage)) stage.classList.add('is-fallback'); }, 8000);
    }
  }
  document.addEventListener('pointerover', e => {
    const r = e.target.closest && e.target.closest('[data-globe]');
    if (r && window.WayfareGlobe) window.WayfareGlobe.focus(r.dataset.globe);
  });
  document.addEventListener('pointerout', e => {
    const r = e.target.closest && e.target.closest('[data-globe]');
    if (r && window.WayfareGlobe && !(e.relatedTarget && r.contains(e.relatedTarget))) window.WayfareGlobe.focus(null);
  });

  /* ---------- mount / unmount (called by app.js on every render) ---------- */
  let ctx = null, pendingIntro = null, leaderActive = true, cutting = false;
  function mount(root, opts) {
    const instant = !!(opts && opts.instant);
    vidIO = makeVidIO();
    $$('video[data-src]', root).forEach(v => vidIO.observe(v));
    bindHoverVideos(root);
    heroSetup(root);
    mqSetup(root);
    countdowns(root);
    globeMount(root);
    if (!hasG) return;
    $$('[data-split]', root).forEach(splitText);
    ctx = G.context(() => {
      ambientScroll(root);
      routeArc(root);
      if (!instant && motionOn) {
        const intro = buildIntro(root);
        const go = () => {
          intro.play(0);
          if (ctx) ctx.add(() => revealScroll(root));
          ST.refresh();
        };
        if (leaderActive || cutting) pendingIntro = go; else go();
      }
    }, root);
    requestAnimationFrame(() => ST.refresh());
  }
  function playIntro() {
    const f = pendingIntro;
    pendingIntro = null;
    if (f) f();
  }
  function unmount(root) {
    pendingIntro = null;
    if (ctx) { ctx.revert(); ctx = null; }
    if (vidIO) { vidIO.disconnect(); vidIO = null; }
    $$('video', root).forEach(v => {
      visibleVids.delete(v);
      try { v.pause(); v.removeAttribute('src'); v.load(); } catch (e) { /* ignore */ }
    });
    timers.forEach(clearInterval); timers = [];
    heroTeardown();
    mq.el = null;
    if (window.WayfareGlobe) window.WayfareGlobe.destroy();
  }
  function patched(nodes) {
    if (!nodes.length) return;
    if (hasG) ST.getAll().forEach(st => { if (st.trigger && !document.body.contains(st.trigger)) st.kill(); });
    nodes.forEach(n => {
      if (vidIO) $$('video[data-src]', n).forEach(v => vidIO.observe(v));
      bindHoverVideos(n);
      if (hasG && ctx) ctx.add(() => parallaxIn(n));
      if (hasG && motionOn && n.dataset.patch === 'body') G.fromTo(n, { opacity: 0.4 }, { opacity: 1, duration: 0.45, ease: 'power2.out', clearProps: 'opacity' });
    });
  }
  function afterPatch() {
    if (window.WayfareGlobe && window.WF) window.WayfareGlobe.setOrigin(window.WF.state.trip.from);
    syncInk();
    if (hasG) ST.refresh();
  }

  /* ---------- view change: quick fade out, swap, fade in ---------- */
  function cut(label, n, fn) {
    const view = $('#view');
    if (!hasG || !motionOn || cutting || !view) { fn(); return; }
    cutting = true;
    if (lenis) lenis.stop();
    G.to(view, {
      opacity: 0, duration: 0.2, ease: 'power2.in',
      onComplete: () => {
        try { fn(); } catch (err) { console.error(err); }
        G.fromTo(view, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out', clearProps: 'opacity' });
        cutting = false;
        if (lenis) lenis.start();
        playIntro();
      }
    });
  }

  /* ---------- first paint: no preloader, the page intro plays straight away ---------- */
  function runLeader() {
    leaderActive = false;
    document.body.classList.remove('is-loading');
    playIntro();
  }

  /* ---------- film montage ---------- */
  const FILM = [
    { v: 'hero-clouds', t: 'Above the clouds', s: 'Every journey starts at cruising altitude. Toronto to London, 7h 10m nonstop.' },
    { v: 'hero-ocean', t: 'Turquoise silence', s: 'Bali, Phi Phi and Cancún. Island packages with the speedboats already booked.' },
    { v: 'desert', t: 'Golden dunes', s: 'Desert evenings, built into Dubai Desert & Skyline from day three.' },
    { v: 'canada-night', t: 'Niagara, in full colour', s: 'Ontario’s own wonder, about an hour and a half from the Brampton branch.' },
    { v: 'hero-alps', t: 'Alpine light', s: 'Glacier Express seats reserved six weeks ahead, not queued for.' },
    { v: 'resort', t: 'Still water', s: 'Hotelbeds and TBO, deduplicated so the same room never shows twice.' },
    { v: 'canada', t: 'Closer to home', s: 'Serviced from the Four Corners, downtown Brampton. Seven days a week.' },
    { v: 'takeoff', t: 'Last light', s: 'Four sources. One search. Held for twenty minutes while you decide.' }
  ];
  const film = { open: false, i: 0, t: 0, D: 6.5, el: null, vid: null, bars: [] };
  function openFilm() {
    film.el = $('#film'); film.vid = $('#filmVid');
    if (!film.el || !film.vid) return;
    const barsBox = $('#filmBars');
    barsBox.innerHTML = FILM.map(() => '<i><b></b></i>').join('');
    film.bars = $$('#filmBars b');
    film.el.hidden = false; film.open = true;
    if (lenis) lenis.stop();
    document.body.style.overflow = 'hidden';
    heroSync();
    filmShow(0);
    if (hasG) G.fromTo(film.el, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out' });
    const c = $('[data-film-close]'); if (c) c.focus();
  }
  function closeFilm() {
    if (!film.open) return;
    film.open = false;
    film.vid.pause();
    film.el.hidden = true;
    document.body.style.overflow = '';
    if (lenis) lenis.start();
    heroSync();
  }
  function filmShow(i) {
    film.i = (i + FILM.length) % FILM.length;
    film.t = 0;
    const c = FILM[film.i];
    film.vid.poster = 'assets/video/' + c.v + '.jpg';
    film.vid.src = 'assets/video/' + c.v + '.mp4';
    playV(film.vid, true);
    film.bars.forEach((b, k) => { b.style.transform = k < film.i ? 'scaleX(1)' : 'scaleX(0)'; });
    $('#filmK').textContent = 'CHAPTER ' + pad2(film.i + 1) + ' / ' + pad2(FILM.length);
    $('#filmT').textContent = c.t;
    $('#filmS').textContent = c.s;
    if (hasG) G.fromTo('.film-cap > *', { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.08, ease: 'expo.out' });
  }
  function filmTick(dt) {
    if (!film.open) return;
    film.t += dt;
    const p = Math.min(1, film.t / film.D);
    const b = film.bars[film.i];
    if (b) b.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    if (p >= 1) filmShow(film.i + 1);
  }
  document.addEventListener('click', e => {
    if (e.target.closest('[data-film-open]')) { e.preventDefault(); openFilm(); return; }
    if (e.target.closest('[data-film-close]')) { closeFilm(); return; }
    if (film.open && e.target.closest('.film-frame')) filmShow(film.i + 1);
  });
  document.addEventListener('keydown', e => {
    if (!film.open) return;
    if (e.key === 'Escape') closeFilm();
    if (e.key === 'ArrowRight') filmShow(film.i + 1);
    if (e.key === 'ArrowLeft') filmShow(film.i - 1);
  });

  /* ---------- header, progress, scroll velocity ---------- */
  const chrome = $('#chrome'), progressBar = $('#progressBar');
  const scroll = { y: window.scrollY, vel: 0, dir: 1 };
  function onScroll() {
    const y = window.scrollY, dy = y - scroll.y;
    scroll.y = y;
    if (dy) { scroll.vel = scroll.vel * 0.5 + dy * 30; scroll.dir = dy > 0 ? 1 : -1; }
    if (chrome) {
      chrome.classList.toggle('is-solid', y > 40);
      if (y < 240 || dy < -3) chrome.classList.remove('is-hidden');
      else if (dy > 3) chrome.classList.add('is-hidden');
    }
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar) progressBar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0).toFixed(4) + ')';
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- card tilt + magnetic buttons (fine pointers only) ---------- */
  let tiltEl = null, magEl = null;
  const resetTilt = t => { ['--rx', '--ry'].forEach(p => t.style.setProperty(p, '0deg')); };
  if (fine) {
    document.addEventListener('pointermove', e => {
      const tgt = e.target.closest ? e.target : null;
      if (!motionOn) return;
      const t = tgt && tgt.closest('[data-tilt]');
      if (tiltEl && tiltEl !== t) resetTilt(tiltEl);
      tiltEl = t;
      if (t) {
        const r = t.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        const max = +t.dataset.tilt || 3;
        t.style.setProperty('--ry', ((px - 0.5) * 2 * max).toFixed(2) + 'deg');
        t.style.setProperty('--rx', ((0.5 - py) * 2 * max).toFixed(2) + 'deg');
        t.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
        t.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
      }
      const m = tgt && tgt.closest('[data-magnetic]');
      if (magEl && magEl !== m) magEl.style.transform = '';
      magEl = m;
      if (m) {
        const r = m.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        m.style.transform = 'translate(' + (dx * 0.08).toFixed(1) + 'px,' + (dy * 0.14).toFixed(1) + 'px)';
      }
      const ph = tgt && tgt.closest('[data-phones]');
      if (ph && window.innerWidth > 820) {
        const r = ph.getBoundingClientRect();
        const dx = (e.clientX - r.left) / r.width - 0.5, dy = (e.clientY - r.top) / r.height - 0.5;
        $$('.phone', ph).forEach((p, i) => {
          p.style.setProperty('--py', ([16, 0, -16][i] + dx * 14).toFixed(1) + 'deg');
          p.style.setProperty('--px', (-dy * 10).toFixed(1) + 'deg');
        });
      }
    }, { passive: true });
  }

  /* ---------- frame loop: hero reel, marquee, montage ---------- */
  let lastT = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;
    heroTick(dt); mqTick(dt); filmTick(dt);
    scroll.vel *= 0.9;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------- tabs / modes ink, clock ---------- */
  function syncInk() {
    const tab = $('.tab[aria-selected="true"]'), ink = $('.tabs-ink');
    if (ink) {
      if (tab) { ink.style.width = tab.offsetWidth + 'px'; ink.style.transform = 'translateX(' + tab.offsetLeft + 'px)'; ink.style.opacity = '1'; }
      else ink.style.opacity = '0';
    }
    const mb = $('.modes button[aria-pressed="true"]'), mi = $('.modes-ink');
    if (mb && mi) { mi.style.width = mb.offsetWidth + 'px'; mi.style.transform = 'translateX(' + mb.offsetLeft + 'px)'; }
  }
  function clock() {
    const m = $('#tabsMeta');
    if (!m) return;
    try {
      const t = new Date().toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Toronto' });
      m.textContent = 'BRAMPTON ' + t + ' ET · 4 SOURCES LIVE';
    } catch (e) { /* no Intl tz */ }
  }
  clock(); setInterval(clock, 20000);
  let rz;
  window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { syncInk(); mq.w = 0; }, 120); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { syncInk(); mq.w = 0; if (hasG) ST.refresh(); });
  window.addEventListener('load', () => { syncInk(); if (hasG) ST.refresh(); });

  /* ---------- motion toggle ---------- */
  const mBtn = $('.motion-toggle');
  function setMotion(on) {
    motionOn = on;
    try { localStorage.setItem('wf-motion', on ? 'on' : 'off'); } catch (e) { /* storage blocked */ }
    document.body.classList.toggle('motion-off', !on);
    if (mBtn) {
      mBtn.setAttribute('aria-pressed', String(!on));
      $('.mt-t', mBtn).textContent = on ? 'Motion on' : 'Motion paused';
    }
    visibleVids.forEach(v => { if (on) playV(v); else v.pause(); });
    heroSync();
    if (!on) $$('[data-tilt]').forEach(resetTilt);
  }
  if (mBtn) mBtn.addEventListener('click', () => setMotion(!motionOn));
  setMotion(motionOn);

  /* ---------- scrolling helpers ---------- */
  function scrollTo(y) {
    if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
    else window.scrollTo(0, y);
    onScroll();
  }
  function scrollToEl(sel) {
    const el = typeof sel === 'string' ? $(sel) : sel;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -120, duration: 1.4 });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 120, behavior: reduceOS ? 'auto' : 'smooth' });
  }

  window.Cinema = { mount, unmount, patched, afterPatch, cut, scrollTo, scrollToEl, syncInk, playIntro, motionOn: () => motionOn };

  runLeader();
})();
