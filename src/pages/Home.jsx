import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNowShowing, getComingSoon, updateSpecialList } from '../services/movieService';
import { getAllEvents } from '../services/eventService';
import HeroSlider from '../components/HeroSlider';
import MovieCard from '../components/MovieCard';
import TabFilter from '../components/TabFilter';
import SectionHeading from '../components/SectionHeading';
import AgeRatingTag from '../components/AgeRatingTag';
import EventSwiper from '../components/EventSwiper';
import ScrollReveal from '../components/ScrollReveal';
import { useTrailerStore } from '../store/trailerStore';

// Skeleton Loader for Hero Banner
const HeroSkeleton = () => (
  <div className="w-full min-h-[380px] md:min-h-[460px] bg-zinc-900 animate-pulse flex items-center">
    <div className="max-w-7xl mx-auto px-4 w-full flex flex-col md:flex-row items-center gap-8">
      <div className="flex-1 space-y-4 text-left">
        <div className="h-8 bg-zinc-800 rounded w-3/4"></div>
        <div className="h-6 bg-zinc-800 rounded w-1/2"></div>
        <div className="h-20 bg-zinc-800 rounded w-full"></div>
        <div className="flex space-x-4">
          <div className="h-10 bg-zinc-800 rounded w-28"></div>
          <div className="h-10 bg-zinc-800 rounded w-28"></div>
        </div>
      </div>
      <div className="hidden md:block w-72 aspect-[2/3] bg-zinc-800 rounded"></div>
    </div>
  </div>
);

// Skeleton Loader for Grid Cards
const CardSkeleton = () => (
  <div className="flex flex-col gap-3 animate-pulse">
    <div className="aspect-[2/3] w-full bg-zinc-900 rounded-lg"></div>
    <div className="h-5 bg-zinc-900 rounded w-3/4"></div>
    <div className="h-4 bg-zinc-900 rounded w-1/2"></div>
  </div>
);

// Helper to extract YouTube video ID safely
const getVideoId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
  return (match && match[2] && match[2].length === 11) ? match[2] : null;
};

