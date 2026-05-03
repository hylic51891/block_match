import { useState } from 'react';
import { useGameStore } from '@/store/game-store';
import { useUIStore } from '@/store/ui-store';
import { useChallengeStore } from '@/store/challenge-store';
import { countPollution, clearAllPollution } from '@/core/systems/pollution-system';
import { isDeadlocked } from '@/core/systems/deadlock-detector';
import { getPlatform } from '@/platform';
import { telemetry } from '@/infra/telemetry';

export function DebugPanel() {
  const [open, setOpen] = useState(false);
  const [showTelemetry, setShowTelemetry] = useState(false);
  const toggleDebug = useUIStore((s) => s.toggleDebug);

  const state = useGameStore();
  const { board, turn, selectedTileId, shuffleRemaining, status, levelId, mode, challengeDate, reviveState, reviveUsed, matchCount, hintRemaining, timeLimit } = state;
  const pollutionCount = countPollution(board);
  const deadlocked = isDeadlocked(board);

  const todayBest = useChallengeStore((s) => s.getTodayBest());
  const platformType = getPlatform().type;

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

  const handleClearProgress = () => {
    const storage = getPlatform().storage;
    storage.setLocalProgress({ tutorialCompleted: false, settings: { audioEnabled: true } });
    useChallengeStore.setState({ tutorialCompleted: false, dailyBest: {} });
    console.log('[Debug] Progress cleared');
  };

  const handleViewTelemetry = () => {
    setShowTelemetry(!showTelemetry);
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
      background: '#fff', fontSize: 12, zIndex: 9999, minWidth: 220,
      maxHeight: '70vh', overflow: 'auto',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <strong>Debug Panel</strong>
        <button onClick={() => { setOpen(false); toggleDebug(); }} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>X</button>
      </div>
      <div style={{ lineHeight: 1.8 }}>
        <div>Level: {levelId}</div>
        <div>Status: {status}</div>
        <div>Mode: {mode}</div>
        <div>Date: {challengeDate ?? '-'}</div>
        <div>Turn: {turn}</div>
        <div>Match: {matchCount}</div>
        <div>Selected: {selectedTileId ?? 'none'}</div>
        <div>Shuffle: {shuffleRemaining}</div>
        <div>Hint: {hintRemaining}</div>
        <div>Pollution: {pollutionCount}</div>
        <div>Deadlocked: {deadlocked ? 'YES' : 'no'}</div>
        <div>TimeLimit: {timeLimit > 0 ? `${timeLimit}s` : 'none'}</div>
        <div>Revive: {reviveState} (used: {reviveUsed})</div>
        <div>Platform: {platformType}</div>
        <div>TodayBest: {todayBest ? `${todayBest.success ? 'win' : 'fail'} ${Math.round(todayBest.durationMs / 1000)}s` : 'none'}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
        <button onClick={handleForceShuffle} style={debugBtnStyle}>Force Shuffle</button>
        <button onClick={handleClearPollution} style={debugBtnStyle}>Clear Pollution</button>
        <button onClick={handlePrintBoard} style={debugBtnStyle}>Export Board</button>
        <button onClick={handleClearProgress} style={debugBtnStyle}>Clear Progress</button>
        <button onClick={handleViewTelemetry} style={debugBtnStyle}>{showTelemetry ? 'Hide' : 'View'} Telemetry</button>
      </div>
      {showTelemetry && (
        <div style={{ marginTop: 8, maxHeight: 150, overflow: 'auto', background: '#f5f5f5', padding: 6, borderRadius: 4, fontSize: 10, fontFamily: 'monospace' }}>
          {telemetry.getRecent(20).reverse().map((e, i) => (
            <div key={i} style={{ borderBottom: '1px solid #ddd', padding: '2px 0' }}>
              <span style={{ color: '#666' }}>{new Date(e.timestamp).toLocaleTimeString()}</span>{' '}
              <strong>{e.event}</strong>
              {e.payload && <span style={{ color: '#999' }}> {JSON.stringify(e.payload)}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const debugBtnStyle: React.CSSProperties = { padding: '4px 8px', fontSize: 11, border: '1px solid #ccc', borderRadius: 4, background: '#f5f5f5', cursor: 'pointer' };
