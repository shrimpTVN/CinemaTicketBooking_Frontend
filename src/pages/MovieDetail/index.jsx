import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieById, getRelatedMovies } from '../../services/movieService';
import MovieCard from '../../components/MovieCard';
import { useTrailerStore } from '../../store/trailerStore';
import SectionHeading from '../../components/SectionHeading';
import AmbientGlow from '../../components/AmbientGlow';
import AgeRatingTag from '../../components/AgeRatingTag';
import apiClient from '../../services/apiClient';
import { USE_MOCK } from '../../services/apiConfig';
import ShowtimeSelector from './components/ShowtimeSelector';
import ReviewSection from './components/ReviewSection';
import ReviewForm from './components/ReviewForm';
import { useAuthStore } from '../../store/authStore';
import FilmReelLoader from '../../components/FilmReelLoader';

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

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openTrailer } = useTrailerStore();

  const [movie, setMovie] = useState(null);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const videoId = useMemo(() => {
    if (!movie?.trailerUrl) return '';
    const url = movie.trailerUrl;
    if (url.includes('embed/')) {
      return url.split('embed/')[1]?.split('?')[0] || '';
    }
    if (url.includes('v=')) {
      return new URLSearchParams(url.split('?')[1]).get('v') || '';
    }
    if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1]?.split('?')[0] || '';
    }
    const parts = url.split('/');
    return parts[parts.length - 1]?.split('?')[0] || '';
  }, [movie?.trailerUrl]);

  const youtubeThumbnail = useMemo(() => {
    if (!videoId) return movie?.posterUrl || '';
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }, [videoId, movie?.posterUrl]);

  const youtubeThumbnailFallback = useMemo(() => {
    if (!videoId) return movie?.posterUrl || '';
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }, [videoId, movie?.posterUrl]);

  // Showtime states
  const [dates, setDates] = useState([]);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [allMovieShowtimes, setAllMovieShowtimes] = useState([]);
  const [hasNoShowtimes, setHasNoShowtimes] = useState(false);

  const dbShowtimes = useMemo(() => {
    if (USE_MOCK || !dates[selectedDateIndex]) return [];
    const dateIso = dates[selectedDateIndex].dateIso;
    return allMovieShowtimes.filter(st => st.date === dateIso);
  }, [allMovieShowtimes, selectedDateIndex, dates]);

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
        const dateIso = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
        days.push({ id: i, dayName, dateStr, dateIso });
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

  // Fetch showtimes dynamically from backend when movie changes
  useEffect(() => {
    if (!movie || movie.status === 'coming-soon') {
      setAllMovieShowtimes([]);
      setHasNoShowtimes(false);
      return;
    }

    if (USE_MOCK) {
      setHasNoShowtimes(false);
      return;
    }

    apiClient.get('/showtimes/filter', {
      params: {
        movieId: movie.id
      }
    }).then(async (res) => {
      const data = res?.data || res || [];
      if (data.length === 0) {
        setAllMovieShowtimes([]);
        setHasNoShowtimes(true);
        setDates([]);
        return;
      }

      // Fetch real seat counts for each showtime
      const enrichedData = await Promise.all(
        data.map(async (st) => {
          try {
            const seatRes = await apiClient.get(`/showtime-seats/showtimes/${st.id}`);
            const seatData = Array.isArray(seatRes) ? seatRes : (seatRes?.data || []);
            if (seatData.length > 0) {
              const availableCount = seatData.filter((s) => (s.status || '').toUpperCase() === 'AVAILABLE').length;
              return {
                ...st,
                availableCount,
                totalCount: seatData.length
              };
            }
          } catch (e) {
            console.warn(`Failed to fetch seat count for showtime ${st.id}`, e);
          }
          return {
            ...st,
            availableCount: 80,
            totalCount: 100
          };
        })
      );

      setAllMovieShowtimes(enrichedData);

      if (data.length === 0) {
        setHasNoShowtimes(true);
        setDates([]);
        return;
      }
      setHasNoShowtimes(false);

      // Find the earliest showtime date
      const uniqueDates = Array.from(new Set(data.map(st => st.date))).sort();
      const earliestDateStr = uniqueDates[0];

      // Generate 7 days starting from earliestDateStr
      const getSevenDaysFrom = (startDateStr) => {
        const days = [];
        const vietnameseDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const parts = startDateStr.split('-');
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const start = new Date(year, month, day);
        
        const now = new Date();
        const todayIso = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
        
        for (let i = 0; i < 7; i++) {
          const d = new Date(start);
          d.setDate(start.getDate() + i);
          
          const dateIso = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
          const dayName = dateIso === todayIso ? 'Hôm nay' : vietnameseDays[d.getDay()];
          const dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
          days.push({ id: i, dayName, dateStr, dateIso });
        }
        return days;
      };
      
      const initialDates = getSevenDaysFrom(earliestDateStr);
      const filteredDates = initialDates.filter(d => 
        data.some(st => st.date === d.dateIso)
      );

      setDates(filteredDates);
      setSelectedDateIndex(0);
    }).catch(err => {
      console.error('Failed to fetch movie showtimes:', err);
      setAllMovieShowtimes([]);
      setHasNoShowtimes(false);
    });
  }, [movie]);

  const handleShowtimeClick = (format, time, showtimeId, roomName) => {
    const user = useAuthStore.getState().user;
    const matched = dbShowtimes.find(st => st.id === showtimeId);

    const bookingState = {
      movieId: movie.id,
      showtime: time,
      showtimeId: showtimeId,
      format: format,
      date: dates[selectedDateIndex]?.dateStr,
      dateKey: dates[selectedDateIndex]?.dateIso,
      dayLabel: dates[selectedDateIndex]?.dayName,
      hallId: matched?.hallId || 1,
      roomName: roomName || matched?.hallName
    };

    if (!user) {
      // Redirect straight to booking after login, passing the selected showtime details
      navigate('/login', { 
        state: { 
          from: '/booking', 
          bookingState: bookingState 
        } 
      });
      return;
    }

    // Already logged in, go straight to booking
    navigate('/booking', { state: bookingState });
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

  if (loading) {
    return <FilmReelLoader fullScreen size="lg" text="Đang tải thông tin phim..." />;
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
      times: ['09:00', '11:15', '13:45', '16:00', '18:30', '20:45'].map((t, idx) => {
        const [h, m] = t.split(':').map(Number);
        const endH = String((h + 2) % 24).padStart(2, '0');
        const endM = String(m).padStart(2, '0');
        return {
          id: `st-mock-lt-${idx}`,
          start: t,
          end: `${endH}:${endM}`,
          available: 80 - idx * 5,
          room: 'Phòng 1'
        };
      })
    },
    {
      name: '2D Phụ Đề',
      price: 'Từ 85.000đ',
      times: ['10:00', '12:30', '15:00', '17:30', '20:00', '22:15'].map((t, idx) => {
        const [h, m] = t.split(':').map(Number);
        const endH = String((h + 2) % 24).padStart(2, '0');
        const endM = String(m).padStart(2, '0');
        return {
          id: `st-mock-pd-${idx}`,
          start: t,
          end: `${endH}:${endM}`,
          available: 90 - idx * 6,
          room: 'Phòng 1'
        };
      })
    },
    {
      name: 'IMAX Phụ Đề',
      price: 'Từ 140.000đ',
      times: ['13:00', '19:00', '21:30'].map((t, idx) => {
        const [h, m] = t.split(':').map(Number);
        const endH = String((h + 2) % 24).padStart(2, '0');
        const endM = String(m).padStart(2, '0');
        return {
          id: `st-mock-im-${idx}`,
          start: t,
          end: `${endH}:${endM}`,
          available: 60 - idx * 10,
          room: 'Phòng IMAX'
        };
      })
    }
  ];

  // Group showtimes by format name
  const formatsToDisplay = USE_MOCK ? mockFormats : (() => {
    const groups = {};
    // Sort dbShowtimes chronologically before grouping
    const sortedDbShowtimes = [...dbShowtimes].sort((a, b) => {
      return (a.startTime || '').localeCompare(b.startTime || '');
    });

    sortedDbShowtimes.forEach(st => {
      const typeLower = (st.type || '').toLowerCase();
      let lang = 'Phụ Đề';
      if (typeLower.includes('lồng tiếng') || typeLower.includes('lòng tiếng')) {
        lang = 'Lồng Tiếng';
      } else if (typeLower.includes('thuyết minh')) {
        lang = 'Thuyết Minh';
      }

      const isImax = (st.hallName && st.hallName.toUpperCase().includes('IMAX')) || typeLower.includes('imax');
      const is3D = typeLower.includes('3d');
      const format = isImax ? 'IMAX' : (is3D ? '3D' : '2D');

      const formatLabel = `${format} ${lang}`;
      if (!groups[formatLabel]) {
        groups[formatLabel] = {
          name: formatLabel,
          price: isImax ? 'Từ 140.000đ' : (is3D ? 'Từ 110.000đ' : 'Từ 85.000đ'),
          times: []
        };
      }
      const timeStr = st.startTime.slice(0, 5);
      const duration = movie.duration || 120;
      const [h, m] = timeStr.split(':').map(Number);
      const totalMinutes = h * 60 + m + duration;
      const endH = String(Math.floor(totalMinutes / 60) % 24).padStart(2, '0');
      const endM = String(totalMinutes % 60).padStart(2, '0');

      if (!groups[formatLabel].times.some(t => t.start === timeStr && t.room === st.hallName)) {
        groups[formatLabel].times.push({
          id: st.id,
          start: timeStr,
          end: `${endH}:${endM}`,
          available: st.availableCount ?? 80,
          total: st.totalCount ?? 100,
          room: st.hallName
        });
      }
    });
    return Object.values(groups);
  })();

  // Filtering reviews logic
  const filteredReviews = reviews.filter(r => {
    if (filterRating === 'all') return true;
    if (filterRating === 'newest') return true;
    return r.rating === Number(filterRating);
  });

  return (
    <div className="bg-bg-dark text-text-main min-h-screen pb-16 relative">
      <AmbientGlow imageUrl={movie.posterUrl} />
      {/* 1. Backdrop Video/Trailer banner */}
      <div className="relative w-full h-[280px] sm:h-[360px] md:h-[440px] bg-zinc-950 flex items-center justify-center overflow-hidden border-b border-[#222222]">
        <img
          src={youtubeThumbnail}
          alt={movie.title}
          onError={(e) => { e.currentTarget.src = youtubeThumbnailFallback; }}
          className="absolute w-full h-full object-cover opacity-60 scale-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-transparent to-transparent z-5"></div>
        {/* Play button */}
        {movie.trailerUrl && (
          <button
            onClick={() => openTrailer(movie.trailerUrl)}
            className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-cta text-text-main flex items-center justify-center hover:scale-105 transition-all duration-300 cursor-pointer shadow-2xl z-10 group/play"
            aria-label="Xem trailer"
          >
            <span className="absolute inset-0 rounded-full bg-cta/60 animate-ping group-hover/play:bg-cta/80"></span>
            <svg className="w-6 h-6 ml-0.5 relative z-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        )}
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
              <AgeRatingTag rating={movie.ageRating} />
              <span className="border border-zinc-700 text-text-sub2 text-[11px] px-2.5 py-0.5 rounded font-bold">
                {movie.country || 'Việt Nam'}
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
              <SectionHeading hasBorder={true} className="mb-4">Mô tả</SectionHeading>
              <p className="text-body2 text-text-sub2 leading-relaxed whitespace-pre-line">
                {movie.description}
              </p>
            </section>

            {/* B. Showtimes block */}
            <ShowtimeSelector
              movie={movie}
              dates={dates}
              selectedDateIndex={selectedDateIndex}
              setSelectedDateIndex={setSelectedDateIndex}
              formatsToDisplay={formatsToDisplay}
              handleShowtimeClick={handleShowtimeClick}
              hasNoShowtimes={hasNoShowtimes}
            />

            {/* C. Review block */}
            <section>
              <SectionHeading hasBorder={true} className="mb-6">Đánh giá</SectionHeading>

              {/* Review Statistics & Write Form Header Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Statistics Box Left */}
                <ReviewSection
                  movie={movie}
                  filterRating={filterRating}
                  setFilterRating={setFilterRating}
                  filteredReviews={filteredReviews}
                />

                {/* Write Review Card Right */}
                <ReviewForm
                  username={username}
                  setUsername={setUsername}
                  userRating={userRating}
                  setUserRating={setUserRating}
                  commentText={commentText}
                  setCommentText={setCommentText}
                  handleAddReview={handleAddReview}
                />
              </div>
            </section>
          </div>

          {/* 2.2.2 Right column sidebar: related movies list */}
          <div className="lg:col-span-1 space-y-6 text-left">
            <SectionHeading hasBorder={true} className="mb-4">Phim tương tự</SectionHeading>

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
