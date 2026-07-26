import { useEffect, useRef } from 'react';

export default function ProjectorBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const getLightSource = () => {
      return {
        x: canvas.width * 0.85,
        y: canvas.height * 0.03
      };
    };

    const spawnParticle = (p, isInitial = false) => {
      const source = getLightSource();
      const angle = 170 + Math.random() * 90;
      const angleRad = (angle - 90) * (Math.PI / 180);
      const maxDist = Math.max(canvas.width, canvas.height) * 0.85;
      const dist = (isInitial ? Math.random() : 0.05 + Math.random() * 0.15) * maxDist;

      p.x = source.x + Math.cos(angleRad) * dist;
      p.y = source.y + Math.sin(angleRad) * dist;
      p.radius = Math.random() * 0.75 + 0.15;

      const speed = Math.random() * 0.08 + 0.02;
      const driftAngle = (215 + (Math.random() - 0.5) * 50) * (Math.PI / 180);
      p.vx = Math.cos(driftAngle) * speed;
      p.vy = Math.sin(driftAngle) * speed;
      p.phase = Math.random() * Math.PI * 2;
      p.swaySpeed = Math.random() * 0.015 + 0.003;

      p.maxAlpha = Math.random() * 0.32 + 0.08;
      p.alpha = isInitial ? Math.random() * p.maxAlpha : 0;
      p.fadeSpeed = Math.random() * 0.003 + 0.0008;
      p.growing = true;
      p.fadingOut = false;
    };

    // Detect mobile for rendering optimization
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 35 : 200;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      const p = {};
      spawnParticle(p, true);
      particles.push(p);
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const source = getLightSource();
      const maxDist = Math.max(canvas.width, canvas.height) * 0.8;

      particles.forEach((p) => {
        p.phase += p.swaySpeed;
        p.vx += (Math.random() - 0.5) * 0.006;
        p.vy += (Math.random() - 0.5) * 0.006;

        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const maxSpeed = 0.25;
        if (speed > maxSpeed) {
          p.vx = (p.vx / speed) * maxSpeed;
          p.vy = (p.vy / speed) * maxSpeed;
        }

        p.x += p.vx + Math.sin(p.phase) * 0.15;
        p.y += p.vy + Math.cos(p.phase * 0.7) * 0.1;

        let isInside = true;
        let edgeMultiplier = 1;
        let distMultiplier = 1;

        if (!isMobile) {
          const dx = p.x - source.x;
          const dy = p.y - source.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let angleRad = Math.atan2(dy, dx);
          let angleDeg = angleRad * (180 / Math.PI);
          if (angleDeg < 0) angleDeg += 360;
          const cssAngle = (angleDeg + 90) % 360;

          const inBeamAngle = cssAngle >= 170 && cssAngle <= 260;
          const inBeamDist = dist < maxDist;
          isInside = inBeamAngle && inBeamDist && p.x >= 0 && p.x <= canvas.width && p.y >= -100 && p.y <= canvas.height;

          if (isInside) {
            const devToCenter = Math.abs(cssAngle - 215);
            edgeMultiplier = Math.max(0, 1 - (devToCenter / 45));
            distMultiplier = Math.max(0, 1 - (dist / maxDist));
          }
        } else {
          // Simplier screen boundary check for mobile performance
          isInside = p.x >= 0 && p.x <= canvas.width && p.y >= -100 && p.y <= canvas.height;
        }

        if (!isInside) {
          p.fadingOut = true;
        }

        if (p.fadingOut) {
          p.alpha -= p.fadeSpeed * 3;
          if (p.alpha <= 0) {
            spawnParticle(p, false);
          }
        } else {
          if (p.growing) {
            p.alpha += p.fadeSpeed;
            if (p.alpha >= p.maxAlpha) {
              p.growing = false;
            }
          } else {
            p.alpha -= p.fadeSpeed;
            if (p.alpha <= 0.05) {
              p.growing = true;
            }
          }
        }

        if (p.alpha > 0) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 252, 240, ${Math.min(0.55, p.alpha * edgeMultiplier * distMultiplier)})`;
          
          if (!isMobile) {
            // Disable expensive shadows on mobile devices
            ctx.shadowBlur = p.radius * 2.5;
            ctx.shadowColor = 'rgba(255, 255, 255, 0.22)';
          }
          ctx.fill();
        }
      });

      ctx.shadowBlur = 0;
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      {/* Background Image with dim overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{
          backgroundImage: `url('/images/photo-1595769816263-9b910be24d5f.avif')`,
          filter: 'grayscale(100%) brightness(0.4) contrast(1)'
        }}
      />

      {/* Moving Dust Particles Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 50 }}
      />

      {/* Volumetric Conic Spotlight – triangular cone from top-right */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 40 }}>
        {/* Outer wide cone */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `conic-gradient(
              at 85% 3%,
              transparent 165deg,
              rgba(255, 253, 210, 0.03) 182deg,
              rgba(255, 252, 215, 0.09) 208deg,
              rgba(255, 253, 210, 0.09) 225deg,
              rgba(255, 252, 215, 0.03) 248deg,
              transparent 285deg
            )`,
            filter: 'blur(28px)',
            opacity: 0.90,
          }}
        />
        {/* Inner bright core cone */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `conic-gradient(
              at 85% 3%,
              transparent 182deg,
              rgba(255, 255, 255, 0.03) 200deg,
              rgba(255, 255, 255, 0.10) 215deg,
              rgba(255, 255, 255, 0.10) 232deg,
              rgba(255, 255, 255, 0.03) 247deg,
              transparent 262deg
            )`,
            filter: 'blur(12px)',
            opacity: 0.85,
          }}
        />
        {/* Focal pool of light */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '640px',
            height: '640px',
            background: 'radial-gradient(ellipse at center, rgba(255, 252, 220, 0.10) 0%, rgba(255, 252, 220, 0.05) 40%, transparent 70%)',
            transform: 'translate(-50%, -50%)',
            filter: 'blur(30px)',
          }}
        />
        {/* Lens glow at the ceiling fixture */}
        <div
          style={{
            position: 'absolute',
            top: '3%',
            left: '85%',
            width: '70px',
            height: '28px',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.7) 40%, rgba(255, 255, 255, 0) 80%)',
            borderRadius: '50%',
            filter: 'blur(7px)',
            transform: 'translate(-50%, -50%)',
            zIndex: 41,
            opacity: 0.9,
          }}
        />
        {/* Warm halo around fixture */}
        <div
          style={{
            position: 'absolute',
            top: '3%',
            left: '85%',
            width: '220px',
            height: '120px',
            background: 'radial-gradient(circle, rgba(255, 243, 200, 0.35) 0%, rgba(255, 255, 255, 0) 70%)',
            borderRadius: '50%',
            filter: 'blur(18px)',
            transform: 'translate(-50%, -50%)',
            zIndex: 41,
          }}
        />
      </div>

      <style>{`
        .register-card {
          background: linear-gradient(to bottom, rgba(10, 10, 14, 0.72) 0%, rgba(8, 8, 12, 0.78) 100%);
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255,255,255,0.07);
          position: relative;
        }
        .register-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 16px;
          padding: 1.5px;
          background: linear-gradient(225deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.25) 35%, rgba(255, 255, 255, 0.10) 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          pointer-events: none;
        }
        .light-cast-input {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .light-cast-input:focus {
          outline: none;
          background-color: rgba(63, 63, 70, 0.5) !important;
          border-color: rgba(255, 255, 255, 0.35) !important;
          box-shadow: 
            -10px 10px 20px rgba(0, 0, 0, 0.65),
            inset -1px 1px 0px rgba(255, 255, 255, 0.12),
            inset 1px -1px 0px rgba(0, 0, 0, 0.35);
        }
        .light-cast-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .light-cast-btn:hover {
          transform: translateY(-1px);
          box-shadow: 
            -12px 12px 24px rgba(207, 15, 71, 0.45),
            -5px 5px 10px rgba(0, 0, 0, 0.3),
            inset -1px 1px 0px rgba(255, 255, 255, 0.2);
        }
        .light-cast-btn:active {
          transform: translateY(1px);
          box-shadow: -4px 4px 10px rgba(207, 15, 71, 0.3);
        }
        .light-cast-google {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .light-cast-google:hover {
          transform: translateY(-1px);
          background-color: rgba(63, 63, 70, 0.65) !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
          box-shadow: 
            -10px 10px 20px rgba(0, 0, 0, 0.6),
            inset -1px 1px 0px rgba(255, 255, 255, 0.08);
        }
        .light-cast-google:active {
          transform: translateY(1px);
        }
        .custom-date-input::-webkit-calendar-picker-indicator {
          opacity: 0;
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
          cursor: pointer;
        }
        .custom-date-input {
          color-scheme: dark;
        }
      `}</style>
    </>
  );
}
