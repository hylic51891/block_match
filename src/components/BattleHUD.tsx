import { useGameStore } from '@/store/game-store';
import { useUIStore } from '@/store/ui-store';

export function BattleHUD() {
  const levelId = useGameStore((s) => s.levelId);
  const turn = useGameStore((s) => s.turn);
  const shuffleRemaining = useGameStore((s) => s.shuffleRemaining);
  const matchCount = useGameStore((s) => s.matchCount);
  const status = useGameStore((s) => s.status);
  const useShuffleAction = useGameStore((s) => s.useShuffle);
  const resetLevel = useGameStore((s) => s.resetLevel);
  const navigateTo = useUIStore((s) => s.navigateTo);

  const handleShuffle = () => {
    if (shuffleRemaining > 0 && status === 'playing') {
      useShuffleAction();
    }
  };

  const handleQuit = () => {
    resetLevel();
    navigateTo('home');
  };

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
      <span><strong>关卡:</strong> {levelId}</span>
      <span><strong>回合:</strong> {turn}</span>
      <span><strong>消除:</strong> {matchCount}</span>
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
