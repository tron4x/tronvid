const { ipcRenderer, shell } = require('electron');
const fs = require('fs');
const path = require('path');

// Platform detection
const platform = process.platform;
const isMac = platform === 'darwin';
const isWindows = platform === 'win32';
const isLinux = platform === 'linux';

// Add platform class to body for CSS
document.body.classList.add(platform);

// DOM Elements
const videoPlayer = document.getElementById('videoPlayer');
const dropZone = document.getElementById('dropZone');
const playlist = document.getElementById('playlist');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const selectVideosBtn = document.getElementById('selectVideos');
const selectFolderBtn = document.getElementById('selectFolder');
const selectSubtitleBtn = document.getElementById('selectSubtitle');
const clearPlaylistBtn = document.getElementById('clearPlaylist');
const playPauseBtn = document.getElementById('playPauseBtn');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const muteBtn = document.getElementById('muteBtn');
const volumeHighIcon = document.getElementById('volumeHighIcon');
const volumeMuteIcon = document.getElementById('volumeMuteIcon');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const progressBar = document.getElementById('progressBar');
const volumeSlider = document.getElementById('volumeSlider');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const currentVideoNameEl = document.getElementById('currentVideoName');
const videoCountEl = document.getElementById('videoCount');

// New Controls
const speedBtn = document.getElementById('speedBtn');
const speedMenu = document.getElementById('speedMenu');
const speedLabel = document.getElementById('speedLabel');
const speedIndicator = document.getElementById('speedIndicator');
const loopBtn = document.getElementById('loopBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const screenshotBtn = document.getElementById('screenshotBtn');
const pipBtn = document.getElementById('pipBtn');

// State
let videos = [];
let currentVideoIndex = -1;
let isPlaying = false;
let thumbnailCache = new Map();
let currentSpeed = 1;
let isLooping = false;
let isShuffling = false;
let playHistory = [];

// Initialize
function init() {
  setupEventListeners();
  setupDragAndDrop();
  setupNewControls();
  setupSidebarToggle();
  updatePlayButton(false);
  updateMuteButton();
  showDropZone();
  
  // Set initial volume
  volumeSlider.value = 75;
  videoPlayer.volume = 0.75;
}

// Sidebar Toggle
function setupSidebarToggle() {
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', toggleSidebar);
  }
}

function toggleSidebar() {
  if (sidebar && sidebarToggle) {
    const isCollapsed = sidebar.classList.toggle('collapsed');
    
    // Update toggle button position
    if (isCollapsed) {
      sidebarToggle.style.left = '0';
      sidebarToggle.querySelector('svg').style.transform = 'rotate(180deg)';
    } else {
      sidebarToggle.style.left = '320px';
      sidebarToggle.querySelector('svg').style.transform = 'rotate(0deg)';
    }
  }
}

// Generate thumbnail from video
function generateThumbnail(videoPath) {
  if (thumbnailCache.has(videoPath)) {
    return Promise.resolve(thumbnailCache.get(videoPath));
  }
  
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    
    video.onloadeddata = () => {
      // Seek to 10% of the video
      video.currentTime = video.duration * 0.1;
    };
    
    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 90;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
      thumbnailCache.set(videoPath, thumbnail);
      
      video.src = '';
      video.load();
      
      resolve(thumbnail);
    };
    
    video.onerror = () => {
      resolve(null);
    };
    
    // Timeout fallback
    setTimeout(() => {
      if (!thumbnailCache.has(videoPath)) {
        resolve(null);
      }
    }, 5000);
    
    video.src = videoPath;
  });
}

// Event Listeners
function setupEventListeners() {
  selectVideosBtn.addEventListener('click', selectVideos);
  selectFolderBtn.addEventListener('click', selectFolder);
  clearPlaylistBtn.addEventListener('click', clearPlaylist);
  playPauseBtn.addEventListener('click', togglePlayPause);
  prevBtn.addEventListener('click', playPrevious);
  nextBtn.addEventListener('click', playNext);
  muteBtn.addEventListener('click', toggleMute);
  fullscreenBtn.addEventListener('click', toggleFullscreen);
  
  videoPlayer.addEventListener('timeupdate', updateProgress);
  videoPlayer.addEventListener('loadedmetadata', updateDuration);
  videoPlayer.addEventListener('ended', playNext);
  videoPlayer.addEventListener('play', () => updatePlayButton(true));
  videoPlayer.addEventListener('pause', () => updatePlayButton(false));
  videoPlayer.addEventListener('click', togglePlayPause);
  videoPlayer.addEventListener('dblclick', toggleFullscreen);
  
  progressBar.addEventListener('input', seekVideo);
  progressBar.addEventListener('change', seekVideo);
  
  volumeSlider.addEventListener('input', updateVolume);
  
  document.addEventListener('keydown', handleKeyboard);
}

