import { useGameStore } from '@/store/game-store';
import { useUIStore } from '@/store/ui-store';
import { useChallengeStore } from '@/store/challenge-store';
import { MockShareService } from '@/infra/share/mock-share';
import { telemetry } from '@/infra/telemetry';
import type { BattleResult } from '@/types/challenge';

export function ResultScene() {
  const status = useGameStore((s) => s.status);
  const mode = useGameStore((s) => s.mode);
  const challengeDate = useGameStore((s) => s.challengeDate);
  const matchCount = useGameStore((s) => s.matchCount);
  const turn = useGameStore((s) => s.turn);
  const levelStartTime = useGameStore((s) => s.levelStartTime);
  const shuffleRemaining = useGameStore((s) => s.shuffleRemaining);
  const hintRemaining = useGameStore((s) => s.hintRemaining);
  const failReason = useGameStore((s) => s.failReason);
  const _config = useGameStore((s) => s._config);
  const resetLevel = useGameStore((s) => s.resetLevel);
  const navigateTo = useUIStore((s) => s.navigateTo);

  const todayBest = useChallengeStore((s) => s.getTodayBest());

  const isWin = status === 'success';
  const durationMs = Date.now() - levelStartTime;
  const durationSec = Math.round(durationMs / 1000);
  const shuffleUsed = (_config?.shuffleLimit ?? 0) - shuffleRemaining;
  const hintUsed = (_config?.hintLimit ?? 0) - hintRemaining;

  const handleRetry = () => {
    resetLevel();
    navigateTo('battle');
    telemetry.track('daily_retry', { mode, date: challengeDate });
  };

  const handleHome = () => {
    navigateTo('home');
  };

  const handleShare = () => {
    const result: BattleResult = {
      mode,
      success: isWin,
      durationMs,
      shuffleUsed,
      reviveUsed: 0,
      hintUsed,
      challengeDate,
    };
    new MockShareService().shareResult(result);
    telemetry.track('result_share_click', { mode, success: isWin });
  };

  const failReasonText: Record<string, string> = {
    deadlock: '无路可走',
    pollution_blocked: '污染封路',
    no_shuffle: '重排用尽',
    timeout: '时间耗尽',
    manual: '手动退出',
    unknown: '未知原因',
  };

  return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <h1 style={{ color: isWin ? '#4CAF50' : '#F44336', fontSize: 36 }}>
        {isWin ? '恭喜通关!' : '挑战失败'}
      </h1>

      <div style={{ margin: '20px 0', color: '#666' }}>
        <p>{mode === 'tutorial' ? '教学关' : `今日挑战 ${challengeDate ?? ''}`}</p>
        <p>消除: {matchCount} 对</p>
        <p>回合: {turn}</p>
        <p>用时: {durationSec}s</p>
        <p>重排: {shuffleUsed} 次</p>

        {!isWin && failReason && (
          <p style={{ color: '#F44336', marginTop: 8 }}>
            失败原因: {failReasonText[failReason] ?? failReason}
          </p>
        )}

        {/* Best record comparison for daily challenge */}
        {mode === 'daily_challenge' && isWin && todayBest && todayBest.success && (
          <div style={{
            marginTop: 12,
            padding: 12,
            background: '#E8F5E9',
            borderRadius: 8,
            color: '#2E7D32',
          }}>
            {durationMs < todayBest.durationMs ? '刷新最佳!' : `今日最佳: ${Math.round(todayBest.durationMs / 1000)}s`}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
        <button onClick={handleHome} style={btnStyle('#666')}>返回首页</button>
        <button onClick={handleShare} style={btnStyle('#2196F3')}>分享</button>
        <button onClick={handleRetry} style={btnStyle(isWin ? '#4CAF50' : '#FF9800')}>
          {isWin ? '再来一局' : '重试'}
        </button>
      </div>
    </div>
  );
}

function btnStyle(color: string): React.CSSProperties {
  return {
    padding: '10px 24px',
    fontSize: 16,
    border: 'none',
    borderRadius: 8,
    background: color,
    color: '#fff',
    cursor: 'pointer',
  };
}
