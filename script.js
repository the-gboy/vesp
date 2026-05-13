// ───── starfield canvas ───────────────────────────────
(() => {
  const c = document.getElementById('stars');
  if (!c) return;
  const ctx = c.getContext('2d');
  let stars = [];
  let shootingStars = [];
  let w, h, dpr;

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = c.clientWidth = window.innerWidth;
    h = c.clientHeight = window.innerHeight;
    c.width = w * dpr;
    c.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function seed() {
    stars = [];
    const count = Math.floor((w * h) / 9000);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.2 + 0.2,
        a: Math.random() * 0.6 + 0.2,
        twk: Math.random() * 0.02 + 0.003,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function spawnShootingStar() {
    const startX = Math.random() * w * 0.6;
    const startY = Math.random() * h * 0.4;
    shootingStars.push({
      x: startX,
      y: startY,
      vx: 6 + Math.random() * 3,
      vy: 2 + Math.random() * 1.5,
      life: 1,
      len: 80 + Math.random() * 60,
    });
  }

  let t = 0;
  function tick() {
    ctx.clearRect(0, 0, w, h);
    t += 0.016;

    for (const s of stars) {
      const tw = 0.5 + Math.sin(t * 1.4 + s.phase) * 0.5;
      const alpha = s.a * (0.4 + 0.6 * tw);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`;
      ctx.fill();
    }

    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const ss = shootingStars[i];
      ss.x += ss.vx;
      ss.y += ss.vy;
      ss.life -= 0.012;
      if (ss.life <= 0 || ss.x > w || ss.y > h) {
        shootingStars.splice(i, 1);
        continue;
      }
      const grad = ctx.createLinearGradient(
        ss.x, ss.y,
        ss.x - ss.vx * ss.len / 6, ss.y - ss.vy * ss.len / 6
      );
      grad.addColorStop(0, `rgba(180, 230, 255, ${ss.life})`);
      grad.addColorStop(1, 'rgba(180, 230, 255, 0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(ss.x, ss.y);
      ctx.lineTo(ss.x - ss.vx * ss.len / 6, ss.y - ss.vy * ss.len / 6);
      ctx.stroke();
    }

    if (Math.random() < 0.004 && shootingStars.length < 2) spawnShootingStar();

    requestAnimationFrame(tick);
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  size();
  seed();
  window.addEventListener('resize', () => { size(); seed(); });
  if (!reduced) tick();
  else {
    // single static frame
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 220, 255, ${s.a})`;
      ctx.fill();
    }
  }
})();

// ───── scroll reveal observer ─────────────────────────
(() => {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        const delay = e.target.dataset.delay || 0;
        setTimeout(() => e.target.classList.add('in'), Number(delay));
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  items.forEach(el => io.observe(el));
})();

// ───── parallax on hero logo ──────────────────────────
(() => {
  const logo = document.querySelector('.hero-logo');
  if (!logo) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;
  let tx = 0, ty = 0, x = 0, y = 0;
  window.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    tx = (e.clientX - cx) / cx * 14;
    ty = (e.clientY - cy) / cy * 14;
  });
  function step() {
    x += (tx - x) * 0.06;
    y += (ty - y) * 0.06;
    logo.style.setProperty('--px', x.toFixed(2) + 'px');
    logo.style.setProperty('--py', y.toFixed(2) + 'px');
    logo.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
    requestAnimationFrame(step);
  }
  step();
})();

// ───── footer year ────────────────────────────────────
document.getElementById('yr').textContent = new Date().getFullYear();
