import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { lazy, Suspense, useState, useEffect } from 'react';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import FilmReelLoader from './components/FilmReelLoader';

const Home = lazy(() => import('./pages/Home'));
const MovieList = lazy(() => import('./pages/MovieList'));
const MovieDetail = lazy(() => import('./pages/MovieDetail/index.jsx'));
const Booking = lazy(() => import('./pages/Booking/index.jsx'));
const Register = lazy(() => import('./pages/Register/index.jsx'));
const Login = lazy(() => import('./pages/Login'));
const Profile = lazy(() => import('./pages/Profile/index.jsx'));
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminMovies = lazy(() => import('./pages/admin/AdminMovies/index.jsx'));
const AdminHalls = lazy(() => import('./pages/admin/AdminHalls/index.jsx'));
const AdminShowtimes = lazy(() => import('./pages/admin/AdminShowtimes/index.jsx'));
import AdminEvents from './pages/admin/AdminEvents';
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings/index.jsx'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers/index.jsx'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts/index.jsx'));
const AdminGenres = lazy(() => import('./pages/admin/AdminGenres/index.jsx'));
const AdminPricing = lazy(() => import('./pages/admin/AdminPricing/index.jsx'));
const AdminComments = lazy(() => import('./pages/admin/AdminComments/index.jsx'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports/index.jsx'));
const AdminSeatTypes = lazy(() => import('./pages/admin/AdminSeatTypes/index.jsx'));
const AdminAudienceTypes = lazy(() => import('./pages/admin/AdminAudienceTypes/index.jsx'));
const AdminPaymentMethods = lazy(() => import('./pages/admin/AdminPaymentMethods/index.jsx'));

// Hall page
const Hall = lazy(() => import('./pages/Hall'));
const HallDetail = lazy(() => import('./pages/HallDetail'));

const Loader = () => (
  <FilmReelLoader fullScreen size="lg" text="Đang tải dữ liệu trang..." />
);

const GlobalPageLoader = () => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setVisible(true);
    let raf1 = null;
    let raf2 = null;

    // Đợi trang mới render xong và đếm đủ ít nhất 1 frame ảnh (double rAF) rồi mới đóng loader
    const timer = setTimeout(() => {
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          setVisible(false);
        });
      });
    }, 800);

    return () => {
      clearTimeout(timer);
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <FilmReelLoader fullScreen size="lg" text="Đang tải dữ liệu trang..." />
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
            <Route path="events" element={<Events />} />
            <Route path="events/:id" element={<EventDetail />} />
            <Route path="news" element={<Navigate to="/events" replace />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* ── Admin routes ───────────────────────────── */}
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="movies" element={<AdminMovies />} />
            <Route path="halls" element={<AdminHalls />} />
            <Route path="showtimes" element={<AdminShowtimes />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="genres" element={<AdminGenres />} />
            <Route path="pricing" element={<AdminPricing />} />
            <Route path="seat-types" element={<AdminSeatTypes />} />
            <Route path="audience-types" element={<AdminAudienceTypes />} />
            <Route path="payment-methods" element={<AdminPaymentMethods />} />
            <Route path="comments" element={<AdminComments />} />
            <Route path="reports" element={<AdminReports />} />
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
