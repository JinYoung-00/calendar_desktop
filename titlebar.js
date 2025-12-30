// titlebar.js - 메인 윈도우(index.html)에서 실행됨
const { ipcRenderer } = require('electron');

console.log('[렌더러] titlebar.js 로드됨');

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', () => {
    console.log('[렌더러] DOMContentLoaded 이벤트 발생');
    const titlebar = document.querySelector('.custom-titlebar');

    if (!titlebar) {
        console.error('[렌더러] 타이틀바 요소를 찾을 수 없습니다!');
        return;
    }

    console.log('[렌더러] 타이틀바 요소 찾음:', titlebar);

    // 초기 상태: 타이틀바 표시
    titlebar.style.opacity = '1';
    titlebar.style.pointerEvents = 'auto';

    // 타이틀바 버튼 이벤트
    const minimizeBtn = document.getElementById('minimize-btn');
    const closeBtn = document.getElementById('close-btn');

    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', () => {
            console.log('[렌더러] 최소화 버튼 클릭');
            ipcRenderer.send('window-minimize');
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            console.log('[렌더러] 닫기 버튼 클릭');
            ipcRenderer.send('window-close');
        });
    }

    // 윈도우 포커스 상태에 따라 타이틀바 표시/숨김
    console.log('[렌더러] 포커스 이벤트 리스너 등록 중...');

    ipcRenderer.on('window-focused', () => {
        console.log('[렌더러] window-focused 메시지 받음');
        titlebar.style.opacity = '1';
        titlebar.style.pointerEvents = 'auto';
    });

    ipcRenderer.on('window-blurred', () => {
        console.log('[렌더러] window-blurred 메시지 받음');
        titlebar.style.opacity = '0';
        titlebar.style.pointerEvents = 'none';
    });

    console.log('[렌더러] 포커스 이벤트 리스너 등록 완료');
});