const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('fsElectron', {
  ping: async () => await ipcRenderer.invoke('app:ping')
});
