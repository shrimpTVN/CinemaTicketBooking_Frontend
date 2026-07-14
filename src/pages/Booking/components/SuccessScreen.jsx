import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../../../store/bookingStore';
import { COMBOS, SEAT_PRICE, PAYMENT_METHODS } from '../bookingConstants';
import { fmtVND, groupSeats } from '../bookingUtils';

export default function SuccessScreen({ booking }) {
  const navigate = useNavigate();
  const { movie, showtime, date, seats, combos, payment } = booking;
  const pm = PAYMENT_METHODS.find((p) => p.id === payment);
  const storeProducts = useBookingStore((s) => s.products);

  const resolvedProducts = storeProducts.length > 0
    ? storeProducts.map((p) => ({ id: String(p.id), name: p.name, price: Number(p.price) }))
    : COMBOS;

  const groupedSeats = groupSeats(seats);

  const seatTotal = groupedSeats.reduce((s, seat) => s + (seat.price || SEAT_PRICE[seat.type]), 0);
  const comboTotal = Object.entries(combos).reduce((s, [id, qty]) => {
    const c = resolvedProducts.find((x) => x.id === id);
    return s + (c ? c.price * qty : 0);
  }, 0);
  const total = seatTotal + comboTotal;

  const activeCombos = Object.entries(combos)
    .filter(([_, qty]) => qty > 0)
    .map(([id, qty]) => {
      const c = resolvedProducts.find((x) => x.id === id);
      return c ? `${qty}x ${c.name}` : null;
    })
    .filter(Boolean);

  const ticketCode = useMemo(() => `CTB${Date.now().toString().slice(-8).toUpperCase()}`, []);

  useEffect(() => {
    try {
      const existing = JSON.parse(localStorage.getItem('my_cinema_tickets') || '[]');
      if (!existing.some((t) => t.ticketCode === ticketCode)) {
        const newTicket = {
          ticketCode,
          movie: {
            id: movie.id,
            title: movie.title,
            posterUrl: movie.posterUrl,
            ageRating: movie.ageRating,
          },
          showtime: {
            format: showtime.format,
            lang: showtime.lang,
            start: showtime.start,
            end: showtime.end,
            room: showtime.room,
          },
          date: {
            dateLabel: date.dateLabel,
            dayLabel: date.dayLabel,
          },
          seats: groupedSeats.map((s) => s.id),
          combos: activeCombos,
          total,
          payment: {
            name: pm?.name || 'Tiền mặt tại quầy',
            bg: pm?.bg || '#15803d',
            letter: pm?.letter || '₫',
          },
          bookingDate: new Date().toLocaleDateString('vi-VN'),
        };
        localStorage.setItem('my_cinema_tickets', JSON.stringify([newTicket, ...existing]));
      }
    } catch (e) {
      console.error("Error saving ticket to local storage", e);
    }
  }, [ticketCode, movie, showtime, date, groupedSeats, activeCombos, total, pm]);

  return (
    <div className="max-w-md mx-auto py-8 text-center flex flex-col items-center">
      {/* Visual Ticket Perforated Design container */}
      <div
        className="w-full rounded-2xl relative shadow-2xl border overflow-visible flex flex-col text-left mb-6"
        style={{
          background: 'linear-gradient(135deg, #1C1C1E 0%, #0F0F10 100%)',
          borderColor: 'rgba(255,255,255,0.06)',
        }}
      >
        {/* Perforated Side notches */}
        <div className="absolute top-[68%] -translate-y-1/2 -left-3.5 w-7 h-7 rounded-full bg-bg-dark border-r border-zinc-800 z-10" style={{ background: '#121212', borderColor: '#27272A' }} />
        <div className="absolute top-[68%] -translate-y-1/2 -right-3.5 w-7 h-7 rounded-full bg-bg-dark border-l border-zinc-800 z-10" style={{ background: '#121212', borderColor: '#27272A' }} />

        {/* Top visual accent stripe */}
        <div className="h-[4px] w-full bg-emerald-500 rounded-t-2xl shrink-0" />

        {/* Successful banner area */}
        <div className="p-6 pb-5 flex flex-col items-center border-b border-white/5 text-center shrink-0">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 shadow-inner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-white font-bold text-lg leading-tight tracking-wide">Đặt vé thành công!</h2>
          <p className="text-zinc-550 text-xs mt-1.5 leading-relaxed">Vui lòng xuất trình mã vé tại quầy để nhận vé giấy</p>
        </div>

        {/* Info panel */}
        <div className="p-6 flex gap-4 text-left items-start flex-1 min-h-0">
          <div className="w-16 h-[90px] rounded-lg overflow-hidden bg-zinc-800 shrink-0">
            {movie.posterUrl ? (
              <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-655 text-xs">N/A</div>
            )}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <h3 className="text-white font-bold text-sm truncate">{movie.title}</h3>
            <div className="flex gap-1.5 items-center mt-1">
              <span className="text-[9px] bg-white/5 border border-white/10 text-zinc-400 px-1.5 py-0.5 rounded font-bold uppercase">{showtime.format}</span>
              <span className="text-[9px] bg-white/5 border border-white/10 text-zinc-400 px-1.5 py-0.5 rounded font-medium">{showtime.lang}</span>
            </div>

            {/* Grid fields */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 mt-4 text-[11px]">
              <div>
                <span className="text-zinc-500 block uppercase tracking-wider text-[9px] font-semibold">Ngày chiếu</span>
                <span className="text-white font-semibold mt-0.5 block">{date.dateLabel}</span>
              </div>
              <div>
                <span className="text-zinc-500 block uppercase tracking-wider text-[9px] font-semibold">Suất chiếu</span>
                <span className="text-white font-semibold mt-0.5 block">{showtime.start} - {showtime.end}</span>
              </div>
              <div>
                <span className="text-zinc-500 block uppercase tracking-wider text-[9px] font-semibold">Phòng chiếu</span>
                <span className="text-white font-semibold mt-0.5 block uppercase">{showtime.room || 'Rạp 3'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block uppercase tracking-wider text-[9px] font-semibold">Ghế ngồi</span>
                <span className="text-emerald-400 font-extrabold mt-0.5 block">{groupedSeats.map((s) => s.id).join(', ')}</span>
              </div>
              {activeCombos.length > 0 && (
                <div className="col-span-2 border-t border-white/5 pt-2 mt-1">
                  <span className="text-zinc-500 block uppercase tracking-wider text-[9px] font-semibold">Combo</span>
                  <span className="text-zinc-300 font-medium mt-0.5 block leading-tight">{activeCombos.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Perforated division dashed line */}
        <div className="relative flex items-center justify-between px-6 shrink-0" style={{ height: 1 }}>
          <div className="flex-1 border-t border-dashed border-zinc-800/80" />
        </div>

        {/* Bottom part (Barcode & Total) */}
        <div className="p-6 pt-5 pb-5 flex justify-between items-center text-left shrink-0">
          <div className="flex flex-col items-center">
            {/* Visual Barcode bars */}
            <div className="flex gap-[1.5px] h-7 items-center bg-white p-1 rounded w-24">
              {[1, 2, 1, 3, 1, 1, 2, 4, 1, 2, 3, 1, 2, 1].map((w, i) => (
                <span key={i} className="bg-black h-full shrink-0" style={{ width: w }} />
              ))}
            </div>
            <span className="text-zinc-500 font-mono tracking-widest mt-1" style={{ fontSize: '9px' }}>{ticketCode}</span>
          </div>

          <div className="text-right">
            <span className="text-zinc-550 uppercase text-[9px] tracking-wider block font-semibold mb-0.5">Tổng thanh toán</span>
            <span className="text-base font-extrabold text-emerald-400 block">{fmtVND(total)}</span>
          </div>
        </div>
      </div>

      {/* Buttons navigation */}
      <div className="flex flex-col gap-2.5 w-full">
        <button
          onClick={() => navigate('/profile', { state: { activeTab: 'history' } })}
          className="w-full bg-[#1C1C1E] hover:bg-[#2C2C2E] border border-white/8 text-white py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer"
        >
          Xem lịch sử giao dịch
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full bg-cta hover:bg-opacity-95 text-white py-3 rounded-xl text-sm font-bold transition-all cursor-pointer"
          style={{ backgroundColor: '#CF0F47' }}
        >
          Quay lại trang chủ
        </button>
      </div>
    </div>
  );
}
