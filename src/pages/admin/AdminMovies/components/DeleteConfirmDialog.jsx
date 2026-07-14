export default function DeleteConfirmDialog({ open, movie, onClose, onConfirm, loading }) {
  if (!open || !movie) return null;
  return (
    <div
      id="delete-confirm-dialog"
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-white/10 p-6 shadow-2xl"
        style={{ background: '#1a1a1a' }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(207,15,71,0.12)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#CF0F47" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </div>
        <h3 className="text-white font-bold text-base text-center mb-2">Xác nhận xóa</h3>
        <p className="text-zinc-400 text-sm text-center mb-1">
          Bạn chắc chắn muốn xóa bộ phim
        </p>
        <p className="text-white font-semibold text-sm text-center mb-6 truncate px-2">
          &ldquo;{movie.title}&rdquo;?
        </p>
        <p className="text-zinc-600 text-xs text-center mb-5">Hành động này không thể hoàn tác.</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            Hủy
          </button>
          <button
            id="btn-confirm-delete"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: '#CF0F47' }}
          >
            {loading && (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {loading ? 'Đang xóa...' : 'Xóa phim'}
          </button>
        </div>
      </div>
    </div>
  );
}
