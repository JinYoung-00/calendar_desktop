const { app, BrowserWindow } = require('electron')
const path = require('path')

const createWindow = () => {
  // 1. 새로운 브라우저 창( BrowserWindow)을 생성합니다.
  const mainWindow = new BrowserWindow({
    width: 1500,
    height: 900,
    resizable: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
     contextIsolation: true
    }
  })

  // 2. 생성된 창에 원하는 HTML 파일을 로드합니다.
  // 로컬 파일을 로드할 때는 loadFile()을 사용합니다.
  mainWindow.loadFile('index.html') 

  // 개발 시 유용: 개발자 도구를 엽니다.
  mainWindow.webContents.openDevTools()
}

// 3. Electron 앱이 준비되었을 때(ready 이벤트) 창을 생성합니다.
app.whenReady().then(() => {
  createWindow()

  // macOS에서는 애플리케이션이 활성화되었을 때(독 아이콘 클릭 등) 
  // 열린 창이 없으면 새 창을 다시 만드는 것이 일반적입니다.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// 4. 모든 창이 닫히면 앱을 종료합니다.
// macOS는 사용자가 Command + Q로 명시적으로 종료할 때까지 
// 애플리케이션이 활성 상태로 유지되는 것이 일반적입니다.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})