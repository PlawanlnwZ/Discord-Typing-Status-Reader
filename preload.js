const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    startDetection: (region, intervalMs) => ipcRenderer.send('start-detection', { region, intervalMs }),
    stopDetection: () => ipcRenderer.send('stop-detection'),
    onLog: (callback) => ipcRenderer.on('log', (event, msg) => callback(msg))
});
