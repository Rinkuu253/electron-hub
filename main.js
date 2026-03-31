const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { exec } = require('child_process')
const fs = require('fs/promises')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')
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
