import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Camera, Trophy } from 'lucide-react';
import TabFilter from '../../components/TabFilter';
import CinemaTicketModal from '../../components/CinemaTicketModal';
import Toast from '../../components/Toast';
import { changePassword, updateProfile } from '../../services/authService';
import { USE_MOCK } from '../../services/apiConfig';
import apiClient from '../../services/apiClient';
import { getNowShowing } from '../../services/movieService';
import ScrollReveal from '../../components/ScrollReveal';

// Sub-components
import PasswordModal from './components/PasswordModal';
import EmailModal from './components/EmailModal';
import InfoTab from './components/InfoTab';
import HistoryTab from './components/HistoryTab';
import RewardsTab from './components/RewardsTab';
import PrivacyTab from './components/PrivacyTab';

// Mock data
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

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  // Active Tab: 'info' | 'history' | 'rewards' | 'privacy'
  const [activeTab, setActiveTab] = useState('info');
  const [localTickets, setLocalTickets] = useState([]);
  const [dbInvoices, setDbInvoices] = useState([]);
  const [moviesList, setMoviesList] = useState([]);
  const [selectedTicketForModal, setSelectedTicketForModal] = useState(null);

  useEffect(() => {
    try {
      const tickets = JSON.parse(localStorage.getItem('my_cinema_tickets') || '[]');
      setLocalTickets(tickets);
    } catch (e) {
      console.error("Error loading local tickets", e);
    }
  }, [location, activeTab]);

  useEffect(() => {
    if (!USE_MOCK && user && user.id) {
      console.log(">>> Fetching invoices from BE for user ID:", user.id);
      apiClient.get(`/invoices/users/${user.id}`)
        .then(res => {
          const invoices = Array.isArray(res) ? res : (res?.data || []);
          const paidInvoices = invoices
            .filter(inv => inv.status === 'PAID')
            .sort((a, b) => (b.invoiceId || b.id || 0) - (a.invoiceId || a.id || 0))
            .slice(0, 20);
          console.log(">>> Top 20 Paid Invoices loaded from BE:", paidInvoices);
          setDbInvoices(paidInvoices);
        })
        .catch(err => {
          console.error("Failed to fetch invoices from BE:", err);
        });
      
      getNowShowing().then((data) => {
        setMoviesList(data);
      }).catch(err => console.error("Failed to load movies:", err));
    } else {
      console.log(">>> Skip fetching invoices. USE_MOCK:", USE_MOCK, "user:", user);
    }
  }, [user]);

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

  // Toast notifications state
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success', title) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam && ['info', 'history', 'rewards', 'privacy'].includes(tabParam)) {
      setActiveTab(tabParam);
    } else if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.search, location.state]);

  // Sync state if user store loaded late
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        birthday: user.birthday || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
      });
    }
  }, [user]);

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
  const handleSaveInfo = async () => {
    if (validateInfo()) {
      try {
        if (!user || !user.id) {
          showToast('Không tìm thấy thông tin người dùng! Vui lòng đăng nhập lại.', 'warning');
          return;
        }
        await updateProfile(user.id, formData);
        updateUser(formData);
        setIsEditing(false);
        showToast('Cập nhật thông tin cá nhân thành công!', 'success');
      } catch (err) {
        console.error('Error updating profile:', err);
        const data = err.response?.data;
        const errMsg = (typeof data === 'string' && data) || data?.errorMessage || data?.message || err.message || 'Không thể kết nối đến máy chủ. Vui lòng thử lại!';
        showToast(errMsg, 'error');
      }
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
  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (validatePassword()) {
      try {
        if (!user || !user.id) {
          showToast('Không tìm thấy thông tin người dùng! Vui lòng đăng nhập lại.');
          return;
        }
        await changePassword(user.id, user.email, passwordForm.currentPassword, passwordForm.newPassword);
        setIsPasswordModalOpen(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setPasswordErrors({});
        showToast('Thay đổi mật khẩu thành công!');
      } catch (err) {
        console.error('Error changing password:', err);
        const errMsg = err.response?.data?.message || err.response?.data || 'Mật khẩu hiện tại không chính xác hoặc có lỗi xảy ra!';
        setPasswordErrors({ currentPassword: errMsg });
        showToast(errMsg);
      }
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

  const allTickets = useMemo(() => {
    // Adapt local tickets saved in localStorage (from SuccessScreen)
    const adaptedLocal = (localTickets || []).map((t) => {
      const seatStr = Array.isArray(t.seats)
        ? t.seats
            .map((s) => (typeof s === 'object' ? (s.id || `${s.seatRowLabel || ''}${s.seatColNumber || ''}`) : s))
            .filter(Boolean)
            .join(', ')
        : String(t.seats || '');

      return {
        id: t.ticketCode || `INV-${Date.now()}`,
        title: t.movie?.title || 'Vé xem phim',
        poster: t.movie?.posterUrl || '',
        theater: t.theater || 'Galaxy Cinema',
        room: t.showtime?.room || '',
        date: t.date?.dateLabel || t.bookingDate || '',
        time: `${t.showtime?.start || ''} ${t.showtime?.end ? '~ ' + t.showtime.end : ''}`.trim(),
        seats: seatStr || 'Chưa xác định',
        combo: Array.isArray(t.combos) && t.combos.length > 0 ? t.combos.join(', ') : 'Không kèm combo',
        price: Number(t.total || 0),
        status: 'Thành công',
        format: t.showtime?.format || '2D',
        lang: t.showtime?.lang || 'Phụ đề',
        ageRating: t.movie?.ageRating || 'P',
        isLocal: true,
        rawTicket: t,
      };
    });

    if (USE_MOCK) {
      return [...adaptedLocal, ...mockTickets];
    }

    // Real DB Invoices (status === 'PAID' or 'COMPLETED' or 'SUCCESS' or 'HELD')
    const paidInvoices = (dbInvoices || []).filter(
      (inv) => inv.status === 'PAID' || inv.status === 'COMPLETED' || inv.status === 'SUCCESS'
    );

    const mappedDbTickets = paidInvoices.map((inv) => {
      const movieObj = moviesList.find((m) => m.id === inv.showtime?.movieId);
      const poster = movieObj?.posterUrl || '';
      const ageRating = movieObj?.ageRating || 'P';

      const seatLabels = (inv.tickets || [])
        .map((t) => (t.seatRowLabel && t.seatColNumber ? `${t.seatRowLabel}${t.seatColNumber}` : t.displayName || t.id || ''))
        .filter(Boolean)
        .join(', ');
      const comboLabels =
        (inv.products || []).length > 0
          ? inv.products.map((p) => `${p.quantity}x ${p.productName}`).join(', ')
          : 'Không kèm combo';

      let formattedDate = inv.showtime?.date;
      try {
        if (inv.showtime?.date) {
          const d = new Date(inv.showtime.date);
          formattedDate = d.toLocaleDateString('vi-VN');
        }
      } catch (e) {}

      const startTime = inv.showtime?.startTime ? inv.showtime.startTime.substring(0, 5) : '';

      return {
        id: String(inv.invoiceId).startsWith('INV') ? inv.invoiceId : `INV${inv.invoiceId}`,
        title: inv.showtime?.movieName || 'Phim',
        poster,
        theater: 'Rạp chiếu phim',
        room: inv.showtime?.hallName || 'Phòng 3',
        date: formattedDate,
        rawDate: inv.showtime?.date,
        time: startTime,
        seats: seatLabels || 'Chưa xác định',
        combo: comboLabels,
        price: Number(inv.totalAmount || 0),
        status: 'Thành công',
        format: inv.showtime?.type || '2D',
        lang: 'Phụ đề',
        ageRating,
        isLocal: false,
        rawInvoice: inv,
      };
    });

    const dbTicketCodes = new Set(mappedDbTickets.map((t) => String(t.id)));
    const uniqueLocalTickets = adaptedLocal.filter((t) => !dbTicketCodes.has(String(t.id)));

    return [...mappedDbTickets, ...uniqueLocalTickets];
  }, [dbInvoices, moviesList, localTickets]);

  const handleTicketClick = (ticket) => {
    if (ticket.rawInvoice) {
      const inv = ticket.rawInvoice;
      const ticketToView = {
        ticketCode: `INV${inv.invoiceId}`,
        theater: ticket.theater || 'Rạp chiếu phim',
        movie: {
          title: inv.showtime.movieName,
          posterUrl: ticket.poster,
          ageRating: ticket.ageRating
        },
        showtime: {
          format: inv.showtime.type || '2D',
          lang: 'Phụ đề',
          start: inv.showtime.startTime ? inv.showtime.startTime.substring(0, 5) : '',
          room: inv.showtime.hallName
        },
        date: {
          dateLabel: ticket.date,
          rawDate: inv.showtime.date,
          dayLabel: ''
        },
        seats: inv.tickets.map(t => ({ id: t.seatRowLabel + t.seatColNumber })),
        total: Number(inv.totalAmount),
        payment: {
          name: inv.paymentMethod === 'VNPAY' ? 'Ví VNPay' : inv.paymentMethod,
          bg: '#1a56db',
          letter: 'P'
        },
        combos: inv.products.map(p => `${p.quantity}x ${p.productName}`)
      };
      setSelectedTicketForModal(ticketToView);
    } else {
      const ticketToView = ticket.isLocal ? ticket.rawTicket : {
        ticketCode: ticket.id,
        movie: {
          title: ticket.title,
          posterUrl: ticket.poster,
          ageRating: ticket.ageRating
        },
        showtime: {
          format: ticket.format,
          lang: ticket.lang,
          start: ticket.time.split(' ~ ')[0] || ticket.time,
          room: ticket.room
        },
        date: {
          dateLabel: ticket.date,
          dayLabel: ''
        },
        seats: ticket.seats.split(', ').map(id => ({ id })),
        total: ticket.price,
        payment: {
          name: 'Thanh toán online',
          bg: '#1a56db',
          letter: 'C'
        },
        combos: ticket.combo && ticket.combo !== 'Không kèm combo' ? [ticket.combo] : []
      };
      setSelectedTicketForModal(ticketToView);
    }
  };

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-left font-google-sans min-h-screen">

      {/* Toast Notification */}
      <Toast toasts={toasts} onRemove={removeToast} />

      {/* Grid Layout: Sidebar 1/3 (4 columns), Main Content 2/3 (8 columns) */}
      <div className="profile-layout-container flex flex-col gap-8 mt-4 items-start">

        {/* LEFT COLUMN: Sidebar Card */}
        <div className="profile-sidebar-col w-full flex flex-col gap-6">
          <ScrollReveal direction="right">
            <div className="relative rounded-2xl p-6 bg-zinc-900/50 backdrop-blur-md border border-zinc-800/80 shadow-2xl overflow-hidden profile-card">

              {/* Visual spotlight */}
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
                style={{
                  background: 'radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 70%)',
                  mixBlendMode: 'screen',
                }}
              />

              <div className="relative z-10 flex flex-col gap-5 text-left">
                {/* Avatar and Name */}
                <div className="flex items-center gap-5 text-left px-1">
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

                  <div className="min-w-0 text-left">
                    <h3 className="text-body1 font-bold text-white tracking-wide truncate">
                      {formData.fullName}
                    </h3>
                    <p className="text-body3 text-zinc-500 mt-0.5 font-medium">
                      {user.stars || 0} sao
                    </p>
                  </div>
                </div>

                <hr className="border-zinc-800/80 my-1" />

                {/* Total Spending */}
                <div className="flex justify-between items-center px-1 text-left">
                  <span className="text-body2 text-zinc-400 font-medium">Tổng cộng trong năm 2026</span>
                  <span className="text-body2 font-bold text-white">0 đ</span>
                </div>

                {/* Progress Milestones */}
                <div className="px-1 mt-2 select-none relative mb-2">
                  <div className="flex justify-between items-center relative z-10 mb-2">
                    {[1, 2, 3].map((m) => (
                      <div key={m} className="flex flex-col items-center">
                        <Trophy className="w-5 h-5 text-zinc-500" />
                      </div>
                    ))}
                  </div>

                  <div className="h-2 w-full bg-zinc-800 rounded-full relative overflow-visible mb-2">
                    <div className="h-full bg-zinc-500 rounded-full" style={{ width: `8%` }} />
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

                  <div className="flex justify-between text-body3 font-medium text-zinc-500">
                    <span className="text-[11px]">0 đ</span>
                    <span className="text-[11px]">0 đ</span>
                    <span className="text-[11px]">0 đ</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* RIGHT COLUMN: Content with Tabs */}
        <div className="profile-content-col w-full flex flex-col">
          <ScrollReveal direction="up">
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

            <div className="relative rounded-2xl p-6 md:p-8 bg-zinc-900/50 backdrop-blur-md border border-zinc-800/80 shadow-2xl info-card min-h-[460px]">
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
                style={{
                  background: 'radial-gradient(circle at 100% 0%, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0) 70%)',
                  mixBlendMode: 'screen',
                }}
              />

              {/* Render Active Tab */}
              {activeTab === 'info' && (
                <InfoTab
                  user={user}
                  formData={formData}
                  errors={errors}
                  handleInputChange={handleInputChange}
                  isEditing={isEditing}
                  handleCancelEdit={handleCancelEdit}
                  handleSaveInfo={handleSaveInfo}
                  setIsEditing={setIsEditing}
                  setIsEmailModalOpen={setIsEmailModalOpen}
                  setIsPasswordModalOpen={setIsPasswordModalOpen}
                />
              )}

              {activeTab === 'history' && (
                <HistoryTab
                  allTickets={allTickets}
                  handleTicketClick={handleTicketClick}
                />
              )}

              {activeTab === 'rewards' && (
                <RewardsTab
                  user={user}
                  mockVouchers={mockVouchers}
                  handleCopyCode={handleCopyCode}
                />
              )}

              {activeTab === 'privacy' && (
                <PrivacyTab />
              )}
            </div>
          </ScrollReveal>
        </div>

      </div>

      {/* Password Change Modal */}
      <PasswordModal
        open={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
          setPasswordErrors({});
        }}
        handleSavePassword={handleSavePassword}
        passwordForm={passwordForm}
        handlePasswordInputChange={handlePasswordInputChange}
        passwordErrors={passwordErrors}
        showCurrentPassword={showCurrentPassword}
        setShowCurrentPassword={setShowCurrentPassword}
        showNewPassword={showNewPassword}
        setShowNewPassword={setShowNewPassword}
        showConfirmPassword={showConfirmPassword}
        setShowConfirmPassword={setShowConfirmPassword}
      />

      {/* Email Change Modal */}
      <EmailModal
        open={isEmailModalOpen}
        onClose={() => {
          setIsEmailModalOpen(false);
          setNewEmailForm({ newEmail: '' });
          setEmailErrors({});
        }}
        handleSaveEmail={handleSaveEmail}
        newEmailForm={newEmailForm}
        setNewEmailForm={setNewEmailForm}
        emailErrors={emailErrors}
        setEmailErrors={setEmailErrors}
      />

      {/* Ticket Detail Modal */}
      {selectedTicketForModal && (
        <CinemaTicketModal
          ticket={selectedTicketForModal}
          onClose={() => setSelectedTicketForModal(null)}
        />
      )}

      {/* Styled JSX */}
      <style>{`
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
