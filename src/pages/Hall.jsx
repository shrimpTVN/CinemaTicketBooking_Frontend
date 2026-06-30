import { useNavigate } from 'react-router-dom';
import SectionHeading from '../components/SectionHeading';

const TECH_HALLS = [
  { id: '2d', label: '2D Tiêu Chuẩn', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop' },
  { id: '3d', label: '3D Tiêu Chuẩn', image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop' },
  { id: 'imax', label: 'IMAX®', image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800&auto=format&fit=crop' },
  { id: '4dx', label: '4DX®', image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop' },
  { id: 'screenx', label: 'ScreenX', image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800&auto=format&fit=crop' },
  { id: 'starium', label: 'Starium', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop' }
];

const CONCEPT_HALLS = [
  { id: 'gold-class', label: 'Gold Class', image: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?q=80&w=800&auto=format&fit=crop' },
  { id: 'lamour', label: 'L\'amour', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop' },
  { id: 'cine-living', label: 'Cine & Living', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop' },
  { id: 'cine-suite', label: 'Cine & Suite', image: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?q=80&w=800&auto=format&fit=crop' },
  { id: 'cine-foret', label: 'Cine & Forêt', image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop' }
];

export default function Hall() {
  const navigate = useNavigate();

  const handleCardClick = (hallId) => {
    navigate(`/hall/${hallId}`);
  };

  return (
    <div className="bg-bg-dark text-text-main min-h-screen pt-12 pb-24 space-y-16">
      {/* 1. Technology Section */}
      <section className="max-w-7xl mx-auto px-4 text-left">
        <SectionHeading hasBorder={true} className="mb-8">
          Công nghệ
        </SectionHeading>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {TECH_HALLS.map((hall) => (
            <div
              key={hall.id}
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
          ))}
        </div>
      </section>

      {/* 2. Concept/Style Section */}
      <section className="max-w-7xl mx-auto px-4 text-left">
        <SectionHeading hasBorder={true} className="mb-8">
          Phong cách
        </SectionHeading>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {CONCEPT_HALLS.map((hall) => (
            <div
              key={hall.id}
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
          ))}
        </div>
      </section>
    </div>
  );
}
