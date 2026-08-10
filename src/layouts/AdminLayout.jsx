import { useState } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// ─── Navigation groups ──────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: 'Chính',
    items: [
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
    ],
  },
  {
    label: 'Nội dung',
    items: [
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
      {
        label: 'Thể loại phim',
        to: '/admin/genres',
        end: false,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01" />
          </svg>
        ),
      },
      {
        label: 'Sự kiện',
        to: '/admin/events',
        end: false,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M19 4H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM16 2v4M8 2v4M3 10h18" />
            <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Rạp chiếu',
    items: [
      {
        label: 'Phòng chiếu',
        to: '/admin/halls',
        end: false,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
          </svg>
        ),
      },
      {
        label: 'Suất chiếu',
        to: '/admin/showtimes',
        end: false,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
        ),
      },
      {
        label: 'Bảng giá vé',
        to: '/admin/pricing',
        end: false,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
          </svg>
        ),
      },
      {
        label: 'Loại ghế',
        to: '/admin/seat-types',
        end: false,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M20 9V7a2 2 0 00-2-2H6a2 2 0 00-2 2v2" />
            <path d="M2 9h20v6H2z" />
            <path d="M6 15v4M18 15v4" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Kinh doanh',
    items: [
      {
        label: 'Đặt vé & Hóa đơn',
        to: '/admin/bookings',
        end: false,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M2 9a2 2 0 012-2h16a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V9z" />
            <circle cx="12" cy="12" r="1" />
            <path d="M7 12h.01M17 12h.01" />
          </svg>
        ),
      },
      {
        label: 'Bắp nước (F&B)',
        to: '/admin/products',
        end: false,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
          </svg>
        ),
      },
      {
        label: 'Loại khán giả',
        to: '/admin/audience-types',
        end: false,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <circle cx="9" cy="7" r="4" />
            <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
            <circle cx="19" cy="7" r="2" />
            <path d="M23 21v-1a3 3 0 00-3-3" />
          </svg>
        ),
      },
      {
        label: 'Phương thức thanh toán',
        to: '/admin/payment-methods',
        end: false,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Người dùng',
    items: [
      {
        label: 'Tài khoản',
        to: '/admin/users',
        end: false,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        ),
      },
      {
        label: 'Đánh giá & Bình luận',
        to: '/admin/comments',
        end: false,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Phân tích',
    items: [
      {
        label: 'Báo cáo & Thống kê',
        to: '/admin/reports',
        end: false,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M18 20V10M12 20V4M6 20v-6" />
          </svg>
        ),
      },
    ],
  },
];

// ─── Page title map ────────────────────────────────────────────────────
const PAGE_TITLES = {
  '/admin': 'Tổng quan hệ thống',
  '/admin/movies': 'Quản lý Phim',
  '/admin/genres': 'Quản lý Thể loại phim',
  '/admin/events': 'Quản lý Sự kiện',
  '/admin/halls': 'Quản lý Phòng chiếu',
  '/admin/showtimes': 'Quản lý Suất chiếu',
  '/admin/pricing': 'Quản lý Bảng giá vé',
  '/admin/seat-types': 'Quản lý Loại ghế',
  '/admin/bookings': 'Quản lý Đặt vé & Hóa đơn',
  '/admin/products': 'Quản lý Bắp nước & F&B',
  '/admin/audience-types': 'Quản lý Loại khán giả',
  '/admin/payment-methods': 'Quản lý Phương thức thanh toán',
  '/admin/users': 'Quản lý Tài khoản người dùng',
  '/admin/comments': 'Quản lý Đánh giá & Bình luận',
  '/admin/reports': 'Báo cáo & Thống kê',
};