// Drag and Drop
function setupDragAndDrop() {
  const container = document.querySelector('.video-container');
  const playlistEl = document.getElementById('playlist');
  const sidebar = document.querySelector('.sidebar');
  
  // Prevent defaults on body
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    document.body.addEventListener(eventName, preventDefaults);
  });
  
  // Video container drop zone
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    container.addEventListener(eventName, preventDefaults);
  });
  
  ['dragenter', 'dragover'].forEach(eventName => {
    container.addEventListener(eventName, () => {
      dropZone.classList.add('drag-over');
    });
  });
  
  ['dragleave', 'drop'].forEach(eventName => {
    container.addEventListener(eventName, () => {
      dropZone.classList.remove('drag-over');
    });
  });
  
  container.addEventListener('drop', handleDrop);
  
  // Playlist/Sidebar drop zone - allow dropping videos onto playlist
  if (playlistEl) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      playlistEl.addEventListener(eventName, preventDefaults);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
      playlistEl.addEventListener(eventName, () => {
        playlistEl.classList.add('drag-over');
      });
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
      playlistEl.addEventListener(eventName, () => {
        playlistEl.classList.remove('drag-over');
      });
    });
    
    playlistEl.addEventListener('drop', handleDrop);
  }
  
  // Also allow drop on entire sidebar
  if (sidebar) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      sidebar.addEventListener(eventName, preventDefaults);
    });
    
    sidebar.addEventListener('drop', handleDrop);
  }
}

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

function handleDrop(e) {
  const files = Array.from(e.dataTransfer.files);
  const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
  
  const videoFiles = files.filter(file => {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    return videoExtensions.includes(ext);
  }).map(file => ({
    path: file.path,
    name: file.name,
    size: file.size,
    thumbnail: null
  }));
  
  if (videoFiles.length > 0) {
    addVideos(videoFiles);
  }
}

// Video Selection
async function selectVideos() {
  const selectedVideos = await ipcRenderer.invoke('select-videos');
  if (selectedVideos.length > 0) {
    addVideos(selectedVideos.map(v => ({ ...v, thumbnail: null })));
  }
}

async function selectFolder() {
  const folderVideos = await ipcRenderer.invoke('select-folder');
  if (folderVideos.length > 0) {
    addVideos(folderVideos.map(v => ({ ...v, thumbnail: null })));
  }
}

// Playlist Management
async function addVideos(newVideos) {
  videos = [...videos, ...newVideos];
  updatePlaylist();
  
  if (currentVideoIndex === -1 && videos.length > 0) {
    loadVideo(0);
  }
  
  hideDropZone();
  
  // Auto-save if a saved playlist is loaded
  await autoSaveCurrentPlaylist();
  
  // Generate thumbnails in background
  for (let i = 0; i < videos.length; i++) {
    if (!videos[i].thumbnail) {
      const thumbnail = await generateThumbnail(videos[i].path);
      videos[i].thumbnail = thumbnail;
      updatePlaylistItem(i);
    }
  }
}

// Auto-save current playlist if one is loaded
async function autoSaveCurrentPlaylist() {
  if (currentSavedPlaylistId && videos.length > 0) {
    const pl = savedPlaylists.find(p => p.id === currentSavedPlaylistId);
    if (pl) {
      const playlist = {
        id: currentSavedPlaylistId,
        name: pl.name,
        videos: videos.map(v => ({
          path: v.path,
          name: v.name,
          size: v.size
        })),
        createdAt: pl.createdAt
      };
      await ipcRenderer.invoke('save-playlist', playlist);
      await loadSavedPlaylists();
    }
  }
}

function updatePlaylistItem(index) {
  const item = playlist.querySelector(`[data-index="${index}"]`);
  if (item && videos[index].thumbnail) {
    const thumb = item.querySelector('.playlist-item-thumb');
    if (thumb) {
      thumb.innerHTML = `<img src="${videos[index].thumbnail}" alt="">`;
    }
  }
}

