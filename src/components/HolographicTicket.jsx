import { useState, useRef, useMemo } from 'react';

export default function HolographicTicket({ ticket }) {
  const cardRef = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [shine, setShine] = useState({ x: 50, y: 50, opacity: 0 });

  const { movie, showtime, date, seats, total, ticketCode, payment, combos } = ticket;

  // Formatting utility
  const fmtVND = (n) => (n === 0 ? '0đ' : n.toLocaleString('vi-VN') + 'đ');

  // Parse active combos list
  const activeCombosList = useMemo(() => {
    if (!combos) return [];
    if (Array.isArray(combos)) return combos; // standard format
    // If it's a map (from Booking page state)
    // We'd map over it, but inside SuccessScreen we already pre-parsed it. 
    // Let's support both formats.
    return Object.entries(combos)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => `${qty}x Combo`);
  }, [combos]);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Tọa độ chuột tương đối từ tâm thẻ (-0.5 đến 0.5)
    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;

    // Góc nghiêng 3D (Xoay tối đa 15 độ)
    const rotX = -mouseY * 18;
    const rotY = mouseX * 18;

    // Vị trí của luồng sáng phản quang (Hologram shine)
    const shineX = (mouseX + 0.5) * 100;
    const shineY = (mouseY + 0.5) * 100;

    setRotate({ x: rotX, y: rotY });
    setShine({ x: shineX, y: shineY, opacity: 0.55 });
  };

  const handleMouseLeave = () => {
    // Reset về vị trí ban đầu một cách mượt mà
    setRotate({ x: 0, y: 0 });
    setShine(prev => ({ ...prev, opacity: 0 }));
  };

  // Convert seat names to list
  const seatListStr = useMemo(() => {
    if (!seats) return '';
    if (typeof seats === 'string') return seats;
    if (Array.isArray(seats)) {
      return seats.map(s => typeof s === 'object' ? s.id : s).join(', ');
    }
    return '';
  }, [seats]);

  return (
    <div className="w-full flex justify-center py-4 select-none">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full max-w-2xl rounded-2xl relative shadow-[0_25px_60px_rgba(0,0,0,0.65)] border border-zinc-800/80 overflow-visible transition-all duration-300 ease-out cursor-pointer hover:border-zinc-700/50"
        style={{
          background: 'linear-gradient(135deg, #1C1C1E 0%, #0F0F10 100%)',
          transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1.01, 1.01, 1.01)`,
          transformStyle: 'preserve-3d',
          transition: rotate.x === 0 ? 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.3s' : 'none',
        }}
      >
        {/* Hologram Reflection Layer (Shine Overlay) */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none z-30 transition-opacity duration-500 mix-blend-color-dodge"
          style={{
            opacity: shine.opacity,
            background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255, 255, 255, 0.4) 0%, rgba(207, 15, 71, 0.25) 30%, rgba(14, 161, 207, 0.25) 50%, rgba(14, 207, 103, 0.15) 75%, transparent 100%)`,
            backgroundSize: '100% 100%',
            transition: shine.opacity === 0 ? 'opacity 0.6s ease' : 'none',
          }}
        />

        {/* Rainbow Shimmer Foil Border (Glowing edges) */}
        <div
          className="absolute -inset-[1px] rounded-2xl pointer-events-none z-10 opacity-30 blur-[0.5px] transition-all duration-300"
          style={{
            background: `conic-gradient(from 180deg at 50% 50%, #CF0F47 0deg, #0EA1CF 120deg, #0ECF67 240deg, #CF0F47 360deg)`,
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            padding: '1px',
          }}
        />

        {/* Perforation Circular Notches */}
        <div className="absolute top-1/2 -translate-y-1/2 -left-3.5 w-7 h-7 rounded-full bg-zinc-950 border-r border-zinc-800/80 z-20" />
        <div className="absolute top-1/2 -translate-y-1/2 -right-3.5 w-7 h-7 rounded-full bg-zinc-950 border-l border-zinc-800/80 z-20" />

        {/* Card Content Grid */}
        <div className="flex flex-col md:flex-row relative z-20">
          
          {/* Left panel (Movie info & Ticket details) */}
          <div className="flex-grow p-6 sm:p-7 flex gap-5">
            
            {/* Movie Poster */}
            <div className="w-24 h-36 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800/80 shrink-0 shadow-lg relative group">
              {movie?.posterUrl && (
                <img src={movie.posterUrl} alt={movie?.title} className="w-full h-full object-cover" />
              )}
              {/* Glass shine on poster */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
            </div>

            {/* Movie Detail text info */}
            <div className="flex-1 min-w-0 text-left">
              <h3 className="text-white font-extrabold text-lg leading-tight mb-2 truncate text-glow-white">
                {movie?.title}
              </h3>
              
              {/* Category Badges Row */}
              <div className="flex flex-wrap gap-2 mb-3.5">
                {showtime && (
                  <>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white/5 border border-white/10 text-text-sub2 uppercase tracking-wide">
                      {showtime.format}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white/5 border border-white/10 text-text-sub2 tracking-wide">
                      {showtime.lang === 'Phụ đề' ? 'Phụ đề' : 'Thuyết minh'}
                    </span>
                  </>
                )}
                {movie?.ageRating && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cta/15 border border-cta/30 text-cta-light uppercase tracking-wide">
                    {movie.ageRating}
                  </span>
                )}
              </div>

              {/* Grid ticket specs */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                <div>
                  <p className="text-[9px] text-text-sub3 uppercase tracking-wider font-bold">Ngày chiếu</p>
                  <p className="text-white text-xs font-semibold mt-0.5">
                    {date?.dateLabel || date}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-text-sub3 uppercase tracking-wider font-bold">Suất chiếu</p>
                  <p className="text-white text-xs font-semibold mt-0.5">
                    {showtime?.start || showtime} {showtime?.end ? `~ ${showtime.end}` : ''}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-text-sub3 uppercase tracking-wider font-bold">Phòng chiếu</p>
                  <p className="text-white text-xs font-semibold mt-0.5">
                    {showtime?.room || 'Phòng chiếu'}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-text-sub3 uppercase tracking-wider font-bold">Ghế ngồi</p>
                  <p className="text-[#0ECF67] text-xs font-bold mt-0.5">
                    {seatListStr}
                  </p>
                </div>
                {activeCombosList.length > 0 && (
                  <div className="col-span-2">
                    <p className="text-[9px] text-text-sub3 uppercase tracking-wider font-bold">Đồ ăn &amp; Nước uống</p>
                    <p className="text-text-sub2 text-xs font-medium mt-0.5">
                      {activeCombosList.join(', ')}
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Vertical tear-off dashed connector */}
          <div className="relative flex md:flex-col items-center justify-between" style={{ minWidth: 1 }}>
            {/* Top semi-circle cover */}
            <div className="hidden md:block absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-zinc-950 border-b border-zinc-800/80 z-10" />
            {/* Vertical dashed line */}
            <div className="flex-1 w-full border-t md:border-t-0 md:border-l border-dashed border-zinc-800/80 my-0 md:my-6 h-px md:h-auto" />
            {/* Bottom semi-circle cover */}
            <div className="hidden md:block absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-zinc-950 border-t border-zinc-800/80 z-10" />
          </div>

          {/* Right panel (Pricing & Interactive Barcode) */}
          <div className="w-full md:w-52 p-6 sm:p-7 flex flex-col justify-between items-center border-t md:border-t-0 border-zinc-800/60 relative">
            
            {/* Barcode block */}
            <div className="flex flex-col items-center">
              <div className="relative bg-white p-2.5 rounded-lg w-36 shadow-inner flex flex-col items-center overflow-hidden border border-white/10">
                {/* Laser scan line animation overlay */}
                <div className="absolute left-0 right-0 h-[2px] bg-red-500/80 top-0 shadow-[0_0_8px_#ef4444] animate-laser-scan z-10" />
                
                {/* Visual barcode mockup bars */}
                <div className="flex gap-[1.5px] h-11 items-center justify-center w-full">
                  {[1, 2, 1, 3, 1, 1, 2, 4, 1, 2, 3, 1, 2, 1, 4, 2, 1, 3, 2, 1, 1, 2, 2, 1, 3].map((w, i) => (
                    <span key={i} className="bg-black h-full shrink-0" style={{ width: w }} />
                  ))}
                </div>
              </div>
              <p className="text-text-sub3 text-[10px] mt-2 font-mono tracking-wider">{ticketCode}</p>
            </div>

            {/* Total price */}
            <div className="text-center mt-5 md:mt-0">
              <p className="text-text-sub3 text-[9px] uppercase tracking-wider font-bold mb-0.5">Tổng cộng</p>
              <p className="text-2xl font-black text-cta-light leading-none">{fmtVND(total)}</p>
            </div>

          </div>

        </div>

        {/* Ambient bottom security bar */}
        <div className="border-t border-zinc-800/60 px-6 py-4 flex flex-col sm:flex-row gap-3 items-center justify-between bg-black/35 rounded-b-2xl text-left">
          <div className="flex items-center gap-2">
            {payment && (
              <>
                <div
                  className="w-5.5 h-5.5 rounded flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
                  style={{ background: payment.bg || '#15803d' }}
                >
                  {payment.letter || '₫'}
                </div>
                <span className="text-text-sub2 text-xs font-semibold">{payment.name || payment}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-sub3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-[#0ECF67]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-[11px] font-semibold text-zinc-500">Mã vé hợp lệ &amp; Bảo mật</span>
          </div>
        </div>

        {/* Global style injections for barcode laser scan */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes laser-scan {
            0% { top: 0px; }
            50% { top: 52px; }
            100% { top: 0px; }
          }
          .animate-laser-scan {
            animation: laser-scan 2.5s linear infinite;
          }
          .text-glow-white {
            text-shadow: 0 0 10px rgba(255,255,255,0.15);
          }
        `}} />
      </div>
    </div>
  );
}
