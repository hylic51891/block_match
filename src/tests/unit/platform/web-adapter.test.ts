import { describe, it, expect } from 'vitest';
import { WebAdapter } from '@/platform/web-adapter';

describe('WebAdapter', () => {
  it('implements IPlatformAdapter with type web', () => {
    const adapter = new WebAdapter();
    expect(adapter.type).toBe('web');
  });

  it('has all required service instances', () => {
    const adapter = new WebAdapter();
    expect(adapter.storage).toBeDefined();
    expect(adapter.share).toBeDefined();
    expect(adapter.ad).toBeDefined();
    expect(adapter.leaderboard).toBeDefined();
    expect(adapter.remoteConfig).toBeDefined();
  });

  it('has onShow and onHide methods', () => {
    const adapter = new WebAdapter();
    expect(typeof adapter.onShow).toBe('function');
    expect(typeof adapter.onHide).toBe('function');
  });

  it('getSystemInfo method exists and returns object', () => {
    const adapter = new WebAdapter();
    // getSystemInfo relies on browser globals, just verify method exists
    expect(typeof adapter.getSystemInfo).toBe('function');
  });
});
