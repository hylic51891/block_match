import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { telemetry } from '@/infra/telemetry';

const rootEl = document.getElementById('root');
if (rootEl) {
  telemetry.track('app_open', {});
  const root = createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
