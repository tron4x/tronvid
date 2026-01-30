/**
 * Help Modal Module (Browser-compatible, no Node.js required)
 */

const helpModalModule = {
  helpModal: null,
  closeHelp: null,
  helpModalOverlay: null,
  
  init() {
    this.helpModal = document.getElementById('helpModal');
    this.closeHelp = document.getElementById('closeHelp');
    this.helpModalOverlay = this.helpModal ? this.helpModal.querySelector('.modal-overlay') : null;
    
    this.setupEventListeners();
  },
  
  setupEventListeners() {
    const helpBtn = document.getElementById('helpBtn');
    
    if (helpBtn) {
      helpBtn.addEventListener('click', () => this.open());
    }
    
    if (this.closeHelp) {
      this.closeHelp.addEventListener('click', () => this.close());
    }
    
    if (this.helpModalOverlay) {
      this.helpModalOverlay.addEventListener('click', () => this.close());
    }
    
    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.helpModal && this.helpModal.classList.contains('show')) {
        this.close();
      }
    });
  },
  
  open() {
    if (this.helpModal) {
      this.helpModal.classList.add('show');
    }
  },
  
  close() {
    if (this.helpModal) {
      this.helpModal.classList.remove('show');
    }
  }
};

module.exports = helpModalModule;
