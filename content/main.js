const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron')
const fs = require('fs')
const path = require('path')
const ws = require('windows-shortcuts')
const extractFileIcon = require('extract-file-icon');

function createWindow () {
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
      enableRemoteModule: true
    }
  })

  win.loadFile('index.html')
  win.setMenuBarVisibility(false)

  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Ajouter un raccourci', 
      click: () => { 
        dialog.showOpenDialog(win, {
          properties: ['openFile'],
          filters: [{ name: 'Exe', extensions: ['exe'] }]
        }).then(result => {
          if (!result.canceled && result.filePaths.length > 0) {
            const exePath = result.filePaths[0]
            const appDataPath = path.join(app.getPath('appData'), 'PoutreLauncher')
            fs.mkdirSync(appDataPath, { recursive: true })
            const shortcutPath = path.join(appDataPath, path.basename(exePath, '.exe') + '.lnk')
            ws.create(shortcutPath, exePath)
            win.webContents.send('shortcut-added', shortcutPath)
          }
        })
      } 
    },
  ])

  win.once('ready-to-show', () => {
    win.webContents.on('context-menu', (e, params) => {
      contextMenu.popup(win, params.x, params.y)
    })
    const appDataPath = path.join(app.getPath('appData'), 'PoutreLauncher')
    const shortcuts = fs.readdirSync(appDataPath).filter(file => path.extname(file) === '.lnk')
    win.webContents.send('shortcuts-loaded', shortcuts)
  })

  ipcMain.on('get-icon', (event, filePath) => {
    const icon = extractFileIcon.sync(filePath, { size: 'large' });
    const iconData = icon.toString('base64');
    event.reply('icon', `data:image/png;base64,${iconData}`);
  });

  const appDataPath = path.join(app.getPath('appData'), 'PoutreLauncher');
  fs.readdir(appDataPath, (err, files) => {
    if (err) {
      console.error(err);
      return;
    }
    files.forEach(file => {
      win.webContents.send('get-icon', path.join(appDataPath, file));
    });
  });
}

app.whenReady().then(createWindow)