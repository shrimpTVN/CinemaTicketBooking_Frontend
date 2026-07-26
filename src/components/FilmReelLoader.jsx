export default function FilmReelLoader({ text, fullScreen = false, size = 'lg', className = '' }) {
  // Mobile responsive sizing matched to screen width (enlarged for better visual impact)
  const sizeClasses = {
    sm: 'w-16 h-16 sm:w-24 sm:h-24',
    md: 'w-24 h-24 sm:w-36 sm:h-36',
    lg: 'w-36 h-36 sm:w-56 sm:h-56',
    xl: 'w-48 h-48 sm:w-72 sm:h-72',
  }[size] || 'w-36 h-36 sm:w-56 sm:h-56';

  const content = (
    <div className={`flex flex-col items-center justify-center gap-4 sm:gap-6 select-none font-google-sans ${className}`}>
      {/* Lottie Animation & Ambient Glow Container */}
      <div className={`relative ${sizeClasses} flex items-center justify-center`}>
        {/* Red Neon Glow Aura matching App Design System (--color-cta: #CF0F47) */}
        <div className="absolute inset-1 rounded-full bg-[#CF0F47]/30 blur-2xl sm:blur-3xl animate-pulse" />

        {/* Projector Light Beam Glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-radial from-[#CFC10E]/20 via-[#CF0F47]/15 to-transparent blur-xl sm:blur-2xl animate-pulse" />

        {/* LOTTIE PLAYER WEB COMPONENT (LOADED FROM LOCAL ASSETS - 0ms LATENCY) */}
        <lottie-player
          src="/lottie/film-reel.json"
          background="transparent"
          speed="1"
          style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 0 18px rgba(207, 15, 71, 0.75))' }}
          loop
          autoplay
        />
      </div>

      {/* Loading Text Message using Design System Typography (compact & refined) */}
      {text && (
        <div className="flex flex-col items-center gap-1 z-10 px-4 text-center">
          <p className="text-[#D1D5DB] text-[11px] sm:text-[13px] font-semibold uppercase tracking-[0.2em] sm:tracking-[0.3em] opacity-90 animate-pulse drop-shadow-sm">
            {text}
          </p>
          <div className="flex gap-1 sm:gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 sm:w-1.5 sm:h-1.5 rounded-full bg-[#CF0F47] animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 sm:w-1.5 sm:h-1.5 rounded-full bg-[#CF0F47] animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 sm:w-1.5 sm:h-1.5 rounded-full bg-[#CF0F47] animate-bounce" />
          </div>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-[#08080a]/92 backdrop-blur-md z-[99999] flex items-center justify-center p-4 transition-all duration-300 animate-fade-in select-none">
        {content}
      </div>
    );
  }

  return content;
}
