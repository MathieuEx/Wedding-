// Date du mariage : 23 octobre 2027, heure de Paris (CEST, UTC+2).
// Ajustez l'heure ici si besoin (ex. "T15:00:00+02:00" pour la cérémonie).
const WEDDING_DATE = new Date("2027-10-23T00:00:00+02:00");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Compte à rebours ---------- */

const els = {
  days: document.getElementById("days"),
  hours: document.getElementById("hours"),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds"),
  countdown: document.querySelector(".countdown"),
  done: document.getElementById("done"),
};

const pad = (n) => String(n).padStart(2, "0");

function setValue(el, value) {
  if (el.textContent === value) return;
  el.textContent = value;
  el.classList.remove("tick");
  void el.offsetWidth; // relance l'animation
  el.classList.add("tick");
}

function tick() {
  const diff = WEDDING_DATE - Date.now();

  if (diff <= 0) {
    els.countdown.hidden = true;
    els.done.hidden = false;
    clearInterval(timer);
    return;
  }

  const s = Math.floor(diff / 1000);
  setValue(els.days, String(Math.floor(s / 86400)));
  setValue(els.hours, pad(Math.floor((s % 86400) / 3600)));
  setValue(els.minutes, pad(Math.floor((s % 3600) / 60)));
  setValue(els.seconds, pad(s % 60));
}

const timer = setInterval(tick, 1000);
tick();

/* ---------- Ajout au calendrier (.ics, journée entière) ---------- */

const ics = [
  "BEGIN:VCALENDAR",
  "VERSION:2.0",
  "PRODID:-//Save the Date//FR",
  "BEGIN:VEVENT",
  "UID:mariage-20271023@save-the-date",
  "DTSTAMP:20260101T000000Z",
  "DTSTART;VALUE=DATE:20271023",
  "DTEND;VALUE=DATE:20271024",
  "SUMMARY:Mariage de Mathieu & Sophie 💍",
  "LOCATION:Domaine de Fourniol\\, 380 Rte de la Fourniol\\, 82240 Septfonds",
  "END:VEVENT",
  "END:VCALENDAR",
].join("\r\n");

document.getElementById("add-calendar").href =
  "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);

/* ---------- Forêt : sapins et feuillus générés ---------- */

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function svgPath(svg, d) {
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", d);
  svg.appendChild(path);
}

// Dessiné en pixels réels pour que les arbres gardent leurs proportions.
function drawForest(svg, { count, minH, maxH }) {
  const W = Math.round(svg.clientWidth), H = Math.round(svg.clientHeight);
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.replaceChildren();
  minH = (minH / 100) * H;
  maxH = (maxH / 100) * H;

  let pines = `M0 ${H} `;
  let trunks = "";
  let crowns = "";
  const step = W / count;
  const circle = (cx, cy, r) =>
    `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0 `;

  for (let i = 0; i <= count; i++) {
    const x = i * step + rand(-step / 3, step / 3);
    const h = rand(minH, maxH);
    const top = H - h;

    if (Math.random() < 0.45) {
      // Feuillu : tronc + couronne ronde faite de plusieurs cercles.
      const r = h * rand(0.2, 0.26);
      const tw = Math.max(3, r * 0.22);
      trunks += `M${x - tw / 2} ${H} L${x - tw / 2} ${top + r} L${x + tw / 2} ${top + r} L${x + tw / 2} ${H} Z `;
      const cy = top + r * 1.3;
      crowns += circle(x, cy, r);
      crowns += circle(x - r * 0.75, cy + r * 0.45, r * 0.75);
      crowns += circle(x + r * 0.75, cy + r * 0.4, r * 0.8);
      crowns += circle(x, cy - r * 0.55, r * 0.7);
      continue;
    }

    // Sapin en étages : chaque étage déborde un peu du précédent.
    const w = h * rand(0.4, 0.55);
    const tiers = 4;
    pines += `L${x - w / 2} ${H} `;
    for (let t = tiers; t >= 1; t--) {
      const y = top + (h * (tiers - t + 1)) / (tiers + 0.6);
      const half = (w / 2) * (1 - (t - 1) / (tiers + 1));
      pines += `L${x - half} ${y} L${x - half * 0.55} ${y - h * 0.04} `;
    }
    pines += `L${x} ${top} `;
    for (let t = 1; t <= tiers; t++) {
      const y = top + (h * (tiers - t + 1)) / (tiers + 0.6);
      const half = (w / 2) * (1 - (t - 1) / (tiers + 1));
      pines += `L${x + half * 0.55} ${y - h * 0.04} L${x + half} ${y} `;
    }
    pines += `L${x + w / 2} ${H} `;
  }
  pines += `L${W} ${H} Z`;

  // Chemins séparés pour éviter que les formes superposées ne s'annulent.
  svgPath(svg, pines);
  if (trunks) svgPath(svg, trunks);
  if (crowns) svgPath(svg, crowns);
}

