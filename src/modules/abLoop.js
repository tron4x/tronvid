/**
 * A-B Loop Module
 * Handles A-B looping functionality for video playback
 */

let videoPlayer = null;
let abLoopBtn = null;
let abLoopDisplay = null;
let abLoopIndicator = null;
let progressWrapper = null;

// A-B Loop state
let abLoop = {
  a: null,
  b: null,
  active: false
};

function init(player) {
  videoPlayer = player;
  abLoopBtn = document.getElementById('abLoopBtn');
  abLoopDisplay = document.getElementById('abLoopDisplay');
  abLoopIndicator = document.getElementById('abLoopIndicator');
  progressWrapper = document.querySelector('.progress-wrapper');
  
  setupEventListeners();
}

function setupEventListeners() {
  if (abLoopBtn) {
    abLoopBtn.addEventListener('click', toggleLoop);
  }
  
  // Monitor video time for A-B loop
  if (videoPlayer) {
    videoPlayer.addEventListener('timeupdate', checkLoop);
  }
}

function setPointA() {
  if (!videoPlayer || !videoPlayer.src) return;
  
  abLoop.a = videoPlayer.currentTime;
  updateDisplay();
  updateProgressMarkers();
  showFeedback(`A: ${formatTime(abLoop.a)}`);
}

function setPointB() {
  if (!videoPlayer || !videoPlayer.src) return;
  
  abLoop.b = videoPlayer.currentTime;
  if (abLoop.a !== null && abLoop.b > abLoop.a) {
    abLoop.active = true;
  }
  updateDisplay();
  updateProgressMarkers();
  showFeedback(`B: ${formatTime(abLoop.b)}`);
}

function clear() {
  abLoop = { a: null, b: null, active: false };
  updateDisplay();
  updateProgressMarkers();
  showFeedback('A-B Loop Cleared');
}

function toggleLoop() {
  if (abLoop.a !== null && abLoop.b !== null) {
    abLoop.active = !abLoop.active;
    updateDisplay();
    showFeedback(abLoop.active ? 'A-B Loop On' : 'A-B Loop Off');
  } else {
    // If no points set, set point A
    setPointA();
  }
}

function checkLoop() {
  if (!abLoop.active || abLoop.a === null || abLoop.b === null) return;
  
  if (videoPlayer.currentTime >= abLoop.b) {
    videoPlayer.currentTime = abLoop.a;
  }
}

function updateDisplay() {
  if (abLoopDisplay && abLoopIndicator && abLoopBtn) {
    if (abLoop.a !== null || abLoop.b !== null) {
      const aText = abLoop.a !== null ? formatTime(abLoop.a) : '--:--';
      const bText = abLoop.b !== null ? formatTime(abLoop.b) : '--:--';
      abLoopDisplay.textContent = `${aText} → ${bText}`;
      abLoopDisplay.style.display = 'block';
      abLoopBtn.classList.add('has-points');
      
      if (abLoop.active) {
        abLoopIndicator.style.display = 'block';
        abLoopBtn.classList.add('active');
      } else {
        abLoopIndicator.style.display = 'none';
        abLoopBtn.classList.remove('active');
      }
    } else {
      abLoopDisplay.style.display = 'none';
      abLoopIndicator.style.display = 'none';
      abLoopBtn.classList.remove('has-points', 'active');
    }
  }
}

function updateProgressMarkers() {
  if (!progressWrapper || !videoPlayer || !videoPlayer.duration) return;
  
  // Remove existing markers
  const existingMarkers = progressWrapper.querySelectorAll('.ab-loop-marker, .ab-loop-region');
  existingMarkers.forEach(m => m.remove());
  
  const duration = videoPlayer.duration;
  
  // Add marker A
  if (abLoop.a !== null) {
    const markerA = document.createElement('div');
    markerA.className = 'ab-loop-marker marker-a';
    markerA.style.left = `${(abLoop.a / duration) * 100}%`;
    markerA.title = `A: ${formatTime(abLoop.a)}`;
    progressWrapper.appendChild(markerA);
  }
  
  // Add marker B
  if (abLoop.b !== null) {
    const markerB = document.createElement('div');
    markerB.className = 'ab-loop-marker marker-b';
    markerB.style.left = `${(abLoop.b / duration) * 100}%`;
    markerB.title = `B: ${formatTime(abLoop.b)}`;
    progressWrapper.appendChild(markerB);
  }
  
  // Add region highlight between A and B
  if (abLoop.a !== null && abLoop.b !== null) {
    const region = document.createElement('div');
    region.className = 'ab-loop-region';
    region.style.left = `${(abLoop.a / duration) * 100}%`;
    region.style.width = `${((abLoop.b - abLoop.a) / duration) * 100}%`;
    progressWrapper.appendChild(region);
  }
}

function showFeedback(text) {
  const existing = document.querySelector('.ab-loop-feedback');
  if (existing) existing.remove();
  
  const feedback = document.createElement('div');
  feedback.className = 'ab-loop-feedback';
  feedback.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    z-index: 10000;
    pointer-events: none;
  `;
  feedback.textContent = text;
  document.body.appendChild(feedback);
  
  setTimeout(() => feedback.remove(), 800);
}

function formatTime(seconds) {
  if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
  
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getState() {
  return { ...abLoop };
}

function isActive() {
  return abLoop.active;
}

module.exports = {
  init,
  setPointA,
  setPointB,
  clear,
  toggleLoop,
  getState,
  isActive,
  updateProgressMarkers
};
