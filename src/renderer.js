// ============================================
// SECURE API ACCESS (via preload.js)
// ============================================

// Module-local implementations (no Node.js required)
const helpModalModule = {
  init() {
    this.modal = document.getElementById('helpModal');
    this.closeBtn = document.getElementById('closeHelp');
    const helpBtn = document.getElementById('helpBtn');
    if (helpBtn) helpBtn.addEventListener('click', () => this.open());
    if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.close());
    const overlay = this.modal?.querySelector('.modal-overlay');
    if (overlay) overlay.addEventListener('click', () => this.close());
  },
  open() { if (this.modal) this.modal.classList.add('show'); },
  close() { if (this.modal) this.modal.classList.remove('show'); }
};

const aboutModalModule = {
  init() {
    this.modal = document.getElementById('aboutModal');
    this.closeBtn = document.getElementById('closeAbout');
    const aboutBtn = document.getElementById('aboutBtn');
    if (aboutBtn) aboutBtn.addEventListener('click', () => this.open());
    if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.close());
    const overlay = this.modal?.querySelector('.modal-overlay');
    if (overlay) overlay.addEventListener('click', () => this.close());
  },
  open() { if (this.modal) this.modal.classList.add('show'); },
  close() { if (this.modal) this.modal.classList.remove('show'); }
};

const themesModule = {
  themes: ['dark', 'light', 'purple', 'blue', 'green'],
  currentTheme: 'dark',
  init() {
    const saved = localStorage.getItem('tronvid-theme');
    if (saved && this.themes.includes(saved)) this.currentTheme = saved;
    this.apply(this.currentTheme);
    const themeBtn = document.getElementById('themeBtn');
    if (themeBtn) themeBtn.addEventListener('click', () => this.cycle());
  },
  apply(theme) {
    document.body.setAttribute('data-theme', theme);
    this.currentTheme = theme;
    localStorage.setItem('tronvid-theme', theme);
  },
  cycle() {
    const i = this.themes.indexOf(this.currentTheme);
    this.apply(this.themes[(i + 1) % this.themes.length]);
  }
};

