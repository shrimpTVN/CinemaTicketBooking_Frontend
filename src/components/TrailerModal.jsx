import { useTrailerStore } from '../store/trailerStore';

export default function TrailerModal() {
  const { isOpen, trailerUrl, closeTrailer } = useTrailerStore();

  if (!isOpen) return null;

  // Chuyển đổi URL Youtube thông thường sang định dạng nhúng (embed) để chạy được trong iframe
  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('/embed/')) {
      // Thêm autoplay nếu chưa có
      return url.includes('?') ? `${url}&autoplay=1` : `${url}?autoplay=1`;
    }
    
    let videoId = '';
    if (url.includes('watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    }
    
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
  };

  return (
    <div 
      className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] transition-opacity duration-300"
      onClick={closeTrailer}
    >
      {/* Container của iframe */}
      <div 
        className="relative w-full max-w-4xl aspect-video rounded-xl overflow-hidden bg-black border border-zinc-800 shadow-2xl animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()} // Ngăn đóng khi bấm vào video
      >
        {/* Nút đóng ở góc trên bên phải của video */}
        <button 
          onClick={closeTrailer}
          className="absolute top-4 right-4 bg-black/60 hover:bg-cta text-text-main w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer z-50 border border-zinc-700 hover:border-transparent"
          aria-label="Đóng trailer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Video Player */}
        <iframe
          title="Movie Trailer"
          src={getEmbedUrl(trailerUrl)}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}
