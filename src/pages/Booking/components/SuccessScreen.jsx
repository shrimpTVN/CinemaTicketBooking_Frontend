import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useBookingStore } from '../../../store/bookingStore';
import { COMBOS, SEAT_PRICE, PAYMENT_METHODS } from '../bookingConstants';
import { Home, History } from 'lucide-react';

/* ─────────────────────────────────────────
   Main SuccessScreen
───────────────────────────────────────── */
export default function SuccessScreen({ booking }) {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  const {
    movie = {}, showtime = {}, date = {},
    seats = [], selectedSeats = [], combos = {},
    payment = '', total: providedTotal, invoiceId,
  } = booking || {};

  const storeSeats = useBookingStore((s) => s.selectedSeats);
  const allSeats = Array.isArray(seats) && seats.length > 0 ? seats
    : Array.isArray(selectedSeats) && selectedSeats.length > 0 ? selectedSeats
    : Array.isArray(storeSeats) && storeSeats.length > 0 ? storeSeats : [];

  const pm = PAYMENT_METHODS.find((p) => p.id === payment);
  const storeProducts = useBookingStore((s) => s.products);
  const fetchPaymentMethods = useBookingStore((s) => s.fetchPaymentMethods);

  useEffect(() => {
    if (storeProducts.length === 0 && fetchPaymentMethods) {
      fetchPaymentMethods();
    }
  }, []);

  const resolvedProducts = storeProducts.length > 0
    ? storeProducts.map((p) => ({ id: String(p.id), name: p.name, price: Number(p.price) }))
    : COMBOS;

  const seatTotal = allSeats.reduce((s, seat) => s + (seat?.price || SEAT_PRICE[seat?.type || 'normal'] || 85000), 0);
  const storeCombos = useBookingStore((s) => s.combos);
  const activeCombosObj = (combos && Object.keys(combos).length > 0) ? combos : storeCombos;

  const comboTotal = Object.entries(activeCombosObj || {}).reduce((s, [id, qty]) => {
    const c = resolvedProducts.find((x) => String(x.id) === String(id)) || COMBOS.find((x) => String(x.id) === String(id));
    return s + (c ? c.price * Number(qty) : 0);
  }, 0);
  const finalTotal = providedTotal || (seatTotal + comboTotal) * 1.08;

  const activeCombos = useMemo(() => {
    if (Array.isArray(combos) && combos.length > 0) return combos.filter(Boolean);
    if (Array.isArray(booking?.activeCombos) && booking.activeCombos.length > 0) return booking.activeCombos.filter(Boolean);

    return Object.entries(activeCombosObj || {})
      .filter(([_, qty]) => Number(qty) > 0)
      .map(([id, qty]) => {
        const c = resolvedProducts.find((x) => String(x.id) === String(id));
        const fallback = COMBOS.find((x) => String(x.id) === String(id));
        const idxMatch = !isNaN(Number(id)) ? COMBOS[Number(id) - 1] : null;
        const name = c?.name || fallback?.name || idxMatch?.name || `Combo ${id}`;
        return `${qty}x ${name}`;
      });
  }, [combos, activeCombosObj, resolvedProducts, booking]);

  const ticketCode = useMemo(() => {
    if (invoiceId) {
      return String(invoiceId).startsWith('INV') || String(invoiceId).startsWith('MOCK')
        ? String(invoiceId) : `INV${invoiceId}`;
    }
    return `CTB${Date.now().toString().slice(-8).toUpperCase()}`;
  }, [invoiceId]);

  const storeLayout = useBookingStore((s) => s.layout);

  /* Format Seat Labels (e.g. A13, A14 instead of Ghế 394) */
  const seatLabels = useMemo(() => {
    if (!allSeats || allSeats.length === 0) return 'Chưa xác định';

    return allSeats
      .map((s) => {
        if (!s && s !== 0) return '';
        
        if (typeof s === 'object' && s !== null) {
          if (s.seatRowLabel && s.seatColNumber) return `${s.seatRowLabel}${s.seatColNumber}`;
          if (s.seatRowLabel && s.colNumber) return `${s.seatRowLabel}${s.colNumber}`;
          if (s.row && s.col) return `${s.row}${s.col}`;
          if (s.displayName && isNaN(Number(s.displayName))) return s.displayName;
          if (s.name && isNaN(Number(s.name))) return s.name;
          if (s.label && isNaN(Number(s.label))) return s.label;
          if (s.code && isNaN(Number(s.code))) return s.code;
          if (s.id && typeof s.id === 'string' && isNaN(Number(s.id))) return s.id;

          const searchKey = s.dbId || s.seatId || s.id;
          if (searchKey) {
            const found = Object.values(storeLayout || {}).find(
              (item) => String(item.dbId) === String(searchKey) || String(item.id) === String(searchKey)
            );
            if (found) {
              if (found.seatRowLabel && found.seatColNumber) return `${found.seatRowLabel}${found.seatColNumber}`;
              if (found.row && found.col) return `${found.row}${found.col}`;
              if (found.displayName) return found.displayName;
              if (found.id && isNaN(Number(found.id))) return found.id;
            }
          }
          if (s.dbId) return `Ghế ${s.dbId}`;
          if (s.id) return `Ghế ${s.id}`;
        }

        if (typeof s === 'string') {
          if (isNaN(Number(s))) return s;
          const found = Object.values(storeLayout || {}).find(
            (item) => String(item.dbId) === s || String(item.id) === s
          );
          if (found) {
            if (found.seatRowLabel && found.seatColNumber) return `${found.seatRowLabel}${found.seatColNumber}`;
            if (found.row && found.col) return `${found.row}${found.col}`;
            if (found.displayName) return found.displayName;
            if (found.id && isNaN(Number(found.id))) return found.id;
          }
          return `Ghế ${s}`;
        }

        if (typeof s === 'number') {
          const found = Object.values(storeLayout || {}).find(
            (item) => item.dbId === s || item.id === s
          );
          if (found) {
            if (found.seatRowLabel && found.seatColNumber) return `${found.seatRowLabel}${found.seatColNumber}`;
            if (found.row && found.col) return `${found.row}${found.col}`;
            if (found.displayName) return found.displayName;
            if (found.id && isNaN(Number(found.id))) return found.id;
          }
          return `Ghế ${s}`;
        }

        return String(s);
      })
      .filter(Boolean)
      .join(', ');
  }, [allSeats, storeLayout]);

  /* Format Showtime */
  const showtimeFormatted = useMemo(() => {
    const time = showtime?.start || '';
    const dateStr = date?.dateLabel || date?.dayLabel || '';
    if (time && dateStr) return `${time} (${dateStr})`;
    return time || dateStr || 'N/A';
  }, [showtime, date]);

  /* Trigger high-end Fireworks & Confetti burst */
  useEffect(() => {
    const t1 = setTimeout(() => setMounted(true), 40);

    // 1. Initial explosion burst (Bắn bùng nổ trung tâm)
    const count = 220;
    const fire = (particleRatio, opts) => {
      confetti({
        origin: { y: 0.65 },
        zIndex: 9999,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    };

    fire(0.25, {
      spread: 35,
      startVelocity: 60,
      colors: ['#CF0F47', '#FF0B55', '#FFD700', '#0ECF67', '#0EA1CF']
    });
    fire(0.2, {
      spread: 75,
      colors: ['#ffffff', '#FFD700', '#FF1493', '#CF0F47']
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.9
    });
    fire(0.1, {
      spread: 125,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });
    fire(0.1, {
      spread: 125,
      startVelocity: 45,
    });

    // 2. Continuous Side Fireworks Cannons (Bắn pháo hoa rực rỡ từ 2 góc màn hình)
    const end = Date.now() + 2.2 * 1000;
    const interval = setInterval(() => {
      if (Date.now() > end) {
        return clearInterval(interval);
      }
      confetti({
        particleCount: 40,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.75 },
        zIndex: 9999,
        colors: ['#CF0F47', '#FFD700', '#0ECF67', '#0EA1CF', '#a855f7']
      });
      confetti({
        particleCount: 40,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.75 },
        zIndex: 9999,
        colors: ['#CF0F47', '#FFD700', '#0ECF67', '#0EA1CF', '#a855f7']
      });
    }, 220);

    return () => {
      clearTimeout(t1);
      clearInterval(interval);
    };
  }, []);

  /* Save ticket to localStorage */
  useEffect(() => {
    if (!movie?.id || !showtime?.format) return;
    try {
      const existing = JSON.parse(localStorage.getItem('my_cinema_tickets') || '[]');
      if (!existing.some((t) => t.ticketCode === ticketCode)) {
        localStorage.setItem('my_cinema_tickets', JSON.stringify([{
          ticketCode,
          movie: { id: movie.id, title: movie.title || '', posterUrl: movie.posterUrl || '', ageRating: movie.ageRating || 'P' },
          showtime: { format: showtime.format || '', lang: showtime.lang || '', start: showtime.start || '', end: showtime.end || '', room: showtime.room || '' },
          date: { dateLabel: date?.dateLabel || '', dayLabel: date?.dayLabel || '' },
          seats: allSeats.map((s) => typeof s === 'object' ? (s.id || `${s.seatRowLabel || ''}${s.seatColNumber || ''}`) : s),
          combos: activeCombos, total: finalTotal,
          payment: { name: pm?.name || 'Thanh toán online', bg: pm?.bg || '#1a56db', letter: pm?.letter || 'C' },
          bookingDate: new Date().toLocaleDateString('vi-VN'),
        }, ...existing]));
      }
    } catch (e) { console.error('Error saving ticket', e); }
  }, [ticketCode, movie, showtime, date, allSeats, activeCombos, finalTotal, pm]);

  const fmtVND = (n) => (n || n === 0) ? Number(n).toLocaleString('vi-VN') + 'đ' : '0đ';

  return (
    <>
      <div className="flex flex-col items-center justify-center py-2 px-2 select-none">
        <div
          className="w-full max-w-sm sm:max-w-md flex flex-col items-center text-center transition-all duration-300"
          style={{
            fontFamily: 'var(--font-google-sans)',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.98)',
          }}
        >
          {/* Success Checkmark Circle */}
          <div
            className="mb-2 flex items-center justify-center"
            style={{ animation: 'check-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.1s both' }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: '#0ECF67',
                boxShadow: '0 0 0 5px rgba(14,207,103,0.15), 0 0 20px rgba(14,207,103,0.25)',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 44 44" fill="none">
                <path
                  d="M9 22.5L17.5 31L35 13"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ animation: 'draw-check 0.3s ease 0.35s both', strokeDasharray: 40, strokeDashoffset: 40 }}
                />
              </svg>
            </div>
          </div>

          <h1 className="text-lg sm:text-xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-google-sans)' }}>
            Thanh toán thành công!
          </h1>
          <p className="text-xs sm:text-sm text-[#8A8A8A] mb-3.5">
            Hóa đơn đặt vé đã được lưu vào hệ thống.
          </p>

          {/* ── BẢNG THÔNG TIN HÓA ĐƠN (BORDER ONLY) ── */}
          <div
            className="w-full rounded-3xl p-5 sm:p-5.5 text-left mb-4 bg-transparent border border-white/15"
            style={{
              fontFamily: 'var(--font-google-sans)',
            }}
          >
            <h2 className="text-xs sm:text-sm font-bold text-white mb-3.5">
              Chi tiết hóa đơn
            </h2>

            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between items-start gap-4">
                <span className="text-[#8A8A8A] font-normal shrink-0">Mã hóa đơn</span>
                <span className="font-semibold text-white text-right">{ticketCode}</span>
              </div>

              {movie?.title && (
                <div className="flex justify-between items-start gap-4">
                  <span className="text-[#8A8A8A] font-normal shrink-0">Tên phim</span>
                  <span className="font-semibold text-white text-right">{movie.title}</span>
                </div>
              )}

              <div className="flex justify-between items-start gap-4">
                <span className="text-[#8A8A8A] font-normal shrink-0">Suất chiếu</span>
                <span className="font-semibold text-white text-right">{showtimeFormatted}</span>
              </div>

              {showtime?.room && (
                <div className="flex justify-between items-start gap-4">
                  <span className="text-[#8A8A8A] font-normal shrink-0">Phòng chiếu</span>
                  <span className="font-semibold text-white text-right">{showtime.room}</span>
                </div>
              )}

              <div className="flex justify-between items-start gap-4">
                <span className="text-[#8A8A8A] font-normal shrink-0">Ghế đã chọn</span>
                <span className="font-semibold text-white text-right">{seatLabels}</span>
              </div>

              {activeCombos.length > 0 && (
                <div className="flex justify-between items-start gap-4">
                  <span className="text-[#8A8A8A] font-normal shrink-0">Combo</span>
                  <span className="font-semibold text-white text-right">{activeCombos.join(', ')}</span>
                </div>
              )}

              <div className="flex justify-between items-start gap-4">
                <span className="text-[#8A8A8A] font-normal shrink-0">Phương thức</span>
                <span className="font-semibold text-white text-right">{pm?.name || 'VNPay'}</span>
              </div>
            </div>

            <div className="border-t border-white/8 my-3.5" />

            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between items-center gap-4">
                <span className="text-[#8A8A8A] font-normal shrink-0">Tổng thanh toán</span>
                <span className="font-bold text-gold text-right">{fmtVND(finalTotal)}</span>
              </div>

              <div className="flex justify-between items-center gap-4">
                <span className="text-[#8A8A8A] font-normal shrink-0">Trạng thái</span>
                <span className="px-3 py-0.5 rounded-full border border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-xs font-semibold tracking-wide">
                  Đã thanh toán
                </span>
              </div>
            </div>
          </div>

          {/* ── HAI NÚT HÀNH ĐỘNG DƯỚI BẢNG (BALANCED) ── */}
          <div className="flex flex-row gap-3 w-full">
            {/* Nút 1: Trang chủ */}
            <button
              onClick={() => navigate('/')}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm transition-all border border-white/10 bg-white/5 hover:bg-white/10 active:scale-[0.98] text-white cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 shrink-0 text-neutral-300" />
              Trang chủ
            </button>

            {/* Nút 2: Lịch sử giao dịch */}
            <button
              onClick={() => navigate('/profile', { state: { activeTab: 'history' } })}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm transition-all active:scale-[0.98] text-white cursor-pointer shadow-md"
              style={{
                backgroundColor: '#CF0F47',
                backgroundImage: 'linear-gradient(135deg, #CF0F47 0%, #a00c3a 100%)',
              }}
            >
              <History className="w-3.5 h-3.5 shrink-0 text-white" />
              Lịch sử giao dịch
            </button>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes check-pop {
          from { opacity: 0; transform: scale(0.4); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes draw-check {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </>
  );
}




