/* =====================================================================
   WAYFARE · live route globe (three.js r169 via the import map)
   Night-lit Earth with a gold atmosphere, a graticule, star field and
   animated flight arcs from the selected origin to each popular
   destination. Drag to spin; hovering a route in the list swings the
   globe to that sector and lights its arc. Labels are clickable and run
   a live search.
   Textures come from the three-globe project (MIT). From file:// the
   local copies would taint WebGL, so the CDN copies are used there.
   Loaded as a classic script that pulls three.js in with a dynamic
   import(), so it also runs when index.html is opened from disk.
   ===================================================================== */
(() => {
'use strict';
function boot(THREE) {

const REMOTE = 'https://unpkg.com/three-globe@2.31.0/example/img/';
const LOCAL = 'assets/globe/';
const DEG = Math.PI / 180;
const texCache = {};

function loadTex(name, srgb) {
  if (texCache[name]) return texCache[name];
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin('anonymous');
  const bases = location.protocol === 'file:' ? [REMOTE] : [LOCAL, REMOTE];
  texCache[name] = new Promise((resolve, reject) => {
    const tryAt = i => {
      if (i >= bases.length) { delete texCache[name]; reject(new Error('texture ' + name)); return; }
      loader.load(bases[i] + name, t => {
        if (srgb) t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 4;
        resolve(t);
      }, undefined, () => tryAt(i + 1));
    };
    tryAt(0);
  });
  return texCache[name];
}

function ll(lat, lng, r = 1) {
  const phi = (90 - lat) * DEG, th = (lng + 180) * DEG;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
}

let glowTex = null;
function glowTexture() {
  if (glowTex) return glowTex;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.22, 'rgba(255,236,200,.85)');
  grd.addColorStop(0.5, 'rgba(216,178,112,.25)');
  grd.addColorStop(1, 'rgba(216,178,112,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  glowTex = new THREE.CanvasTexture(c);
  return glowTex;
}

const ARC_VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const ARC_FRAG = `
  uniform float uTime; uniform float uOff; uniform float uHot; uniform vec3 uColor; varying vec2 vUv;
  void main(){
    float x = vUv.x;
    float t = fract(uTime * 0.2 + uOff) * 1.35;
    float d = t - x;
    float trail = (d > 0.0 && d < 0.3) ? pow(1.0 - d / 0.3, 2.2) : 0.0;
    float ends = smoothstep(0.0, 0.05, x) * smoothstep(1.0, 0.95, x);
    float a = (0.13 + uHot * 0.45) * ends + trail * (0.85 + uHot * 0.5);
    gl_FragColor = vec4(uColor * (1.0 + trail * 0.7 + uHot * 0.35), a);
  }`;
const ATMO_VERT = `varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const ATMO_FRAG = `uniform vec3 uColor; varying vec3 vN;
  void main(){ float i = pow(clamp(0.66 - dot(vN, vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 2.4); gl_FragColor = vec4(uColor, 1.0) * i * 0.85; }`;
const RIM_VERT = `varying vec3 vN; varying vec3 vP; void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vP = mv.xyz; gl_Position = projectionMatrix * mv; }`;
const RIM_FRAG = `uniform vec3 uColor; varying vec3 vN; varying vec3 vP;
  void main(){ float f = pow(1.0 - max(dot(vN, normalize(-vP)), 0.0), 3.2); gl_FragColor = vec4(uColor, f * 0.42); }`;

const LABEL_OFF = { CDG: [0, 16], JFK: [0, 15], YUL: [0, -15], LAX: [0, 0] };

let G = null; // current instance

function mount(stage, opts) {
  destroy();
  const canvas = stage.querySelector('canvas');
  const labelsBox = stage.querySelector('#globeLabels') || stage.querySelector('.globe-labels');
  if (!canvas) return;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) {
    stage.classList.add('is-fallback');
    return;
  }
  stage.classList.remove('is-fallback');
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  canvas.style.touchAction = 'pan-y';

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
  camera.position.set(0, 0, 4.55);

  const group = new THREE.Group();
  scene.add(group);

  // lights
  scene.add(new THREE.AmbientLight(0x9aa6c8, 0.55));
  const sun = new THREE.DirectionalLight(0xffe0b0, 1.9);
  sun.position.set(-3, 1.6, 2.6);
  scene.add(sun);

  // earth (placeholder material until textures arrive)
  const earthGeo = new THREE.SphereGeometry(1, 96, 96);
  const earthMat = new THREE.MeshPhongMaterial({ color: 0x0e1626, emissive: 0x05070c, shininess: 12, specular: new THREE.Color(0x2a2418) });
  const earth = new THREE.Mesh(earthGeo, earthMat);
  group.add(earth);
  Promise.allSettled([loadTex('earth-dark.jpg', true), loadTex('earth-night.jpg', true), loadTex('earth-topology.png'), loadTex('earth-water.png')])
    .then(([dark, night, topo, water]) => {
      if (!G || G.earthMat !== earthMat) return;
      if (dark.status === 'fulfilled') { earthMat.map = dark.value; earthMat.color.set(0xb8c4e0); }
      if (night.status === 'fulfilled') { earthMat.emissiveMap = night.value; earthMat.emissive.set(0xffc27a); earthMat.emissiveIntensity = 1.25; }
      if (topo.status === 'fulfilled') { earthMat.bumpMap = topo.value; earthMat.bumpScale = 2.2; }
      if (water.status === 'fulfilled') { earthMat.specularMap = water.value; earthMat.specular.set(0x6a5634); earthMat.shininess = 22; }
      earthMat.needsUpdate = true;
    });

  // rim light + atmosphere
  const rim = new THREE.Mesh(new THREE.SphereGeometry(1.004, 64, 64), new THREE.ShaderMaterial({
    vertexShader: RIM_VERT, fragmentShader: RIM_FRAG, uniforms: { uColor: { value: new THREE.Color(0xf2d6a0) } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  }));
  group.add(rim);
  const atmo = new THREE.Mesh(new THREE.SphereGeometry(1.13, 64, 64), new THREE.ShaderMaterial({
    vertexShader: ATMO_VERT, fragmentShader: ATMO_FRAG, uniforms: { uColor: { value: new THREE.Color(0xc9a46a) } },
    side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  }));
  scene.add(atmo);

  // graticule
  const gp = [];
  for (let lat = -60; lat <= 60; lat += 30) for (let lng = -180; lng < 180; lng += 4) { gp.push(ll(lat, lng, 1.003), ll(lat, lng + 4, 1.003)); }
  for (let lng = -180; lng < 180; lng += 30) for (let lat = -84; lat < 84; lat += 4) { gp.push(ll(lat, lng, 1.003), ll(lat + 4, lng, 1.003)); }
  const grat = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(gp), new THREE.LineBasicMaterial({ color: 0xd8b270, transparent: true, opacity: 0.07, depthWrite: false }));
  group.add(grat);

  // stars
  const sp = new Float32Array(1400 * 3);
  for (let i = 0; i < 1400; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(30 + Math.random() * 40);
    sp.set([v.x, v.y, v.z], i * 3);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xf3efe6, size: 0.09, sizeAttenuation: true, transparent: true, opacity: 0.7, depthWrite: false }));
  scene.add(stars);

  G = {
    stage, canvas, labelsBox, renderer, scene, camera, group, earthMat, earth, rim, atmo, grat, stars,
    origin: opts && opts.origin || 'YYZ', routes: [], labels: [], pulse: null,
    hot: null, target: null, drag: false, velY: 0, idle: 3, time: 0, raf: 0, visible: true, w: 1, h: 1,
    disposables: [earthGeo, earthMat, rim.geometry, rim.material, atmo.geometry, atmo.material, grat.geometry, grat.material, starGeo, stars.material]
  };

  // initial attitude: North Atlantic so North America and Europe both show
  const start = ll(34, -38);
  group.rotation.y = -Math.atan2(start.x, start.z);
  group.rotation.x = 0.42;

  buildRoutes();
  resize();

  // interaction
  let px = 0, py = 0;
  const down = e => { G.drag = true; px = e.clientX; py = e.clientY; G.target = null; G.idle = 0; try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } };
  const move = e => {
    if (!G || !G.drag) return;
    const dx = e.clientX - px, dy = e.clientY - py;
    px = e.clientX; py = e.clientY;
    G.group.rotation.y += dx * 0.0055;
    G.group.rotation.x = Math.max(-1.0, Math.min(1.0, G.group.rotation.x + dy * 0.004));
    G.velY = dx * 0.0055;
  };
  const up = () => { if (G) { G.drag = false; G.idle = 0; } };
  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  G.cleanup = () => {
    canvas.removeEventListener('pointerdown', down);
    canvas.removeEventListener('pointermove', move);
    canvas.removeEventListener('pointerup', up);
    canvas.removeEventListener('pointercancel', up);
  };
  G.ro = new ResizeObserver(resize);
  G.ro.observe(stage);
  G.io = new IntersectionObserver(([en]) => { if (G) G.visible = en.isIntersecting; }, { rootMargin: '100px' });
  G.io.observe(stage);

  let last = performance.now();
  const loop = now => {
    if (!G) return;
    G.raf = requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!G.visible || document.hidden) return;
    tick(dt);
    G.renderer.render(G.scene, G.camera);
  };
  G.raf = requestAnimationFrame(loop);
}

function motionOn() { return !window.Cinema || window.Cinema.motionOn(); }

function buildRoutes() {
  const WF = window.WF;
  if (!G || !WF) return;
  clearRoutes();
  const AP = WF.AP, o = AP[G.origin] || AP.YYZ;
  const from = ll(o.lat, o.lng, 1.0);
  const gold = new THREE.Color(0xf2d6a0);
  const glow = glowTexture();

  // origin marker + pulse ring
  const oSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  oSprite.position.copy(from).multiplyScalar(1.01);
  oSprite.scale.setScalar(0.11);
  G.group.add(oSprite);
  const ringGeo = new THREE.RingGeometry(0.018, 0.024, 48);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xf2d6a0, transparent: true, opacity: 1, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.copy(from).multiplyScalar(1.004);
  ring.lookAt(from.clone().multiplyScalar(2));
  G.group.add(ring);
  G.pulse = { ring, mat: ringMat, t: 0 };
  G.routeObjs = [oSprite, ring];
  G.routeDisp = [oSprite.material, ringGeo, ringMat];

  WF.DESTS.forEach((d, i) => {
    if (d.ap === G.origin) return;
    const a = AP[d.ap];
    const to = ll(a.lat, a.lng, 1.0);
    const dist = from.angleTo(to);
    const h = 0.12 + dist * 0.22;
    const c1 = from.clone().lerp(to, 0.25).normalize().multiplyScalar(1 + h);
    const c2 = from.clone().lerp(to, 0.75).normalize().multiplyScalar(1 + h);
    const curve = new THREE.CubicBezierCurve3(from.clone(), c1, c2, to.clone());
    const geo = new THREE.TubeGeometry(curve, 120, 0.0042, 6, false);
    const mat = new THREE.ShaderMaterial({
      vertexShader: ARC_VERT, fragmentShader: ARC_FRAG,
      uniforms: { uTime: { value: 0 }, uOff: { value: i * 0.17 }, uHot: { value: 0 }, uColor: { value: gold } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });
    const mesh = new THREE.Mesh(geo, mat);
    G.group.add(mesh);
    const head = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: 0xffe9c2, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    head.scale.setScalar(0.07);
    G.group.add(head);
    const dot = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: 0xd8b270, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    dot.position.copy(to).multiplyScalar(1.01);
    dot.scale.setScalar(0.06);
    G.group.add(dot);
    G.routes.push({ code: d.ap, curve, mesh, mat, head, dot, off: i * 0.17, hot: 0 });
    G.routeObjs.push(mesh, head, dot);
    G.routeDisp.push(geo, mat, head.material, dot.material);
  });
  buildLabels();
}

function clearRoutes() {
  if (!G) return;
  (G.routeObjs || []).forEach(o => G.group.remove(o));
  (G.routeDisp || []).forEach(d => d.dispose && d.dispose());
  G.routeObjs = []; G.routeDisp = []; G.routes = [];
}

function buildLabels() {
  if (!G || !G.labelsBox) return;
  const AP = window.WF.AP;
  G.labelsBox.innerHTML = '';
  G.labels = [];
  const add = (code, isOrigin) => {
    const a = AP[code];
    const el = document.createElement(isOrigin ? 'span' : 'button');
    el.className = 'glabel' + (isOrigin ? ' origin' : '');
    el.innerHTML = '<i></i><span>' + code + ' · ' + a.c + (isOrigin ? ' · ORIGIN' : '') + '</span>';
    if (!isOrigin) { el.dataset.act = 'dest'; el.dataset.ap = code; el.dataset.globe = code; el.type = 'button'; el.setAttribute('aria-label', 'Search flights to ' + a.c); }
    G.labelsBox.appendChild(el);
    G.labels.push({ code, el, local: ll(a.lat, a.lng, 1.012), off: LABEL_OFF[code] || [0, 0] });
  };
  add(G.origin, true);
  window.WF.DESTS.forEach(d => { if (d.ap !== G.origin) add(d.ap, false); });
}

const _v = new THREE.Vector3(), _n = new THREE.Vector3(), _cam = new THREE.Vector3();
function tick(dt) {
  const moving = motionOn();
  if (moving) G.time += dt;
  G.idle += dt;
  const rot = G.group.rotation;
  if (G.target) {
    let dy = G.target.y - rot.y;
    dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    rot.y += dy * Math.min(1, dt * 3.2);
    rot.x += (G.target.x - rot.x) * Math.min(1, dt * 3.2);
  } else if (!G.drag) {
    rot.y += G.velY;
    G.velY *= 0.94;
    if (moving && G.idle > 1.6 && Math.abs(G.velY) < 0.0005) rot.y += dt * 0.06;
  }
  G.stars.rotation.y += moving ? dt * 0.004 : 0;

  G.routes.forEach(r => {
    const want = G.hot === r.code ? 1 : 0;
    r.hot += (want - r.hot) * Math.min(1, dt * 6);
    r.mat.uniforms.uTime.value = G.time;
    r.mat.uniforms.uHot.value = r.hot;
    const t = ((G.time * 0.2 + r.off) % 1) * 1.35;
    if (t <= 1) { r.head.visible = true; r.head.position.copy(r.curve.getPoint(t)); r.head.scale.setScalar(0.06 + r.hot * 0.05); }
    else r.head.visible = false;
    r.dot.scale.setScalar(0.06 + r.hot * 0.07);
  });
  if (G.pulse) {
    G.pulse.t = (G.pulse.t + (moving ? dt : 0) * 0.6) % 1;
    const s = 1 + G.pulse.t * 3.2;
    G.pulse.ring.scale.set(s, s, s);
    G.pulse.mat.opacity = 1 - G.pulse.t;
  }

  // HTML labels
  G.group.updateMatrixWorld();
  _cam.copy(G.camera.position).normalize();
  G.labels.forEach(L => {
    _v.copy(L.local).applyMatrix4(G.group.matrixWorld);
    _n.copy(_v).normalize();
    const facing = _n.dot(_cam);
    _v.project(G.camera);
    const x = (_v.x * 0.5 + 0.5) * G.w + L.off[0], y = (-_v.y * 0.5 + 0.5) * G.h + L.off[1];
    L.el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) translate(-3.5px,-50%)';
    const vis = facing > 0.22;
    L.el.style.opacity = vis ? '1' : '0';
    L.el.style.pointerEvents = vis ? '' : 'none';
    L.el.classList.toggle('hot', L.code === G.hot);
  });
}

function resize() {
  if (!G) return;
  const w = G.stage.clientWidth || 600, h = G.stage.clientHeight || 600;
  G.w = w; G.h = h;
  G.renderer.setSize(w, h, false);
  G.camera.aspect = w / h;
  G.camera.updateProjectionMatrix();
}

function setOrigin(code) {
  if (!G || !code || code === G.origin) return;
  G.origin = code;
  buildRoutes();
  const AP = window.WF.AP, o = AP[code];
  const v = ll(o.lat, o.lng);
  G.target = { y: -Math.atan2(v.x, v.z), x: Math.max(-0.8, Math.min(0.8, o.lat * DEG * 0.8)) };
  setTimeout(() => { if (G && !G.hot) G.target = null; }, 1600);
}

function focus(code) {
  if (!G) return;
  if (!code || code === G.origin) { G.hot = null; G.target = null; G.idle = 0; return; }
  const AP = window.WF.AP, a = AP[code], o = AP[G.origin];
  if (!a || !o) return;
  G.hot = code;
  const mid = ll(o.lat, o.lng).add(ll(a.lat, a.lng)).normalize();
  const lat = Math.asin(mid.y);
  G.target = { y: -Math.atan2(mid.x, mid.z), x: Math.max(-0.8, Math.min(0.8, lat * 0.85)) };
}

function destroy() {
  if (!G) return;
  cancelAnimationFrame(G.raf);
  if (G.cleanup) G.cleanup();
  if (G.ro) G.ro.disconnect();
  if (G.io) G.io.disconnect();
  clearRoutes();
  G.disposables.forEach(d => d.dispose && d.dispose());
  if (G.labelsBox) G.labelsBox.innerHTML = '';
  try { G.renderer.dispose(); } catch (e) { /* ignore */ }
  G = null;
}

window.WayfareGlobe = { mount, destroy, setOrigin, focus };
window.dispatchEvent(new Event('wayfare-globe-ready'));
}

import('three').then(boot).catch(err => {
  console.warn('3D globe unavailable:', err);
  const stage = document.getElementById('globeStage');
  if (stage) stage.classList.add('is-fallback');
});
})();
