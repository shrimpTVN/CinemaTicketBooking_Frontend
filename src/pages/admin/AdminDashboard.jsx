import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Film, Ticket, DollarSign, Users, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import apiClient from '../../services/apiClient';

function StatCard({ label, value, sub, icon, color, bg, to }) {
  return (
    <Link
      to={to}
      className="rounded-2xl border border-white/5 p-5 flex items-start gap-4 transition-all hover:border-white/10 hover:-translate-y-0.5 duration-200 block"
      style={{ background: '#1A1A1A' }}
    >
      <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: bg, color }}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-zinc-400 text-xs mb-1 truncate">{label}</p>
        <p className="text-white font-bold text-2xl leading-none mb-1">{value}</p>
        <p className="text-zinc-600 text-xs truncate">{sub}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-zinc-700 shrink-0 mt-1" />
    </Link>
  );
}

function StatusBadge({ status }) {
  const map = {
    PAID:      { label: 'Đã thanh toán', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    PENDING:   { label: 'Chờ thanh toán', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    CANCELLED: { label: 'Đã hủy',        cls: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  };
  const s = map[status] || { label: status, cls: 'bg-zinc-800 text-zinc-400 border-zinc-700' };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${s.cls}`}>{s.label}</span>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ movies: null, users: null, invoices: null, revenue: null });
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [moviesRes, usersRes, invoicesRes] = await Promise.allSettled([
          apiClient.get('/movies'),
          apiClient.get('/users'),
          apiClient.get('/invoices'),
        ]);

        const movies = moviesRes.status === 'fulfilled'
          ? (Array.isArray(moviesRes.value) ? moviesRes.value : moviesRes.value?.data || [])
          : [];
        const users = usersRes.status === 'fulfilled'
          ? (Array.isArray(usersRes.value) ? usersRes.value : usersRes.value?.data || [])
          : [];
        const invoices = invoicesRes.status === 'fulfilled'
          ? (Array.isArray(invoicesRes.value) ? invoicesRes.value : invoicesRes.value?.data || [])
          : [];

        const paidInvoices = invoices.filter(inv => inv.status === 'PAID');
        const totalRevenue = paidInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0);

        setStats({
          movies: movies.length,
          users: users.length,
          invoices: invoices.length,
          revenue: totalRevenue,
        });

        // 5 recent invoices sorted by newest (invoiceId desc)
        const sorted = [...invoices].sort((a, b) => (b.invoiceId || 0) - (a.invoiceId || 0));
        setRecentInvoices(sorted.slice(0, 5));
      } catch (err) {
        console.warn('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const fmtCurrency = (n) =>
    n == null ? '--' : n.toLocaleString('vi-VN') + ' đ';

  const kpis = [
    {
      label: 'Tổng số phim',
      value: stats.movies == null ? '--' : stats.movies,
      sub: stats.movies == null ? 'Đang tải...' : `${stats.movies} bộ phim trong hệ thống`,
      color: '#CF0F47',
      bg: 'rgba(207,15,71,0.10)',
      to: '/admin/movies',
      icon: <Film className="w-5 h-5" />,
    },
    {
      label: 'Tổng hóa đơn',
      value: stats.invoices == null ? '--' : stats.invoices,
      sub: stats.invoices == null ? 'Đang tải...' : `${stats.invoices} đơn đặt vé`,
      color: '#3B82F6',
      bg: 'rgba(59,130,246,0.10)',
      to: '/admin/bookings',
      icon: <Ticket className="w-5 h-5" />,
    },
    {
      label: 'Tổng doanh thu (PAID)',
      value: stats.revenue == null ? '--' : fmtCurrency(stats.revenue),
      sub: stats.revenue == null ? 'Đang tải...' : 'Từ các hóa đơn đã thanh toán',
      color: '#10B981',
      bg: 'rgba(16,185,129,0.10)',
      to: '/admin/reports',
      icon: <DollarSign className="w-5 h-5" />,
    },
    {
      label: 'Người dùng',
      value: stats.users == null ? '--' : stats.users,
      sub: stats.users == null ? 'Đang tải...' : `${stats.users} tài khoản đã đăng ký`,
      color: '#F59E0B',
      bg: 'rgba(245,158,11,0.10)',
      to: '/admin/users',
      icon: <Users className="w-5 h-5" />,
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="text-white font-bold mb-1" style={{ fontSize: '20px' }}>
          Chào mừng trở lại 👋
        </h2>
        <p className="text-zinc-500 text-sm">
          Đây là tổng quan hoạt động hệ thống Cinema Ticket Booking.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      {/* Two-column: Recent Invoices + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Invoices */}
        <div className="lg:col-span-3 rounded-2xl border border-white/5 overflow-hidden" style={{ background: '#1A1A1A' }}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#CF0F47]" /> Hóa đơn gần nhất
            </h3>
            <Link to="/admin/bookings" className="text-xs text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
              Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-white/5">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
                  <div className="w-10 h-10 rounded-lg bg-white/5 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-2.5 bg-white/5 rounded w-1/2" />
                    <div className="h-2 bg-white/5 rounded w-1/3" />
                  </div>
                </div>
              ))
            ) : recentInvoices.length === 0 ? (
              <div className="px-6 py-8 text-center text-zinc-600 text-sm">Chưa có hóa đơn nào.</div>
            ) : (
              recentInvoices.map((inv) => (
                <div key={inv.invoiceId} className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-white/3 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                      <Ticket className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-xs font-semibold truncate">
                        #{inv.invoiceId} · {inv.showtime?.movieName || 'Phim'}
                      </p>
                      <p className="text-zinc-500 text-[11px] truncate">
                        {inv.showtime?.date || ''} {inv.showtime?.startTime || ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-white text-xs font-bold">
                      {Number(inv.totalAmount || 0).toLocaleString('vi-VN')} đ
                    </span>
                    <StatusBadge status={inv.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 rounded-2xl border border-white/5 p-6" style={{ background: '#1A1A1A' }}>
          <h3 className="text-white font-semibold text-sm mb-5 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#CF0F47]" /> Thao tác nhanh
          </h3>
          <div className="space-y-2.5">
            {[
              { label: 'Thêm phim mới', to: '/admin/movies', color: '#CF0F47' },
              { label: 'Tạo suất chiếu', to: '/admin/showtimes', color: '#3B82F6' },
              { label: 'Xem hóa đơn', to: '/admin/bookings', color: '#10B981' },
              { label: 'Báo cáo doanh thu', to: '/admin/reports', color: '#F59E0B' },
              { label: 'Quản lý người dùng', to: '/admin/users', color: '#8B5CF6' },
            ].map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-medium text-white border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: link.color }} />
                  {link.label}
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
