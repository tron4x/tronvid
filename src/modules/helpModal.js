/**
 * Help Modal Module
 * Handles the help modal functionality
 */

let helpBtn = null;
let helpModal = null;
let closeHelp = null;
let helpModalOverlay = null;

function init() {
  helpBtn = document.getElementById('helpBtn');
  helpModal = document.getElementById('helpModal');
  closeHelp = document.getElementById('closeHelp');
  helpModalOverlay = helpModal ? helpModal.querySelector('.modal-overlay') : null;
  
  setupEventListeners();
}

function setupEventListeners() {
  if (helpBtn && helpModal) {
    helpBtn.addEventListener('click', open);
  }
  
  if (closeHelp) {
    closeHelp.addEventListener('click', close);
  }
  
  if (helpModalOverlay) {
    helpModalOverlay.addEventListener('click', close);
  }
  
  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && helpModal && helpModal.classList.contains('show')) {
      close();
    }
  });
}

function open() {
  if (helpModal) {
    helpModal.classList.add('show');
  }
}

function close() {
  if (helpModal) {
    helpModal.classList.remove('show');
  }
}

module.exports = {
  init,
  open,
  close
};
