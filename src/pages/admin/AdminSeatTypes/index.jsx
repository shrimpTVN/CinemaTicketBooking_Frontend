import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Plus, Edit2, CheckCircle, XCircle, Sofa, X } from 'lucide-react';
import apiClient from '../../../services/apiClient';
import Toast from '../../../components/Toast';

function AdminCard({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-white/5 ${className}`} style={{ background: '#1A1A1A' }}>
      {children}
    </div>
  );
}

const isSeatTypeActive = (status) => {
  if (!status) return false;
  const s = String(status).toUpperCase();
  return s === 'ACTIVE' || s === 'ON' || s === 'ENABLE' || s === '1' || s === 'TRUE';
};

function StatusBadge({ status }) {
  const active = isSeatTypeActive(status);
  return active
    ? <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/20"><CheckCircle className="w-3 h-3" />Hoạt động</span>
    : <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded border bg-rose-500/10 text-rose-400 border-rose-500/20"><XCircle className="w-3 h-3" />Ngừng</span>;
}

const EMPTY_FORM = { name: '', priceSurcharge: '', description: '', image: '', status: 'ON' };

export default function AdminSeatTypes() {
  const [seatTypes, setSeatTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', title) => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type, title }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);
  const removeToast = (id) => setToasts((p) => p.filter((t) => t.id !== id));

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/seat-types');
        const data = Array.isArray(res) ? res : (res?.data || []);
        setSeatTypes(data);
      } catch (err) {
        console.warn('AdminSeatTypes fetch error:', err);
        setSeatTypes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return seatTypes.filter(s => !q || (s.name || '').toLowerCase().includes(q));
  }, [seatTypes, searchQuery]);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (s) => {
    setEditing(s);
    setForm({
      name: s.name || '',
      priceSurcharge: s.priceSurcharge || '',
      description: s.description || '',
      image: s.image || '',
      status: isSeatTypeActive(s.status) ? 'ON' : 'OFF',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = {
      name: form.name,
      priceSurcharge: parseFloat(form.priceSurcharge) || 0,
      description: form.description,
      image: form.image,
      status: form.status,
    };
    try {
      if (editing) {
        const res = await apiClient.patch(`/seat-types/${editing.id}`, payload);
        const updated = res?.data || res || { ...editing, ...payload };
        setSeatTypes(prev => prev.map(s => s.id === editing.id ? updated : s));
        addToast(`Đã cập nhật loại ghế "${payload.name}"`, 'success');
      } else {
        const res = await apiClient.post('/seat-types', payload);
        const created = res?.data || res;
        setSeatTypes(prev => [...prev, created]);
        addToast(`Đã thêm loại ghế "${payload.name}"`, 'success');
      }
      setShowModal(false);
    } catch (err) {
      console.error('AdminSeatTypes save error:', err);
      const status = err?.response?.status;
      if (status === 403 || status === 401) {
        addToast('Lỗi 403 (Access Denied): Tài khoản hiện tại không có quyền ADMIN!', 'error', 'Từ chối truy cập');
      } else {
        addToast('Không thể lưu loại ghế. Vui lòng thử lại.', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const SEAT_ICONS = {
    'Standard': '💺',
    'VIP': '⭐',
    'Couple': '💑',
    'IMAX': '🎬',
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      <Toast toasts={toasts} onRemove={removeToast} />

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Tổng loại ghế', value: seatTypes.length, color: '#CF0F47', bg: 'rgba(207,15,71,0.1)' },
          { label: 'Đang hoạt động', value: seatTypes.filter(s => isSeatTypeActive(s.status)).length, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Ngừng sử dụng', value: seatTypes.filter(s => !isSeatTypeActive(s.status)).length, color: '#F43F5E', bg: 'rgba(244,63,94,0.1)' },
          { label: 'Phụ thu cao nhất', value: seatTypes.length ? `${Math.max(...seatTypes.map(s => Number(s.priceSurcharge || 0))).toLocaleString('vi-VN')} đ` : '--', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
        ].map(k => (
          <AdminCard key={k.label} className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: k.bg, color: k.color }}>
              <Sofa className="w-4 h-4" />
            </div>
            <div>
              <p className="text-zinc-400 text-[11px]">{k.label}</p>
              <p className="text-white font-bold text-lg">{loading ? '--' : k.value}</p>
            </div>
          </AdminCard>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Tìm loại ghế..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-sm text-white pl-10 pr-4 py-2 rounded-xl focus:outline-none"
            style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer"
          style={{ background: '#CF0F47' }}
        >
          <Plus className="w-4 h-4" /> Thêm loại ghế
        </button>
      </div>

      {/* Table */}
      <AdminCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead style={{ background: '#111111' }}>
              <tr className="text-xs uppercase text-zinc-500 font-bold border-b border-white/5">
                <th className="px-6 py-3.5">Loại ghế</th>
                <th className="px-6 py-3.5">Mô tả</th>
                <th className="px-6 py-3.5">Phụ thu</th>
                <th className="px-6 py-3.5">Trạng thái</th>
                <th className="px-6 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-6 py-4"><div className="h-3 bg-white/5 rounded w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-zinc-500 text-sm">
                    Không tìm thấy loại ghế nào.
                  </td>
                </tr>
              ) : (
                filtered.map(s => (
                  <tr key={s.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* Icon/Image */}
                        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                          style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
                          {s.image ? (
                            <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl">{SEAT_ICONS[s.name] || '💺'}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">{s.name}</p>
                          <p className="text-zinc-500 text-[11px]">ID: {s.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-zinc-400 text-xs line-clamp-2">{s.description || '—'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-sm" style={{ color: '#CF0F47' }}>
                        +{Number(s.priceSurcharge || 0).toLocaleString('vi-VN')} đ
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openEdit(s)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white border border-white/8 cursor-pointer hover:bg-white/5 transition-colors"
                        style={{ background: '#111' }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-2xl border border-white/8 max-w-md w-full shadow-2xl overflow-y-auto max-h-[90vh]" style={{ background: '#1A1A1A' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h3 className="text-white font-bold text-base">{editing ? 'Chỉnh sửa loại ghế' : 'Thêm loại ghế mới'}</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white cursor-pointer p-1.5 rounded-lg hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">Tên loại ghế *</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full text-sm text-white rounded-xl px-3 py-2.5 focus:outline-none"
                  style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}
                  placeholder="VD: Standard, VIP, Couple..."
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">Phụ thu (VNĐ)</label>
                <input
                  type="number"
                  min="0"
                  value={form.priceSurcharge}
                  onChange={e => setForm({ ...form, priceSurcharge: e.target.value })}
                  className="w-full text-sm text-white rounded-xl px-3 py-2.5 focus:outline-none"
                  style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}
                  placeholder="VD: 30000"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">Mô tả</label>
                <textarea
                  rows="2"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full text-sm text-white rounded-xl px-3 py-2.5 focus:outline-none resize-none"
                  style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}
                  placeholder="Mô tả loại ghế..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">Link hình ảnh</label>
                <input
                  value={form.image}
                  onChange={e => setForm({ ...form, image: e.target.value })}
                  className="w-full text-sm text-white rounded-xl px-3 py-2.5 focus:outline-none"
                  style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">Trạng thái</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full text-sm text-white rounded-xl px-3 py-2.5 focus:outline-none"
                  style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <option value="ON">Hoạt động</option>
                  <option value="OFF">Ngừng sử dụng</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 border border-white/8 cursor-pointer hover:text-white"
                  style={{ background: '#111' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white cursor-pointer disabled:opacity-50"
                  style={{ background: '#CF0F47' }}
                >
                  {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
