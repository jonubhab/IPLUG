document.addEventListener('DOMContentLoaded', () => {
  buildCircuitBackground();
  initDeadlineTimer();
});

/* ---------------- circuit background ---------------- */
function buildCircuitBackground() {
  const svg = document.getElementById('circuit-bg');
  if (!svg) return;
  const W = 1600, H = 1400;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');

  const cols = 8, rows = 8;
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
