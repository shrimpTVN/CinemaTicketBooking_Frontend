import { useState, useEffect, useRef, useMemo } from 'react';
import { USE_MOCK } from '../../../services/apiConfig';
import { ALL_DATES, SHOWTIMES, VN_DAYS } from '../bookingConstants';
import apiClient from '../../../services/apiClient';
import AgeRatingTag from '../../../components/AgeRatingTag';

function BookingMovieCard({ movie, selected, onClick }) {
  return (
    <div
      onClick={onClick}
      id={`movie-card-${movie.id}`}
      className="cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group flex flex-col"
      style={{ background: 'transparent' }}
    >
      {/* Poster */}
      <div
        className="relative aspect-[2/3] overflow-hidden bg-zinc-900 rounded-xl border-2 transition-all duration-200"
        style={{
          borderColor: selected ? 'var(--color-select)' : 'transparent',
          boxShadow: selected ? '0 0 0 3px rgba(14, 161, 207, 0.15)' : 'none',
        }}
      >
        {movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-700">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
              <rect x="2" y="4" width="20" height="16" rx="2" />
            </svg>
          </div>
        )}

        {/* Age rating badge */}
        {movie.ageRating && (
          <div className="absolute top-2 left-2">
            <AgeRatingTag rating={movie.ageRating} />
          </div>
        )}

        {/* Selected checkmark */}
        {selected && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.42)' }}>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'var(--color-select)', boxShadow: '0 2px 12px rgba(14, 161, 207, 0.4)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}

        {/* Hover overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)' }}
        />
      </div>

      {/* Title block */}
      <div className="px-1 pt-2 pb-1 flex-1">
        <p
          className="font-semibold leading-snug"
          style={{
            fontSize: '14px',
            color: selected ? 'var(--color-select)' : '#C3C3C3',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '40px',
            transition: 'color 0.2s',
          }}
        >
          {movie.title}
        </p>
      </div>
    </div>
  );
}

