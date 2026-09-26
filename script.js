// Date du mariage : 23 octobre 2027, heure de Paris (CEST, UTC+2).
// Ajustez l'heure ici si besoin (ex. "T15:00:00+02:00" pour la cérémonie).
const WEDDING_DATE = new Date("2027-10-23T00:00:00+02:00");

// Adresse Formspree qui reçoit les réponses RSVP (ex. "https://formspree.io/f/abcdwxyz").
// Tant qu'elle est vide, le formulaire indique que les réponses ne sont pas encore ouvertes.
const RSVP_ENDPOINT = "";

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
  "SUMMARY:Mariage de Sophie & Mathieu 💍",
  "LOCATION:Domaine de Fourniol\\, 82240 Septfonds",
  "END:VEVENT",
  "END:VCALENDAR",
].join("\r\n");

document.getElementById("add-calendar").href =
  "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);

/* ---------- Formulaire RSVP ---------- */

const rsvp = document.getElementById("rsvp");
const form = document.getElementById("rsvp-form");
const ifYes = form.querySelector(".if-yes");
const errorBox = document.getElementById("rsvp-error");

if ("IntersectionObserver" in window) {
  new IntersectionObserver((entries, obs) => {
    if (entries[0].isIntersecting) {
      rsvp.classList.add("visible");
      obs.disconnect();
    }
  }, { threshold: 0.15 }).observe(rsvp);
} else {
  rsvp.classList.add("visible");
}

form.addEventListener("input", () => { errorBox.hidden = true; });

form.addEventListener("change", (e) => {
  if (e.target.name === "presence") ifYes.hidden = e.target.value !== "oui";
  if (e.target.matches("[aria-invalid]")) e.target.removeAttribute("aria-invalid");
});

function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = false;
}

function validate() {
  let first = null;
  for (const input of form.querySelectorAll("#rsvp-name, #rsvp-email")) {
    const ok = input.checkValidity() && input.value.trim() !== "";
    if (ok) input.removeAttribute("aria-invalid");
    else input.setAttribute("aria-invalid", "true");
    first ||= ok ? null : input;
  }
  if (first) {
    showError("Merci d'indiquer votre nom et une adresse e-mail valide.");
    first.focus();
    return false;
  }
  if (!form.presence.value) {
    showError("Merci de nous dire si vous serez présent·e.");
    return false;
  }
  return true;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorBox.hidden = true;
  if (!validate()) return;

  if (!RSVP_ENDPOINT) {
    showError("Les réponses ne sont pas encore ouvertes, revenez très bientôt !");
    return;
  }

  const data = new FormData(form);
  if (data.get("presence") === "non") {
    data.delete("personnes");
    data.delete("regime");
  }
  data.append("_subject", `RSVP mariage : ${data.get("nom")} (${data.get("presence")})`);

  const button = form.querySelector("button");
  button.disabled = true;
  button.textContent = "Envoi…";

  try {
    const res = await fetch(RSVP_ENDPOINT, {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(res.status);

    const coming = data.get("presence") === "oui";
    document.getElementById("rsvp-thanks-text").textContent = coming
      ? "Nous avons hâte de fêter ce jour avec vous le 23 octobre 2027 !"
      : "Vous nous manquerez, merci d'avoir pris le temps de répondre.";
    form.hidden = true;
    document.getElementById("rsvp-thanks").hidden = false;
  } catch {
    showError("Oups, l'envoi n'a pas fonctionné. Merci de réessayer dans un instant.");
    button.disabled = false;
    button.textContent = "Envoyer ma réponse";
  }
});

function rand(min, max) {
  return min + Math.random() * (max - min);
}

/* ---------- Feuilles d'érable et de chêne qui tombent ---------- */

if (!reduceMotion) {
  const back = document.querySelector(".scene-back .leaves");
  const front = document.querySelector(".scene-front .leaves");
  const colors = ["#d9622b", "#c8893a", "#b5402a", "#e8a33d", "#8f3f2a", "#f0c470", "#a0522d"];
  for (let i = 0; i < 24; i++) {
    const leaf = document.createElement("span");
    leaf.className = `leaf ${i % 3 ? "maple" : "oak"}`;
    leaf.style.left = `${rand(0, 100)}%`;
    leaf.style.setProperty("--c", colors[i % colors.length]);
    leaf.style.setProperty("--d", `${rand(12, 22)}s`);
    leaf.style.setProperty("--delay", `${-rand(0, 22)}s`);
    leaf.style.scale = rand(0.6, 1.2).toFixed(2);
    (i % 4 === 0 ? front : back).appendChild(leaf);
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
