import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, Tag, X, Save } from 'lucide-react';
import apiClient from '../../../services/apiClient';

function AdminCard({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-white/5 ${className}`} style={{ background: '#1A1A1A' }}>
      {children}
    </div>
  );
}

const EMPTY_FORM = { name: '' };

export default function AdminGenres() {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/genres');
        const data = Array.isArray(res) ? res : (res?.data || []);
        setGenres(data);
      } catch (err) {
        console.warn('AdminGenres fetch error:', err);
        setGenres([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return genres.filter(g => !q || (g.name || '').toLowerCase().includes(q));
  }, [genres, searchQuery]);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (g) => { setEditing(g); setForm({ name: g.name || '' }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await apiClient.patch(`/genres/${editing.id}`, form);
        setGenres(prev => prev.map(g => g.id === editing.id ? { ...g, ...form } : g));
      } else {
        const res = await apiClient.post('/genres', form);
        const created = res?.data || res;
        setGenres(prev => [...prev, created]);
      }
      setShowModal(false);
    } catch (err) {
      console.error('AdminGenres save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa thể loại này?')) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/genres/${id}`);
      setGenres(prev => prev.filter(g => g.id !== id));
    } catch (err) {
      console.error('AdminGenres delete error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const HUES = [0, 30, 60, 120, 180, 210, 270, 320];
  const genreColor = (name = '') => {
    const idx = name.charCodeAt(0) % HUES.length;
    return `hsl(${HUES[idx]}, 60%, 50%)`;
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Tìm thể loại..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-sm text-white pl-10 pr-4 py-2 rounded-xl focus:outline-none"
            style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shrink-0"
          style={{ background: '#CF0F47' }}
        >
          <Plus className="w-4 h-4" /> Thêm thể loại
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/5 p-4 animate-pulse flex items-center gap-2" style={{ background: '#1A1A1A' }}>
              <div className="w-6 h-6 rounded-full bg-white/5" />
              <div className="h-3 bg-white/5 rounded flex-1" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <AdminCard className="py-16 text-center text-zinc-500 text-sm">Không tìm thấy thể loại nào.</AdminCard>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map(g => {
            const color = genreColor(g.name);
            return (
              <div
                key={g.id}
                className="group rounded-2xl border border-white/5 p-4 flex items-center justify-between hover:border-white/10 transition-all"
                style={{ background: '#1A1A1A' }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: `${color}18`, color }}>
                    <Tag className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-white text-sm font-semibold truncate">{g.name}</span>
                </div>
                <div className="flex gap-0.5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => openEdit(g)}
                    className="p-1 rounded text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(g.id)}
                    disabled={deletingId === g.id}
                    className="p-1 rounded text-rose-400 hover:text-rose-300 cursor-pointer disabled:opacity-40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-2xl border border-white/8 max-w-sm w-full shadow-2xl" style={{ background: '#1A1A1A' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h3 className="text-white font-bold text-base">{editing ? 'Chỉnh sửa thể loại' : 'Thêm thể loại mới'}</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white cursor-pointer p-1.5 rounded-lg hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">Tên thể loại</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ name: e.target.value })}
                  className="w-full text-sm text-white rounded-xl px-3 py-2.5 focus:outline-none"
                  style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}
                  placeholder="VD: Hành động, Phiêu lưu..."
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 border border-white/8 cursor-pointer hover:text-white" style={{ background: '#111' }}>
                  Hủy
                </button>
                <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl text-xs font-bold text-white cursor-pointer disabled:opacity-50" style={{ background: '#CF0F47' }}>
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
