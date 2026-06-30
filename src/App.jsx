import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense, useState, useEffect } from 'react';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

const Home = lazy(() => import('./pages/Home'));
const MovieList = lazy(() => import('./pages/MovieList'));
const MovieDetail = lazy(() => import('./pages/MovieDetail'));
const Booking = lazy(() => import('./pages/Booking'));
const Register = lazy(() => import('./pages/Register'));
const Login = lazy(() => import('./pages/Login'));
const Profile = lazy(() => import('./pages/Profile'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminMovies = lazy(() => import('./pages/admin/AdminMovies'));

// Hall page
const Hall = lazy(() => import('./pages/Hall'));
const HallDetail = lazy(() => import('./pages/HallDetail'));

const Loader = () => (
  <div
    className="min-h-screen flex items-center justify-center"
    style={{ background: '#121212' }}
  >
    <div className="flex flex-col items-center gap-3">
      <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="#CF0F47" strokeWidth="4" />
        <path className="opacity-80" fill="#CF0F47" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <span className="text-zinc-600 text-sm">Đang tải...</span>
    </div>
  </div>
);

const GlobalPageLoader = () => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#121212] transition-all">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cta"></div>
    </div>
  );
};

function AppContent() {
  return (
    <>
      <GlobalPageLoader />
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* ── Public routes ──────────────────────────── */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="movies" element={<MovieList />} />
            <Route path="movies/:id" element={<MovieDetail />} />
            <Route path="booking" element={<Booking />} />
            <Route path="hall" element={<Hall />} />
            <Route path="hall/:id" element={<HallDetail />} />
            <Route path="news" element={<div className="p-6"><h1 className="text-2xl font-bold">Tin tức &amp; Sự kiện</h1></div>} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* ── Admin routes ───────────────────────────── */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="movies" element={<AdminMovies />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
