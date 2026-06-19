import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieById, getRelatedMovies } from '../services/movieService';
import MovieCard from '../components/MovieCard';
import { useTrailerStore } from '../store/trailerStore';

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openTrailer } = useTrailerStore();

  const [movie, setMovie] = useState(null);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Showtime states
  const [dates, setDates] = useState([]);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);

  // Review states
  const [filterRating, setFilterRating] = useState('all');
  const [userRating, setUserRating] = useState(5);
  const [username, setUsername] = useState('');
  const [commentText, setCommentText] = useState('');
  const [reviews, setReviews] = useState([
    {
      id: 1,
      username: "Trần Anh Vũ",
      date: "18/06/2026",
      rating: 5,
      comment: "Phim thực sự rất tuyệt vời! Kịch bản xuất sắc, lời thoại ý nghĩa và hình ảnh được trau chuốt từng khung hình."
    },
    {
      id: 2,
      username: "Lê Minh Hương",
      date: "18/06/2026",
      rating: 4,
      comment: "Diễn xuất đỉnh cao của dàn cast gánh phim cực tốt. Nhạc phim cảm xúc, tuy nhiên đoạn kết hơi vội vàng."
    },
    {
      id: 3,
      username: "Nguyễn Công Danh",
      date: "17/06/2026",
      rating: 5,
      comment: "Rất lâu rồi mới xem một tác phẩm Việt Nam chỉn chu thế này. Xứng đáng đồng tiền bát gạo ra rạp!"
    }
  ]);

  // Generate showtime dates
  useEffect(() => {
    const getNextSevenDays = () => {
      const days = [];
      const vietnameseDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const dayName = i === 0 ? 'Hôm nay' : vietnameseDays[d.getDay()];
        const dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        days.push({ id: i, dayName, dateStr });
      }
      return days;
    };
    setDates(getNextSevenDays());
  }, []);

  // Fetch movie data and related movies
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchMovieData = async () => {
      setLoading(true);
      setError(null);
      try {
        const movieData = await getMovieById(id);
        if (movieData) {
          setMovie(movieData);
          const related = await getRelatedMovies(movieData);
          setRelatedMovies(related);
        } else {
          setError("Không tìm thấy thông tin phim.");
        }
      } catch (err) {
        setError("Có lỗi xảy ra khi tải dữ liệu phim.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovieData();
  }, [id]);

  const handleShowtimeClick = (format, time) => {
    navigate('/booking', { 
      state: { 
        movieId: movie.id,
        showtime: time,
        format: format,
        date: dates[selectedDateIndex]?.dateStr
      } 
    });
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newReview = {
      id: Date.now(),
      username: username.trim() || 'Người dùng ẩn danh',
      date: new Date().toLocaleDateString('vi-VN'),
      rating: userRating,
      comment: commentText.trim()
    };

    setReviews([newReview, ...reviews]);
    setUsername('');
    setCommentText('');
    setUserRating(5);
  };

  // Helper star renderer
  const renderStars = (ratingCount, sizeClass = "w-4 h-4") => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`${sizeClass} ${star <= ratingCount ? 'text-gold' : 'text-zinc-700'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-bg-dark text-text-main min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cta"></div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="bg-bg-dark text-text-main min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-heading2 text-cta font-bold text-center">{error || "Không tìm thấy phim"}</div>
        <button 
          onClick={() => navigate('/')}
          className="bg-cta text-text-main text-body3 px-6 py-3 rounded font-bold hover:bg-opacity-90 transition-colors uppercase cursor-pointer"
        >
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  // Showtime mock logic depending on status
  const mockFormats = movie.status === 'coming-soon' ? [] : [
    {
      name: '2D Lồng Tiếng',
      price: 'Từ 80.000đ',
      times: ['09:00', '11:15', '13:45', '16:00', '18:30', '20:45']
    },
    {
      name: '2D Phụ Đề',
      price: 'Từ 85.000đ',
      times: ['10:00', '12:30', '15:00', '17:30', '20:00', '22:15']
    },
    {
      name: 'IMAX Phụ Đề',
      price: 'Từ 140.000đ',
      times: ['13:00', '19:00', '21:30']
    }
  ];

  // Filtering reviews logic
  const filteredReviews = reviews.filter(r => {
    if (filterRating === 'all') return true;
    if (filterRating === 'newest') return true;
    return r.rating === Number(filterRating);
  });

  return (
    <div className="bg-bg-dark text-text-main min-h-screen pb-16">
      {/* 1. Backdrop Video/Trailer banner */}
      <div className="relative w-full h-[280px] sm:h-[360px] md:h-[440px] bg-zinc-950 flex items-center justify-center overflow-hidden border-b border-[#222222]">
        <img 
          src={movie.posterUrl} 
          alt="" 
          className="absolute w-full h-full object-cover opacity-20 blur-md scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-transparent to-transparent z-5"></div>
        {/* Play button */}
        <button 
          onClick={() => openTrailer(movie.trailerUrl)}
          className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-cta text-text-main flex items-center justify-center hover:scale-105 transition-transform duration-300 cursor-pointer shadow-2xl z-10"
          aria-label="Xem trailer"
        >
          <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>

      {/* 2. Main content Layout */}
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* 2.1 Movie Overview overlap banner */}
        <div className="flex flex-col sm:flex-row gap-6 md:gap-8 -mt-16 sm:-mt-24 md:-mt-32 items-start text-left mb-12">
          {/* Vertical Movie Poster */}
          <div className="w-44 sm:w-48 md:w-56 aspect-[2/3] rounded-lg overflow-hidden border-4 border-bg-dark bg-zinc-800 shadow-2xl flex-shrink-0">
            <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
          </div>
          
          {/* Details Column next to poster */}
          <div className="flex-grow pt-2 sm:pt-4 md:pt-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="border border-cta-light text-cta-light text-[11px] px-2.5 py-0.5 rounded font-bold uppercase">
                {movie.ageRating}
              </span>
              <span className="border border-zinc-700 text-text-sub2 text-[11px] px-2.5 py-0.5 rounded font-bold">
                Việt Nam
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-main leading-tight mb-3">
              {movie.title}
            </h1>
            
            <p className="text-text-sub2 text-body2 mb-4 font-medium">
              {movie.genre?.join(', ')}
            </p>
            
            {/* Stars rating area */}
            <div className="flex items-center gap-2 mb-4">
              {renderStars(5)}
              <span className="text-gold font-bold text-body2 ml-1">
                {movie.rating > 0 ? `${movie.rating}/10` : 'Chưa đánh giá'}
              </span>
              <span className="text-text-sub3 text-body3">
                ({movie.rating > 0 ? '120 lượt đánh giá' : '0 lượt đánh giá'})
              </span>
            </div>
            
            {/* Metadata icons info */}
            <div className="flex items-center gap-6 text-text-sub3 text-body3">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {movie.duration} phút
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {movie.releaseDate}
              </span>
            </div>
            
            {/* Director & Cast */}
            <div className="mt-4 pt-4 border-t border-zinc-800 space-y-1.5 text-body3">
              <div>
                <span className="text-text-sub3">Đạo diễn: </span>
                <span className="text-text-sub1 font-medium">{movie.director}</span>
              </div>
              <div>
                <span className="text-text-sub3">Diễn viên: </span>
                <span className="text-text-sub1 font-medium">{movie.cast?.join(', ')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2.2 Split content layout columns */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* 2.2.1 Left Main info Column */}
          <div className="lg:col-span-3 space-y-12 text-left">
            
            {/* A. Description block */}
            <section>
              <div className="flex items-center space-x-2 mb-4 border-b border-[#222222] pb-3">
                <div className="w-1.5 h-6 bg-gold"></div>
                <h2 className="text-heading2 text-text-main uppercase font-bold tracking-wider">Mô tả</h2>
              </div>
              <p className="text-body2 text-text-sub2 leading-relaxed whitespace-pre-line">
                {movie.description}
              </p>
            </section>

            {/* B. Showtimes block */}
            <section>
              <div className="flex items-center space-x-2 mb-6 border-b border-[#222222] pb-3">
                <div className="w-1.5 h-6 bg-gold"></div>
                <h2 className="text-heading2 text-text-main uppercase font-bold tracking-wider">Lịch chiếu</h2>
              </div>
              
              {movie.status === 'coming-soon' ? (
                <div className="p-8 text-center bg-zinc-900/30 border border-zinc-800 rounded-xl text-text-sub3 text-body2">
                  Phim sắp chiếu hiện chưa có lịch chiếu cụ thể. Vui lòng quay lại sau khi phim chính thức công chiếu.
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Date Slider Row */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-800">
                    {dates.map((day, idx) => (
                      <button
                        key={day.id}
                        onClick={() => setSelectedDateIndex(idx)}
                        className={`flex flex-col items-center justify-center min-w-[70px] h-[52px] rounded-lg border transition-all cursor-pointer ${
                          selectedDateIndex === idx 
                            ? 'bg-cta border-cta text-text-main' 
                            : 'border-zinc-800 bg-zinc-900/50 text-text-sub2 hover:border-zinc-700 hover:text-text-main'
                        }`}
                      >
                        <span className="text-[12px] font-bold uppercase">{day.dayName}</span>
                        <span className="text-[11px] font-medium mt-0.5 opacity-80">{day.dateStr}</span>
                      </button>
                    ))}
                  </div>

                  {/* Formats and Showtimes items */}
                  <div className="space-y-4 pt-2">
                    {mockFormats.map((format, idx) => (
                      <div 
                        key={idx} 
                        className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-start justify-between gap-4"
                      >
                        {/* Format Heading Left */}
                        <div className="flex-shrink-0">
                          <h4 className="text-body2 font-bold text-text-main uppercase tracking-wider">{format.name}</h4>
                          <span className="text-[11px] text-text-sub3 block mt-1">{format.price}</span>
                        </div>
                        
                        {/* Times List Grid Right */}
                        <div className="flex flex-wrap gap-3 flex-grow md:justify-end">
                          {format.times.map((time) => (
                            <button
                              key={time}
                              onClick={() => handleShowtimeClick(format.name, time)}
                              className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-cta-light hover:text-cta-light rounded-lg text-body3 font-medium transition-all cursor-pointer text-center"
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* C. Review block */}
            <section>
              <div className="flex items-center space-x-2 mb-6 border-b border-[#222222] pb-3">
                <div className="w-1.5 h-6 bg-gold"></div>
                <h2 className="text-heading2 text-text-main uppercase font-bold tracking-wider">Đánh giá</h2>
              </div>
              
              {/* Review Statistics & Write Form Header Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                
                {/* Statistics Box Left */}
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 flex flex-row items-center gap-6">
                  {/* Big Number */}
                  <div className="text-center flex-shrink-0">
                    <span className="text-4xl sm:text-5xl font-bold text-text-main">
                      {movie.rating > 0 ? movie.rating : '0.0'}
                    </span>
                    <span className="text-[12px] text-text-sub3 block mt-2">/10 điểm</span>
                    <div className="mt-2 flex justify-center">
                      {renderStars(Math.round((movie.rating || 0) / 2))}
                    </div>
                  </div>
                  {/* Breakdown ratings progress bars */}
                  <div className="flex-grow space-y-1.5 text-body3">
                    {[
                      { star: 5, fill: "w-[75%]" },
                      { star: 4, fill: "w-[15%]" },
                      { star: 3, fill: "w-[6%]" },
                      { star: 2, fill: "w-[3%]" },
                      { star: 1, fill: "w-[1%]" }
                    ].map((row) => (
                      <div key={row.star} className="flex items-center gap-3">
                        <span className="w-4 text-text-sub2 text-[12px] font-bold text-right">{row.star}★</span>
                        <div className="flex-grow h-1.5 bg-zinc-800 rounded overflow-hidden">
                          <div className={`h-full bg-gold ${row.fill}`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Write Review Card Right */}
                <form onSubmit={handleAddReview} className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-3 justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-text-sub2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input 
                        type="text" 
                        placeholder="Tên của bạn..."
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="bg-transparent border-b border-zinc-800 text-body2 text-text-main focus:outline-hidden focus:border-gold py-0.5 transition-colors placeholder:text-text-sub3 w-32 sm:w-40"
                      />
                    </div>
                    {/* Star Selection Row */}
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setUserRating(star)}
                          className="focus:outline-hidden cursor-pointer"
                        >
                          <svg
                            className={`w-5 h-5 ${star <= userRating ? 'text-gold' : 'text-zinc-700'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Text Input area */}
                  <textarea
                    rows="2"
                    placeholder="Viết đánh giá của bạn..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-text-main rounded-lg focus:outline-hidden focus:border-gold p-3 text-body2 transition-all placeholder:text-text-sub3"
                    required
                  ></textarea>
                  <div className="flex justify-end">
                    <button 
                      type="submit"
                      className="bg-cta hover:bg-cta-light text-text-main text-body3 px-5 py-2 rounded font-bold uppercase transition-colors cursor-pointer"
                    >
                      Gửi
                    </button>
                  </div>
                </form>
              </div>

              {/* Review filters list */}
              <div className="flex flex-wrap gap-2 mb-6 border-b border-[#222222] pb-4">
                {[
                  { label: "Tất cả", value: "all" },
                  { label: "Mới nhất", value: "newest" },
                  { label: "5★", value: "5" },
                  { label: "4★", value: "4" },
                  { label: "3★", value: "3" },
                  { label: "2★", value: "2" },
                  { label: "1★", value: "1" }
                ].map((btn) => (
                  <button
                    key={btn.value}
                    onClick={() => setFilterRating(btn.value)}
                    className={`px-4 py-1.5 rounded-full border text-body3 font-medium transition-all cursor-pointer ${
                      filterRating === btn.value
                        ? 'bg-gold border-gold text-bg-dark font-bold'
                        : 'border-zinc-800 text-text-sub2 bg-zinc-900/30 hover:border-zinc-700 hover:text-text-main'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              {/* Review Comments list */}
              {filteredReviews.length === 0 ? (
                <div className="text-center py-10 bg-zinc-900/10 border border-zinc-800/30 rounded-xl text-text-sub3 text-body2">
                  Chưa có đánh giá nào phù hợp với bộ lọc này.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReviews.map((review) => (
                    <div 
                      key={review.id} 
                      className="border-b border-zinc-800 pb-5"
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        {/* Left avatar/info */}
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-text-sub3 font-bold text-body3 uppercase">
                            {review.username.slice(0, 1)}
                          </div>
                          <div>
                            <span className="font-bold text-text-main text-body2 block">{review.username}</span>
                            <span className="text-[11px] text-text-sub3">{review.date}</span>
                          </div>
                        </div>
                        {/* Stars */}
                        <div>
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <p className="text-body2 text-text-sub2 pl-11 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                  
                  {/* See more reviews */}
                  <div className="pt-4 flex justify-center">
                    <button className="border border-zinc-800 hover:border-zinc-700 text-text-sub2 hover:text-text-main text-body3 px-6 py-2.5 rounded font-medium transition-all cursor-pointer">
                      Xem thêm
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* 2.2.2 Right column sidebar: related movies list */}
          <div className="lg:col-span-1 space-y-6 text-left">
            <div className="flex items-center space-x-2 mb-4 border-b border-[#222222] pb-3">
              <div className="w-1.5 h-6 bg-gold"></div>
              <h2 className="text-heading2 text-text-main uppercase font-bold tracking-wider">Phim tương tự</h2>
            </div>
            
            <div className="flex flex-col gap-6">
              {relatedMovies.length === 0 ? (
                <div className="text-text-sub3 text-body3 py-4 text-center">
                  Không tìm thấy phim tương tự.
                </div>
              ) : (
                relatedMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
