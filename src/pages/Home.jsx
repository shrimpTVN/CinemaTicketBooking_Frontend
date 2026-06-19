import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNowShowing, getComingSoon } from '../services/movieService';
import HeroSlider from '../components/HeroSlider';
import MovieCard from '../components/MovieCard';
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

export default function Home() {
  const navigate = useNavigate();
  const { openTrailer } = useTrailerStore();
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('now-showing');
  const [recommendedIndex, setRecommendedIndex] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [showingData, soonData] = await Promise.all([
        getNowShowing(),
        getComingSoon()
      ]);
      setNowShowing(showingData);
      setComingSoon(soonData);
    } catch (err) {
      setError('Đã xảy ra lỗi khi tải dữ liệu phim. Vui lòng kiểm tra lại kết nối.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeMovies = (activeTab === 'now-showing' ? nowShowing : comingSoon).slice(0, 8);

  // Lấy danh sách phim đề xuất từ "now-showing" (tối đa 4 phim)
  const recommendedPool = nowShowing.slice(0, 4);
  const activeRecommended = recommendedPool[recommendedIndex] || null;

  // Lấy các phim đề cử khác trong pool (trừ phim đang active) để hiển thị ở dưới
  const otherRecommendations = recommendedPool.filter((_, idx) => idx !== recommendedIndex);

  // Hàm chuyển đề xuất tiếp theo
  const handleNextRecommendation = () => {
    if (recommendedPool.length > 0) {
      setRecommendedIndex((prev) => (prev + 1) % recommendedPool.length);
    }
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

  return (
    <div className="bg-bg-dark text-text-main min-h-screen pb-12">
      {/* 1. Hero Slider Section */}
      <HeroSlider movies={nowShowing} />

      {/* 2. Movies Grid Section */}
      <section className="max-w-7xl mx-auto px-4 mt-12 text-left">
        {/* Section Title */}
        <div className="flex items-center space-x-2 mb-6 border-b border-[#222222] pb-4">
          <div className="w-1.5 h-6 bg-gold"></div>
          <h2 className="text-heading2 text-text-main uppercase tracking-wider font-bold">Phim</h2>
          
          {/* Tabs Toggles */}
          <div className="flex space-x-6 ml-8 text-body2">
            <button 
              onClick={() => setActiveTab('now-showing')}
              className={`pb-4 -mb-4 border-b-2 font-medium transition-all cursor-pointer ${
                activeTab === 'now-showing' 
                  ? 'border-cta text-text-main' 
                  : 'border-transparent text-text-sub2 hover:text-text-main'
              }`}
            >
              Đang chiếu
            </button>
            <button 
              onClick={() => setActiveTab('coming-soon')}
              className={`pb-4 -mb-4 border-b-2 font-medium transition-all cursor-pointer ${
                activeTab === 'coming-soon' 
                  ? 'border-cta text-text-main' 
                  : 'border-transparent text-text-sub2 hover:text-text-main'
              }`}
            >
              Sắp chiếu
            </button>
          </div>
        </div>

        {/* Empty State */}
        {activeMovies.length === 0 ? (
          <div className="text-center py-16 text-body2 text-text-sub3">
            Hiện tại chưa có phim nào trong danh mục này.
          </div>
        ) : (
          <div>
            {/* Movies Grid: Mobile 1, Tablet 2, Desktop 4 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {activeMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
            
            {/* View All Button */}
            <div className="mt-12 flex justify-center">
              <button 
                onClick={() => navigate('/movies')}
                className="border border-[#333333] hover:border-cta text-text-sub1 hover:text-cta text-body3 px-8 py-3 rounded font-bold transition-all uppercase cursor-pointer"
              >
                Xem tất cả
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 3. Recommended Section */}
      <section className="max-w-7xl mx-auto px-4 mt-16 text-left">
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-1.5 h-6 bg-gold"></div>
          <h2 className="text-heading2 text-text-main uppercase tracking-wider font-bold">Đề xuất cho bạn</h2>
        </div>
        
        {activeRecommended && (
          <div className="flex flex-col">
            {/* Featured Banner Card */}
            <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 group">
              {/* Vertical Poster on the Left */}
              <div className="relative w-full sm:w-[220px] md:w-[240px] aspect-[2/3] rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0 flex items-center justify-center border border-zinc-800">
                <img 
                  src={activeRecommended.posterUrl} 
                  alt={activeRecommended.title} 
                  className="w-full h-full object-cover opacity-75 group-hover:scale-102 transition-transform duration-500" 
                />
                {/* Play icon overlay */}
                <button 
                  onClick={() => openTrailer(activeRecommended.trailerUrl)}
                  className="absolute w-16 h-16 rounded-full bg-cta text-text-main flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
                  aria-label="Xem trailer"
                >
                  <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </div>
              
              {/* Right Side: Details & Actions */}
              <div className="flex-grow flex flex-col justify-between py-2 text-left pr-0 md:pr-14">
                <div>
                  <h3 className="text-[28px] md:text-[36px] font-bold text-text-main leading-tight mb-4">
                    {activeRecommended.title}
                  </h3>
                  
                  {/* Metadata Row matching wireframe details */}
                  <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-4 text-body3">
                    <span className="text-text-sub2 font-medium">{activeRecommended.genre?.join(', ')}</span>
                    <span className="text-gold font-bold">★ {activeRecommended.rating}/10</span>
                    <span className="border border-zinc-700 px-3 py-0.5 rounded text-text-sub2 text-[12px] font-bold">
                      {activeRecommended.duration} phút
                    </span>
                    <span className="border border-zinc-700 px-3 py-0.5 rounded text-cta font-bold">
                      {activeRecommended.ageRating}
                    </span>
                  </div>
                  
                  <p className="text-body2 text-text-sub3 leading-relaxed mb-6 line-clamp-4 max-w-2xl">
                    {activeRecommended.description}
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button 
                    onClick={() => navigate('/booking', { state: { movieId: activeRecommended.id } })}
                    className="bg-cta hover:bg-cta-light text-text-main text-body3 px-6 py-2.5 rounded font-bold uppercase transition-colors cursor-pointer"
                  >
                    Mua vé
                  </button>
                  <button 
                    onClick={() => navigate(`/movies/${activeRecommended.id}`)}
                    className="border border-zinc-700 text-text-sub2 hover:text-text-main hover:bg-white/5 text-body3 px-6 py-2.5 rounded font-bold uppercase transition-all cursor-pointer"
                  >
                    Chi tiết
                  </button>
                </div>
              </div>

              {/* Slider Next Chevron Indicator (Right Side) */}
              <button 
                onClick={handleNextRecommendation}
                className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-zinc-700 items-center justify-center hover:border-cta hover:text-cta transition-colors cursor-pointer text-text-sub1 bg-zinc-900/80 backdrop-blur-xs"
                aria-label="Đề xuất tiếp theo"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Bottom mini-previews of other recommended movies */}
            <div className="flex gap-4 mt-6">
              {otherRecommendations.map((movie) => (
                <div 
                  key={movie.id}
                  onClick={() => handleSelectRecommendation(movie)}
                  className="group cursor-pointer flex flex-col"
                >
                  <div className="w-24 aspect-[2/3] rounded-lg overflow-hidden bg-zinc-800 border border-zinc-800 hover:border-cta-light transition-all duration-300 hover:scale-103">
                    <img 
                      src={movie.posterUrl} 
                      alt={movie.title} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                      loading="lazy"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 4. News / Sets Section */}
      <section className="max-w-7xl mx-auto px-4 mt-16 text-left">
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-1.5 h-6 bg-gold"></div>
          <h2 className="text-heading2 text-text-main uppercase tracking-wider font-bold">Tin tức</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Large Article (left column span 2) */}
          <div 
            onClick={() => window.open('https://github.com/vitejs/vite', '_blank')}
            className="lg:col-span-2 flex flex-col bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden group cursor-pointer"
          >
            <div className="aspect-video w-full overflow-hidden bg-zinc-800 border-b border-zinc-800">
              <img 
                src="https://picsum.photos/seed/news-large/800/450" 
                alt="Main News" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                loading="lazy"
              />
            </div>
            <div className="p-6">
              <h3 className="text-subtitle font-bold text-text-main mb-3 group-hover:text-gold transition-colors">
                Lịch chiếu phim đặc biệt hè 2026: Ưu đãi bùng nổ tại các cụm rạp
              </h3>
              <p className="text-body2 text-text-sub3">
                Đón chào mùa hè rực rỡ với loạt chương trình khuyến mãi mua 1 tặng 1 vé và combo bắp nước siêu tiết kiệm tại tất cả cụm rạp trên cả nước từ ngày 1/7 đến hết ngày 31/8.
              </p>
            </div>
          </div>

          {/* Right vertical sidebar articles list */}
          <div className="flex flex-col justify-start gap-4">
            {[
              {
                id: 1,
                title: "Top 5 bộ phim chiếu rạp không thể bỏ lỡ trong tháng này",
                desc: "Điểm mặt những tác phẩm bom tấn đa thể loại sắp càn quét các phòng vé Việt Nam.",
                img: "https://picsum.photos/seed/news-1/180/120"
              },
              {
                id: 2,
                title: "Hậu trường chưa kể của bom tấn phòng vé 'Mai'",
                desc: "Những chi tiết thú vị về quá trình quay dựng và những cảnh quay đầy cảm xúc của các diễn viên.",
                img: "https://picsum.photos/seed/news-2/180/120"
              },
              {
                id: 3,
                title: "Công Tử Bạc Liêu tung teaser đầu tiên hé lộ tạo hình ấn tượng",
                desc: "Hình ảnh tạo hình sang trọng và phong thái chơi ngông của vị công tử giàu có bậc nhất Nam Kỳ.",
                img: "https://picsum.photos/seed/news-3/180/120"
              }
            ].map((item) => (
              <div 
                key={item.id} 
                onClick={() => window.open('https://github.com/vitejs/vite', '_blank')}
                className="flex gap-4 p-3 rounded-lg border border-transparent hover:border-zinc-800 hover:bg-zinc-900/30 transition-all cursor-pointer group"
              >
                <div className="aspect-[4/3] w-24 rounded overflow-hidden flex-shrink-0 bg-zinc-800 border border-zinc-800">
                  <img src={item.img} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-body3 font-bold text-text-main line-clamp-2 mb-1 group-hover:text-gold transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-text-sub3 line-clamp-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
