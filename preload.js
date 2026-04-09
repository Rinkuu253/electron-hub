const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // ── Existing APIs ────────────────────────────────────────────────────────
  getUSBDrives: ()           => ipcRenderer.invoke('get-usb-drives'),
  readDir:      (path)       => ipcRenderer.invoke('read-dir', path),
  getPrinters:  ()           => ipcRenderer.invoke('get-printers'),
  printPage:    (printerName)=> ipcRenderer.invoke('print-page', printerName),

  // ── Auth / Login ─────────────────────────────────────────────────────────
  // Called from the login window when credentials are verified
  loginSuccess: (userData)   => ipcRenderer.invoke('login-success', userData),

  // Called in the main window to receive the user data that was passed on login
  getUserData:  ()           => ipcRenderer.invoke('get-user-data'),

  // Listen for the main process to push user data right after window opens
  onUserData: (callback)     => ipcRenderer.on('user-data', (_event, data) => callback(data)),

  // ── Hardware Events ──────────────────────────────────────────────────────
  onHardwareEvent: (callback) => ipcRenderer.on('hardware-event', (_event, eventData) => callback(eventData)),
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
