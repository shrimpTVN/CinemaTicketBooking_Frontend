import { useState, useEffect } from 'react';
import { getNowShowing, getComingSoon, updateSpecialList } from '../services/movieService';
import MovieCard from '../components/MovieCard';
import SectionHeading from '../components/SectionHeading';
import ScrollReveal from '../components/ScrollReveal';

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

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchMovies = async () => {
      try {
        setLoading(true);
        await updateSpecialList();
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
      <div className="max-w-7xl mx-auto px-4 pt-10 text-left">
        {/* 1. Showing Grid Section */}
        <div className="mb-14">
          <ScrollReveal direction="up">
            <SectionHeading className="mb-6">Phim Đang Chiếu</SectionHeading>
          </ScrollReveal>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4].map(n => <CardSkeleton key={n} />)}
            </div>
          ) : nowShowing.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900/20 border border-zinc-800/50 rounded-2xl text-text-sub3 text-body2">
              Hiện tại chưa có phim đang chiếu.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {nowShowing.map((movie, idx) => (
                <ScrollReveal key={movie.id} delay={(idx % 4) * 60} direction="up">
                  <MovieCard movie={movie} />
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>

        {/* 2. Coming Soon Grid Section */}
        <div>
          <ScrollReveal direction="up">
            <SectionHeading className="mb-6">Phim Sắp Chiếu</SectionHeading>
          </ScrollReveal>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4].map(n => <CardSkeleton key={n} />)}
            </div>
          ) : comingSoon.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900/20 border border-zinc-800/50 rounded-2xl text-text-sub3 text-body2">
              Hiện tại chưa có phim sắp chiếu.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {comingSoon.map((movie, idx) => (
                <ScrollReveal key={movie.id} delay={(idx % 4) * 60} direction="up">
                  <MovieCard movie={movie} />
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
