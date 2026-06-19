import { useNavigate } from 'react-router-dom';
import { useTrailerStore } from '../store/trailerStore';

export default function MovieCard({ movie }) {
  const navigate = useNavigate();
  const { openTrailer } = useTrailerStore();

  const handleCardClick = () => {
    navigate(`/movies/${movie.id}`);
  };

  const handleButtonClick = (e, action) => {
    e.stopPropagation(); // Ngăn chuyển trang chi tiết khi click vào nút
    if (action === 'booking') {
      navigate('/booking', { state: { movieId: movie.id } });
    } else if (action === 'trailer') {
      openTrailer(movie.trailerUrl);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group cursor-pointer flex flex-col bg-transparent overflow-hidden transition-transform duration-300 hover:-translate-y-1"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full rounded-lg bg-zinc-800 overflow-hidden">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {movie.ageRating && (
            <span className="w-10 h-6 bg-cta text-text-main text-[11px] rounded font-bold uppercase tracking-wider select-none flex items-center justify-center">
              {movie.ageRating}
            </span>
          )}
          {movie.rating && (
            <span className="w-10 h-6 bg-zinc-900/90 text-gold text-[11px] rounded font-bold backdrop-blur-xs select-none flex items-center justify-center gap-0.5">
              ★ {movie.rating}
            </span>
          )}
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-3 transition-opacity duration-300 z-20">
          <button
            onClick={(e) => handleButtonClick(e, 'booking')}
            className="w-36 bg-cta text-text-main text-body3 py-2 rounded font-bold hover:bg-opacity-90 transition-colors uppercase cursor-pointer"
          >
            Mua vé
          </button>
          <button
            onClick={(e) => handleButtonClick(e, 'trailer')}
            className="w-36 border border-text-main text-text-main text-body3 py-2 rounded font-bold hover:bg-white hover:text-bg-dark transition-all uppercase cursor-pointer"
          >
            Xem trailer
          </button>
        </div>
      </div>

      {/* Info Block */}
      <div className="mt-3 text-left">
        <h3 className="text-label-custom font-bold text-text-main group-hover:text-cta-light transition-colors line-clamp-2 h-[44px] overflow-hidden">
          {movie.title}
        </h3>
        <p className="text-body3 text-text-sub3 mt-1 truncate">
          {movie.genre?.join(', ')} • {movie.duration} phút
        </p>
      </div>
    </div>
  );
}
