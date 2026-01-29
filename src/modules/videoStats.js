/**
 * Video Statistics Module
 * Handles video statistics overlay display
 */

let showVideoStats = false;
let videoPlayer = null;
let updateInterval = null;

function init(player) {
  videoPlayer = player;
  
  const statsBtn = document.getElementById('statsBtn');
  if (statsBtn) {
    statsBtn.addEventListener('click', toggle);
  }
  
  // Update stats periodically when visible
  updateInterval = setInterval(() => {
    if (showVideoStats) {
      updateDisplay();
    }
  }, 500);
}

function toggle() {
  showVideoStats = !showVideoStats;
  updateDisplay();
  
  const statsBtn = document.getElementById('statsBtn');
  if (statsBtn) {
    statsBtn.classList.toggle('active', showVideoStats);
  }
}

function updateDisplay() {
  let statsOverlay = document.getElementById('videoStatsOverlay');
  
  if (!showVideoStats) {
    if (statsOverlay) statsOverlay.remove();
    return;
  }
  
  if (!videoPlayer || !videoPlayer.src || videoPlayer.readyState < 2) {
    if (statsOverlay) statsOverlay.remove();
    return;
  }
  
  if (!statsOverlay) {
    statsOverlay = document.createElement('div');
    statsOverlay.id = 'videoStatsOverlay';
    statsOverlay.className = 'video-stats-overlay';
    document.querySelector('.video-container').appendChild(statsOverlay);
  }
  
  const stats = {
    resolution: `${videoPlayer.videoWidth}×${videoPlayer.videoHeight}`,
    aspectRatio: getAspectRatio(videoPlayer.videoWidth, videoPlayer.videoHeight),
    duration: formatTime(videoPlayer.duration),
    currentTime: formatTime(videoPlayer.currentTime),
    playbackRate: `${videoPlayer.playbackRate}x`,
    volume: `${Math.round(videoPlayer.volume * 100)}%`,
    muted: videoPlayer.muted ? 'Yes' : 'No',
    loop: videoPlayer.loop ? 'Yes' : 'No',
    buffered: getBufferedPercent(),
    networkState: getNetworkState()
  };
  
  statsOverlay.innerHTML = `
    <div class="stats-header">
      <span>Video Statistics</span>
      <button class="stats-close" onclick="require('./modules/videoStats').toggle()">×</button>
    </div>
    <div class="stats-content">
      <div class="stats-row"><span>Resolution:</span><span>${stats.resolution}</span></div>
      <div class="stats-row"><span>Aspect Ratio:</span><span>${stats.aspectRatio}</span></div>
      <div class="stats-row"><span>Duration:</span><span>${stats.duration}</span></div>
      <div class="stats-row"><span>Current Time:</span><span>${stats.currentTime}</span></div>
      <div class="stats-row"><span>Playback Speed:</span><span>${stats.playbackRate}</span></div>
      <div class="stats-row"><span>Volume:</span><span>${stats.volume}</span></div>
      <div class="stats-row"><span>Muted:</span><span>${stats.muted}</span></div>
      <div class="stats-row"><span>Loop:</span><span>${stats.loop}</span></div>
      <div class="stats-row"><span>Buffered:</span><span>${stats.buffered}</span></div>
      <div class="stats-row"><span>Network:</span><span>${stats.networkState}</span></div>
    </div>
  `;
}

function getAspectRatio(w, h) {
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const divisor = gcd(w, h);
  return `${w / divisor}:${h / divisor}`;
}

function getBufferedPercent() {
  if (videoPlayer && videoPlayer.buffered.length > 0) {
    const buffered = videoPlayer.buffered.end(videoPlayer.buffered.length - 1);
    return `${Math.round((buffered / videoPlayer.duration) * 100)}%`;
  }
  return '0%';
}

function getNetworkState() {
  const states = ['Empty', 'Idle', 'Loading', 'No Source'];
  return states[videoPlayer ? videoPlayer.networkState : 0] || 'Unknown';
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

function isVisible() {
  return showVideoStats;
}

module.exports = {
  init,
  toggle,
  updateDisplay,
  isVisible
};
