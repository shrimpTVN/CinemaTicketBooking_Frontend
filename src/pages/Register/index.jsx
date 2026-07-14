import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { register as apiRegister } from '../../services/authService';
import ProjectorBackground from './components/ProjectorBackground';
import RegisterFormStep1 from './components/RegisterFormStep1';
import RegisterFormStep2 from './components/RegisterFormStep2';

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);

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
  const [loading, setLoading] = useState(false);

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
      setStep(2);
    }
  };

  const handleBackStep = () => {
    setErrors({});
    setStep(1);
  };

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
        const from = location.state?.from || '/';
        const bookingState = location.state?.bookingState;
        if (from === '/booking') {
          sessionStorage.setItem('booking_redirect_auth', 'true');
        }
        navigate(from, { state: bookingState });
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
      {/* Background and Ambient projection */}
      <ProjectorBackground />

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
      <div className="relative z-20 w-full max-w-[320px] sm:max-w-[550px] mx-4 my-6 sm:my-10">
        <div className="relative rounded-2xl p-4 sm:p-8 register-card">
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
            <div className="mb-4 sm:mb-6">
              <h2 className="text-center text-[22px] sm:text-heading1 font-bold text-white tracking-wide">
                {step === 1 ? 'Tạo tài khoản' : 'Đặt mật khẩu'}
              </h2>
              <p className="text-center text-zinc-400 text-[10px] sm:text-sm mt-1">
                {step === 1 ? 'Nhập thông tin cá nhân của bạn' : 'Tạo mật khẩu bảo mật'}
              </p>
            </div>

            {/* Progress Stepper */}
            <div className="flex items-start justify-center mb-5 sm:mb-8 px-2 sm:px-4">
              {/* Step 1 */}
              <div className="flex flex-col items-center gap-1 sm:gap-1.5 min-w-[50px] sm:min-w-[64px]">
                <div
                  className="w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-300 font-semibold text-xs sm:text-sm"
                  style={{
                    background: step > 1 ? 'var(--color-cta)' : step === 1 ? 'transparent' : 'transparent',
                    border: step === 1 ? '2px solid var(--color-cta)' : step > 1 ? 'none' : '2px solid #3f3f3f',
                    color: step >= 1 ? 'var(--color-cta)' : '#666',
                    boxShadow: step === 1 ? '0 0 0 3px rgba(207,15,71,0.12)' : 'none',
                  }}
                >
                  {step > 1 ? (
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="white" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span style={{ color: step === 1 ? 'var(--color-cta)' : '#555' }}>1</span>
                  )}
                </div>
                <span
                  className="text-[10px] sm:text-body3 font-medium tracking-wide"
                  style={{ color: step >= 1 ? 'var(--color-cta)' : 'var(--color-text-sub3)' }}
                >
                  Thông tin
                </span>
              </div>

              {/* Connector */}
              <div className="flex-1 mt-[14px] sm:mt-[18px] mx-1.5 sm:mx-2" style={{ maxWidth: '100px' }}>
                <div className="h-[2px] rounded-full w-full" style={{ background: '#2a2a2a' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: step > 1 ? '100%' : '0%', background: 'var(--color-cta)' }}
                  />
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center gap-1 sm:gap-1.5 min-w-[50px] sm:min-w-[64px]">
                <div
                  className="w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-300 font-semibold text-xs sm:text-sm"
                  style={{
                    background: step === 2 ? 'var(--color-cta)' : 'transparent',
                    border: step === 2 ? 'none' : '2px solid #3f3f3f',
                    color: step === 2 ? 'white' : '#555',
                    boxShadow: step === 2 ? '0 0 0 3px rgba(207,15,71,0.12)' : 'none',
                  }}
                >
                  2
                </div>
                <span
                  className="text-[10px] sm:text-body3 font-medium tracking-wide"
                  style={{ color: step === 2 ? 'var(--color-cta)' : 'var(--color-text-sub3)' }}
                >
                  Mật khẩu
                </span>
              </div>
            </div>

            {/* Render form step */}
            {step === 1 ? (
              <RegisterFormStep1
                formData={formData}
                errors={errors}
                handleChange={handleChange}
                handleNextStep={handleNextStep}
                locationState={location.state}
              />
            ) : (
              <RegisterFormStep2
                formData={formData}
                errors={errors}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                handleBackStep={handleBackStep}
                loading={loading}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                showConfirmPassword={showConfirmPassword}
                setShowConfirmPassword={setShowConfirmPassword}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
