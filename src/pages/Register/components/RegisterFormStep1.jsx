import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import GoogleLoginButton from '../../../components/GoogleLoginButton';

export default function RegisterFormStep1({ formData, errors, handleChange, handleNextStep, locationState }) {
  const navigate = useNavigate();
  const authLogin = useAuthStore((s) => s.login);
  const datePickerRef = useRef(null); // Hidden native date input for calendar

  // Local display state for DD/MM/YYYY typed format
  const [birthdayDisplay, setBirthdayDisplay] = useState(() => {
    if (!formData.birthday) return '';
    // Convert YYYY-MM-DD → DD/MM/YYYY for display
    const [y, m, d] = formData.birthday.split('-');
    return `${d}/${m}/${y}`;
  });

  // Auto-format text as user types: digits only → DD/MM/YYYY
  const handleBirthdayTextChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 8); // keep digits, max 8
    let formatted = raw;
    if (raw.length > 4) {
      formatted = `${raw.slice(0, 2)}/${raw.slice(2, 4)}/${raw.slice(4)}`;
    } else if (raw.length > 2) {
      formatted = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setBirthdayDisplay(formatted);

    // When all 8 digits are entered, sync to parent as YYYY-MM-DD
    if (raw.length === 8) {
      const d = raw.slice(0, 2);
      const m = raw.slice(2, 4);
      const y = raw.slice(4, 8);
      handleChange({ target: { name: 'birthday', value: `${y}-${m}-${d}` } });
    } else {
      handleChange({ target: { name: 'birthday', value: '' } });
    }
  };

  // When user picks via the native calendar picker
  const handlePickerChange = (e) => {
    const iso = e.target.value; // YYYY-MM-DD
    if (iso) {
      const [y, m, d] = iso.split('-');
      setBirthdayDisplay(`${d}/${m}/${y}`);
      handleChange({ target: { name: 'birthday', value: iso } });
    }
  };

  // Open native date picker when calendar icon is clicked
  const openDatePicker = () => {
    if (datePickerRef.current) {
      try {
        datePickerRef.current.showPicker();
      } catch {
        datePickerRef.current.click();
      }
    }
  };

  return (
    <div className="step-panel">
      <div className="space-y-3 sm:space-y-5">
        {/* Full Name */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-xs sm:text-label-custom text-text-sub1">Họ và tên</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Nhập họ và tên của bạn"
            className="w-full h-9 sm:h-[42px] bg-[#333333]/60 text-white rounded-lg px-3 sm:px-4 border border-zinc-700/60 text-xs sm:text-body3 placeholder-zinc-500 light-cast-input"
          />
          {errors.fullName && <span className="text-red-500 text-[10px] sm:text-xs">{errors.fullName}</span>}
        </div>

        {/* Email */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-xs sm:text-label-custom text-text-sub1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Nhập địa chỉ email của bạn"
            className="w-full h-9 sm:h-[42px] bg-[#333333]/60 text-white rounded-lg px-3 sm:px-4 border border-zinc-700/60 text-xs sm:text-body3 placeholder-zinc-500 light-cast-input"
          />
          {errors.email && <span className="text-red-500 text-[10px] sm:text-xs">{errors.email}</span>}
        </div>

        {/* Birthday & Phone Row */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          {/* Birthday */}
          <div className="flex flex-col space-y-1.5 relative">
            <label className="text-xs sm:text-label-custom text-text-sub1">Ngày sinh</label>
            <div className="relative">
              {/* Visible text input — allows typing DD/MM/YYYY */}
              <input
                type="text"
                inputMode="numeric"
                value={birthdayDisplay}
                onChange={handleBirthdayTextChange}
                placeholder="DD/MM/YYYY"
                maxLength={10}
                className={`w-full h-9 sm:h-[42px] bg-[#333333]/60 rounded-lg pl-3 pr-8 sm:pr-10 border border-zinc-700/60 text-xs sm:text-body3 light-cast-input ${
                  birthdayDisplay ? 'text-white' : 'text-zinc-500'
                }`}
              />
              {/* Hidden native date input — only used for the calendar picker */}
              <input
                ref={datePickerRef}
                type="date"
                value={formData.birthday}
                onChange={handlePickerChange}
                className="absolute opacity-0 w-0 h-0 top-0 left-0 pointer-events-none"
                tabIndex={-1}
                aria-hidden="true"
              />
              {/* Calendar icon button — opens native date picker */}
              <button
                type="button"
                onClick={openDatePicker}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                tabIndex={-1}
                aria-label="Mở lịch chọn ngày"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            {errors.birthday && <span className="text-red-500 text-[10px] sm:text-xs">{errors.birthday}</span>}
          </div>

          {/* Phone Number */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs sm:text-label-custom text-text-sub1">Số điện thoại</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Số điện thoại"
              className="w-full h-9 sm:h-[42px] bg-[#333333]/60 text-white rounded-lg px-3 sm:px-4 border border-zinc-700/60 text-xs sm:text-body3 placeholder-zinc-500 light-cast-input"
            />
            {errors.phoneNumber && <span className="text-red-500 text-[10px] sm:text-xs">{errors.phoneNumber}</span>}
          </div>
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={handleNextStep}
          className="w-full bg-[#CF0F47] hover:bg-[#FF0B55] text-white py-2 sm:py-3 rounded-lg text-xs sm:text-body2 font-bold cursor-pointer transition-all duration-300 light-cast-btn select-none"
        >
          Tiếp theo →
        </button>
      </div>

      {/* OR Divider */}
      <div className="relative flex py-3 sm:py-4 items-center">
        <div className="flex-grow border-t border-zinc-700/60"></div>
        <span className="flex-shrink mx-3 sm:mx-4 text-[#8A8A8A] text-[10px] sm:text-body3 font-medium uppercase">HOẶC</span>
        <div className="flex-grow border-t border-zinc-700/60"></div>
      </div>

      {/* Continue with Google */}
      <GoogleLoginButton
        onSuccess={(data) => {
          const user = data.user || data;
          const token = data.token || 'cookie-managed-token';
          authLogin(user, token);
          const from = locationState?.from || '/';
          const bookingState = locationState?.bookingState;
          if (from === '/booking') {
            sessionStorage.setItem('booking_redirect_auth', 'true');
          }
          navigate(from, { state: bookingState, replace: true });
        }}
        onError={(msg) => {
          console.error("Google Auth error:", msg);
        }}
      />

      {/* Link to Login */}
      <div className="text-center mt-4 sm:mt-5 text-[10px] sm:text-body3 text-[#C3C3C3] font-normal">
        Bạn đã có tài khoản?{' '}
        <Link to="/login" state={locationState} className="text-[#CF0F47] hover:text-[#FF0B55] font-semibold ml-1 transition-colors">
          Đăng nhập
        </Link>
      </div>
    </div>
  );
}
