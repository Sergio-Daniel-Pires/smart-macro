import { BrowserWindow } from 'electron';

let overlayWindow: BrowserWindow | null;

export function createOverlayWindow() {
    overlayWindow = new BrowserWindow({
        width: 200,
        height: 100,
        frame: false,
        alwaysOnTop: true
    });

    overlayWindow.loadURL('file://' + __dirname + 'static/html/overlay.html'); // Carregar o HTML do overlay

    overlayWindow.on('closed', () => {
        overlayWindow = null;
    });

    return overlayWindow;
}
