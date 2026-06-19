import { useState } from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import TrailerModal from '../components/TrailerModal';

export default function MainLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Hàm tạo className cho NavLink: Chỉ gạch chân màu đỏ (border-cta), chữ hoạt động là trắng (text-text-main), chữ không chọn sẽ xám (text-text-sub3)
  const getNavLinkClass = ({ isActive }) => 
    `pb-1 border-b-2 font-medium transition-colors text-body2 ${
      isActive 
        ? 'border-cta text-text-main' 
        : 'border-transparent text-text-sub3 hover:text-text-main'
    }`;

  // Hàm tạo className cho mobile NavLink
  const getMobileNavLinkClass = ({ isActive }) => 
    `w-full text-center py-2.5 text-body2 font-medium transition-colors ${
      isActive 
        ? 'text-cta bg-zinc-900' 
        : 'text-text-sub1 hover:text-text-main hover:bg-zinc-900'
    }`;

  return (
    <div className="flex flex-col min-h-screen bg-bg-dark text-text-main">
      <header className="bg-bg-dark border-b border-[#222222] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between relative">
          
          {/* Left Side: Hamburger & Logo */}
          <div className="flex items-center space-x-3">
            {/* Hamburger Button (Left of Logo, visible on mobile only) */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-text-sub3 hover:text-text-main p-1.5 focus:outline-hidden cursor-pointer"
              aria-label="Toggle Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Logo */}
            <Link to="/" className="text-heading2 text-cta tracking-wider uppercase font-bold">
              LOGO
            </Link>
          </div>
          
          {/* Centered Navigation (perfectly centered on desktop using absolute positioning) */}
          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center space-x-8 z-30">
            {/* Ticket-shaped Mua ngay Button */}
            <NavLink 
              to="/booking" 
              className="relative bg-cta text-text-main text-body3 px-5 py-1.5 font-bold uppercase hover:bg-opacity-90 transition-all flex items-center justify-center overflow-visible select-none cursor-pointer"
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
            <NavLink to="/booking" className={getNavLinkClass}>
              Phòng chiếu
            </NavLink>
            <NavLink to="/news" className={getNavLinkClass}>
              Tin tức
            </NavLink>
          </nav>

          {/* Right Header: Search, Bell, Sign In, Sign Up */}
          <div className="flex items-center space-x-5">
            {/* Search Icon */}
            <button className="text-text-sub3 hover:text-text-main transition-colors cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            {/* Notification Bell */}
            <button className="text-text-sub3 hover:text-text-main transition-colors relative cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-0 right-0 w-2 h-2 bg-cta rounded-full"></span>
            </button>

            {/* Vertical Divider */}
            <span className="h-5 w-px bg-zinc-800"></span>

            {/* Auth Section (Avatar icon hidden) */}
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-body3 text-text-sub3 hover:text-text-main font-bold transition-colors uppercase">
                Đăng nhập
              </Link>
              <Link to="/" className="text-body3 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 text-text-main px-3.5 py-1.5 rounded font-bold transition-colors uppercase">
                Đăng ký
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Menu */}
        {isMenuOpen && (
          <nav className="md:hidden absolute top-16 left-0 w-full bg-bg-dark border-b border-[#222222] flex flex-col py-4 z-40">
            <div className="flex flex-col items-center w-full px-4 space-y-3">
              {/* Mobile Ticket Button */}
              <NavLink 
                to="/booking" 
                onClick={() => setIsMenuOpen(false)}
                className="relative bg-cta text-text-main text-body3 w-40 py-2.5 font-bold uppercase hover:bg-opacity-90 transition-all flex items-center justify-center overflow-visible select-none cursor-pointer"
              >
                <span className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-bg-dark rounded-full"></span>
                <span className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-bg-dark rounded-full"></span>
                Mua ngay
              </NavLink>

              <NavLink to="/" className={getMobileNavLinkClass} onClick={() => setIsMenuOpen(false)} end>
                Trang chủ
              </NavLink>
              <NavLink to="/movies" className={getMobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>
                Phim
              </NavLink>
              <NavLink to="/booking" className={getMobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>
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
