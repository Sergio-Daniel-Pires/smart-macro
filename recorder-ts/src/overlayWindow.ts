import { ipcRenderer } from 'electron';

ipcRenderer.on('recording-state-changed', (event, recording) => {
  const statusElement = document.getElementById('overlay');

  if (recording) {
    statusElement.classList.remove('not-recording');
    statusElement.classList.add('recording');
  } else {
    statusElement.classList.remove('recording');
    statusElement.classList.add('not-recording');
  }
});
