import { useState } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';

// ─── Navigation items – dễ mở rộng thêm sau ───────────────────────────
const NAV_ITEMS = [
  {
    label: 'Tổng quan',
    to: '/admin',
    end: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: 'Quản lý Phim',
    to: '/admin/movies',
    end: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M7 4v16M17 4v16M2 9h5M17 9h5M2 15h5M17 15h5" />
      </svg>
    ),
  },
  // ── Placeholder cho các module tương lai ──
  {
    label: 'Quản lý Suất chiếu',
    to: '/admin/showtimes',
    end: false,
    disabled: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    label: 'Quản lý Đặt vé',
    to: '/admin/bookings',
    end: false,
    disabled: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M2 9a2 2 0 012-2h16a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V9z" />
        <circle cx="12" cy="12" r="1" />
        <path d="M7 12h.01M17 12h.01" />
      </svg>
    ),
  },
  {
    label: 'Quản lý Người dùng',
    to: '/admin/users',
    end: false,
    disabled: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    label: 'Báo cáo & Thống kê',
    to: '/admin/reports',
    end: false,
    disabled: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
  },
];

// ─── Page title map ────────────────────────────────────────────────────
const PAGE_TITLES = {
  '/admin': 'Tổng quan',
  '/admin/movies': 'Quản lý Phim',
  '/admin/showtimes': 'Quản lý Suất chiếu',
  '/admin/bookings': 'Quản lý Đặt vé',
  '/admin/users': 'Quản lý Người dùng',
  '/admin/reports': 'Báo cáo & Thống kê',
};

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const currentTitle = PAGE_TITLES[location.pathname] || 'Admin';

  return (
    <div className="flex min-h-screen" style={{ background: '#0D0D0D' }}>
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        className="flex flex-col sticky top-0 h-screen transition-all duration-300 ease-in-out shrink-0 border-r border-white/5"
        style={{
          width: collapsed ? '72px' : '240px',
          background: 'linear-gradient(180deg, #0D0D0D 0%, #111111 100%)',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center h-16 border-b border-white/5 shrink-0 overflow-hidden"
          style={{ padding: collapsed ? '0 18px' : '0 20px' }}
        >
          <Link
            to="/"
            className="flex items-center gap-3 min-w-0"
            title="Về trang chủ"
          >
            {/* Icon logo */}
            <span
              className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
              style={{ background: '#CF0F47', color: '#fff', letterSpacing: '-0.5px' }}
            >
              C
            </span>
            {!collapsed && (
              <span
                className="font-black text-white truncate tracking-wide"
                style={{ fontSize: '15px', letterSpacing: '0.05em' }}
              >
                CINEMA
              </span>
            )}
          </Link>

          {/* Spacer + collapse toggle */}
          {!collapsed && <div className="flex-1" />}
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Mở rộng sidebar' : 'Thu nhỏ sidebar'}
            className="ml-auto shrink-0 text-zinc-500 hover:text-white transition-colors p-1.5 rounded-md hover:bg-white/5 cursor-pointer"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 transition-transform duration-300"
              style={{ transform: collapsed ? 'rotate(180deg)' : 'none' }}
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
          {/* Section: Main */}
          {!collapsed && (
            <p className="px-5 mb-2 text-xs font-semibold text-zinc-600 uppercase tracking-widest">
              Chính
            </p>
          )}
          <ul className="space-y-0.5 px-2">
            {NAV_ITEMS.slice(0, 2).map((item) => (
              <NavItem key={item.to} item={item} collapsed={collapsed} />
            ))}
          </ul>

          {/* Section: Mở rộng */}
          <div className="mt-5">
            {!collapsed && (
              <p className="px-5 mb-2 text-xs font-semibold text-zinc-600 uppercase tracking-widest">
                Mở rộng
              </p>
            )}
            {collapsed && <div className="border-t border-white/5 my-3" />}
            <ul className="space-y-0.5 px-2">
              {NAV_ITEMS.slice(2).map((item) => (
                <NavItem key={item.to} item={item} collapsed={collapsed} />
              ))}
            </ul>
          </div>
        </nav>

        {/* Bottom: Back to site */}
        <div className="border-t border-white/5 p-2 shrink-0">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all group overflow-hidden"
          >
            <span className="shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M10 19l-7-7 7-7M3 12h18" />
              </svg>
            </span>
            {!collapsed && (
              <span className="text-sm whitespace-nowrap">Về trang chủ</span>
            )}
          </Link>
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header
          className="sticky top-0 z-40 flex items-center justify-between h-16 px-6 border-b border-white/5 shrink-0"
          style={{ background: 'rgba(13,13,13,0.85)', backdropFilter: 'blur(12px)' }}
        >
          {/* Page title */}
          <div>
            <h1 className="text-white font-semibold" style={{ fontSize: '17px' }}>
              {currentTitle}
            </h1>
            <p className="text-zinc-500" style={{ fontSize: '12px' }}>
              Cinema Admin Portal
            </p>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <button className="relative p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all cursor-pointer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: '#CF0F47' }} />
            </button>

            {/* Divider */}
            <div className="h-5 w-px bg-white/10" />

            {/* Admin avatar */}
            <button className="flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded-xl hover:bg-white/5 transition-all cursor-pointer">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm"
                style={{ background: 'linear-gradient(135deg, #CF0F47 0%, #8B0B30 100%)' }}
              >
                A
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-white text-xs font-semibold leading-tight">Admin</p>
                <p className="text-zinc-500" style={{ fontSize: '11px' }}>Quản trị viên</p>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-zinc-500 ml-1 hidden sm:block">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto" style={{ background: '#121212' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// ── NavItem component ──────────────────────────────────────────────────
function NavItem({ item, collapsed }) {
  if (item.disabled) {
    return (
      <li>
        <div
          title={collapsed ? item.label : undefined}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-700 cursor-not-allowed select-none overflow-hidden"
        >
          <span className="shrink-0">{item.icon}</span>
          {!collapsed && (
            <span className="text-sm whitespace-nowrap flex-1">{item.label}</span>
          )}
          {!collapsed && (
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ background: '#1a1a1a', color: '#555', fontSize: '10px' }}
            >
              Sắp ra
            </span>
          )}
        </div>
      </li>
    );
  }

  return (
    <li>
      <NavLink
        to={item.to}
        end={item.end}
        title={collapsed ? item.label : undefined}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 overflow-hidden group ${
            isActive
              ? 'text-white'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`
        }
        style={({ isActive }) =>
          isActive
            ? { background: 'rgba(207, 15, 71, 0.15)', boxShadow: 'inset 2px 0 0 #CF0F47' }
            : {}
        }
      >
        {({ isActive }) => (
          <>
            <span
              className="shrink-0 transition-colors"
              style={{ color: isActive ? '#CF0F47' : undefined }}
            >
              {item.icon}
            </span>
            {!collapsed && (
              <span className="text-sm whitespace-nowrap font-medium">{item.label}</span>
            )}
          </>
        )}
      </NavLink>
    </li>
  );
}
