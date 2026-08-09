import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { preventOrphan } from '../utils/textUtils';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function EventSwiper({ events = [] }) {
  const navigate = useNavigate();
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  if (!events || events.length === 0) {
    return (
      <div className="py-12 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/40">
        Đang cập nhật các chương trình sự kiện mới nhất...
      </div>
    );
  }

  return (
    <div className="relative group/swiper">
      {/* Custom Navigation Arrows */}
      <button
        ref={prevRef}
        className="absolute -left-4 top-1/3 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-zinc-900/90 border border-zinc-700 text-white flex items-center justify-center shadow-2xl opacity-0 group-hover/swiper:opacity-100 transition-all duration-300 hover:bg-cta hover:border-cta cursor-pointer disabled:opacity-0"
        aria-label="Sự kiện trước"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        ref={nextRef}
        className="absolute -right-4 top-1/3 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-zinc-900/90 border border-zinc-700 text-white flex items-center justify-center shadow-2xl opacity-0 group-hover/swiper:opacity-100 transition-all duration-300 hover:bg-cta hover:border-cta cursor-pointer disabled:opacity-0"
        aria-label="Sự kiện kế tiếp"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Swiper Container */}
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        autoplay={{
          delay: 3500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={events.length > 1}
        spaceBetween={20}
        slidesPerView={1}
        onBeforeInit={(swiper) => {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
        }}
        breakpoints={{
          640: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 24,
          },
        }}
        className="w-full !pb-2"
      >
        {events.map((item) => (
          <SwiperSlide key={item.id}>
            <div
              onClick={() => navigate(`/events/${item.id}`)}
              className="group flex flex-col cursor-pointer text-left space-y-3"
            >
              {/* Event Banner Container */}
              <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800/80 relative shadow-md group-hover:border-cta/50 transition-colors">
                {item.banner || item.poster ? (
                  <img
                    src={item.banner || item.poster}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600 font-bold text-xs">
                    No Image
                  </div>
                )}
              </div>

              {/* Event Name Title Below Card */}
              <div className="pt-1">
                <h3 className="text-sm sm:text-base font-bold text-white line-clamp-2 leading-snug">
                  {preventOrphan(item.title)}
                </h3>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
