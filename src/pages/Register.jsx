import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { register as apiRegister } from '../services/authService';

export default function Register() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    birthday: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1); // 1 = info, 2 = password
  const [slideDir, setSlideDir] = useState(''); // 'enter-left' | 'enter-right'

  // Canvas floating dust particles animation
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

    // Cinema projector dust: more particles but each is very subtle
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

          // Very faint glow – barely noticeable, like real dust catching light
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

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ và tên';
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (!formData.birthday) newErrors.birthday = 'Vui lòng chọn ngày sinh';
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10}$/.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = 'Số điện thoại phải gồm 10 chữ số';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải từ 6 ký tự trở lên';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không trùng khớp';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setSlideDir('enter-left');
      setStep(2);
    }
  };

  const handleBackStep = () => {
    setErrors({});
    setSlideDir('enter-right');
    setStep(1);
  };

  const login = useAuthStore((state) => state.login);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateStep2()) {
      setLoading(true);
      setErrors({});
      try {
        console.log('Registering user:', formData);
        
        const response = await apiRegister({
          fullName: formData.fullName,
          email: formData.email,
          birthday: formData.birthday,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
        });

        // Resolve user and token from backend response
        const user = response.user || response.data?.user || response;
        const token = response.token || response.data?.token;

        if (!user || !token) {
          throw new Error('Dữ liệu phản hồi từ máy chủ không hợp lệ');
        }

        login(user, token);
        alert('Đăng ký thành công!');
        navigate('/');
      } catch (error) {
        console.error('Register error:', error);
        const message = error.response?.data?.message || error.message || 'Đăng ký thất bại. Vui lòng thử lại!';
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

      {/* Main Glassmorphism Sign Up Card Container */}
      <div className="relative z-20 w-full max-w-[550px] mx-4 my-10">
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
            {/* Step Header */}
            <div className="mb-6">
              <h2 className="text-center text-heading1 font-bold text-white tracking-wide">
                {step === 1 ? 'Tạo tài khoản' : 'Đặt mật khẩu'}
              </h2>
              <p className="text-center text-zinc-400 text-sm mt-1">
                {step === 1 ? 'Nhập thông tin cá nhân của bạn' : 'Tạo mật khẩu bảo mật'}
              </p>
            </div>

            {/* Progress Stepper */}
            <div className="flex items-start justify-center mb-8 px-4">
              {/* Step 1 */}
              <div className="flex flex-col items-center gap-1.5 min-w-[64px]">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 font-semibold text-sm"
                  style={{
                    background: step > 1 ? 'var(--color-cta)' : step === 1 ? 'transparent' : 'transparent',
                    border: step === 1 ? '2px solid var(--color-cta)' : step > 1 ? 'none' : '2px solid #3f3f3f',
                    color: step >= 1 ? 'var(--color-cta)' : '#666',
                    boxShadow: step === 1 ? '0 0 0 4px rgba(207,15,71,0.12)' : 'none',
                  }}
                >
                  {step > 1 ? (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="white" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span style={{ color: step === 1 ? 'var(--color-cta)' : '#555' }}>1</span>
                  )}
                </div>
                <span
                  className="text-body3 font-medium tracking-wide"
                  style={{ color: step >= 1 ? 'var(--color-cta)' : 'var(--color-text-sub3)' }}
                >
                  Thông tin
                </span>
              </div>

              {/* Connector */}
              <div className="flex-1 mt-[18px] mx-2" style={{ maxWidth: '100px' }}>
                <div className="h-[2px] rounded-full w-full" style={{ background: '#2a2a2a' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: step > 1 ? '100%' : '0%', background: 'var(--color-cta)' }}
                  />
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center gap-1.5 min-w-[64px]">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 font-semibold text-sm"
                  style={{
                    background: step === 2 ? 'var(--color-cta)' : 'transparent',
                    border: step === 2 ? 'none' : '2px solid #3f3f3f',
                    color: step === 2 ? 'white' : '#555',
                    boxShadow: step === 2 ? '0 0 0 4px rgba(207,15,71,0.12)' : 'none',
                  }}
                >
                  2
                </div>
                <span
                  className="text-body3 font-medium tracking-wide"
                  style={{ color: step === 2 ? 'var(--color-cta)' : 'var(--color-text-sub3)' }}
                >
                  Mật khẩu
                </span>
              </div>
            </div>

            {/* Step 1 – Personal Info */}
            {step === 1 && (
              <div className="step-panel" key="step1">
                <div className="space-y-5">
                  {/* Full Name */}
                  <div className="flex flex-col space-y-2">
                    <label className="text-label-custom text-text-sub1">Họ và tên</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Nhập họ và tên của bạn"
                      className="w-full h-[42px] bg-[#333333]/60 text-white rounded-lg px-4 border border-zinc-700/60 text-body3 placeholder-zinc-500 light-cast-input"
                    />
                    {errors.fullName && <span className="text-red-500 text-xs">{errors.fullName}</span>}
                  </div>

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
                    {errors.email && <span className="text-red-500 text-xs">{errors.email}</span>}
                  </div>

                  {/* Birthday & Phone Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Birthday */}
                    <div className="flex flex-col space-y-2 relative">
                      <label className="text-label-custom text-text-sub1">Ngày sinh</label>
                      <div className="relative">
                        <input
                          type="date"
                          name="birthday"
                          value={formData.birthday}
                          onChange={handleChange}
                          className={`w-full h-[42px] bg-[#333333]/60 rounded-lg pl-4 pr-10 border border-zinc-700/60 text-body3 light-cast-input custom-date-input ${formData.birthday ? 'text-white' : 'text-zinc-500'
                            }`}
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </span>
                      </div>
                      {errors.birthday && <span className="text-red-500 text-xs">{errors.birthday}</span>}
                    </div>

                    {/* Phone Number */}
                    <div className="flex flex-col space-y-2">
                      <label className="text-label-custom text-text-sub1">Số điện thoại</label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder="Nhập số điện thoại"
                        className="w-full h-[42px] bg-[#333333]/60 text-white rounded-lg px-4 border border-zinc-700/60 text-body3 placeholder-zinc-500 light-cast-input"
                      />
                      {errors.phoneNumber && <span className="text-red-500 text-xs">{errors.phoneNumber}</span>}
                    </div>
                  </div>

                  {/* Next Button */}
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full bg-[#CF0F47] hover:bg-[#FF0B55] text-white py-3 rounded-lg text-body2 font-bold cursor-pointer transition-all duration-300 light-cast-btn select-none"
                  >
                    Tiếp theo →
                  </button>
                </div>

                {/* OR Divider */}
                <div className="relative flex py-4 items-center">
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

                {/* Link to Login */}
                <div className="text-center mt-5 text-body3 text-[#C3C3C3] font-normal">
                  Bạn đã có tài khoản?{' '}
                  <Link to="/login" className="text-[#CF0F47] hover:text-[#FF0B55] font-semibold ml-1 transition-colors">
                    Đăng nhập
                  </Link>
                </div>
              </div>
            )}

            {/* Step 2 – Password */}
            {step === 2 && (
              <form onSubmit={handleSubmit} key="step2">
                <div className="space-y-5">
                  {/* Password */}
                  <div className="flex flex-col space-y-2">
                    <label className="text-label-custom text-text-sub1">Mật khẩu</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Tạo mật khẩu (tối thiểu 6 ký tự)"
                        className="w-full h-[42px] bg-[#333333]/60 text-white rounded-lg pl-4 pr-10 border border-zinc-700/60 text-body3 placeholder-zinc-500 light-cast-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
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
                    {errors.password && <span className="text-red-500 text-xs">{errors.password}</span>}
                  </div>

                  {/* Confirm Password */}
                  <div className="flex flex-col space-y-2">
                    <label className="text-label-custom text-text-sub1">Xác nhận mật khẩu</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Nhập lại mật khẩu"
                        className="w-full h-[42px] bg-[#333333]/60 text-white rounded-lg pl-4 pr-10 border border-zinc-700/60 text-body3 placeholder-zinc-500 light-cast-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {showConfirmPassword ? (
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
                    {errors.confirmPassword && <span className="text-red-500 text-xs">{errors.confirmPassword}</span>}
                  </div>

                  {errors.api && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-lg p-3 text-center">
                      {errors.api}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#CF0F47] hover:bg-[#FF0B55] disabled:bg-[#CF0F47]/50 disabled:cursor-not-allowed text-white py-3 rounded-lg text-body2 font-bold cursor-pointer transition-all duration-300 light-cast-btn select-none flex items-center justify-center gap-2"
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
                      'Hoàn tất đăng ký'
                    )}
                  </button>

                  {/* Back Button */}
                  <button
                    type="button"
                    onClick={handleBackStep}
                    className="w-full text-zinc-400 hover:text-white py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Quay lại
                  </button>
                </div>
              </form>
            )}
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

        /* Styling the date input calendar icon */
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
    </div>
  );
}
