import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { login as apiLogin } from '../services/authService';

export default function Login() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Canvas floating dust particles animation (Same as Register.jsx)
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

    // Light source center (Ceiling fixture at top-right)
    const getLightSource = () => {
      return {
        x: canvas.width * 0.85,
        y: canvas.height * 0.03
      };
    };

    // Helper to spawn a particle inside the beam
    const spawnParticle = (p, isInitial = false) => {
      const source = getLightSource();
      const angle = 170 + Math.random() * 90; // Wider beam 170-260 deg (down-left)
      const angleRad = (angle - 90) * (Math.PI / 180);
      const maxDist = Math.max(canvas.width, canvas.height) * 0.85;
      const dist = (isInitial ? Math.random() : 0.05 + Math.random() * 0.15) * maxDist;

      p.x = source.x + Math.cos(angleRad) * dist;
      p.y = source.y + Math.sin(angleRad) * dist;
      p.radius = Math.random() * 0.75 + 0.15; // Tiny fine dust: 0.15 – 0.90 px

      // Realistic dust drift: slow initial velocity pointing down-left (southwest)
      const speed = Math.random() * 0.08 + 0.02; // Slower than before – dust floats lazily
      const driftAngle = (215 + (Math.random() - 0.5) * 50) * (Math.PI / 180);
      p.vx = Math.cos(driftAngle) * speed;
      p.vy = Math.sin(driftAngle) * speed;
      p.phase = Math.random() * Math.PI * 2;
      p.swaySpeed = Math.random() * 0.015 + 0.003; // gentler sway

      p.maxAlpha = Math.random() * 0.20 + 0.04; // Very subtle: max 0.24
      p.alpha = isInitial ? Math.random() * p.maxAlpha : 0;
      p.fadeSpeed = Math.random() * 0.003 + 0.0008;
      p.growing = true;
      p.fadingOut = false;
    };

    // Cinema projector dust: 120 particles, very subtle
    const particleCount = 120;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      const p = {};
      spawnParticle(p, true);
      particles.push(p);
    }

    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const source = getLightSource();
      const maxDist = Math.max(canvas.width, canvas.height) * 0.8;

      particles.forEach((p) => {
        // Update phase for swaying oscillation
        p.phase += p.swaySpeed;

        // Subtle air current noise (Brownian motion)
        p.vx += (Math.random() - 0.5) * 0.006;
        p.vy += (Math.random() - 0.5) * 0.006;

        // Apply drag/speed limit to ensure they stay suspended and slow
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const maxSpeed = 0.25;
        if (speed > maxSpeed) {
          p.vx = (p.vx / speed) * maxSpeed;
          p.vy = (p.vy / speed) * maxSpeed;
        }

        // Update positions with drift + gentle swaying
        p.x += p.vx + Math.sin(p.phase) * 0.15;
        p.y += p.vy + Math.cos(p.phase * 0.7) * 0.1;

        // Calculate math values from spotlight source
        const dx = p.x - source.x;
        const dy = p.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let angleRad = Math.atan2(dy, dx);
        let angleDeg = angleRad * (180 / Math.PI);
        if (angleDeg < 0) angleDeg += 360;
        const cssAngle = (angleDeg + 90) % 360;

        // Conic gradient beam active boundaries (down-left, 170-260 deg)
        const inBeamAngle = cssAngle >= 170 && cssAngle <= 260;
        const inBeamDist = dist < maxDist;
        const isInside = inBeamAngle && inBeamDist && p.x >= 0 && p.x <= canvas.width && p.y >= -100 && p.y <= canvas.height;

        if (!isInside) {
          p.fadingOut = true;
        }

        // Fading and Twinkle logic
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

        // Only draw if opacity is positive
        if (p.alpha > 0) {
          // Edge feathering logic based on symmetric beam (center is 215, span is 45)
          const devToCenter = Math.abs(cssAngle - 215);
          const edgeMultiplier = Math.max(0, 1 - (devToCenter / 45));

          // Distance feathering
          const distMultiplier = Math.max(0, 1 - (dist / maxDist));

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

          ctx.fillStyle = `rgba(255, 252, 240, ${Math.min(0.35, p.alpha * edgeMultiplier * distMultiplier)})`;

          // Very faint glow
          ctx.shadowBlur = p.radius * 1.5;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.12)';
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

  // Form handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải từ 6 ký tự trở lên';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const login = useAuthStore((state) => state.login);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      setErrors({});
      try {
        console.log('Logging in user:', formData);
        const response = await apiLogin({
          email: formData.email,
          password: formData.password,
        });

        // Resolve user and token from backend response
        const user = response.user || response.data?.user || response;
        const token = response.token || response.data?.token;

        if (!user || !token) {
          throw new Error('Dữ liệu phản hồi từ máy chủ không hợp lệ');
        }

        login(user, token);
        alert('Đăng nhập thành công!');
        navigate('/');
      } catch (error) {
        console.error('Login error:', error);
        const message = error.response?.data?.message || error.message || 'Đăng nhập thất bại. Vui lòng thử lại!';
        setErrors((prev) => ({ ...prev, api: message }));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-x-hidden font-google-sans bg-black select-none">
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

      {/* LOGO Link in the Top-Left Corner aligned with Header */}
      <div className="absolute top-8 left-0 right-0 z-30">
        <div className="max-w-7xl mx-auto px-4">
          <Link
            to="/"
            className="text-heading2 text-cta tracking-wider uppercase font-bold hover:text-cta-light transition-colors"
          >
            LOGO
          </Link>
        </div>
      </div>

      {/* Main Glassmorphism Sign In Card Container */}
      <div className="relative z-20 w-full max-w-[500px] mx-4 my-10">
        <div className="relative rounded-2xl p-8 register-card">
          {/* Spotlight glass reflection overlay */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
            style={{
              background: 'radial-gradient(circle at 85% 12%, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0) 65%)',
              mixBlendMode: 'screen',
            }}
          />

          <div className="relative z-10">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-center text-heading1 font-bold text-white tracking-wide">
                Đăng nhập
              </h2>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="mt-8">
              {/* Email */}
              <div className="flex flex-col space-y-2">
                <label className="text-label-custom text-text-sub1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Nhập địa chỉ email của bạn"
                  className="w-full h-[42px] bg-[#333333]/60 text-white rounded-lg px-4 border border-zinc-700/60 text-body3 placeholder-zinc-500 light-cast-input"
                />
                {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email}</span>}
              </div>

              {/* Password */}
              <div className="flex flex-col space-y-2 mt-5">
                <label className="text-label-custom text-text-sub1">Mật khẩu</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Nhập mật khẩu của bạn"
                    className="w-full h-[42px] bg-[#333333]/60 text-white rounded-lg pl-4 pr-10 border border-zinc-700/60 text-body3 placeholder-zinc-500 light-cast-input"
                  />
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setShowPassword(!showPassword); }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
                {/* Forget Password (closer spacing below input) */}
                <div className="flex justify-end mt-1">
                  <Link
                    to="#"
                    className="text-body3 text-zinc-400 hover:text-white transition-colors"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                {errors.password && <span className="text-red-500 text-xs mt-1">{errors.password}</span>}
              </div>

              {errors.api && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-lg p-3 mt-4 text-center">
                  {errors.api}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#CF0F47] hover:bg-[#FF0B55] disabled:bg-[#CF0F47]/50 disabled:cursor-not-allowed text-white py-3 rounded-lg text-body2 font-bold cursor-pointer transition-all duration-300 light-cast-btn select-none mt-8 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Đang xử lý...
                  </>
                ) : (
                  'Đăng nhập'
                )}
              </button>

              {/* OR Divider */}
              <div className="relative flex py-5 items-center">
                <div className="flex-grow border-t border-zinc-700/60"></div>
                <span className="flex-shrink mx-4 text-[#8A8A8A] text-body3 font-medium uppercase">HOẶC</span>
                <div className="flex-grow border-t border-zinc-700/60"></div>
              </div>

              {/* Continue with Google */}
              <button
                type="button"
                className="w-full bg-[#333333]/50 hover:bg-[#3f3f3f]/60 text-white py-3 border border-zinc-700/40 rounded-lg text-body2 font-medium flex items-center justify-center gap-3 cursor-pointer light-cast-google select-none"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69a5.74 5.74 0 0 1-2.48 3.77v3.13h4.01c2.34-2.16 3.69-5.32 3.69-8.75Z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-4.01-3.13c-1.12.75-2.54 1.19-3.95 1.19-3.05 0-5.63-2.06-6.55-4.83H1.31v3.23A12 12 0 0 0 12 24Z" />
                  <path fill="#FBBC05" d="M5.45 14.32a7.14 7.14 0 0 1 0-4.64V6.45H1.31a12 12 0 0 0 0 11.1l4.14-3.23Z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43A11.96 11.96 0 0 0 12 0 12 12 0 0 0 1.31 6.45l4.14 3.23c.92-2.77 3.5-4.83 6.55-4.83Z" />
                </svg>
                Tiếp tục với Google
              </button>

              {/* Link to Register */}
              <div className="text-center mt-6 text-body3 text-[#C3C3C3] font-normal">
                Bạn chưa có tài khoản?{' '}
                <Link to="/register" className="text-[#CF0F47] hover:text-[#FF0B55] font-semibold ml-1 transition-colors">
                  Đăng ký
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Volumetric Conic Spotlight – triangular cone from top-right */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 40 }}>
        {/* Outer wide cone – atmospheric, kept very subtle */}
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
        {/* Inner bright core cone – subtle beam path */}
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
        {/* Focal pool of light – centered on the form card to make it pop */}
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

      {/* Styled JSX for precise light shadow controls */}
      <style>{`
        /* Spotlight interactive shadows on elements */

        /* Main Glassmorphism Card styling with light-driven linear stroke */
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
          /* Top-right brightest, fades to bottom-left */
          background: linear-gradient(225deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.25) 35%, rgba(255, 255, 255, 0.10) 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          pointer-events: none;
        }
        
        /* Input shadow & light highlights */
        .light-cast-input {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .light-cast-input:focus {
          outline: none;
          background-color: rgba(63, 63, 70, 0.5) !important;
          border-color: rgba(255, 255, 255, 0.35) !important;
          /* Shadows cast towards bottom-left from top-right light source */
          box-shadow: 
            -10px 10px 20px rgba(0, 0, 0, 0.65),
            inset -1px 1px 0px rgba(255, 255, 255, 0.12),
            inset 1px -1px 0px rgba(0, 0, 0, 0.35);
        }

        /* Sign Up button shadow */
        .light-cast-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .light-cast-btn:hover {
          transform: translateY(-1px);
          /* Glowing shadow cast bottom-left from top-right source */
          box-shadow: 
            -12px 12px 24px rgba(207, 15, 71, 0.45),
            -5px 5px 10px rgba(0, 0, 0, 0.3),
            inset -1px 1px 0px rgba(255, 255, 255, 0.2);
        }
        .light-cast-btn:active {
          transform: translateY(1px);
          box-shadow: -4px 4px 10px rgba(207, 15, 71, 0.3);
        }

        /* Google button shadow */
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
      `}</style>
    </div>
  );
}