const forests = [
  [".forest-far", { count: 26, minH: 45, maxH: 95 }],
  [".forest-mid", { count: 16, minH: 55, maxH: 100 }],
  [".forest-near", { count: 9, minH: 60, maxH: 100 }],
];

function drawForests() {
  for (const [sel, opts] of forests) drawForest(document.querySelector(sel), opts);
}

drawForests();
let lastWidth = innerWidth;
addEventListener("resize", () => {
  // Ignore les petits redimensionnements (barre d'adresse mobile).
  if (Math.abs(innerWidth - lastWidth) < 40) return;
  lastWidth = innerWidth;
  drawForests();
});

/* ---------- Feuilles d'automne réalistes ----------
   Chaque feuille est unique : contour généré (érable, chêne, hêtre),
   dégradé de couleurs, nervures, taches et pli de la nervure centrale. */

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const fmt = (pts) => "M" + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L") + "Z";

function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return d;
}

// Érable : 5 lobes pointus en coordonnées polaires, bord denté.
function mapleShape() {
  const cx = 50, cy = 58, R = 44;
  const lobes = [
    [0, 1, 0.4],
    [0.97, 0.94, 0.37], [-0.97, 0.94, 0.37],
    [1.95, 0.55, 0.3], [-1.95, 0.55, 0.3],
  ].map(([a, len, w]) => [a + rand(-0.07, 0.07), len * rand(0.88, 1.06), w * rand(0.9, 1.1)]);
  const teeth = Math.round(rand(30, 40));
  const pts = [];
  const N = 300;
  for (let i = 0; i < N; i++) {
    const th = (i / N) * 2 * Math.PI;
    let m = 0;
    // Exposant < 2 : pointes de lobes effilées, sinus arrondis.
    for (const [a, len, w] of lobes) m = Math.max(m, len * Math.exp(-(Math.abs(angleDiff(th, a) / w) ** 1.4)));
    const saw = ((th * teeth) / (2 * Math.PI)) % 1;
    let r = R * (0.22 + 0.78 * m + 0.1 * m * saw);
    r *= 1 - 0.55 * Math.exp(-((angleDiff(th, Math.PI) / 0.28) ** 2)); // échancrure du pétiole
    pts.push([cx + r * Math.sin(th), cy - r * Math.cos(th)]);
  }

  const ox = cx, oy = cy + 4;
  let main = "", minor = "";
  for (const [a, len] of lobes) {
    const r = R * (0.22 + 0.78 * len) * 0.9;
    const tx = cx + r * Math.sin(a), ty = cy - r * Math.cos(a);
    main += `M${ox} ${oy} L${tx.toFixed(1)} ${ty.toFixed(1)} `;
    for (const f of [0.35, 0.62]) {
      const px = ox + (tx - ox) * f, py = oy + (ty - oy) * f;
      const L = r * 0.28 * (1 - f * 0.5);
      for (const s of [-0.6, 0.6]) {
        const b = a + s;
        minor += `M${px.toFixed(1)} ${py.toFixed(1)} L${(px + L * Math.sin(b)).toFixed(1)} ${(py - L * Math.cos(b)).toFixed(1)} `;
      }
    }
  }
  return { outline: fmt(pts), main, minor, base: [ox, oy + 2] };
}

