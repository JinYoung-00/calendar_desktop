// main-window.js - 메인 윈도우(index.html)에서 실행됨
const { ipcRenderer } = require('electron');

let titlebarTimeout;
const TITLEBAR_HIDE_DELAY = 2000; // 2초 후 숨김

// 타이틀바 표시
function showTitlebar() {
    ipcRenderer.send('show-titlebar');
    
    // 기존 타이머 제거
    if (titlebarTimeout) {
        clearTimeout(titlebarTimeout);
    }
    
    // 2초 후 숨김
    titlebarTimeout = setTimeout(() => {
        ipcRenderer.send('hide-titlebar');
    }, TITLEBAR_HIDE_DELAY);
}

// 마우스 이동 감지
document.addEventListener('mousemove', (e) => {
    // 상단 50px 영역에 마우스가 있을 때 타이틀바 표시
    if (e.clientY < 50) {
        showTitlebar();
    }
});

// 사용자 활동 감지 (클릭, 키보드 입력 등)
const userActivityEvents = ['click', 'keydown', 'scroll', 'touchstart'];
userActivityEvents.forEach(eventType => {
    document.addEventListener(eventType, showTitlebar);
});

// 초기 로드 시 타이틀바 표시
window.addEventListener('load', () => {
    showTitlebar();
});