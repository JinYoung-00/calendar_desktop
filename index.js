// index.js - Electron 메인 프로세스
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

// 설치/제거 시 단축아이콘 생성 등 작업을 위한 처리
if (require('electron-squirrel-startup')) {
  app.quit();
}

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
  //mainWindow.webContents.openDevTools()

  // 파일 로드
  mainWindow.loadFile('index.html')

  // 메인 윈도우가 닫히면 정리
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // 포커스 상태에 따라 타이틀바 표시/숨김
  mainWindow.on('focus', () => {
    if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents) {
      mainWindow.webContents.send('window-focused')
    }
  })

  mainWindow.on('blur', () => {
    if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents) {
      mainWindow.webContents.send('window-blurred')
    }
  })
}

// 시작프로그램 설정 함수
function setAutoLaunch(enable) {
  // 개발 모드에서는 작동하지 않음
  if (app.isPackaged) {
    app.setLoginItemSettings({
      openAtLogin: enable,
      openAsHidden: false, // true로 설정하면 최소화 상태로 시작
      path: process.execPath,
      args: []
    })
    return true
  } else {
    console.log('[시작프로그램] 개발 모드에서는 시작프로그램 설정을 사용할 수 없습니다.')
    return false
  }
}

// 현재 시작프로그램 설정 상태 확인
function isAutoLaunchEnabled() {
  if (app.isPackaged) {
    const settings = app.getLoginItemSettings()
    return settings.openAtLogin
  }
  return false
}

// IPC 이벤트 처리 (메인 프로세스에서 수신)
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize()
})

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close()
})

// 시작프로그램 설정 IPC
ipcMain.on('set-auto-launch', (event, enable) => {
  const success = setAutoLaunch(enable)
  event.reply('auto-launch-changed', { success, enabled: isAutoLaunchEnabled() })
})

// 시작프로그램 상태 확인 IPC
ipcMain.on('get-auto-launch-status', (event) => {
  event.reply('auto-launch-status', isAutoLaunchEnabled())
})

app.whenReady().then(() => {
  createWindow()

  // 앱 시작 시 시작프로그램 설정 (선택사항)
  // setAutoLaunch(true)

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