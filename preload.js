const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Event saving and loading
  saveEvents: (events) => ipcRenderer.invoke('save-events', events),
  loadEvents: () => ipcRenderer.invoke('load-events'),
  
  // Export/Import functionality
  exportCalendarToFile: (filePath, events) => ipcRenderer.invoke('export-calendar-to-file', filePath, events),
  importCalendarFromFile: (filePath) => ipcRenderer.invoke('import-calendar-from-file', filePath),
  
  // Menu event listeners
  onNewEvent: (callback) => ipcRenderer.on('new-event', callback),
  onPrevMonth: (callback) => ipcRenderer.on('prev-month', callback),
  onNextMonth: (callback) => ipcRenderer.on('next-month', callback),
  onGoToToday: (callback) => ipcRenderer.on('go-to-today', callback),
  onClearAllData: (callback) => ipcRenderer.on('clear-all-data', callback),
  onExportCalendar: (callback) => ipcRenderer.on('export-calendar', (event, filePath) => callback(filePath)),
  onExportCalendarFallback: (callback) => ipcRenderer.on('export-calendar-fallback', callback),
  onExportCalendarDirect: (callback) => ipcRenderer.on('export-calendar-direct', (event, filePath) => callback(filePath)),
  onImportCalendar: (callback) => ipcRenderer.on('import-calendar', (event, filePath) => callback(filePath)),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});