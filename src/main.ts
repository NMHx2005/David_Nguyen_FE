import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Global chunk loading error handler
window.addEventListener('error', (event) => {
  if (event.error?.name === 'ChunkLoadError' ||
    event.error?.message?.includes('Loading chunk') ||
    event.error?.message?.includes('failed')) {
    console.warn('ChunkLoadError detected, reloading page:', event.error);
    // Show a brief message before reloading
    const message = document.createElement('div');
    message.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #2196F3;
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      z-index: 10000;
      font-family: Arial, sans-serif;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    `;
    message.textContent = 'Application update detected. Reloading...';
    document.body.appendChild(message);

    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }
});

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
