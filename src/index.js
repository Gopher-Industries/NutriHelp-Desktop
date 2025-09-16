import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

window.addEventListener('error', (event) => {
  if (event.filename && (
    event.filename.includes('content_scripts') || 
    event.filename.includes('extension://') ||
    event.filename.includes('chrome-extension://') ||
    event.filename.includes('umd.min.js')
  )) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Suppressed external content script error:', event.error?.message);
    }
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const stack = event.reason?.stack || '';
  const message = event.reason?.message || '';
  if (stack.includes('content_scripts') || 
      stack.includes('extension://') ||
      stack.includes('chrome-extension://') ||
      stack.includes('umd.min.js') ||
      message.includes('content_scripts') ||
      message.includes('trim')) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Suppressed external content script promise rejection:', event.reason?.message);
    }
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
});

const originalConsoleError = console.error;
console.error = function(...args) {
  const message = args.join(' ');
  if (message.includes('content_scripts') || 
      message.includes('extension://') ||
      message.includes('chrome-extension://') ||
      message.includes('umd.min.js') ||
      message.includes('Cannot read properties of null')) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Suppressed content script console error:', message);
    }
    return;
  }
  originalConsoleError.apply(console, args);
};

if (process.env.NODE_ENV === 'development') {
  if (window.electronAPI) {
    console.log('Electron API is available');
  } else {
    console.warn('Electron API is not available - running in browser mode');
  }
}

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);