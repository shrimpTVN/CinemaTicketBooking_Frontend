import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionHeading from '../components/SectionHeading';
import ScrollReveal from '../components/ScrollReveal';
import { getAllHallTypes } from '../services/hallService';

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop';

const FALLBACK_IMAGES = {
  '2d': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop',
  '3d': 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop',
  'imax': 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800&auto=format&fit=crop',
  '4dx': 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop',
  'screenx': 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800&auto=format&fit=crop',
  'starium': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop',
  'gold-class': 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?q=80&w=800&auto=format&fit=crop',
  'lamour': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop',
  'cine-living': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
  'cine-suite': 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?q=80&w=800&auto=format&fit=crop',
  'cine-foret': 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop'
};

const DEFAULT_TECH_TYPES = [
  { id: '3d', name: '3D Tiêu Chuẩn', style: 'Công nghệ', image: FALLBACK_IMAGES['3d'] },
  { id: 'imax', name: 'IMAX®', style: 'Công nghệ', image: FALLBACK_IMAGES['imax'] },
  { id: '4dx', name: '4DX®', style: 'Công nghệ', image: FALLBACK_IMAGES['4dx'] },
  { id: 'screenx', name: 'ScreenX', style: 'Công nghệ', image: FALLBACK_IMAGES['screenx'] },
  { id: 'starium', name: 'Starium', style: 'Công nghệ', image: FALLBACK_IMAGES['starium'] }
];

const DEFAULT_CONCEPT_TYPES = [
  { id: 'gold-class', name: 'Gold Class', style: 'Phong cách', image: FALLBACK_IMAGES['gold-class'] },
  { id: 'lamour', name: 'L\'amour', style: 'Phong cách', image: FALLBACK_IMAGES['lamour'] },
  { id: 'cine-living', name: 'Cine & Living', style: 'Phong cách', image: FALLBACK_IMAGES['cine-living'] },
  { id: 'cine-suite', name: 'Cine & Suite', style: 'Phong cách', image: FALLBACK_IMAGES['cine-suite'] },
  { id: 'cine-foret', name: 'Cine & Forêt', style: 'Phong cách', image: FALLBACK_IMAGES['cine-foret'] }
];

export default function Hall() {
  const navigate = useNavigate();
  const [techHalls, setTechHalls] = useState([]);
  const [conceptHalls, setConceptHalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHallTypes = async () => {
      setLoading(true);
      try {
        const types = await getAllHallTypes();
        if (Array.isArray(types) && types.length > 0) {
          const tech = [];
          const concept = [];

          types.forEach((item) => {
            const idStr = String(item.id).toLowerCase();
            const nameLower = (item.name || '').toLowerCase();
            const styleLower = (item.style || '').toLowerCase();

            // Filter out 2D / thông thường standard hall types
            if (idStr === '2d' || nameLower === '2d' || nameLower.includes('phòng chiếu 2d') || nameLower.includes('2d tiêu chuẩn') || styleLower.includes('thông thường')) {
              return;
            }

            const itemImages = (Array.isArray(item.images) && item.images.length > 0) 
              ? item.images[0] 
              : (FALLBACK_IMAGES[String(item.id).toLowerCase()] || DEFAULT_FALLBACK_IMAGE);
              
            const formattedItem = {
              id: item.id,
              label: item.name,
              image: itemImages,
              description: item.description,
              style: item.style
            };

            if (styleLower.includes('phong cách') || styleLower.includes('vip') || styleLower.includes('luxury') || nameLower.includes('gold') || nameLower.includes('amour') || nameLower.includes('living') || nameLower.includes('suite') || nameLower.includes('foret')) {
              concept.push(formattedItem);
            } else {
              tech.push(formattedItem);
            }
          });

          setTechHalls(tech.length > 0 ? tech : DEFAULT_TECH_TYPES.map(t => ({ id: t.id, label: t.name, image: t.image })));
          setConceptHalls(concept.length > 0 ? concept : DEFAULT_CONCEPT_TYPES.map(c => ({ id: c.id, label: c.name, image: c.image })));
        } else {
          setTechHalls(DEFAULT_TECH_TYPES.map(t => ({ id: t.id, label: t.name, image: t.image })));
          setConceptHalls(DEFAULT_CONCEPT_TYPES.map(c => ({ id: c.id, label: c.name, image: c.image })));
        }
      } catch (err) {
        console.error('Failed to load hall types from backend:', err);
        setTechHalls(DEFAULT_TECH_TYPES.map(t => ({ id: t.id, label: t.name, image: t.image })));
        setConceptHalls(DEFAULT_CONCEPT_TYPES.map(c => ({ id: c.id, label: c.name, image: c.image })));
      } finally {
        setLoading(false);
      }
    };

    fetchHallTypes();
  }, []);

  const handleCardClick = (hallId) => {
    navigate(`/hall/${hallId}`);
  };

  return (
    <div className="bg-bg-dark text-text-main min-h-screen pt-12 pb-24 space-y-16">
      {loading ? (
        <div className="max-w-7xl mx-auto px-4 text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cta mx-auto mb-4"></div>
          <p className="text-zinc-400 text-sm font-medium">Đang tải danh sách phòng chiếu từ hệ thống...</p>
        </div>
      ) : (
        <>
          {/* 1. Technology Section */}
          <section className="max-w-7xl mx-auto px-4 text-left">
            <ScrollReveal direction="up">
              <SectionHeading hasBorder={true} className="mb-8">
                Công nghệ
              </SectionHeading>
            </ScrollReveal>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {techHalls.map((hall, idx) => (
                <ScrollReveal key={hall.id} delay={(idx % 3) * 80} direction="up">
                  <div
                    onClick={() => handleCardClick(hall.id)}
                    className="group relative overflow-hidden rounded-xl border border-zinc-800 hover:border-white bg-zinc-950 aspect-[16/10] cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                  >
                    <img
                      src={hall.image}
                      alt={hall.label}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent z-10"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-5 text-left z-20">
                      <h3 className="text-subtitle font-bold text-white transition-colors">
                        {hall.label}
                      </h3>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </section>

          {/* 2. Concept/Style Section */}
          <section className="max-w-7xl mx-auto px-4 text-left">
            <ScrollReveal direction="up">
              <SectionHeading hasBorder={true} className="mb-8">
                Phong cách
              </SectionHeading>
            </ScrollReveal>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {conceptHalls.map((hall, idx) => (
                <ScrollReveal key={hall.id} delay={(idx % 3) * 80} direction="up">
                  <div
                    onClick={() => handleCardClick(hall.id)}
                    className="group relative overflow-hidden rounded-xl border border-zinc-800 hover:border-white bg-zinc-950 aspect-[16/10] cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                  >
                    <img
                      src={hall.image}
                      alt={hall.label}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent z-10"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-5 text-left z-20">
                      <h3 className="text-subtitle font-bold text-white transition-colors">
                        {hall.label}
                      </h3>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
