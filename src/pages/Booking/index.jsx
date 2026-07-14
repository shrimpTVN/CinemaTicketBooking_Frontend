import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getNowShowing } from '../../services/movieService';
import { useBookingStore } from '../../store/bookingStore';
import { useAuthStore } from '../../store/authStore';
import { ALL_DATES, SHOWTIMES } from './bookingConstants';
import { formatTimer, generateVnPayUrl, fmtVND } from './bookingUtils';
import { USE_MOCK } from '../../services/apiConfig';
import apiClient from '../../services/apiClient';

// Sub-components
import StepIndicator from './components/StepIndicator';
import ShowtimeSelection from './components/ShowtimeSelection';
import SeatSelection from './components/SeatSelection';
import ComboSelection from './components/ComboSelection';
import PaymentSelection from './components/PaymentSelection';
import BookingSummary from './components/BookingSummary';
import SuccessScreen from './components/SuccessScreen';
import AgeRatingTag from '../../components/AgeRatingTag';

export default function Booking() {
  const {
    step,
    setStep,
    movie,
    setMovie,
    date,
    setDate,
    showtime,
    setShowtime,
    selectedSeats,
    combos,
    setCombos,
    payment,
    setPayment,
    holdTimer,
    startHoldTimer,
    clearHoldTimer,
    getAssignedSeats,
    resetStore,
  } = useBookingStore();

  const location = useLocation();
  const navigate = useNavigate();
  const preMovieId = location.state?.movieId;

  const [movies, setMovies] = useState([]);
  const [dateWindowStart, setDateWindowStart] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [stepLoading, setStepLoading] = useState(false);

  // Transition loader between steps to hide progressive loading / fetching states
  const prevStepRef = useRef(step);
  useEffect(() => {
    if (prevStepRef.current !== step) {
      setStepLoading(true);
      prevStepRef.current = step;
      const timer = setTimeout(() => {
        setStepLoading(false);
      }, 700); // 700ms provides enough time for background network calls & images to start painting
      return () => clearTimeout(timer);
    }
  }, [step]);

  const fetchPaymentMethods = useBookingStore((s) => s.fetchPaymentMethods);
  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  const pushToast = useCallback((message, type = 'error') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const hasInitializedRef = useRef(false);
  // Track whether the hold-timer session is already active (prevents reset on step 3→4 transition)
  const holdTimerStartedRef = useRef(false);
  // Flag set during VNPay failure restoration to prevent currentInvoice cascade-reset
  const isRestoringVnpayRef = useRef(false);
  // Always-current ref of currentInvoice for use inside cleanup callbacks
  const currentInvoiceRef = useRef(null);

  useEffect(() => {
    if (hasInitializedRef.current) return;

    getNowShowing().then((data) => {
      setMovies(data);
      if (preMovieId) {
        const found = data.find((m) => m.id === Number(preMovieId));
        if (found) {
          let selectedDate = null;
          if (location.state?.dateKey) {
            const parts = location.state.dateKey.split('-');
            const yr = parseInt(parts[0], 10);
            const mo = parseInt(parts[1], 10) - 1;
            const dy = parseInt(parts[2], 10);
            selectedDate = {
              key: location.state.dateKey,
              dayLabel: location.state.dayLabel === 'Hôm nay' ? 'Hôm nay' : location.state.dayLabel,
              dateLabel: location.state.date,
              dateObj: new Date(yr, mo, dy)
            };
          } else if (location.state?.date) {
            const matchedDate = ALL_DATES.find((d) => d.dateLabel === location.state.date);
            if (matchedDate) selectedDate = matchedDate;
          }

          if (!selectedDate) {
            selectedDate = ALL_DATES[0];
          }

          let selectedShowtime = null;
          if (location.state?.showtime) {
            if (USE_MOCK) {
              const matchedShowtime = SHOWTIMES.find((st) => st.start === location.state.showtime);
              if (matchedShowtime) {
                selectedShowtime = matchedShowtime;
              }
            }

            if (!selectedShowtime) {
              const format = location.state.format || '2D';
              const isLồngTiếng = format.includes('Lồng Tiếng') || format.includes('Lòng tiếng');
              const timeParts = location.state.showtime.split(':');
              const startHour = parseInt(timeParts[0], 10);
              const startMin = timeParts[1] || '00';
              const endHour = String((startHour + 2) % 24).padStart(2, '0');
              selectedShowtime = {
                id: location.state.showtimeId || `st-dynamic-${Date.now()}`,
                format: format.includes('IMAX') ? 'IMAX' : '2D',
                lang: isLồngTiếng ? 'Thuyết minh' : 'Phụ đề',
                start: location.state.showtime,
                end: `${endHour}:${startMin}`,
                available: 78,
                room: location.state.roomName || (format.includes('IMAX') ? 'Phòng IMAX' : 'Phòng 1'),
                hallId: location.state.hallId || 1,
              };
            }
          }

          setMovie(found);
          setDate(selectedDate);
          if (selectedShowtime) {
            hasInitializedRef.current = true;
            setShowtime(selectedShowtime).then(() => {
              // Check auth only after layout has fully loaded
              const user = useAuthStore.getState().user;
              if (!user) {
                pushToast('Vui lòng đăng nhập để tiếp tục đặt vé', 'error');
                sessionStorage.setItem('booking_redirect_auth', 'true');
                setTimeout(() => navigate('/login', { state: { from: '/booking' } }), 1200);
              } else {
                setStep(2);
              }
            }).catch(err => {
              console.error("Failed to load showtime layout:", err);
            });
          }
        }
      }
    });
  }, [preMovieId, location.state, setMovie, setDate, setShowtime, setStep, navigate]);

  // Seat hold timer — unmount-only cleanup (prevents double-clear on step changes)
  useEffect(() => {
    return () => clearHoldTimer();
  }, [clearHoldTimer]);

  // Seat hold timer — start once when entering step 3/4, stop when leaving, never reset on 3→4
  useEffect(() => {
    if (step === 3 || step === 4) {
      if (!holdTimerStartedRef.current) {
        holdTimerStartedRef.current = true;
        startHoldTimer(() => {
          holdTimerStartedRef.current = false;
          pushToast("Đã hết thời gian giữ ghế tạm thời! Vui lòng chọn lại ghế.", "warning");
          setStep(2);
          // Refresh seat layout from BE so statuses are accurate after expiry
          useBookingStore.getState().initLayout();
        });
      }
    } else {
      if (holdTimerStartedRef.current) {
        holdTimerStartedRef.current = false;
        clearHoldTimer();
      }
    }
  }, [step, startHoldTimer, clearHoldTimer, pushToast, setStep]);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Handle VNPAY payment callback
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const responseCode = params.get('vnp_ResponseCode');
    const txnRef = params.get('vnp_TxnRef');
    
    if (responseCode && txnRef) {
      const savedBookingStr = sessionStorage.getItem('pending_vnpay_booking');
      if (savedBookingStr) {
        try {
          const savedBooking = JSON.parse(savedBookingStr);
          
          if (responseCode === '00') {
            const invoiceId = parseInt(txnRef, 10);
            
            const finalize = async () => {
              setStepLoading(true);
              if (!USE_MOCK) {
                try {
                  await apiClient.post(`/invoices/change-status/${invoiceId}?status=PAID`);
                } catch (error) {
                  console.error("Failed to update invoice status:", error);
                }
              }
              
              // Restore state to store
              setMovie(savedBooking.movie);
              setDate(savedBooking.date);
              setShowtime(savedBooking.showtime);
              useBookingStore.setState({
                selectedSeats: savedBooking.selectedSeats,
                combos: savedBooking.combos,
                payment: 'VNPAY',
                step: 'success'
              });
              
              sessionStorage.removeItem('pending_vnpay_booking');
              setStepLoading(false);
              navigate('/booking', { replace: true });
            };
            finalize();
          } else {
            pushToast("Thanh toán VNPay thất bại! Vui lòng chọn phương thức khác hoặc thử lại.", "error");

            // Set flag BEFORE state updates so the currentInvoice reset useEffect is suppressed
            isRestoringVnpayRef.current = true;

            // Restore booking state directly (bypass setShowtime to avoid resetting selectedSeats in store)
            useBookingStore.setState({
              movie: savedBooking.movie,
              date: savedBooking.date,
              showtime: savedBooking.showtime,
              selectedSeats: savedBooking.selectedSeats,
              combos: savedBooking.combos,
              payment: savedBooking.payment || 'VNPAY',
              step: 4
            });

            // Unset flag after React effects have settled
            setTimeout(() => { isRestoringVnpayRef.current = false; }, 200);

            sessionStorage.removeItem('pending_vnpay_booking');
            navigate('/booking', { replace: true });
          }
        } catch (e) {
          console.error("Error parsing saved booking state", e);
          pushToast("Lỗi đồng bộ dữ liệu thanh toán!", "error");
          navigate('/booking', { replace: true });
        }
      }
    }
  }, [location.search, navigate, pushToast, setMovie, setDate, setShowtime]);

  // Reset store when leaving booking page (unmounting), except when redirecting to auth
  useEffect(() => {
    return () => {
      const isRedirecting = sessionStorage.getItem('booking_redirect_auth');
      if (isRedirecting === 'true') {
        sessionStorage.removeItem('booking_redirect_auth');
      } else {
        // If no invoice was created yet, release HELD seats back to AVAILABLE on the BE
        if (!currentInvoiceRef.current?.id && !USE_MOCK) {
          const state = useBookingStore.getState();
          const user = useAuthStore.getState().user;
          if (state.selectedSeats.length > 0 && state.showtime && user) {
            apiClient.post(`/showtime-seats/showtimes/${state.showtime.id}/release`, {
              seatIds: state.selectedSeats.map(s => s.dbId),
              userId: user.id
            }).catch(err => console.error('[Unmount] Failed to release seats:', err));
          }
        }
        sessionStorage.removeItem('current_booking_invoice');
        resetStore();
      }
    };
  }, [resetStore]);

  // Auto transition to step 2 if returning from auth redirect with movie & showtime selected
  useEffect(() => {
    const isRedirecting = sessionStorage.getItem('booking_redirect_auth');
    if (isRedirecting === 'true') {
      sessionStorage.removeItem('booking_redirect_auth');
      if (movie && showtime) {
        setStep(2);
      }
    }
  }, [movie, showtime, setStep]);

  const canNext = useMemo(() => {
    if (step === 1) return !!movie && !!showtime;
    if (step === 2) return selectedSeats.length > 0;
    if (step === 3) return true;
    if (step === 4) return !!payment;
    return false;
  }, [step, movie, showtime, selectedSeats, payment]);

  const [activePaymentModal, setActivePaymentModal] = useState(null);
  const [currentInvoice, setCurrentInvoice] = useState(() => {
    try {
      const saved = sessionStorage.getItem('current_booking_invoice');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [cardInfo, setCardInfo] = useState({ number: '', name: '', date: '', cvv: '' });
  const [otpInput, setOtpInput] = useState('');
  const [cardErrors, setCardErrors] = useState({});

  // Keep currentInvoiceRef in sync so cleanup callbacks always see the latest value
  useEffect(() => {
    currentInvoiceRef.current = currentInvoice;
  }, [currentInvoice]);

  // Reset currentInvoice when seats/combos/showtime change — but NOT during VNPay restoration
  useEffect(() => {
    if (isRestoringVnpayRef.current) return;
    setCurrentInvoice(null);
    sessionStorage.removeItem('current_booking_invoice');
  }, [selectedSeats, combos, showtime]);

  const processCheckout = async () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      pushToast("Vui lòng đăng nhập lại để thực hiện thanh toán!", "error");
      return;
    }
    
    setStepLoading(true);
    
    let invoiceId = currentInvoice?.id;
    let finalAmount = currentInvoice?.amount;
    
    if (!invoiceId) {
      if (!USE_MOCK) {
        try {
          // Group seat checkouts by audience type
          const audienceTypeMap = {
            'Người lớn': 1,
            'U22': 2,
            'Trẻ nhỏ': 3,
            'Sinh viên': 4,
            'Người cao tuổi': 5,
            'Người khuyết tật': 6
          };
          
          const groupedCheckoutsMap = {};
          getAssignedSeats().forEach(seat => {
            const typeStr = seat.audienceType || 'Người lớn';
            const typeId = audienceTypeMap[typeStr] || 1;
            if (!groupedCheckoutsMap[typeId]) {
              groupedCheckoutsMap[typeId] = [];
            }
            groupedCheckoutsMap[typeId].push(seat.dbId);
          });
          
          const seatCheckouts = Object.entries(groupedCheckoutsMap).map(([typeId, seatIds]) => ({
            audienceTypeId: parseInt(typeId, 10),
            seatIds
          }));
          
          // Invoice details (combos)
          const invoiceDetails = Object.entries(combos)
            .filter(([, qty]) => qty > 0)
            .map(([id, qty]) => ({
              productId: parseInt(id, 10),
              quantity: qty
            }));
            
          const checkoutPayload = {
            userId: user.id,
            showtimeId: showtime.id,
            seatCheckouts,
            invoiceDetails,
            paymentMethod: payment
          };
          
          console.log(">>> [processCheckout] Calling checkout API with:", checkoutPayload);
          const invoiceRes = await apiClient.post('/invoices/checkout', checkoutPayload);
          const invoiceData = invoiceRes?.data || invoiceRes;
          
          invoiceId = invoiceData.invoiceId ?? invoiceData.id; // BE trả về invoiceId (InvoiceResponseDto)
          finalAmount = Number(invoiceData.totalAmount);
          if (!invoiceId) throw new Error('BE không trả về invoiceId hợp lệ: ' + JSON.stringify(invoiceData));
        } catch (err) {
          console.error("Checkout failed:", err);
          let errMsg = "Đặt vé thất bại! Vui lòng kiểm tra lại.";
          if (err.response?.data) {
            if (typeof err.response.data === 'string') {
              errMsg = err.response.data;
            } else if (err.response.data.errorMessage) {
              errMsg = err.response.data.errorMessage;
            } else if (err.response.data.message) {
              errMsg = err.response.data.message;
            }
          } else if (err.message) {
            errMsg = err.message;
          }
          pushToast(errMsg, "error");
          setStepLoading(false);
          return;
        }
      } else {
        // Mock checkouts
        invoiceId = `MOCK-INV-${Date.now().toString().slice(-6)}`;
        finalAmount = selectedSeats.reduce((s, seat) => s + seat.price, 0) + 
          Object.entries(combos).reduce((s, [id, qty]) => {
            const p = useBookingStore.getState().products.find(x => String(x.id) === id);
            const price = p ? Number(p.price) : (COMBOS.find(x => x.id === id)?.price || 0);
            return s + price * qty;
          }, 0);
        finalAmount = finalAmount * 1.08;
      }
      
      setCurrentInvoice({ id: invoiceId, amount: finalAmount });
      sessionStorage.setItem('current_booking_invoice', JSON.stringify({ id: invoiceId, amount: finalAmount }));
    } else {
      console.log(">>> [processCheckout] Invoice already exists, reusing: ", invoiceId);
    }
    
    setStepLoading(false);
    
    // Now route depending on payment method
    if (payment === 'VNPAY') {
      const returnUrl = `${window.location.origin}/booking`;
      const bookingState = {
        movie,
        date,
        showtime,
        selectedSeats: getAssignedSeats(),
        combos,
        payment
      };
      sessionStorage.setItem('pending_vnpay_booking', JSON.stringify(bookingState));
      
      const vnpayUrl = await generateVnPayUrl({
        invoiceId,
        amount: finalAmount,
        returnUrl
      });
      window.location.href = vnpayUrl;
    } else if (payment === 'MOMO') {
      setActivePaymentModal('MOMO_QR');
    } else if (payment === 'ZALOPAY') {
      setActivePaymentModal('ZALOPAY_QR');
    } else if (payment === 'BANK_CARD') {
      setActivePaymentModal('BANK_FORM');
    } else if (payment === 'CASH') {
      setStep('success');
    }
  };

  const handleNext = () => {
    // Require login before entering seat selection (step 1 → 2)
    if (step === 1) {
      const user = useAuthStore.getState().user;
      if (!user) {
        pushToast('Vui lòng đăng nhập để tiếp tục đặt vé', 'error');
        sessionStorage.setItem('booking_redirect_auth', 'true');
        setTimeout(() => navigate('/login', { state: { from: '/booking' } }), 1200);
        return;
      }
    }
    if (step < 4) setStep(step + 1);
    else {
      processCheckout();
    }
  };

  const handleBack = () => {
    if (typeof step === 'number' && step > 1) {
      if (step === 3) {
        setCombos({});
        // Refresh seat layout from BE when returning to seat selection step
        useBookingStore.getState().initLayout();
      }
      setStep(step - 1);
    }
  };

  const bookingCompat = {
    movie,
    date,
    showtime,
    seats: getAssignedSeats(),
    combos,
    payment,
  };

  const setBookingCompat = useCallback((fn) => {
    const dummy = fn({ movie, date, showtime, combos, payment });
    if (dummy.movie !== movie) setMovie(dummy.movie);
    if (dummy.date !== date) setDate(dummy.date);
    if (dummy.showtime !== showtime) setShowtime(dummy.showtime);
    if (dummy.combos !== combos) setCombos(dummy.combos);
    if (dummy.payment !== payment) setPayment(dummy.payment);
  }, [movie, date, showtime, combos, payment, setMovie, setDate, setShowtime, setCombos, setPayment]);

  if (step === 'success') {
    return (
      <div className="min-h-screen" style={{ background: '#121212' }}>
        <div className="max-w-3xl mx-auto px-4">
          <StepIndicator step="success" />
          <SuccessScreen booking={bookingCompat} />
        </div>
      </div>
    );
  }

  const getFullDayLabel = (dateObj) => {
    if (!dateObj) return '';
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return days[dateObj.getDay()];
  };

  return (
    <div className="min-h-screen" style={{ background: '#121212' }}>
      <div className="max-w-7xl mx-auto px-4 pb-36 lg:pb-12">
        <StepIndicator step={step} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_288px] gap-5 mt-2">
          {/* Main content */}
          <div>
            {/* Mobile-only Ticket Summary Card (visible on mobile during steps 1, 2, 3, 4) */}
            {typeof step === 'number' && (
              movie ? (
                <div className="lg:hidden mb-4 rounded-2xl overflow-hidden border border-white/8 bg-[#1A1A1A] p-4 text-left shadow-lg">
                  {/* Orange top accent line */}
                  <div className="h-[4px] bg-[#EAB308] -mx-4 -mt-4 mb-4" />
                  <div className="flex gap-4 items-start">
                    {/* Movie Poster */}
                    <div className="w-[64px] h-[92px] rounded-lg overflow-hidden bg-zinc-800 shrink-0 shadow-md">
                      {movie.posterUrl ? (
                        <img
                          src={movie.posterUrl}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-650 text-[10px]">N/A</div>
                      )}
                    </div>
                    {/* Movie and Showtime Details */}
                    <div className="flex-grow min-w-0 flex flex-col gap-1 text-left">
                      <div className="flex items-start gap-2 justify-between">
                        <h3 className="text-white font-extrabold text-sm leading-snug line-clamp-2 flex-grow">{movie.title}</h3>
                        {movie.ageRating && (
                          <AgeRatingTag rating={movie.ageRating} className="w-8 h-5 text-[10px]" />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap text-zinc-400 text-[11px] font-medium leading-none mt-1">
                        {showtime ? (
                          <span>{showtime.format} {showtime.lang === 'Phụ đề' ? 'Phụ Đề' : 'Thuyết Minh'}</span>
                        ) : (
                          <span className="text-zinc-550 italic">Chưa chọn định dạng</span>
                        )}
                      </div>
                      {showtime ? (
                        <p className="text-zinc-300 text-[11px] font-semibold">
                          Galaxy Cinema - <span className="uppercase text-white">{showtime.room || 'RAP 3'}</span>
                        </p>
                      ) : (
                        <p className="text-zinc-550 text-[11px] italic">Chưa chọn phòng chiếu</p>
                      )}
                      {date && showtime ? (
                        <p className="text-zinc-450 text-[11px] mt-0.5">
                          Suất: <span className="font-extrabold text-white text-xs">{showtime.start}</span> - {getFullDayLabel(date.dateObj)}, {date.dateLabel}/{date.dateObj.getFullYear()}
                        </p>
                      ) : (
                        <p className="text-zinc-550 text-[11px] italic mt-0.5">Chưa chọn suất chiếu</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Placeholder card on mobile when no movie is selected at Step 1 */
                <div className="lg:hidden mb-4 rounded-2xl overflow-hidden border border-white/8 bg-[#1A1A1A] p-4 text-left shadow-lg">
                  <div className="h-[4px] bg-zinc-700 -mx-4 -mt-4 mb-4" />
                  <div className="py-6 flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 rounded-full bg-white/4 flex items-center justify-center text-zinc-500 mb-2">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                      </svg>
                    </div>
                    <p className="text-zinc-550 text-xs">Vui lòng chọn phim để bắt đầu đặt vé</p>
                  </div>
                </div>
              )
            )}

            <div className={`transition-all duration-300 ${stepLoading ? 'opacity-0 scale-[0.99] translate-y-1 pointer-events-none' : 'opacity-100 scale-100 translate-y-0'}`}>
              {step === 1 && (
                <ShowtimeSelection
                  booking={bookingCompat}
                  setBooking={setBookingCompat}
                  movies={movies}
                  dateWindowStart={dateWindowStart}
                  setDateWindowStart={setDateWindowStart}
                />
              )}
              {step === 2 && (
                <SeatSelection
                  booking={bookingCompat}
                  setBooking={setBookingCompat}
                  pushToast={pushToast}
                  toasts={toasts}
                />
              )}
              {step === 3 && <ComboSelection booking={bookingCompat} setBooking={setBookingCompat} />}
              {step === 4 && <PaymentSelection booking={bookingCompat} setBooking={setBookingCompat} />}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <BookingSummary
              booking={bookingCompat}
              step={step}
              onBack={handleBack}
              onNext={handleNext}
              canNext={canNext}
            />
          </div>
        </div>
      </div>

      {/* MOMO & ZALOPAY QR MODAL */}
      {(activePaymentModal === 'MOMO_QR' || activePaymentModal === 'ZALOPAY_QR') && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#1c1c1e] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            {/* Header branding */}
            <div className="p-5 flex items-center gap-3 text-white border-b border-white/5" style={{ background: activePaymentModal === 'MOMO_QR' ? 'linear-gradient(135deg, #a50e5f 0%, #760741 100%)' : 'linear-gradient(135deg, #0468e6 0%, #0248a3 100%)' }}>
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center font-black text-lg">
                {activePaymentModal === 'MOMO_QR' ? 'M' : 'Z'}
              </div>
              <div className="text-left">
                <h3 className="font-extrabold text-sm leading-none">Thanh toán {activePaymentModal === 'MOMO_QR' ? 'Ví MoMo' : 'Ví ZaloPay'}</h3>
                <span className="text-[10px] text-white/70">Mã hóa đơn: #{currentInvoice?.id}</span>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 flex flex-col items-center text-center">
              {/* QR Code Container */}
              <div className="bg-white p-4 rounded-2xl shadow-lg mb-4 relative">
                <img 
                  src={`https://img.vietqr.io/image/970403-11336688-compact2.jpg?amount=${currentInvoice?.amount}&addInfo=Booking_${currentInvoice?.id}&accountName=Cinema_Ticket`}
                  alt="Mã QR Thanh Toán"
                  className="w-48 h-48 object-contain"
                />
              </div>
              
              <div className="text-zinc-400 text-xs px-4 mb-5 leading-relaxed">
                Quét mã QR bằng ứng dụng <span className="text-white font-semibold">{activePaymentModal === 'MOMO_QR' ? 'MoMo' : 'ZaloPay'}</span> hoặc ứng dụng ngân hàng để hoàn thành giao dịch tự động.
              </div>
              
              {/* Details table */}
              <div className="w-full bg-white/4 rounded-2xl p-4 flex flex-col gap-2.5 text-xs text-left mb-6">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Mã hóa đơn:</span>
                  <span className="text-white font-mono font-bold">#{currentInvoice?.id}</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-2.5">
                  <span className="text-zinc-500">Số tiền:</span>
                  <span className="text-[#EAB308] font-bold text-sm">{fmtVND(currentInvoice?.amount)}</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-2.5">
                  <span className="text-zinc-500">Nội dung chuyển khoản:</span>
                  <span className="text-white font-semibold font-mono">Booking_{currentInvoice?.id}</span>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={async () => {
                    setStepLoading(true);
                    if (!USE_MOCK && currentInvoice?.id) {
                      try {
                        await apiClient.post(`/invoices/change-status/${currentInvoice.id}?status=PAID`);
                      } catch (err) {
                        console.error("Failed to update status:", err);
                      }
                    }
                    setStepLoading(false);
                    setActivePaymentModal(null);
                    setStep('success');
                  }}
                  className="flex-grow py-3 rounded-xl text-white text-xs font-bold transition-all shadow-md cursor-pointer hover:opacity-90 text-center"
                  style={{ backgroundColor: activePaymentModal === 'MOMO_QR' ? '#a50e5f' : '#0468e6' }}
                >
                  Tôi đã quét & thanh toán thành công
                </button>
                <button
                  onClick={() => setActivePaymentModal(null)}
                  className="px-5 py-3 rounded-xl border border-zinc-700 text-zinc-400 text-xs font-semibold hover:bg-white/5 transition-all cursor-pointer animate-pulse"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BANK_CARD FORM MODAL */}
      {activePaymentModal === 'BANK_FORM' && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-lg bg-[#1c1c1e] rounded-3xl border border-white/10 overflow-hidden shadow-2xl my-8">
            <div className="p-5 flex items-center justify-between border-b border-white/5 bg-[#171719]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center font-bold text-white text-xs">C</div>
                <h3 className="font-bold text-sm text-white text-left">Thanh toán bằng Thẻ ngân hàng</h3>
              </div>
              <span className="text-zinc-500 text-xs">Mã hóa đơn: #{currentInvoice?.id}</span>
            </div>
            
            <div className="p-6">
              {/* Card visual mockup */}
              <div className="w-full h-44 rounded-2xl bg-gradient-to-br from-blue-700 via-blue-900 to-indigo-950 p-6 flex flex-col justify-between shadow-xl relative overflow-hidden mb-6 text-left">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-blue-200 uppercase tracking-widest font-black leading-none">Thẻ thanh toán</span>
                    <span className="text-[10px] text-white/50 font-bold font-mono mt-1 block">NCB - VNPAY TEST BANK</span>
                  </div>
                  <div className="h-6 w-10 bg-white/10 rounded flex items-center justify-center text-white/50 text-[10px] font-black italic">ATM</div>
                </div>
                
                {/* Chip and Card number */}
                <div className="flex flex-col gap-1.5">
                  <div className="w-8 h-6 bg-amber-400/80 rounded-md relative overflow-hidden flex items-center justify-center">
                    <div className="w-4 h-4 border border-zinc-900/20" />
                  </div>
                  <span className="text-base font-bold font-mono text-white tracking-widest leading-none mt-1">
                    {cardInfo.number || '•••• •••• •••• •••• •••'}
                  </span>
                </div>
                
                {/* Card holder & Expiry */}
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-blue-300 uppercase tracking-wider">Chủ thẻ</span>
                    <span className="text-xs font-bold text-white truncate max-w-[180px] uppercase leading-none">{cardInfo.name || 'NGUYEN VAN A'}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[8px] text-blue-300 uppercase tracking-wider">Hạn dùng</span>
                    <span className="text-xs font-bold text-white font-mono leading-none">{cardInfo.date || 'MM/YY'}</span>
                  </div>
                </div>
              </div>
              
              {/* Form Input fields */}
              <div className="flex flex-col gap-4 text-left">
                {/* Auto fill button */}
                <button
                  type="button"
                  onClick={() => {
                    setCardInfo({
                      number: '9704 1985 2619 1432 198',
                      name: 'NGUYEN VAN A',
                      date: '07/15',
                      cvv: '123'
                    });
                    setCardErrors({});
                  }}
                  className="w-full py-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl text-xs font-bold transition-all hover:bg-blue-500/20 cursor-pointer text-center"
                >
                  💡 Điền nhanh thông tin Thẻ ATM Test VNPay
                </button>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1.5 block">Số thẻ ngân hàng</label>
                    <input 
                      type="text" 
                      placeholder="9704 1985 2619 1432 198"
                      value={cardInfo.number}
                      onChange={(e) => setCardInfo({...cardInfo, number: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-mono tracking-wider focus:outline-none focus:border-blue-500 transition-all"
                    />
                    {cardErrors.number && <span className="text-red-500 text-[10px] mt-1 block">{cardErrors.number}</span>}
                  </div>
                  
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1.5 block">Tên chủ thẻ (Không dấu)</label>
                    <input 
                      type="text" 
                      placeholder="NGUYEN VAN A"
                      value={cardInfo.name}
                      onChange={(e) => setCardInfo({...cardInfo, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs uppercase focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1.5 block">Ngày phát hành</label>
                    <input 
                      type="text" 
                      placeholder="07/15"
                      value={cardInfo.date}
                      onChange={(e) => setCardInfo({...cardInfo, date: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-mono focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>
              
              <div className="border-t border-white/5 my-5 pt-4 flex justify-between items-center text-xs">
                <div>
                  <span className="text-zinc-500 block">Tổng thanh toán:</span>
                  <span className="text-[#EAB308] font-bold text-sm block mt-0.5">{fmtVND(currentInvoice?.amount)}</span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (!cardInfo.number) {
                        setCardErrors({ number: 'Vui lòng nhập số thẻ thanh toán!' });
                        return;
                      }
                      setActivePaymentModal('OTP_MODAL');
                    }}
                    className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
                  >
                    Tiếp tục
                  </button>
                  <button
                    onClick={() => setActivePaymentModal(null)}
                    className="px-4 py-3 rounded-xl border border-zinc-700 text-zinc-400 font-semibold text-xs hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OTP VERIFICATION MODAL */}
      {activePaymentModal === 'OTP_MODAL' && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-[#1c1c1e] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-5 flex items-center justify-between border-b border-white/5 bg-[#171719]">
              <h3 className="font-bold text-sm text-white text-left">Xác thực OTP</h3>
              <span className="text-zinc-500 text-xs">NCB BANK</span>
            </div>
            
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mx-auto mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              
              <p className="text-zinc-300 text-xs font-semibold mb-2 leading-relaxed text-center">
                Mã OTP giao dịch đã được gửi tới SĐT của bạn.
              </p>
              <p className="text-blue-400 text-[11px] bg-blue-500/10 border border-blue-500/20 py-1.5 px-3 rounded-lg inline-block mb-5 font-bold">
                🔑 Mã OTP mẫu để TEST: 123456
              </p>
              
              <input 
                type="text" 
                maxLength="6"
                placeholder="Nhập 6 số OTP"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-white text-base font-bold tracking-[0.4em] focus:outline-none focus:border-blue-500 transition-all mb-6 focus:placeholder-transparent"
              />
              
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    if (otpInput !== '123456') {
                      pushToast("Mã OTP không đúng! Vui lòng nhập 123456 để test.", "error");
                      return;
                    }
                    
                    setStepLoading(true);
                    if (!USE_MOCK && currentInvoice?.id) {
                      try {
                        await apiClient.post(`/invoices/change-status/${currentInvoice.id}?status=PAID`);
                      } catch (err) {
                        console.error("Failed to update status:", err);
                      }
                    }
                    setStepLoading(false);
                    setActivePaymentModal(null);
                    setOtpInput('');
                    setCardInfo({ number: '', name: '', date: '', cvv: '' });
                    setStep('success');
                  }}
                  className="flex-grow py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Xác nhận
                </button>
                <button
                  onClick={() => {
                    setActivePaymentModal('BANK_FORM');
                    setOtpInput('');
                  }}
                  className="px-5 py-3 rounded-xl border border-zinc-700 text-zinc-400 text-xs font-semibold hover:bg-white/5 transition-all cursor-pointer"
                >
                  Quay lại
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {stepLoading && (
        <div
          className="fixed inset-0 bg-[#0c0c0e]/95 z-[99999] flex flex-col items-center justify-center gap-4"
          style={{ animation: 'fadeInLoader 0.15s ease-out forwards' }}
        >
          {/* Cinema Reel Spinning Loader */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-t-[#CF0F47] border-r-transparent border-b-[#CF0F47] border-l-transparent animate-spin" />
            <div className="absolute inset-2 rounded-full border border-dashed border-zinc-700 animate-spin-reverse" />
            <div className="absolute inset-[18px] rounded-full bg-gradient-to-tr from-[#CF0F47] to-red-500 shadow-[0_0_12px_rgba(207,15,71,0.6)] animate-pulse" />
          </div>
          <p className="text-zinc-300 text-xs font-extrabold uppercase tracking-[0.2em] animate-pulse">
            {step === 2 && "Đang tải sơ đồ ghế..."}
            {step === 3 && "Đang tải dịch vụ Combo..."}
            {step === 4 && "Đang chuẩn bị thanh toán..."}
            {step === 1 && "Đang chuẩn bị suất chiếu..."}
          </p>
        </div>
      )}

      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-[99999] flex flex-col gap-3 max-w-sm w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border text-xs shadow-lg animate-fade-in text-white"
            style={{
              background: '#1c1c1e',
              borderColor: t.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : t.type === 'warning' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div className="shrink-0">
              {t.type === 'error' ? (
                <span className="text-red-500 font-bold text-sm">✖</span>
              ) : t.type === 'warning' ? (
                <span className="text-amber-500 font-bold text-sm">⚠</span>
              ) : (
                <span className="text-emerald-500 font-bold text-sm">✔</span>
              )}
            </div>
            <div className="flex-grow font-medium leading-normal">{t.message}</div>
          </div>
        ))}
      </div>

      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeInLoader {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .animate-spin-reverse {
          animation: spin-reverse 1.2s linear infinite;
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to   { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
