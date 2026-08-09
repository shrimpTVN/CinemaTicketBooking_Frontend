import { useState, useEffect } from 'react';
import { Edit2, Save, X, DollarSign, Ticket, Plus, Info } from 'lucide-react';
import apiClient from '../../../services/apiClient';

function AdminCard({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-white/5 ${className}`} style={{ background: '#1A1A1A' }}>
      {children}
    </div>
  );
}

const EMPTY_FORM = {
  name: '',
  hallTypeId: '',
  seatTypeId: '',
  audienceTypeId: '',
  price: '',
  days: [],
};

const ALL_DAYS = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];
const DAY_LABELS = {
  MONDAY: 'T2', TUESDAY: 'T3', WEDNESDAY: 'T4',
  THURSDAY: 'T5', FRIDAY: 'T6', SATURDAY: 'T7', SUNDAY: 'CN',
};

const AUDIENCE_OPTIONS = [
  { id: 1, label: 'Người lớn' },
  { id: 2, label: 'Trẻ em' },
  { id: 3, label: 'Sinh viên' },
];

export default function AdminPricing() {
  const [prices, setPrices] = useState([]);
  const [hallTypes, setHallTypes] = useState([]);
  const [seatTypes, setSeatTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Inline edit state
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [savingId, setSavingId] = useState(null);

  // Create modal state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [priceRes, hallRes, seatRes] = await Promise.allSettled([
          apiClient.get('/price-lists'),
          apiClient.get('/hall-types'),
          apiClient.get('/seat-types'),
        ]);
        setPrices(priceRes.status === 'fulfilled' ? (Array.isArray(priceRes.value) ? priceRes.value : priceRes.value?.data || []) : []);
        setHallTypes(hallRes.status === 'fulfilled' ? (Array.isArray(hallRes.value) ? hallRes.value : hallRes.value?.data || []) : []);
        setSeatTypes(seatRes.status === 'fulfilled' ? (Array.isArray(seatRes.value) ? seatRes.value : seatRes.value?.data || []) : []);
      } catch (err) {
        console.warn('AdminPricing fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ─── Inline Edit ──────────────────────────────────────────────────────
  const handleInlineEdit = (item) => {
    setEditingId(item.id);
    setEditPrice(Number(item.price ?? 0));
  };

  const handleInlineSave = async (item) => {
    const val = parseFloat(editPrice);
    if (isNaN(val)) return;
    setSavingId(item.id);
    try {
      await apiClient.patch(`/price-lists/${item.id}`, {
        hallTypeId: item.hallTypeId || hallTypes.find(h => h.name === item.hallType)?.id,
        seatTypeId: item.seatTypeId || seatTypes.find(s => s.name === item.seatType)?.id,
        audienceTypeId: item.audienceTypeId || AUDIENCE_OPTIONS.find(a => a.label === item.audienceType)?.id,
        name: item.name,
        price: val,
        days: item.days || [],
      });
      setPrices(prev => prev.map(p => p.id === item.id ? { ...p, price: val } : p));
      setEditingId(null);
    } catch (err) {
      console.error('AdminPricing inline save error:', err);
    } finally {
      setSavingId(null);
    }
  };

  // ─── Create new ───────────────────────────────────────────────────────
  const toggleDay = (day) => {
    setForm(f => ({
      ...f,
      days: f.days.includes(day) ? f.days.filter(d => d !== day) : [...f.days, day],
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.hallTypeId || !form.seatTypeId || !form.audienceTypeId || !form.price || !form.name || form.days.length === 0) return;
    setCreating(true);
    try {
      const payload = {
        hallTypeId: parseInt(form.hallTypeId),
        seatTypeId: parseInt(form.seatTypeId),
        audienceTypeId: parseInt(form.audienceTypeId),
        name: form.name,
        price: parseFloat(form.price),
        days: form.days,
      };
      const res = await apiClient.post('/price-lists', payload);
      const created = res?.data || res;
      setPrices(prev => [...prev, created]);
      setShowModal(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      console.error('AdminPricing create error:', err);
    } finally {
      setCreating(false);
    }
  };

  // Group prices by hallType
  const groups = prices.reduce((acc, p) => {
    const key = p.hallType || 'Khác';
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3 rounded-xl px-4 py-3 border border-blue-500/20 bg-blue-500/5 flex-1">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-blue-300 text-xs leading-relaxed">
            Giá vé = <span className="font-bold">Loại phòng × Loại ghế × Đối tượng × Ngày chiếu</span>. Click <Edit2 className="inline w-3 h-3" /> để chỉnh sửa giá nhanh.
          </p>
        </div>
        <button
          onClick={() => { setForm(EMPTY_FORM); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shrink-0"
          style={{ background: '#CF0F47' }}
        >
          <Plus className="w-4 h-4" /> Thêm mức giá
        </button>
      </div>

      {loading ? (
        <AdminCard className="p-8 text-center text-zinc-500 text-sm animate-pulse">Đang tải bảng giá...</AdminCard>
      ) : prices.length === 0 ? (
        <AdminCard className="p-8 text-center text-zinc-500 text-sm">Chưa có dữ liệu bảng giá.</AdminCard>
      ) : (
        Object.entries(groups).map(([hallType, items]) => (
          <AdminCard key={hallType} className="overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <h3 className="text-white font-bold text-sm">Phòng {hallType}</h3>
              <span className="text-xs text-zinc-500 ml-auto">{items.length} mức giá</span>
            </div>

            <div className="divide-y divide-white/5">
              {items.map(item => {
                const itemPrice = Number(item.price ?? 0);
                const isEditing = editingId === item.id;

                return (
                  <div key={item.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/3 transition-colors">
                    {/* Left info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>
                        <Ticket className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{item.name || `Giá #${item.id}`}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.seatType && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded border border-white/8 text-zinc-400" style={{ background: '#111' }}>
                              Ghế: {item.seatType}
                            </span>
                          )}
                          {item.audienceType && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded border border-white/8 text-zinc-400" style={{ background: '#111' }}>
                              {item.audienceType}
                            </span>
                          )}
                          {(item.days || []).length > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded border border-white/8 text-zinc-400" style={{ background: '#111' }}>
                              {item.days.map(d => DAY_LABELS[d] || d).join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: price + edit */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isEditing ? (
                        <>
                          <input
                            type="number"
                            value={editPrice}
                            onChange={e => setEditPrice(e.target.value)}
                            className="w-32 text-white text-sm font-bold px-3 py-1.5 rounded-lg focus:outline-none"
                            style={{ background: '#111', border: '1px solid #CF0F47' }}
                            autoFocus
                          />
                          <button
                            onClick={() => handleInlineSave(item)}
                            disabled={savingId === item.id}
                            className="p-1.5 rounded-lg text-white cursor-pointer disabled:opacity-40"
                            style={{ background: '#CF0F47' }}
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white cursor-pointer border border-white/8"
                            style={{ background: '#111' }}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-lg font-extrabold" style={{ color: '#CF0F47' }}>
                            {itemPrice.toLocaleString('vi-VN')} đ
                          </span>
                          <button
                            onClick={() => handleInlineEdit(item)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white border border-white/8 cursor-pointer hover:bg-white/5 transition-colors"
                            style={{ background: '#111' }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </AdminCard>
        ))
      )}

      {/* ── Create Modal ────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-2xl border border-white/8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto" style={{ background: '#1A1A1A' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h3 className="text-white font-bold text-base">Thêm mức giá mới</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white cursor-pointer p-1.5 rounded-lg hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">Tên mức giá *</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full text-sm text-white rounded-xl px-3 py-2.5 focus:outline-none"
                  style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}
                  placeholder="VD: Ghế VIP - Phòng IMAX - Cuối tuần"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Hall type */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">Loại phòng *</label>
                  <select
                    required
                    value={form.hallTypeId}
                    onChange={e => setForm({ ...form, hallTypeId: e.target.value })}
                    className="w-full text-sm text-white rounded-xl px-3 py-2.5 focus:outline-none"
                    style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <option value="">-- Chọn loại phòng --</option>
                    {hallTypes.map(h => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>

                {/* Seat type */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">Loại ghế *</label>
                  <select
                    required
                    value={form.seatTypeId}
                    onChange={e => setForm({ ...form, seatTypeId: e.target.value })}
                    className="w-full text-sm text-white rounded-xl px-3 py-2.5 focus:outline-none"
                    style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <option value="">-- Chọn loại ghế --</option>
                    {seatTypes.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Audience type */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">Đối tượng *</label>
                  <select
                    required
                    value={form.audienceTypeId}
                    onChange={e => setForm({ ...form, audienceTypeId: e.target.value })}
                    className="w-full text-sm text-white rounded-xl px-3 py-2.5 focus:outline-none"
                    style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <option value="">-- Chọn đối tượng --</option>
                    {AUDIENCE_OPTIONS.map(a => (
                      <option key={a.id} value={a.id}>{a.label}</option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">Giá vé (VNĐ) *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    className="w-full text-sm text-white rounded-xl px-3 py-2.5 focus:outline-none"
                    style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}
                    placeholder="VD: 90000"
                  />
                </div>
              </div>

              {/* Days */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-2">Áp dụng ngày * <span className="text-zinc-600 font-normal normal-case">(chọn ít nhất 1)</span></label>
                <div className="flex gap-2 flex-wrap">
                  {ALL_DAYS.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors border ${
                        form.days.includes(day)
                          ? 'text-white border-[#CF0F47]'
                          : 'text-zinc-500 border-white/8 hover:text-zinc-300'
                      }`}
                      style={form.days.includes(day) ? { background: 'rgba(207,15,71,0.15)' } : { background: '#111' }}
                    >
                      {DAY_LABELS[day]}
                    </button>
                  ))}
                </div>
                {form.days.length === 0 && (
                  <p className="text-rose-400 text-[11px] mt-1">Vui lòng chọn ít nhất 1 ngày áp dụng.</p>
                )}
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
                  disabled={creating || form.days.length === 0}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white cursor-pointer disabled:opacity-50"
                  style={{ background: '#CF0F47' }}
                >
                  {creating ? 'Đang tạo...' : 'Tạo mức giá'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
