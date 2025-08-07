import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

if (window.electronAPI) {
  console.log('Electron API is available');
} else {
  console.warn('Electron API is not available - running in browser mode');
}

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);