import { useState, useEffect, useCallback } from 'react';
import { getAllMovies, createMovie, updateMovie } from '../../../services/movieService';
import Toast from '../../../components/Toast';
import StatusBadge from './components/StatusBadge';
import MovieFormModal from './components/MovieFormModal';

export default function AdminMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editMovie, setEditMovie] = useState(null); // null = add, object = edit

  // No delete dialog state

  // Toast
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', title) => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type, title }]);
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
    try {
      if (editMovie) {
        const updated = await updateMovie(editMovie.id, payload);
        if (updated) {
          setMovies((p) => p.map((m) => (m.id === editMovie.id ? updated : m)));
          addToast(`Đã cập nhật phim "${payload.title}"`, 'success');
        }
      } else {
        const created = await createMovie(payload);
        if (created) {
          setMovies((p) => [created, ...p]);
          addToast(`Đã thêm phim "${payload.title}"`, 'success');
        }
      }
      setFormOpen(false);
      setEditMovie(null);
    } catch (err) {
      console.error('Lỗi khi lưu phim:', err);
      const status = err?.response?.status;
      if (status === 403 || status === 401) {
        addToast('Lỗi 403 (Access Denied): Tài khoản của bạn không có quyền ADMIN trên Backend!', 'error', 'Từ chối truy cập');
      } else {
        addToast(err?.response?.data?.message || 'Có lỗi xảy ra khi lưu phim, vui lòng kiểm tra dữ liệu và thử lại.', 'error');
      }
    }
  };

  const handleToggleStatus = async (movie) => {
    const isStopped = movie.status === 'stopped' || movie.status === 'OFF';
    const targetStatus = isStopped ? 'ON' : 'OFF';
    const payload = {
      title: movie.title,
      description: movie.description,
      duration: movie.duration,
      releaseDate: movie.premiereDate || movie.releaseDate,
      director: movie.director,
      country: movie.country || 'Việt Nam',
      cast: movie.cast,
      posterUrl: movie.posterUrl,
      trailerUrl: movie.trailerUrl,
      status: targetStatus,
      ageRating: movie.ageRating || 'T13',
      rating: movie.rating || 0,
      genre: movie.genre || [],
    };
    
    try {
      const updated = await updateMovie(movie.id, payload);
      if (updated) {
        setMovies((p) => p.map((m) => (m.id === movie.id ? updated : m)));
        addToast(`Đã ${targetStatus === 'ON' ? 'bật hoạt động' : 'dừng chiếu'} phim "${movie.title}"`, 'success');
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái phim:', err);
      const status = err?.response?.status;
      if (status === 403 || status === 401) {
        addToast('Lỗi 403 (Access Denied): Tài khoản hiện tại không có quyền ADMIN!', 'error', 'Từ chối truy cập');
      } else {
        addToast('Cập nhật trạng thái thất bại', 'error');
      }
    }
  };

  const openAdd = () => { setEditMovie(null); setFormOpen(true); };
  const openEdit = (m) => { setEditMovie(m); setFormOpen(true); };

  // Stats
  const nowCount = movies.filter((m) => m.status === 'now-showing').length;
  const soonCount = movies.filter((m) => m.status === 'coming-soon').length;
  const stoppedCount = movies.filter((m) => m.status === 'stopped').length;

  return (
    <>
      <Toast toasts={toasts} onRemove={removeToast} />

      <MovieFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditMovie(null); }}
        onSave={handleSave}
        initial={editMovie}
      />

      {/* Delete dialog removed */}

      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-white font-bold mb-0.5" style={{ fontSize: '20px' }}>
              Danh sách Phim
            </h2>
            <p className="text-zinc-500 text-sm">
              {movies.length} phim • {nowCount} đang chiếu • {soonCount} sắp chiếu • {stoppedCount} dừng chiếu
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
              { value: 'stopped', label: 'Dừng chiếu' },
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
          {!loading && filtered.map((movie) => (
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
                  {(() => {
                    if (!movie.releaseDate) return null;
                    const yearMatch = String(movie.releaseDate).match(/(19|20)\d{2}/);
                    return yearMatch ? ` • ${yearMatch[0]}` : null;
                  })()}
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
              <div className="flex items-center justify-center gap-2.5">
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
                
                {/* Active switch toggle */}
                <button
                  id={`btn-toggle-${movie.id}`}
                  onClick={() => handleToggleStatus(movie)}
                  title={movie.status === 'stopped' ? "Kích hoạt hoạt động" : "Dừng chiếu"}
                  className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                  style={{ backgroundColor: movie.status !== 'stopped' ? '#10b981' : '#3f3f46' }}
                >
                  <span
                    className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    style={{ transform: movie.status !== 'stopped' ? 'translateX(16px)' : 'translateX(0px)' }}
                  />
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
