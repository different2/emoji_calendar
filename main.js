const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises; // Use promises version
const fsSync = require('fs'); // Keep sync version for checking existence
const os = require('os');

// Keep a global reference of the window object
let mainWindow;

// Path for storing calendar data
const userDataPath = path.join(os.homedir(), '.my-calendar-data.json');

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hiddenInset', // Mac-style title bar
    icon: path.join(__dirname, 'assets', 'icon.png'),
    show: false // Don't show until ready
  });

  // Load the app
  mainWindow.loadFile('index.html');

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Open DevTools in development to see console messages
    if (process.env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Set up the menu
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'My Calendar',
      submenu: [
        {
          label: 'About My Calendar',
          role: 'about'
        },
        {
          label: 'Clear All Data',
          accelerator: 'Command+Shift+Delete',
          click: () => {
            mainWindow.webContents.send('clear-all-data');
          }
        },
        { type: 'separator' },
        {
          label: 'Hide My Calendar',
          accelerator: 'Command+H',
          role: 'hide'
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Alt+H',
          role: 'hideothers'
        },
        {
          label: 'Show All',
          role: 'unhide'
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'File',
      submenu: [
        {
          label: 'New Event',
          accelerator: 'Command+N',
          click: () => {
            mainWindow.webContents.send('new-event');
          }
        },
        { type: 'separator' },
        {
          label: 'Export Calendar',
          accelerator: 'Command+E',
          click: () => {
            mainWindow.webContents.send('export-calendar');
          }
        },
        {
          label: 'Import Calendar',
          accelerator: 'Command+I',
          click: () => {
            mainWindow.webContents.send('import-calendar');
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'Command+Z',
          role: 'undo'
        },
        {
          label: 'Redo',
          accelerator: 'Shift+Command+Z',
          role: 'redo'
        },
        { type: 'separator' },
        {
          label: 'Cut',
          accelerator: 'Command+X',
          role: 'cut'
        },
        {
          label: 'Copy',
          accelerator: 'Command+C',
          role: 'copy'
        },
        {
          label: 'Paste',
          accelerator: 'Command+V',
          role: 'paste'
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Previous Month',
          accelerator: 'Command+Left',
          click: () => {
            mainWindow.webContents.send('prev-month');
          }
        },
        {
          label: 'Next Month',
          accelerator: 'Command+Right',
          click: () => {
            mainWindow.webContents.send('next-month');
          }
        },
        {
          label: 'Today',
          accelerator: 'Command+T',
          click: () => {
            mainWindow.webContents.send('go-to-today');
          }
        },
        { type: 'separator' },
        {
          label: 'Reload',
          accelerator: 'Command+R',
          role: 'reload'
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'Alt+Command+I',
          role: 'toggledevtools'
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'Command+M',
          role: 'minimize'
        },
        {
          label: 'Close',
          accelerator: 'Command+W',
          role: 'close'
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC handlers for data persistence
ipcMain.handle('save-events', async (event, events) => {
  try {
    // Ensure directory exists
    const dir = path.dirname(userDataPath);
    if (!fsSync.existsSync(dir)) {
      await fs.mkdir(dir, { recursive: true });
    }
    
    await fs.writeFile(userDataPath, JSON.stringify(events, null, 2), 'utf8');
    return { success: true };
  } catch (error) {
    console.error('Error saving events:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-events', async () => {
  try {
    if (fsSync.existsSync(userDataPath)) {
      const data = await fs.readFile(userDataPath, 'utf8');
      return { success: true, events: JSON.parse(data) };
    }
    return { success: true, events: {} };
  } catch (error) {
    console.error('Error loading events:', error);
    return { success: false, error: error.message, events: {} };
  }
});

// Export calendar data to file
ipcMain.handle('export-calendar-to-file', async (event, filePath, events) => {
  try {
    console.log('Exporting to:', filePath);
    
    // Ensure the directory exists
    const dir = path.dirname(filePath);
    if (!fsSync.existsSync(dir)) {
      await fs.mkdir(dir, { recursive: true });
    }
    
    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      events: events
    };
    
    // Use async file writing
    await fs.writeFile(filePath, JSON.stringify(exportData, null, 2), 'utf8');
    console.log('File written successfully to:', filePath);
    
    return { success: true, filePath };
  } catch (error) {
    console.error('Error exporting calendar:', error);
    return { success: false, error: error.message };
  }
});

// Import calendar data from file
ipcMain.handle('import-calendar-from-file', async (event, filePath) => {
  try {
    if (!fsSync.existsSync(filePath)) {
      return { success: false, error: 'File does not exist' };
    }
    
    const data = await fs.readFile(filePath, 'utf8');
    const importData = JSON.parse(data);
    
    // Validate the imported data structure
    if (!importData.events || typeof importData.events !== 'object') {
      return { success: false, error: 'Invalid calendar file format' };
    }
    
    return { success: true, events: importData.events };
  } catch (error) {
    console.error('Error importing calendar:', error);
    return { success: false, error: error.message };
  }
});

// App event handlers
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Security: prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (navigationEvent, navigationURL) => {
    navigationEvent.preventDefault();
  });
});