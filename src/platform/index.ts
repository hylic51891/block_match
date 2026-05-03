import type { IPlatformAdapter, PlatformType } from './types';
import { WebAdapter } from './web-adapter';

let currentPlatform: IPlatformAdapter | null = null;

export function createPlatform(type: PlatformType = 'web'): IPlatformAdapter {
  if (currentPlatform) return currentPlatform;

  if (type === 'wechat_minigame') {
    // Dynamic import for WeChat adapter to avoid bundling wx stubs in web build
    // When targeting WeChat Mini Game, use: const { WeChatMiniGameAdapter } = await import('./wechat-adapter');
    // For now, fall back to WebAdapter since we're in a web context
    console.warn('[Platform] WeChat adapter requested but not available in web build, using WebAdapter');
    currentPlatform = new WebAdapter();
  } else {
    currentPlatform = new WebAdapter();
  }

  return currentPlatform;
}

export function getPlatform(): IPlatformAdapter {
  if (!currentPlatform) {
    currentPlatform = new WebAdapter();
  }
  return currentPlatform;
}

export function resetPlatform(): void {
  currentPlatform = null;
}

export type { IPlatformAdapter, PlatformType } from './types';
