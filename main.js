const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { exec } = require('child_process')
const fs = require('fs/promises')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    fullscreenable: true,
    // titleBarStyle: 'hidden',        // hide native title bar
    titleBarOverlay: {              // keep Win control buttons (min/max/close)
      color: '#2b2b2b',
      symbolColor: '#ffffff',
      height: 30
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  const isDev = !app.isPackaged;
  if (isDev) {
    win.loadURL('http://localhost:5173')
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'))
  }
}

app.whenReady().then(() => {
  ipcMain.handle('get-usb-drives', async () => {
    if (process.platform !== 'win32') return [];
    
    return new Promise((resolve) => {
      exec('powershell -NoProfile -Command "Get-CimInstance Win32_LogicalDisk | Where-Object DriveType -eq 2 | Select-Object DeviceID, VolumeName | ConvertTo-Json"', (error, stdout) => {
        if (error || !stdout.trim()) return resolve([]);
        
        try {
          let data = JSON.parse(stdout);
          if (!Array.isArray(data)) data = [data]; // If only 1 drive, it returns an object, not array
          const drives = data.map(d => ({ deviceId: d.DeviceID, volumeName: d.VolumeName || '' }));
          resolve(drives);
        } catch (e) {
          console.error("Failed to parse usb drives:", e);
          resolve([]);
        }
      });
    });
  });

  ipcMain.handle('read-dir', async (event, dirPath) => {
    try {
      const items = await fs.readdir(dirPath, { withFileTypes: true });
      return items.map(item => ({
        name: item.name,
        isDirectory: item.isDirectory()
      }));
    } catch (e) {
      console.error('Failed to read dir:', e);
      return [];
    }
  });

  ipcMain.handle('get-printers', async (event) => {
    return await event.sender.getPrintersAsync()
  });

  ipcMain.handle('print-page', async (event, printerName) => {
    return new Promise((resolve) => {
      event.sender.print({
        silent: true,
        printBackground: true,
        deviceName: printerName
      }, (success, errorType) => {
        if (!success) console.error('Print failed:', errorType)
        resolve(success)
      })
    })
  });

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
