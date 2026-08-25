// ============================================================
// IPLUG Orientation Deck — script.js
// 1) Generates an ambient animated circuit-board SVG background
// 2) Types out the title slide headline like a terminal
// 3) Wires up dot / arrow / keyboard / scroll navigation
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  buildCircuitBackground();
  typeTitle();
  initDeckNav();
  initEventExplorer();
  initDeadlineTimer();
});

/* ---------------- circuit background ---------------- */
function buildCircuitBackground() {
  const svg = document.getElementById('circuit-bg');
  const W = 1600, H = 900;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');

  const cols = 8, rows = 5;
  const stepX = W / cols, stepY = H / rows;
  let svgContent = '';

  // grid of right-angle circuit traces
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

/* ---------------- navigation ---------------- */
/* Right-side rail: unvisited slides show as plain dots. Visited slides get
   "eaten" (dot fades out, the green fill line grows to cover them). A
   glowing snake head sits on the current slide's position and travels
   down the rail as you advance, eating the next dot each time. */
function initDeckNav() {
  const deck = document.getElementById('deck');
  const slides = Array.from(document.querySelectorAll('.slide'));
  const dotNav = document.getElementById('dot-nav');
  const progress = document.getElementById('progress');
  const total = slides.length;
  let current = 0;

  // build track: background line + green fill + snake head + one dot per slide
  const track = document.createElement('div');
  track.className = 'dot-track';

  const trackLine = document.createElement('div');
  trackLine.className = 'dot-track-line';

  const trackFill = document.createElement('div');
  trackFill.className = 'dot-track-line-fill';

  const snake = document.createElement('div');
  snake.id = 'nav-snake';

  track.appendChild(trackLine);
  track.appendChild(trackFill);

  const dots = slides.map((_, idx) => {
    const dot = document.createElement('button');
    dot.className = 'dot';
    dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
    dot.addEventListener('click', () => goTo(idx));
    track.appendChild(dot);
    return dot;
  });

  track.appendChild(snake);
  dotNav.appendChild(track);

  function goTo(idx) {
    idx = Math.max(0, Math.min(total - 1, idx));
    slides[idx].scrollIntoView({ behavior: 'smooth' });
  }

  function setActive(idx) {
    current = idx;

    dots.forEach((d, i) => {
      d.classList.toggle('eaten', i < idx);   // slides already passed
      d.classList.toggle('current', i === idx); // snake is sitting here
    });

    // position the snake head + green fill line at the current dot
    const targetDot = dots[idx];
    const snakeY = targetDot.offsetTop + targetDot.offsetHeight / 2;
    snake.style.top = `${snakeY}px`;
    trackFill.style.height = `${Math.max(0, snakeY - 4)}px`;

    progress.style.width = `${((idx + 1) / total) * 100}%`;
  }

  // detect active slide on scroll via IntersectionObserver
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
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(e.key)) {
      e.preventDefault();
      goTo(current + 1);
    } else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) {
      e.preventDefault();
      goTo(current - 1);
    } else if (e.key === 'Home') {
      goTo(0);
    } else if (e.key === 'End') {
      goTo(total - 1);
    }
  });

  // dot offsets aren't final until layout settles — set once more after paint
  requestAnimationFrame(() => setActive(0));
  window.addEventListener('resize', () => setActive(current));
}

/* ---------------- merch deadline: live countdown ---------------- */
function initDeadlineTimer() {
  const box = document.querySelector('.deadline-box[data-deadline]');
  const el = document.getElementById('deadlineTimer');
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

/* ---------------- events-last-year: click to inspect ---------------- */
function initEventExplorer() {
  const cells = Array.from(document.querySelectorAll('.event-cell'));
  const detail = document.getElementById('eventDetail');
  if (!cells.length || !detail) return;

  cells.forEach((cell) => {
    cell.addEventListener('click', () => {
      cells.forEach((c) => c.classList.remove('active'));
      cell.classList.add('active');

      const title = cell.dataset.title || '';
      const blurb = cell.dataset.blurb || '[ ADD DATE / ONE-LINE HIGHLIGHT ]';
      const photoCount = parseInt(cell.dataset.photos || '2', 10);

      let photosHtml = '';
      for (let i = 0; i < photoCount; i++) {
        photosHtml += `<div class="photo-slot">[ PHOTO / POSTER ${i + 1} ]</div>`;
      }

      detail.innerHTML = `
        <h3>${title}</h3>
        <p>${blurb}</p>
        <div class="photo-row">${photosHtml}</div>
      `;
    });
  });
}
