// index.js - Electron 메인 프로세스
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

let mainWindow;

const createWindow = () => {
  // 메인 윈도우 (캘린더) - index.html 로드
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 900,
    frame: false,
    resizable: true,
    icon: path.join(__dirname, 'icon/calendar_icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // 파일 로드
  mainWindow.loadFile('index.html')

  // 메인 윈도우가 닫히면 정리
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // 포커스 상태에 따라 타이틀바 표시/숨김
  mainWindow.on('focus', () => {
    console.log('[메인 프로세스] 윈도우 포커스 받음')
    if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents) {
      mainWindow.webContents.send('window-focused')
      console.log('[메인 프로세스] window-focused 메시지 전송')
    }
  })

  mainWindow.on('blur', () => {
    console.log('[메인 프로세스] 윈도우 포커스 잃음')
    if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents) {
      mainWindow.webContents.send('window-blurred')
      console.log('[메인 프로세스] window-blurred 메시지 전송')
    }
  })

  //mainWindow.webContents.openDevTools()
}

// IPC 이벤트 처리 (메인 프로세스에서 수신)
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize()
})

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close()
})

app.whenReady().then(() => {
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