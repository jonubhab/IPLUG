// ============================================================
// IPLUG Orientation Deck — mobile.js
// Horizontal slide deck: one .msection per screen, swipeable left/right.
// Bottom bar mirrors that with a horizontal dot rail + prev/next arrows.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  buildCircuitBackground();
  typeTitle();
  initDeadlineTimer();
  initHorizontalNav();
});

/* ---------------- circuit background ---------------- */
function buildCircuitBackground() {
  const svg = document.getElementById('circuit-bg');
  if (!svg) return;
  const W = 900, H = 1600;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');

  const cols = 5, rows = 9;
  const stepX = W / cols, stepY = H / rows;
  let svgContent = '';

  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) {
      const x = c * stepX, y = r * stepY;
      if (c < cols && Math.random() > 0.45) {
        const lit = Math.random() > 0.75;
        svgContent += `<path class="${lit ? 'trace-lit' : ''}" d="M ${x} ${y} L ${x + stepX} ${y}" style="animation-delay:${(Math.random() * 4).toFixed(2)}s"/>`;
      }
      if (r < rows && Math.random() > 0.45) {
        const lit = Math.random() > 0.75;
        svgContent += `<path class="${lit ? 'trace-lit' : ''}" d="M ${x} ${y} L ${x} ${y + stepY}" style="animation-delay:${(Math.random() * 4).toFixed(2)}s"/>`;
      }
      if (Math.random() > 0.82) {
        svgContent += `<circle class="node" cx="${x}" cy="${y}" r="3" style="animation-delay:${(Math.random() * 4).toFixed(2)}s"/>`;
      }
    }
  }
  svg.innerHTML = svgContent;
}

/* ---------------- terminal-style title typing ---------------- */
function typeTitle() {
  const el = document.getElementById('typed-title');
  if (!el) return;
  const text = 'IPLUG';
  let i = 0;
  el.textContent = '';
  const timer = setInterval(() => {
    el.textContent = text.slice(0, i + 1);
    i++;
    if (i >= text.length) clearInterval(timer);
  }, 160);
}

/* ---------------- merch deadline: live countdown ---------------- */
function initDeadlineTimer() {
  const box = document.querySelector('.deadline-box[data-deadline]');
  const el = document.getElementById('deadlineTimerMobile');
  if (!box || !el) return;

  const deadline = new Date(box.dataset.deadline).getTime();

  function render() {
    const diff = deadline - Date.now();
    if (diff <= 0) {
      el.textContent = 'Submissions closed';
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    el.innerHTML =
      `${d}<span class="unit">d</span> ${String(h).padStart(2, '0')}<span class="unit">h</span> ` +
      `${String(m).padStart(2, '0')}<span class="unit">m</span> ${String(s).padStart(2, '0')}<span class="unit">s</span>`;
  }

  render();
  const timer = setInterval(() => {
    render();
    if (deadline - Date.now() <= 0) clearInterval(timer);
  }, 1000);
}

/* ---------------- horizontal slide navigation ---------------- */
function initHorizontalNav() {
  const deck = document.getElementById('mdeck');
  const slides = Array.from(document.querySelectorAll('.msection'));
  const dotTrack = document.getElementById('dot-track');
  const prevBtn = document.getElementById('nav-prev');
  const nextBtn = document.getElementById('nav-next');
  if (!deck || !slides.length || !dotTrack) return;

  const total = slides.length;
  let current = 0;

  const dots = slides.map((slide, idx) => {
    const dot = document.createElement('button');
    dot.className = 'dot';
    dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
    if (slide.dataset.theme === 'gaming') dot.classList.add('theme-gaming');
    dot.addEventListener('click', () => goTo(idx));
    dotTrack.appendChild(dot);
    return dot;
  });

  function goTo(idx) {
    idx = Math.max(0, Math.min(total - 1, idx));
    slides[idx].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
  }

  function setActive(idx) {
    current = idx;
    dots.forEach((d, i) => d.classList.toggle('current', i === idx));
    const activeDot = dots[idx];
    if (activeDot && activeDot.scrollIntoView) {
      activeDot.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
    if (prevBtn) prevBtn.disabled = idx === 0;
    if (nextBtn) nextBtn.disabled = idx === total - 1;
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
        const idx = slides.indexOf(entry.target);
        if (idx !== -1) setActive(idx);
      }
    });
  }, { root: deck, threshold: [0.6] });
  slides.forEach((s) => observer.observe(s));

  window.addEventListener('keydown', (e) => {
    if (['ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
      goTo(current + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goTo(current - 1);
    }
  });

  requestAnimationFrame(() => setActive(0));
}
