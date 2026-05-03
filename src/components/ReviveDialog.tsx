import { useState } from 'react';
import { getGameService } from '@/services';

interface ReviveDialogProps {
  onConfirm: () => void;
  onDecline: () => void;
}

export function ReviveDialog({ onConfirm, onDecline }: ReviveDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleWatchAd = async () => {
    setLoading(true);
    try {
      const success = await getGameService().rewardAd.showRewardedAd();
      if (success) {
        onConfirm();
      } else {
        onDecline();
      }
    } catch {
      onDecline();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: 32, maxWidth: 320,
        textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}>
        <h2 style={{ color: '#FF9800', margin: '0 0 12px' }}>挑战失败</h2>
        <p style={{ color: '#666', margin: '0 0 24px' }}>看广告可获得一次复活机会，继续挑战！</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={handleWatchAd}
            disabled={loading}
            style={{
              padding: '12px 24px', fontSize: 16, border: 'none', borderRadius: 8,
              background: loading ? '#ccc' : '#FF9800', color: '#fff',
              cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold',
            }}
          >
            {loading ? '加载中...' : '看广告复活'}
          </button>
          <button
            onClick={onDecline}
            disabled={loading}
            style={{
              padding: '8px 16px', fontSize: 14, border: '1px solid #ddd',
              borderRadius: 8, background: '#fff', color: '#999',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            放弃
          </button>
        </div>
      </div>
    </div>
  );
}
