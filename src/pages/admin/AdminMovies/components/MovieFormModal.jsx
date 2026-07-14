import { useState, useEffect } from 'react';
import GenreChip from './GenreChip';

const GENRES = [
  'Hành động', 'Phiêu lưu', 'Hài hước', 'Kinh dị', 'Lãng mạng', 'Giả tưởng',
  'Tâm lý', 'Hoạt hình', 'Gia đình', 'Giật gân', 'Kỳ ảo', 'Nhạc kịch',
  'Lịch sử', 'Chiến tranh', 'Bí ẩn', 'Tội phạm', 'Tiểu sử', 'Tài liệu'
];
const AGE_RATINGS = ['P', 'K', 'T13', 'T16', 'T18', 'C'];
const STATUSES = [
  { value: 'now-showing', label: 'Đang chiếu' },
  { value: 'coming-soon', label: 'Sắp chiếu' },
];
const formatToInputDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  } catch (e) {
    console.warn("Failed to parse date for input:", dateStr, e);
  }
  return '';
};

const EMPTY_FORM = {
  title: '', description: '', genre: [], duration: '', releaseDate: '',
  director: '', country: 'Việt Nam', cast: '', posterUrl: '', trailerUrl: '',
  status: 'ON', ageRating: 'T13', rating: '',
};

const inputClass =
  'w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#CF0F47]/60 transition-colors';
const labelClass = 'block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide';

export default function MovieFormModal({ open, onClose, onSave, initial }) {
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
          releaseDate: formatToInputDate(initial.premiereDate || initial.releaseDate),
          director: initial.director || '',
          country: initial.country || 'Việt Nam',
          cast: Array.isArray(initial.cast) ? initial.cast.join(', ') : (initial.cast || ''),
          posterUrl: initial.posterUrl || '',
          trailerUrl: initial.trailerUrl || '',
          status: (initial.status === 'stopped' || initial.status === 'OFF') ? 'OFF' : 'ON',
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
    if (!form.country.trim()) e.country = 'Quốc gia không được để trống';
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
                style={{ backgroundColor: '#1a1a1a', color: 'white' }}
                value={form.ageRating}
                onChange={(e) => set('ageRating', e.target.value)}
              >
                {AGE_RATINGS.map((r) => (
                  <option key={r} value={r} style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row: Director + Country + Rating */}
          <div className="grid grid-cols-3 gap-3">
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
              <label className={labelClass}>Quốc gia *</label>
              <input
                id="field-country"
                type="text"
                className={inputClass}
                placeholder="Việt Nam, Mỹ..."
                value={form.country}
                onChange={(e) => set('country', e.target.value)}
              />
              {errors.country && <p className="text-red-400 text-xs mt-1">{errors.country}</p>}
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

          {/* Row: Status Active Toggle */}
          <div>
            <label className={labelClass}>Trạng thái hoạt động</label>
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-white/8" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div>
                <p className="text-white text-sm font-medium">Bật / Tắt hoạt động của phim</p>
                <p className="text-zinc-500 text-xs mt-0.5">
                  {form.status === 'OFF' ? 'Phim đang tạm dừng chiếu (Ẩn khỏi danh sách hiển thị)' : 'Phim hoạt động (Đang chiếu / Sắp chiếu dựa theo ngày khởi chiếu)'}
                </p>
              </div>
              <button
                id="toggle-status"
                type="button"
                onClick={() => set('status', form.status === 'OFF' ? 'ON' : 'OFF')}
                className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                style={{ backgroundColor: form.status !== 'OFF' ? '#10b981' : '#3f3f46' }}
              >
                <span
                  className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                  style={{ transform: form.status !== 'OFF' ? 'translateX(20px)' : 'translateX(0px)' }}
                />
              </button>
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
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 hover:-translate-y-0.5 duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
