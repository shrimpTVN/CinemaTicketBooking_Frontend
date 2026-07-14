export default function StatusBadge({ status }) {
  let label = 'Sắp chiếu';
  let bgColor = 'rgba(245,158,11,0.12)';
  let textColor = '#f59e0b';

  if (status === 'now-showing') {
    label = 'Đang chiếu';
    bgColor = 'rgba(16,185,129,0.12)';
    textColor = '#10b981';
  } else if (status === 'stopped') {
    label = 'Dừng chiếu';
    bgColor = 'rgba(239,68,68,0.12)';
    textColor = '#ef4444';
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
