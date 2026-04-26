import type { TelemetryEvent } from './storage/types';

const MAX_BUFFER = 500;
const eventBuffer: TelemetryEvent[] = [];

const isDev = typeof import.meta !== 'undefined' && (import.meta as { env?: { DEV?: boolean } }).env?.DEV;

export const telemetry = {
  track(event: string, payload?: Record<string, unknown>) {
    const e: TelemetryEvent = { event, timestamp: Date.now(), payload };
    eventBuffer.push(e);
    if (eventBuffer.length > MAX_BUFFER) eventBuffer.shift();
    if (isDev) console.log('[TELEMETRY]', e.event, e.payload ?? '');
  },

  getRecent(n: number = 50): TelemetryEvent[] {
    return eventBuffer.slice(-n);
  },

  exportAll(): TelemetryEvent[] {
    return [...eventBuffer];
  },
};
