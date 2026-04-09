const { app, BrowserWindow, ipcMain, Menu, globalShortcut } = require('electron')
const path = require('path')
const { exec } = require('child_process')
const fs = require('fs/promises')
const { monitorSerialPorts, startTcpListeners } = require('./hardware-listener')

const isDev = !app.isPackaged

// ── Shared state ──────────────────────────────────────────────────────────────
let loggedInUser = null   // holds user data after successful login
let mainWin      = null
let loginWin     = null

// ─────────────────────────────────────────────────────────────────────────────
//  LOGIN WINDOW  (600 × 800, fixed, not fullscreenable, not resizable)
// ─────────────────────────────────────────────────────────────────────────────
const createLoginWindow = () => {
  loginWin = new BrowserWindow({
    width:           600,
    height:          800,
    resizable:       false,
    fullscreenable:  false,
    maximizable:     false,
    center:          true,
    frame:           true,
    title:           'Sign In — Electron Hub',
    webPreferences: {
      preload:        path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration:  false,
    },
  })

  if (isDev) {
    loginWin.loadURL('http://localhost:5173/login.html')
  } else {
    loginWin.loadFile(path.join(__dirname, 'dist', 'login.html'))
  }

  loginWin.on('closed', () => { loginWin = null })
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN WINDOW  (fullscreenable, resizable, gets user data injected)
// ─────────────────────────────────────────────────────────────────────────────
const createMainWindow = () => {
  mainWin = new BrowserWindow({
    width:           1200,
    height:          750,
    minWidth:        800,
    minHeight:       500,
    fullscreenable:  true,
    center:          true,
    show:            false,   // wait until ready-to-show to avoid flash
    title:           'Electron Hub',
    titleBarOverlay: {
      color:       '#0a0a12',
      symbolColor: '#ffffff',
      height:      30,
    },
    webPreferences: {
      preload:          path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration:  false,
    },
  })

  if (isDev) {
    mainWin.loadURL('http://localhost:5173')
  } else {
    mainWin.loadFile(path.join(__dirname, 'dist', 'index.html'))
  }

  // Push user data to renderer as soon as the page finishes loading
  mainWin.webContents.on('did-finish-load', () => {
    if (loggedInUser) {
      mainWin.webContents.send('user-data', loggedInUser)
    }
    mainWin.show()
  })

  mainWin.on('closed', () => { mainWin = null })

  createMenu(mainWin)
}

// ─────────────────────────────────────────────────────────────────────────────
//  APP MENU  (only attached to main window)
// ─────────────────────────────────────────────────────────────────────────────
const createMenu = (win) => {
  const template = [
    {
      label: 'File',
      submenu: [
        { type: 'separator' },
        {
          label:       'Print',
          accelerator: 'CmdOrCtrl+P',
          click: () => win.webContents.send('trigger-print'),
        },
        { type: 'separator' },
        { role: 'quit', label: 'Exit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' }, { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' }, { role: 'copy' }, { role: 'paste' },
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' }, { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' },
        { type: 'separator' },
        {
          role:  'togglefullscreen',
          click: () => win.setFullScreen(!win.isFullScreen()),
        },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        {
          label: 'Toggle Fullscreen',
          accelerator: 'F11',
          click: () => win.setFullScreen(!win.isFullScreen()),
        },
        { role: 'close' },
      ],
    },
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

// ─────────────────────────────────────────────────────────────────────────────
//  APP LIFECYCLE
// ─────────────────────────────────────────────────────────────────────────────
app.whenReady().then(() => {

  // ── IPC: USB drives ────────────────────────────────────────────────────────
  ipcMain.handle('get-usb-drives', async () => {
    if (process.platform !== 'win32') return []
    return new Promise((resolve) => {
      exec(
        'powershell -NoProfile -Command "Get-CimInstance Win32_LogicalDisk | Where-Object DriveType -eq 2 | Select-Object DeviceID, VolumeName | ConvertTo-Json"',
        (error, stdout) => {
          if (error || !stdout.trim()) return resolve([])
          try {
            let data = JSON.parse(stdout)
            if (!Array.isArray(data)) data = [data]
            resolve(data.map(d => ({ deviceId: d.DeviceID, volumeName: d.VolumeName || '' })))
          } catch (e) {
            console.error('Failed to parse usb drives:', e)
            resolve([])
          }
        }
      )
    })
  })

  // ── IPC: Read directory ────────────────────────────────────────────────────
  ipcMain.handle('read-dir', async (_event, dirPath) => {
    try {
      const items = await fs.readdir(dirPath, { withFileTypes: true })
      return items.map(item => ({ name: item.name, isDirectory: item.isDirectory() }))
    } catch (e) {
      console.error('Failed to read dir:', e)
      return []
    }
  })

  // ── IPC: Printers ──────────────────────────────────────────────────────────
  ipcMain.handle('get-printers', async (event) => {
    return await event.sender.getPrintersAsync()
  })

  // ── IPC: Print ─────────────────────────────────────────────────────────────
  ipcMain.handle('print-page', async (event, printerName) => {
    return new Promise((resolve) => {
      event.sender.print(
        { silent: true, printBackground: true, deviceName: printerName },
        (success, errorType) => {
          if (!success) console.error('Print failed:', errorType)
          resolve(success)
        }
      )
    })
  })

  // ── IPC: Login success ─────────────────────────────────────────────────────
  // Renderer (login window) calls this when credentials pass
  ipcMain.handle('login-success', async (_event, userData) => {
    console.log('[main] Login success:', userData)
    loggedInUser = userData          // persist for the main window

    // 1. Open the main window (it will receive user data on did-finish-load)
    createMainWindow()

    // 2. Close the login window after a short delay so the user sees the transition
    setTimeout(() => {
      if (loginWin && !loginWin.isDestroyed()) {
        loginWin.close()
      }
    }, 300)

    return { ok: true }
  })

  // ── IPC: Get user data (pull model) ───────────────────────────────────────
  ipcMain.handle('get-user-data', () => loggedInUser)

  // ── Start Hardware Listeners ──────────────────────────────────────────────
  const handleHardwareEvent = (type, detail) => {
    console.log(`[Main] Hardware Event: ${type} - ${detail}`)
    const targetWin = mainWin || loginWin
    if (targetWin && !targetWin.isDestroyed()) {
      targetWin.webContents.send('hardware-event', { type, detail })
    }
  }

  monitorSerialPorts(handleHardwareEvent)
  startTcpListeners([5000, 5001, 8080], handleHardwareEvent)

  // ── Start with the login window ────────────────────────────────────────────
  createLoginWindow()

  // ── Global shortcuts ───────────────────────────────────────────────────────
  globalShortcut.register('CommandOrControl+Shift+H', () => {
    const target = mainWin || loginWin
    if (!target) return
    if (target.isVisible()) { target.hide() }
    else { target.show(); target.focus() }
  })

  app.on('will-quit', () => globalShortcut.unregisterAll())

  app.on('activate', () => {
    // macOS: re-open login if nothing is open
    if (BrowserWindow.getAllWindows().length === 0) {
      createLoginWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
