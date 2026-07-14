import { useState, useEffect, useMemo } from 'react';
import { getAllMovies } from '../../../services/movieService';
import { getAllHalls } from '../../../services/hallService';
import {
  getAllShowtimes,
  filterShowtimes,
  createShowtime,
  updateShowtime
} from '../../../services/showtimeService';

// Format YYYY-MM-DD to DD/MM/YYYY for UI display
const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};

// Format LocalTime HH:MM:SS to HH:MM
const formatDisplayTime = (timeStr) => {
  if (!timeStr) return '';
  return timeStr.slice(0, 5);
};

export default function AdminShowtimes() {
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);

  // States cho bộ lọc tìm kiếm
  const [filterMovieId, setFilterMovieId] = useState('');
  const [filterHallId, setFilterHallId] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filtering, setFiltering] = useState(false);

  // States cho modal thêm/sửa
  const [modalOpen, setModalOpen] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState(null);
  const [form, setForm] = useState({ movieId: '', hallId: '', date: '', startTime: '', type: '2D Phụ Đề' });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState([]);
  const addToast = (msg, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  // Tải dữ liệu ban đầu
  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [mList, hList, stList] = await Promise.all([
        getAllMovies(),
        getAllHalls(),
        getAllShowtimes()
      ]);
      setMovies(mList);
      setHalls(hList);
      setShowtimes(stList);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      addToast('Lỗi khi tải dữ liệu từ máy chủ', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Xử lý bộ lọc
  const handleApplyFilter = async () => {
    setFiltering(true);
    try {
      const filters = {};
      if (filterMovieId) filters.movieId = filterMovieId;
      if (filterHallId) filters.hallId = filterHallId;
      if (filterDate) filters.date = filterDate;

      // Nếu không chọn bộ lọc nào thì lấy toàn bộ
      if (!filterMovieId && !filterHallId && !filterDate) {
        const list = await getAllShowtimes();
        setShowtimes(list);
      } else {
        const list = await filterShowtimes(filters);
        setShowtimes(list);
      }
      addToast('Đã áp dụng bộ lọc suất chiếu', 'success');
    } catch (err) {
      console.error(err);
      addToast('Áp dụng bộ lọc thất bại', 'error');
    } finally {
      setFiltering(false);
    }
  };

  // Đặt lại bộ lọc
  const handleResetFilter = async () => {
    setFilterMovieId('');
    setFilterHallId('');
    setFilterDate('');
    setFiltering(true);
    try {
      const list = await getAllShowtimes();
      setShowtimes(list);
    } catch (err) {
      console.error(err);
    } finally {
      setFiltering(false);
    }
  };

  // Tính số liệu thống kê
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const total = showtimes.length;
    const todayCount = showtimes.filter((st) => st.date === todayStr).length;
    const activeHalls = halls.filter((h) => h.status !== 'OFF').length;
    return { total, todayCount, activeHalls };
  }, [showtimes, halls]);

  // Mở modal thêm/sửa
  const openModal = (st = null) => {
    if (st) {
      setEditingShowtime(st);
      setForm({
        movieId: st.movieId,
        hallId: st.hallId,
        date: st.date,
        startTime: formatDisplayTime(st.startTime),
        type: st.type || '2D Phụ Đề'
      });
    } else {
      setEditingShowtime(null);
      setForm({
        movieId: movies[0]?.id || '',
        hallId: halls[0]?.id || '',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        type: '2D Phụ Đề'
      });
    }
    setFormErrors({});
    setModalOpen(true);
  };

  // Validate form
  const validateForm = () => {
    const err = {};
    if (!form.movieId) err.movieId = 'Vui lòng chọn bộ phim';
    if (!form.hallId) err.hallId = 'Vui lòng chọn phòng chiếu';
    if (!form.date) err.date = 'Vui lòng chọn ngày chiếu';
    if (!form.startTime) err.startTime = 'Vui lòng chọn giờ chiếu';
    if (!form.type) err.type = 'Vui lòng nhập định dạng suất chiếu';
    setFormErrors(err);
    return Object.keys(err).length === 0;
  };

  // Lưu suất chiếu
  const handleSaveShowtime = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);

    // Đảm bảo định dạng giờ gửi lên backend có dạng HH:MM:SS
    const formattedTime = form.startTime.length === 5 ? `${form.startTime}:00` : form.startTime;

    const payload = {
      movieId: Number(form.movieId),
      hallId: Number(form.hallId),
      date: form.date,
      startTime: formattedTime,
      type: form.type
    };

    try {
      if (editingShowtime) {
        const result = await updateShowtime(editingShowtime.id, payload);
        if (result) {
          // Chuẩn hóa tên phim & tên phòng hiển thị lại UI
          const movieObj = movies.find(m => m.id === Number(form.movieId));
          const hallObj = halls.find(h => h.id === Number(form.hallId));
          
          setShowtimes((prev) =>
            prev.map((item) =>
              item.id === editingShowtime.id
                ? {
                    ...item,
                    ...result,
                    movieName: movieObj ? movieObj.title : item.movieName,
                    hallName: hallObj ? hallObj.name : item.hallName
                  }
                : item
            )
          );
          addToast('Cập nhật suất chiếu thành công', 'success');
          setModalOpen(false);
        } else {
          addToast('Cập nhật suất chiếu thất bại', 'error');
        }
      } else {
        const result = await createShowtime(payload);
        if (result) {
          // Chuẩn hóa thông tin hiển thị
          const movieObj = movies.find(m => m.id === Number(form.movieId));
          const hallObj = halls.find(h => h.id === Number(form.hallId));
          const newShowtime = {
            ...result,
            movieName: movieObj ? movieObj.title : `Phim ID ${result.movieId}`,
            hallName: hallObj ? hallObj.name : `Phòng ID ${result.hallId}`
          };
          setShowtimes((prev) => [newShowtime, ...prev]);
          addToast('Thêm suất chiếu mới thành công', 'success');
          setModalOpen(false);
        } else {
          addToast('Thêm suất chiếu thất bại. Có thể bị trùng lịch chiếu!', 'error');
        }
      }
    } catch (err) {
      console.error(err);
      addToast('Lỗi hệ thống khi lưu suất chiếu', 'error');
    } finally {
      setSaving(false);
    }
  };

  const labelClass = "block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2 text-left";
  const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-white/8 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-all bg-[#1a1a1a]";

  return (
    <div className="p-6 space-y-6 text-left">
      {/* Toast container */}
      <div className="fixed top-6 right-6 z-[9999] space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-xl border text-sm font-medium flex items-center gap-2 shadow-2xl transition-all animate-bounce ${
              t.type === 'error'
                ? 'bg-red-950/90 border-red-500/30 text-red-200'
                : 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200'
            }`}
          >
            {t.type === 'error' ? (
              <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <path d="M22 4L12 14.01l-3-3" />
              </svg>
            )}
            {t.msg}
          </div>
        ))}
      </div>

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-5">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Quản lý suất chiếu</h2>
          <p className="text-zinc-500 text-xs mt-1">Quản lý và lập lịch các suất chiếu phim cho từng phòng chiếu</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-[#E50914] text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl hover:bg-opacity-90 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#E50914]/10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Thêm suất chiếu
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl border border-white/5 bg-zinc-950/40 relative overflow-hidden flex flex-col justify-center">
          <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Tổng số suất chiếu</span>
          <span className="text-3xl font-extrabold text-white mt-2">{loading ? '--' : stats.total}</span>
        </div>

        <div className="p-5 rounded-2xl border border-white/5 bg-zinc-950/40 relative overflow-hidden flex flex-col justify-center">
          <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Suất chiếu hôm nay</span>
          <span className="text-3xl font-extrabold text-[#E50914] mt-2">{loading ? '--' : stats.todayCount}</span>
        </div>

        <div className="p-5 rounded-2xl border border-white/5 bg-zinc-950/40 relative overflow-hidden flex flex-col justify-center">
          <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Phòng chiếu khả dụng</span>
          <span className="text-3xl font-extrabold text-indigo-400 mt-2">{loading ? '--' : stats.activeHalls}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-5 rounded-2xl border border-white/5 bg-zinc-950/20 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
        <div>
          <label className={labelClass}>Lọc theo Phim</label>
          <select
            className={inputClass}
            value={filterMovieId}
            onChange={(e) => setFilterMovieId(e.target.value)}
          >
            <option value="">-- Tất cả phim --</option>
            {movies.map((m) => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Lọc theo Phòng</label>
          <select
            className={inputClass}
            value={filterHallId}
            onChange={(e) => setFilterHallId(e.target.value)}
          >
            <option value="">-- Tất cả phòng --</option>
            {halls.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Lọc theo Ngày</label>
          <input
            type="date"
            className={inputClass}
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleApplyFilter}
            disabled={filtering}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider py-2.5 rounded-xl cursor-pointer transition-all disabled:opacity-50"
          >
            {filtering ? 'Đang lọc...' : 'Tìm kiếm'}
          </button>
          <button
            onClick={handleResetFilter}
            className="px-4 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-wider py-2.5 rounded-xl cursor-pointer transition-all"
          >
            Đặt lại
          </button>
        </div>
      </div>

      {/* List Table */}
      <div className="rounded-2xl border border-white/5 overflow-hidden bg-zinc-950/20">
        <div
          className="grid items-center px-6 py-3.5 border-b border-white/5 bg-zinc-950/80 text-zinc-400 text-xs font-bold uppercase tracking-wider"
          style={{ gridTemplateColumns: '80px 1.5fr 1fr 1fr 1fr 1fr 100px' }}
        >
          <span>Mã số</span>
          <span>Tên phim</span>
          <span>Phòng chiếu</span>
          <span>Ngày chiếu</span>
          <span>Giờ chiếu</span>
          <span>Định dạng</span>
          <span className="text-center">Hành động</span>
        </div>

        {loading ? (
          <div className="divide-y divide-white/5">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="grid items-center px-6 py-4.5"
                style={{ gridTemplateColumns: '80px 1.5fr 1fr 1fr 1fr 1fr 100px' }}
              >
                <div className="h-4 rounded bg-white/5 animate-pulse w-2/3" />
                <div className="h-4 rounded bg-white/5 animate-pulse w-3/4" />
                <div className="h-4 rounded bg-white/5 animate-pulse w-1/2" />
                <div className="h-4 rounded bg-white/5 animate-pulse w-2/3" />
                <div className="h-4 rounded bg-white/5 animate-pulse w-1/3" />
                <div className="h-4 rounded bg-white/5 animate-pulse w-1/2" />
                <div className="h-4 rounded bg-white/5 animate-pulse w-1/2 mx-auto" />
              </div>
            ))}
          </div>
        ) : showtimes.length === 0 ? (
          <div className="py-20 text-center text-zinc-500">
            <svg className="w-10 h-10 mx-auto text-zinc-700 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-medium">Không tìm thấy suất chiếu nào khớp với điều kiện lọc</p>
          </div>
        ) : (
          showtimes.map((st) => (
            <div
              key={st.id}
              className="grid items-center px-6 py-3.5 border-b border-white/5 hover:bg-white/2 transition-all text-sm text-zinc-300"
              style={{ gridTemplateColumns: '80px 1.5fr 1fr 1fr 1fr 1fr 100px' }}
            >
              <span className="font-bold text-zinc-500">#{st.id}</span>
              <span className="font-semibold text-white truncate pr-2" title={st.movieName}>{st.movieName}</span>
              <span>
                <span className="px-2 py-0.5 rounded bg-white/5 text-xs font-bold text-indigo-400">
                  {st.hallName}
                </span>
              </span>
              <span className="text-zinc-400 font-medium">{formatDisplayDate(st.date)}</span>
              <span className="text-white font-black font-mono text-xs">{formatDisplayTime(st.startTime)}</span>
              <span className="text-zinc-400 text-xs font-semibold">{st.type}</span>
              <div className="flex items-center justify-center">
                <button
                  onClick={() => openModal(st)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                  title="Chỉnh sửa suất chiếu"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL: THÊM / SỬA SUẤT CHIẾU */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-8 px-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden bg-zinc-950">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-zinc-950">
              <h3 className="text-white font-bold text-base">{editingShowtime ? 'Chỉnh sửa suất chiếu' : 'Tạo suất chiếu mới'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveShowtime} className="p-6 space-y-4">
              <div>
                <label className={labelClass}>Chọn Bộ Phim *</label>
                <select
                  className={inputClass}
                  style={{ background: '#1a1a1a', color: '#fff' }}
                  value={form.movieId}
                  onChange={(e) => setForm({ ...form, movieId: e.target.value })}
                >
                  {movies.map((m) => (
                    <option key={m.id} value={m.id} style={{ background: '#1a1a1a' }}>{m.title}</option>
                  ))}
                </select>
                {formErrors.movieId && <p className="text-red-400 text-xs mt-1 text-left">{formErrors.movieId}</p>}
              </div>

              <div>
                <label className={labelClass}>Chọn Phòng Chiếu *</label>
                <select
                  className={inputClass}
                  style={{ background: '#1a1a1a', color: '#fff' }}
                  value={form.hallId}
                  onChange={(e) => setForm({ ...form, hallId: e.target.value })}
                >
                  {halls.map((h) => (
                    <option key={h.id} value={h.id} style={{ background: '#1a1a1a' }} disabled={h.status === 'OFF'}>
                      {h.name} {h.status === 'OFF' ? '(Tạm dừng)' : ''}
                    </option>
                  ))}
                </select>
                {formErrors.hallId && <p className="text-red-400 text-xs mt-1 text-left">{formErrors.hallId}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Ngày chiếu *</label>
                  <input
                    type="date"
                    className={inputClass}
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                  {formErrors.date && <p className="text-red-400 text-xs mt-1 text-left">{formErrors.date}</p>}
                </div>
                <div>
                  <label className={labelClass}>Giờ chiếu *</label>
                  <input
                    type="time"
                    className={inputClass}
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  />
                  {formErrors.startTime && <p className="text-red-400 text-xs mt-1 text-left">{formErrors.startTime}</p>}
                </div>
              </div>

              <div>
                <label className={labelClass}>Định dạng / Loại suất chiếu *</label>
                <select
                  className={inputClass}
                  style={{ background: '#1a1a1a', color: '#fff' }}
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="2D Phụ Đề" style={{ background: '#1a1a1a' }}>2D Phụ Đề</option>
                  <option value="2D Lồng Tiếng" style={{ background: '#1a1a1a' }}>2D Lồng Tiếng</option>
                  <option value="3D Phụ Đề" style={{ background: '#1a1a1a' }}>3D Phụ Đề</option>
                  <option value="3D Lồng Tiếng" style={{ background: '#1a1a1a' }}>3D Lồng Tiếng</option>
                  <option value="IMAX Phụ Đề" style={{ background: '#1a1a1a' }}>IMAX Phụ Đề</option>
                  <option value="IMAX Lồng Tiếng" style={{ background: '#1a1a1a' }}>IMAX Lồng Tiếng</option>
                </select>
                {formErrors.type && <p className="text-red-400 text-xs mt-1 text-left">{formErrors.type}</p>}
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#E50914] text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl hover:bg-opacity-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {saving && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {editingShowtime ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
