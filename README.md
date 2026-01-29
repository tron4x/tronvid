# 🎬 TronVid

<p align="center">
  <img src="assets/logo.png" alt="TronVid Logo" width="128" height="128">
</p>

<p align="center">
  <strong>A modern, cross-platform video player with playlist support</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#keyboard-shortcuts">Shortcuts</a> •
  <a href="#building">Building</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

<p align="center">
  <a href="https://github.com/tron4x/tronvid/releases"><img src="https://img.shields.io/badge/version-1.6.4-orange" alt="Version"></a>
  <img src="https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-blue" alt="Platform">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache%202.0-blue" alt="License"></a>
  <img src="https://img.shields.io/badge/electron-40.0.0-9feaf9" alt="Electron">
  <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen" alt="Node">
  <a href="https://github.com/tron4x/tronvid/issues"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen" alt="PRs Welcome"></a>
</p>

---

<p align="center">
  <img src="public/screen.png" alt="TronVid" width="800">
  <br>
  <em>Main Window</em>
</p>

<p align="center">
  <img src="public/screen1.png" alt="TronVid miniplayer" width="800">
  <br>
  <em>Mini Player</em>
</p>

---

## ✨ Features

### Core Features
- 🎥 **Multi-Format Support** - Play MP4, MOV, AVI, MKV, and WebM videos
- 📂 **Playlist Management** - Create, save, and organize multiple playlists
- 🖥️ **Cross-Platform** - Works on macOS, Windows, and Linux
- 🎨 **5 Color Themes** - Dark (default), Light, Purple, Blue, and Green
- ⌨️ **Full Keyboard Control** - Comprehensive shortcuts for power users

### Playback Features
- 🔁 **A-B Loop** - Set start/end points to loop a specific section
- 🎚️ **Speed Control** - Adjust playback speed (0.25x - 2x)
- 🔀 **Shuffle & Loop** - Shuffle playlist or loop current video
- 🎞️ **Frame-by-Frame** - Navigate frame by frame with `,` and `.` keys

### Advanced Features
- 📸 **Screenshot Capture** - Save screenshots as PNG files
- 🖼️ **Picture-in-Picture** - Watch videos in a floating window
- 📺 **Video Previews** - Thumbnail strip for quick navigation
- 📊 **Video Statistics** - View resolution, bitrate, codec info
- 🪟 **Mini Player Mode** - Compact mode for multitasking
- ❓ **Built-in Help** - Press `H` for a complete feature guide

### User Experience
- 🖱️ **Drag & Drop** - Simply drop videos to add them
- 🔊 **Volume Control** - Adjustable volume with mute option
- 📁 **Collapsible Sidebar** - More space when you need it
- 🎯 **Reorderable Playlist** - Drag items to reorder

## 📦 Installation

### Download Pre-built Binaries

