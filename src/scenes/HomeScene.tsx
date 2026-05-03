import { useGameStore } from '@/store/game-store';
import { useUIStore } from '@/store/ui-store';
import { useChallengeStore } from '@/store/challenge-store';
import { getTodayDate } from '@/core/challenge/daily-provider';
import { telemetry } from '@/infra/telemetry';
import { useEffect } from 'react';

export function HomeScene() {
  const startChallenge = useGameStore((s) => s.startChallenge);
  const navigateTo = useUIStore((s) => s.navigateTo);
  const setCurrentMode = useUIStore((s) => s.setCurrentMode);

  const tutorialCompleted = useChallengeStore((s) => s.tutorialCompleted);
  const loadProgress = useChallengeStore((s) => s.loadProgress);
  const getTodayBest = useChallengeStore((s) => s.getTodayBest);

  useEffect(() => {
    loadProgress();
    telemetry.track('home_view', {});
  }, []);

  const todayBest = getTodayBest();
  const today = getTodayDate();

  const handleMainAction = () => {
    if (!tutorialCompleted) {
      setCurrentMode('tutorial');
      startChallenge('tutorial');
      navigateTo('battle');
    } else {
      setCurrentMode('daily_challenge');
      startChallenge('daily_challenge', today);
      telemetry.track('daily_challenge_enter', { date: today });
      navigateTo('battle');
    }
  };

  const handleReplayTutorial = () => {
    setCurrentMode('tutorial');
    startChallenge('tutorial');
    navigateTo('battle');
  };

  return (
    <div style={{ maxWidth: 600, width: '100%', padding: 20 }}>
      <h1 style={{ textAlign: 'center', color: '#333', fontSize: 28 }}>回路连连看</h1>
      <p style={{ textAlign: 'center', color: '#888', marginBottom: 8, fontSize: 14 }}>挑战制版本</p>

      {/* Main action button */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <button
          onClick={handleMainAction}
          style={{
            padding: '16px 48px',
            fontSize: 20,
            border: 'none',
            borderRadius: 12,
            background: tutorialCompleted ? '#4ECDC4' : '#FF9800',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {!tutorialCompleted ? '开始教学' : '今日挑战'}
        </button>
      </div>

      {/* Today's date */}
      <div style={{ textAlign: 'center', color: '#999', fontSize: 13, marginBottom: 16 }}>
        {today}
      </div>

      {/* Best record */}
      {tutorialCompleted && (
        <div style={{
          textAlign: 'center',
          padding: 16,
          background: '#fff',
          borderRadius: 8,
          boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
          marginBottom: 16,
        }}>
          <div style={{ color: '#666', fontSize: 14, marginBottom: 8 }}>今日最佳</div>
          {todayBest ? (
            <div>
              <div style={{ color: todayBest.success ? '#4CAF50' : '#F44336', fontWeight: 'bold', fontSize: 16 }}>
                {todayBest.success ? '通关' : '未通关'}
              </div>
              <div style={{ color: '#999', fontSize: 13, marginTop: 4 }}>
                用时 {Math.round(todayBest.durationMs / 1000)}s | 重排 {todayBest.shuffleUsed} 次
              </div>
            </div>
          ) : (
            <div style={{ color: '#999', fontSize: 14 }}>尚未挑战</div>
          )}
        </div>
      )}

      {/* Tutorial replay */}
      {tutorialCompleted && (
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <button
            onClick={handleReplayTutorial}
            style={{
              padding: '8px 20px',
              fontSize: 13,
              border: '1px solid #ddd',
              borderRadius: 8,
              background: '#fff',
              color: '#666',
              cursor: 'pointer',
            }}
          >
            重新教学
          </button>
        </div>
      )}
    </div>
  );
}
