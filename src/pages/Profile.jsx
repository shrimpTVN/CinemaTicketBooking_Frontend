import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Camera, Trophy, CircleUser, Calendar, Mail, Phone, Lock, Edit3, X, Check, Copy, Info } from 'lucide-react';
import TabFilter from '../components/TabFilter';

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  // Active Tab: 'info' | 'history' | 'rewards' | 'privacy'
  const [activeTab, setActiveTab] = useState('info');

  // Edit Mode for Personal Info
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || 'Nguyễn Văn A',
    birthday: user?.birthday || '2000-01-01',
    email: user?.email || 'nguyenvana@gmail.com',
    phoneNumber: user?.phoneNumber || '0912345678',
  });
  const [errors, setErrors] = useState({});

  // Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Email Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [newEmailForm, setNewEmailForm] = useState({ newEmail: '' });
  const [emailErrors, setEmailErrors] = useState({});

  // Toast message
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam && ['info', 'history', 'rewards', 'privacy'].includes(tabParam)) {
      setActiveTab(tabParam);
    } else if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.search, location.state]);

  if (!user) {
    return (
      <div className="bg-bg-dark text-text-main min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4">
        <svg className="w-16 h-16 text-cta animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <div className="text-heading2 text-text-main font-bold text-center">Vui lòng đăng nhập để xem thông tin cá nhân</div>
        <button
          onClick={() => navigate('/login')}
          className="bg-cta hover:bg-cta-light text-text-main text-body2 px-8 py-3 rounded font-bold uppercase transition-colors cursor-pointer"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  // Handle Input Changes
  const handleInputChange = (e) => {
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

  // Validate Info Form
  const validateInfo = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ và tên';
    if (!formData.birthday) newErrors.birthday = 'Vui lòng chọn ngày sinh';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10}$/.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = 'Số điện thoại phải gồm 10 chữ số';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Save Info
  const handleSaveInfo = () => {
    if (validateInfo()) {
      updateUser(formData);
      setIsEditing(false);
      showToast('Cập nhật thông tin cá nhân thành công!');
    }
  };

  // Handle Cancel Info Edit
  const handleCancelEdit = () => {
    setFormData({
      fullName: user.fullName,
      birthday: user.birthday,
      email: user.email,
      phoneNumber: user.phoneNumber,
    });
    setErrors({});
    setIsEditing(false);
  };

  // Handle Avatar Change
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Dung lượng ảnh phải nhỏ hơn 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateUser({ avatar: reader.result });
        showToast('Cập nhật ảnh đại diện thành công!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Password Changes
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Validate Password Change
  const validatePassword = () => {
    const newErrors = {};
    if (!passwordForm.currentPassword) newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu mới phải từ 6 ký tự trở lên';
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không trùng khớp';
    }
    
    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Save Password
  const handleSavePassword = (e) => {
    e.preventDefault();
    if (validatePassword()) {
      setIsPasswordModalOpen(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordErrors({});
      showToast('Thay đổi mật khẩu thành công!');
    }
  };

  // Handle Save Email
  const handleSaveEmail = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!newEmailForm.newEmail.trim()) {
      newErrors.newEmail = 'Vui lòng nhập email mới';
    } else if (!/\S+@\S+\.\S+/.test(newEmailForm.newEmail)) {
      newErrors.newEmail = 'Email không hợp lệ';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setEmailErrors(newErrors);
      return;
    }

    updateUser({ email: newEmailForm.newEmail });
    setFormData((prev) => ({ ...prev, email: newEmailForm.newEmail }));
    setIsEmailModalOpen(false);
    setNewEmailForm({ newEmail: '' });
    setEmailErrors({});
    showToast('Thay đổi email thành công!');
  };

  // Handle Copy Voucher Code
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    showToast(`Đã sao chép mã voucher: ${code}`);
  };

  // Mock data for tickets
  const mockTickets = [
    {
      id: 'LT7-849204',
      title: 'Lật Mặt 7: Một Điều Ước',
      poster: 'https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/l/a/lat-mat-7.jpg',
      theater: 'Logo Cinema Hùng Vương Plaza',
      room: 'Phòng chiếu 3',
      date: '28/06/2026',
      time: '19:45 - 21:55',
      seats: 'H12, H13',
      combo: '1 Combo Bắp Nước Lớn',
      price: 240000,
      status: 'Thành công',
      format: '2D',
      lang: 'Phụ đề',
      ageRating: 'K',
    },
    {
      id: 'DUNE2-104928',
      title: 'Dune: Part Two',
      poster: 'https://m.media-amazon.com/images/M/MV5BODlhZGI2YTItYmQ3Ny00NzQzLWEyYTMtYTdmNzgyN2I0YTFhXkEyXkFqcGdeQXVyMTUyNjc1Mg@@._V1_.jpg',
      theater: 'Logo Cinema Trần Hưng Đạo',
      room: 'Phòng chiếu IMAX',
      date: '15/05/2026',
      time: '20:15 - 22:50',
      seats: 'K10',
      combo: 'Không kèm combo',
      price: 130000,
      status: 'Thành công',
      format: 'IMAX',
      lang: 'Phụ đề',
      ageRating: 'T13',
    }
  ];

  // Mock vouchers data
  const mockVouchers = [
    {
      code: 'BAPNGOTFREE',
      title: 'Miễn Phí 1 Bắp Ngọt',
      description: 'Nhận ngay 1 phần bắp ngọt cỡ vừa khi mua 1 vé xem phim bất kỳ.',
      expiry: '31/12/2026',
      category: 'Quà tặng',
    },
    {
      code: 'GIAMSNHAT50',
      title: 'Giảm 50% Vé Sinh Nhật',
      description: 'Ưu đãi giảm 50% cho 1 vé xem phim trong tháng sinh nhật của bạn.',
      expiry: '31/12/2026',
      category: 'Vé xem phim',
    },
    {
      code: 'GIAMCOMB20K',
      title: 'Giảm 20K Combo Bắp Nước',
      description: 'Giảm trực tiếp 20.000đ khi đặt mua bất kỳ combo bắp nước nào.',
      expiry: '30/09/2026',
      category: 'Bắp nước',
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-left font-google-sans min-h-screen">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-[9999] bg-[#CF0F47] text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-slide-in border border-white/20">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-body2 font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Grid Layout: Sidebar 1/3 (4 columns), Main Content 2/3 (8 columns) */}
      <div className="profile-layout-container flex flex-col gap-8 mt-4 items-start">
        
        {/* LEFT COLUMN: Sidebar Card (matching wireframe left card) */}
        <div className="profile-sidebar-col w-full flex flex-col gap-6">
          <div className="relative rounded-2xl p-6 bg-zinc-900/50 backdrop-blur-md border border-zinc-800/80 shadow-2xl overflow-hidden profile-card">
            
            {/* Visual spotlight */}
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
              style={{
                background: 'radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 70%)',
                mixBlendMode: 'screen',
              }}
            />

            <div className="relative z-10 flex flex-col gap-5">
              
              {/* Avatar and Name/Stars Row (Side-by-side in wireframe) */}
              <div className="flex items-center gap-5 text-left px-1">
                
                {/* Avatar circle */}
                <div className="relative group w-20 h-20 rounded-full overflow-hidden border border-zinc-700 bg-zinc-800/60 flex-shrink-0 flex items-center justify-center cursor-pointer shadow">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-zinc-500 group-hover:scale-105 transition-transform duration-300" />
                  )}
                  {/* Upload Overlay */}
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity duration-200">
                    <Camera className="w-5 h-5 text-white" />
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                </div>

                {/* Name & Stars next to it */}
                <div className="min-w-0">
                  <h3 className="text-body1 font-bold text-text-main tracking-wide truncate">
                    {formData.fullName}
                  </h3>
                  <p className="text-body3 text-text-sub3 mt-0.5 font-medium">
                    {user.stars || 0} sao
                  </p>
                </div>

              </div>

              <hr className="border-zinc-800/80 my-1" />

              {/* Total Spending in 2026 (Wireframe format) */}
              <div className="flex justify-between items-center px-1">
                <span className="text-body2 text-text-sub2 font-medium">Tổng cộng trong năm 2026</span>
                <span className="text-body2 font-bold text-text-main">
                  0 đ
                </span>
              </div>

              {/* Progress milestones (Medals/Trophies above, 0đ/0đ/0đ below) */}
              <div className="px-1 mt-2 select-none relative mb-2">
                
                {/* Medals above */}
                <div className="flex justify-between items-center relative z-10 mb-2">
                  {[1, 2, 3].map((m) => (
                    <div key={m} className="flex flex-col items-center">
                      <Trophy className="w-5 h-5 text-zinc-500" />
                    </div>
                  ))}
                </div>

                {/* Progress bar line */}
                <div className="h-2 w-full bg-zinc-800 rounded-full relative overflow-visible mb-2">
                  {/* Small progress (10%) to look like the wireframe preview */}
                  <div
                    className="h-full bg-zinc-500 rounded-full"
                    style={{ width: `8%` }}
                  />

                  {/* Dot Markers */}
                  <div className="absolute inset-0 flex justify-between items-center pointer-events-none">
                    {[1, 2, 3].map((m, idx) => (
                      <div
                        key={m}
                        className="w-3.5 h-3.5 rounded-full border transition-all duration-300"
                        style={{
                          background: idx === 0 ? '#8a8a8a' : '#16161a',
                          borderColor: '#555555',
                          transform: 'translateY(-0.5px)',
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Milestone labels below */}
                <div className="flex justify-between text-body3 font-medium text-text-sub3">
                  <span className="text-[11px]">0 đ</span>
                  <span className="text-[11px]">0 đ</span>
                  <span className="text-[11px]">0 đ</span>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Content card with Tabs Menu ABOVE the card */}
        <div className="profile-content-col w-full flex flex-col">
          
          {/* Tabs Menu (OUTSIDE and ABOVE the card container in wireframe, aligned center) */}
          <TabFilter
            tabs={[
              { id: 'info', label: 'Thông tin' },
              { id: 'history', label: 'Lịch sử giao dịch' },
              { id: 'rewards', label: 'Phần thưởng' },
              { id: 'privacy', label: 'Chính sách bảo mật' }
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
            centered={true}
            variant="select"
          />

          {/* MAIN CARD CONTAINER */}
          <div className="relative rounded-2xl p-6 md:p-8 bg-zinc-900/50 backdrop-blur-md border border-zinc-800/80 shadow-2xl info-card min-h-[460px]">
            
            {/* Visual shine overlay */}
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
              style={{
                background: 'radial-gradient(circle at 100% 0%, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0) 70%)',
                mixBlendMode: 'screen',
              }}
            />

            {/* TAB: Personal Information (Thông tin) */}
            {activeTab === 'info' && (
              <div className="relative z-10 flex flex-col gap-6 text-left">
                
                {/* Personal Information Header Row */}
                <div className="flex justify-between items-center pb-2 border-b border-zinc-800/60">
                  <h3 className="text-subtitle font-bold text-text-main">
                    Thông tin cá nhân
                  </h3>
                  
                  {isEditing ? (
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancelEdit}
                        className="text-body3 border border-zinc-700 bg-zinc-850 hover:bg-zinc-800 text-text-sub2 px-4 py-1.5 rounded font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" />
                        Hủy
                      </button>
                      <button
                        onClick={handleSaveInfo}
                        className="text-body3 bg-cta hover:bg-cta-light text-text-main px-4 py-1.5 rounded font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Lưu
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-body3 bg-zinc-800 border border-zinc-700 hover:bg-zinc-750 text-text-main px-4 py-1.5 rounded font-bold cursor-pointer transition-colors flex items-center gap-1.5 select-none"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-text-sub2" />
                      Chỉnh sửa
                    </button>
                  )}
                </div>

                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  
                  {/* Full Name */}
                  <div className="flex flex-col space-y-2">
                    <label className="text-label-custom text-text-sub2 font-semibold">Họ và tên</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                        <CircleUser className="w-4.5 h-4.5" strokeWidth={1.5} />
                      </span>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Họ và tên"
                        className={`w-full h-[42px] text-white rounded-lg pl-11 pr-4 border text-body3 placeholder-zinc-500 transition-all ${
                          isEditing
                            ? 'bg-[#333333]/60 border-zinc-700/60 light-cast-input'
                            : 'bg-[#333333]/30 border-zinc-800/40 opacity-70 cursor-not-allowed'
                        }`}
                      />
                    </div>
                    {errors.fullName && <span className="text-red-500 text-xs mt-1">{errors.fullName}</span>}
                  </div>

                  {/* Date of Birth */}
                  <div className="flex flex-col space-y-2">
                    <label className="text-label-custom text-text-sub2 font-semibold">Ngày sinh</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                        <Calendar className="w-4.5 h-4.5" />
                      </span>
                      <input
                        type="date"
                        name="birthday"
                        value={formData.birthday}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full h-[42px] text-white rounded-lg pl-11 pr-4 border text-body3 transition-all color-scheme-dark ${
                          isEditing
                            ? 'bg-[#333333]/60 border-zinc-700/60 light-cast-input'
                            : 'bg-[#333333]/30 border-zinc-800/40 opacity-70 cursor-not-allowed'
                        }`}
                      />
                    </div>
                    {errors.birthday && <span className="text-red-500 text-xs mt-1">{errors.birthday}</span>}
                  </div>

                  {/* Email */}
                  <div className="flex flex-col space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-label-custom text-text-sub2 font-semibold">Email</label>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => setIsEmailModalOpen(true)}
                          className="text-body3 text-select hover:underline font-bold cursor-pointer transition-colors"
                        >
                          Thay đổi email
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                        <Mail className="w-4.5 h-4.5" />
                      </span>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled={true}
                        placeholder="abc@gmail.com"
                        className="w-full h-[42px] bg-[#333333]/30 text-white rounded-lg pl-11 pr-4 border border-zinc-800/40 text-body3 placeholder-zinc-500 transition-all opacity-70 cursor-not-allowed"
                      />
                    </div>
                    {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email}</span>}
                  </div>

                  {/* Phone Number */}
                  <div className="flex flex-col space-y-2">
                    <label className="text-label-custom text-text-sub2 font-semibold">Số điện thoại</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                        <Phone className="w-4.5 h-4.5" />
                      </span>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="0123456789"
                        className={`w-full h-[42px] text-white rounded-lg pl-11 pr-4 border text-body3 placeholder-zinc-500 transition-all ${
                          isEditing
                            ? 'bg-[#333333]/60 border-zinc-700/60 light-cast-input'
                            : 'bg-[#333333]/30 border-zinc-800/40 opacity-70 cursor-not-allowed'
                        }`}
                      />
                    </div>
                    {errors.phoneNumber && <span className="text-red-500 text-xs mt-1">{errors.phoneNumber}</span>}
                  </div>

                </div>

                <hr className="border-zinc-800 my-4" />

                {/* Password and Security Section */}
                <div className="flex justify-between items-center pb-2 border-b border-zinc-800/60">
                  <h3 className="text-subtitle font-bold text-text-main">
                    Mật khẩu và bảo mật
                  </h3>
                  <button
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="text-body3 bg-zinc-850 border border-zinc-700 hover:bg-zinc-800 text-text-sub2 px-4 py-1.5 rounded font-bold cursor-pointer transition-colors"
                  >
                    Thay đổi
                  </button>
                </div>

                {/* Password input */}
                <div className="flex flex-col space-y-2 max-w-sm">
                  <label className="text-label-custom text-text-sub2 font-semibold">Mật khẩu</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                      <Lock className="w-4.5 h-4.5" />
                    </span>
                    <input
                      type="password"
                      value="••••••••••••"
                      disabled
                      className="w-full h-[42px] bg-[#333333]/30 text-white rounded-lg pl-11 pr-4 border border-zinc-800/40 text-body3 transition-all opacity-70 cursor-not-allowed"
                    />
                  </div>
                </div>

              </div>
            )}

            {/* TAB: Lịch sử giao dịch */}
            {activeTab === 'history' && (
              <div className="relative z-10 flex flex-col gap-6 text-left">
                <h3 className="text-subtitle font-bold text-text-main pb-2 border-b border-zinc-800/60">
                  Lịch sử giao dịch
                </h3>
                
                <div className="flex flex-col gap-5">
                  {mockTickets.map((ticket, idx) => (
                    <div
                      key={idx}
                      className="w-full rounded-2xl relative shadow-lg border border-zinc-800 bg-[#1C1C1E] flex flex-col md:flex-row overflow-visible text-left hover:border-white transition-all duration-300 group"
                      style={{ 
                        background: 'linear-gradient(135deg, #1C1C1E 0%, #0F0F10 100%)'
                      }}
                    >
                      {/* Left and Right Perforation Notches on outer borders */}
                      <div className="absolute top-1/2 -translate-y-1/2 -left-3.5 w-7 h-7 rounded-full bg-bg-dark border-r border-zinc-800 z-20"></div>
                      <div className="absolute top-1/2 -translate-y-1/2 -right-3.5 w-7 h-7 rounded-full bg-bg-dark border-l border-zinc-800 z-20"></div>

                      {/* Left panel (Movie details) */}
                      <div className="flex-grow p-6 flex gap-5">
                        {/* Poster */}
                        <div className="w-20 h-28 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0 shadow-md">
                          {ticket.poster && (
                            <img src={ticket.poster} alt={ticket.title} className="w-full h-full object-cover" />
                          )}
                        </div>

                        {/* Movie info details */}
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex justify-between items-start gap-4 flex-wrap mb-2">
                            <h4 className="text-white font-bold text-base leading-tight truncate max-w-[200px] sm:max-w-[300px]">
                              {ticket.title}
                            </h4>
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                              {ticket.status}
                            </span>
                          </div>
                          
                          {/* Labels Row */}
                          <div className="flex flex-wrap gap-2 mb-3.5">
                            <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-text-sub3 uppercase tracking-wide">
                              {ticket.format || '2D'}
                            </span>
                            <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-text-sub3 tracking-wide">
                              {ticket.lang || 'Phụ đề'}
                            </span>
                          </div>

                          {/* Booking Info Grid */}
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                            <div>
                              <p className="text-[9px] text-text-sub3 uppercase tracking-wider">Ngày chiếu</p>
                              <p className="text-white text-xs font-semibold mt-0.5">{ticket.date}</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-text-sub3 uppercase tracking-wider">Suất chiếu</p>
                              <p className="text-white text-xs font-semibold mt-0.5">{ticket.time}</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-text-sub3 uppercase tracking-wider">Phòng chiếu</p>
                              <p className="text-white text-xs font-semibold mt-0.5">{ticket.room}</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-text-sub3 uppercase tracking-wider">Ghế ngồi</p>
                              <p className="text-[#0ECF67] text-xs font-bold mt-0.5">{ticket.seats}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-[9px] text-text-sub3 uppercase tracking-wider">Rạp</p>
                              <p className="text-white text-xs font-semibold mt-0.5">{ticket.theater}</p>
                            </div>
                            {ticket.combo && ticket.combo !== 'Không kèm combo' && (
                              <div className="col-span-2">
                                <p className="text-[9px] text-text-sub3 uppercase tracking-wider">Đồ ăn &amp; Nước uống</p>
                                <p className="text-text-sub2 text-xs font-medium mt-0.5">{ticket.combo}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Perforation line */}
                      <div className="relative flex md:flex-col items-center justify-between" style={{ minWidth: 1 }}>
                        <div className="hidden md:block absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-bg-dark border-b border-zinc-800 z-10" />
                        <div className="flex-1 w-full border-t md:border-t-0 md:border-l border-dashed border-zinc-800/80 my-0 md:my-4 h-px md:h-auto" />
                        <div className="hidden md:block absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-bg-dark border-t border-zinc-800 z-10" />
                      </div>

                      {/* Right panel (Pricing & Barcode) */}
                      <div className="w-full md:w-44 p-6 flex flex-col justify-between items-center border-t md:border-t-0 border-zinc-850">
                        {/* QR Barcode Visual */}
                        <div className="flex flex-col items-center">
                          <div className="flex gap-[1.5px] h-10 items-center justify-center bg-white p-2 rounded-lg w-32 shadow-inner">
                            {[1, 2, 1, 3, 1, 1, 2, 4, 1, 2, 3, 1, 2, 1, 4, 2].map((w, i) => (
                              <span key={i} className="bg-black h-full shrink-0" style={{ width: w }}></span>
                            ))}
                          </div>
                          <p className="text-text-sub3 text-[9px] mt-1.5 font-mono tracking-wider">{ticket.id}</p>
                        </div>

                        <div className="text-center mt-4 md:mt-0">
                          <p className="text-text-sub3 text-[9px] uppercase tracking-wider mb-0.5">Tổng tiền</p>
                          <p className="text-lg font-black text-cta leading-none">{ticket.price.toLocaleString('vi-VN')} đ</p>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: Rewards (Phần thưởng) */}
            {activeTab === 'rewards' && (
              <div className="relative z-10 flex flex-col gap-6 text-left">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-800/60">
                  <h3 className="text-subtitle font-bold text-text-main">
                    Ưu đãi và quà tặng
                  </h3>
                  <div className="bg-gold/10 text-gold border border-gold/20 text-body3 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
                    <span>🌟 {user.stars} sao tích lũy</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mockVouchers.map((voucher, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-xl border border-zinc-850 bg-zinc-950/20 overflow-hidden flex flex-col justify-between group hover:border-cta/20 transition-all duration-300"
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -left-2 w-3.5 h-3.5 bg-zinc-900 border border-zinc-850 rounded-full z-20"></div>
                      <div className="absolute top-1/2 -translate-y-1/2 -right-2 w-3.5 h-3.5 bg-zinc-900 border border-zinc-850 rounded-full z-20"></div>

                      <div className="p-4 flex flex-col gap-1.5 text-left">
                        <div className="flex justify-between items-center gap-2 flex-wrap">
                          <span className="text-[9px] bg-cta/15 text-cta border border-cta/25 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                            {voucher.category}
                          </span>
                          <span className="text-[10px] text-zinc-500">Hạn dùng: {voucher.expiry}</span>
                        </div>
                        <h4 className="text-body2 font-bold text-text-main mt-1 leading-snug group-hover:text-cta-light transition-colors">
                          {voucher.title}
                        </h4>
                        <p className="text-[11px] text-text-sub3 leading-relaxed mt-1">
                          {voucher.description}
                        </p>
                      </div>

                      <div className="px-4 py-2 bg-zinc-955/20 border-t border-dashed border-zinc-850/80 flex justify-between items-center gap-4">
                        <span className="font-mono text-body3 text-text-sub2 font-bold tracking-wide">{voucher.code}</span>
                        <button
                          onClick={() => handleCopyCode(voucher.code)}
                          className="text-[11px] bg-zinc-800 hover:bg-cta hover:text-white border border-zinc-700 hover:border-cta text-text-sub2 px-3 py-1 rounded font-bold cursor-pointer transition-all flex items-center gap-1.5"
                        >
                          <Copy className="w-3 h-3" />
                          Sao chép
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: Privacy Policy (Chính sách bảo mật) */}
            {activeTab === 'privacy' && (
              <div className="relative z-10 flex flex-col gap-6 text-left">
                <h3 className="text-subtitle font-bold text-text-main pb-2 border-b border-zinc-800/60">
                  Chính sách bảo mật thông tin
                </h3>
                
                <div className="flex flex-col gap-5 text-body3 text-text-sub3 leading-relaxed h-[360px] overflow-y-auto pr-2 custom-scrollbar">
                  <div>
                    <h4 className="font-bold text-text-sub1 text-body2 mb-1">1. Thu thập thông tin cá nhân</h4>
                    <p className="text-zinc-500 text-body3">
                      Chúng tôi thu thập các thông tin cá nhân khi bạn đăng ký tài khoản thành viên, bao gồm họ tên, địa chỉ email, số điện thoại và ngày sinh để xác nhận danh tính và cung cấp các dịch vụ đặt vé trực tuyến thuận tiện nhất.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-text-sub1 text-body2 mb-1">2. Sử dụng thông tin của bạn</h4>
                    <p className="text-zinc-500 text-body3">
                      Thông tin của bạn sẽ được sử dụng cho việc xử lý đơn hàng vé xem phim, gửi thư điện tử xác nhận đặt chỗ, thông báo các chương trình khuyến mãi tích sao đổi quà, và liên lạc khi cần thiết để hỗ trợ khách hàng.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-text-sub1 text-body2 mb-1">3. Bảo mật dữ liệu người dùng</h4>
                    <p className="text-zinc-500 text-body3">
                      Logo Cinema cam kết bảo vệ thông tin cá nhân của khách hàng bằng các phương thức bảo mật kỹ thuật số tiên tiến nhất. Dữ liệu của bạn được mã hóa an toàn và không chia sẻ cho bất kỳ bên thứ ba nào khi không có sự đồng ý của bạn.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-text-sub1 text-body2 mb-1">4. Quyền chỉnh sửa và xóa thông tin</h4>
                    <p className="text-zinc-500 text-body3">
                      Bạn có quyền chỉnh sửa các thông tin cá nhân trong trang cài đặt tài khoản bất kỳ lúc nào. Nếu bạn muốn vô hiệu hóa hoặc xóa bỏ tài khoản của mình khỏi hệ thống, vui lòng liên hệ với bộ phận CSKH để được trợ giúp nhanh nhất.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* PASSWORD CHANGE MODAL */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-xs select-none">
          <div className="absolute inset-0" onClick={() => setIsPasswordModalOpen(false)}></div>
          
          <div className="relative w-full max-w-[420px] mx-4 bg-zinc-955 border border-zinc-850 rounded-2xl p-6 md:p-8 shadow-2xl z-10 animate-slide-down">
            <h3 className="text-heading2 font-bold text-text-main mb-6 border-b border-zinc-850 pb-3">
              Thay đổi mật khẩu
            </h3>

            <form onSubmit={handleSavePassword} className="space-y-4">
              
              {/* Current Password */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-body3 text-text-sub2 font-semibold">Mật khẩu hiện tại</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Nhập mật khẩu hiện tại"
                    className="w-full h-[42px] bg-[#333333]/60 text-white rounded-lg pl-4 pr-10 border border-zinc-700/60 text-body3 placeholder-zinc-500 light-cast-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    {showCurrentPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <span className="text-red-500 text-[11px] mt-1">{passwordErrors.currentPassword}</span>
                )}
              </div>

              {/* New Password */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-body3 text-text-sub2 font-semibold">Mật khẩu mới</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                    className="w-full h-[42px] bg-[#333333]/60 text-white rounded-lg pl-4 pr-10 border border-zinc-700/60 text-body3 placeholder-zinc-500 light-cast-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    {showNewPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <span className="text-red-500 text-[11px] mt-1">{passwordErrors.newPassword}</span>
                )}
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-body3 text-text-sub2 font-semibold">Xác nhận mật khẩu mới</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full h-[42px] bg-[#333333]/60 text-white rounded-lg pl-4 pr-10 border border-zinc-700/60 text-body3 placeholder-zinc-500 light-cast-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <span className="text-red-500 text-[11px] mt-1">{passwordErrors.confirmPassword}</span>
                )}
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => {
                    setIsPasswordModalOpen(false);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setPasswordErrors({});
                  }}
                  className="text-body3 border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-text-sub2 px-5 py-2 rounded font-bold cursor-pointer transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="text-body3 bg-cta hover:bg-cta-light text-text-main px-5 py-2 rounded font-bold cursor-pointer transition-colors"
                >
                  Xác nhận
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* EMAIL CHANGE MODAL */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-xs select-none">
          <div className="absolute inset-0" onClick={() => {
            setIsEmailModalOpen(false);
            setNewEmailForm({ newEmail: '' });
            setEmailErrors({});
          }}></div>
          
          <div className="relative w-full max-w-[420px] mx-4 bg-zinc-955 border border-zinc-850 rounded-2xl p-6 md:p-8 shadow-2xl z-10 animate-slide-down">
            <h3 className="text-heading2 font-bold text-text-main mb-6 border-b border-zinc-850 pb-3">
              Thay đổi email
            </h3>

            <form onSubmit={handleSaveEmail} className="space-y-4">
              
              {/* New Email */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-body3 text-text-sub2 font-semibold">Email mới</label>
                <div className="relative">
                  <input
                    type="email"
                    name="newEmail"
                    value={newEmailForm.newEmail}
                    onChange={(e) => {
                      setNewEmailForm({ newEmail: e.target.value });
                      if (emailErrors.newEmail) setEmailErrors({});
                    }}
                    placeholder="Nhập email mới"
                    className="w-full h-[42px] bg-[#333333]/60 text-white rounded-lg pl-4 pr-4 border border-zinc-700/60 text-body3 placeholder-zinc-500 light-cast-input"
                    autoFocus
                  />
                </div>
                {emailErrors.newEmail && (
                  <span className="text-red-500 text-[11px] mt-1">{emailErrors.newEmail}</span>
                )}
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => {
                    setIsEmailModalOpen(false);
                    setNewEmailForm({ newEmail: '' });
                    setEmailErrors({});
                  }}
                  className="text-body3 border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-text-sub2 px-5 py-2 rounded font-bold cursor-pointer transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="text-body3 bg-cta hover:bg-cta-light text-text-main px-5 py-2 rounded font-bold cursor-pointer transition-colors"
                >
                  Xác nhận
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Styled JSX for layout forcing and glass design */}
      <style>{`
        /* Force desktop layout side-by-side */
        @media (min-width: 1024px) {
          .profile-layout-container {
            display: flex !important;
            flex-direction: row !important;
            flex-wrap: nowrap !important;
          }
          .profile-sidebar-col {
            width: 33.333% !important;
            flex-shrink: 0 !important;
          }
          .profile-content-col {
            width: 66.667% !important;
            flex-grow: 1 !important;
            flex-shrink: 0 !important;
          }
        }

        .profile-card, .info-card {
          background: linear-gradient(to bottom, rgba(16, 16, 20, 0.72) 0%, rgba(12, 12, 16, 0.78) 100%);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255,255,255,0.06);
        }

        .profile-card::before, .info-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 16px;
          padding: 1.2px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          pointer-events: none;
        }

        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.01);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(207, 15, 71, 0.25);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(207, 15, 71, 0.45);
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
      `}</style>

    </div>
  );
}
