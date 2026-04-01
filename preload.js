const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  getUSBDrives: () => ipcRenderer.invoke('get-usb-drives'),
  readDir: (path) => ipcRenderer.invoke('read-dir', path),
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  printPage: (printerName) => ipcRenderer.invoke('print-page', printerName)
})

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency])
  }
})
