const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
  ipcRenderer.on('icon', (event, iconDataUrl) => {
    const img = document.createElement('img');
    img.src = iconDataUrl;
    document.getElementById('shortcuts').appendChild(img);
  });
});