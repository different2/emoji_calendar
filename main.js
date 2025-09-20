const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
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
    fs.writeFileSync(userDataPath, JSON.stringify(events, null, 2));
    return { success: true };
  } catch (error) {
    console.error('Error saving events:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-events', async () => {
  try {
    if (fs.existsSync(userDataPath)) {
      const data = fs.readFileSync(userDataPath, 'utf8');
      return { success: true, events: JSON.parse(data) };
    }
    return { success: true, events: {} };
  } catch (error) {
    console.error('Error loading events:', error);
    return { success: false, error: error.message, events: {} };
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