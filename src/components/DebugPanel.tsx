import { useState } from 'react';
import { useGameStore } from '@/store/game-store';
import { useUIStore } from '@/store/ui-store';
import { countPollution, clearAllPollution } from '@/core/systems/pollution-system';
import { isDeadlocked } from '@/core/systems/deadlock-detector';

export function DebugPanel() {
  const [open, setOpen] = useState(false);
  const toggleDebug = useUIStore((s) => s.toggleDebug);

  const state = useGameStore();
  const { board, turn, selectedTileId, shuffleRemaining, status, levelId } = state;
  const pollutionCount = countPollution(board);
  const deadlocked = isDeadlocked(board);

  const handleForceShuffle = () => {
    useGameStore.getState().useShuffle();
  };

  const handleClearPollution = () => {
    const currentBoard = useGameStore.getState().board;
    const newBoard = clearAllPollution(currentBoard);
    useGameStore.setState({ board: newBoard });
  };

  const handlePrintBoard = () => {
    console.log('Board state:', JSON.stringify(board, null, 2));
  };

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); toggleDebug(); }}
        style={{
          position: 'fixed', bottom: 8, right: 8,
          padding: '4px 8px', fontSize: 12, border: '1px solid #999',
          borderRadius: 4, background: '#fff', cursor: 'pointer', zIndex: 9999,
        }}
      >
        Debug
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed', bottom: 8, right: 8,
      padding: 12, border: '1px solid #999', borderRadius: 8,
      background: '#fff', fontSize: 12, zIndex: 9999, minWidth: 200,
      maxHeight: '50vh', overflow: 'auto',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <strong>Debug Panel</strong>
        <button onClick={() => { setOpen(false); toggleDebug(); }} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>X</button>
      </div>
      <div style={{ lineHeight: 1.8 }}>
        <div>Level: {levelId}</div>
        <div>Status: {status}</div>
        <div>Turn: {turn}</div>
        <div>Selected: {selectedTileId ?? 'none'}</div>
        <div>Shuffle: {shuffleRemaining}</div>
        <div>Pollution: {pollutionCount}</div>
        <div>Deadlocked: {deadlocked ? 'YES' : 'no'}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
        <button onClick={handleForceShuffle} style={debugBtnStyle}>Force Shuffle</button>
        <button onClick={handleClearPollution} style={debugBtnStyle}>Clear Pollution</button>
        <button onClick={handlePrintBoard} style={debugBtnStyle}>Print Board</button>
      </div>
    </div>
  );
}

const debugBtnStyle: React.CSSProperties = { padding: '4px 8px', fontSize: 11, border: '1px solid #ccc', borderRadius: 4, background: '#f5f5f5', cursor: 'pointer' };
