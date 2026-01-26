# Changelog

All notable changes to TronVid will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.6.4] - 2026-01-26

### Changed
- Reorganized project structure for professional layout
- Moved source files to `src/` directory
- Moved assets to `assets/` directory
- Updated all internal references

### Added
- Professional GitHub repository files (CONTRIBUTING.md, CODE_OF_CONDUCT.md)

## [1.0.0] - 2026-01-26

### Added
- Initial release of TronVid
- Multi-format video support (MP4, MOV, AVI, MKV, WebM)
- Playlist management with save/load functionality
- Cross-platform support (macOS, Windows, Linux)
- Modern dark-themed user interface
- Keyboard shortcuts for all major functions
- Screenshot capture with automatic saving to Pictures folder
- Shuffle and loop playback modes
- Playback speed control (0.25x - 2x)
- Picture-in-Picture mode
- Video preview thumbnails
- Volume control with mute option
- Drag and drop support for adding videos
- Collapsible sidebar for better viewing experience
- Video progress bar with seeking
- Current video name display
- Video count indicator

### Technical
- Built with Electron 28.0.0
- Native menus for each platform
- Local storage for playlists (userData)
- ASAR packaging for distribution

---

## Version History

### Versioning Scheme

We use [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for new functionality (backwards compatible)
- **PATCH** version for backwards compatible bug fixes

### How to Upgrade

1. Download the new version from the [Releases](https://github.com/tron4x/tronvid/releases) page
2. Install the new version (your playlists will be preserved)
3. Enjoy the new features!

[Unreleased]: https://github.com/tron4x/tronvid/compare/v1.6.4...HEAD
[1.6.4]: https://github.com/tron4x/tronvid/compare/v1.0.0...v1.6.4
[1.0.0]: https://github.com/tron4x/tronvid/releases/tag/v1.0.0
