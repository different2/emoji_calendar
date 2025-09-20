const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Event saving and loading
  saveEvents: (events) => ipcRenderer.invoke('save-events', events),
  loadEvents: () => ipcRenderer.invoke('load-events'),
  
  // Menu event listeners
  onNewEvent: (callback) => ipcRenderer.on('new-event', callback),
  onPrevMonth: (callback) => ipcRenderer.on('prev-month', callback),
  onNextMonth: (callback) => ipcRenderer.on('next-month', callback),
  onGoToToday: (callback) => ipcRenderer.on('go-to-today', callback),
  onClearAllData: (callback) => ipcRenderer.on('clear-all-data', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});