function updatePlaylist() {
  videoCountEl.textContent = `${videos.length} Video${videos.length !== 1 ? 's' : ''}`;
  
  if (videos.length === 0) {
    playlist.innerHTML = `
      <div class="empty-playlist">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
            <line x1="7" y1="2" x2="7" y2="22"></line>
            <line x1="17" y1="2" x2="17" y2="22"></line>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <line x1="2" y1="7" x2="7" y2="7"></line>
            <line x1="2" y1="17" x2="7" y2="17"></line>
            <line x1="17" y1="17" x2="22" y2="17"></line>
            <line x1="17" y1="7" x2="22" y2="7"></line>
          </svg>
        </div>
        <p>No Videos</p>
        <p class="hint">Drop videos here or select above</p>
      </div>
    `;
    return;
  }
  
  playlist.innerHTML = videos.map((video, index) => {
    const isActive = index === currentVideoIndex;
    
    // Thumbnail content
    let thumbContent;
    if (video.thumbnail) {
      thumbContent = `<img src="${video.thumbnail}" alt="">`;
    } else {
      thumbContent = `
        <div class="thumb-loading">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </div>
      `;
    }
    
    // Playing indicator overlay
    const playingOverlay = isActive && isPlaying 
      ? `<div class="thumb-playing">
           <div class="playing-bars">
             <span></span><span></span><span></span>
           </div>
         </div>`
      : '';
    
    return `
      <div class="playlist-item ${isActive ? 'active' : ''}" data-index="${index}">
        <div class="playlist-item-thumb">
          ${thumbContent}
          ${playingOverlay}
        </div>
        <div class="playlist-item-info">
          <span class="playlist-item-name" title="${video.name}">${video.name}</span>
          <span class="playlist-item-meta">${formatFileSize(video.size)}</span>
        </div>
        <button class="playlist-item-remove" data-index="${index}" title="Remove">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;
  }).join('');
  
  // Add click and drag listeners
  playlist.querySelectorAll('.playlist-item').forEach(item => {
    // Click to play
    item.addEventListener('click', (e) => {
      if (!e.target.closest('.playlist-item-remove') && !item.classList.contains('dragging')) {
        const index = parseInt(item.dataset.index);
        loadVideo(index);
        playVideo();
      }
    });
    
    // Drag to reorder
    item.setAttribute('draggable', true);
    
    item.addEventListener('dragstart', (e) => {
      item.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', item.dataset.index);
    });
    
    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      document.querySelectorAll('.playlist-item').forEach(i => i.classList.remove('drag-over-item'));
    });
    
    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      const draggingItem = document.querySelector('.playlist-item.dragging');
      if (draggingItem && draggingItem !== item) {
        item.classList.add('drag-over-item');
      }
    });
    
    item.addEventListener('dragleave', () => {
      item.classList.remove('drag-over-item');
    });
    
    item.addEventListener('drop', (e) => {
      e.preventDefault();
      const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
      const toIndex = parseInt(item.dataset.index);
      if (fromIndex !== toIndex) {
        reorderVideos(fromIndex, toIndex);
      }
      item.classList.remove('drag-over-item');
    });
  });
  
  // Add remove button listeners
  playlist.querySelectorAll('.playlist-item-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const index = parseInt(btn.dataset.index);
      removeVideo(index);
    });
  });
}

// Reorder videos in playlist
async function reorderVideos(fromIndex, toIndex) {
  const video = videos.splice(fromIndex, 1)[0];
  videos.splice(toIndex, 0, video);
  
  // Update current video index
  if (currentVideoIndex === fromIndex) {
    currentVideoIndex = toIndex;
  } else if (fromIndex < currentVideoIndex && toIndex >= currentVideoIndex) {
    currentVideoIndex--;
  } else if (fromIndex > currentVideoIndex && toIndex <= currentVideoIndex) {
    currentVideoIndex++;
  }
  
  updatePlaylist();
  await autoSaveCurrentPlaylist();
}

async function removeVideo(index) {
  const removedPath = videos[index].path;
  thumbnailCache.delete(removedPath);
  videos.splice(index, 1);
  
  if (videos.length === 0) {
    currentVideoIndex = -1;
    videoPlayer.src = '';
    currentVideoNameEl.textContent = 'No video selected';
    showDropZone();
    updatePlayButton(false);
  } else if (index === currentVideoIndex) {
    if (index >= videos.length) {
      loadVideo(videos.length - 1);
    } else {
      loadVideo(index);
    }
  } else if (index < currentVideoIndex) {
    currentVideoIndex--;
  }
  
  updatePlaylist();
  
  // Auto-save if a saved playlist is loaded
  await autoSaveCurrentPlaylist();
}

function clearPlaylist() {
  videos = [];
  currentVideoIndex = -1;
  thumbnailCache.clear();
  videoPlayer.src = '';
  currentVideoNameEl.textContent = 'No video selected';
  updatePlaylist();
  showDropZone();
  updatePlayButton(false);
}

// Video Playback
function loadVideo(index) {
  if (index < 0 || index >= videos.length) return;
  
  currentVideoIndex = index;
  const video = videos[index];
  
  videoPlayer.src = video.path;
  currentVideoNameEl.textContent = video.name;
  updatePlaylist();
  hideDropZone();
}

function playVideo() {
  if (videoPlayer.src) {
    videoPlayer.play();
    isPlaying = true;
    updatePlaylist();
  }
}

function pauseVideo() {
  videoPlayer.pause();
  isPlaying = false;
  updatePlaylist();
}

function togglePlayPause() {
  if (videos.length === 0) return;
  
  if (currentVideoIndex === -1) {
    loadVideo(0);
  }
  
  if (videoPlayer.paused) {
    playVideo();
  } else {
    pauseVideo();
  }
}

function playPrevious() {
  if (videos.length === 0) return;
  
  if (videoPlayer.currentTime > 3) {
    videoPlayer.currentTime = 0;
    return;
  }
  
  const newIndex = currentVideoIndex <= 0 ? videos.length - 1 : currentVideoIndex - 1;
  loadVideo(newIndex);
  playVideo();
}

function playNext() {
  if (videos.length === 0) return;
  
  const newIndex = currentVideoIndex >= videos.length - 1 ? 0 : currentVideoIndex + 1;
  loadVideo(newIndex);
  playVideo();
}

// Video Controls
function updateProgress() {
  if (videoPlayer.duration) {
    const progress = (videoPlayer.currentTime / videoPlayer.duration) * 100;
    progressBar.value = progress;
    progressBar.style.setProperty('--progress', `${progress}%`);
    currentTimeEl.textContent = formatTime(videoPlayer.currentTime);
  }
}

function updateDuration() {
  durationEl.textContent = formatTime(videoPlayer.duration);
  // Generate video previews when duration is available
  generateVideoPreviews();
}

function seekVideo() {
  if (videoPlayer.duration) {
    const seekTime = (progressBar.value / 100) * videoPlayer.duration;
    videoPlayer.currentTime = seekTime;
  }
}

function updateVolume() {
  const volume = volumeSlider.value / 100;
  videoPlayer.volume = volume;
  updateMuteButton();
}

function toggleMute() {
  videoPlayer.muted = !videoPlayer.muted;
  updateMuteButton();
}

function updateMuteButton() {
  if (videoPlayer.muted || videoPlayer.volume === 0) {
    volumeHighIcon.style.display = 'none';
    volumeMuteIcon.style.display = 'block';
  } else {
    volumeHighIcon.style.display = 'block';
    volumeMuteIcon.style.display = 'none';
  }
}

function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.querySelector('.video-container').requestFullscreen();
  }
}

function updatePlayButton(playing) {
  isPlaying = playing;
  if (playing) {
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
  } else {
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
  }
}

// UI Helpers
function showDropZone() {
  dropZone.style.display = 'flex';
}

function hideDropZone() {
  dropZone.style.display = 'none';
}

// Keyboard Shortcuts
function handleKeyboard(e) {
  if (e.target.tagName === 'INPUT') return;
  
  switch(e.code) {
    case 'Space':
      e.preventDefault();
      togglePlayPause();
      break;
    case 'ArrowLeft':
      e.preventDefault();
      videoPlayer.currentTime = Math.max(0, videoPlayer.currentTime - 10);
      break;
    case 'ArrowRight':
      e.preventDefault();
      videoPlayer.currentTime = Math.min(videoPlayer.duration || 0, videoPlayer.currentTime + 10);
      break;
    case 'ArrowUp':
      e.preventDefault();
      volumeSlider.value = Math.min(100, parseInt(volumeSlider.value) + 10);
      updateVolume();
      break;
    case 'ArrowDown':
      e.preventDefault();
      volumeSlider.value = Math.max(0, parseInt(volumeSlider.value) - 10);
      updateVolume();
      break;
    case 'KeyM':
      toggleMute();
      break;
    case 'KeyF':
      toggleFullscreen();
      break;
    case 'KeyN':
      playNext();
      break;
    case 'KeyP':
      playPrevious();
      break;
    case 'KeyS':
      // S for Screenshot (Shift+S for Shuffle conflicts, so plain S = screenshot)
      if (!e.shiftKey) {
        e.preventDefault();
        takeScreenshot();
      }
      break;
    case 'KeyB':
      // Ctrl+B / Cmd+B to toggle sidebar
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        toggleSidebar();
      }
      break;
  }
}

// Setup New Controls (Speed, Loop, Shuffle, PiP)
function setupNewControls() {
  // Speed Control
  if (speedBtn && speedMenu) {
    speedBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      speedMenu.classList.toggle('show');
    });
    
    speedMenu.querySelectorAll('[data-speed]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const speed = parseFloat(item.dataset.speed);
        setPlaybackSpeed(speed);
        speedMenu.classList.remove('show');
      });
    });
    
    // Close speed menu when clicking outside
    document.addEventListener('click', () => {
      speedMenu.classList.remove('show');
    });
  }
  
  // Loop Control
  if (loopBtn) {
    loopBtn.addEventListener('click', toggleLoop);
  }
  
  // Shuffle Control
  if (shuffleBtn) {
    shuffleBtn.addEventListener('click', toggleShuffle);
  }
  
  // Picture-in-Picture Control
  if (pipBtn) {
    pipBtn.addEventListener('click', togglePiP);
  }
  
  // Screenshot Control
  if (screenshotBtn) {
    screenshotBtn.addEventListener('click', takeScreenshot);
  }
  
  // Update video ended handler for loop/shuffle
  videoPlayer.removeEventListener('ended', playNext);
  videoPlayer.addEventListener('ended', handleVideoEnded);
}

// Playback Speed
function setPlaybackSpeed(speed) {
  currentSpeed = speed;
  videoPlayer.playbackRate = speed;
  
  if (speedLabel) {
    speedLabel.textContent = speed === 1 ? '1x' : speed + 'x';
  }
  
  if (speedIndicator) {
    speedIndicator.style.display = speed !== 1 ? 'block' : 'none';
  }
  
  // Update active state in menu
  if (speedMenu) {
    speedMenu.querySelectorAll('[data-speed]').forEach(item => {
      item.classList.toggle('active', parseFloat(item.dataset.speed) === speed);
    });
  }
}

// Loop Toggle
function toggleLoop() {
  isLooping = !isLooping;
  videoPlayer.loop = isLooping;
  
  if (loopBtn) {
    loopBtn.classList.toggle('active', isLooping);
  }
}

// Shuffle Toggle
function toggleShuffle() {
  isShuffling = !isShuffling;
  playHistory = [];
  
  if (shuffleBtn) {
    shuffleBtn.classList.toggle('active', isShuffling);
  }
}

// Picture-in-Picture
async function togglePiP() {
  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else if (videoPlayer.src) {
      await videoPlayer.requestPictureInPicture();
    }
  } catch (error) {
    console.error('PiP error:', error);
  }
}

// Screenshot function
async function takeScreenshot() {
  if (!videoPlayer.src || videoPlayer.readyState < 2) {
    console.log('No video loaded');
    return;
  }
  
  const canvas = document.createElement('canvas');
  canvas.width = videoPlayer.videoWidth;
  canvas.height = videoPlayer.videoHeight;
  
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoPlayer, 0, 0, canvas.width, canvas.height);
  
  // Convert to data URL
  const dataUrl = canvas.toDataURL('image/png');
  
  // Get video name for filename
  const videoName = videos[currentVideoIndex] ? videos[currentVideoIndex].name : 'video';
  const baseName = videoName.replace(/\.[^/.]+$/, ''); // Remove extension
  const timestamp = formatTime(videoPlayer.currentTime).replace(/:/g, '-');
  const filename = `${baseName}_${timestamp}.png`;
  
  // Save screenshot
  const result = await ipcRenderer.invoke('save-screenshot', { dataUrl, filename });
  
  if (result.success) {
    showScreenshotFeedback();
  }
}

// Video Previews
const videoPreviewsContainer = document.getElementById('videoPreviews');
const previewThumbnailsEl = document.getElementById('previewThumbnails');
const previewScrollLeft = document.getElementById('previewScrollLeft');
const previewScrollRight = document.getElementById('previewScrollRight');

// Setup preview scroll buttons
function setupPreviewScroll() {
  if (previewScrollLeft) {
    previewScrollLeft.addEventListener('click', () => {
      previewThumbnailsEl.scrollBy({ left: -260, behavior: 'smooth' });
    });
  }
  
  if (previewScrollRight) {
    previewScrollRight.addEventListener('click', () => {
      previewThumbnailsEl.scrollBy({ left: 260, behavior: 'smooth' });
    });
  }
}

// Generate preview thumbnails at different time positions
async function generateVideoPreviews() {
  if (!videoPlayer.duration || videoPlayer.duration === Infinity) return;
  
  const duration = videoPlayer.duration;
  // Generate 8 preview points evenly distributed across the video
  const timePoints = [0.05, 0.15, 0.30, 0.45, 0.55, 0.70, 0.85, 0.95].map(p => duration * p);
  
  // Show the preview container
  videoPreviewsContainer.classList.add('show');
  
  // Create placeholder items
  previewThumbnailsEl.innerHTML = timePoints.map(time => `
    <div class="preview-item" data-time="${time}">
      <div class="preview-loading">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      </div>
      <span class="preview-time">${formatTime(time)}</span>
    </div>
  `).join('');
  
  // Add click handlers
  previewThumbnailsEl.querySelectorAll('.preview-item').forEach(item => {
    item.addEventListener('click', () => {
      const time = parseFloat(item.dataset.time);
      videoPlayer.currentTime = time;
      if (videoPlayer.paused) {
        playVideo();
      }
    });
  });
  
  // Generate thumbnails in background
  for (let i = 0; i < timePoints.length; i++) {
    const time = timePoints[i];
    const thumbnail = await generatePreviewThumbnail(videoPlayer.src, time);
    if (thumbnail) {
      const item = previewThumbnailsEl.querySelector(`[data-time="${time}"]`);
      if (item) {
        item.innerHTML = `
          <img src="${thumbnail}" alt="Preview at ${formatTime(time)}">
          <span class="preview-time">${formatTime(time)}</span>
        `;
      }
    }
  }
}

// Generate a single preview thumbnail at specific time
function generatePreviewThumbnail(videoSrc, time) {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    
    video.onloadedmetadata = () => {
      video.currentTime = time;
    };
    
    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 240;
      canvas.height = 136;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
      
      video.src = '';
      video.load();
      
      resolve(thumbnail);
    };
    
    video.onerror = () => {
      resolve(null);
    };
    
    // Timeout fallback
    setTimeout(() => resolve(null), 5000);
    
    video.src = videoSrc;
  });
}

// Hide previews when no video
function hideVideoPreviews() {
  videoPreviewsContainer.classList.remove('show');
  previewThumbnailsEl.innerHTML = '';
}

// Visual feedback for screenshot
function showScreenshotFeedback() {
  const container = document.querySelector('.video-container');
  const flash = document.createElement('div');
  flash.style.cssText = `
    position: absolute;
    inset: 0;
    background: white;
    opacity: 0.5;
    pointer-events: none;
    z-index: 1000;
    animation: flash 0.3s ease-out forwards;
  `;
  
  // Add animation style
  const style = document.createElement('style');
  style.textContent = `
    @keyframes flash {
      0% { opacity: 0.5; }
      100% { opacity: 0; }
    }
  `;
  document.head.appendChild(style);
  
  container.appendChild(flash);
  
  setTimeout(() => {
    flash.remove();
    style.remove();
  }, 300);
}

// Handle Video Ended (with loop/shuffle support)
function handleVideoEnded() {
  if (isLooping) {
    // Loop is handled by video.loop property
    return;
  }
  
  if (videos.length === 0) return;
  
  if (isShuffling) {
    // Add current to history
    playHistory.push(currentVideoIndex);
    
    // Get random index (excluding current)
    let availableIndices = videos.map((_, i) => i).filter(i => i !== currentVideoIndex);
    
    // If all videos played, reset history
    if (availableIndices.length === 0) {
      playHistory = [currentVideoIndex];
      availableIndices = videos.map((_, i) => i).filter(i => i !== currentVideoIndex);
    }
    
    if (availableIndices.length > 0) {
      const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      loadVideo(randomIndex);
      playVideo();
    }
  } else {
    // Normal next
    playNext();
  }
}

// Utility Functions
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

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Saved Playlists Elements
const savedPlaylistsList = document.getElementById('savedPlaylistsList');
const savedPlaylistsSection = document.getElementById('savedPlaylistsSection');
const toggleSavedPlaylists = document.getElementById('toggleSavedPlaylists');
const savedPlaylistCount = document.getElementById('savedPlaylistCount');
const createPlaylistBtn = document.getElementById('createPlaylistBtn');
const savePlaylistBtn = document.getElementById('savePlaylistBtn');

// Playlist Modal Elements
const playlistModal = document.getElementById('playlistModal');
const playlistModalTitle = document.getElementById('playlistModalTitle');
const playlistNameInput = document.getElementById('playlistNameInput');
const closePlaylistModal = document.getElementById('closePlaylistModal');
const cancelPlaylistBtn = document.getElementById('cancelPlaylistBtn');
const confirmPlaylistBtn = document.getElementById('confirmPlaylistBtn');
const playlistModalOverlay = playlistModal ? playlistModal.querySelector('.modal-overlay') : null;

// Saved Playlists State
let savedPlaylists = [];
let currentSavedPlaylistId = null;
let playlistModalMode = 'save'; // 'save' or 'create'

// About Modal
const aboutBtn = document.getElementById('aboutBtn');
const aboutModal = document.getElementById('aboutModal');
const closeAbout = document.getElementById('closeAbout');
const modalOverlay = aboutModal ? aboutModal.querySelector('.modal-overlay') : null;

function setupAboutModal() {
  if (aboutBtn && aboutModal) {
    aboutBtn.addEventListener('click', openAboutModal);
  }
  
  if (closeAbout) {
    closeAbout.addEventListener('click', closeAboutModal);
  }
  
  if (modalOverlay) {
    modalOverlay.addEventListener('click', closeAboutModal);
  }
  
  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && aboutModal && aboutModal.classList.contains('show')) {
      closeAboutModal();
    }
  });
}

function openAboutModal() {
  if (aboutModal) {
    aboutModal.classList.add('show');
  }
}

function closeAboutModal() {
  if (aboutModal) {
    aboutModal.classList.remove('show');
  }
}

// ============================================
// SAVED PLAYLISTS MANAGEMENT
// ============================================

// Setup collapsible saved playlists section
function setupSavedPlaylistsToggle() {
  if (toggleSavedPlaylists && savedPlaylistsSection) {
    // Start expanded
    savedPlaylistsSection.classList.add('expanded');
    
    toggleSavedPlaylists.addEventListener('click', () => {
      savedPlaylistsSection.classList.toggle('collapsed');
      savedPlaylistsSection.classList.toggle('expanded');
    });
  }
}

// Load saved playlists from storage
async function loadSavedPlaylists() {
  savedPlaylists = await ipcRenderer.invoke('get-playlists');
  renderSavedPlaylists();
}

// Render saved playlists in sidebar
function renderSavedPlaylists() {
  if (!savedPlaylistsList) return;
  
  // Update count badge
  if (savedPlaylistCount) {
    savedPlaylistCount.textContent = savedPlaylists.length;
  }
  
  if (savedPlaylists.length === 0) {
    savedPlaylistsList.innerHTML = `
      <div class="empty-saved-playlists">
        No saved playlists yet
      </div>
    `;
    return;
  }
  
  savedPlaylistsList.innerHTML = savedPlaylists.map(pl => `
    <div class="saved-playlist-item ${currentSavedPlaylistId === pl.id ? 'active' : ''}" data-id="${pl.id}">
      <div class="saved-playlist-icon">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
        </svg>
      </div>
      <div class="saved-playlist-info">
        <span class="saved-playlist-name">${pl.name}</span>
        <span class="saved-playlist-meta">${pl.videos.length} video${pl.videos.length !== 1 ? 's' : ''}</span>
      </div>
      <button class="saved-playlist-delete" data-id="${pl.id}" title="Delete Playlist">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  `).join('');
  
  // Add click listeners for playlist items
  savedPlaylistsList.querySelectorAll('.saved-playlist-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (!e.target.closest('.saved-playlist-delete')) {
        const id = item.dataset.id;
        loadSavedPlaylist(id);
      }
    });
  });
  
  // Add delete button listeners
  savedPlaylistsList.querySelectorAll('.saved-playlist-delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      await deleteSavedPlaylist(id);
    });
  });
}

// Load a saved playlist into current playlist
function loadSavedPlaylist(id) {
  const pl = savedPlaylists.find(p => p.id === id);
  if (!pl) return;
  
  currentSavedPlaylistId = id;
  
  // Clear current playlist and load saved videos
  videos = pl.videos.map(v => ({ ...v, thumbnail: null }));
  currentVideoIndex = -1;
  thumbnailCache.clear();
  
  updatePlaylist();
  renderSavedPlaylists();
  
  if (videos.length > 0) {
    loadVideo(0);
    hideDropZone();
    
    // Generate thumbnails in background
    videos.forEach(async (video, i) => {
      const thumbnail = await generateThumbnail(video.path);
      videos[i].thumbnail = thumbnail;
      updatePlaylistItem(i);
    });
  } else {
    showDropZone();
  }
}

// Save current playlist
async function saveCurrentPlaylist(name, allowEmpty = false) {
  if (videos.length === 0 && !allowEmpty) return false;
  
  const playlist = {
    id: currentSavedPlaylistId || Date.now().toString(),
    name: name,
    videos: videos.map(v => ({
      path: v.path,
      name: v.name,
      size: v.size
    })),
    createdAt: new Date().toISOString()
  };
  
  const success = await ipcRenderer.invoke('save-playlist', playlist);
  if (success) {
    currentSavedPlaylistId = playlist.id;
    await loadSavedPlaylists();
  }
  return success;
}

// Delete a saved playlist
async function deleteSavedPlaylist(id) {
  const success = await ipcRenderer.invoke('delete-playlist', id);
  if (success) {
    if (currentSavedPlaylistId === id) {
      currentSavedPlaylistId = null;
    }
    await loadSavedPlaylists();
  }
}

// Setup Playlist Modal
function setupPlaylistModal() {
  if (savePlaylistBtn) {
    savePlaylistBtn.addEventListener('click', () => {
      if (videos.length === 0) return;
      playlistModalMode = 'save';
      playlistModalTitle.textContent = 'Save Playlist';
      playlistNameInput.value = '';
      openPlaylistModal();
    });
  }
  
  if (createPlaylistBtn) {
    createPlaylistBtn.addEventListener('click', () => {
      playlistModalMode = 'create';
      playlistModalTitle.textContent = 'Create Playlist';
      playlistNameInput.value = '';
      openPlaylistModal();
    });
  }
  
  if (closePlaylistModal) {
    closePlaylistModal.addEventListener('click', closePlaylistModalFn);
  }
  
  if (cancelPlaylistBtn) {
    cancelPlaylistBtn.addEventListener('click', closePlaylistModalFn);
  }
  
  if (playlistModalOverlay) {
    playlistModalOverlay.addEventListener('click', closePlaylistModalFn);
  }
  
  if (confirmPlaylistBtn) {
    confirmPlaylistBtn.addEventListener('click', async () => {
      const name = playlistNameInput.value.trim();
      if (!name) {
        playlistNameInput.focus();
        return;
      }
      
      if (playlistModalMode === 'save') {
        // Save current playlist with videos
        await saveCurrentPlaylist(name);
      } else {
        // Create new empty playlist
        currentSavedPlaylistId = null;
        clearPlaylist();
        // Allow saving empty playlist for 'create' mode
        await saveCurrentPlaylist(name, true);
      }
      
      closePlaylistModalFn();
    });
  }
  
  // Enter key to confirm
  if (playlistNameInput) {
    playlistNameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        confirmPlaylistBtn.click();
      }
    });
  }
  
  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && playlistModal && playlistModal.classList.contains('show')) {
      closePlaylistModalFn();
    }
  });
}

function openPlaylistModal() {
  if (playlistModal) {
    playlistModal.classList.add('show');
    setTimeout(() => playlistNameInput.focus(), 100);
  }
}

function closePlaylistModalFn() {
  if (playlistModal) {
    playlistModal.classList.remove('show');
  }
}

// IPC Listeners for Menu Events
ipcRenderer.on('show-about', () => {
  openAboutModal();
});

ipcRenderer.on('add-videos', (event, newVideos) => {
  addVideos(newVideos.map(v => ({ ...v, thumbnail: null })));
});

// Handle external links - open in default browser
function setupExternalLinks() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a.external-link');
    if (link) {
      e.preventDefault();
      shell.openExternal(link.href);
    }
  });
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  setupAboutModal();
  setupPlaylistModal();
  setupSavedPlaylistsToggle();
  setupExternalLinks();
  setupPreviewScroll();
  await loadSavedPlaylists();
  init();
});
