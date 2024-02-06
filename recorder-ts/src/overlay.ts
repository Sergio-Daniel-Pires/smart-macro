import { BrowserWindow } from 'electron';
import * as path from "path";

let overlayWindow: BrowserWindow | null;

export function createOverlayWindow() {
    overlayWindow = new BrowserWindow({
        transparent: true,
        fullscreen: true,
        frame: false,
        alwaysOnTop: true,
        resizable: false,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    overlayWindow.loadFile(path.join(__dirname, "../overlay.html"));

    // Change window into ghost
    overlayWindow.setIgnoreMouseEvents(true);
    overlayWindow.setFocusable(false);

    overlayWindow.on('closed', () => {
        overlayWindow = null;
    });

    return overlayWindow;
}
