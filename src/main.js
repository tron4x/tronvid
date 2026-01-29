const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

// Set app name for OS menu (macOS, Windows, Linux)
app.setName('TronVid');

let mainWindow;

// Playlists storage path
const playlistsPath = path.join(app.getPath('userData'), 'playlists.json');

// Load playlists from file
function loadPlaylists() {
  try {
    if (fs.existsSync(playlistsPath)) {
      const data = fs.readFileSync(playlistsPath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading playlists:', error);
  }
  return [];
}

// Save playlists to file
function savePlaylists(playlists) {
  try {
    fs.writeFileSync(playlistsPath, JSON.stringify(playlists, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving playlists:', error);
    return false;
  }
}

// Create Application Menu
function createMenu() {
  const isMac = process.platform === 'darwin';
  
  const template = [
    // App Menu (macOS only)
    ...(isMac ? [{
      label: app.name,
      submenu: [
        {
          label: 'About TronVid',
          click: () => {
            mainWindow.webContents.send('show-about');
          }
        },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide', label: 'Hide TronVid' },
        { role: 'hideOthers', label: 'Hide Others' },
        { role: 'unhide', label: 'Show All' },
        { type: 'separator' },
        { role: 'quit', label: 'Quit TronVid' }
      ]
    }] : []),
    // File Menu
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Videos...',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openFile', 'multiSelections'],
              filters: [
                { name: 'Videos', extensions: ['mp4', 'mov', 'avi', 'mkv', 'webm'] }
              ]
            });
            if (!result.canceled) {
              const videos = result.filePaths.map(filePath => ({
                path: filePath,
                name: path.basename(filePath),
                size: fs.statSync(filePath).size
              }));
              mainWindow.webContents.send('add-videos', videos);
            }
          }
        },
        {
          label: 'Open Folder...',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openDirectory']
            });
            if (!result.canceled) {
              const folderPath = result.filePaths[0];
              const files = fs.readdirSync(folderPath);
              const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
              const videos = files
                .filter(file => videoExtensions.includes(path.extname(file).toLowerCase()))
                .map(file => {
                  const filePath = path.join(folderPath, file);
                  return {
                    path: filePath,
                    name: file,
                    size: fs.statSync(filePath).size
                  };
                });
              mainWindow.webContents.send('add-videos', videos);
            }
          }
        },
        { type: 'separator' },
        isMac ? { role: 'close', label: 'Close Window' } : { role: 'quit', label: 'Exit' }
      ]
    },
    // Edit Menu
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll', label: 'Select All' }
      ]
    },
    // View Menu
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload', label: 'Force Reload' },
        { role: 'toggleDevTools', label: 'Developer Tools' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Actual Size' },
        { role: 'zoomIn', label: 'Zoom In' },
        { role: 'zoomOut', label: 'Zoom Out' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Fullscreen' }
      ]
    },
    // Window Menu
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [
          { type: 'separator' },
          { role: 'front', label: 'Bring All to Front' }
        ] : [
          { role: 'close' }
        ])
      ]
    },
    // Help Menu
    {
      label: 'Help',
      submenu: [
        {
          label: 'About TronVid',
          click: () => {
            mainWindow.webContents.send('show-about');
          }
        }
      ]
    }
  ];
  
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createWindow() {
  const isMac = process.platform === 'darwin';
  const isWindows = process.platform === 'win32';
  
  // Set app icon - use appropriate format per platform
  let iconPath;
  if (isMac) {
    // On macOS, also set the dock icon
    iconPath = path.join(__dirname, '..', 'assets', 'logo.png');
    const { nativeImage } = require('electron');
    const dockIcon = nativeImage.createFromPath(iconPath);
    if (app.dock) {
      app.dock.setIcon(dockIcon);
    }
  } else if (isWindows) {
    iconPath = path.join(__dirname, '..', 'build', 'icon.ico');
  } else {
    iconPath = path.join(__dirname, '..', 'build', 'icon.png');
  }
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'TronVid',
    // Platform-specific title bar
    titleBarStyle: isMac ? 'hiddenInset' : 'default',
    frame: !isMac, // Use native frame on Windows/Linux
    backgroundColor: '#1a1a2e',
    icon: iconPath,
    // Windows-specific settings
    ...(isWindows && {
      autoHideMenuBar: false
    }),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  
  // Open DevTools in development
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createMenu();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// File dialog to select videos
ipcMain.handle('select-videos', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Videos', extensions: ['mp4', 'mov', 'avi', 'mkv', 'webm'] }
    ]
  });
  
  if (!result.canceled) {
    const videos = result.filePaths.map(filePath => ({
      path: filePath,
      name: path.basename(filePath),
      size: fs.statSync(filePath).size
    }));
    return videos;
  }
  return [];
});

