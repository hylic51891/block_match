import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { telemetry } from '@/infra/telemetry';
import { createPlatform } from '@/platform';
import { createGameService } from '@/services';

const rootEl = document.getElementById('root');
if (rootEl) {
  const platform = createPlatform('web');
  createGameService(platform);

  telemetry.track('platform_init', { type: platform.type });
  telemetry.track('app_open', {});
  const root = createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
