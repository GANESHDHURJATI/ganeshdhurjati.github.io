const root = document.documentElement;
const themeButton = document.querySelector('[data-theme-toggle]');
const savedTheme = localStorage.getItem('portfolio-theme');

if (savedTheme === 'night') root.dataset.theme = 'night';

themeButton?.addEventListener('click', () => {
  const next = root.dataset.theme === 'night' ? 'day' : 'night';
  if (next === 'night') root.dataset.theme = 'night';
  else delete root.dataset.theme;
  localStorage.setItem('portfolio-theme', next);
  themeButton.setAttribute('aria-label', next === 'night' ? 'Switch to light theme' : 'Switch to dark theme');
});

const header = document.querySelector('[data-header]');
const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 20);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('visible'));
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', () => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) window.history.replaceState(null, '', link.getAttribute('href'));
  });
});