Download the latest release for your platform from the [Releases](https://github.com/tron4x/tronvid/releases) page.

| Platform | Download |
|----------|----------|
| macOS (Apple Silicon) | `TronVid-x.x.x-arm64.dmg` |
| Windows (64-bit) | `TronVid-x.x.x-win-x64.exe` |
| Windows (32-bit) | `TronVid-x.x.x-win-ia32.exe` |
| Linux (AppImage) | `TronVid-x.x.x-linux-x86_64.AppImage` |
| Linux (Debian) | `TronVid-x.x.x-linux-amd64.deb` |

### Build from Source

```bash
# Clone the repository
git clone https://github.com/tron4x/tronvid.git
cd tronvid

# Install dependencies
npm install

# Run in development mode
npm start

# Build for your platform
npm run build:mac      # macOS
npm run build:win64    # Windows 64-bit
npm run build:win32    # Windows 32-bit
npm run build:linux64  # Linux 64-bit
npm run build:all      # All platforms
```

## 🚀 Usage

### Adding Videos

1. **Drag & Drop** - Drag video files directly into the app
2. **File Selection** - Click "Files" to select individual videos
3. **Folder Selection** - Click "Folder" to add all videos from a directory

### Managing Playlists

- **Save Playlist** - Click the 💾 icon to save your current playlist
- **Load Playlist** - Click on any saved playlist to load it
- **Create Playlist** - Click the ➕ icon to create a new empty playlist
- **Delete Playlist** - Click the ✕ button on any playlist to delete it
- **Clear Playlist** - Click "Clear Playlist" to remove all videos
- **Reorder** - Drag playlist items to change order

> **💡 How Playlists Work:**  
> TronVid stores only the **file paths** to your videos, not the actual video files. This means:
> - ✅ No disk space is wasted on duplicates
> - ✅ Playlists load instantly
> - ✅ Original files stay in their original location
> - ⚠️ If you move or delete a video file, the playlist entry won't work anymore
> 
> Playlists are saved locally in your user data folder and persist between sessions.

### A-B Loop

Repeat a specific section of the video:

1. Press `[` to set the start point (A)
2. Press `]` to set the end point (B) - loop starts automatically
3. Press `L` to toggle the loop on/off
4. Press `\` or double-click the A-B button to clear

### Themes

Press `T` to cycle through 5 color themes:
- **Dark** (default)
- **Light**
- **Purple**
- **Blue**
- **Green**

## ⌨️ Keyboard Shortcuts

### Playback

| Shortcut | Action |
|----------|--------|
| `Space` | Play / Pause |
| `N` | Next video |
| `P` | Previous video |
| `←` | Rewind 10 seconds |
| `→` | Fast forward 10 seconds |
| `,` | Previous frame (fine control) |
| `.` | Next frame (fine control) |

### Volume

| Shortcut | Action |
|----------|--------|
| `↑` | Volume up (+10%) |
| `↓` | Volume down (-10%) |
| `M` | Mute / Unmute |

### A-B Loop

| Shortcut | Action |
|----------|--------|
| `[` | Set loop start point (A) |
| `]` | Set loop end point (B) |
| `\` | Clear A-B loop |
| `L` | Toggle A-B loop on/off |

### View & Window

| Shortcut | Action |
|----------|--------|
| `F` | Toggle fullscreen |
| `Ctrl/Cmd + B` | Toggle sidebar |
| `Ctrl/Cmd + W` | Mini player mode |
| `I` | Toggle video statistics |
| `T` | Change theme |
| `H` | Open help modal |

### Other

| Shortcut | Action |
|----------|--------|
| `S` | Take screenshot |

## 🔧 Building

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) (v9 or later)

### Build Commands

```bash
# Install dependencies
npm install

# Build for macOS
npm run build:mac

# Build for Windows (both architectures)
npm run build:win

# Build for Windows 64-bit only
npm run build:win64

# Build for Windows 32-bit only
npm run build:win32

# Build for Linux 64-bit
npm run build:linux64

# Build for all platforms
npm run build:all
```

Built applications will be in the `dist/` directory.

## 📁 Project Structure

```
tronvid/
├── src/                    # Source code
│   ├── main.js             # Electron main process
│   ├── renderer.js         # Renderer process (UI logic)
│   ├── index.html          # Main HTML file
│   ├── styles.css          # Application styles
│   └── modules/            # Modular components
│       ├── helpModal.js    # Help modal functionality
│       ├── aboutModal.js   # About modal functionality
│       ├── themes.js       # Theme system
│       ├── videoStats.js   # Video statistics overlay
│       └── abLoop.js       # A-B loop functionality
├── assets/                 # Static assets
│   └── logo.png            # Application logo
├── build/                  # Build resources
│   ├── icon.icns           # macOS icon
│   ├── icon.ico            # Windows icon
│   └── icon.png            # Linux icon
├── package.json            # Project configuration
├── LICENSE                 # Apache 2.0 License
├── README.md               # This file
├── CONTRIBUTING.md         # Contributing guidelines
├── CODE_OF_CONDUCT.md      # Code of conduct
├── CHANGELOG.md            # Version history
└── dist/                   # Built applications (generated)
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on the process for submitting pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**tron4x**

- GitHub: [@tron4x](https://github.com/tron4x)

## 🙏 Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- Icons and design inspired by modern media players

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/tron4x">tron4x</a>
</p>