export default function ShowtimeSelection({ booking, setBooking, movies, dateWindowStart, setDateWindowStart }) {
  const [movieOpen, setMovieOpen] = useState(!booking.movie);
  const [showtimeOpen, setShowtimeOpen] = useState(!!booking.movie);
  const movieScrollRef = useRef(null);

  useEffect(() => {
    if (booking.movie) {
      setMovieOpen(false);
      setShowtimeOpen(true);
    } else {
      setMovieOpen(true);
      setShowtimeOpen(false);
    }
  }, [booking.movie]);

  const [availableDates, setAvailableDates] = useState([]);
  const [dynamicShowtimes, setDynamicShowtimes] = useState([]);

  // Load available dates for the selected movie
  useEffect(() => {
    setDateWindowStart(0); // Reset date list window

    if (!booking.movie) {
      setAvailableDates([]);
      return;
    }

    if (USE_MOCK) {
      setAvailableDates(ALL_DATES);
      if (!booking.showtime) {
        setBooking((b) => ({ ...b, date: ALL_DATES[0], showtime: null }));
      }
      return;
    }

    apiClient.get('/showtimes/filter', {
      params: {
        movieId: booking.movie.id,
      },
    }).then((res) => {
      const data = Array.isArray(res) ? res : (res?.data || []);
      if (data.length === 0) {
        setAvailableDates([]);
        if (!booking.showtime) {
          setBooking((b) => ({ ...b, date: null, showtime: null }));
        }
        return;
      }

      const uniqueDates = Array.from(new Set(data.map((st) => st?.date).filter(Boolean))).sort();
      if (uniqueDates.length === 0) {
        setAvailableDates([]);
        if (!booking.showtime) {
          setBooking((b) => ({ ...b, date: null, showtime: null }));
        }
        return;
      }
      
      const earliestDateStr = uniqueDates[0];

      const getSevenDatesFrom = (startDateStr) => {
        const parts = startDateStr.split('-');
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const start = new Date(year, month, day);

        const now = new Date();
        const todayIso = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

        return Array.from({ length: 7 }, (_, i) => {
          const d = new Date(start);
          d.setDate(start.getDate() + i);
          const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
          return {
            key,
            dayLabel: key === todayIso ? 'Hôm nay' : VN_DAYS[d.getDay()],
            dateLabel: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`,
            dateObj: d,
          };
        });
      };

      const movieDates = getSevenDatesFrom(earliestDateStr);
      const filtered = movieDates.filter((d) =>
        data.some((st) => st?.date === d.key)
      );

      if (filtered.length > 0) {
        setAvailableDates(filtered);
        if (!booking.showtime) {
          setBooking((b) => ({ ...b, date: filtered[0], showtime: null }));
        }
      } else {
        setAvailableDates([]);
        if (!booking.showtime) {
          setBooking((b) => ({ ...b, date: null, showtime: null }));
        }
      }
    }).catch((err) => {
      console.error('Failed to filter available dates in Booking:', err);
      setAvailableDates(ALL_DATES);
      if (!booking.showtime) {
        setBooking((b) => ({ ...b, date: ALL_DATES[0], showtime: null }));
      }
    });
  }, [booking.movie]);

  // Load showtimes for selected date and movie
  useEffect(() => {
    if (!booking.movie || !booking.date) {
      setDynamicShowtimes([]);
      return;
    }

    if (USE_MOCK) {
      setDynamicShowtimes(SHOWTIMES);
      return;
    }

    apiClient.get('/showtimes/filter', {
      params: {
        movieId: booking.movie.id,
        date: booking.date.key,
      },
    }).then((res) => {
      const data = Array.isArray(res) ? res : (res?.data || []);
      const mapped = data.filter((st) => st && st.startTime).map((st) => {
        const timeStr = st.startTime.slice(0, 5);

        const duration = booking.movie.duration || 120;
        const [h, m] = timeStr.split(':').map(Number);
        const totalMinutes = h * 60 + m + duration;
        const endH = String(Math.floor(totalMinutes / 60) % 24).padStart(2, '0');
        const endM = String(totalMinutes % 60).padStart(2, '0');

        const isLồngTiếng = st.type ? (st.type.includes('Lồng Tiếng') || st.type.includes('Lòng tiếng')) : false;

        return {
          id: st.id,
          format: (st.hallName && st.hallName.includes('IMAX')) ? 'IMAX' : '2D',
          lang: isLồngTiếng ? 'Thuyết minh' : 'Phụ đề',
          start: timeStr,
          end: `${endH}:${endM}`,
          available: 80,
          room: st.hallName || 'Phòng chiếu',
          hallId: st.hallId,
        };
      });
      // Sort showtimes chronologically
      mapped.sort((a, b) => a.start.localeCompare(b.start));
      setDynamicShowtimes(mapped);
    }).catch((err) => {
      console.error('Failed to fetch filtered showtimes:', err);
      setDynamicShowtimes([]);
    });
  }, [booking.movie, booking.date]);

  const visibleDates = availableDates.slice(dateWindowStart, dateWindowStart + 5);

  const pairedMovieColumns = useMemo(() => {
    const cols = [];
    const half = Math.ceil(movies.length / 2);
    for (let i = 0; i < half; i++) {
      cols.push({
        top: movies[i],
        bottom: movies[i + half],
      });
    }
    return cols;
  }, [movies]);

  const showtimesByLang = useMemo(() => {
    return dynamicShowtimes.reduce((acc, st) => {
      const key = `${st.format} ${st.lang}`;
      if (!acc[key]) acc[key] = [];
      // Deduplicate showtimes with identical start time
      if (!acc[key].some((item) => item.start === st.start)) {
        acc[key].push(st);
      }
      return acc;
    }, {});
  }, [dynamicShowtimes]);

  const handleSelectMovie = (movie) => {
    setBooking((b) => ({ ...b, movie, showtime: null }));
    setMovieOpen(false);
    setShowtimeOpen(true);
  };

  const scrollMovies = (direction) => {
    if (movieScrollRef.current) {
      const amount = direction * 280;
      movieScrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (movieOpen && booking.movie && movieScrollRef.current) {
      const selectedId = booking.movie.id;
      setTimeout(() => {
        const cardEl = document.getElementById(`movie-card-${selectedId}`);
        const container = movieScrollRef.current;
        if (cardEl && container) {
          const rect = cardEl.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          const containerWidth = container.offsetWidth;
          const scrollLeft = container.scrollLeft + rect.left - containerRect.left - (containerWidth / 2) + (rect.width / 2);
          container.scrollTo({
            left: scrollLeft,
            behavior: 'smooth',
          });
        }
      }, 150);
    }
  }, [movieOpen, booking.movie]);

  return (
    <div className="space-y-3">
      {/* ── Accordion: Chọn phim ── */}
      <div
        className="rounded-2xl border overflow-hidden transition-all duration-300"
        style={{
          background: '#1A1A1A',
          borderColor: movieOpen ? 'var(--color-select)' : 'rgba(255,255,255,0.06)',
        }}
      >
        <button
          className="w-full flex items-center justify-between px-5 py-4 cursor-pointer group"
          onClick={() => setMovieOpen((o) => !o)}
        >
          <h2 className="text-white font-bold text-base sm:text-lg flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-left">
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center font-bold flex-shrink-0"
              style={{ background: '#CF0F47', fontSize: 12, color: '#fff' }}
            >
              1
            </span>
            <span className="flex-shrink-0">Chọn phim</span>
            {booking.movie && (
              <>
                <span className="text-zinc-500 font-normal flex-shrink-0">—</span>
                <span
                  className="font-semibold break-words min-w-0"
                  style={{ color: 'var(--color-select)', wordBreak: 'break-word' }}
                >
                  {booking.movie.title}
                </span>
              </>
            )}
          </h2>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:bg-white/8"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="w-4 h-4 text-zinc-400 transition-transform duration-300"
              style={{ transform: movieOpen ? 'rotate(0deg)' : 'rotate(180deg)' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </div>
        </button>

        <div
          className="overflow-hidden transition-all duration-400 ease-in-out"
          style={{ maxHeight: movieOpen ? '9999px' : '0px' }}
        >
          <div className="border-t border-white/6 p-5 relative group/slider bg-zinc-955/10">
            {movies.length > 8 && (
              <button
                onClick={() => scrollMovies(-1)}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center text-zinc-300 hover:text-white bg-zinc-900/90 hover:bg-zinc-800 transition-all cursor-pointer border border-white/8 shadow-xl"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4.5 h-4.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            <div
              ref={movieScrollRef}
              className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 px-1"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {pairedMovieColumns.map((col, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-6 w-[calc((100%-16px)/2)] sm:w-[calc((100%-32px)/3)] lg:w-[calc((100%-48px)/4)] shrink-0 snap-start"
                >
                  {col.top && (
                    <BookingMovieCard
                      movie={col.top}
                      selected={booking.movie?.id === col.top.id}
                      onClick={() => handleSelectMovie(col.top)}
                    />
                  )}
                  {col.bottom && (
                    <BookingMovieCard
                      movie={col.bottom}
                      selected={booking.movie?.id === col.bottom.id}
                      onClick={() => handleSelectMovie(col.bottom)}
                    />
                  )}
                </div>
              ))}
            </div>

            {movies.length > 8 && (
              <button
                onClick={() => scrollMovies(1)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center text-zinc-300 hover:text-white bg-zinc-900/90 hover:bg-zinc-800 transition-all cursor-pointer border border-white/8 shadow-xl"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4.5 h-4.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Accordion: Chọn suất chiếu ── */}
      <div
        className="rounded-2xl border overflow-hidden transition-all duration-300"
        style={{
          background: '#1A1A1A',
          borderColor: showtimeOpen ? 'var(--color-select)' : 'rgba(255,255,255,0.06)',
          opacity: !booking.movie && !showtimeOpen ? 0.45 : 1,
        }}
      >
        <button
          className="w-full flex items-center justify-between px-5 py-4 cursor-pointer group disabled:cursor-not-allowed"
          onClick={() => booking.movie && setShowtimeOpen((o) => !o)}
          disabled={!booking.movie}
        >
          <h2 className="text-white font-bold text-base sm:text-lg flex items-center gap-2.5">
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center font-bold flex-shrink-0"
              style={{ background: '#CF0F47', fontSize: 12, color: '#fff' }}
            >
              2
            </span>
            <span>Chọn suất chiếu</span>
            {booking.showtime && (
              <>
                <span className="text-zinc-500 font-normal">—</span>
                <span className="font-semibold" style={{ color: 'var(--color-select)' }}>
                  {booking.showtime.start}
                </span>
              </>
            )}
          </h2>
          <div className="flex items-center gap-2">
            {!booking.movie && (
              <span className="text-zinc-650 text-xs hidden sm:block">Vui lòng chọn phim trước</span>
            )}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:bg-white/8"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="w-4 h-4 text-zinc-400 transition-transform duration-300"
                style={{ transform: showtimeOpen ? 'rotate(0deg)' : 'rotate(180deg)' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            </div>
          </div>
        </button>

        <div
          className="overflow-hidden transition-all duration-400 ease-in-out"
          style={{ maxHeight: showtimeOpen ? '9999px' : '0px' }}
        >
          <div className="border-t border-white/6">
            <div className="flex items-center justify-center gap-3 px-4 py-5 border-b border-white/5 bg-transparent">
              <button
                onClick={() => setDateWindowStart((s) => Math.max(0, s - 1))}
                disabled={dateWindowStart === 0}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/8 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-default"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <div className="flex gap-2 justify-center">
                {visibleDates.map((d) => {
                  const sel = booking.date?.key === d.key;
                  return (
                    <button
                      key={d.key}
                      id={`date-${d.key}`}
                      onClick={() => setBooking((b) => ({ ...b, date: d, showtime: null }))}
                      className="w-[72px] h-[56px] flex flex-col items-center justify-center rounded-xl border transition-all duration-200 cursor-pointer"
                      style={{
                        background: sel ? 'var(--color-select)' : 'rgba(255,255,255,0.03)',
                        borderColor: sel ? 'var(--color-select)' : 'rgba(255,255,255,0.07)',
                      }}
                    >
                      <span className="font-bold text-xs" style={{ color: sel ? '#fff' : '#8A8A8A' }}>
                        {d.dayLabel}
                      </span>
                      <span className="text-xs mt-0.5" style={{ color: sel ? '#E6E6E6' : '#555' }}>
                        {d.dateLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setDateWindowStart((s) => Math.min(availableDates.length - 5, s + 1))}
                disabled={dateWindowStart >= availableDates.length - 5}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/8 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-default"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>

            <div className="px-5 py-5 space-y-6">
              {Object.entries(showtimesByLang).map(([groupLabel, slots]) => {
                const parts = groupLabel.split(' ');
                const format = parts[0];
                const lang = parts.slice(1).join(' ');
                return (
                  <div key={groupLabel} className="space-y-3 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] tracking-widest font-bold px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded border border-zinc-700/50">
                        {format}
                      </span>
                      <span className="text-[10px] tracking-wider font-medium px-2 py-0.5 bg-zinc-900 text-zinc-400 rounded">
                        {lang}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      {slots.map((st) => {
                        const sel = booking.showtime?.id === st.id;
                        const low = st.available <= 20;
                        return (
                          <button
                            key={st.id}
                            id={`showtime-${st.id}`}
                            onClick={() => setBooking((b) => ({ ...b, showtime: st }))}
                            className="flex flex-col items-center justify-between rounded-xl border transition-all duration-200 cursor-pointer hover:-translate-y-0.5 text-center overflow-hidden"
                            style={{
                              width: '92px',
                              height: '82px',
                              background: sel ? 'var(--color-select)' : 'rgba(255,255,255,0.03)',
                              borderColor: sel ? 'var(--color-select)' : 'rgba(255,255,255,0.07)',
                              padding: 0,
                            }}
                          >
                            <div className="flex-1 flex flex-col justify-center items-center pt-2">
                              <span className="font-extrabold text-base tracking-wide" style={{ color: '#FFFFFF', lineHeight: 1.1 }}>
                                {st.start}
                              </span>
                              <span className="text-[11px] font-normal" style={{ color: sel ? 'rgba(255, 255, 255, 0.7)' : '#555', marginTop: '1px' }}>
                                ~ {st.end}
                              </span>
                            </div>

                            <div
                              className="w-full py-1 flex items-center justify-center border-t text-[10px] font-semibold"
                              style={{
                                background: sel ? 'rgba(0, 0, 0, 0.15)' : 'rgba(0, 0, 0, 0.25)',
                                borderColor: sel ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                              }}
                            >
                              <span style={{ color: low ? (sel ? '#FFFFFF' : '#ef4444') : (sel ? '#FFFFFF' : '#737373') }}>
                                {st.available}/100
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