// Chêne : lobes arrondis le long de la nervure centrale, plus large vers la pointe.
function oakShape() {
  const top = 8, len = 80, W = rand(24, 30);
  const nl = rand(3.2, 4.2), ph = rand(0, 0.5), phL = ph + rand(0.15, 0.4);
  const lobe = (t, s) => 0.32 + 0.68 * Math.abs(Math.sin(Math.PI * (nl * t + s))) ** 0.6;
  const env = (t) => Math.sin(Math.PI * t ** 0.8) ** 0.8;
  const right = [], left = [];
  const N = 160;
  for (let i = 0; i <= N; i++) {
    const t = i / N, y = top + len * t;
    // Les lobes remontent vers la pointe, comme sur un vrai chêne.
    const wr = W * env(t) * lobe(t, ph), wl = W * env(t) * lobe(t, phL);
    right.push([50 + wr, y - wr * 0.15]);
    left.push([50 - wl, y - wl * 0.15]);
  }
  let minor = "";
  for (const [s, dir] of [[ph, 1], [phL, -1]]) {
    for (let k = 0; k < 8; k++) {
      const t = (k + 0.5 - s) / nl;
      if (t < 0.08 || t > 0.93) continue;
      const y = top + len * t;
      const w = W * env(t) * 0.85;
      minor += `M50 ${(y + 5).toFixed(1)} L${(50 + dir * w).toFixed(1)} ${(y - w * 0.15).toFixed(1)} `;
    }
  }
  return { outline: fmt(right.concat(left.reverse())), main: `M50 ${top + 2} L50 ${top + len}`, minor, base: [50, top + len] };
}

// Hêtre : ovale pointu, bord ondulé, nervures parallèles.
function beechShape() {
  const top = 10, len = 76, W = rand(16, 21), teeth = Math.round(rand(8, 12));
  const env = (t) => Math.sin(Math.PI * t ** 1.25);
  const right = [], left = [];
  const N = 140;
  for (let i = 0; i <= N; i++) {
    const t = i / N, y = top + len * t;
    const w = W * env(t) * (1 + 0.06 * Math.abs(Math.sin(Math.PI * teeth * t)));
    right.push([50 + w, y]);
    left.push([50 - w, y]);
  }
  let minor = "";
  for (let k = 1; k < teeth; k++) {
    const t = k / teeth, y = top + len * t, w = W * env(t) * 0.92;
    minor += `M50 ${(y + 6).toFixed(1)} L${(50 + w).toFixed(1)} ${(y - 2).toFixed(1)} M50 ${(y + 6).toFixed(1)} L${(50 - w).toFixed(1)} ${(y - 2).toFixed(1)} `;
  }
  return { outline: fmt(right.concat(left.reverse())), main: `M50 ${top + 3} L50 ${top + len}`, minor, base: [50, top + len] };
}

const LEAF_TYPES = [
  {
    // Terracotta, orange brûlé, rouille, lie-de-vin et prune, éclairés de crème et d'or.
    weight: 0.5, shape: mapleShape, veins: "rgba(245, 232, 207, .5)",
    palettes: [
      ["#e6b85c", "#c8571e", "#a3401f"], ["#e8957a", "#c4623f", "#8e2a2a"],
      ["#c8571e", "#a3401f", "#6d1f35"], ["#a0384f", "#6d1f35", "#3f1428"],
      ["#f0d49a", "#cc8a2e", "#c4623f"], ["#8e3a5e", "#5e2546", "#3a1430"],
    ],
  },
  {
    // Ocre, rouille et brun prune.
    weight: 0.25, shape: oakShape, veins: "rgba(58, 20, 24, .45)",
    palettes: [
      ["#cc8a2e", "#a3401f", "#5a2418"], ["#d9a35a", "#9a5a2a", "#5e2546"],
      ["#b98030", "#8a4a24", "#4a1a24"],
    ],
  },
  {
    // Ocre doré, crème et terracotta : les feuilles les plus lumineuses.
    weight: 0.25, shape: beechShape, veins: "rgba(109, 31, 53, .35)",
    palettes: [
      ["#f5e8cf", "#e6b85c", "#cc8a2e"], ["#e6b85c", "#cc8a2e", "#a3401f"],
      ["#e8c88a", "#c4623f", "#6d1f35"],
    ],
  },
];

