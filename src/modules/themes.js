/**
 * Themes Module
 * Handles theme switching functionality
 */

const themes = ['default', 'light', 'purple', 'blue', 'green'];
let currentThemeIndex = 0;

function init() {
  // Load saved theme
  const savedTheme = localStorage.getItem('tronvid-theme');
  if (savedTheme) {
    currentThemeIndex = themes.indexOf(savedTheme);
    if (currentThemeIndex === -1) currentThemeIndex = 0;
    apply(themes[currentThemeIndex]);
  }
  
  const themeBtn = document.getElementById('themeBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', cycle);
  }
}

function cycle() {
  currentThemeIndex = (currentThemeIndex + 1) % themes.length;
  const newTheme = themes[currentThemeIndex];
  apply(newTheme);
  localStorage.setItem('tronvid-theme', newTheme);
  showFeedback(newTheme);
}

function apply(theme) {
  if (theme === 'default') {
    document.body.removeAttribute('data-theme');
  } else {
    document.body.setAttribute('data-theme', theme);
  }
}

function showFeedback(theme) {
  const names = {
    default: 'Default (Dark)',
    light: 'Light',
    purple: 'Purple',
    blue: 'Blue',
    green: 'Green'
  };
  
  // Remove existing feedback
  const existing = document.querySelector('.theme-feedback');
  if (existing) existing.remove();
  
  // Create and show feedback
  const feedback = document.createElement('div');
  feedback.className = 'theme-feedback';
  feedback.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 16px 32px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    z-index: 10000;
    pointer-events: none;
    animation: feedbackFade 1s ease-out forwards;
  `;
  feedback.textContent = `Theme: ${names[theme] || theme}`;
  document.body.appendChild(feedback);
  
  setTimeout(() => feedback.remove(), 1000);
}

function getCurrent() {
  return themes[currentThemeIndex];
}

module.exports = {
  init,
  cycle,
  apply,
  getCurrent
};
