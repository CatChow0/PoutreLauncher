windows.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    window.ipcRenderer.send('show-context-menu')
})