/* ─── Scroll Progress Bar ─── */
const progressBar = document.getElementById('progress-bar');
function updateProgress() {
  const scrolled = window.scrollY;
  const total    = document.body.scrollHeight - window.innerHeight;
  progressBar.style.width = total > 0 ? (scrolled / total * 100) + '%' : '0%';
}

/* ─── Navbar hide / show on scroll ─── */
const navbar = document.getElementById('navbar');
let lastScrollY = 0;

window.addEventListener('scroll', () => {
  const currentY = window.scrollY;
  updateProgress();

  // Add glass background once user scrolls past 60px
  navbar.classList.toggle('scrolled', currentY > 60);

  // Hide on scroll down, reveal on scroll up
  if (currentY > lastScrollY && currentY > 250) {
    navbar.classList.add('nav-hidden');
  } else {
    navbar.classList.remove('nav-hidden');
  }
  lastScrollY = currentY;
}, { passive: true });

/* ─── Mobile Menu ─── */
const hamburger   = document.getElementById('hamburger');
const mobileMenu  = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

document.querySelectorAll('#mobile-menu a').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

/* ─── Intersection Observer — Reveal on scroll ─── */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target); // fire once
      }
    });
  },
  { threshold: 0.12 }
);

revealEls.forEach(el => revealObserver.observe(el));

// Immediately reveal hero items (already in viewport on load)
document.querySelectorAll('#home .reveal').forEach(el => {
  el.classList.add('visible');
});

/* ─── Typewriter Effect ─── */
const roles = [
  'Frontend Developer',
  'Python Enthusiast',
  'Problem Solver',
  'BCA Student',
];

const typedEl   = document.getElementById('typed-role');
let roleIndex   = 0;
let charIndex   = 0;
let isDeleting  = false;

function typeRole() {
  const current = roles[roleIndex];

  if (!isDeleting) {
    typedEl.textContent = current.slice(0, charIndex + 1);
    charIndex++;
    if (charIndex === current.length) {
      isDeleting = true;
      return setTimeout(typeRole, 1800);
    }
  } else {
    typedEl.textContent = current.slice(0, charIndex - 1);
    charIndex--;
    if (charIndex === 0) {
      isDeleting  = false;
      roleIndex   = (roleIndex + 1) % roles.length;
    }
  }

  setTimeout(typeRole, isDeleting ? 55 : 85);
}

typeRole();

/* ─── Active nav link highlight on scroll ─── */
const sections  = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navAnchors.forEach(a => {
          a.style.color = '';
          if (a.getAttribute('href') === '#' + entry.target.id) {
            a.style.color = 'var(--accent)';
          }
        });
      }
    });
  },
  { rootMargin: '-40% 0px -55% 0px' }
);

sections.forEach(s => sectionObserver.observe(s));

