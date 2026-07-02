import { useState, useEffect } from 'react';

export default function AmbientGlow({ imageUrl, fallbackColor = '#CF0F47' }) {
  const [glowColor, setGlowColor] = useState(fallbackColor);

  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, 1, 1);
          const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
          // Tạo màu với độ sáng nhẹ để làm nền
          setGlowColor(`rgb(${r}, ${g}, ${b})`);
        }
      } catch (err) {
        console.warn('CORS or Canvas error while extracting image dominant color, using fallback color.', err);
        setGlowColor(fallbackColor);
      }
    };

    img.onerror = () => {
      setGlowColor(fallbackColor);
    };
  }, [imageUrl, fallbackColor]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Glow ball 1 */}
      <div
        className="absolute top-[-10%] left-[20%] w-[60vw] h-[60vw] rounded-full opacity-20 filter blur-[100px] sm:blur-[140px]"
        style={{
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          animation: 'ambient-pulse 10s ease-in-out infinite alternate',
        }}
      />
      {/* Glow ball 2 */}
      <div
        className="absolute top-[20%] right-[10%] w-[50vw] h-[50vw] rounded-full opacity-10 filter blur-[120px]"
        style={{
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 60%)`,
          animation: 'ambient-pulse-reverse 14s ease-in-out infinite alternate',
        }}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ambient-pulse {
          0% { transform: translate(0, 0) scale(1); opacity: 0.15; }
          50% { transform: translate(5%, 5%) scale(1.1); opacity: 0.25; }
          100% { transform: translate(-3%, 2%) scale(0.95); opacity: 0.15; }
        }
        @keyframes ambient-pulse-reverse {
          0% { transform: translate(0, 0) scale(1); opacity: 0.08; }
          50% { transform: translate(-4%, 6%) scale(0.9); opacity: 0.15; }
          100% { transform: translate(3%, -3%) scale(1.05); opacity: 0.08; }
        }
      `}} />
    </div>
  );
}