let leafId = 0;

function leafSVG() {
  let roll = Math.random(), type = LEAF_TYPES[0];
  for (const t of LEAF_TYPES) { if ((roll -= t.weight) <= 0) { type = t; break; } }
  const { outline, main, minor, base } = type.shape();
  const [c1, c2, c3] = pick(type.palettes);
  const id = `lf${leafId++}`;
  const blotch = Math.random() < 0.55 ? `<path d="${outline}" fill="url(#${id}b)"/>` : "";
  const [bx, by] = base;
  return `<svg class="leaf-svg" viewBox="0 0 100 110">
  <defs>
    <linearGradient id="${id}g" gradientTransform="rotate(${rand(-70, 70).toFixed(0)} .5 .5)">
      <stop offset="0" stop-color="${c1}"/><stop offset="${rand(0.35, 0.6).toFixed(2)}" stop-color="${c2}"/><stop offset="1" stop-color="${c3}"/>
    </linearGradient>
    <radialGradient id="${id}b" cx="${rand(0.25, 0.75).toFixed(2)}" cy="${rand(0.25, 0.75).toFixed(2)}" r="${rand(0.12, 0.3).toFixed(2)}">
      <stop offset="0" stop-color="#4a1c08" stop-opacity=".6"/><stop offset="1" stop-color="#4a1c08" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="${id}s">
      <stop offset="0" stop-color="#000" stop-opacity=".25"/><stop offset=".49" stop-color="#000" stop-opacity=".05"/>
      <stop offset=".51" stop-color="#fff" stop-opacity=".14"/><stop offset="1" stop-color="#000" stop-opacity=".2"/>
    </linearGradient>
    <clipPath id="${id}c"><path d="${outline}"/></clipPath>
  </defs>
  <path d="M${bx} ${by} q${rand(-3, 3).toFixed(1)} 9 ${rand(-4, 4).toFixed(1)} 16" fill="none" stroke="${c3}" stroke-width="1.8" stroke-linecap="round"/>
  <path d="${outline}" fill="url(#${id}g)" stroke="rgba(60, 20, 5, .4)" stroke-width=".6" stroke-linejoin="round"/>
  ${blotch}
  <g clip-path="url(#${id}c)" fill="none" stroke="${type.veins}" stroke-linecap="round">
    <path d="${minor}" stroke-width=".6"/>
    <path d="${main}" stroke-width="1.2"/>
  </g>
  <path d="${outline}" fill="url(#${id}s)"/>
</svg>`;
}

// Profondeur : petites feuilles lointaines et lentes, grandes feuilles proches, floues et rapides.
const DEPTHS = {
  far:  { size: [14, 22], fall: [17, 26], amp: [15, 35],  cls: "leaf-far" },
  mid:  { size: [24, 38], fall: [11, 17], amp: [30, 70],  cls: "" },
  near: { size: [52, 72], fall: [8, 11],  amp: [60, 120], cls: "leaf-near" },
};