/* ─── Liquid Space Droplets ─── */
(function () {

  const prev = document.getElementById('liq-cv');
  if (prev) prev.remove();

  const cv = document.createElement('canvas');
  cv.id    = 'liq-cv';
  Object.assign(cv.style, {
    position: 'fixed', inset: '0',
    width: '100%', height: '100%',
    zIndex: '1', pointerEvents: 'none',
  });
  document.body.appendChild(cv);
  const ctx = cv.getContext('2d');

  let W = cv.width  = window.innerWidth;
  let H = cv.height = window.innerHeight;
  window.addEventListener('resize', () => {
    W = cv.width  = window.innerWidth;
    H = cv.height = window.innerHeight;
  }, { passive: true });

  /* ── Constants ── */
  const MIN_R   = 18;
  const MAX_R   = 128;
  const DRIFT   = 0.011;
  const MAX_SPD = 0.85;

  /* ── State ── */
  let uid = 0, tick = 0;
  let drops   = [];
  let ripples = [];
  let mX = -9999, mY = -9999;

  /* ── Drop factory ── */
  function mkDrop(x, y, r, vx, vy, grace) {
    grace = (grace !== undefined) ? grace : 18;
    return {
      id   : uid++,
      x, y,
      r    : Math.min(Math.max(r, MIN_R), MAX_R),
      vx   : (vx !== undefined) ? vx : (Math.random() - 0.5) * 0.8,
      vy   : (vy !== undefined) ? vy : (Math.random() - 0.5) * 0.8,
      alpha: 0,
      ph   : Math.random() * Math.PI * 2,
      born : tick,
      grace: grace,
      alive: true,
    };
  }

  /* ── Seed 8 drops ── */
  function seed() {
    [62, 75, 50, 68, 55, 72, 45, 58].forEach(function (r) {
      drops.push(mkDrop(
        r + Math.random() * (W - r * 2),
        r + Math.random() * (H - r * 2),
        r
      ));
    });
  }

  /* ── Multi-frequency zero-G wave ── */
  function wv(t, s) {
    return Math.sin(t * 0.00033 + s)         * 0.56
         + Math.cos(t * 0.00018 + s * 2.13)  * 0.27
         + Math.sin(t * 0.00059 + s * 0.71)  * 0.12
         + Math.cos(t * 0.00092 + s * 3.07)  * 0.06;
  }

  /* ── Merge two drops into one ── */
  function merge(a, b) {
    var ma = a.r * a.r, mb = b.r * b.r, mt = ma + mb;
    var nx  = (a.x * ma + b.x * mb) / mt;
    var ny  = (a.y * ma + b.y * mb) / mt;
    var nr  = Math.sqrt(mt);
    var nvx = (a.vx * ma + b.vx * mb) / mt * 0.50;
    var nvy = (a.vy * ma + b.vy * mb) / mt * 0.50;

    a.alive = b.alive = false;
    spawnRipple(nx, ny, nr * 0.55);

    var d    = mkDrop(nx, ny, nr, nvx, nvy, 25);
    d.alpha  = 0.55;
    drops.push(d);
  }

  /* ── Shatter one drop into pieces ── */
  function shatter(d) {
    d.alive = false;
    spawnRipple(d.x, d.y, d.r);
    spawnRipple(d.x, d.y, d.r * 0.5);

    var n  = Math.max(5, Math.min(9, Math.floor(d.r / 11)));
    var pr = Math.sqrt((d.r * d.r) / n);

    for (var i = 0; i < n; i++) {
      var ang   = (Math.PI * 2 / n) * i + (Math.random() - 0.5) * 0.7;
      var spd   = 1.8 + Math.random() * 3.0;
      var piece = mkDrop(
        d.x + Math.cos(ang) * d.r * 0.28,
        d.y + Math.sin(ang) * d.r * 0.28,
        Math.max(pr * (0.72 + Math.random() * 0.56), MIN_R),
        Math.cos(ang) * spd,
        Math.sin(ang) * spd,
        90
      );
      piece.alpha = 0.12;
      drops.push(piece);
    }
  }

  /* ── Ripple rings ── */
  function spawnRipple(x, y, baseR) {
    baseR = baseR || 30;
    ripples.push({ x: x, y: y, r: baseR * 0.5,  alpha: 0.65, spd: 3.2 });
    ripples.push({ x: x, y: y, r: baseR * 0.22, alpha: 0.38, spd: 1.9 });
  }

  function drawRipples() {
    for (var i = ripples.length - 1; i >= 0; i--) {
      var p = ripples[i];
      p.r    += p.spd;
      p.alpha -= 0.016;
      if (p.alpha <= 0) { ripples.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.strokeStyle = 'rgba(34,211,238,0.55)';
      ctx.lineWidth   = 1.3;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  /* ── Draw one liquid drop ── */
  function drawDrop(d) {
    if (d.alpha < 0.01 || d.r < 1) return;
    var x = d.x, y = d.y, r = d.r;
    ctx.save();
    ctx.globalAlpha = d.alpha;

    /* outer halo glow */
    var halo = ctx.createRadialGradient(x, y, r * 0.7, x, y, r * 1.9);
    halo.addColorStop(0, 'rgba(34,211,238,0.075)');
    halo.addColorStop(1, 'rgba(34,211,238,0)');
    ctx.beginPath(); ctx.arc(x, y, r * 1.9, 0, Math.PI * 2);
    ctx.fillStyle = halo; ctx.fill();

    /* transparent liquid body */
    var body = ctx.createRadialGradient(
      x - r * 0.17, y - r * 0.13, r * 0.01,
      x + r * 0.07, y + r * 0.04, r
    );
    body.addColorStop(0,    'rgba(210,252,255,0.19)');
    body.addColorStop(0.30, 'rgba(34,211,238,0.11)');
    body.addColorStop(0.70, 'rgba(18,180,220,0.07)');
    body.addColorStop(1,    'rgba(10,148,195,0.21)');
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = body; ctx.fill();

    /* rim edge */
    ctx.strokeStyle = 'rgba(34,211,238,0.30)';
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    /* top-left specular highlight */
    var hl = ctx.createRadialGradient(
      x - r * 0.28, y - r * 0.30, 0,
      x - r * 0.28, y - r * 0.30, r * 0.46
    );
    hl.addColorStop(0,    'rgba(255,255,255,0.72)');
    hl.addColorStop(0.42, 'rgba(255,255,255,0.20)');
    hl.addColorStop(1,    'rgba(255,255,255,0)');
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = hl; ctx.fill();

    /* bottom-right amber refraction */
    var ref = ctx.createRadialGradient(
      x + r * 0.29, y + r * 0.37, 0,
      x + r * 0.29, y + r * 0.37, r * 0.27
    );
    ref.addColorStop(0, 'rgba(245,200,55,0.33)');
    ref.addColorStop(1, 'rgba(245,200,55,0)');
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = ref; ctx.fill();

    /* tiny secondary sparkle */
    var sp = ctx.createRadialGradient(
      x + r * 0.16, y - r * 0.43, 0,
      x + r * 0.16, y - r * 0.43, r * 0.11
    );
    sp.addColorStop(0, 'rgba(255,255,255,0.52)');
    sp.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = sp; ctx.fill();

    ctx.restore();
  }

  /* ── Draw liquid bridge between nearby drops ── */
  function drawBridge(a, b) {
    var dx   = b.x - a.x, dy = b.y - a.y;
    var dist = Math.hypot(dx, dy);
    var gap  = dist - a.r - b.r;
    var THR  = 90;
    if (gap > THR || a.alpha < 0.06 || b.alpha < 0.06) return;

    var t    = Math.pow(Math.max(0, 1 - gap / THR), 1.55);
    var perp = Math.atan2(dy, dx) + Math.PI * 0.5;
    var cp   = Math.cos(perp), sp2 = Math.sin(perp);
    var w1   = a.r * t * 0.56, w2 = b.r * t * 0.56;
    var mx   = (a.x + b.x) * 0.5, my = (a.y + b.y) * 0.5;
    var pull = 1 - t * 0.32;

    ctx.save();
    ctx.globalAlpha = Math.min(a.alpha, b.alpha) * t * 0.88;
    ctx.beginPath();
    ctx.moveTo(a.x + cp * w1, a.y + sp2 * w1);
    ctx.quadraticCurveTo(
      mx + cp * w1 * pull * 0.3, my + sp2 * w1 * pull * 0.3,
      b.x + cp * w2, b.y + sp2 * w2
    );
    ctx.lineTo(b.x - cp * w2, b.y - sp2 * w2);
    ctx.quadraticCurveTo(
      mx - cp * w2 * pull * 0.3, my - sp2 * w2 * pull * 0.3,
      a.x - cp * w1, a.y - sp2 * w1
    );
    ctx.closePath();

    var g = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
    g.addColorStop(0,   'rgba(34,211,238,0.24)');
    g.addColorStop(0.5, 'rgba(34,211,238,0.13)');
    g.addColorStop(1,   'rgba(34,211,238,0.24)');
    ctx.fillStyle   = g; ctx.fill();
    ctx.strokeStyle = 'rgba(34,211,238,' + (0.19 * t) + ')';
    ctx.lineWidth   = 0.9;
    ctx.stroke();
    ctx.restore();
  }

  /* ── Mouse / touch interaction ── */
  document.addEventListener('mousemove', function (e) {
    mX = e.clientX; mY = e.clientY;
    var hovered = false;
    for (var i = drops.length - 1; i >= 0; i--) {
      var d = drops[i];
      if (!d.alive) continue;
      var hit = Math.hypot(mX - d.x, mY - d.y) < d.r;
      if (hit) {
        hovered = true;
        if (tick - d.born > d.grace && d.r >= MIN_R + 2) {
          shatter(d); break;
        }
      }
    }
    document.body.style.cursor = hovered ? 'crosshair' : '';
  });

  document.addEventListener('touchstart', function (e) {
    var t = e.touches[0];
    for (var i = drops.length - 1; i >= 0; i--) {
      var d = drops[i];
      if (!d.alive || tick - d.born <= d.grace) continue;
      if (Math.hypot(t.clientX - d.x, t.clientY - d.y) < d.r) {
        shatter(d); break;
      }
    }
  }, { passive: true });

  /* ── Main animation loop ── */
  function frame() {
    ctx.clearRect(0, 0, W, H);
    tick++;

    /* Physics update */
    drops.forEach(function (d) {
      if (!d.alive) return;

      /* Fade in */
      if (d.alpha < 1) d.alpha = Math.min(1, d.alpha + 0.02);

      /* Zero-gravity organic drift */
      d.vx += wv(tick, d.id * 137.508 + d.ph) * DRIFT;
      d.vy += wv(tick, d.id * 251.318 + d.ph + 90) * DRIFT;

      /* Speed cap — bigger drops drift slower */
      var spCap = MAX_SPD + 35 / d.r;
      var spd   = Math.hypot(d.vx, d.vy);
      if (spd > spCap) { d.vx *= spCap / spd; d.vy *= spCap / spd; }

      d.x += d.vx; d.y += d.vy;

      /* Elastic wall bounce */
      if (d.x - d.r < 0)  { d.x = d.r;     d.vx =  Math.abs(d.vx) * 0.74; }
      if (d.x + d.r > W)  { d.x = W - d.r; d.vx = -Math.abs(d.vx) * 0.74; }
      if (d.y - d.r < 0)  { d.y = d.r;     d.vy =  Math.abs(d.vy) * 0.74; }
      if (d.y + d.r > H)  { d.y = H - d.r; d.vy = -Math.abs(d.vy) * 0.74; }
    });

    /* Merge pass — one per frame for stability */
    var alive = drops.filter(function (d) { return d.alive; });
    outer:
    for (var i = 0; i < alive.length; i++) {
      for (var j = i + 1; j < alive.length; j++) {
        var a = alive[i], b = alive[j];
        if (!a.alive || !b.alive) continue;
        if (tick - a.born <= a.grace || tick - b.born <= b.grace) continue;
        var nr = Math.sqrt(a.r * a.r + b.r * b.r);
        if (nr > MAX_R) continue;
        if (Math.hypot(a.x - b.x, a.y - b.y) < (a.r + b.r) * 0.65) {
          merge(a, b);
          break outer;
        }
      }
    }

    /* Cull dead drops */
    drops = drops.filter(function (d) { return d.alive; });

    /* Replenish if too few */
    if (drops.length < 5) {
      var r = 30 + Math.random() * 28;
      drops.push(mkDrop(
        r + Math.random() * (W - r * 2),
        r + Math.random() * (H - r * 2),
        r
      ));
    }

    /* Render — bridges behind, drops on top, ripples last */
    var live = drops.filter(function (d) { return d.alive; });
    

    live.forEach(drawDrop);
    drawRipples();

    requestAnimationFrame(frame);
  }

  seed();
  frame();

})();