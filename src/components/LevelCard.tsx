type LevelCardProps = {
  levelId: string;
  name: string;
  onClick: () => void;
};

export function LevelCard({ levelId, name, onClick }: LevelCardProps) {
  const num = parseInt(levelId.replace('level-', ''), 10);

  return (
    <button
      onClick={onClick}
      style={{
        padding: '16px 8px',
        border: '2px solid #e0e0e0',
        borderRadius: 8,
        background: '#fff',
        cursor: 'pointer',
        textAlign: 'center',
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4ECDC4'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e0e0e0'; }}
    >
      <div style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>{num}</div>
      <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{name}</div>
    </button>
  );
}
