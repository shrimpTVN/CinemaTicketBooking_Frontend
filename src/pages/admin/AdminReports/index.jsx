import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, DollarSign, Ticket, Film, Users, Star } from 'lucide-react';
import apiClient from '../../../services/apiClient';

function AdminCard({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-white/5 ${className}`} style={{ background: '#1A1A1A' }}>
      {children}
    </div>
  );
}

function KPICard({ label, value, sub, icon, color, bg }) {
  return (
    <AdminCard className="p-5 flex items-start gap-4">
      <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: bg, color }}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-zinc-400 text-xs mb-1">{label}</p>
        <p className="text-white font-extrabold text-2xl leading-none mb-1">{value}</p>
        <p className="text-zinc-600 text-xs truncate">{sub}</p>
      </div>
    </AdminCard>
  );
}

function BarChart({ data, colorClass = '#CF0F47' }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-32 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-md transition-all duration-500"
            style={{ height: `${Math.max((d.value / max) * 100, 4)}%`, background: d.value > 0 ? colorClass : 'rgba(255,255,255,0.04)', minHeight: '4px' }}
          />
          <span className="text-zinc-600 text-[10px]">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminReports() {
  const [invoices, setInvoices] = useState([]);
  const [movies, setMovies] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [invR, movR, usrR] = await Promise.allSettled([
          apiClient.get('/invoices'),
          apiClient.get('/movies'),
          apiClient.get('/users'),
        ]);
        const inv = invR.status === 'fulfilled' ? (Array.isArray(invR.value) ? invR.value : invR.value?.data || []) : [];
        const mov = movR.status === 'fulfilled' ? (Array.isArray(movR.value) ? movR.value : movR.value?.data || []) : [];
        const usr = usrR.status === 'fulfilled' ? (Array.isArray(usrR.value) ? usrR.value : usrR.value?.data || []) : [];
        setInvoices(inv);
        setMovies(mov);
        setUsers(usr);
      } catch (err) {
        console.warn('AdminReports fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const stats = useMemo(() => {
    const paid = invoices.filter(i => i.status === 'PAID');
    const totalRevenue = paid.reduce((sum, i) => sum + Number(i.totalAmount || 0), 0);
    const totalTickets = paid.reduce((sum, i) => sum + (i.tickets?.length || 0), 0);
    const avgOrderValue = paid.length > 0 ? totalRevenue / paid.length : 0;
    return { totalRevenue, totalTickets, avgOrderValue, paidCount: paid.length };
  }, [invoices]);

  // Revenue by month (from paid invoices, using showtime.date)
  const monthlyRevenue = useMemo(() => {
    const months = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
    const acc = Array(12).fill(0);
    invoices.filter(i => i.status === 'PAID').forEach(i => {
      const d = i.showtime?.date;
      if (d) {
        const m = new Date(d).getMonth(); // 0-indexed
        if (m >= 0 && m < 12) acc[m] += Number(i.totalAmount || 0);
      }
    });
    return months.map((label, idx) => ({ label, value: acc[idx] }));
  }, [invoices]);

  // Top movies by ticket count
  const topMovies = useMemo(() => {
    const acc = {};
    invoices.filter(i => i.status === 'PAID').forEach(i => {
      const name = i.showtime?.movieName || 'Không rõ';
      if (!acc[name]) acc[name] = { name, tickets: 0, revenue: 0 };
      acc[name].tickets += i.tickets?.length || 0;
      acc[name].revenue += Number(i.totalAmount || 0);
    });
    return Object.values(acc).sort((a, b) => b.tickets - a.tickets).slice(0, 5);
  }, [invoices]);

  // Status breakdown
  const statusBreakdown = useMemo(() => {
    const paid = invoices.filter(i => i.status === 'PAID').length;
    const pending = invoices.filter(i => i.status === 'PENDING').length;
    const cancelled = invoices.filter(i => i.status === 'CANCELLED').length;
    return [
      { label: 'Đã thanh toán', value: paid, color: '#10B981', pct: invoices.length ? Math.round((paid / invoices.length) * 100) : 0 },
      { label: 'Chờ thanh toán', value: pending, color: '#F59E0B', pct: invoices.length ? Math.round((pending / invoices.length) * 100) : 0 },
      { label: 'Đã hủy', value: cancelled, color: '#F43F5E', pct: invoices.length ? Math.round((cancelled / invoices.length) * 100) : 0 },
    ];
  }, [invoices]);

  const fmtCurrency = (n) => n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M đ`
    : `${n.toLocaleString('vi-VN')} đ`;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Tổng doanh thu (PAID)"
          value={loading ? '--' : fmtCurrency(stats.totalRevenue)}
          sub={`Từ ${stats.paidCount} hóa đơn đã thanh toán`}
          color="#CF0F47" bg="rgba(207,15,71,0.1)"
          icon={<DollarSign className="w-5 h-5" />}
        />
        <KPICard
          label="Tổng vé đã bán"
          value={loading ? '--' : stats.totalTickets}
          sub="Từ tất cả hóa đơn PAID"
          color="#3B82F6" bg="rgba(59,130,246,0.1)"
          icon={<Ticket className="w-5 h-5" />}
        />
        <KPICard
          label="Giá trị đơn TB"
          value={loading ? '--' : fmtCurrency(stats.avgOrderValue)}
          sub="Trung bình mỗi hóa đơn PAID"
          color="#10B981" bg="rgba(16,185,129,0.1)"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <KPICard
          label="Tổng phim trong hệ thống"
          value={loading ? '--' : movies.length}
          sub={`${users.length} tài khoản người dùng`}
          color="#F59E0B" bg="rgba(245,158,11,0.1)"
          icon={<Film className="w-5 h-5" />}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly revenue bar chart */}
        <AdminCard className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-bold text-sm">Doanh thu theo tháng</h3>
              <p className="text-zinc-500 text-xs mt-0.5">Tổng từ hóa đơn PAID</p>
            </div>
          </div>
          {loading ? (
            <div className="h-32 flex items-end gap-1.5 animate-pulse">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="flex-1 bg-white/5 rounded-t-md" style={{ height: `${20 + Math.random() * 60}%` }} />
              ))}
            </div>
          ) : (
            <BarChart data={monthlyRevenue} colorClass="rgba(207,15,71,0.7)" />
          )}
        </AdminCard>

        {/* Status breakdown */}
        <AdminCard className="p-6">
          <h3 className="text-white font-bold text-sm mb-5">Phân bổ trạng thái HĐ</h3>
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="h-2.5 bg-white/5 rounded w-1/2" />
                  <div className="h-2 bg-white/5 rounded w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {statusBreakdown.map(s => (
                <div key={s.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-zinc-400 text-xs">{s.label}</span>
                    <span className="text-white text-xs font-bold">{s.value} <span className="text-zinc-500 font-normal">({s.pct}%)</span></span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: '#111' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${s.pct}%`, background: s.color }}
                    />
                  </div>
                </div>
              ))}
              <p className="text-zinc-600 text-xs mt-3 pt-3 border-t border-white/5">
                Tổng <span className="text-white font-bold">{invoices.length}</span> hóa đơn
              </p>
            </div>
          )}
        </AdminCard>
      </div>

      {/* Top movies table */}
      <AdminCard className="overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400" />
          <h3 className="text-white font-bold text-sm">Top phim có doanh thu cao nhất</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead style={{ background: '#111' }}>
              <tr className="text-xs uppercase text-zinc-500 font-bold border-b border-white/5">
                <th className="px-6 py-3">#</th>
                <th className="px-6 py-3">Tên phim</th>
                <th className="px-6 py-3">Số vé bán</th>
                <th className="px-6 py-3">Doanh thu</th>
                <th className="px-6 py-3">Tỷ lệ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-6 py-4"><div className="h-3 bg-white/5 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : topMovies.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-zinc-500 text-sm">Chưa có dữ liệu.</td>
                </tr>
              ) : (
                topMovies.map((m, idx) => {
                  const pct = stats.totalRevenue > 0 ? Math.round((m.revenue / stats.totalRevenue) * 100) : 0;
                  return (
                    <tr key={m.name} className="hover:bg-white/3 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold ${idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-zinc-300' : idx === 2 ? 'text-amber-700' : 'text-zinc-600'}`}>
                          #{idx + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white text-xs font-semibold">{m.name}</td>
                      <td className="px-6 py-4 text-zinc-300 text-xs font-bold">{m.tickets}</td>
                      <td className="px-6 py-4 text-xs font-extrabold" style={{ color: '#CF0F47' }}>
                        {fmtCurrency(m.revenue)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 rounded-full flex-1" style={{ background: '#111' }}>
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#CF0F47' }} />
                          </div>
                          <span className="text-zinc-500 text-[11px] w-8 text-right">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  );
}
