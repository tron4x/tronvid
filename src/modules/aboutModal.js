/**
 * About Modal Module
 * Handles the about modal functionality
 */

let aboutBtn = null;
let aboutModal = null;
let closeAbout = null;
let modalOverlay = null;

function init() {
  aboutBtn = document.getElementById('aboutBtn');
  aboutModal = document.getElementById('aboutModal');
  closeAbout = document.getElementById('closeAbout');
  modalOverlay = aboutModal ? aboutModal.querySelector('.modal-overlay') : null;
  
  setupEventListeners();
}

function setupEventListeners() {
  if (aboutBtn && aboutModal) {
    aboutBtn.addEventListener('click', open);
  }
  
  if (closeAbout) {
    closeAbout.addEventListener('click', close);
  }
  
  if (modalOverlay) {
    modalOverlay.addEventListener('click', close);
  }
  
  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && aboutModal && aboutModal.classList.contains('show')) {
      close();
    }
  });
}

function open() {
  if (aboutModal) {
    aboutModal.classList.add('show');
  }
}

function close() {
  if (aboutModal) {
    aboutModal.classList.remove('show');
  }
}

module.exports = {
  init,
  open,
  close
};
