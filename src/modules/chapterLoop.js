/**
 * Chapter Loop Module
 * When mode is active and user clicks on a preview thumbnail, that chapter loops
 */

let videoPlayer = null;
let chapterLoopBtn = null;
let chapterLoopModeActive = false;
let chapterLoopEnabled = false;
let currentChapterStart = null;
let currentChapterEnd = null;
let chapterPoints = [];

function init(player) {
  videoPlayer = player;
  chapterLoopBtn = document.getElementById('chapterLoopBtn');
  setupEventListeners();
}

function setupEventListeners() {
  if (chapterLoopBtn) {
    chapterLoopBtn.addEventListener('click', toggleMode);
  }
  
  if (videoPlayer) {
    videoPlayer.addEventListener('timeupdate', checkChapterLoop);
  }
}

function setChapterPoints(duration) {
  if (!duration || duration === Infinity) {
    chapterPoints = [];
    return;
  }
  
  const percentages = [0, 0.05, 0.15, 0.30, 0.45, 0.55, 0.70, 0.85, 0.95, 1];
  chapterPoints = percentages.map(p => duration * p);
  clearActiveLoop();
}

function findChapterForTime(time) {
  if (chapterPoints.length < 2) return null;
  
  for (let i = 0; i < chapterPoints.length - 1; i++) {
    if (time >= chapterPoints[i] && time < chapterPoints[i + 1]) {
      return {
        index: i,
        start: chapterPoints[i],
        end: chapterPoints[i + 1]
      };
    }
  }
  return null;
}

function toggleMode() {
  chapterLoopModeActive = !chapterLoopModeActive;
  
  if (!chapterLoopModeActive) {
    clearActiveLoop();
    showFeedback('Chapter Loop Mode OFF');
  } else {
    showFeedback('Chapter Loop Mode ON - Click a preview to loop');
  }
  
  updateButtonState();
}

function handlePreviewClick(time) {
  if (!chapterLoopModeActive) {
    return false;
  }
  
  if (!videoPlayer || !videoPlayer.duration) {
    return false;
  }
  
  const chapter = findChapterForTime(time);
  if (chapter) {
    currentChapterStart = chapter.start;
    currentChapterEnd = chapter.end;
    chapterLoopEnabled = true;
    videoPlayer.currentTime = chapter.start;
    updateChapterMarkers();
    showFeedback(`Looping Chapter ${chapter.index + 1}`);
    return true;
  }
  
  return false;
}

function clearActiveLoop() {
  chapterLoopEnabled = false;
  currentChapterStart = null;
  currentChapterEnd = null;
  updateChapterMarkers();
}

function checkChapterLoop() {
  if (!chapterLoopEnabled || currentChapterStart === null || currentChapterEnd === null) return;
  
  if (videoPlayer.currentTime >= currentChapterEnd - 0.1) {
    videoPlayer.currentTime = currentChapterStart;
  }
}

function updateButtonState() {
  if (!chapterLoopBtn) return;
  chapterLoopBtn.classList.toggle('active', chapterLoopModeActive);
  chapterLoopBtn.classList.toggle('looping', chapterLoopEnabled);
}

function updateChapterMarkers() {
  const progressWrapper = document.querySelector('.progress-wrapper');
  if (!progressWrapper || !videoPlayer || !videoPlayer.duration) return;
  
  const existingRegion = progressWrapper.querySelector('.chapter-loop-region');
  if (existingRegion) existingRegion.remove();
  
  if (chapterLoopEnabled && currentChapterStart !== null && currentChapterEnd !== null) {
    const region = document.createElement('div');
    region.className = 'chapter-loop-region';
    const startPercent = (currentChapterStart / videoPlayer.duration) * 100;
    const endPercent = (currentChapterEnd / videoPlayer.duration) * 100;
    region.style.left = `${startPercent}%`;
    region.style.width = `${endPercent - startPercent}%`;
    progressWrapper.appendChild(region);
  }
  
  updateButtonState();
}

function showFeedback(text) {
  const existing = document.querySelector('.chapter-feedback');
  if (existing) existing.remove();
  
  const feedback = document.createElement('div');
  feedback.className = 'chapter-feedback';
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
    animation: chapterFeedback 1s ease-out forwards;
  `;
  feedback.textContent = text;
  document.body.appendChild(feedback);
  
  setTimeout(() => feedback.remove(), 1000);
}

function isModeActive() {
  return chapterLoopModeActive;
}

function isLooping() {
  return chapterLoopEnabled;
}

module.exports = {
  init,
  setChapterPoints,
  toggleMode,
  handlePreviewClick,
  clearActiveLoop,
  isModeActive,
  isLooping,
  updateChapterMarkers
};
