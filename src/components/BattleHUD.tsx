import { useGameStore } from '@/store/game-store';
import { useUIStore } from '@/store/ui-store';

interface BattleHUDProps {
  remainingSeconds?: number;
}

export function BattleHUD({ remainingSeconds }: BattleHUDProps) {
  const mode = useGameStore((s) => s.mode);
  const challengeDate = useGameStore((s) => s.challengeDate);
  const turn = useGameStore((s) => s.turn);
  const shuffleRemaining = useGameStore((s) => s.shuffleRemaining);
  const hintRemaining = useGameStore((s) => s.hintRemaining);
  const matchCount = useGameStore((s) => s.matchCount);
  const status = useGameStore((s) => s.status);
  const useShuffleAction = useGameStore((s) => s.useShuffle);
  const useHintAction = useGameStore((s) => s.useHint);
  const navigateTo = useUIStore((s) => s.navigateTo);

  const handleShuffle = () => {
    if (shuffleRemaining > 0 && status === 'playing') {
      useShuffleAction();
    }
  };

  const handleHint = () => {
    if (hintRemaining > 0 && status === 'playing') {
      useHintAction();
    }
  };

  const handleQuit = () => {
    navigateTo('home');
  };

  const modeLabel = mode === 'tutorial' ? '教学关' : `挑战 ${challengeDate ?? ''}`;

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${String(sec).padStart(2, '0')}`;
  };

  const isUrgent = remainingSeconds !== undefined && remainingSeconds <= 30;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '8px 16px',
      background: '#fff',
      borderRadius: 8,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      fontSize: 14,
    }}>
      <span><strong>{modeLabel}</strong></span>
      {remainingSeconds !== undefined && (
        <span style={{ color: isUrgent ? '#F44336' : '#333', fontWeight: isUrgent ? 'bold' : 'normal' }}>
          {formatTime(remainingSeconds)}
        </span>
      )}
      <span>回合: {turn}</span>
      <span>消除: {matchCount}</span>
      <button
        onClick={handleHint}
        disabled={hintRemaining <= 0 || status !== 'playing'}
        style={{
          padding: '4px 12px',
          border: 'none',
          borderRadius: 4,
          background: hintRemaining > 0 ? '#00BCD4' : '#ccc',
          color: '#fff',
          cursor: hintRemaining > 0 ? 'pointer' : 'not-allowed',
          fontSize: 13,
        }}
      >
        提示 ({hintRemaining})
      </button>
      <button
        onClick={handleShuffle}
        disabled={shuffleRemaining <= 0 || status !== 'playing'}
        style={{
          padding: '4px 12px',
          border: 'none',
          borderRadius: 4,
          background: shuffleRemaining > 0 ? '#FF9800' : '#ccc',
          color: '#fff',
          cursor: shuffleRemaining > 0 ? 'pointer' : 'not-allowed',
          fontSize: 13,
        }}
      >
        重排 ({shuffleRemaining})
      </button>
      <button
        onClick={handleQuit}
        style={{
          padding: '4px 12px',
          border: 'none',
          borderRadius: 4,
          background: '#666',
          color: '#fff',
          cursor: 'pointer',
          fontSize: 13,
        }}
      >
        退出
      </button>
    </div>
  );
}