const chapterLoopModule = {
  videoPlayer: null,
  modeActive: false,
  loopEnabled: false,
  chapterStart: null,
  chapterEnd: null,
  chapterPoints: [],
  activeChapterIndex: -1,
  
  init(player) {
    this.videoPlayer = player;
    const btn = document.getElementById('chapterLoopBtn');
    if (btn) btn.addEventListener('click', () => this.toggleMode());
    if (player) player.addEventListener('timeupdate', () => this.checkLoop());
  },
  
  setChapterPoints(duration) {
    if (!duration || duration === Infinity) return;
    this.chapterPoints = [0, 0.05, 0.15, 0.30, 0.45, 0.55, 0.70, 0.85, 0.95, 1].map(p => duration * p);
    this.clearLoop();
  },
  
  toggleMode() {
    this.modeActive = !this.modeActive;
    if (!this.modeActive) {
      this.clearLoop();
      this.showFeedback('Chapter Loop: OFF');
    } else {
      this.showFeedback('Chapter Loop: ON - Click a preview to loop');
    }
    const btn = document.getElementById('chapterLoopBtn');
    if (btn) btn.classList.toggle('active', this.modeActive);
  },
  
  handlePreviewClick(time) {
    if (!this.modeActive || !this.videoPlayer?.duration) return false;
    
    // Preview times: 0.05, 0.15, 0.30, 0.45, 0.55, 0.70, 0.85, 0.95 (8 previews)
    // Chapter points: same percentages create segments
    // Find which chapter segment the clicked time belongs to
    for (let i = 0; i < this.chapterPoints.length - 1; i++) {
      if (time >= this.chapterPoints[i] && time < this.chapterPoints[i + 1]) {
        this.chapterStart = this.chapterPoints[i];
        this.chapterEnd = this.chapterPoints[i + 1];
        this.loopEnabled = true;
        this.activeChapterIndex = i;
        this.videoPlayer.currentTime = this.chapterStart;
        this.updateMarkers();
        
        // Find the preview index - preview index = chapter index - 1 (since previews start at 0.05, not 0)
        // But we want to highlight the preview that was clicked
        const previews = document.querySelectorAll('.preview-item');
        let previewIndex = -1;
        previews.forEach((p, idx) => {
          const pTime = parseFloat(p.dataset.time);
          if (pTime >= this.chapterStart && pTime < this.chapterEnd) {
            previewIndex = idx;
          }
        });
        if (previewIndex >= 0) {
          this.highlightPreview(previewIndex);
        }
        
        this.showFeedback(`🔁 Looping: ${this.formatTime(this.chapterStart)} - ${this.formatTime(this.chapterEnd)}`);
        return true;
      }
    }
    return false;
  },
  
  clearLoop() {
    this.loopEnabled = false;
    this.chapterStart = null;
    this.chapterEnd = null;
    this.activeChapterIndex = -1;
    this.removeMarkers();
    this.clearPreviewHighlight();
  },
  
  checkLoop() {
    if (this.loopEnabled && this.chapterEnd && this.videoPlayer.currentTime >= this.chapterEnd - 0.1) {
      this.videoPlayer.currentTime = this.chapterStart;
    }
  },
  
  updateMarkers() {
    this.removeMarkers();
    if (!this.loopEnabled || !this.videoPlayer?.duration) return;
    
    const progressBar = document.getElementById('progressBar');
    const progressContainer = progressBar?.parentElement;
    if (!progressContainer) return;
    
    // Ensure container has relative positioning
    if (getComputedStyle(progressContainer).position === 'static') {
      progressContainer.style.position = 'relative';
    }
    
    const region = document.createElement('div');
    region.className = 'chapter-loop-region';
    const startPct = (this.chapterStart / this.videoPlayer.duration) * 100;
    const widthPct = ((this.chapterEnd - this.chapterStart) / this.videoPlayer.duration) * 100;
    region.style.cssText = `
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      height: 8px;
      left: ${startPct}%;
      width: ${widthPct}%;
      background: rgba(0, 255, 136, 0.5);
      border-radius: 4px;
      pointer-events: none;
      z-index: 2;
      box-shadow: 0 0 8px #00ff88;
    `;
    progressContainer.appendChild(region);
  },
  
  removeMarkers() {
    document.querySelectorAll('.chapter-loop-region').forEach(el => el.remove());
  },
  
  highlightPreview(index) {
    this.clearPreviewHighlight();
    const previews = document.querySelectorAll('.preview-item');
    if (previews[index]) {
      previews[index].classList.add('chapter-loop-active');
      previews[index].style.outline = '3px solid #00ff88';
      previews[index].style.outlineOffset = '2px';
    }
  },
  
  clearPreviewHighlight() {
    document.querySelectorAll('.preview-item').forEach(el => {
      el.classList.remove('chapter-loop-active');
      el.style.outline = '';
      el.style.outlineOffset = '';
    });
  },
  
  showFeedback(text) {
    const existing = document.querySelector('.chapter-loop-feedback');
    if (existing) existing.remove();
    
    const feedback = document.createElement('div');
    feedback.className = 'chapter-loop-feedback';
    feedback.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      color: #00ff88;
      padding: 16px 32px;
      border-radius: 12px;
      font-size: 18px;
      font-weight: 600;
      z-index: 10000;
      pointer-events: none;
      border: 2px solid #00ff88;
      animation: chapterFeedback 1.5s ease-out forwards;
    `;
    feedback.textContent = text;
    document.body.appendChild(feedback);
    
    setTimeout(() => feedback.remove(), 1500);
  },
  
  formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  },
  
  isModeActive() { return this.modeActive; }
};

// Platform detection (from preload)
const platform = window.platformInfo?.platform || 'unknown';
const isMac = window.platformInfo?.isMac || false;
const isWindows = window.platformInfo?.isWindows || false;
const isLinux = window.platformInfo?.isLinux || false;

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

// A-B Loop State
let abLoopEnabled = false;
let abLoopPointA = null;
let abLoopPointB = null;

// Theme State
let currentTheme = 'dark';
const themes = ['dark', 'light', 'purple', 'blue', 'green'];

// Mini Player State
let isMiniPlayer = false;

// Video Stats State
let showVideoStats = false;

// A-B Loop DOM Elements
const abLoopBtn = document.getElementById('abLoopBtn');
const abLoopIndicator = document.getElementById('abLoopIndicator');
const abLoopDisplay = document.getElementById('abLoopDisplay');

// Initialize
function init() {
  setupEventListeners();
  setupDragAndDrop();
  setupNewControls();
  setupABLoopControls();
  setupSidebarToggle();
  setupUIButtons();
  updatePlayButton(false);
  updateMuteButton();
  showDropZone();
  
  // Set initial volume
  volumeSlider.value = 75;
  videoPlayer.volume = 0.75;
}

// Setup UI Buttons (Stats, Theme, Mini Player)
function setupUIButtons() {
  const statsBtn = document.getElementById('statsBtn');
  const themeBtn = document.getElementById('themeBtn');
  const miniPlayerBtn = document.getElementById('miniPlayerBtn');
  
  if (statsBtn) {
    statsBtn.addEventListener('click', toggleVideoStats);
  }
  
  // Theme button is handled by themesModule.init()
  
  if (miniPlayerBtn) {
    miniPlayerBtn.addEventListener('click', toggleMiniPlayer);
  }
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
    // Use webUtils via preload to get file path
    path: window.fileUtils.getPathForFile(file),
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
  const selectedVideos = await window.electronAPI.invoke('select-videos');
  if (selectedVideos.length > 0) {
    addVideos(selectedVideos.map(v => ({ ...v, thumbnail: null })));
  }
}

async function selectFolder() {
  const folderVideos = await window.electronAPI.invoke('select-folder');
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
      await window.electronAPI.invoke('save-playlist', playlist);
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
    
    // Check A-B Loop
    checkABLoop();
  }
}

function updateDuration() {
  durationEl.textContent = formatTime(videoPlayer.duration);
  // Generate video previews when duration is available
  generateVideoPreviews();
  // Set chapter points for chapter loop
  chapterLoopModule.setChapterPoints(videoPlayer.duration);
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
    // A-B Loop shortcuts
    case 'BracketLeft': // [ key - Set point A
      e.preventDefault();
      setLoopPointA();
      break;
    case 'BracketRight': // ] key - Set point B
      e.preventDefault();
      setLoopPointB();
      break;
    case 'Backslash': // \ key - Clear A-B loop
      e.preventDefault();
      clearABLoop();
      break;
    case 'KeyL':
      // L toggles A-B loop (if points are set)
      if (abLoopPointA !== null && abLoopPointB !== null) {
        e.preventDefault();
        abLoopEnabled = !abLoopEnabled;
        updateABLoopUI();
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

// ============================================
// A-B LOOP FUNCTIONALITY
// ============================================

// Set A-B Loop point A (start)
function setLoopPointA() {
  if (!videoPlayer.src || !videoPlayer.duration) return;
  
  abLoopPointA = videoPlayer.currentTime;
  
  // If B is set and A is after B, swap them
  if (abLoopPointB !== null && abLoopPointA >= abLoopPointB) {
    abLoopPointB = null;
  }
  
  updateABLoopUI();
  showABLoopFeedback('A');
}

// Set A-B Loop point B (end)
function setLoopPointB() {
  if (!videoPlayer.src || !videoPlayer.duration) return;
  
  abLoopPointB = videoPlayer.currentTime;
  
  // If A is not set, set it to 0
  if (abLoopPointA === null) {
    abLoopPointA = 0;
  }
  
  // If B is before A, swap them
  if (abLoopPointB <= abLoopPointA) {
    const temp = abLoopPointA;
    abLoopPointA = abLoopPointB;
    abLoopPointB = temp;
  }
  
  // Enable A-B loop when both points are set
  abLoopEnabled = true;
  
  updateABLoopUI();
  showABLoopFeedback('B');
}

// Toggle A-B Loop on/off
function toggleABLoop() {
  if (abLoopPointA !== null && abLoopPointB !== null) {
    abLoopEnabled = !abLoopEnabled;
  } else if (abLoopPointA === null) {
    // First click sets A
    setLoopPointA();
    return;
  } else if (abLoopPointB === null) {
    // Second click sets B
    setLoopPointB();
    return;
  }
  
  updateABLoopUI();
}

// Clear A-B Loop points
function clearABLoop() {
  abLoopEnabled = false;
  abLoopPointA = null;
  abLoopPointB = null;
  updateABLoopUI();
}

// Update A-B Loop UI
function updateABLoopUI() {
  // Update button state
  if (abLoopBtn) {
    abLoopBtn.classList.toggle('active', abLoopEnabled);
    abLoopBtn.classList.toggle('has-points', abLoopPointA !== null || abLoopPointB !== null);
  }
  
  // Update indicator
  if (abLoopIndicator) {
    abLoopIndicator.style.display = (abLoopPointA !== null || abLoopPointB !== null) ? 'block' : 'none';
  }
  
  // Update display text
  if (abLoopDisplay) {
    if (abLoopPointA !== null && abLoopPointB !== null) {
      abLoopDisplay.textContent = `${formatTime(abLoopPointA)} - ${formatTime(abLoopPointB)}`;
      abLoopDisplay.style.display = 'block';
    } else if (abLoopPointA !== null) {
      abLoopDisplay.textContent = `A: ${formatTime(abLoopPointA)}`;
      abLoopDisplay.style.display = 'block';
    } else {
      abLoopDisplay.style.display = 'none';
    }
  }
  
  // Update progress bar markers
  updateABLoopMarkers();
}

// Update A-B Loop markers on progress bar
function updateABLoopMarkers() {
  // Remove existing markers
  const existingMarkers = document.querySelectorAll('.ab-loop-marker');
  existingMarkers.forEach(m => m.remove());
  
  const existingRegion = document.querySelector('.ab-loop-region');
  if (existingRegion) existingRegion.remove();
  
  if (!videoPlayer.duration) return;
  
  const progressContainer = progressBar.parentElement;
  if (!progressContainer) return;
  
  // Add A marker
  if (abLoopPointA !== null) {
    const markerA = document.createElement('div');
    markerA.className = 'ab-loop-marker marker-a';
    markerA.style.left = `${(abLoopPointA / videoPlayer.duration) * 100}%`;
    markerA.title = `A: ${formatTime(abLoopPointA)}`;
    progressContainer.appendChild(markerA);
  }
  
  // Add B marker
  if (abLoopPointB !== null) {
    const markerB = document.createElement('div');
    markerB.className = 'ab-loop-marker marker-b';
    markerB.style.left = `${(abLoopPointB / videoPlayer.duration) * 100}%`;
    markerB.title = `B: ${formatTime(abLoopPointB)}`;
    progressContainer.appendChild(markerB);
  }
  
  // Add loop region highlight
  if (abLoopPointA !== null && abLoopPointB !== null) {
    const region = document.createElement('div');
    region.className = 'ab-loop-region';
    const startPercent = (abLoopPointA / videoPlayer.duration) * 100;
    const endPercent = (abLoopPointB / videoPlayer.duration) * 100;
    region.style.left = `${startPercent}%`;
    region.style.width = `${endPercent - startPercent}%`;
    progressContainer.appendChild(region);
  }
}

// Check A-B Loop during playback
function checkABLoop() {
  if (!abLoopEnabled || abLoopPointA === null || abLoopPointB === null) return;
  
  if (videoPlayer.currentTime >= abLoopPointB) {
    videoPlayer.currentTime = abLoopPointA;
  }
}

// Visual feedback for A-B Loop point
function showABLoopFeedback(point) {
  const container = document.querySelector('.video-container');
  const feedback = document.createElement('div');
  feedback.className = 'ab-loop-feedback';
  feedback.textContent = point;
  feedback.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 48px;
    font-weight: bold;
    color: ${point === 'A' ? '#00d4ff' : '#ff6b35'};
    text-shadow: 0 0 20px ${point === 'A' ? '#00d4ff' : '#ff6b35'};
    pointer-events: none;
    z-index: 1000;
    animation: abFeedback 0.5s ease-out forwards;
  `;
  
  container.appendChild(feedback);
  
  setTimeout(() => feedback.remove(), 500);
}

// Setup A-B Loop controls
let abLoopClickTimer = null;
let abLoopClickCount = 0;

function setupABLoopControls() {
  if (abLoopBtn) {
    abLoopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      abLoopClickCount++;
      
      if (abLoopClickCount === 1) {
        // Wait to see if it's a double click
        abLoopClickTimer = setTimeout(() => {
          // Single click - toggle or set points
          toggleABLoop();
          abLoopClickCount = 0;
        }, 250);
      } else if (abLoopClickCount === 2) {
        // Double click - clear A-B loop
        clearTimeout(abLoopClickTimer);
        abLoopClickCount = 0;
        clearABLoop();
        showABLoopFeedback('✕');
      }
    });
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
  const result = await window.electronAPI.invoke('save-screenshot', { dataUrl, filename });
  
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
      
      // Check if chapter loop mode handles this click
      if (chapterLoopModule.handlePreviewClick(time)) {
        // Chapter loop mode handled the click - play video
        if (videoPlayer.paused) {
          playVideo();
        }
        return;
      }
      
      // Normal behavior - just seek to time
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

// Help Modal
const helpBtn = document.getElementById('helpBtn');
const helpModal = document.getElementById('helpModal');
const closeHelp = document.getElementById('closeHelp');
const helpModalOverlay = helpModal ? helpModal.querySelector('.modal-overlay') : null;

// About Modal and Help Modal are now handled by modules

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
  savedPlaylists = await window.electronAPI.invoke('get-playlists');
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
  
  const success = await window.electronAPI.invoke('save-playlist', playlist);
  if (success) {
    currentSavedPlaylistId = playlist.id;
    await loadSavedPlaylists();
  }
  return success;
}

