import { useState, useEffect, useMemo, useCallback } from 'react';
import { getAllEvents, createEvent, updateEvent, updateEventStatus } from '../../../services/eventService';
import { uploadEventPoster, uploadEventBanner } from '../../../services/mediaService';
import Toast from '../../../components/Toast';

const isEventActive = (status) => {
  if (!status) return false;
  const s = String(status).toUpperCase();
  return s === 'ACTIVE' || s === 'ON' || s === 'ENABLE' || s === '1' || s === 'TRUE';
};

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', poster: '', banner: '' });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // Phóng to khung soạn thảo mô tả state
  const [isExpandDescOpen, setIsExpandDescOpen] = useState(false);

  // Toast notifications state
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = 'success', title) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // Tải dữ liệu từ Backend API
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load events from Backend:', err);
      addToast('Lỗi khi tải danh sách sự kiện từ máy chủ', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Thống kê số liệu
  const stats = useMemo(() => {
    const total = events.length;
    const active = events.filter(e => isEventActive(e.status)).length;
    const inactive = events.filter(e => !isEventActive(e.status)).length;
    return { total, active, inactive };
  }, [events]);

  // Lọc danh sách sự kiện
  const filteredEvents = useMemo(() => {
    return events.filter(item => {
      const matchSearch = (item.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [events, search, statusFilter]);

  // Mở modal Thêm/Sửa
  const openModal = (eventItem = null) => {
    if (eventItem) {
      setEditingEvent(eventItem);
      setForm({
        title: eventItem.title || '',
        description: eventItem.description || '',
        poster: eventItem.poster || '',
        banner: eventItem.banner || ''
      });
    } else {
      setEditingEvent(null);
      setForm({ title: '', description: '', poster: '', banner: '' });
    }
    setFormErrors({});
    setIsExpandDescOpen(false);
    setModalOpen(true);
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!form.title.trim()) errors.title = 'Tên sự kiện không được để trống';
    if (!form.description.trim()) errors.description = 'Mô tả sự kiện không được để trống';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Tải ảnh Poster (Ảnh dọc / nhỏ)
  const handlePosterUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPoster(true);
    try {
      const url = await uploadEventPoster(file);
      if (url) {
        setForm(prev => ({ ...prev, poster: url }));
        addToast('Tải ảnh Poster thành công!', 'success');
      }
    } catch (err) {
      console.error('Failed to upload poster:', err);
      addToast('Tải ảnh Poster thất bại', 'error');
    } finally {
      setUploadingPoster(false);
    }
  };

  // Tải ảnh Banner (Ảnh ngang rộng)
  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    try {
      const url = await uploadEventBanner(file);
      if (url) {
        setForm(prev => ({ ...prev, banner: url }));
        addToast('Tải ảnh Banner thành công!', 'success');
      }
    } catch (err) {
      console.error('Failed to upload banner:', err);
      addToast('Tải ảnh Banner thất bại', 'error');
    } finally {
      setUploadingBanner(false);
    }
  };

  // Lưu thông tin sự kiện
  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        poster: form.poster || form.banner || '',
        banner: form.banner || form.poster || ''
      };

      if (editingEvent) {
        const updated = await updateEvent(editingEvent.id, payload);
        if (updated) {
          addToast('Cập nhật sự kiện thành công!', 'success');
          setModalOpen(false);
          await loadData();
        } else {
          addToast('Cập nhật thất bại, vui lòng thử lại', 'error');
        }
      } else {
        const created = await createEvent(payload);
        if (created) {
          addToast('Tạo mới sự kiện thành công!', 'success');
          setModalOpen(false);
          await loadData();
        } else {
          addToast('Tạo mới thất bại, vui lòng thử lại', 'error');
        }
      }
    } catch (err) {
      console.error('Failed to save event:', err);
      addToast('Đã xảy ra lỗi khi lưu sự kiện', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Bật/Tắt trạng thái sự kiện
  const handleToggleStatus = async (item) => {
    const isNowActive = isEventActive(item.status);
    const nextStatus = isNowActive ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await updateEventStatus(item.id, nextStatus);
      if (res !== null) {
        setEvents(prev => prev.map(e => e.id === item.id ? { ...e, status: nextStatus } : e));
        addToast(`Đã ${nextStatus === 'ACTIVE' ? 'kích hoạt' : 'tạm ẩn'} sự kiện "#${item.id}"`, 'success');
      } else {
        addToast('Cập nhật trạng thái thất bại', 'error');
      }
    } catch (err) {
      console.error('Failed to toggle event status:', err);
      addToast('Cập nhật trạng thái thất bại', 'error');
    }
  };

  return (
    <div className="p-6 space-y-6 text-left">
      {/* Toast Notifications List */}
      <Toast toasts={toasts} onRemove={removeToast} />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-5">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Quản lý sự kiện</h2>
          <p className="text-zinc-500 text-xs mt-1">Quản lý các chương trình ưu đãi, khuyến mãi và sự kiện đặc biệt trên hệ thống rạp</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-[#E50914] text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl hover:bg-opacity-90 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#E50914]/10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Thêm sự kiện mới
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl border border-white/5 bg-zinc-950/40 relative overflow-hidden flex flex-col justify-center">
          <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Tổng số sự kiện</span>
          <span className="text-3xl font-extrabold text-white mt-2">{loading ? '--' : stats.total}</span>
        </div>

        <div className="p-5 rounded-2xl border border-white/5 bg-zinc-950/40 relative overflow-hidden flex flex-col justify-center">
          <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Đang hoạt động</span>
          <span className="text-3xl font-extrabold text-emerald-400 mt-2">{loading ? '--' : stats.active}</span>
        </div>

        <div className="p-5 rounded-2xl border border-white/5 bg-zinc-950/40 relative overflow-hidden flex flex-col justify-center">
          <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Tạm ẩn</span>
          <span className="text-3xl font-extrabold text-[#E50914] mt-2">{loading ? '--' : stats.inactive}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-5 rounded-2xl border border-white/5 bg-zinc-950/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Tìm kiếm sự kiện..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/8 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-[#E50914] bg-[#1a1a1a]"
          />
          <svg className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-zinc-400 font-medium">Trạng thái:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#1a1a1a] border border-white/8 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E50914]"
          >
            <option value="ALL">Tất cả ({events.length})</option>
            <option value="ACTIVE">Đang hoạt động ({stats.active})</option>
            <option value="INACTIVE">Tạm ẩn ({stats.inactive})</option>
          </select>
        </div>
      </div>

      {/* HTML Table Container */}
      <div className="rounded-2xl border border-white/5 overflow-hidden bg-zinc-950/20 shadow-xl">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-zinc-950/80 text-zinc-400 text-xs font-bold uppercase tracking-wider">
              <th className="py-3.5 px-6 w-20">Mã số</th>
              <th className="py-3.5 px-6 w-32">Hình ảnh</th>
              <th className="py-3.5 px-6 w-1/4">Tên sự kiện</th>
              <th className="py-3.5 px-6">Nội dung mô tả</th>
              <th className="py-3.5 px-6 w-36 text-center">Trạng thái</th>
              <th className="py-3.5 px-6 w-32 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-6"><div className="h-4 bg-white/5 rounded w-10"></div></td>
                  <td className="py-4 px-6"><div className="w-20 h-12 bg-white/5 rounded-lg"></div></td>
                  <td className="py-4 px-6"><div className="h-4 bg-white/5 rounded w-3/4"></div></td>
                  <td className="py-4 px-6"><div className="h-4 bg-white/5 rounded w-full"></div></td>
                  <td className="py-4 px-6 text-center"><div className="h-5 bg-white/5 rounded-full w-20 mx-auto"></div></td>
                  <td className="py-4 px-6 text-center"><div className="h-5 bg-white/5 rounded-full w-16 mx-auto"></div></td>
                </tr>
              ))
            ) : filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-zinc-500">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Không tìm thấy sự kiện nào trong danh sách</p>
                    <button
                      onClick={() => openModal()}
                      className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      + Tạo sự kiện mới
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredEvents.map((item) => (
                <tr key={item.id} className="hover:bg-white/2 transition-colors">
                  <td className="py-4 px-6 font-bold text-zinc-500">#{item.id}</td>
                  <td className="py-4 px-6">
                    <div className="w-20 aspect-[16/10] rounded-lg overflow-hidden bg-zinc-900 border border-white/10 flex items-center justify-center shrink-0">
                      {item.poster || item.banner ? (
                        <img src={item.poster || item.banner} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-zinc-600">No Image</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 font-semibold text-white">
                    <span className="line-clamp-2 leading-relaxed">{item.title}</span>
                  </td>
                  <td className="py-4 px-6 text-xs text-zinc-400 font-light">
                    <span className="line-clamp-2 leading-relaxed">{item.description}</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      isEventActive(item.status) ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                    }`}>
                      {isEventActive(item.status) ? 'Hoạt động' : 'Tạm dừng'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => openModal(item)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                        title="Chỉnh sửa thông tin"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>

                      <button
                        onClick={() => handleToggleStatus(item)}
                        className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                        style={{ backgroundColor: isEventActive(item.status) ? '#10b981' : '#3f3f46' }}
                        title={isEventActive(item.status) ? 'Click để tạm ẩn' : 'Click để kích hoạt'}
                      >
                        <span
                          className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                          style={{ transform: isEventActive(item.status) ? 'translateX(16px)' : 'translateX(0px)' }}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Dialog Thêm / Sửa sự kiện */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl space-y-0 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/5 bg-zinc-900/50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white tracking-wide">
                {editingEvent ? `Chỉnh sửa sự kiện #${editingEvent.id}` : 'Thêm sự kiện mới'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="p-6 space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Tên sự kiện <span className="text-[#E50914]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Chương Trình Khuyến Mãi Hè 2026..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors ${
                    formErrors.title ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-[#E50914]'
                  }`}
                />
                {formErrors.title && <p className="text-[11px] text-red-400 mt-1">{formErrors.title}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Nội dung mô tả <span className="text-[#E50914]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsExpandDescOpen(true)}
                    className="text-[11px] text-cta hover:text-cta-light font-bold flex items-center gap-1 bg-cta/10 border border-cta/30 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                    </svg>
                    Phóng to khung soạn thảo
                  </button>
                </div>
                <textarea
                  rows={5}
                  placeholder="Nhập chi tiết nội dung sự kiện (nhấn Enter để xuống dòng nhiều đoạn...)"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors ${
                    formErrors.description ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-[#E50914]'
                  }`}
                />
                {formErrors.description && <p className="text-[11px] text-red-400 mt-1">{formErrors.description}</p>}
              </div>

              {/* Upload 1: Ảnh Poster (Khung dọc / Thumbnail) */}
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5 space-y-2">
                <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider">
                  1. Ảnh Poster (Ảnh nhỏ / Thumbnail dọc)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Dán link URL ảnh Poster (https://...)"
                    value={form.poster}
                    onChange={(e) => setForm({ ...form, poster: e.target.value })}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#E50914]"
                  />
                  <label className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors">
                    <span>{uploadingPoster ? 'Đang tải...' : 'Tải Poster'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingPoster}
                      onChange={handlePosterUpload}
                    />
                  </label>
                </div>
                {form.poster && (
                  <div className="flex items-center gap-3 pt-1">
                    <img src={form.poster} alt="Poster preview" className="w-12 h-14 object-cover rounded-lg border border-white/10" />
                    <span className="text-[11px] text-emerald-400 font-medium truncate flex-1">✓ Đã chọn ảnh Poster</span>
                  </div>
                )}
              </div>

              {/* Upload 2: Ảnh Banner (Khung ngang rộng) */}
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5 space-y-2">
                <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider">
                  2. Ảnh Banner (Ảnh bìa ngang / Chi tiết)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Dán link URL ảnh Banner (https://...)"
                    value={form.banner}
                    onChange={(e) => setForm({ ...form, banner: e.target.value })}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#E50914]"
                  />
                  <label className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors">
                    <span>{uploadingBanner ? 'Đang tải...' : 'Tải Banner'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingBanner}
                      onChange={handleBannerUpload}
                    />
                  </label>
                </div>
                {form.banner && (
                  <div className="flex items-center gap-3 pt-1">
                    <img src={form.banner} alt="Banner preview" className="w-24 h-12 object-cover rounded-lg border border-white/10" />
                    <span className="text-[11px] text-emerald-400 font-medium truncate flex-1">✓ Đã chọn ảnh Banner</span>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingPoster || uploadingBanner}
                  className="px-5 py-2 rounded-xl bg-[#E50914] hover:bg-opacity-90 text-white text-xs font-bold transition-all shadow-lg shadow-[#E50914]/20 cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : (editingEvent ? 'Lưu thay đổi' : 'Tạo sự kiện')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expanded Full-Screen Description Modal */}
      {isExpandDescOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-4xl bg-zinc-950 border border-white/15 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/10 bg-zinc-900/60 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Phóng to khung soạn thảo mô tả sự kiện</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Dễ dàng nhập, phân đoạn, căn chỉnh dòng và xem trước trực quan thực tế
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsExpandDescOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                ✕ Đóng & Lưu
              </button>
            </div>

            {/* Modal Body - 2 Columns (Editor & Live Preview) */}
            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {/* Left Column: Full-Height Textarea */}
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  <span>Khung soạn thảo văn bản</span>
                  <span className="text-zinc-500 font-normal">{form.description.length} ký tự</span>
                </div>
                <textarea
                  rows={14}
                  placeholder="Nhập chi tiết nội dung sự kiện... (Nhấn Enter để xuống dòng nhiều đoạn)"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full h-full min-h-[320px] p-4 rounded-xl bg-zinc-900 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#E50914] font-mono leading-relaxed resize-none"
                />
              </div>

              {/* Right Column: Real-Time Rendered Preview */}
              <div className="flex flex-col space-y-2">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Khung xem trước hiển thị khán giả
                </div>
                <div className="w-full h-full min-h-[320px] p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 text-sm text-zinc-200 leading-relaxed overflow-y-auto whitespace-pre-line font-normal">
                  {form.description || <span className="text-zinc-600 italic">Nội dung xem trước sẽ xuất hiện tại đây...</span>}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/10 bg-zinc-900/60 flex items-center justify-between shrink-0">
              <span className="text-xs text-zinc-400">
                * Các dấu xuống dòng (Enter) sẽ tự động được giữ nguyên khi hiển thị cho khán giả.
              </span>
              <button
                type="button"
                onClick={() => setIsExpandDescOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#E50914] hover:bg-opacity-90 text-white text-xs font-bold transition-all shadow-lg cursor-pointer"
              >
                Xác nhận & Hoàn tất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
