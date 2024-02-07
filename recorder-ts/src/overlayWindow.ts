import { ipcRenderer } from 'electron';

ipcRenderer.on('recording-state-changed', (event: any, recording: boolean) => {
  const overlayElement = document.getElementById('overlay');
  const statusText = document.getElementById('status-text');

  if (recording) {
    overlayElement.classList.remove('not-recording');
    overlayElement.classList.add('recording');

    statusText.classList.add("pulse")
    statusText.textContent = "Recording..."
  } else {
    overlayElement.classList.remove('recording');
    overlayElement.classList.add('not-recording');

    statusText.classList.remove("pulse")
    statusText.textContent = "Paused"
  }
});
