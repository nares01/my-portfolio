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
  'Web Developer',
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

