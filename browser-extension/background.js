// TronVid Browser Extension - Background Script
// Handles extension icon click

chrome.action.onClicked.addListener(async (tab) => {
  // Check if we're on a supported video page
  const url = tab.url;
  const supportedPatterns = [
    /youtube\.com\/watch/,
    /youtu\.be\//,
    /vimeo\.com\/\d+/,
    /twitch\.tv\/videos\//,
    /clips\.twitch\.tv/,
    /dailymotion\.com\/video/,
    /dai\.ly\//
  ];
  
  const isSupported = supportedPatterns.some(pattern => pattern.test(url));
  
  if (isSupported) {
    // Create tronvid:// URL
    const title = tab.title || 'Video';
    const tronvidUrl = `tronvid://add-stream?url=${encodeURIComponent(url)}&name=${encodeURIComponent(title)}`;
    
    // Execute script to navigate
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (tronvidUrl) => {
        window.location.href = tronvidUrl;
      },
      args: [tronvidUrl]
    });
  } else {
    // Show message that this page is not supported
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const notification = document.createElement('div');
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999999;
          padding: 16px 24px;
          border-radius: 12px;
          background: linear-gradient(135deg, #2e1a1a 0%, #3e1616 100%);
          color: #ff4444;
          border: 1px solid #ff4444;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 14px;
          box-shadow: 0 4px 20px rgba(255, 68, 68, 0.3);
          animation: slideIn 0.3s ease;
        `;
        notification.textContent = '⚠️ Not a video page. Navigate to a YouTube, Vimeo, Twitch, or Dailymotion video.';
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 4000);
      }
    });
  }
});
