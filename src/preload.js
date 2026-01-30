/**
 * Preload Script - Secure IPC Bridge
 * This file runs in a sandboxed context and exposes only necessary APIs
 */

const { contextBridge, ipcRenderer, shell, webUtils } = require('electron');

// Whitelist of allowed IPC channels
const validChannels = {
  send: ['set-mini-player'],
  invoke: [
    'select-videos',
    'select-folder', 
    'select-subtitle',
    'get-playlists',
    'save-playlist',
    'delete-playlist',
    'update-playlists',
    'save-screenshot',
    'get-video-chapters'
  ],
  receive: ['show-about', 'add-videos']
};

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Send messages to main process (one-way)
  send: (channel, data) => {
    if (validChannels.send.includes(channel)) {
      ipcRenderer.send(channel, data);
    } else {
      console.warn(`Invalid send channel: ${channel}`);
    }
  },
  
  // Invoke handlers in main process (two-way, with response)
  invoke: async (channel, ...args) => {
    if (validChannels.invoke.includes(channel)) {
      return await ipcRenderer.invoke(channel, ...args);
    } else {
      console.warn(`Invalid invoke channel: ${channel}`);
      return null;
    }
  },
  
  // Receive messages from main process
  on: (channel, callback) => {
    if (validChannels.receive.includes(channel)) {
      // Wrap callback to filter event
      const subscription = (event, ...args) => callback(...args);
      ipcRenderer.on(channel, subscription);
      
      // Return unsubscribe function
      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    } else {
      console.warn(`Invalid receive channel: ${channel}`);
      return () => {};
    }
  },
  
  // Remove all listeners for a channel
  removeAllListeners: (channel) => {
    if (validChannels.receive.includes(channel)) {
      ipcRenderer.removeAllListeners(channel);
    }
  }
});

// Expose shell functions (only openExternal is allowed)
contextBridge.exposeInMainWorld('shellAPI', {
  openExternal: (url) => {
    // Validate URL before opening
    try {
      const parsed = new URL(url);
      if (['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
        shell.openExternal(url);
        return true;
      }
    } catch (e) {
      console.warn('Invalid URL:', url);
    }
    return false;
  }
});

// Expose platform info (read-only)
contextBridge.exposeInMainWorld('platformInfo', {
  platform: process.platform,
  isMac: process.platform === 'darwin',
  isWindows: process.platform === 'win32',
  isLinux: process.platform === 'linux'
});

// Expose file utilities for drag & drop
contextBridge.exposeInMainWorld('fileUtils', {
  // Get file path from dropped file using webUtils
  getPathForFile: (file) => {
    try {
      return webUtils.getPathForFile(file);
    } catch (e) {
      console.warn('Could not get file path:', e);
      return file.path || '';
    }
  }
});

console.log('Preload script loaded - Secure IPC bridge established');
