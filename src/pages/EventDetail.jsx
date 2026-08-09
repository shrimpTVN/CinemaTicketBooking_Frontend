import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById, getAllEvents } from '../services/eventService';
import BackButton from '../components/BackButton';
import SectionHeading from '../components/SectionHeading';
import ScrollReveal from '../components/ScrollReveal';
import { Calendar } from 'lucide-react';
import { preventOrphan } from '../utils/textUtils';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventData = async () => {
      setLoading(true);
      try {
        const [data, allData] = await Promise.all([
          getEventById(id),
          getAllEvents()
        ]);
        setEvent(data);
        if (Array.isArray(allData)) {
          setRelatedEvents(allData.filter(e => String(e.id) !== String(id)).slice(0, 4));
        }
      } catch (err) {
        console.error(`Failed to fetch event ${id}:`, err);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };
    fetchEventData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return (
      <div className="bg-bg-dark text-text-main min-h-screen pt-20 pb-20 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cta mx-auto mb-4"></div>
          <p className="text-zinc-400 text-sm">Đang tải thông tin sự kiện...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="bg-bg-dark text-text-main min-h-screen pt-20 pb-20 max-w-7xl mx-auto px-4 text-center">
        <div className="p-12 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/40 space-y-4">
          <Calendar className="w-12 h-12 text-zinc-600 mx-auto" />
          <h2 className="text-xl font-bold text-white">Sự kiện không tồn tại hoặc đã bị gỡ bỏ</h2>
          <div>
            <BackButton label="Quay lại" to="/events" />
          </div>
        </div>
      </div>
    );
  }

  const imageUrl = event.banner || event.poster;

  return (
    <div className="bg-bg-dark text-text-main min-h-screen pt-8 pb-24 text-left">
      {/* Reusable Back button */}
      <section className="max-w-7xl mx-auto px-4 mb-6">
        <BackButton label="Quay lại" to="/events" />
      </section>

      {/* Main Event Article Container - Matched to max-w-7xl */}
      <section className="max-w-7xl mx-auto px-4">
        <ScrollReveal direction="up">
          <article className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl space-y-6 p-6 sm:p-10">
            {/* Event Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              {preventOrphan(event.title) || 'Sự kiện'}
            </h1>

            {/* Banner / Poster Image */}
            {imageUrl && (
              <div className="w-full rounded-xl overflow-hidden">
                <img
                  src={imageUrl}
                  alt={event.title || 'Event'}
                  className="w-full h-auto rounded-xl object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Event Description Content with Line Breaks Preservation */}
            <div className="border-t border-zinc-800/80 pt-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Nội dung sự kiện
              </h3>
              <div className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal whitespace-pre-line">
                {event.description || 'Chưa có thông tin mô tả chi tiết cho sự kiện này.'}
              </div>
            </div>

            {/* Action Footer */}
            <div className="border-t border-zinc-800/80 pt-8 mt-6 flex justify-center">
              <button
                onClick={() => navigate('/booking')}
                className="px-10 py-3.5 sm:px-12 sm:py-4 bg-cta hover:bg-cta-light text-white font-bold text-base sm:text-lg rounded-xl transition-all hover:scale-105 cursor-pointer shadow-xl shadow-cta/25 font-google-sans uppercase tracking-wider"
              >
                Đặt vé ngay
              </button>
            </div>
          </article>
        </ScrollReveal>
      </section>

      {/* Related Events Section (Poster Grid - Matched to max-w-7xl) */}
      {relatedEvents.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mt-12">
          <div className="border-t border-zinc-800/80 pt-8">
            <ScrollReveal direction="up">
              <SectionHeading className="mb-6">Sự kiện liên quan</SectionHeading>
            </ScrollReveal>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {relatedEvents.map((item, idx) => (
                <ScrollReveal key={item.id} delay={idx * 60} direction="up">
                  <div
                    onClick={() => navigate(`/events/${item.id}`)}
                    className="group flex flex-col space-y-2.5 cursor-pointer text-left"
                  >
                    <div className="aspect-[3/4] w-full rounded-xl overflow-hidden border border-zinc-800/80 bg-zinc-950 transition-all duration-300 group-hover:border-cta/60 group-hover:shadow-xl group-hover:-translate-y-1">
                      {item.poster || item.banner ? (
                        <img
                          src={item.poster || item.banner}
                          alt={item.title || 'Sự kiện'}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600 font-bold text-xs">
                          No Poster
                        </div>
                      )}
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug">
                      {preventOrphan(item.title)}
                    </h4>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
