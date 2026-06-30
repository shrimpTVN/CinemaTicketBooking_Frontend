import { useState, useEffect, useCallback } from 'react';
import { getAllMovies, createMovie, updateMovie, deleteMovie } from '../../services/movieService';

// ─── Constants ─────────────────────────────────────────────────────────
const GENRES = [
  'Hành Động', 'Hài Hước', 'Tình Cảm', 'Tâm Lý', 'Kinh Dị', 'Gia Đình',
  'Phiêu Lưu', 'Kịch Tính', 'Âm Nhạc', 'Tiểu Sử', 'Lịch Sử', 'Cổ Tích',
];
const AGE_RATINGS = ['P', 'K', 'T13', 'T16', 'T18', 'C'];
const STATUSES = [
  { value: 'now-showing', label: 'Đang chiếu' },
  { value: 'coming-soon', label: 'Sắp chiếu' },
];
const EMPTY_FORM = {
  title: '', description: '', genre: [], duration: '', releaseDate: '',
  director: '', cast: '', posterUrl: '', trailerUrl: '',
  status: 'now-showing', ageRating: 'T13', rating: '',
};

// ─── Toast ─────────────────────────────────────────────────────────────
function Toast({ toasts, onRemove }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium text-white transition-all duration-300 animate-slide-in"
          style={{
            background: t.type === 'success' ? '#16a34a' : t.type === 'error' ? '#CF0F47' : '#1d4ed8',
            minWidth: '260px',
          }}
        >
          {t.type === 'success' && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {t.type === 'error' && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => onRemove(t.id)} className="ml-1 opacity-70 hover:opacity-100 cursor-pointer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Status Badge ───────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const isNow = status === 'now-showing';
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{
        background: isNow ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
        color: isNow ? '#10b981' : '#f59e0b',
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: isNow ? '#10b981' : '#f59e0b' }} />
      {isNow ? 'Đang chiếu' : 'Sắp chiếu'}
    </span>
  );
}

