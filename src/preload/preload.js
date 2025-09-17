const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),

  store: {
    get: (key) => ipcRenderer.invoke('store-get', key),
    set: (key, value) => ipcRenderer.invoke('store-set', key, value),
    delete: (key) => ipcRenderer.invoke('store-delete', key)
  },

  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),

  onOpenPreferences: (callback) => {
    ipcRenderer.on('open-preferences', callback);
    return () => ipcRenderer.removeListener('open-preferences', callback);
  },
  onOpenHelp: (callback) => {
    ipcRenderer.on('open-help', callback);
    return () => ipcRenderer.removeListener('open-help', callback);
  },

  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),

  readFile: (filePath) => ipcRenderer.invoke('fs-read-file', filePath),
  writeFile: (filePath, data) => ipcRenderer.invoke('fs-write-file', filePath, data),
  exists: (filePath) => ipcRenderer.invoke('fs-exists', filePath),

  isOnline: () => navigator.onLine,
  onOnline: (callback) => {
    window.addEventListener('online', callback);
    return () => window.removeEventListener('online', callback);
  },
  onOffline: (callback) => {
    window.addEventListener('offline', callback);
    return () => window.removeEventListener('offline', callback);
  },



  writeToClipboard: (text) => ipcRenderer.invoke('clipboard-write-text', text),
  readFromClipboard: () => ipcRenderer.invoke('clipboard-read-text'),

  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update-available', callback);
    return () => ipcRenderer.removeListener('update-available', callback);
  },
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on('update-downloaded', callback);
    return () => ipcRenderer.removeListener('update-downloaded', callback);
  },
  installUpdate: () => ipcRenderer.invoke('install-update'),

  openDevTools: () => ipcRenderer.invoke('open-dev-tools'),
  isDev: () => ipcRenderer.invoke('is-dev')
});

// Always expose necessary environment variables for Supabase
contextBridge.exposeInMainWorld('nodeAPI', {
  process: {
    env: {
      // Expose only necessary environment variables
      REACT_APP_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL || '',
      REACT_APP_SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY || '',
      REACT_APP_USE_MOCK_DATA: process.env.REACT_APP_USE_MOCK_DATA || 'false',
      REACT_APP_ENVIRONMENT: process.env.REACT_APP_ENVIRONMENT || 'development',
      NODE_ENV: process.env.NODE_ENV || 'development',
      // Additional environment variables
      REACT_APP_NAME: process.env.REACT_APP_NAME || '',
      REACT_APP_VERSION: process.env.REACT_APP_VERSION || '',
      REACT_APP_DEV_MODE: process.env.REACT_APP_DEV_MODE || 'false',
      REACT_APP_DEBUG: process.env.REACT_APP_DEBUG || 'false',
      REACT_APP_LOG_LEVEL: process.env.REACT_APP_LOG_LEVEL || 'info'
    },
    platform: process.platform,
    arch: process.arch,
    version: process.version
  }
});

// Debug logging for environment variables
if (process.env.NODE_ENV === 'development') {
  console.log('Preload environment check:');
  console.log('- REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL ? 'Set' : 'Not set');
  console.log('- REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? 'Set' : 'Not set');
  console.log('- REACT_APP_USE_MOCK_DATA:', process.env.REACT_APP_USE_MOCK_DATA);
}

window.addEventListener('DOMContentLoaded', () => {
  delete window.require;
  delete window.exports;
  delete window.module;
  
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = "default-src 'self' 'unsafe-inline' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; object-src 'none';";
  document.head.appendChild(meta);
});

window.addEventListener('error', (event) => {
  console.error('Renderer process error:', event.error);
  ipcRenderer.send('renderer-error', {
    message: event.error.message,
    stack: event.error.stack,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  ipcRenderer.send('renderer-error', {
    message: 'Unhandled promise rejection',
    reason: event.reason
  });
});

if (typeof PerformanceObserver !== 'undefined') {
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      if (entry.entryType === 'navigation') {
        console.log('Navigation timing:', {
          domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
          loadComplete: entry.loadEventEnd - entry.loadEventStart,
          total: entry.loadEventEnd - entry.fetchStart
        });
      }
    });
  });
  
  observer.observe({ entryTypes: ['navigation', 'paint'] });
}

console.log('Preload script loaded successfully');