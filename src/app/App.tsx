import { useUIStore } from '@/store/ui-store';
import { HomeScene } from '@/scenes/HomeScene';
import { BattleScene } from '@/scenes/BattleScene';
import { ResultScene } from '@/scenes/ResultScene';
import { DebugPanel } from '@/components/DebugPanel';

const isDev = import.meta.env?.DEV ?? false;

export function App() {
  const scene = useUIStore((s) => s.scene);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f0f0', fontFamily: 'sans-serif' }}>
      {scene === 'home' && <HomeScene />}
      {scene === 'battle' && <BattleScene />}
      {scene === 'result' && <ResultScene />}
      {isDev && <DebugPanel />}
    </div>
  );
}
