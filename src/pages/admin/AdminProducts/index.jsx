import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Edit2, CheckCircle, XCircle, ShoppingBag, X, Save } from 'lucide-react';
import apiClient from '../../../services/apiClient';

function AdminCard({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-white/5 ${className}`} style={{ background: '#1A1A1A' }}>
      {children}
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">{label}</label>
      <input
        className="w-full text-sm text-white rounded-xl px-3 py-2.5 focus:outline-none"
        style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}
        {...props}
      />
    </div>
  );
}

const EMPTY_FORM = { name: '', price: '', productType: 'COMBO', description: '', image: '', status: 'ACTIVE' };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/products');
        const data = Array.isArray(res) ? res : (res?.data || []);
        setProducts(data);
      } catch (err) {
        console.warn('AdminProducts fetch error:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = useMemo(() => products.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || (p.name || '').toLowerCase().includes(q);
    const matchType = typeFilter === 'ALL' || p.productType === typeFilter;
    return matchSearch && matchType;
  }), [products, searchQuery, typeFilter]);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ name: p.name || '', price: p.price || '', productType: p.productType || 'COMBO', description: p.description || '', image: p.image || '', status: p.status || 'ACTIVE' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, price: parseFloat(form.price) };
    try {
      if (editing) {
        await apiClient.patch(`/products/${editing.id}`, payload);
        setProducts(prev => prev.map(p => p.id === editing.id ? { ...p, ...payload } : p));
      } else {
        const res = await apiClient.post('/products', payload);
        const created = res?.data || res;
        setProducts(prev => [created, ...prev]);
      }
      setShowModal(false);
    } catch (err) {
      console.error('AdminProducts save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (p) => {
    const newStatus = p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await apiClient.post(`/products/${p.id}/update-status`, { status: newStatus });
      setProducts(prev => prev.map(x => x.id === p.id ? { ...x, status: newStatus } : x));
    } catch (err) {
      console.error('Toggle product status error:', err);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Tìm tên sản phẩm..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-sm text-white pl-10 pr-4 py-2 rounded-xl focus:outline-none"
              style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {[
              { id: 'ALL', label: 'Tất cả' },
              { id: 'COMBO', label: 'Combo' },
              { id: 'FOOD', label: 'Đồ ăn' },
              { id: 'BEVERAGE', label: 'Đồ uống' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setTypeFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  typeFilter === tab.id ? 'bg-[#CF0F47] text-white' : 'text-zinc-400 hover:text-white border border-white/8'
                }`}
                style={typeFilter !== tab.id ? { background: '#1A1A1A' } : {}}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shrink-0"
          style={{ background: '#CF0F47' }}
        >
          <Plus className="w-4 h-4" /> Thêm sản phẩm
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/5 overflow-hidden animate-pulse" style={{ background: '#1A1A1A' }}>
              <div className="aspect-[4/3] bg-white/5" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-white/5 rounded w-3/4" />
                <div className="h-2 bg-white/5 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <AdminCard className="py-16 text-center text-zinc-500 text-sm">Không tìm thấy sản phẩm nào.</AdminCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map(p => (
            <div
              key={p.id}
              className="rounded-2xl border border-white/5 overflow-hidden flex flex-col group transition-all hover:border-white/10"
              style={{ background: '#1A1A1A' }}
            >
              <div className="aspect-[4/3] w-full bg-white/3 overflow-hidden relative">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-700">
                    <ShoppingBag className="w-10 h-10" />
                  </div>
                )}
                <span className="absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded border border-white/8 text-zinc-300"
                  style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
                  {p.productType}
                </span>
              </div>
              <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                <div>
                  <h4 className="text-white font-bold text-sm line-clamp-1">{p.name}</h4>
                  {p.description && (
                    <p className="text-zinc-500 text-xs mt-0.5 line-clamp-2">{p.description}</p>
                  )}
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <span className="font-extrabold text-base" style={{ color: '#CF0F47' }}>
                    {Number(p.price || 0).toLocaleString('vi-VN')} đ
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => toggleStatus(p)}
                      className="p-1.5 rounded-lg cursor-pointer border transition-colors"
                      style={{
                        background: p.status === 'ACTIVE' ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
                        borderColor: p.status === 'ACTIVE' ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)',
                        color: p.status === 'ACTIVE' ? '#10B981' : '#F43F5E',
                      }}
                    >
                      {p.status === 'ACTIVE'
                        ? <CheckCircle className="w-3.5 h-3.5" />
                        : <XCircle className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => openEdit(p)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white border border-white/8 cursor-pointer hover:bg-white/5"
                      style={{ background: '#111' }}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-2xl border border-white/8 max-w-md w-full shadow-2xl" style={{ background: '#1A1A1A' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h3 className="text-white font-bold text-base">{editing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white cursor-pointer p-1.5 rounded-lg hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <Input label="Tên sản phẩm" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="VD: Combo Đôi bắp nước" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Giá bán (VNĐ)" type="number" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="89000" />
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">Loại</label>
                  <select
                    value={form.productType}
                    onChange={e => setForm({ ...form, productType: e.target.value })}
                    className="w-full text-sm text-white rounded-xl px-3 py-2.5 focus:outline-none"
                    style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <option value="COMBO">COMBO</option>
                    <option value="FOOD">FOOD</option>
                    <option value="BEVERAGE">BEVERAGE</option>
                  </select>
                </div>
              </div>
              <Input label="Link hình ảnh" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">Mô tả</label>
                <textarea
                  rows="2"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full text-sm text-white rounded-xl px-3 py-2.5 focus:outline-none resize-none"
                  style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}
                  placeholder="Mô tả chi tiết..."
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