// Delete a saved playlist
async function deleteSavedPlaylist(id) {
  const success = await window.electronAPI.invoke('delete-playlist', id);
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
window.electronAPI.on('show-about', () => {
  aboutModalModule.open();
});

window.electronAPI.on('add-videos', (newVideos) => {
  addVideos(newVideos.map(v => ({ ...v, thumbnail: null })));
});

// Handle external links - open in default browser
function setupExternalLinks() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a.external-link');
    if (link) {
      e.preventDefault();
      window.shellAPI.openExternal(link.href);
    }
  });
}

// ============================================
// VIDEO STATISTICS
// ============================================

function toggleVideoStats() {
  showVideoStats = !showVideoStats;
  updateVideoStatsDisplay();
  
  // Update button state
  const statsBtn = document.getElementById('statsBtn');
  if (statsBtn) {
    statsBtn.classList.toggle('active', showVideoStats);
  }
}

function updateVideoStatsDisplay() {
  let statsOverlay = document.getElementById('videoStatsOverlay');
  
  if (!showVideoStats) {
    if (statsOverlay) statsOverlay.remove();
    return;
  }
  
  if (!videoPlayer.src || videoPlayer.readyState < 2) {
    if (statsOverlay) statsOverlay.remove();
    return;
  }
  
  if (!statsOverlay) {
    statsOverlay = document.createElement('div');
    statsOverlay.id = 'videoStatsOverlay';
    statsOverlay.className = 'video-stats-overlay';
    document.querySelector('.video-container').appendChild(statsOverlay);
  }
  
  const video = videos[currentVideoIndex];
  const stats = {
    resolution: `${videoPlayer.videoWidth}×${videoPlayer.videoHeight}`,
    aspectRatio: getAspectRatio(videoPlayer.videoWidth, videoPlayer.videoHeight),
    duration: formatTime(videoPlayer.duration),
    currentTime: formatTime(videoPlayer.currentTime),
    playbackRate: `${videoPlayer.playbackRate}x`,
    volume: `${Math.round(videoPlayer.volume * 100)}%`,
    muted: videoPlayer.muted ? 'Yes' : 'No',
    loop: videoPlayer.loop ? 'Yes' : 'No',
    fileSize: video ? formatFileSize(video.size) : 'N/A',
    fileName: video ? video.name : 'N/A',
    buffered: getBufferedPercent(),
    networkState: getNetworkState(),
    readyState: getReadyState()
  };
  
  statsOverlay.innerHTML = `
    <div class="stats-header">
      <span>Video Statistics</span>
      <button class="stats-close" onclick="toggleVideoStats()">×</button>
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
      <div class="stats-row"><span>File Size:</span><span>${stats.fileSize}</span></div>
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
  if (videoPlayer.buffered.length > 0) {
    const buffered = videoPlayer.buffered.end(videoPlayer.buffered.length - 1);
    return `${Math.round((buffered / videoPlayer.duration) * 100)}%`;
  }
  return '0%';
}

function getNetworkState() {
  const states = ['Empty', 'Idle', 'Loading', 'No Source'];
  return states[videoPlayer.networkState] || 'Unknown';
}

function getReadyState() {
  const states = ['Nothing', 'Metadata', 'Current Data', 'Future Data', 'Enough Data'];
  return states[videoPlayer.readyState] || 'Unknown';
}

// Update stats periodically when visible
setInterval(() => {
  if (showVideoStats) {
    updateVideoStatsDisplay();
  }
}, 500);

// Theme System is now handled by themesModule

// ============================================
// MINI PLAYER MODE
// ============================================

function toggleMiniPlayer() {
  isMiniPlayer = !isMiniPlayer;
  
  if (isMiniPlayer) {
    document.body.classList.add('mini-player-mode');
    window.electronAPI.send('set-mini-player', true);
  } else {
    document.body.classList.remove('mini-player-mode');
    window.electronAPI.send('set-mini-player', false);
  }
  
  updateMiniPlayerUI();
}

function updateMiniPlayerUI() {
  const miniBtn = document.getElementById('miniPlayerBtn');
  if (miniBtn) {
    miniBtn.classList.toggle('active', isMiniPlayer);
  }
}

// ============================================
// EXTENDED KEYBOARD SHORTCUTS
// ============================================

// Updated keyboard handler with new shortcuts
const originalHandleKeyboard = handleKeyboard;
handleKeyboard = function(e) {
  if (e.target.tagName === 'INPUT') return;
  
  // New shortcuts
  switch(e.code) {
    case 'KeyH':
      // H for Help
      e.preventDefault();
      helpModalModule.open();
      return;
    case 'KeyI':
      // I for Info/Stats
      e.preventDefault();
      toggleVideoStats();
      return;
    case 'KeyT':
      // T for Theme
      e.preventDefault();
      themesModule.cycle();
      return;
    case 'KeyC':
      // C for Chapter Loop Mode
      e.preventDefault();
      chapterLoopModule.toggleMode();
      return;
    case 'KeyW':
      // W for Mini Window
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        toggleMiniPlayer();
        return;
      }
      break;
    case 'Comma':
      // , for frame back
      e.preventDefault();
      if (videoPlayer.src) {
        videoPlayer.pause();
        videoPlayer.currentTime = Math.max(0, videoPlayer.currentTime - (1 / 30));
      }
      return;
    case 'Period':
      // . for frame forward
      e.preventDefault();
      if (videoPlayer.src) {
        videoPlayer.pause();
        videoPlayer.currentTime = Math.min(videoPlayer.duration, videoPlayer.currentTime + (1 / 30));
      }
      return;
  }
  
  // Call original handler for other keys
  originalHandleKeyboard.call(this, e);
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize modules
  helpModalModule.init();
  aboutModalModule.init();
  themesModule.init();
  chapterLoopModule.init(videoPlayer);
  
  setupPlaylistModal();
  setupSavedPlaylistsToggle();
  setupExternalLinks();
  setupPreviewScroll();
  // Theme loading is handled by themesModule.init()
  await loadSavedPlaylists();
  init();
});