const PAGE_SUBTITLES = {
  '/admin': 'Thống kê & hoạt động gần đây',
  '/admin/movies': 'Thêm, sửa, xóa phim đang chiếu và sắp ra mắt',
  '/admin/genres': 'Danh mục phân loại thể loại điện ảnh',
  '/admin/events': 'Khuyến mãi, sự kiện đặc biệt tại rạp',
  '/admin/halls': 'Sơ đồ ghế và cấu hình phòng chiếu',
  '/admin/showtimes': 'Lịch chiếu phim và giờ chiếu',
  '/admin/pricing': 'Giá vé cơ bản và phụ thu theo loại ghế/phòng',
  '/admin/seat-types': 'Cấu hình loại ghế, phụ thu và hình ảnh minh hoạ',
  '/admin/bookings': 'Tra cứu hóa đơn và trạng thái thanh toán',
  '/admin/products': 'Combos bắp rang, nước uống, đồ ăn vặt',
  '/admin/audience-types': 'Người lớn, trẻ em, học sinh, sinh viên...',
  '/admin/payment-methods': 'VNPay, MoMo, ZaloPay, tiền mặt và phụ phí',
  '/admin/users': 'Phân quyền và quản lý trạng thái tài khoản',
  '/admin/comments': 'Kiểm duyệt đánh giá và bình luận phim',
  '/admin/reports': 'Doanh thu và xu hướng kinh doanh',
};

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const user = useAuthStore(state => state.user);

  const currentTitle = PAGE_TITLES[location.pathname] || 'Admin';
  const currentSubtitle = PAGE_SUBTITLES[location.pathname] || '';

  const adminName = user?.fullName || user?.name || user?.email?.split('@')[0] || 'Admin';
  const adminInitial = adminName.charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen" style={{ background: '#0A0A0A' }}>
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        className="flex flex-col sticky top-0 h-screen transition-all duration-300 ease-in-out shrink-0 border-r border-white/5"
        style={{
          width: collapsed ? '68px' : '232px',
          background: '#0D0D0D',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center h-16 border-b border-white/5 shrink-0 overflow-hidden"
          style={{ padding: collapsed ? '0 14px' : '0 16px' }}
        >
          <Link
            to="/"
            className="flex items-center gap-2.5 min-w-0 group"
            title="Về trang chủ"
          >
            <img
              src="/images/logo.png"
              alt="Cinema Logo"
              className="h-6 w-auto object-contain shrink-0 transition-transform group-hover:scale-105"
            />
            {!collapsed && (
              <span
                className="font-black text-white truncate"
                style={{ fontSize: '14px', letterSpacing: '0.08em' }}
              >
                CINEMA
              </span>
            )}
          </Link>

          {!collapsed && <div className="flex-1" />}
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Mở rộng sidebar' : 'Thu nhỏ sidebar'}
            className="ml-auto shrink-0 text-zinc-600 hover:text-white transition-colors p-1.5 rounded-md hover:bg-white/5 cursor-pointer"
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

        {/* Nav groups */}
        <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/5">
          {NAV_GROUPS.map((group, gi) => (
            <div key={group.label} className={gi > 0 ? 'mt-4' : ''}>
              {!collapsed && (
                <p className="px-4 mb-1 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                  {group.label}
                </p>
              )}
              {collapsed && gi > 0 && (
                <div className="border-t border-white/5 mx-3 mb-3" />
              )}
              <ul className="space-y-0.5 px-2">
                {group.items.map((item) => (
                  <NavItem key={item.to} item={item} collapsed={collapsed} />
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Bottom: Back to site */}
        <div className="border-t border-white/5 p-2 shrink-0">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all overflow-hidden"
            title={collapsed ? 'Về trang chủ' : undefined}
          >
            <span className="shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M10 19l-7-7 7-7M3 12h18" />
              </svg>
            </span>
            {!collapsed && (
              <span className="text-xs whitespace-nowrap">Về trang chủ</span>
            )}
          </Link>
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header
          className="sticky top-0 z-40 flex items-center justify-between h-16 px-6 border-b border-white/5 shrink-0"
          style={{ background: 'rgba(10,10,10,0.90)', backdropFilter: 'blur(16px)' }}
        >
          {/* Page title */}
          <div>
            <h1 className="text-white font-bold leading-tight" style={{ fontSize: '16px' }}>
              {currentTitle}
            </h1>
            {currentSubtitle && (
              <p className="text-zinc-500" style={{ fontSize: '11px', marginTop: '1px' }}>
                {currentSubtitle}
              </p>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Divider */}
            <div className="h-5 w-px bg-white/10 mx-1" />

            {/* Admin avatar */}
            <div className="flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded-xl">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0"
                style={{ background: 'linear-gradient(135deg, #CF0F47 0%, #8B0B30 100%)' }}
              >
                {adminInitial}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-white text-xs font-semibold leading-tight truncate max-w-[110px]">{adminName}</p>
                <p className="text-zinc-500" style={{ fontSize: '11px' }}>Quản trị viên</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto" style={{ background: '#111111' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// ── NavItem component ──────────────────────────────────────────────────
function NavItem({ item, collapsed }) {
  return (
    <li>
      <NavLink
        to={item.to}
        end={item.end}
        title={collapsed ? item.label : undefined}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 overflow-hidden group ${
            isActive
              ? 'text-white'
              : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
          }`
        }
        style={({ isActive }) =>
          isActive
            ? { background: 'rgba(207, 15, 71, 0.12)', boxShadow: 'inset 2px 0 0 #CF0F47' }
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
              <span className="text-xs whitespace-nowrap font-medium">{item.label}</span>
            )}
          </>
        )}
      </NavLink>
    </li>
  );
}
