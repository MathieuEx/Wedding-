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
  "LOCATION:Domaine de Fourniol\\, 82240 Septfonds",
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

/* ---------- Feuilles d'érable et de chêne qui tombent ---------- */

if (!reduceMotion) {
  const leaves = document.querySelector(".leaves");
  const colors = ["#d9622b", "#c8893a", "#b5402a", "#e8a33d", "#8f3f2a", "#f0c470", "#a0522d"];
  for (let i = 0; i < 24; i++) {
    const leaf = document.createElement("span");
    leaf.className = `leaf ${i % 3 ? "maple" : "oak"}`;
    leaf.style.left = `${rand(0, 100)}%`;
    leaf.style.setProperty("--c", colors[i % colors.length]);
    leaf.style.setProperty("--d", `${rand(12, 22)}s`);
    leaf.style.setProperty("--delay", `${-rand(0, 22)}s`);
    leaf.style.scale = rand(0.6, 1.2).toFixed(2);
    leaves.appendChild(leaf);
  }
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
    g.addColorStop(0, `rgba(255, 236, 180, ${a})`);
    g.addColorStop(0.25, `rgba(255, 180, 90, ${a * 0.45})`);
    g.addColorStop(1, "rgba(240, 130, 50, 0)");
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
