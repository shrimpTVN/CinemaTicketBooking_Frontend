import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import MainLayout from './layouts/MainLayout';

const Home = lazy(() => import('./pages/Home'));
const MovieList = lazy(() => import('./pages/MovieList'));
const MovieDetail = lazy(() => import('./pages/MovieDetail'));
const Booking = lazy(() => import('./pages/Booking'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="bg-bg-dark text-text-main min-h-screen flex items-center justify-center">Loading...</div>}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="movies" element={<MovieList />} />
            <Route path="movies/:id" element={<MovieDetail />} />
            <Route path="booking" element={<Booking />} />
            <Route path="news" element={<div className="p-6"><h1 className="text-2xl font-bold">Tin tức & Sự kiện</h1></div>} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
