// Trang Tổng quan Admin – placeholder UI, chưa có dữ liệu thực
export default function AdminDashboard() {
  const statCards = [
    {
      id: 'total-movies',
      label: 'Tổng số Phim',
      value: '--',
      sub: 'Chưa có dữ liệu',
      color: '#CF0F47',
      bg: 'rgba(207,15,71,0.08)',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M7 4v16M17 4v16M2 9h5M17 9h5M2 15h5M17 15h5" />
        </svg>
      ),
    },
    {
      id: 'tickets-today',
      label: 'Vé bán hôm nay',
      value: '--',
      sub: 'Chưa có dữ liệu',
      color: '#3B82F6',
      bg: 'rgba(59,130,246,0.08)',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M2 9a2 2 0 012-2h16a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V9z" />
          <circle cx="12" cy="12" r="1" />
          <path d="M7 12h.01M17 12h.01" />
        </svg>
      ),
    },
    {
      id: 'revenue',
      label: 'Doanh thu tháng',
      value: '--',
      sub: 'Chưa có dữ liệu',
      color: '#10B981',
      bg: 'rgba(16,185,129,0.08)',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      ),
    },
    {
      id: 'users',
      label: 'Người dùng',
      value: '--',
      sub: 'Chưa có dữ liệu',
      color: '#F59E0B',
      bg: 'rgba(245,158,11,0.08)',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      ),
    },
  ];

  const quickLinks = [
    { label: 'Thêm phim mới', to: '/admin/movies', color: '#CF0F47' },
    { label: 'Xem danh sách phim', to: '/admin/movies', color: '#3B82F6' },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-white font-bold mb-1" style={{ fontSize: '22px' }}>
          Chào mừng trở lại! 👋
        </h2>
        <p className="text-zinc-500 text-sm">
          Đây là trang tổng quan hệ thống. Dữ liệu thống kê sẽ hiển thị khi tích hợp đầy đủ.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div
            key={card.id}
            id={`stat-card-${card.id}`}
            className="rounded-2xl border border-white/5 p-5 flex items-start gap-4 transition-all hover:border-white/10 hover:-translate-y-0.5 duration-200"
            style={{ background: '#1A1A1A' }}
          >
            {/* Icon */}
            <div
              className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: card.bg, color: card.color }}
            >
              {card.icon}
            </div>
            {/* Info */}
            <div className="min-w-0">
              <p className="text-zinc-400 text-xs mb-1 truncate">{card.label}</p>
              <p className="text-white font-bold text-2xl leading-none mb-1">{card.value}</p>
              <p className="text-zinc-600 text-xs truncate">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column: Chart placeholder + Recent activity placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {/* Chart placeholder */}
        <div
          className="lg:col-span-2 rounded-2xl border border-white/5 p-6"
          style={{ background: '#1A1A1A' }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-semibold text-sm mb-0.5">Doanh thu theo tháng</h3>
              <p className="text-zinc-600 text-xs">Chưa có dữ liệu</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full border border-white/10 text-zinc-500">2026</span>
          </div>
          {/* Skeleton bars */}
          <div className="flex items-end gap-2 h-40">
            {['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'].map((m, i) => (
              <div key={m} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md"
                  style={{
                    height: `${20 + Math.sin(i * 0.8) * 15 + 20}%`,
                    background: 'rgba(255,255,255,0.04)',
                    minHeight: '8px',
                  }}
                />
                <span className="text-zinc-700 text-xs">{m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity placeholder */}
        <div
          className="rounded-2xl border border-white/5 p-6"
          style={{ background: '#1A1A1A' }}
        >
          <h3 className="text-white font-semibold text-sm mb-5">Hoạt động gần đây</h3>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 shrink-0 animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div
                    className="h-2.5 rounded-full bg-white/5 animate-pulse"
                    style={{ width: `${60 + i * 5}%` }}
                  />
                  <div className="h-2 rounded-full bg-white/4 w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
          <p className="text-zinc-700 text-xs text-center mt-5">Chưa có dữ liệu hoạt động</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div
        className="rounded-2xl border border-white/5 p-6"
        style={{ background: '#1A1A1A' }}
      >
        <h3 className="text-white font-semibold text-sm mb-4">Thao tác nhanh</h3>
        <div className="flex flex-wrap gap-3">
          {quickLinks.map((link) => (
            <a
              key={link.label}
              href={link.to}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 hover:-translate-y-0.5 duration-150"
              style={{ background: link.color }}
            >
              {link.label}
            </a>
          ))}
          <div
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-600 border border-white/5 cursor-not-allowed select-none"
          >
            Xem báo cáo
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ background: '#1f1f1f', color: '#444', fontSize: '10px' }}
            >
              Sắp ra
            </span>
          </div>
        </div>
      </div>

      {/* Coming soon notice */}
      <div
        className="mt-6 rounded-2xl border border-dashed border-white/10 p-6 text-center"
        style={{ background: 'rgba(255,255,255,0.01)' }}
      >
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-zinc-500">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>
        <p className="text-zinc-400 text-sm font-medium mb-1">Dashboard đang được phát triển</p>
        <p className="text-zinc-600 text-xs">Các số liệu thống kê sẽ hiển thị sau khi tích hợp đầy đủ với Backend API.</p>
      </div>
    </div>
  );
}
