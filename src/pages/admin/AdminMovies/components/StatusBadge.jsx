export default function StatusBadge({ status }) {
  const s = String(status || '').toLowerCase();

  let label = 'Đang chiếu';
  let bgColor = 'rgba(16,185,129,0.12)';
  let textColor = '#10b981';

  if (s === 'off' || s === 'stopped' || s === 'inactive' || s === '0') {
    label = 'Dừng chiếu';
    bgColor = 'rgba(239,68,68,0.12)';
    textColor = '#ef4444';
  } else if (s === 'coming-soon') {
    label = 'Sắp chiếu';
    bgColor = 'rgba(245,158,11,0.12)';
    textColor = '#f59e0b';
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{
        background: bgColor,
        color: textColor,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: textColor }} />
      {label}
    </span>
  );
}
