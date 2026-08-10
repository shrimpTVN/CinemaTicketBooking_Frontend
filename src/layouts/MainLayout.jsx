import { useState } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import TrailerModal from '../components/TrailerModal';
import AIChatbotWidget from '../components/AIChatbotWidget';
import { useAuthStore } from '../store/authStore';
import { getAllMovies } from '../services/movieService';
import { Search, Bell, CircleUser, ChevronDown, Menu, X, History, LogOut, LayoutDashboard, MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function MainLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allMovies, setAllMovies] = useState([]);

  const handleSearchToggle = async () => {
    const nextState = !searchOpen;
    setSearchOpen(nextState);
    if (nextState) {
      setIsProfileDropdownOpen(false);
    }
    if (nextState && allMovies.length === 0) {
      try {
        const movies = await getAllMovies();
        setAllMovies(movies);
      } catch (err) {
        console.error('Failed to load movies for header search', err);
      }
    }
  };

  const toggleMobileMenu = async () => {
    const nextState = !isMenuOpen;
    setIsMenuOpen(nextState);
    if (nextState && allMovies.length === 0) {
      try {
        const movies = await getAllMovies();
        setAllMovies(movies);
      } catch (err) {
        console.error('Failed to load movies for mobile search', err);
      }
    }
  };

  const removeDiacritics = (str) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  };

  const filteredMovies = searchQuery.trim() === ''
    ? []
    : allMovies.filter((movie) => {
      const cleanTitle = removeDiacritics(movie.title.toLowerCase());
      const cleanQuery = removeDiacritics(searchQuery.toLowerCase());
      return cleanTitle.includes(cleanQuery);
    });

  // Hàm tạo className cho NavLink: Chỉ gạch chân màu đỏ (border-cta), chữ hoạt động là trắng (text-text-main), chữ không chọn sẽ xám (text-text-sub3)
  const getNavLinkClass = ({ isActive }) =>
    `pb-1 border-b-2 font-medium transition-colors text-body2 ${isActive
      ? 'border-cta text-text-main'
      : 'border-transparent text-text-sub3 hover:text-text-main'
    }`;

  // Hàm tạo className cho mobile NavLink
  const getMobileNavLinkClass = ({ isActive }) =>
    `w-full text-center py-2.5 text-body2 font-medium transition-colors ${isActive
      ? 'text-cta bg-zinc-900'
      : 'text-text-sub1 hover:text-text-main hover:bg-zinc-900'
    }`;

  return (
    <div className="flex flex-col min-h-screen bg-bg-dark text-text-main">
      <header className="bg-bg-dark border-b border-[#222222] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between relative">

          {/* Left Side: Logo & Mobile Mua Ngay */}
          <div className="flex items-center space-x-3">
            {/* Logo */}
            <Link to="/" className="flex items-center group">
              <img
                src="/images/logo.png"
                alt="Cinema Logo"
                className="h-6 md:h-7 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>

            {/* Mobile Mua ngay Button */}
            <NavLink
              to="/booking"
              className="md:hidden relative bg-cta text-text-main text-[11px] px-3.5 py-1 font-bold hover:bg-opacity-90 transition-all flex items-center justify-center overflow-visible select-none cursor-pointer"
            >
              {/* Left Cutout */}
              <span className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-bg-dark rounded-full"></span>
              {/* Right Cutout */}
              <span className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-bg-dark rounded-full"></span>
              Mua ngay
            </NavLink>
          </div>

          {/* Centered Navigation (perfectly centered on desktop using absolute positioning) */}
          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center space-x-8 z-30">
            {/* Ticket-shaped Mua ngay Button */}
            <NavLink
              to="/booking"
              className="relative bg-cta text-text-main text-body3 px-5 py-1.5 font-bold hover:bg-opacity-90 transition-all flex items-center justify-center overflow-visible select-none cursor-pointer"
            >
              {/* Left Cutout */}
              <span className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-bg-dark rounded-full"></span>
              {/* Right Cutout */}
              <span className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-bg-dark rounded-full"></span>
              Mua ngay
            </NavLink>

            <NavLink to="/" className={getNavLinkClass} end>
              Trang chủ
            </NavLink>
            <NavLink to="/movies" className={getNavLinkClass}>
              Phim
            </NavLink>
            <NavLink to="/hall" className={getNavLinkClass}>
              Phòng chiếu
            </NavLink>
            <NavLink to="/events" className={getNavLinkClass}>
              Sự kiện
            </NavLink>
          </nav>

          {/* Right Header: Search, Bell, Sign In, Sign Up on Desktop; Hamburger on Mobile */}
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-5">
            {/* Search Icon (Desktop only) */}
            <button
              onClick={handleSearchToggle}
              className={`hidden md:block transition-colors cursor-pointer ${searchOpen ? 'text-cta' : 'text-text-sub3 hover:text-text-main'}`}
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notification Bell (Desktop only) */}
            <button className="hidden md:flex items-center justify-center w-9 h-9 text-text-sub3 hover:text-text-main transition-colors relative cursor-pointer">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-cta rounded-full"></span>
            </button>

            {/* Vertical Divider (Desktop only) */}
            <span className="hidden md:block h-5 w-px bg-zinc-800"></span>

            {/* Auth Section (Desktop only) */}
            <div className="hidden md:block">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => {
                      const nextState = !isProfileDropdownOpen;
                      setIsProfileDropdownOpen(nextState);
                      if (nextState) {
                        setSearchOpen(false);
                      }
                    }}
                    className={`transition-colors cursor-pointer flex items-center justify-center h-9 space-x-2 text-body3 font-bold ${isProfileDropdownOpen ? 'text-cta' : 'text-text-sub1 hover:text-text-main'}`}
                  >
                    <CircleUser className="w-6 h-6 text-text-sub3" strokeWidth={1.5} />
                    <span className="max-w-[100px] truncate">{user.fullName}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-text-sub3 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180 text-cta' : ''}`} />
                  </button>

                  {isProfileDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsProfileDropdownOpen(false)}></div>
                      <div className="absolute right-0 mt-2.5 w-48 bg-zinc-900 border border-zinc-800 rounded shadow-xl py-1.5 z-50 animate-slide-down">
                        <Link
                          to="/profile?tab=info"
                          state={{ activeTab: 'info' }}
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-body3 text-text-sub2 hover:text-text-main hover:bg-zinc-800 transition-colors"
                        >
                          <CircleUser className="w-4 h-4 text-text-sub3" strokeWidth={1.5} />
                          Thông tin cá nhân
                        </Link>
                        <Link
                          to="/profile?tab=history"
                          state={{ activeTab: 'history' }}
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-body3 text-text-sub2 hover:text-text-main hover:bg-zinc-800 transition-colors border-t border-zinc-800"
                        >
                          <History className="w-4 h-4 text-text-sub3" />
                          Lịch sử giao dịch
                        </Link>
                        {user.role === 'ADMIN' && (
                          <Link
                            to="/admin"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-body3 text-cta hover:text-cta-light hover:bg-zinc-800 transition-colors border-t border-zinc-800 font-bold"
                          >
                            <LayoutDashboard className="w-4 h-4 text-cta" />
                            Dashboard
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            logout();
                            navigate('/');
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-body3 text-red-400 hover:text-red-300 hover:bg-zinc-800 transition-colors text-left cursor-pointer border-t border-zinc-800"
                        >
                          <LogOut className="w-4 h-4" />
                          Đăng xuất
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login" className="flex items-center justify-center h-9 text-body3 text-text-sub3 hover:text-text-main font-bold transition-colors">
                    Đăng nhập
                  </Link>
                  <Link to="/register" className="text-body3 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 text-text-main px-3.5 py-1.5 rounded font-bold transition-colors">
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>

            {/* Hamburger Button (Far right, visible on mobile only) */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden flex items-center justify-center w-9 h-9 text-text-sub3 hover:text-text-main focus:outline-hidden cursor-pointer"
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 animate-slide-down" />
              ) : (
                <Menu className="w-6 h-6 animate-slide-down" />
              )}
            </button>
          </div>

          {/* Search Expandable Bar Overlay */}
          {searchOpen && (
            <div className="absolute right-4 top-16 z-[9999] p-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm phim..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  className={`h-10 bg-white text-zinc-900 px-4 pr-10 rounded-lg shadow-2xl border border-zinc-200 focus:border-zinc-300 outline-none focus:outline-none transition-all duration-300 ${searchFocused ? 'w-[75vw] sm:w-80' : 'w-[45vw] sm:w-48'
                    }`}
                  autoFocus
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                  <Search className="w-4 h-4" />
                </span>

                {/* Search Suggestions Dropdown */}
                {searchQuery.trim() !== '' && (
                  <div className="absolute right-0 mt-2 w-80 bg-[#18181b] border border-white/10 rounded-xl shadow-2xl max-h-72 overflow-y-auto z-[1000] custom-scrollbar animate-slide-down">
                    {filteredMovies.length === 0 ? (
                      <div className="p-4 text-center text-body3 text-text-sub3">
                        Không tìm thấy phim nào
                      </div>
                    ) : (
                      <div className="py-1">
                        {filteredMovies.map((movie) => (
                          <Link
                            key={movie.id}
                            to={`/movies/${movie.id}`}
                            onClick={() => {
                              setSearchOpen(false);
                              setSearchQuery('');
                            }}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/8 transition-colors text-left"
                          >
                            <div className="w-10 h-14 rounded bg-zinc-800 overflow-hidden flex-shrink-0 border border-white/10">
                              {(movie.posterUrl || movie.poster || movie.avatar) ? (
                                <img src={movie.posterUrl || movie.poster || movie.avatar} alt={movie.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500 text-xs">🎬</div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-body3 font-bold text-text-main truncate">{movie.title}</div>
                              <div className="text-[11px] text-text-sub3 truncate mt-0.5">{movie.genre?.join(', ') || 'Hành động'}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Navigation Dropdown Menu */}
        {isMenuOpen && (
          <nav className="md:hidden absolute top-16 left-0 w-full bg-[#0d0d0e]/95 backdrop-blur-xl border-b border-zinc-800 flex flex-col py-4 z-40 animate-slide-down max-h-[calc(100vh-4rem)] overflow-y-auto shadow-2xl">
            <div className="flex flex-col w-full px-4 space-y-3">
              {/* Mobile Search Input */}
              <div className="relative w-full mb-1">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Tìm kiếm phim..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-9 pr-8 bg-zinc-900/90 border border-zinc-800 text-text-main rounded-lg text-body3 placeholder-zinc-500 focus:outline-hidden focus:border-cta transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-white cursor-pointer"
                    aria-label="Xóa từ khóa"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* Mobile Search Suggestions Dropdown */}
                {searchQuery.trim() !== '' && (
                  <div className="absolute left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl max-h-60 overflow-y-auto z-[1000] custom-scrollbar animate-slide-down">
                    {filteredMovies.length === 0 ? (
                      <div className="p-3 text-center text-body3 text-text-sub3">
                        Không tìm thấy phim nào
                      </div>
                    ) : (
                      <div className="py-1">
                        {filteredMovies.map((movie) => (
                          <Link
                            key={movie.id}
                            to={`/movies/${movie.id}`}
                            onClick={() => {
                              setIsMenuOpen(false);
                              setSearchQuery('');
                            }}
                            className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-800 transition-colors text-left"
                          >
                            <div className="w-8 h-11 rounded bg-zinc-250 overflow-hidden flex-shrink-0">
                              {(movie.posterUrl || movie.poster || movie.avatar) ? (
                                <img src={movie.posterUrl || movie.poster || movie.avatar} alt={movie.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-zinc-350 flex items-center justify-center text-zinc-500 text-[10px]">🎬</div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-body3 font-bold text-text-main truncate">{movie.title}</div>
                              <div className="text-[10px] text-text-sub3 truncate">{movie.genre?.join(', ') || 'Hành động'}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation Links */}
              <div className="flex flex-col space-y-1">
                <NavLink to="/" className={getMobileNavLinkClass} onClick={() => setIsMenuOpen(false)} end>
                  Trang chủ
                </NavLink>
                <NavLink to="/movies" className={getMobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>
                  Phim
                </NavLink>
                <NavLink to="/hall" className={getMobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>
                  Phòng chiếu
                </NavLink>
                <NavLink to="/events" className={getMobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>
                  Sự kiện
                </NavLink>
              </div>

              {/* Divider */}
              <div className="w-full border-t border-zinc-800/80 my-1"></div>

              {/* Notifications Link */}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center justify-between py-2.5 px-3.5 text-body2 text-text-sub1 hover:text-text-main hover:bg-zinc-900/60 rounded-lg transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-4.5 h-4.5 text-text-sub3" />
                  <span>Thông báo</span>
                </div>
                <span className="w-2 h-2 bg-cta rounded-full"></span>
              </button>

              {/* User Account / Auth Section */}
              <div className="w-full border-t border-zinc-800/80 pt-2">
                {user ? (
                  <div className="w-full bg-zinc-900/70 border border-zinc-800 rounded-xl p-3 space-y-2">
                    {/* User Card Header */}
                    <div className="flex items-center gap-3 pb-2 border-b border-zinc-800/80 px-1">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                        <CircleUser className="w-5 h-5 text-white" strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <div className="text-body2 font-bold text-text-main truncate">{user.fullName || user.email?.split('@')[0]}</div>
                        <div className="text-[11px] text-text-sub3 truncate">{user.email}</div>
                      </div>
                    </div>

                    {/* Action Links */}
                    <div className="flex flex-col space-y-0.5 pt-0.5">
                      <Link
                        to="/profile?tab=info"
                        state={{ activeTab: 'info' }}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-2.5 py-2 text-body3 text-text-sub2 hover:text-text-main hover:bg-zinc-800/60 rounded-lg transition-colors"
                      >
                        <CircleUser className="w-4 h-4 text-text-sub3" strokeWidth={1.5} />
                        <span>Thông tin cá nhân</span>
                      </Link>

                      <Link
                        to="/profile?tab=history"
                        state={{ activeTab: 'history' }}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-2.5 py-2 text-body3 text-text-sub2 hover:text-text-main hover:bg-zinc-800/60 rounded-lg transition-colors"
                      >
                        <History className="w-4 h-4 text-text-sub3" />
                        <span>Lịch sử giao dịch</span>
                      </Link>

                      {user.role === 'ADMIN' && (
                        <Link
                          to="/admin"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-2.5 py-2 text-body3 text-cta font-bold hover:bg-zinc-800/60 rounded-lg transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-cta" />
                          <span>Dashboard Quản trị</span>
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          logout();
                          navigate('/');
                        }}
                        className="w-full flex items-center gap-3 px-2.5 py-2 text-body3 text-red-400 hover:text-red-300 hover:bg-zinc-800/60 rounded-lg transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2 pt-1 w-full">
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full py-2.5 text-center text-body2 font-bold text-text-main bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full py-2.5 text-center text-body2 font-bold text-text-main bg-cta hover:bg-opacity-90 rounded-lg transition-colors"
                    >
                      Đăng ký tài khoản
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      {/* ── Minimalist Clean Footer ───────────────────────────── */}
      <footer className="bg-[#09090b] border-t border-zinc-800/60 pt-12 pb-8 mt-20 text-zinc-400">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-zinc-800/40">
            {/* Column 1: Brand & Contact */}
            <div className="space-y-3 text-left">
              <Link to="/" className="inline-block group">
                <img
                  src="/images/logo.png"
                  alt="Cinema Logo"
                  className="h-7 w-auto object-contain transition-transform group-hover:scale-105"
                />
              </Link>
              <p className="text-xs text-zinc-400 leading-relaxed font-light">
                Hệ thống rạp chiếu phim hiện đại. Đặt vé xem phim trực tuyến nhanh chóng, tiện lợi.
              </p>
              <div className="text-xs space-y-1 text-zinc-400 pt-1">
                <p>Hotline: <span className="text-zinc-200 font-medium">1900 6868</span></p>
                <p>Email: <span className="text-zinc-200 font-medium">cskh@cinematicket.vn</span></p>
              </div>
            </div>

            {/* Column 2: Navigation */}
            <div className="text-left space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
                Khám phá
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/movies" className="hover:text-white transition-colors">
                    Phim đang chiếu & Sắp chiếu
                  </Link>
                </li>
                <li>
                  <Link to="/hall" className="hover:text-white transition-colors">
                    Hệ thống phòng chiếu
                  </Link>
                </li>
                <li>
                  <Link to="/events" className="hover:text-white transition-colors">
                    Sự kiện & Ưu đãi
                  </Link>
                </li>
                <li>
                  <Link to="/booking" className="hover:text-white transition-colors">
                    Đặt vé xem phim nhanh
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Policy & Support */}
            <div className="text-left space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
                Quy định & Hỗ trợ
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Điều khoản sử dụng
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Chính sách bảo mật thông tin
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Quy định vé & Khai báo độ tuổi
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Câu hỏi thường gặp (FAQ)
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Social */}
            <div className="text-left space-y-4">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 mb-3">
                  Theo dõi chúng tôi
                </h4>
                <div className="flex items-center gap-2.5">
                  <a
                    href="#"
                    aria-label="Facebook"
                    className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    aria-label="Youtube"
                    className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    aria-label="Instagram"
                    className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
            <p>© {new Date().getFullYear()} Logo Cinema. Tất cả quyền được bảo lưu.</p>
            <p className="text-zinc-500">Hệ thống đặt vé rạp chiếu phim trực tuyến</p>
          </div>
        </div>
      </footer>
      <TrailerModal />
      <AIChatbotWidget />
    </div>
  );
}
