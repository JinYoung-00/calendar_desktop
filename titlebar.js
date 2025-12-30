// titlebar.js - 메인 윈도우(index.html)에서 실행됨
const { ipcRenderer } = require('electron');

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', () => {
    const titlebar = document.querySelector('.custom-titlebar');

    if (!titlebar) {
        return;
    }


    titlebar.style.opacity = '1';
    titlebar.style.pointerEvents = 'auto';

    const minimizeBtn = document.getElementById('minimize-btn');
    const closeBtn = document.getElementById('close-btn');

    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', () => {
            ipcRenderer.send('window-minimize');
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            ipcRenderer.send('window-close');
        });
    }
    ipcRenderer.on('window-focused', () => {
        titlebar.style.opacity = '1';
        titlebar.style.pointerEvents = 'auto';
    });

    ipcRenderer.on('window-blurred', () => {
        titlebar.style.opacity = '0';
        titlebar.style.pointerEvents = 'none';
    });
});