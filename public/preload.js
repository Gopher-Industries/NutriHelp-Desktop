const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getVersion: () => ipcRenderer.invoke('get-app-version'),
  
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
  
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  platform: process.platform,
  
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  }
});

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency]);
  }
});