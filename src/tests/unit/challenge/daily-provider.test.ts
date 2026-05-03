import { describe, it, expect } from 'vitest';
import { getDailyChallengeConfig, getTodayDate } from '@/core/challenge/daily-provider';

describe('DailyChallengeProvider', () => {
  it('same date returns same config', () => {
    const a = getDailyChallengeConfig('2025-06-15');
    const b = getDailyChallengeConfig('2025-06-15');
    expect(a.id).toBe(b.id);
    expect(a.width).toBe(b.width);
    expect(a.height).toBe(b.height);
    expect(a.tileTypes).toEqual(b.tileTypes);
    expect(a.specialTypes).toEqual(b.specialTypes);
    expect(a.pollution).toEqual(b.pollution);
  });

  it('different dates return different configs', () => {
    const a = getDailyChallengeConfig('2025-06-15');
    const b = getDailyChallengeConfig('2025-06-16');
    // At least the id should differ
    expect(a.id).not.toBe(b.id);
  });

  it('config has valid structure', () => {
    const config = getDailyChallengeConfig('2025-06-15');
    expect(config.width).toBeGreaterThanOrEqual(8);
    expect(config.height).toBeGreaterThanOrEqual(8);
    expect(config.tileTypes.length).toBeGreaterThanOrEqual(5);
    expect(config.specialTypes).toContain('S');
    expect(config.specialTypes).toContain('T');
    expect(config.pollution.enabled).toBe(true);
    expect(config.shuffleLimit).toBe(1);
    expect(config.fillBoard).toBe(true);
  });

  it('getTodayDate returns YYYY-MM-DD format', () => {
    const date = getTodayDate();
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
