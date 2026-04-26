import { loadAllLevels } from '@/core/level/level-loader';
import { useGameStore } from '@/store/game-store';
import { useUIStore } from '@/store/ui-store';
import { LevelCard } from '@/components/LevelCard';

export function HomeScene() {
  const levels = loadAllLevels();
  const startLevel = useGameStore((s) => s.startLevel);
  const navigateTo = useUIStore((s) => s.navigateTo);
  const setSelectedLevelId = useUIStore((s) => s.setSelectedLevelId);

  const handleStartLevel = (levelId: string) => {
    startLevel(levelId);
    setSelectedLevelId(levelId);
    navigateTo('battle');
  };

  return (
    <div style={{ maxWidth: 600, width: '100%', padding: 20 }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>回路连连看</h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: 20 }}>选择关卡开始游戏</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
        {levels.map((level) => (
          <LevelCard key={level.id} levelId={level.id} name={level.name} onClick={() => handleStartLevel(level.id)} />
        ))}
      </div>
    </div>
  );
}
