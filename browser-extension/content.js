// TronVid Browser Extension - Content Script
// Adds a floating button on supported video platforms

(function() {
  'use strict';
  
  // Supported platforms detection
  const platforms = {
    youtube: {
      pattern: /youtube\.com\/watch|youtu\.be\//,
      getTitle: () => document.title.replace(' - YouTube', '').trim(),
      getUrl: () => window.location.href
    },
    vimeo: {
      pattern: /vimeo\.com\/\d+/,
      getTitle: () => document.title.replace(' on Vimeo', '').trim(),
      getUrl: () => window.location.href
    },
    twitch: {
      pattern: /twitch\.tv\/videos\/|clips\.twitch\.tv/,
      getTitle: () => document.title.replace(' - Twitch', '').trim(),
      getUrl: () => window.location.href
    },
    dailymotion: {
      pattern: /dailymotion\.com\/video|dai\.ly\//,
      getTitle: () => document.title.replace(' - Dailymotion', '').trim(),
      getUrl: () => window.location.href
    }
  };
  
  let currentPlatform = null;
  let button = null;
  let notification = null;
  
  // Detect current platform
  function detectPlatform() {
    const url = window.location.href;
    for (const [name, config] of Object.entries(platforms)) {
      if (config.pattern.test(url)) {
        return { name, ...config };
      }
    }
    return null;
  }
  
  // Create the floating button
  function createButton() {
    if (button) return;
    
    button = document.createElement('div');
    button.id = 'tronvid-add-button';
    button.innerHTML = `
      <div class="tronvid-button-content">
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z"/>
        </svg>
        <span>Add to TronVid</span>
      </div>
    `;
    
    button.addEventListener('click', handleAddClick);
    document.body.appendChild(button);
  }
  
  // Create notification element
  function createNotification() {
    if (notification) return;
    
    notification = document.createElement('div');
    notification.id = 'tronvid-notification';
    document.body.appendChild(notification);
  }
  
  // Show notification
  function showNotification(message, type = 'success') {
    createNotification();
    notification.textContent = message;
    notification.className = `tronvid-notification tronvid-notification-${type} tronvid-notification-show`;
    
    setTimeout(() => {
      notification.classList.remove('tronvid-notification-show');
    }, 3000);
  }
  
  // Handle button click
  function handleAddClick() {
    if (!currentPlatform) return;
    
    const videoUrl = currentPlatform.getUrl();
    const videoTitle = currentPlatform.getTitle();
    
    // Create tronvid:// URL scheme
    const tronvidUrl = `tronvid://add-stream?url=${encodeURIComponent(videoUrl)}&name=${encodeURIComponent(videoTitle)}`;
    
    // Try to open TronVid
    window.location.href = tronvidUrl;
    
    // Show feedback
    showNotification(`✓ Opening in TronVid: ${videoTitle}`, 'success');
    
    // Also copy to clipboard as backup
    navigator.clipboard.writeText(videoUrl).catch(() => {});
  }
  
  // Remove button
  function removeButton() {
    if (button) {
      button.remove();
      button = null;
    }
  }
  
  // Check and update button visibility
  function checkPage() {
    const platform = detectPlatform();
    
    if (platform) {
      currentPlatform = platform;
      createButton();
      
      // Update button appearance based on platform
      if (button) {
        button.setAttribute('data-platform', platform.name);
      }
    } else {
      currentPlatform = null;
      removeButton();
    }
  }
  
  // Initialize
  function init() {
    // Initial check
    checkPage();
    
    // Watch for URL changes (SPA navigation)
    let lastUrl = window.location.href;
    const observer = new MutationObserver(() => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        setTimeout(checkPage, 500);
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Also check on popstate
    window.addEventListener('popstate', () => setTimeout(checkPage, 500));
  }
  
  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