// Folder dialog to select a folder with videos
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  
  if (!result.canceled) {
    const folderPath = result.filePaths[0];
    const files = fs.readdirSync(folderPath);
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
    
    const videos = files
      .filter(file => videoExtensions.includes(path.extname(file).toLowerCase()))
      .map(file => {
        const filePath = path.join(folderPath, file);
        return {
          path: filePath,
          name: file,
          size: fs.statSync(filePath).size
        };
      });
    
    return videos;
  }
  return [];
});

// Subtitle dialog to select subtitle files
ipcMain.handle('select-subtitle', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Subtitles', extensions: ['vtt', 'srt'] }
    ]
  });
  
  if (!result.canceled) {
    const filePath = result.filePaths[0];
    const content = fs.readFileSync(filePath, 'utf-8');
    const ext = path.extname(filePath).toLowerCase();
    
    return {
      path: filePath,
      name: path.basename(filePath),
      content: content,
      format: ext.substring(1) // 'vtt' or 'srt'
    };
  }
  return null;
});

// Playlist IPC handlers
ipcMain.handle('get-playlists', () => {
  return loadPlaylists();
});

ipcMain.handle('save-playlist', (event, playlist) => {
  const playlists = loadPlaylists();
  // Check if playlist with same name exists
  const existingIndex = playlists.findIndex(p => p.id === playlist.id);
  if (existingIndex >= 0) {
    playlists[existingIndex] = playlist;
  } else {
    playlists.push(playlist);
  }
  return savePlaylists(playlists);
});

ipcMain.handle('delete-playlist', (event, playlistId) => {
  const playlists = loadPlaylists();
  const filtered = playlists.filter(p => p.id !== playlistId);
  return savePlaylists(filtered);
});

ipcMain.handle('update-playlists', (event, playlists) => {
  return savePlaylists(playlists);
});

// Screenshot handler - save to Pictures folder
// Mini Player Mode
let normalBounds = null;

ipcMain.on('set-mini-player', (event, enabled) => {
  if (!mainWindow) return;
  
  if (enabled) {
    // Save current bounds
    normalBounds = mainWindow.getBounds();
    
    // Set mini player size and always on top
    mainWindow.setAlwaysOnTop(true, 'floating');
    mainWindow.setMinimumSize(400, 300);
    mainWindow.setSize(800, 600);
    
    // Center on screen
    mainWindow.center();
  } else {
    // Restore normal mode
    mainWindow.setAlwaysOnTop(false);
    mainWindow.setMinimumSize(800, 600);
    
    if (normalBounds) {
      mainWindow.setBounds(normalBounds);
    } else {
      mainWindow.setSize(1200, 800);
      mainWindow.center();
    }
  }
});

ipcMain.handle('save-screenshot', async (event, { dataUrl, filename }) => {
  try {
    // Get Pictures folder path
    const picturesPath = app.getPath('pictures');
    const screenshotsFolder = path.join(picturesPath, 'TronVid Screenshots');
    
    // Create folder if it doesn't exist
    if (!fs.existsSync(screenshotsFolder)) {
      fs.mkdirSync(screenshotsFolder, { recursive: true });
    }
    
    // Convert data URL to buffer
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Save file
    const filePath = path.join(screenshotsFolder, filename);
    fs.writeFileSync(filePath, buffer);
    
    return { success: true, path: filePath };
  } catch (error) {
    console.error('Screenshot save error:', error);
    return { success: false, error: error.message };
  }
});
