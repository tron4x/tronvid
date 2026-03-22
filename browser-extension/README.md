# TronVid Browser Extension

Add YouTube, Vimeo, Twitch, and Dailymotion videos directly to TronVid with one click!

## Features

- 🔴 **YouTube** - Add videos to TronVid playlist
- 🔵 **Vimeo** - Add videos to TronVid playlist  
- 🟣 **Twitch** - Add VODs and clips
- 🟢 **Dailymotion** - Add videos

## Browser Compatibility

| Browser | Support | Manifest |
|---------|---------|----------|
| ✅ Chrome | Full | v3 |
| ✅ Edge | Full | v3 |
| ✅ Brave | Full | v3 |
| ✅ Opera | Full | v3 |
| ✅ Firefox | Full | v2 |
| ❌ Safari | Not supported | - |

## Installation

### Chrome / Edge / Brave / Opera (Chromium-based)

1. Open `chrome://extensions/` (or `edge://extensions/`)
2. Enable **"Developer mode"** (toggle in top-right)
3. Click **"Load unpacked"**
4. Select the `browser-extension` folder
5. Done! The extension icon appears in toolbar

### Firefox

**Option 1: Temporary Install (for testing)**
1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `manifest-firefox.json` from the folder

**Option 2: Permanent Install**
1. Rename `manifest-firefox.json` to `manifest.json`
2. Rename `background-firefox.js` to `background.js`
3. Zip all files in the folder
4. Open `about:addons` → Gear icon → "Install Add-on From File"
5. Select the zip file

## Usage

1. **Install TronVid** app on your computer
2. **Install the browser extension**
3. Navigate to a supported video page (YouTube, Vimeo, etc.)
4. Click the **"Add to TronVid"** button that appears on the page
5. TronVid opens and adds the video to your playlist!

## How it Works

The extension uses the `tronvid://` URL protocol to communicate with the TronVid app:

```
tronvid://add-stream?url=<video-url>&name=<video-title>
```

When you click "Add to TronVid", the extension:
1. Detects the current video URL and title
2. Creates a `tronvid://` URL
3. Opens TronVid with the video details
4. TronVid adds the video to your playlist automatically

## Supported Platforms

| Platform | URL Patterns |
|----------|-------------|
| YouTube | `youtube.com/watch`, `youtu.be/` |
| Vimeo | `vimeo.com/123456` |
| Twitch | `twitch.tv/videos/`, `clips.twitch.tv` |
| Dailymotion | `dailymotion.com/video/`, `dai.ly/` |

## Creating Icons

To create the extension icons, you can:

1. Use the TronVid logo and resize it:
   - `icon48.png` - 48x48 pixels
   - `icon128.png` - 128x128 pixels

2. Or use any image editing tool (GIMP, Photoshop, etc.)

## Notes

- TronVid must be installed for the extension to work
- The extension only works on supported video platform pages
- The `tronvid://` protocol must be registered (happens automatically when TronVid is installed)

## Troubleshooting

### Extension not working?

1. Make sure TronVid is installed and has been run at least once
2. Reload the browser extension after installing TronVid
3. Check if the floating button appears on video pages

### TronVid doesn't open?

1. Try running TronVid once to register the URL protocol
2. On macOS, protocol handlers are registered automatically
3. On Windows, you may need to run TronVid as administrator once

## License

Part of TronVid - Apache License 2.0