// ─── Genre Chip ─────────────────────────────────────────────────────────
function GenreChip({ label, selected, onClick }) {
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

// ─── Input / Textarea helpers ────────────────────────────────────────────
const inputClass =
  'w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#CF0F47]/60 transition-colors';
const labelClass = 'block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide';

// ─── Movie Form Modal ────────────────────────────────────────────────────
function MovieFormModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setErrors({});
      if (initial) {
        setForm({
          title: initial.title || '',
          description: initial.description || '',
          genre: Array.isArray(initial.genre) ? initial.genre : [],
          duration: initial.duration || '',
          releaseDate: initial.releaseDate || '',
          director: initial.director || '',
          cast: Array.isArray(initial.cast) ? initial.cast.join(', ') : (initial.cast || ''),
          posterUrl: initial.posterUrl || '',
          trailerUrl: initial.trailerUrl || '',
          status: initial.status || 'now-showing',
          ageRating: initial.ageRating || 'T13',
          rating: initial.rating || '',
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [open, initial]);

  const set = (field, val) => setForm((p) => ({ ...p, [field]: val }));

  const toggleGenre = (g) =>
    set('genre', form.genre.includes(g) ? form.genre.filter((x) => x !== g) : [...form.genre, g]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Tên phim không được để trống';
    if (!form.duration || isNaN(Number(form.duration)) || Number(form.duration) <= 0)
      e.duration = 'Thời lượng phải là số dương';
    if (form.genre.length === 0) e.genre = 'Chọn ít nhất 1 thể loại';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const payload = {
      ...form,
      duration: Number(form.duration),
      rating: form.rating !== '' ? Number(form.rating) : 0,
      cast: form.cast.split(',').map((c) => c.trim()).filter(Boolean),
    };
    await onSave(payload);
    setSaving(false);
  };

  if (!open) return null;

  return (
    <div
      id="movie-form-modal"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl"
        style={{ background: '#1a1a1a' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <div>
            <h2 className="text-white font-bold text-base">
              {initial ? 'Chỉnh sửa phim' : 'Thêm phim mới'}
            </h2>
            <p className="text-zinc-500 text-xs mt-0.5">
              {initial ? `ID: ${initial.id}` : 'Điền thông tin bộ phim'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Tên phim */}
          <div>
            <label className={labelClass}>Tên phim *</label>
            <input
              id="field-title"
              type="text"
              className={inputClass}
              placeholder="Nhập tên phim..."
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
            />
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Mô tả */}
          <div>
            <label className={labelClass}>Mô tả</label>
            <textarea
              id="field-description"
              rows={3}
              className={inputClass + ' resize-none'}
              placeholder="Nội dung tóm tắt phim..."
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </div>

          {/* Row: Duration + Release Date + Age Rating */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Thời lượng (phút) *</label>
              <input
                id="field-duration"
                type="number"
                min="1"
                className={inputClass}
                placeholder="120"
                value={form.duration}
                onChange={(e) => set('duration', e.target.value)}
              />
              {errors.duration && <p className="text-red-400 text-xs mt-1">{errors.duration}</p>}
            </div>
            <div>
              <label className={labelClass}>Ngày khởi chiếu</label>
              <input
                id="field-releaseDate"
                type="date"
                className={inputClass}
                value={form.releaseDate}
                onChange={(e) => set('releaseDate', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Giới hạn tuổi</label>
              <select
                id="field-ageRating"
                className={inputClass + ' cursor-pointer'}
                value={form.ageRating}
                onChange={(e) => set('ageRating', e.target.value)}
              >
                {AGE_RATINGS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {/* Row: Director + Rating */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Đạo diễn</label>
              <input
                id="field-director"
                type="text"
                className={inputClass}
                placeholder="Tên đạo diễn..."
                value={form.director}
                onChange={(e) => set('director', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Điểm đánh giá</label>
              <input
                id="field-rating"
                type="number"
                min="0"
                max="10"
                step="0.1"
                className={inputClass}
                placeholder="0.0 – 10.0"
                value={form.rating}
                onChange={(e) => set('rating', e.target.value)}
              />
            </div>
          </div>

          {/* Diễn viên */}
          <div>
            <label className={labelClass}>Diễn viên (cách bởi dấu phẩy)</label>
            <input
              id="field-cast"
              type="text"
              className={inputClass}
              placeholder="Nguyễn A, Trần B, Lê C..."
              value={form.cast}
              onChange={(e) => set('cast', e.target.value)}
            />
          </div>

          {/* Thể loại */}
          <div>
            <label className={labelClass}>Thể loại *</label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((g) => (
                <GenreChip
                  key={g}
                  label={g}
                  selected={form.genre.includes(g)}
                  onClick={() => toggleGenre(g)}
                />
              ))}
            </div>
            {errors.genre && <p className="text-red-400 text-xs mt-1">{errors.genre}</p>}
          </div>

          {/* Row: Status */}
          <div>
            <label className={labelClass}>Trạng thái</label>
            <div className="flex gap-3">
              {STATUSES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => set('status', s.value)}
                  className="flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all cursor-pointer"
                  style={{
                    background: form.status === s.value ? (s.value === 'now-showing' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)') : 'rgba(255,255,255,0.04)',
                    borderColor: form.status === s.value ? (s.value === 'now-showing' ? '#10b981' : '#f59e0b') : 'rgba(255,255,255,0.08)',
                    color: form.status === s.value ? (s.value === 'now-showing' ? '#10b981' : '#f59e0b') : '#8A8A8A',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Poster URL */}
          <div>
            <label className={labelClass}>URL Poster</label>
            <div className="flex gap-2">
              <input
                id="field-posterUrl"
                type="url"
                className={inputClass}
                placeholder="https://..."
                value={form.posterUrl}
                onChange={(e) => set('posterUrl', e.target.value)}
              />
              {form.posterUrl && (
                <img
                  src={form.posterUrl}
                  alt="preview"
                  className="w-10 h-14 object-cover rounded-lg border border-white/10 shrink-0"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
            </div>
          </div>

          {/* Trailer URL */}
          <div>
            <label className={labelClass}>URL Trailer (YouTube embed)</label>
            <input
              id="field-trailerUrl"
              type="url"
              className={inputClass}
              placeholder="https://www.youtube.com/embed/..."
              value={form.trailerUrl}
              onChange={(e) => set('trailerUrl', e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              Hủy
            </button>
            <button
              id="btn-save-movie"
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: saving ? '#8B0B30' : '#CF0F47' }}
            >
              {saving && (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {saving ? 'Đang lưu...' : initial ? 'Cập nhật phim' : 'Thêm phim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm Dialog ───────────────────────────────────────────────
function DeleteConfirmDialog({ open, movie, onClose, onConfirm, loading }) {
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

// ─── Main Page ───────────────────────────────────────────────────────────
export default function AdminMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editMovie, setEditMovie] = useState(null); // null = add, object = edit

  // Delete state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);
  const removeToast = (id) => setToasts((p) => p.filter((t) => t.id !== id));

  // Load movies
  const load = useCallback(async () => {
    setLoading(true);
    const data = await getAllMovies();
    setMovies(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Filtered list
  const filtered = movies.filter((m) => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.director?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || m.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // CRUD handlers
  const handleSave = async (payload) => {
    let ok;
    if (editMovie) {
      const updated = await updateMovie(editMovie.id, payload);
      ok = !!updated;
      if (ok) {
        setMovies((p) => p.map((m) => (m.id === editMovie.id ? { ...m, ...payload } : m)));
        addToast(`Đã cập nhật phim "${payload.title}"`, 'success');
      }
    } else {
      const created = await createMovie(payload);
      ok = !!created;
      if (ok) {
        setMovies((p) => [created, ...p]);
        addToast(`Đã thêm phim "${payload.title}"`, 'success');
      }
    }
    if (!ok) addToast('Có lỗi xảy ra, vui lòng thử lại', 'error');
    setFormOpen(false);
    setEditMovie(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const ok = await deleteMovie(deleteTarget.id);
    setDeleteLoading(false);
    if (ok) {
      setMovies((p) => p.filter((m) => m.id !== deleteTarget.id));
      addToast(`Đã xóa phim "${deleteTarget.title}"`, 'success');
    } else {
      addToast('Xóa phim thất bại', 'error');
    }
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  const openAdd = () => { setEditMovie(null); setFormOpen(true); };
  const openEdit = (m) => { setEditMovie(m); setFormOpen(true); };
  const openDelete = (m) => { setDeleteTarget(m); setDeleteOpen(true); };

  // Stats
  const nowCount = movies.filter((m) => m.status === 'now-showing').length;
  const soonCount = movies.filter((m) => m.status === 'coming-soon').length;

  return (
    <>
      <Toast toasts={toasts} onRemove={removeToast} />

      <MovieFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditMovie(null); }}
        onSave={handleSave}
        initial={editMovie}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        movie={deleteTarget}
        onClose={() => { setDeleteOpen(false); setDeleteTarget(null); }}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />

      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-white font-bold mb-0.5" style={{ fontSize: '20px' }}>
              Danh sách Phim
            </h2>
            <p className="text-zinc-500 text-sm">
              {movies.length} phim • {nowCount} đang chiếu • {soonCount} sắp chiếu
            </p>
          </div>
          <button
            id="btn-add-movie"
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 hover:-translate-y-0.5 duration-150 cursor-pointer shrink-0"
            style={{ background: '#CF0F47' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Thêm phim
          </button>
        </div>

        {/* Filters bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              id="search-movies"
              type="text"
              placeholder="Tìm phim, đạo diễn..."
              className="w-full bg-white/5 border border-white/8 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#CF0F47]/50 transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Status filter */}
          <div className="flex gap-1.5 p-1 rounded-xl border border-white/8" style={{ background: 'rgba(255,255,255,0.03)' }}>
            {[
              { value: 'all', label: 'Tất cả' },
              { value: 'now-showing', label: 'Đang chiếu' },
              { value: 'coming-soon', label: 'Sắp chiếu' },
            ].map((opt) => (
              <button
                key={opt.value}
                id={`filter-${opt.value}`}
                onClick={() => setFilterStatus(opt.value)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                style={{
                  background: filterStatus === opt.value ? '#CF0F47' : 'transparent',
                  color: filterStatus === opt.value ? '#fff' : '#8A8A8A',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: '#1A1A1A' }}>
          {/* Table header */}
          <div
            className="grid items-center text-xs font-semibold text-zinc-500 uppercase tracking-wider px-4 py-3 border-b border-white/5"
            style={{ gridTemplateColumns: '56px 1fr 140px 100px 80px 80px 100px' }}
          >
            <span>Poster</span>
            <span>Thông tin</span>
            <span>Thể loại</span>
            <span>Trạng thái</span>
            <span>Thời lượng</span>
            <span>Đánh giá</span>
            <span className="text-center">Thao tác</span>
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-0">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="grid items-center px-4 py-3 border-b border-white/5"
                  style={{ gridTemplateColumns: '56px 1fr 140px 100px 80px 80px 100px' }}
                >
                  <div className="w-9 h-12 rounded-md bg-white/5 animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-3 rounded bg-white/5 animate-pulse w-2/3" />
                    <div className="h-2.5 rounded bg-white/4 animate-pulse w-1/3" />
                  </div>
                  {[...Array(5)].map((__, j) => (
                    <div key={j} className="h-3 rounded bg-white/5 animate-pulse w-2/3" />
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div className="py-20 text-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-zinc-600">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M7 4v16M17 4v16M2 9h5M17 9h5M2 15h5M17 15h5" />
                </svg>
              </div>
              <p className="text-zinc-400 text-sm font-medium mb-1">Không tìm thấy phim nào</p>
              <p className="text-zinc-600 text-xs">Thử thay đổi từ khóa hoặc bộ lọc</p>
            </div>
          )}

          {/* Rows */}
          {!loading && filtered.map((movie, idx) => (
            <div
              key={movie.id}
              className="grid items-center px-4 py-3 border-b border-white/5 hover:bg-white/3 transition-colors group"
              style={{ gridTemplateColumns: '56px 1fr 140px 100px 80px 80px 100px' }}
            >
              {/* Poster */}
              <div className="w-9 h-12 rounded-md overflow-hidden bg-zinc-800 shrink-0">
                {movie.posterUrl ? (
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-zinc-600">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 pr-3">
                <p className="text-white text-sm font-semibold truncate">{movie.title}</p>
                <p className="text-zinc-500 text-xs truncate mt-0.5">
                  {movie.director || 'N/A'}
                  {movie.releaseDate && ` • ${movie.releaseDate.slice(0, 4)}`}
                </p>
              </div>

              {/* Genre */}
              <div className="flex flex-wrap gap-1 pr-2">
                {(movie.genre || []).slice(0, 2).map((g) => (
                  <span
                    key={g}
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.06)', color: '#8A8A8A' }}
                  >
                    {g}
                  </span>
                ))}
                {(movie.genre || []).length > 2 && (
                  <span className="text-xs text-zinc-600">+{movie.genre.length - 2}</span>
                )}
              </div>

              {/* Status */}
              <div><StatusBadge status={movie.status} /></div>

              {/* Duration */}
              <span className="text-zinc-400 text-xs">{movie.duration ? `${movie.duration} phút` : '--'}</span>

              {/* Rating */}
              <div className="flex items-center gap-1">
                {movie.rating > 0 ? (
                  <>
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" fill="#f59e0b">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="text-xs font-semibold text-zinc-300">{Number(movie.rating).toFixed(1)}</span>
                  </>
                ) : (
                  <span className="text-zinc-600 text-xs">--</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-1">
                <button
                  id={`btn-edit-${movie.id}`}
                  onClick={() => openEdit(movie)}
                  title="Chỉnh sửa"
                  className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/8 transition-all cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  id={`btn-delete-${movie.id}`}
                  onClick={() => openDelete(movie)}
                  title="Xóa"
                  className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-400/8 transition-all cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Result count */}
        {!loading && (
          <p className="text-zinc-600 text-xs mt-3 text-right">
            Hiển thị {filtered.length} / {movies.length} phim
          </p>
        )}
      </div>
    </>
  );
}
