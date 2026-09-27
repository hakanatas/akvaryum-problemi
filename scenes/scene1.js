/* SAHNE 1 — PROBLEM (0–10 s)  Üstü açık bir cam akvaryum.
   The whole film's drawing lives in LI.world(t); each scene only sets the camera. */
(function (LI) {
  'use strict';
  const { seg, lerp, inOut } = LI.E;
  const KD = LI.KD, F = () => LI.Film, A = LI.Ang, Ink = LI.Ink;
  const END = (t) => 1 - seg(t, 90.4, 91.4);

  function win(t, a, b, fi = 0.4, fo = 0.4) { return seg(t, a, a + fi) * (1 - seg(t, b - fo, b)); }
  function exprs(ctx, t, P, list, sz) {
    const f = F();
    list.forEach(([a, b, items, hot]) => {
      const al = win(t, a, b); if (al <= 0) return;
      f.expr(ctx, typeof items === 'string' ? [items] : items, P.x, P.y, sz ?? P.s, { alpha: al, w: P.w, halo: true, color: hot ? A.amber : undefined });
    });
  }
  const at = (P, k, y) => ({ x: P.x, y: y ?? P.y[k], s: P.s, w: P.w });
  const amber = (a) => `rgba(${LI.AMBER_RGB},${a})`;
  const fr = (n, d, h) => F().fr(n, d, h);
  const neg = (s) => s.replace('-', '−');
  const label = (v) => (v < 0 ? neg(String(v)) : String(v));

  /* ---- boxes and equal objects: cabinet projection, x right, y back, z up ---- */
  const Pj = (O, c, x, y, z) => [O[0] + x * c + y * c * 0.5, O[1] - z * c - y * c * 0.5];
  function poly(ctx, P, a, fill, seed, w = 3) {
    ctx.beginPath(); P.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath();
    ctx.fillStyle = `rgba(${LI.PAPER_RGB},${a})`; ctx.fill();
    fill.forEach((f) => { if (f) { ctx.fillStyle = f; ctx.fill(); } });
    Ink.path(ctx, P.concat([P[0]]), { w, alpha: a * 0.9, seed, taper: [0, 0] });
  }
  /** a solid block x..x+dx, y..y+dy, z..z+dz */
  function block(ctx, O, c, x, y, z, dx, dy, dz, a, h, seed) {
    if (a <= 0) return;
    const P = (i, j, k) => Pj(O, c, x + i * dx, y + j * dy, z + k * dz), H = h > 0 ? amber(a * 0.6 * h) : null;
    poly(ctx, [P(0, 0, 1), P(1, 0, 1), P(1, 1, 1), P(0, 1, 1)], a, [amber(a * 0.2), H], seed, 2.5);
    poly(ctx, [P(1, 0, 0), P(1, 1, 0), P(1, 1, 1), P(1, 0, 1)], a, [`rgba(${LI.INK_RGB},${a * 0.14})`, H], seed + 1, 2.5);
    poly(ctx, [P(0, 0, 0), P(1, 0, 0), P(1, 0, 1), P(0, 0, 1)], a, [`rgba(${LI.INK_RGB},${a * 0.04})`, H], seed + 2, 2.5);
  }
  function ball(ctx, O, c, x, y, z, a, seed) {
    if (a <= 0) return; const C = Pj(O, c, x + 0.5, y + 0.5, z + 0.5), r = c * 0.47;
    ctx.beginPath(); ctx.arc(C[0], C[1], r, 0, 7);
    ctx.fillStyle = `rgba(${LI.PAPER_RGB},${a})`; ctx.fill();
    const g = ctx.createRadialGradient(C[0] - r * 0.35, C[1] - r * 0.35, r * 0.1, C[0], C[1], r);
    g.addColorStop(0, amber(a * 0.12)); g.addColorStop(1, amber(a * 0.45)); ctx.fillStyle = g; ctx.fill();
    const P = []; for (let i = 0; i <= 28; i++) P.push([C[0] + r * Math.cos(i / 28 * 6.2832), C[1] + r * Math.sin(i / 28 * 6.2832)]);
    Ink.path(ctx, P, { w: 2.5, alpha: a * 0.9, seed, taper: [0, 0] });
  }
  /** items [{x,y,z,dx,dy,dz}] in painter's order, each with a fill index i */
  function fillList(L, W, H, dx = 1) {
    const out = [];
    for (let z = 0; z < H; z++) for (let y = W - 1; y >= 0; y--) for (let x = 0; x < L; x += dx) out.push({ x, y, z, dx, dy: 1, dz: 1 });
    out.forEach((q, i) => (q.i = i));
    return out.slice().sort((p, q) => q.y - p.y || p.x - q.x || p.z - q.z);
  }
  const shown = (t, t0, dt, n) => Math.max(0, Math.min(n, Math.floor((t - t0) / dt + 0.4)));
  /** an open glass box: back walls first, then the contents, then the front edges */
  function container(ctx, O, c, L, W, H, a, seed, draw) {
    if (a <= 0) return;
    const P = (x, y, z) => Pj(O, c, x, y, z), ink = `rgba(${LI.INK_RGB},${a * 0.05})`;
    poly(ctx, [P(0, W, 0), P(L, W, 0), P(L, W, H), P(0, W, H)], a * 0.8, [ink], seed, 2);
    poly(ctx, [P(0, 0, 0), P(0, W, 0), P(0, W, H), P(0, 0, H)], a * 0.8, [ink], seed + 1, 2);
    poly(ctx, [P(0, 0, 0), P(L, 0, 0), P(L, W, 0), P(0, W, 0)], a * 0.8, [ink], seed + 2, 2);
    if (draw) draw();
    [[[0, 0, 0], [L, 0, 0]], [[L, 0, 0], [L, 0, H]], [[L, 0, H], [0, 0, H]], [[0, 0, H], [0, 0, 0]], [[L, 0, 0], [L, W, 0]], [[L, W, 0], [L, W, H]], [[L, W, H], [L, 0, H]], [[0, W, H], [L, W, H]], [[0, 0, H], [0, W, H]]]
      .forEach(([p, q], i) => Ink.path(ctx, [P(...p), P(...q)], { w: 3, alpha: a * 0.85, seed: seed + 10 + i, taper: [0, 0] }));
  }
  function fillBox(ctx, O, c, L, W, H, t, t0, dt, a, seed, kind = 'cube', hot = 0) {
    const dx = kind === 'brick' ? 2 : 1, items = fillList(L, W, H, dx);
    container(ctx, O, c, L, W, H, a, seed, () => items.forEach((q) => {
      const k = seg(t, t0 + q.i * dt, t0 + q.i * dt + 0.35); if (k <= 0) return;
      const dz = (1 - inOut(k)) * (H + 1 - q.z);
      if (kind === 'ball') ball(ctx, O, c, q.x, q.y, q.z + dz, a * k, seed + 100 + q.i * 3);
      else block(ctx, O, c, q.x, q.y, q.z + dz, q.dx, 1, 1, a * k, hot, seed + 100 + q.i * 3);
    }));
    return items.length;
  }
  function tag(ctx, env, O, c, L, text, a, hot) {
    if (a <= 0) return; const s = KD.L(env).G.s;
    F().T(ctx, text, O[0] + L * c / 2, O[1] + s * 0.95, { size: s * 0.66, alpha: a, halo: true, color: hot ? A.amber : undefined });
  }
  /** cubes of an L × W × H prism; when(q) gives each cube's arrival time (Infinity = never) */
  function cubes(L, W, H) {
    const out = [];
    for (let z = 0; z < H; z++) for (let y = W - 1; y >= 0; y--) for (let x = 0; x < L; x++) out.push({ x, y, z });
    return out.sort((p, q) => q.y - p.y || p.x - q.x || p.z - q.z);
  }
  function fillT(ctx, O, c, B, t, a, when, hot, seed) {
    let n = 0;
    container(ctx, O, c, B[0], B[1], B[2], a, seed, () => cubes(...B).forEach((q, i) => {
      const t0 = when(q); if (!(t >= t0)) return; n++;
      const k = seg(t, t0, t0 + 0.3);
      block(ctx, O, c, q.x, q.y, q.z + (1 - inOut(k)) * 1.2, 1, 1, 1, a * k, hot ? hot(q) : 0, seed + 100 + i * 3);
    }));
    return n;
  }
  function edges(ctx, env, O, c, B, a, labels) {
    if (a <= 0) return; const s = KD.L(env).G.s, o = { size: s * 0.7, alpha: a, halo: true, color: A.amber };
    const m = (p, q) => { const P = Pj(O, c, ...p), Q = Pj(O, c, ...q); return [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2]; };
    const [L, W, H] = B;
    let q = m([0, 0, 0], [L, 0, 0]); F().T(ctx, labels[0], q[0], q[1] + 36, o);
    q = m([L, 0, 0], [L, W, 0]); F().T(ctx, labels[1], q[0] + 50, q[1] + 12, o);
    q = m([L, W, 0], [L, W, H]); F().T(ctx, labels[2], q[0] + 48, q[1], o);
  }
  function tally(ctx, env, t, rows) {
    const T = KD.L(env).TL;
    rows.forEach(([t0, t1, txt, hot], i) => { const al = win(t, t0, t1) * END(t); if (al > 0) F().T(ctx, txt, T.x, T.y[i], { size: T.s, alpha: al, halo: true, color: hot ? A.amber : undefined }); });
  }

  /** amber water inside a box up to a fraction of its height */
  function water(ctx, O, c, L, W, H, lv, a) {
    if (a <= 0 || lv <= 0) return; const h = H * lv, P = (x, y, z) => Pj(O, c, x, y, z);
    const f = (Q, al) => { ctx.beginPath(); Q.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath(); ctx.fillStyle = amber(a * al); ctx.fill(); };
    f([P(0, 0, 0), P(L, 0, 0), P(L, 0, h), P(0, 0, h)], 0.3); f([P(L, 0, 0), P(L, W, 0), P(L, W, h), P(L, 0, h)], 0.38); f([P(0, 0, h), P(L, 0, h), P(L, W, h), P(0, W, h)], 0.5);
  }
  /** an open glass tank; hot = {bottom, front, back, left, right} in 0..1; lv = water height (same units) */
  function tank(ctx, O, c, L, W, H, a, lv, hot, seed) {
    if (a <= 0) return;
    const P = (x, y, z) => Pj(O, c, x, y, z), h = (k) => (hot[k] > 0 ? amber(a * 0.55 * hot[k]) : null);
    const face = (Q, fills, sd, paper) => {
      ctx.beginPath(); Q.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath();
      if (paper) { ctx.fillStyle = `rgba(${LI.PAPER_RGB},${a})`; ctx.fill(); }
      fills.forEach((f) => { if (f) { ctx.fillStyle = f; ctx.fill(); } });
      Ink.path(ctx, Q.concat([Q[0]]), { w: 2.5, alpha: a * 0.85, seed: sd, taper: [0, 0] });
    };
    const ink = `rgba(${LI.INK_RGB},${a * 0.05})`;
    face([P(L, W, 0), P(0, W, 0), P(0, W, H), P(L, W, H)], [ink, h('back')], seed, true);
    face([P(0, W, 0), P(0, 0, 0), P(0, 0, H), P(0, W, H)], [ink, h('left')], seed + 1, true);
    face([P(0, W, 0), P(L, W, 0), P(L, 0, 0), P(0, 0, 0)], [ink, h('bottom')], seed + 2, true);
    if (lv > 0) water(ctx, O, c, L, W, H, lv / H, a);
    face([P(0, 0, 0), P(L, 0, 0), P(L, 0, H), P(0, 0, H)], [h('front')], seed + 3, false);
    face([P(L, 0, 0), P(L, W, 0), P(L, W, H), P(L, 0, H)], [h('right')], seed + 4, false);
  }
  /** the net of an open L × W × H box: bottom in the middle, four walls around it */
  function openNet(ctx, env, N, L, W, H, a, lab, seed) {
    if (a <= 0) return;
    const k = N.k, x0 = N.x - (2 * H + L) * k / 2, y0 = N.y, s = KD.L(env).G.s;
    const R = [['bottom', H, H, L, W, 0.34], ['back', H, 0, L, H, 0.13], ['front', H, H + W, L, H, 0.13], ['left', 0, H, H, W, 0.06], ['right', H + L, H, H, W, 0.06]];
    R.forEach(([n, x, y, w, hh, f], i) => {
      const al = a * seg(lab.t, lab.t0 + i * 0.25, lab.t0 + i * 0.25 + 0.4); if (al <= 0) return;
      const P = [[x0 + x * k, y0 + y * k], [x0 + (x + w) * k, y0 + y * k], [x0 + (x + w) * k, y0 + (y + hh) * k], [x0 + x * k, y0 + (y + hh) * k]];
      poly(ctx, P, al, [amber(al * f)], seed + i * 5, 2.5);
      if (lab.area > 0) F().T(ctx, String(w * hh), x0 + (x + w / 2) * k, y0 + (y + hh / 2) * k, { size: s * 0.56, alpha: al * lab.area, halo: true });
    });
  }

  function context(ctx, env, t) {
    exprs(ctx, t, KD.L(env).CX, [
      [4.4, 10.2, 'Bir akvaryum problemi'],
      [10.6, 27.8, 'Neler verilmiş, ne isteniyor?'],
      [28.4, 45.8, 'Kaç cm² cam gerekir?'],
      [46.4, 63.8, 'Kaç litre su alır?'],
      [64.4, 79.8, 'Stratejilerimiz başka akvaryumda da işler mi?'],
    ]);
  }

  function figure(ctx, env, t) {
    const L = KD.L(env), a = END(t), O = [L.AQ.x, L.AQ.y], c = L.AQ.c, B = [60, 30, 40];
    const a1 = win(t, 4.6, 63.8) * a;
    if (a1 > 0) {
      const cyc = (t0) => win(t, t0, t0 + 0.9);
      const hot = {
        bottom: cyc(11.6) + win(t, 29.4, 31.0) + win(t, 49.8, 53.0),
        front: cyc(12.2) + win(t, 31.2, 33.0), back: cyc(12.2) + win(t, 31.2, 33.0),
        left: cyc(12.8) + win(t, 33.2, 35.0), right: cyc(12.8) + win(t, 33.2, 35.0),
      };
      let lv = 35 * inOut(seg(t, 15.4, 17.0));
      if (t > 46.8) lv = t < 49.8 ? 40 * inOut(seg(t, 47.4, 48.2)) : lerp(40, 35, inOut(seg(t, 49.8, 50.6)));
      if (t > 28.4 && t < 46.8) lv = 35 * (1 - seg(t, 28.6, 29.2)) + 35 * seg(t, 44.8, 45.8) * 0;
      tank(ctx, O, c, ...B, a1 * seg(t, 4.8, 5.4), lv, hot, 60000);
      edges(ctx, env, O, c, B, a1 * seg(t, 5.6, 6.0), ['60 cm', '30 cm', '40 cm']);
      const wl = a1 * (win(t, 15.8, 27.8) + win(t, 50.6, 63.8));
      if (wl > 0) { const p = Pj(O, c, 0, 0, 17.5); F().T(ctx, '35 cm', p[0] - 58, p[1], { size: L.G.s * 0.62, alpha: wl, halo: true, color: A.amber }); }
      openNet(ctx, env, L.NET, 60, 30, 40, win(t, 18.0, 27.8) * a, { t, t0: 18.0, area: seg(t, 19.6, 20.0) }, 60500);
      tally(ctx, env, t, [[29.6, 45.8, 'Taban: 60 · 30 = 1800'], [31.4, 45.8, 'Ön + arka: 2 · 60 · 40 = 4800'], [33.4, 45.8, 'Yanlar: 2 · 30 · 40 = 2400'], [35.4, 45.8, 'Toplam: 9000 cm²', true]]);
      tally(ctx, env, t, [[47.6, 63.8, '60 · 30 · 40 = 72 000 cm³ ✗'], [49.8, 63.8, 'Su 35 cm: 1800 · 35'], [51.6, 63.8, '= 63 000 cm³ = 63 L', true], [54.0, 63.8, 'Tahmin 60 L ile uyumlu ✓'], [56.2, 63.8, 'Başka yol: 72 L − 9 L = 63 L']]);
      if (t > 47.6 && t < 63.8) { const T = L.TL, al = a1 * seg(t, 49.4, 49.8) * win(t, 47.6, 63.8); if (al > 0) Ink.path(ctx, [[T.x - 250, T.y[0]], [T.x + 250, T.y[0]]], { w: 3, alpha: al * 0.7, seed: 6100, taper: [0, 0] }); }
    }
    const a5 = win(t, 64.8, 79.8) * a;
    if (a5 > 0) {
      const B2 = [50, 40, 30];
      const hot = { bottom: win(t, 66.0, 68.0) + win(t, 70.4, 72.0), front: win(t, 66.4, 68.0), back: win(t, 66.4, 68.0), left: win(t, 66.8, 68.0), right: win(t, 66.8, 68.0) };
      tank(ctx, O, c, ...B2, a5 * seg(t, 65.0, 65.6), 25 * inOut(seg(t, 70.4, 71.6)), hot, 62000);
      edges(ctx, env, O, c, B2, a5 * seg(t, 65.4, 65.8), ['50 cm', '40 cm', '30 cm']);
      tally(ctx, env, t, [[66.0, 79.8, 'Cam: 2000 + 2 · 1500 + 2 · 1200'], [68.0, 79.8, '= 7400 cm²', true], [70.4, 79.8, 'Su 25 cm: 2000 · 25 = 50 000 cm³'], [72.2, 79.8, '= 50 L', true]]);
    }
  }

  function words(ctx, env, t) {
    const W = KD.L(env).W;
    exprs(ctx, t, at(W, 0), [[5.4, 10.2, 'Üstü açık cam akvaryum: 60 cm, 30 cm, 40 cm'],
      [11.4, 17.8, 'Cam: taban ve dört yan yüz (üstü açık)'], [18.0, 27.8, 'Açınımla gösterelim: 5 dikdörtgen'],
      [29.4, 45.8, 'Cam alanı = taban + dört yan yüz'],
      [47.4, 49.6, 'Bütün kutunun hacmi mi? Hayır, su tam dolu değil'], [49.8, 63.8, 'Su hacmi = taban alanı × su yüksekliği'],
      [65.4, 79.8, 'Yeni akvaryum: 50 cm, 40 cm, 30 cm; su 25 cm']]);
    exprs(ctx, t, at(W, 1), [[6.8, 10.2, 'Kaç cm² cam gerekir? Üstten 5 cm boş kalırsa kaç litre su alır?'],
      [15.4, 27.8, 'Su: taban aynı, yükseklik 40 − 5 = 35 cm'],
      [37.4, 45.8, 'Kontrol: kapalı kutu 10 800 − kapak 1800 = 9000 ✓'],
      [56.2, 63.8, 'Boş kısım: 1800 · 5 = 9000 cm³ = 9 L'],
      [74.0, 79.8, 'Cam = taban + yan yüzler · Su = taban × su yüksekliği']]);
    exprs(ctx, t, at(W, 2), [[23.4, 27.8, 'Tahmin: 1800 · 35 ≈ 2000 · 30 = 60 000 cm³ ≈ 60 L', true],
      [41.0, 45.8, 'Akvaryum için 9000 cm² cam gerekir', true],
      [59.0, 63.8, 'Akvaryum 63 L su alır', true],
      [76.4, 79.8, 'Stratejilerimiz her akvaryumda işliyor', true]]);
  }

  function summary(ctx, env, t) {
    if (t < 80.4) return;
    const S = KD.L(env).SUM, f = F(), a = END(t);
    [['Bileşenleri belirle: şekil, uzunluk, yükseklik', 80.6], ['Açınım ve çizimle göster', 81.6], ['Tahmin et, çöz, kontrol et', 82.6], ['Başka bir yolla da dene!', 83.6, true]].forEach(([s, t0, hot], i) => {
      const al = seg(t, t0, t0 + 0.4) * a; if (al <= 0) return;
      f.expr(ctx, [s], S.x, S.y[i], S.s * (i === 3 ? 1.1 : 1), { alpha: al, w: S.w, halo: true, color: hot ? A.amber : undefined });
    });
  }

  LI.fireworks = function (ctx, env, t) {
    const k = seg(t, 84.4, 86.4);
    if (k <= 0 || t >= 91) return;
    const n = F().nokta(t, env), C = [n.x, n.y - 170];
    [30, 60, 90, 120, 150].forEach((d, i) => {
      const r = 150 + 30 * Math.sin(t * 2 + i);
      A.arc(ctx, C, r, d - 12, d + 12, { p: seg(k, i * 0.12, i * 0.12 + 0.4), alpha: 0.8 * (1 - seg(t, 90.2, 91)), w: 6, seed: 80 + i });
    });
  };

  LI.world = function (ctx, env, t) { context(ctx, env, t); figure(ctx, env, t); words(ctx, env, t); summary(ctx, env, t); };

  function camera(t, env) {
    const L = KD.L(env);
    return LI.Camera.breathe(LI.Camera.track([
      [0, KD.cam(env, { x: L.nx, y: env.V ? 380 : 140, zoom: 1.6 })],
      [3.0, KD.cam(env, { x: L.nx, y: env.V ? 380 : 140, zoom: 1.6 })],
      [4.8, KD.cam(env, { zoom: 1 })],
    ], t), t, 0.5);
  }
  function render(ctx, lt, env, t) { F().base(ctx, env, t, camera(t, env), () => LI.world(ctx, env, t)); }
  LI.registerScene({ id: 1, start: 0, end: 10, name: 'The problem', nameTr: 'Problem', concept: 'Glass and water', conceptTr: 'Cam ve su', render });
})(window.LI = window.LI || {});
