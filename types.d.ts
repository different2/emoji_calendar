// types.d.ts - TypeScript declarations for Electron API
declare global {
  interface Window {
    electronAPI?: {
      // Event saving and loading
      saveEvents: (events: any) => Promise<{ success: boolean; error?: string }>;
      loadEvents: () => Promise<{ success: boolean; events?: any; error?: string }>;
      
      // Export/Import functionality
      exportCalendarToFile: (filePath: string, events: any) => Promise<{ success: boolean; error?: string; filePath?: string }>;
      importCalendarFromFile: (filePath: string) => Promise<{ success: boolean; events?: any; error?: string }>;
      
      // Menu event listeners
      onNewEvent: (callback: () => void) => void;
      onPrevMonth: (callback: () => void) => void;
      onNextMonth: (callback: () => void) => void;
      onGoToToday: (callback: () => void) => void;
      onClearAllData: (callback: () => void) => void;
      onExportCalendar: (callback: (filePath: string) => void) => void;
      onExportCalendarFallback: (callback: () => void) => void;
      onExportCalendarDirect: (callback: (filePath: string) => void) => void;
      onImportCalendar: (callback: (filePath: string) => void) => void;
      
      // Remove listeners
      removeAllListeners: (channel: string) => void;
    };
  }
}

export {};