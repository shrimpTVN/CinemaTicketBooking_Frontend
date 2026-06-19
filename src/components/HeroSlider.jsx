import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { useTrailerStore } from '../store/trailerStore';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

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
        className="w-full h-[460px] md:h-[520px] hero-swiper"
      >
        {sortedFeaturedMovies.map((movie, index) => {
          const videoId = getVideoId(movie.trailerUrl);
          const embedUrl = getEmbedUrl(movie.trailerUrl);

          return (
            <SwiperSlide key={movie.id} className="relative w-full h-full group">
              {/* YouTube Video Background */}
              <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none bg-black">
                <iframe
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] scale-105 opacity-80"
                  src={`${embedUrl}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&playsinline=1&enablejsapi=1&showinfo=0&rel=0`}
                  title={movie.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                ></iframe>
              </div>

              {/* Clickable trailer background overlay */}
              <div
                onClick={() => openTrailer(movie.trailerUrl)}
                className="absolute inset-0 cursor-pointer z-10"
                title="Click để xem trailer"
              >
                {/* Dark Overlays for Text Contrast */}
                <div className="absolute inset-0 bg-gradient-to-r from-bg-dark via-bg-dark/45 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-transparent to-transparent" />
              </div>

              {/* Content Overlay */}
              <div className="max-w-7xl mx-auto px-4 h-full flex items-center relative z-20 pointer-events-none">
                <div className="max-w-2xl text-left pointer-events-auto">
                  <h1 className="text-heading1 text-text-main font-bold mb-4 leading-tight">
                    {movie.title}
                  </h1>

                  {/* Metadata Row: Rating, Duration, Age */}
                  <div className="flex items-center space-x-4 mb-6 text-body2">
                    <span className="text-gold font-bold">★ {movie.rating}/10</span>
                    <span className="text-text-sub2">|</span>
                    <span className="text-text-sub2">{movie.duration} phút</span>
                    <span className="text-text-sub2">|</span>
                    {movie.ageRating && (
                      <span className="border border-zinc-500 text-text-sub2 text-body3 px-2 py-0.5 rounded font-bold uppercase">
                        {movie.ageRating}
                      </span>
                    )}
                  </div>

                  <p className="text-body2 text-text-sub2 mb-8 line-clamp-3 leading-relaxed">
                    {movie.description}
                  </p>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleBooking(movie.id)}
                      className="bg-cta text-text-main text-body3 px-6 py-3 rounded font-bold hover:bg-opacity-90 transition-colors uppercase cursor-pointer"
                    >
                      Mua vé
                    </button>
                    <button
                      onClick={() => navigate(`/movies/${movie.id}`)}
                      className="border border-zinc-500 text-text-sub2 text-body3 px-6 py-3 rounded font-bold hover:bg-white hover:text-text-main hover:bg-white/5 transition-all uppercase cursor-pointer"
                    >
                      Chi tiết
                    </button>
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
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-6 bg-gold"></div>
            <span className="text-heading2 text-text-main uppercase font-bold tracking-wider">Trending</span>
          </div>

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
