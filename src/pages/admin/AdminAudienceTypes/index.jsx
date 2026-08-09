import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Edit2, Users, X, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import apiClient from '../../../services/apiClient';
import Toast from '../../../components/Toast';

const EMPTY_FORM = { name: '', description: '', status: 'ON' };

function AdminCard({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-white/5 ${className}`} style={{ background: '#1A1A1A' }}>
      {children}
    </div>
  );
}

const STATUS_COLORS = {
  ON:  { bg: 'rgba(16,185,129,0.12)', text: '#10b981', label: 'Hoạt động' },
  OFF: { bg: 'rgba(239,68,68,0.12)',  text: '#ef4444', label: 'Tắt' },
};

const AVATAR_HUES = [200, 270, 30, 160, 330, 60, 130, 0];
const avatarColor = (name = '') => {
  const h = AVATAR_HUES[name.charCodeAt(0) % AVATAR_HUES.length];
  return { bg: `hsl(${h},55%,22%)`, text: `hsl(${h},80%,65%)` };
};

export default function AdminAudienceTypes() {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState(null);

  const showToast = (type, title, message) =>
    setToast({ type, title, message, key: Date.now() });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/audience-types');
        setItems(Array.isArray(res) ? res : (res?.data || []));
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter(i => !q || (i.name || '').toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q));
  }, [items, search]);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit   = (item) => { setEditing(item); setForm({ name: item.name || '', description: item.description || '', status: item.status || 'ON' }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await apiClient.patch(`/audience-types/${editing.id}`, form);
        setItems(prev => prev.map(i => i.id === editing.id ? { ...i, ...form } : i));
        showToast('success', 'Cập nhật thành công', `Đã cập nhật loại khán giả "${form.name}"`);
      } else {
        const res = await apiClient.post('/audience-types', form);
        setItems(prev => [...prev, res?.data || res]);
        showToast('success', 'Thêm thành công', `Đã thêm loại khán giả "${form.name}"`);
      }
      setShowModal(false);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Đã xảy ra lỗi';
      showToast('error', 'Thao tác thất bại', msg);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (item) => {
    const next = item.status === 'ON' ? 'OFF' : 'ON';
    try {
      await apiClient.patch(`/audience-types/${item.id}`, { status: next });
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: next } : i));
      showToast('info', 'Cập nhật trạng thái', `"${item.name}" đã chuyển sang ${STATUS_COLORS[next].label}`);
    } catch {
      showToast('error', 'Thất bại', 'Không thể cập nhật trạng thái');
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      {toast && (
        <Toast key={toast.key} type={toast.type} title={toast.title} message={toast.message}
          onClose={() => setToast(null)} />
      )}

      {/* Header toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text" placeholder="Tìm loại khán giả..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full text-sm text-white pl-10 pr-4 py-2.5 rounded-xl focus:outline-none"
            style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shrink-0"
          style={{ background: '#CF0F47' }}
        >
          <Plus className="w-4 h-4" /> Thêm loại khán giả
        </button>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Tổng loại', value: items.length, color: '#38bdf8' },
          { label: 'Đang hoạt động', value: items.filter(i => i.status === 'ON').length, color: '#10b981' },
          { label: 'Đã tắt', value: items.filter(i => i.status === 'OFF').length, color: '#ef4444' },
        ].map(s => (
          <AdminCard key={s.label} className="px-5 py-4 flex flex-col gap-1">
            <span className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</span>
            <span className="text-xs text-zinc-500">{s.label}</span>
          </AdminCard>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <AdminCard>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-white/5 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-white/5 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 bg-white/5 rounded" />
                <div className="h-2.5 w-52 bg-white/5 rounded" />
              </div>
            </div>
          ))}
        </AdminCard>
      ) : filtered.length === 0 ? (
        <AdminCard className="py-16 flex flex-col items-center gap-3 text-zinc-500">
          <Users className="w-12 h-12 opacity-30" />
          <p className="text-sm">Không tìm thấy loại khán giả nào.</p>
        </AdminCard>
      ) : (
        <AdminCard>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-3.5 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Tên</th>
                  <th className="text-left px-6 py-3.5 text-[11px] font-bold text-zinc-500 uppercase tracking-wider hidden sm:table-cell">Mô tả</th>
                  <th className="text-center px-6 py-3.5 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => {
                  const ac = avatarColor(item.name);
                  const sc = STATUS_COLORS[item.status] || STATUS_COLORS.ON;
                  return (
                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                            style={{ background: ac.bg, color: ac.text }}>
                            {(item.name || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-semibold">{item.name}</p>
                            <p className="text-xs text-zinc-500">ID: {item.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-400 text-sm hidden sm:table-cell max-w-xs">
                        <span className="line-clamp-2">{item.description || '—'}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => toggleStatus(item)} title="Chuyển trạng thái" className="cursor-pointer">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{ background: sc.bg, color: sc.text }}>
                            {item.status === 'ON'
                              ? <ToggleRight className="w-3.5 h-3.5" />
                              : <ToggleLeft className="w-3.5 h-3.5" />}
                            {sc.label}
                          </span>
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openEdit(item)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/8 cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-2xl border border-white/8 max-w-md w-full shadow-2xl" style={{ background: '#1A1A1A' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h3 className="text-white font-bold text-base">
                {editing ? 'Chỉnh sửa loại khán giả' : 'Thêm loại khán giả mới'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white cursor-pointer p-1.5 rounded-lg hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1.5">Tên loại khán giả <span className="text-red-400">*</span></label>
                <input
                  type="text" required autoFocus
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full text-sm text-white rounded-xl px-3 py-2.5 focus:outline-none"
                  style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}
                  placeholder="VD: Người lớn, Trẻ em, Học sinh..."
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1.5">Mô tả <span className="text-red-400">*</span></label>
                <textarea
                  required rows={3}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full text-sm text-white rounded-xl px-3 py-2.5 focus:outline-none resize-none"
                  style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}
                  placeholder="Mô tả ngắn về loại khán giả..."
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1.5">Trạng thái</label>
                <div className="flex gap-2">
                  {['ON', 'OFF'].map(s => (
                    <button key={s} type="button"
                      onClick={() => setForm(f => ({ ...f, status: s }))}
                      className="flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      style={{
                        background: form.status === s ? STATUS_COLORS[s].bg : '#111',
                        color: form.status === s ? STATUS_COLORS[s].text : '#71717a',
                        border: `1px solid ${form.status === s ? STATUS_COLORS[s].text + '40' : 'rgba(255,255,255,0.06)'}`,
                      }}
                    >
                      {STATUS_COLORS[s].label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 border border-white/8 cursor-pointer hover:text-white"
                  style={{ background: '#111' }}>
                  Hủy
                </button>
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white cursor-pointer disabled:opacity-50"
                  style={{ background: '#CF0F47' }}>
                  <Save className="w-3.5 h-3.5" />
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
