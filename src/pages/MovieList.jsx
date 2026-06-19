import { useState, useEffect } from 'react';
import { getNowShowing, getComingSoon } from '../services/movieService';
import MovieCard from '../components/MovieCard';

// Skeleton Loader for Movie Cards Grid
const CardSkeleton = () => (
  <div className="flex flex-col gap-3 animate-pulse">
    <div className="aspect-[2/3] w-full bg-zinc-900 rounded-lg"></div>
    <div className="h-5 bg-zinc-900 rounded w-3/4"></div>
    <div className="h-4 bg-zinc-900 rounded w-1/2"></div>
  </div>
);

export default function MovieList() {
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const [showing, soon] = await Promise.all([
          getNowShowing(),
          getComingSoon()
        ]);
        setNowShowing(showing);
        setComingSoon(soon);
      } catch (err) {
        setError('Có lỗi xảy ra khi tải dữ liệu phim.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  // Filter and sort movie lists
  const processMovies = (moviesList) => {
    // 1. Filter by title or genre
    let filtered = moviesList.filter(movie => 
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.genre?.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // 2. Sort according to active selection
    if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'duration') {
      filtered.sort((a, b) => b.duration - a.duration);
    } else if (sortBy === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
    }

    return filtered;
  };

  const processedNowShowing = processMovies(nowShowing);
  const processedComingSoon = processMovies(comingSoon);

  if (error) {
    return (
      <div className="bg-bg-dark text-text-main min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-heading2 text-cta font-bold text-center">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-cta text-text-main text-body3 px-6 py-3 rounded font-bold hover:bg-opacity-90 transition-colors uppercase cursor-pointer"
        >
          Tải lại trang
        </button>
      </div>
    );
  }

  return (
    <div className="bg-bg-dark text-text-main min-h-screen pb-16">
      {/* Search & Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-8 text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#222222] pb-6 mb-10">
          <div>
            <h1 className="text-heading1 text-text-main font-bold uppercase tracking-wider">Danh Sách Phim</h1>
            <p className="text-body2 text-text-sub3 mt-1">Khám phá thế giới điện ảnh đỉnh cao tại rạp</p>
          </div>

          {/* Search and Sort controls */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-sub3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên phim, thể loại..."
                className="w-full pl-10 pr-10 py-2 bg-zinc-900 border border-zinc-800 text-text-main rounded-lg focus:outline-hidden focus:border-cta text-body2 transition-all placeholder:text-text-sub3"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-sub3 hover:text-text-main cursor-pointer"
                  aria-label="Xóa từ khóa"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Sort Select */}
            <div className="relative w-full sm:w-48 flex-shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-text-main py-2 pl-4 pr-10 rounded-lg focus:outline-hidden focus:border-cta text-body2 transition-all cursor-pointer appearance-none"
              >
                <option value="default">Sắp xếp: Mặc định</option>
                <option value="rating">Đánh giá cao nhất</option>
                <option value="duration">Thời lượng dài nhất</option>
                <option value="title">Tên phim (A-Z)</option>
              </select>
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-text-sub3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>
          </div>
        </div>

        {/* 1. Showing Grid Section */}
        <div className="mb-14">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-1.5 h-6 bg-gold"></div>
            <h2 className="text-heading2 text-text-main uppercase tracking-wider font-bold">Phim Đang Chiếu</h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(n => <CardSkeleton key={n} />)}
            </div>
          ) : processedNowShowing.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900/20 border border-zinc-800/50 rounded-2xl text-text-sub3 text-body2">
              Không tìm thấy phim đang chiếu phù hợp.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {processedNowShowing.map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </div>

        {/* 2. Coming Soon Grid Section */}
        <div>
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-1.5 h-6 bg-gold"></div>
            <h2 className="text-heading2 text-text-main uppercase tracking-wider font-bold">Phim Sắp Chiếu</h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(n => <CardSkeleton key={n} />)}
            </div>
          ) : processedComingSoon.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900/20 border border-zinc-800/50 rounded-2xl text-text-sub3 text-body2">
              Không tìm thấy phim sắp chiếu phù hợp.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {processedComingSoon.map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
