/**
 * Themes Module (Browser-compatible, no Node.js required)
 */

const themesModule = {
  themes: ['dark', 'light', 'purple', 'blue', 'green'],
  currentTheme: 'dark',
  
  init() {
    // Load saved theme
    const saved = localStorage.getItem('tronvid-theme');
    if (saved && this.themes.includes(saved)) {
      this.currentTheme = saved;
    }
    this.apply(this.currentTheme);
    
    // Setup theme button
    const themeBtn = document.getElementById('themeBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this.cycle());
    }
  },
  
  apply(theme) {
    document.body.setAttribute('data-theme', theme);
    this.currentTheme = theme;
    localStorage.setItem('tronvid-theme', theme);
  },
  
  cycle() {
    const currentIndex = this.themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % this.themes.length;
    const nextTheme = this.themes[nextIndex];
    
    this.apply(nextTheme);
    this.showFeedback(nextTheme);
  },
  
  showFeedback(theme) {
    const existing = document.querySelector('.theme-feedback');
    if (existing) existing.remove();
    
    const feedback = document.createElement('div');
    feedback.className = 'theme-feedback';
    feedback.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.85);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      z-index: 10000;
      pointer-events: none;
      animation: feedbackFade 0.8s ease-out forwards;
    `;
    feedback.textContent = `Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`;
    document.body.appendChild(feedback);
    
    setTimeout(() => feedback.remove(), 800);
  }
};

module.exports = themesModule;
