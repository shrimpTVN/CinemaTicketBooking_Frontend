import { useState } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import TrailerModal from '../components/TrailerModal';
import { useAuthStore } from '../store/authStore';
import { getAllMovies } from '../services/movieService';
import { Search, Bell, CircleUser, ChevronDown, Menu, X, History, LogOut, LayoutDashboard } from 'lucide-react';

export default function MainLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
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
            <Link to="/" className="text-heading2 text-cta tracking-wider uppercase font-bold">
              LOGO
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
            <NavLink to="/news" className={getNavLinkClass}>
              Tin tức
            </NavLink>
          </nav>

          {/* Right Header: Search, Bell, Sign In, Sign Up + Hamburger on Mobile */}
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-5">
            {/* Search Icon (Desktop only) */}
            <button
              onClick={handleSearchToggle}
              className={`hidden md:block transition-colors cursor-pointer ${searchOpen ? 'text-cta' : 'text-text-sub3 hover:text-text-main'}`}
            >
              <Search className="w-5 h-5" />
            </button>
            {/* Notification Bell */}
            <button className="flex items-center justify-center w-9 h-9 text-text-sub3 hover:text-text-main transition-colors relative cursor-pointer">
              <Bell className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              <span className="absolute top-2.5 right-2.5 sm:top-2 sm:right-2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cta rounded-full"></span>
            </button>

            {/* Vertical Divider */}
            <span className="hidden md:block h-5 w-px bg-zinc-800"></span>

            {/* Auth Section */}
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
                  className={`transition-colors cursor-pointer flex items-center justify-center h-9 space-x-1.5 sm:space-x-2 text-body3 font-bold ${isProfileDropdownOpen ? 'text-cta' : 'text-text-sub1 hover:text-text-main'}`}
                >
                  <CircleUser className="w-5 h-5 sm:w-6 sm:h-6 text-text-sub3" strokeWidth={1.5} />
                  <span className="hidden sm:inline max-w-[100px] truncate">{user.fullName}</span>
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
                          Trang quản trị (Admin)
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
              <div className="flex items-center space-x-2.5 sm:space-x-3">
                <Link to="/login" className="flex items-center justify-center h-9 text-body3 text-text-sub3 hover:text-text-main font-bold transition-colors">
                  Đăng nhập
                </Link>
                <Link to="/register" className="hidden md:block text-body3 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 text-text-main px-3.5 py-1.5 rounded font-bold transition-colors">
                  Đăng ký
                </Link>
              </div>
            )}

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
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-zinc-200 rounded-lg shadow-2xl max-h-72 overflow-y-auto z-[1000] custom-scrollbar animate-slide-down">
                    {filteredMovies.length === 0 ? (
                      <div className="p-4 text-center text-body3 text-zinc-500">
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
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-100 transition-colors text-left"
                          >
                            <div className="w-10 h-14 rounded bg-zinc-250 overflow-hidden flex-shrink-0">
                              {movie.poster ? (
                                <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-zinc-350 flex items-center justify-center text-zinc-500 text-xs">🎬</div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-body3 font-bold text-zinc-900 truncate">{movie.title}</div>
                              <div className="text-[11px] text-zinc-500 truncate">{movie.genre?.join(', ') || 'Hành động'}</div>
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
          <nav className="md:hidden absolute top-16 left-0 w-full bg-bg-dark border-b border-[#222222] flex flex-col py-4 z-40 animate-slide-down">
            <div className="flex flex-col items-center w-full px-4 space-y-3">
              {/* Mobile Search Input */}
              <div className="relative w-full max-w-[280px] mb-2">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Tìm kiếm phim..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-9 pr-8 bg-zinc-900 border border-zinc-800 text-text-main rounded-lg text-body3 placeholder-zinc-500 focus:outline-hidden focus:border-cta transition-colors"
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
                              {movie.poster ? (
                                <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
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

              <NavLink to="/" className={getMobileNavLinkClass} onClick={() => setIsMenuOpen(false)} end>
                Trang chủ
              </NavLink>
              <NavLink to="/movies" className={getMobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>
                Phim
              </NavLink>
              <NavLink to="/hall" className={getMobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>
                Phòng chiếu
              </NavLink>
              <NavLink to="/news" className={getMobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>
                Tin tức
              </NavLink>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-bg-dark border-t border-[#222222] py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="text-heading2 text-cta tracking-wider font-bold mb-4">LOGO</div>
            <p className="text-body3 text-text-sub3">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc scelerisque arcu et dui.
            </p>
          </div>
          <div>
            <h3 className="text-label-custom font-bold text-text-sub1 mb-4 uppercase">Information</h3>
            <ul className="space-y-2 text-body3 text-text-sub2">
              <li><Link to="/" className="hover:text-cta">About Us</Link></li>
              <li><Link to="/" className="hover:text-cta">Careers</Link></li>
              <li><Link to="/" className="hover:text-cta">Press</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-label-custom font-bold text-text-sub1 mb-4 uppercase">Help</h3>
            <ul className="space-y-2 text-body3 text-text-sub2">
              <li><Link to="/" className="hover:text-cta">FAQs</Link></li>
              <li><Link to="/" className="hover:text-cta">Terms of Service</Link></li>
              <li><Link to="/" className="hover:text-cta">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-label-custom font-bold text-text-sub1 mb-4 uppercase">Socials</h3>
            <ul className="space-y-2 text-body3 text-text-sub2">
              <li><a href="#" className="hover:text-cta">Facebook</a></li>
              <li><a href="#" className="hover:text-cta">Twitter</a></li>
              <li><a href="#" className="hover:text-cta">Instagram</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-[#222222] text-center text-body3 text-text-sub3">
          &copy; {new Date().getFullYear()} Logo Cinema. All rights reserved.
        </div>
      </footer>
      <TrailerModal />
    </div>
  );
}
