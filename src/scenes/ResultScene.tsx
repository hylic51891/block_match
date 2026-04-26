import { useGameStore } from '@/store/game-store';
import { useUIStore } from '@/store/ui-store';

export function ResultScene() {
  const status = useGameStore((s) => s.status);
  const levelId = useGameStore((s) => s.levelId);
  const matchCount = useGameStore((s) => s.matchCount);
  const turn = useGameStore((s) => s.turn);
  const resetLevel = useGameStore((s) => s.resetLevel);
  const startLevel = useGameStore((s) => s.startLevel);
  const navigateTo = useUIStore((s) => s.navigateTo);

  const isWin = status === 'success';

  const handleRetry = () => {
    resetLevel();
    navigateTo('battle');
  };

  const handleHome = () => {
    navigateTo('home');
  };

  const handleNext = () => {
    const num = parseInt(levelId.replace('level-', ''), 10);
    const nextId = `level-${String(num + 1).padStart(3, '0')}`;
    startLevel(nextId);
    navigateTo('battle');
  };

  return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <h1 style={{ color: isWin ? '#4CAF50' : '#F44336', fontSize: 36 }}>
        {isWin ? '恭喜通关!' : '挑战失败'}
      </h1>
      <div style={{ margin: '20px 0', color: '#666' }}>
        <p>关卡: {levelId}</p>
        <p>消除: {matchCount} 对</p>
        <p>回合: {turn}</p>
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
        <button onClick={handleHome} style={btnStyle('#666')}>返回首页</button>
        <button onClick={handleRetry} style={btnStyle('#FF9800')}>重试</button>
        {isWin && <button onClick={handleNext} style={btnStyle('#4CAF50')}>下一关</button>}
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
