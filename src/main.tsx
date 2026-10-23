import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker with auto-update
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('[SW] New version available, ready to update.');
  },
  onOfflineReady() {
    console.log('[SW] App is ready for offline browsing with cached jobs and assets.');
  },
});

createRoot(document.getElementById('root')!).render(<App />);