function fallingLeaf(container, depth) {
  const d = DEPTHS[depth];
  const el = document.createElement("div");
  el.className = `leaf ${d.cls}`;
  const fall = rand(...d.fall);
  const sway = rand(2.4, 5);
  const css = {
    "--x": `${rand(-5, 100)}%`,
    "--s": `${rand(...d.size)}px`,
    "--fall": `${fall}s`,
    "--delay": `${-rand(0, fall)}s`,
    "--sway": `${sway}s`,
    "--sway-delay": `${-rand(0, sway)}s`,
    "--amp": `${rand(...d.amp)}px`,
    "--tilt": `${rand(15, 40)}deg`,
    "--spin": `${rand(3, 9)}s`,
    "--spin-dir": Math.random() < 0.5 ? "normal" : "reverse",
    "--ax": rand(0.3, 1).toFixed(2),
    "--ay": rand(-1, 1).toFixed(2),
  };
  for (const [k, v] of Object.entries(css)) el.style.setProperty(k, v);
  el.innerHTML = `<div class="leaf-sway"><div class="leaf-spin">${leafSVG()}</div></div>`;
  container.appendChild(el);
}

if (!reduceMotion) {
  const back = document.querySelector(".leaves");
  for (let i = 0; i < 14; i++) fallingLeaf(back, "far");
  for (let i = 0; i < 12; i++) fallingLeaf(back, "mid");
  const front = document.querySelector(".leaves-front");
  for (let i = 0; i < 3; i++) fallingLeaf(front, "near");
}

// Tapis de feuilles mortes au sol.
const litter = document.querySelector(".leaf-litter");
for (let i = 0; i < 34; i++) {
  const el = document.createElement("div");
  el.className = "litter-leaf";
  el.style.left = `${rand(-3, 100)}%`;
  el.style.bottom = `${rand(-2, 5)}%`;
  el.style.width = `${rand(16, 32)}px`;
  // Écrasée verticalement après rotation : la feuille paraît couchée au sol.
  el.style.transform = `scaleY(${rand(0.45, 0.7).toFixed(2)}) rotate(${rand(0, 360).toFixed(0)}deg)`;
  el.style.filter = `brightness(${rand(0.5, 0.8).toFixed(2)})`;
  el.innerHTML = leafSVG();
  litter.appendChild(el);
}

/* ---------- Lucioles ---------- */

const canvas = document.getElementById("fireflies");
const ctx = canvas.getContext("2d");
let flies = [];

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const count = Math.round(Math.min(70, (innerWidth * innerHeight) / 18000));
  flies = Array.from({ length: count }, () => ({
    x: rand(0, innerWidth),
    y: rand(innerHeight * 0.25, innerHeight),
    r: rand(1, 2.4),
    angle: rand(0, Math.PI * 2),
    speed: rand(0.15, 0.5),
    phase: rand(0, Math.PI * 2),
    pulse: rand(0.01, 0.03),
  }));
}

function drawFlies(animate) {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  for (const f of flies) {
    if (animate) {
      f.angle += rand(-0.15, 0.15);
      f.x += Math.cos(f.angle) * f.speed;
      f.y += Math.sin(f.angle) * f.speed - 0.05;
      f.phase += f.pulse;
      if (f.x < -10) f.x = innerWidth + 10;
      if (f.x > innerWidth + 10) f.x = -10;
      if (f.y < innerHeight * 0.15) f.angle = Math.PI / 2;
      if (f.y > innerHeight + 10) f.y = innerHeight * 0.3;
    }
    const a = 0.35 + 0.65 * Math.abs(Math.sin(f.phase));
    const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 7);
    g.addColorStop(0, `rgba(245, 232, 207, ${a})`);
    g.addColorStop(0.25, `rgba(230, 184, 92, ${a * 0.45})`);
    g.addColorStop(1, "rgba(200, 87, 30, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.r * 7, 0, Math.PI * 2);
    ctx.fill();
  }
}

function loop() {
  drawFlies(true);
  requestAnimationFrame(loop);
}

resize();
addEventListener("resize", () => {
  resize();
  if (reduceMotion) drawFlies(false);
});

if (reduceMotion) drawFlies(false);
else loop();
