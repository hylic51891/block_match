import type { TelemetryEvent } from './storage/types';

const MAX_BUFFER = 500;
const eventBuffer: TelemetryEvent[] = [];

const isDev = typeof import.meta !== 'undefined' && (import.meta as { env?: { DEV?: boolean } }).env?.DEV;

export const TelemetryEvents = {
  APP_OPEN: 'app_open',
  PLATFORM_INIT: 'platform_init',
  HOME_VIEW: 'home_view',
  TUTORIAL_ENTER: 'tutorial_enter',
  TUTORIAL_COMPLETE: 'tutorial_complete',
  DAILY_CHALLENGE_VIEW: 'daily_challenge_view',
  DAILY_CHALLENGE_ENTER: 'daily_challenge_enter',
  DAILY_CHALLENGE_START: 'daily_challenge_start',
  MATCH_ATTEMPT: 'match_attempt',
  MATCH_SUCCESS: 'match_success',
  MATCH_FAIL: 'match_fail',
  SHUFFLE_USED: 'shuffle_used',
  HINT_USED: 'hint_used',
  REVIVE_OFFER_SHOWN: 'revive_offer_shown',
  REVIVE_USED: 'revive_used',
  DAILY_SUCCESS: 'daily_success',
  DAILY_FAIL: 'daily_fail',
  DAILY_RETRY: 'daily_retry',
  SHARE_CLICK: 'share_click',
  REWARDED_AD_OFFER_SHOWN: 'rewarded_ad_offer_shown',
  REWARDED_AD_COMPLETE: 'rewarded_ad_complete',
  REWARDED_AD_FAIL: 'rewarded_ad_fail',
  STORAGE_LOADED: 'storage_loaded',
  DAILY_BEST_UPDATED: 'daily_best_updated',
  LEVEL_LOADED: 'level_loaded',
  TILE_SELECTED: 'tile_selected',
} as const;

export type TelemetryEventName = typeof TelemetryEvents[keyof typeof TelemetryEvents];

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
