/**
 * About Modal Module (Browser-compatible, no Node.js required)
 */

const aboutModalModule = {
  aboutModal: null,
  closeAbout: null,
  modalOverlay: null,
  
  init() {
    this.aboutModal = document.getElementById('aboutModal');
    this.closeAbout = document.getElementById('closeAbout');
    this.modalOverlay = this.aboutModal ? this.aboutModal.querySelector('.modal-overlay') : null;
    
    this.setupEventListeners();
  },
  
  setupEventListeners() {
    const aboutBtn = document.getElementById('aboutBtn');
    
    if (aboutBtn) {
      aboutBtn.addEventListener('click', () => this.open());
    }
    
    if (this.closeAbout) {
      this.closeAbout.addEventListener('click', () => this.close());
    }
    
    if (this.modalOverlay) {
      this.modalOverlay.addEventListener('click', () => this.close());
    }
    
    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.aboutModal && this.aboutModal.classList.contains('show')) {
        this.close();
      }
    });
  },
  
  open() {
    if (this.aboutModal) {
      this.aboutModal.classList.add('show');
    }
  },
  
  close() {
    if (this.aboutModal) {
      this.aboutModal.classList.remove('show');
    }
  }
};

module.exports = aboutModalModule;
