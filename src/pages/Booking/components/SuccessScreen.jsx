import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../../../store/bookingStore';
import { COMBOS, SEAT_PRICE, PAYMENT_METHODS } from '../bookingConstants';
import { fmtVND, groupSeats } from '../bookingUtils';

export default function SuccessScreen({ booking }) {
  const navigate = useNavigate();

  // Safe extraction with fallback props
  const {
    movie = {},
    showtime = {},
    date = {},
    seats = [],
    selectedSeats = [],
    combos = {},
    payment = '',
    total: providedTotal,
  } = booking || {};

  const allSeats = Array.isArray(selectedSeats) && selectedSeats.length > 0
    ? selectedSeats
    : Array.isArray(seats) && seats.length > 0
    ? seats
    : [];

  const pm = PAYMENT_METHODS.find((p) => p.id === payment);
  const storeProducts = useBookingStore((s) => s.products);

  const resolvedProducts = storeProducts.length > 0
    ? storeProducts.map((p) => ({ id: String(p.id), name: p.name, price: Number(p.price) }))
    : COMBOS;

  const groupedSeats = groupSeats(allSeats);

  const seatTotal = allSeats.reduce((s, seat) => s + (seat?.price || SEAT_PRICE[seat?.type || 'normal'] || 85000), 0);
  const comboTotal = Object.entries(combos || {}).reduce((s, [id, qty]) => {
    const c = resolvedProducts.find((x) => String(x.id) === String(id));
    return s + (c ? c.price * qty : 0);
  }, 0);

  const calculatedTotal = (seatTotal + comboTotal) * 1.08;
  const finalTotal = providedTotal || calculatedTotal;

  const activeCombos = Object.entries(combos || {})
    .filter(([_, qty]) => qty > 0)
    .map(([id, qty]) => {
      const c = resolvedProducts.find((x) => String(x.id) === String(id));
      return c ? `${qty}x ${c.name}` : null;
    })
    .filter(Boolean);

  const ticketCode = useMemo(() => `CTB${Date.now().toString().slice(-8).toUpperCase()}`, []);
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${ticketCode}&color=000000&bcolor=ffffff`;

  useEffect(() => {
    if (!movie?.id || !showtime?.format) return;
    try {
      const existing = JSON.parse(localStorage.getItem('my_cinema_tickets') || '[]');
      if (!existing.some((t) => t.ticketCode === ticketCode)) {
        const newTicket = {
          ticketCode,
          movie: {
            id: movie.id,
            title: movie.title || '',
            posterUrl: movie.posterUrl || '',
            ageRating: movie.ageRating || 'P',
          },
          showtime: {
            format: showtime.format || '',
            lang: showtime.lang || '',
            start: showtime.start || '',
            end: showtime.end || '',
            room: showtime.room || '',
          },
          date: {
            dateLabel: date?.dateLabel || '',
            dayLabel: date?.dayLabel || '',
          },
          seats: allSeats.map((s) => s.id || ''),
          combos: activeCombos,
          total: finalTotal,
          payment: {
            name: pm?.name || 'Thanh toán online',
            bg: pm?.bg || '#1a56db',
            letter: pm?.letter || 'C',
          },
          bookingDate: new Date().toLocaleDateString('vi-VN'),
        };
        localStorage.setItem('my_cinema_tickets', JSON.stringify([newTicket, ...existing]));
      }
    } catch (e) {
      console.error("Error saving ticket to local storage", e);
    }
  }, [ticketCode, movie, showtime, date, allSeats, activeCombos, finalTotal, pm]);

  const seatNames = allSeats.map((s) => s.id).join(', ');

  return (
    <div className="max-w-md mx-auto py-6 px-4 text-center flex flex-col items-center select-none">
      {/* Ticket Card Container */}
      <div
        className="w-full rounded-3xl relative shadow-[0_20px_50px_rgba(0,0,0,0.6)] border overflow-hidden flex flex-col text-left mb-6"
        style={{
          background: 'linear-gradient(160deg, #1C1C1E 0%, #121214 100%)',
          borderColor: 'rgba(255,255,255,0.08)',
        }}
      >
        {/* Top visual accent stripe */}
        <div className="h-[5px] w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 shrink-0" />

        {/* Successful Header */}
        <div className="p-6 pb-4 flex flex-col items-center border-b border-white/5 text-center shrink-0">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-white font-black text-xl tracking-tight">Đặt vé thành công!</h2>
          <p className="text-zinc-400 text-xs mt-1 leading-relaxed">Vui lòng xuất trình mã QR tại rạp để quét mã vào phòng chiếu</p>
        </div>

        {/* Movie Info & Details Section */}
        <div className="p-6 flex flex-col gap-4 text-left">
          <div className="flex gap-4 items-start">
            {/* Movie Poster */}
            <div className="w-20 h-[112px] rounded-xl overflow-hidden bg-zinc-800 shrink-0 shadow-lg border border-white/10">
              {movie?.posterUrl ? (
                <img src={movie.posterUrl} alt={movie.title || ''} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs font-bold">N/A</div>
              )}
            </div>

            {/* Movie Details */}
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-extrabold text-base leading-snug line-clamp-2">{movie?.title || 'Tên Phim'}</h3>
              <div className="flex gap-1.5 items-center mt-2 flex-wrap">
                <span className="text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-md font-extrabold uppercase">
                  {showtime?.format || '2D'}
                </span>
                <span className="text-[10px] bg-white/5 border border-white/10 text-zinc-300 px-2 py-0.5 rounded-md font-medium">
                  {showtime?.lang || 'Phụ đề'}
                </span>
              </div>
              <p className="text-zinc-400 text-xs font-semibold mt-2">
                Galaxy Cinema - <span className="uppercase text-white font-bold">{showtime?.room || 'SCREEN 1'}</span>
              </p>
            </div>
          </div>

          {/* Ticket Information Fields */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5 text-xs bg-white/[0.02] p-3.5 rounded-2xl border border-white/5">
            <div>
              <span className="text-zinc-500 block uppercase tracking-wider text-[9px] font-bold">Ngày chiếu</span>
              <span className="text-white font-extrabold mt-0.5 block text-sm">{date?.dateLabel || 'Hôm nay'}</span>
            </div>
            <div>
              <span className="text-zinc-500 block uppercase tracking-wider text-[9px] font-bold">Suất chiếu</span>
              <span className="text-white font-extrabold mt-0.5 block text-sm">{showtime?.start || '09:00'} - {showtime?.end || '10:30'}</span>
            </div>
            <div>
              <span className="text-zinc-500 block uppercase tracking-wider text-[9px] font-bold">Phòng chiếu</span>
              <span className="text-white font-extrabold mt-0.5 block uppercase text-sm">{showtime?.room || 'SCREEN 1'}</span>
            </div>
            <div>
              <span className="text-zinc-500 block uppercase tracking-wider text-[9px] font-bold">Ghế ngồi ({allSeats.length} vé)</span>
              <span className="text-[#EAB308] font-black mt-0.5 block text-sm tracking-wide">{seatNames || 'Chưa chọn'}</span>
            </div>
            {activeCombos.length > 0 && (
              <div className="col-span-2 border-t border-white/5 pt-2 mt-1">
                <span className="text-zinc-500 block uppercase tracking-wider text-[9px] font-bold">Bắp nước / Combo</span>
                <span className="text-zinc-200 font-semibold mt-0.5 block leading-tight">{activeCombos.join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Perforated Tear Line with Notches */}
        <div className="relative flex items-center justify-between px-4 my-1">
          <div className="absolute -left-3.5 w-7 h-7 rounded-full bg-[#121212] border border-zinc-800/60 z-10" />
          <div className="w-full border-t border-dashed border-zinc-700/60" />
          <div className="absolute -right-3.5 w-7 h-7 rounded-full bg-[#121212] border border-zinc-800/60 z-10" />
        </div>

        {/* Bottom Ticket Stub (QR Code & Total) */}
        <div className="p-6 pt-4 pb-6 flex items-center justify-between gap-4">
          {/* QR Code Container */}
          <div className="flex flex-col items-center bg-white p-2.5 rounded-2xl shadow-xl border border-white/20 shrink-0">
            <img
              src={qrCodeUrl}
              alt="Mã QR Vé"
              className="w-24 h-24 object-contain rounded-lg"
            />
            <span className="text-zinc-800 font-mono font-black text-[10px] tracking-widest mt-1.5">
              #{ticketCode}
            </span>
          </div>

          {/* Total Amount Container */}
          <div className="flex flex-col items-end text-right flex-1 min-w-0">
            <span className="text-zinc-400 uppercase text-[10px] tracking-widest font-extrabold block mb-1">
              Tổng thanh toán
            </span>
            <span className="text-2xl font-black text-[#EAB308] tracking-tight block drop-shadow-[0_2px_10px_rgba(234,179,8,0.2)]">
              {fmtVND(finalTotal)}
            </span>
            {pm && (
              <span className="text-zinc-400 text-[11px] font-medium mt-1">
                {pm.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={() => navigate('/profile', { state: { activeTab: 'history' } })}
          className="w-full bg-[#1C1C1E] hover:bg-[#2C2C2E] border border-white/10 text-white py-3.5 rounded-2xl text-sm font-bold transition-all shadow-md active:scale-[0.99] cursor-pointer"
        >
          Xem lịch sử giao dịch
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full bg-[#CF0F47] hover:bg-[#b00c3b] text-white py-3.5 rounded-2xl text-sm font-black transition-all shadow-lg active:scale-[0.99] cursor-pointer"
        >
          Quay lại trang chủ
        </button>
      </div>
    </div>
  );
}
