import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { useTrailerStore } from '../store/trailerStore';
import SectionHeading from './SectionHeading';
import AgeRatingTag from './AgeRatingTag';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Helper to truncate text at punctuation marks (comma, dot, etc.) to avoid bad cuts
const truncateDescription = (text, maxLength = 150) => {
  if (!text || text.length <= maxLength) return text;
  const truncated = text.substring(0, maxLength);
  
  // Tìm vị trí dấu chấm, dấu phẩy, dấu chấm hỏi, chấm than hoặc chấm phẩy cuối cùng
  const lastPunctuation = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf(','),
    truncated.lastIndexOf('?'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf(';')
  );
  
  // Chỉ cắt tại dấu câu nếu dấu câu đó không nằm quá gần đầu chuỗi (ví dụ: tối thiểu là 60 ký tự)
  if (lastPunctuation > 60) {
    return truncated.substring(0, lastPunctuation).trim() + '...';
  }
  
  // Fallback: cắt tại khoảng trắng cuối cùng
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
};

export default function HeroSlider({ movies }) {
  const navigate = useNavigate();
  const { openTrailer } = useTrailerStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const mainSwiperRef = useRef(null);
  const thumbsSwiperRef = useRef(null);

  if (!movies || movies.length === 0) return null;

  // Sắp xếp các phim theo rating giảm dần (đại diện cho top lượt xem nhiều nhất)
  const sortedFeaturedMovies = [...movies]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 8);

  const handleSlideChange = (swiper) => {
    const index = swiper.realIndex;
    setActiveIndex(index);
    // Đồng bộ chuyển slide cho Swiper thumbnails ở dưới nếu có
    if (thumbsSwiperRef.current) {
      thumbsSwiperRef.current.slideTo(index);
    }
  };

  const goToSlide = (index) => {
    if (mainSwiperRef.current) {
      mainSwiperRef.current.slideTo(index);
    }
  };

  const handleBooking = (movieId) => {
    navigate('/booking', { state: { movieId } });
  };

  const getVideoId = (url) => {
    if (!url) return '';
    // Handle short url: https://youtu.be/d1ZHdosjNX8?si=...
    if (url.includes('youtu.be/')) {
      const parts = url.split('youtu.be/');
      const idAndQuery = parts[1];
      return idAndQuery.split('?')[0];
    }
    // Handle watch url: https://www.youtube.com/watch?v=d1ZHdosjNX8
    if (url.includes('v=')) {
      const searchParams = new URLSearchParams(url.split('?')[1]);
      return searchParams.get('v') || '';
    }
    // Handle embed url: https://www.youtube.com/embed/d1ZHdosjNX8
    if (url.includes('embed/')) {
      const parts = url.split('embed/');
      return parts[1].split('?')[0];
    }
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1];
    return lastPart.split('?')[0];
  };

  const getEmbedUrl = (url) => {
    const videoId = getVideoId(url);
    if (!videoId) {
      return 'https://www.youtube.com/embed/jZ1S0P9QWws';
    }
    return `https://www.youtube.com/embed/${videoId}`;
  };

  return (
    <div className="relative w-full bg-bg-dark border-b border-[#222222]">
      {/* 1. Main Slide Area: Full-width Trailer Background Banner */}
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        autoplay={{ delay: 8000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        onSwiper={(swiper) => (mainSwiperRef.current = swiper)}
        onSlideChange={handleSlideChange}
        className="w-full h-[56.25vw] md:h-[520px] hero-swiper"
      >
        {sortedFeaturedMovies.map((movie, index) => {
          const videoId = getVideoId(movie.trailerUrl);
          const embedUrl = getEmbedUrl(movie.trailerUrl);
          // Use maxresdefault (1280×720) for crisp quality; fallback to hqdefault (480×360) on error
          const youtubeThumbnail = videoId 
            ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` 
            : movie.posterUrl;
          const youtubeThumbnailFallback = videoId
            ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
            : movie.posterUrl;

          return (
            <SwiperSlide key={movie.id} className="relative w-full h-full group">
              {/* YouTube Video Background (Desktop only) */}
              <div className="hidden md:block absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none bg-black">
                <iframe
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full md:w-[100vw] md:h-[56.25vw] md:min-h-[100vh] md:min-w-[177.77vh] scale-105 opacity-80"
                  src={`${embedUrl}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&playsinline=1&enablejsapi=1&showinfo=0&rel=0`}
                  title={movie.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                ></iframe>
              </div>

              {/* YouTube Thumbnail Background (Mobile only) */}
              <div className="md:hidden absolute inset-0 w-full h-full overflow-hidden bg-black pointer-events-none select-none">
                <img
                  src={youtubeThumbnail}
                  alt=""
                  onError={(e) => { e.currentTarget.src = youtubeThumbnailFallback; }}
                  className="w-full h-full object-cover opacity-90 scale-[1.05]"
                />
              </div>

              {/* Clickable trailer background overlay */}
              <div
                onClick={() => openTrailer(movie.trailerUrl)}
                className="absolute inset-0 cursor-pointer z-10"
                title="Click để xem trailer"
              >
                {/* Dark Overlays for Text Contrast */}
                <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-bg-dark via-bg-dark/35 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/85 via-bg-dark/20 to-transparent" />
              </div>

              {/* Content Overlay */}
              <div className="max-w-7xl mx-auto px-4 h-full flex items-end justify-center pb-3 md:pb-0 md:items-center md:justify-start relative z-20 pointer-events-none w-full">
                <div className="max-w-2xl text-center md:text-left flex flex-col items-center md:items-start pointer-events-auto">
                  <h1 className="text-[16px] sm:text-[20px] md:text-[38px] lg:text-heading1 text-text-main font-bold mb-1.5 md:mb-4 leading-tight line-clamp-1">
                    {movie.title}
                  </h1>

                  {/* Metadata Row: Outlined Capsule Badges (IMDb/Rating, Age, Year, Duration) */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 md:gap-3 mb-3 md:mb-6 text-[10px] md:text-body3">
                    {/* Rating capsule */}
                    <span className="border border-zinc-700 bg-zinc-900/60 px-2 py-0.5 rounded text-gold font-bold">
                      ★ {movie.rating}
                    </span>
                    {/* Age rating capsule */}
                    {movie.ageRating && (
                      <AgeRatingTag rating={movie.ageRating} variant="hero" className="border-zinc-700 bg-zinc-900/60 px-2" />
                    )}
                    {/* Duration capsule */}
                    <span className="border border-zinc-700 bg-zinc-900/60 px-2 py-0.5 rounded text-text-sub2 font-bold">
                      {movie.duration} phút
                    </span>
                  </div>

                  <p className="hidden md:line-clamp-2 text-body2 text-text-sub2 mb-6 leading-relaxed">
                    {truncateDescription(movie.description, 150)}
                  </p>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleBooking(movie.id)}
                      className="bg-cta text-text-main text-[11px] sm:text-body3 px-4 h-8 md:px-6 md:h-11 flex items-center justify-center rounded font-bold hover:bg-opacity-90 transition-colors uppercase cursor-pointer"
                    >
                      Mua vé
                    </button>
                    <button
                      onClick={() => navigate(`/movies/${movie.id}`)}
                      className="border border-zinc-500 text-text-sub2 text-[11px] sm:text-body3 px-4 h-8 md:px-6 md:h-11 flex items-center justify-center rounded font-bold hover:bg-white hover:text-text-main hover:bg-white/5 transition-all uppercase cursor-pointer"
                    >
                      Chi tiết
                    </button>
                    {/* Play Button next to Chi tiết */}
                    {videoId && (
                      <button
                        onClick={() => openTrailer(movie.trailerUrl)}
                        className="w-8 h-8 md:w-11 md:h-11 flex items-center justify-center bg-transparent border-none p-0 hover:scale-105 active:scale-95 transition-all cursor-pointer flex-shrink-0"
                        title="Xem trailer"
                      >
                        <svg className="w-full h-full" viewBox="0 0 24 24">
                          <path
                            fill="#E4E4E7"
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-2.5 7.5l7.5 4.5-7.5 4.5v-9z"
                            className="hover:fill-white transition-colors"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* 2. Bottom Sliding Posters: Trending List below the Banner */}
      <div className="max-w-7xl mx-auto px-4 py-8 relative">
        <div className="flex justify-between items-center mb-6">
          <SectionHeading uppercase={false}>Trending</SectionHeading>

          {/* Thumbnails Navigation Arrows */}
          <div className="flex space-x-2">
            <button
              onClick={() => thumbsSwiperRef.current?.slidePrev()}
              className="w-10 h-10 rounded-full border border-[#333333] hover:border-cta hover:text-cta flex items-center justify-center transition-all cursor-pointer text-text-sub1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => thumbsSwiperRef.current?.slideNext()}
              className="w-10 h-10 rounded-full border border-[#333333] hover:border-cta hover:text-cta flex items-center justify-center transition-all cursor-pointer text-text-sub1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Thumbs/Trending Slider */}
        <Swiper
          modules={[Navigation]}
          slidesPerView={2}
          spaceBetween={16}
          breakpoints={{
            480: { slidesPerView: 3, spaceBetween: 16 },
            768: { slidesPerView: 4, spaceBetween: 20 },
            1024: { slidesPerView: 6, spaceBetween: 20 },
          }}
          onSwiper={(swiper) => (thumbsSwiperRef.current = swiper)}
          className="w-full overflow-visible py-4 px-2"
        >
          {sortedFeaturedMovies.map((movie, index) => (
            <SwiperSlide key={movie.id} className="py-2">
              <div
                onClick={() => goToSlide(index)}
                className="group cursor-pointer flex flex-col"
              >
                {/* Upper Area: Outlined Number + Overlapping Poster */}
                <div className={`relative flex items-end pl-10 pt-2 pb-2 transition-all duration-300 ${activeIndex === index ? 'scale-105' : 'opacity-80 hover:opacity-100'
                  }`}>
                  {/* Giant Outlined Number on the left (behind the poster) */}
                  <span
                    className="absolute left-0 bottom-1 text-[100px] md:text-[120px] font-black italic select-none leading-none z-0 transition-all font-sans"
                    style={{
                      WebkitTextStroke: activeIndex === index ? '3px #C3C3C3' : '2px #555555',
                      color: 'transparent',
                      lineHeight: '0.8'
                    }}
                  >
                    {index + 1}
                  </span>

                  {/* Poster Image */}
                  <div className={`relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-zinc-800 transition-all duration-300 z-10 ${activeIndex === index
                    ? 'border-2 border-text-sub2 shadow-xl shadow-black/60'
                    : 'border border-zinc-800'
                    }`}>
                    <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* Lower Area: Movie Title under poster (multi-line wrap enabled) */}
                <div className="mt-2 text-left pl-10">
                  <h4 className={`text-[12px] font-bold transition-colors break-words leading-tight ${activeIndex === index ? 'text-text-main' : 'text-text-sub2 group-hover:text-text-main'
                    }`}>
                    {movie.title}
                  </h4>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Thumbs/Trending Slider */}
      {/* (removed local trailer modal) */}
    </div>
  );
}