export default function Home() {
  const navigate = useNavigate();
  const { openTrailer } = useTrailerStore();
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('now-showing');
  const [recommendedIndex, setRecommendedIndex] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      await updateSpecialList();
      const [showingData, soonData, eventsData] = await Promise.all([
        getNowShowing(),
        getComingSoon(),
        getAllEvents()
      ]);
      setNowShowing(showingData);
      setComingSoon(soonData);
      setEvents(Array.isArray(eventsData) ? eventsData : []);
    } catch (err) {
      setError('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng kiểm tra lại kết nối.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeMovies = (activeTab === 'now-showing' ? nowShowing : comingSoon).slice(0, 8);

  // Lấy danh sách phim đề xuất từ "now-showing" (CHỈ lấy các phim có điểm đánh giá rating > 0)
  const recommendedPool = useMemo(() => {
    if (!nowShowing || nowShowing.length === 0) return [];

    // Chỉ lọc các phim thực sự đã có điểm đánh giá > 0 và sắp xếp giảm dần theo điểm rating
    return nowShowing
      .filter((m) => Number(m.rating) > 0)
      .sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0))
      .slice(0, 4);
  }, [nowShowing]);

  const activeRecommended = recommendedPool[recommendedIndex] || null;

  // Lấy các phim đề cử khác trong pool (trừ phim đang active) để hiển thị ở dưới
  const otherRecommendations = recommendedPool.filter((_, idx) => idx !== recommendedIndex);

  // Hàm chuyển đề xuất tiếp theo
  const handleNextRecommendation = () => {
    if (recommendedPool.length > 0) {
      setRecommendedIndex((prev) => (prev + 1) % recommendedPool.length);
    }
  };

  // Hàm lấy lý do đề xuất phim cá nhân hóa
  const getRecommendationReason = (movie) => {
    if (!movie) return '';
    const mainGenre = movie.genre && movie.genre.length > 0 ? movie.genre[0] : '';
    const ratingNum = Number(movie.rating) || 0;
    if (ratingNum > 0) {
      return `Dựa trên điểm số cao (${ratingNum}/10) & đánh giá tích cực từ khán giả`;
    }
    if (mainGenre) {
      return `Dựa trên xu hướng xem phim thể loại ${mainGenre} được săn đón`;
    }
    return `Dựa trên danh sách phim hot được lựa chọn nhiều nhất`;
  };

  // Hàm chọn một phim cụ thể từ danh sách dưới làm active
  const handleSelectRecommendation = (movie) => {
    const idx = recommendedPool.findIndex(m => m.id === movie.id);
    if (idx !== -1) {
      setRecommendedIndex(idx);
    }
  };

  // Tự động trượt tới phim gợi ý kế tiếp sau mỗi 5 giây
  useEffect(() => {
    if (recommendedPool.length === 0) return;
    const timer = setInterval(() => {
      setRecommendedIndex((prev) => (prev + 1) % recommendedPool.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [recommendedIndex, recommendedPool.length]);

  if (loading) {
    return (
      <div className="bg-bg-dark text-text-main min-h-screen">
        <HeroSkeleton />
        <div className="max-w-7xl mx-auto px-4 mt-12">
          <div className="h-8 bg-zinc-900 rounded w-32 mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => <CardSkeleton key={n} />)}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-bg-dark text-text-main min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-heading2 text-cta font-bold text-center">{error}</div>
        <button
          onClick={fetchData}
          className="bg-cta text-text-main text-body3 px-6 py-3 rounded font-bold hover:bg-opacity-90 transition-colors uppercase cursor-pointer"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const recVideoId = activeRecommended ? getVideoId(activeRecommended.trailerUrl) : null;
  const recCoverImage = recVideoId 
    ? `https://img.youtube.com/vi/${recVideoId}/maxresdefault.jpg` 
    : (activeRecommended?.bannerUrl || activeRecommended?.posterUrl);
  const recCoverFallback = recVideoId 
    ? `https://img.youtube.com/vi/${recVideoId}/hqdefault.jpg` 
    : (activeRecommended?.bannerUrl || activeRecommended?.posterUrl);

  return (
    <div className="bg-bg-dark text-text-main min-h-screen pb-12">
      {/* 1. Hero Slider Section */}
      <HeroSlider movies={nowShowing} />

      {/* Full-width Divider between Trending and Movies */}
      <div className="w-full border-t border-[#222222] my-12" />

      {/* 2. Movies Grid Section */}
      <section className="max-w-7xl mx-auto px-4 text-left">
        {/* Section Title */}
        <ScrollReveal direction="up">
          <div className="flex items-center space-x-2 mb-6 border-b border-[#222222] pb-4">
            <SectionHeading>Phim</SectionHeading>

            {/* Tabs Toggles */}
            <TabFilter
              tabs={[
                { id: 'now-showing', label: 'Đang chiếu' },
                { id: 'coming-soon', label: 'Sắp chiếu' }
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
              variant="select"
              isHeaderTab={true}
              className="ml-8 text-body2"
            />
          </div>
        </ScrollReveal>

        {/* Empty State */}
        {activeMovies.length === 0 ? (
          <div className="text-center py-16 text-body2 text-text-sub3">
            Hiện tại chưa có phim nào trong danh mục này.
          </div>
        ) : (
          <div>
            {/* Movies Grid: Mobile 2 columns, Desktop 4 columns */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {activeMovies.map((movie, idx) => (
                <ScrollReveal key={movie.id} delay={idx * 60} direction="up">
                  <MovieCard movie={movie} />
                </ScrollReveal>
              ))}
            </div>

            {/* View All Button */}
            <ScrollReveal delay={150} direction="up">
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => navigate('/movies')}
                  className="border border-zinc-700 hover:border-cta text-text-main hover:text-cta text-body3 font-google-sans px-8 py-3 rounded font-bold transition-colors uppercase cursor-pointer"
                >
                  Xem tất cả
                </button>
              </div>
            </ScrollReveal>
          </div>
        )}
      </section>

      {/* Full-width Divider between Movies and Recommended */}
      <div className="w-full border-t border-[#222222] my-12" />

      {/* 3. Recommended Section */}
      <section className="max-w-7xl mx-auto px-4 text-left">
        <ScrollReveal direction="up">
          <SectionHeading className="mb-6">Đề xuất cho bạn</SectionHeading>
        </ScrollReveal>

        {activeRecommended && (
          <ScrollReveal direction="scale">
            <div className="relative bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 md:p-8 flex flex-col justify-between overflow-hidden shadow-2xl backdrop-blur-xl">
              {/* Movie Banner Cover Background (styled identically to Movie Detail page hero) */}
              <img
                src={recCoverImage}
                alt={activeRecommended.title}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = recCoverFallback;
                }}
                className="absolute inset-0 w-full h-full object-cover opacity-35 scale-105 pointer-events-none transition-all duration-700 select-none"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/85 to-zinc-950/40 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/30 pointer-events-none" />

              {/* Main Content Row */}
              <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                {/* Left 3D Stacked Playing Cards Deck Container */}
                <div className="relative w-full sm:w-[340px] md:w-[370px] h-[340px] sm:h-[360px] flex-shrink-0 flex items-center justify-start pl-2 sm:pl-4 py-2">
                  {recommendedPool.map((movie, idx) => {
                    const offset = (idx - recommendedIndex + recommendedPool.length) % recommendedPool.length;
                    const isTop = offset === 0;

                    // 3D Deck Card Offset Calculations (Wider shift for easy clicking)
                    const translateX = offset * 36; // Shift rightward 36px per card
                    const translateY = offset * 6;  // Downward offset
                    const scale = 1 - offset * 0.05; // Gentle scaling
                    const rotate = offset * 4;       // Fan-out angle

                    return (
                      <div
                        key={movie.id}
                        onClick={() => setRecommendedIndex(idx)}
                        style={{
                          zIndex: recommendedPool.length - offset,
                          transform: `translate3d(${translateX}px, ${translateY}px, 0px) scale(${scale}) rotate(${rotate}deg)`,
                          transformOrigin: 'bottom left'
                        }}
                        className={`absolute top-2 left-2 w-[185px] sm:w-[200px] md:w-[210px] aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ease-out cursor-pointer group/card ${
                          isTop
                            ? 'border-2 border-cta ring-4 ring-cta/25 shadow-cta/30 opacity-100'
                            : 'border border-zinc-700/70 opacity-80 hover:opacity-100 hover:scale-105 hover:-translate-y-2'
                        }`}
                      >
                        <img
                          src={movie.posterUrl}
                          alt={movie.title}
                          className="w-full h-full object-cover select-none transition-transform duration-500 group-hover/card:scale-105"
                        />

                        {/* Dark overlay for cards stacked underneath */}
                        {!isTop && (
                          <div className="absolute inset-0 bg-black/40 group-hover/card:bg-black/10 transition-colors" />
                        )}

                        {/* Age Rating Tag Overlay (Top-Left of Active Top Poster) */}
                        {isTop && movie.ageRating && (
                          <div className="absolute top-3 left-3 z-20 shadow-md">
                            <AgeRatingTag rating={movie.ageRating} />
                          </div>
                        )}

                        {/* Play Icon Hover Overlay for Top Poster */}
                        {isTop && (
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 flex items-center justify-center transition-opacity duration-300 z-20">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openTrailer(movie.trailerUrl);
                              }}
                              className="w-14 h-14 rounded-full bg-cta text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer"
                              title="Xem trailer"
                            >
                              <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </button>
                          </div>
                        )}

                        {/* Mini Title Label for Peeking Cards Stacked Underneath */}
                        {!isTop && (
                          <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-md px-2.5 py-1.5 rounded-lg text-[10px] text-white font-bold truncate border border-white/10 shadow-md">
                            {movie.title}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Right Side Info & Actions */}
                <div className="flex-grow flex flex-col justify-between text-left w-full py-1">
                  <div>
                    {/* Gemini AI Recommendation Badge Container */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-950/80 via-purple-950/80 to-blue-950/70 border border-indigo-500/40 shadow-lg shadow-indigo-500/15 mb-4 max-w-full">
                      {/* AI Sparkle Icon (Gemini style) */}
                      <svg className="w-4 h-4 text-indigo-300 flex-shrink-0 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
                      </svg>
                      <span className="text-xs sm:text-body3 font-semibold bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 bg-clip-text text-transparent truncate">
                        {getRecommendationReason(activeRecommended)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-main leading-snug mb-3">
                      {activeRecommended.title}
                    </h3>

                    {/* Metadata Row: Genre • Duration • Rating */}
                    <div className="flex flex-wrap items-center gap-2 mb-4 text-body3 text-text-sub2">
                      <span>{activeRecommended.genre?.join(', ')}</span>
                      <span className="text-zinc-600">•</span>
                      <span>{activeRecommended.duration} phút</span>
                      {Number(activeRecommended.rating) > 0 && (
                        <>
                          <span className="text-zinc-600">•</span>
                          <span className="text-gold font-bold flex items-center gap-1">
                            ★ {activeRecommended.rating}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-body2 text-text-sub3 leading-relaxed mb-6 line-clamp-3 max-w-2xl font-light">
                      {activeRecommended.description}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 sm:gap-4">
                    <button
                      onClick={() => navigate('/booking', { state: { movieId: activeRecommended.id } })}
                      className="bg-cta hover:bg-cta-light text-text-main text-body3 font-google-sans px-7 py-3 rounded-lg font-bold uppercase transition-colors cursor-pointer shadow-lg shadow-cta/20"
                    >
                      Mua vé
                    </button>
                    <button
                      onClick={() => navigate(`/movies/${activeRecommended.id}`)}
                      className="border border-zinc-700 hover:border-zinc-500 text-text-sub2 hover:text-text-main text-body3 font-google-sans px-7 py-3 rounded-lg font-bold uppercase transition-all cursor-pointer"
                    >
                      Chi tiết
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        )}
      </section>

      {/* Full-width Divider between Recommended and Events */}
      <div className="w-full border-t border-[#222222] my-12" />

      {/* 4. Events Section */}
      <section className="max-w-7xl mx-auto px-4 text-left">
        <ScrollReveal direction="up">
          <SectionHeading className="mb-6">Sự kiện</SectionHeading>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={100}>
          <EventSwiper events={events} />
        </ScrollReveal>
      </section>
    </div>
  );
}
