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
    if (link.matches('[data-game-start]')) return;
    const target = document.querySelector(link.getAttribute('href'));
    if (target) window.history.replaceState(null, '', link.getAttribute('href'));
  });
});

const gameShell = document.querySelector('.game-shell');
const handheld = document.querySelector('.handheld');
const gamePages = [...document.querySelectorAll('[data-game-page]')];
const gameNavButtons = [...document.querySelectorAll('[data-game-nav]')];
let gameIsOpen = false;
let currentGamePage = 'menu';
let selectedGameIndex = 0;
let lastGameTrigger;

const getGameChoices = () => {
  const activePage = document.querySelector('[data-game-page].is-active');
  const pageChoices = activePage ? [...activePage.querySelectorAll('button[data-open-page]')] : [];
  return pageChoices.length ? pageChoices : gameNavButtons;
};

const selectGameChoice = (index, focus = false) => {
  const choices = getGameChoices();
  if (!choices.length) return;
  selectedGameIndex = (index + choices.length) % choices.length;
  document.querySelectorAll('.game-menu-card.is-selected').forEach((item) => item.classList.remove('is-selected'));
  const selected = choices[selectedGameIndex];
  if (selected.classList.contains('game-menu-card')) selected.classList.add('is-selected');
  if (focus) selected.focus({ preventScroll: true });
};

const showGamePage = (pageName) => {
  if (!gamePages.some((page) => page.dataset.gamePage === pageName)) return;
  currentGamePage = pageName;
  gamePages.forEach((page) => page.classList.toggle('is-active', page.dataset.gamePage === pageName));
  gameNavButtons.forEach((button) => button.classList.toggle('is-selected', button.dataset.gameNav === pageName));
  const pageScroller = document.querySelector('.game-pages');
  if (pageScroller) pageScroller.scrollTop = 0;
  selectedGameIndex = 0;
  selectGameChoice(0);
};

const enterGame = (pageName = 'menu', trigger = document.activeElement) => {
  if (!gameShell || gameIsOpen) return;
  gameIsOpen = true;
  lastGameTrigger = trigger;
  document.body.classList.add('game-launching');
  handheld?.classList.add('is-launching');
  window.setTimeout(() => {
    document.body.classList.add('game-open');
    gameShell.classList.add('is-open');
    gameShell.setAttribute('aria-hidden', 'false');
    showGamePage(pageName);
    gameShell.focus({ preventScroll: true });
    handheld?.classList.remove('is-launching');
    window.setTimeout(() => document.body.classList.remove('game-launching'), 320);
  }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 30 : 680);
};

const exitGame = () => {
  if (!gameShell || !gameIsOpen) return;
  gameIsOpen = false;
  gameShell.classList.remove('is-open');
  gameShell.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('game-open', 'game-launching');
  window.setTimeout(() => lastGameTrigger?.focus?.({ preventScroll: true }), 50);
};

const gameBack = () => currentGamePage === 'menu' ? exitGame() : showGamePage('menu');
const chooseGameItem = () => {
  const choices = getGameChoices();
  const selected = choices[selectedGameIndex] || choices[0];
  selected?.click();
};

document.querySelectorAll('[data-game-start]').forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    enterGame(trigger.dataset.gameStart || 'menu', trigger);
  });
});
gameNavButtons.forEach((button) => button.addEventListener('click', () => showGamePage(button.dataset.gameNav)));
document.querySelectorAll('[data-open-page]').forEach((button) => button.addEventListener('click', () => showGamePage(button.dataset.openPage)));
document.querySelector('[data-game-exit]')?.addEventListener('click', exitGame);
document.querySelector('[data-game-back]')?.addEventListener('click', gameBack);
document.querySelector('[data-game-choose]')?.addEventListener('click', chooseGameItem);
document.querySelector('[data-game-up]')?.addEventListener('click', () => selectGameChoice(selectedGameIndex - 1, true));
document.querySelector('[data-game-down]')?.addEventListener('click', () => selectGameChoice(selectedGameIndex + 1, true));
document.addEventListener('keydown', (event) => {
  if (gameIsOpen) {
    if (/input|textarea|select/i.test(event.target.tagName)) return;
    const key = event.key.toLowerCase();
    if (key === 'arrowup' || key === 'arrowleft') {
      event.preventDefault();
      selectGameChoice(selectedGameIndex - 1, true);
    } else if (key === 'arrowdown' || key === 'arrowright') {
      event.preventDefault();
      selectGameChoice(selectedGameIndex + 1, true);
    } else if (key === 'enter' && event.target.matches('a, button')) {
      return;
    } else if (key === 'a' || key === 'enter') {
      event.preventDefault();
      chooseGameItem();
    } else if (key === 'b' || key === 'escape') {
      event.preventDefault();
      gameBack();
    }
    return;
  }
  const hero = document.querySelector('.handheld-hero');
  if (!hero || hero.getBoundingClientRect().bottom < 0 || /input|textarea/i.test(event.target.tagName)) return;
  if (event.key.toLowerCase() === 'a') enterGame('menu', document.querySelector('[data-game-start]'));
  if (event.key.toLowerCase() === 'b') enterGame('work', document.querySelector('[data-game-start="work"]'));
});
