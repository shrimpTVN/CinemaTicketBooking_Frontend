import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionHeading from '../components/SectionHeading';
import ScrollReveal from '../components/ScrollReveal';
import { getAllEvents } from '../services/eventService';
import { preventOrphan } from '../utils/textUtils';

export default function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const data = await getAllEvents();
        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="bg-bg-dark text-text-main min-h-screen pt-8 pb-24 text-left">
      <section className="max-w-7xl mx-auto px-4">
        <ScrollReveal direction="up">
          <SectionHeading className="mb-8">Sự kiện</SectionHeading>
        </ScrollReveal>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col space-y-3 animate-pulse">
                <div className="aspect-[3/4] rounded-xl bg-zinc-900 border border-zinc-800" />
                <div className="h-4 bg-zinc-900 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-950/40">
            <p className="text-sm text-zinc-400">Hiện tại chưa có sự kiện nào trong hệ thống.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {events.map((item, idx) => (
              <ScrollReveal key={item.id} delay={(idx % 4) * 60} direction="up">
                <div
                  onClick={() => navigate(`/events/${item.id}`)}
                  className="group flex flex-col space-y-3 cursor-pointer text-left"
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
                  <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                    {preventOrphan(item.title)}
                  </h3>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
