export default function GenreChip({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer"
      style={{
        background: selected ? 'rgba(207,15,71,0.15)' : 'rgba(255,255,255,0.04)',
        borderColor: selected ? '#CF0F47' : 'rgba(255,255,255,0.08)',
        color: selected ? '#f87171' : '#8A8A8A',
      }}
    >
      {label}
    </button>
  );
}
