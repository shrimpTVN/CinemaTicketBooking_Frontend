import { useState, useEffect, useMemo } from 'react';
import { Search, Eye, CheckCircle2, Clock, XCircle, DollarSign, Ticket, ChevronRight, X } from 'lucide-react';
import apiClient from '../../../services/apiClient';

// ─── Helpers ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    PAID:      { label: 'Đã thanh toán', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: <CheckCircle2 className="w-3 h-3" /> },
    PENDING:   { label: 'Chờ thanh toán', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20',    icon: <Clock className="w-3 h-3" /> },
    CANCELLED: { label: 'Đã hủy',        cls: 'bg-rose-500/10 text-rose-400 border-rose-500/20',       icon: <XCircle className="w-3 h-3" /> },
  };
  const s = map[status] || { label: status, cls: 'bg-zinc-800 text-zinc-400 border-zinc-700', icon: null };
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded border ${s.cls}`}>
      {s.icon}{s.label}
    </span>
  );
}

function AdminCard({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-white/5 ${className}`} style={{ background: '#1A1A1A' }}>
      {children}
    </div>
  );
}

export default function AdminBookings() {
  const [invoices, setInvoices] = useState([]);
  const [users, setUsers] = useState({});   // userId -> userName map
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [invRes, usrRes] = await Promise.allSettled([
          apiClient.get('/invoices'),
          apiClient.get('/users'),
        ]);

        const invData = invRes.status === 'fulfilled'
          ? (Array.isArray(invRes.value) ? invRes.value : invRes.value?.data || [])
          : [];

        const usrData = usrRes.status === 'fulfilled'
          ? (Array.isArray(usrRes.value) ? usrRes.value : usrRes.value?.data || [])
          : [];

        // Build userId → name map
        const userMap = {};
        usrData.forEach(u => { userMap[u.id] = u.name || u.email || `User #${u.id}`; });
        setUsers(userMap);
        setInvoices(invData);
      } catch (err) {
        console.warn('AdminBookings fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return invoices.filter(inv => {
      const movieName = inv.showtime?.movieName || '';
      const userName = users[inv.userId] || '';
      const matchSearch = !q
        || String(inv.invoiceId).includes(q)
        || movieName.toLowerCase().includes(q)
        || userName.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'ALL' || inv.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoices, users, searchQuery, statusFilter]);

  const kpiPaid = invoices.filter(i => i.status === 'PAID').length;
  const kpiPending = invoices.filter(i => i.status === 'PENDING').length;
  const kpiRevenue = invoices
    .filter(i => i.status === 'PAID')
    .reduce((sum, i) => sum + Number(i.totalAmount || 0), 0);

  const seatLabel = (ticket) => `${ticket.seatRowLabel}${ticket.seatColNumber}`;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tổng hóa đơn', value: invoices.length, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', icon: <Ticket className="w-5 h-5" /> },
          { label: 'Đã thanh toán', value: kpiPaid, color: '#10B981', bg: 'rgba(16,185,129,0.1)', icon: <CheckCircle2 className="w-5 h-5" /> },
          { label: 'Chờ thanh toán', value: kpiPending, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: <Clock className="w-5 h-5" /> },
          { label: 'Doanh thu (PAID)', value: `${(kpiRevenue/1000000).toFixed(1)}M đ`, color: '#CF0F47', bg: 'rgba(207,15,71,0.1)', icon: <DollarSign className="w-5 h-5" /> },
        ].map(k => (
          <AdminCard key={k.label} className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: k.bg, color: k.color }}>
              {k.icon}
            </div>
            <div>
              <p className="text-zinc-400 text-xs">{k.label}</p>
              <p className="text-white font-bold text-xl">{loading ? '--' : k.value}</p>
            </div>
          </AdminCard>
        ))}
      </div>

      {/* Filter bar */}
      <AdminCard className="p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Tìm theo mã HĐ, phim, tên khách..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-sm text-white pl-10 pr-4 py-2 rounded-xl focus:outline-none"
            style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'PAID', label: 'Đã thanh toán' },
            { id: 'PENDING', label: 'Chờ thanh toán' },
            { id: 'CANCELLED', label: 'Đã hủy' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-[#CF0F47] text-white'
                  : 'text-zinc-400 hover:text-white border border-white/8'
              }`}
              style={statusFilter !== tab.id ? { background: '#111111' } : {}}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </AdminCard>

      {/* Table */}
      <AdminCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead style={{ background: '#111111' }}>
              <tr className="text-xs uppercase text-zinc-500 font-bold border-b border-white/5">
                <th className="px-6 py-3.5">Mã HĐ</th>
                <th className="px-6 py-3.5">Phim · Suất chiếu</th>
                <th className="px-6 py-3.5">Khách hàng</th>
                <th className="px-6 py-3.5">Ghế</th>
                <th className="px-6 py-3.5">Tổng tiền</th>
                <th className="px-6 py-3.5">Thanh toán</th>
                <th className="px-6 py-3.5">Trạng thái</th>
                <th className="px-6 py-3.5 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-3 bg-white/5 rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-zinc-500 text-sm">
                    Không tìm thấy hóa đơn nào.
                  </td>
                </tr>
              ) : (
                filtered.map(inv => (
                  <tr key={inv.invoiceId} className="hover:bg-white/3 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-zinc-300">#{inv.invoiceId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white text-xs font-semibold">{inv.showtime?.movieName || '—'}</p>
                      <p className="text-zinc-500 text-[11px]">
                        {inv.showtime?.date} {inv.showtime?.startTime} · {inv.showtime?.hallName}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-zinc-300 text-xs">
                      {users[inv.userId] || `User #${inv.userId}`}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(inv.tickets || []).slice(0, 3).map(t => (
                          <span key={t.id} className="text-[10px] font-mono bg-white/5 border border-white/8 px-1.5 py-0.5 rounded text-zinc-300">
                            {seatLabel(t)}
                          </span>
                        ))}
                        {(inv.tickets || []).length > 3 && (
                          <span className="text-[10px] text-zinc-500">+{inv.tickets.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#CF0F47] font-bold text-xs">
                      {Number(inv.totalAmount || 0).toLocaleString('vi-VN')} đ
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-xs">{inv.paymentMethod}</td>
                    <td className="px-6 py-4"><StatusBadge status={inv.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelected(inv)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer border border-white/8"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-2xl border border-white/8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl" style={{ background: '#1A1A1A' }}>
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <div>
                <h3 className="text-white font-bold text-base">Hóa đơn #{selected.invoiceId}</h3>
                <p className="text-zinc-500 text-xs mt-0.5">Chi tiết đặt vé</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Movie & Showtime */}
              <div className="rounded-xl p-4 space-y-1 border border-white/5" style={{ background: '#111' }}>
                <p className="text-white font-bold text-sm">{selected.showtime?.movieName}</p>
                <p className="text-zinc-400 text-xs">{selected.showtime?.hallName}</p>
                <p className="text-zinc-400 text-xs">{selected.showtime?.date} lúc {selected.showtime?.startTime}</p>
              </div>

              {/* Seats */}
              <div>
                <p className="text-zinc-400 text-xs font-bold uppercase mb-2">Ghế ngồi ({(selected.tickets || []).length})</p>
                <div className="flex flex-wrap gap-2">
                  {(selected.tickets || []).map(t => (
                    <div key={t.id} className="rounded-lg px-3 py-1.5 border border-white/8 text-xs text-white" style={{ background: '#111' }}>
                      <span className="font-bold">{seatLabel(t)}</span>
                      <span className="text-zinc-500 ml-1.5">{t.audienceType}</span>
                      <span className="text-[#CF0F47] ml-1.5 font-bold">{Number(t.price || 0).toLocaleString('vi-VN')}đ</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Products */}
              {(selected.products || []).length > 0 && (
                <div>
                  <p className="text-zinc-400 text-xs font-bold uppercase mb-2">Bắp nước & Combo</p>
                  <div className="space-y-1.5">
                    {selected.products.map((p, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-zinc-300">{p.name || `Sản phẩm #${p.productId}`}</span>
                        <span className="text-zinc-400">{p.quantity}x</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="rounded-xl p-4 border border-white/5 space-y-2 text-sm" style={{ background: '#111' }}>
                <div className="flex justify-between text-zinc-400 text-xs">
                  <span>Phương thức thanh toán</span>
                  <span className="text-white font-medium">{selected.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-zinc-400 text-xs">
                  <span>VAT</span>
                  <span className="text-white font-medium">{Number(selected.vat || 0).toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between font-bold border-t border-white/5 pt-2">
                  <span className="text-white">Tổng cộng</span>
                  <span className="text-[#CF0F47] text-base">{Number(selected.totalAmount || 0).toLocaleString('vi-VN')} đ</span>
                </div>
              </div>

              {/* Status */}
              <div className="flex justify-between items-center">
                <StatusBadge status={selected.status} />
                <button
                  onClick={() => setSelected(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer"
                  style={{ background: '#CF0F47' }}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
