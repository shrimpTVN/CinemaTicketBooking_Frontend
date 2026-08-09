import { useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import QRCodeOffline from './QRCodeOffline';
import { useBookingStore } from '../store/bookingStore';
import { COMBOS } from '../pages/Booking/bookingConstants';

const VN_DAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

function formatShowDate(rawDate, fallbackLabel) {
  if (rawDate) {
    try {
      const parts = String(rawDate).match(/(\d{4})-(\d{2})-(\d{2})/);
      if (parts) {
        const d = new Date(parseInt(parts[1]), parseInt(parts[2]) - 1, parseInt(parts[3]));
        return `${VN_DAYS[d.getDay()]}, ${parts[3]}/${parts[2]}/${parts[1]}`;
      }
    } catch (_) { /* ignore */ }
  }
  if (fallbackLabel) {
    try {
      const parts = String(fallbackLabel).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (parts) {
        const d = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]));
        const dd = String(parts[1]).padStart(2, '0');
        const mm = String(parts[2]).padStart(2, '0');
        return `${VN_DAYS[d.getDay()]}, ${dd}/${mm}/${parts[3]}`;
      }
    } catch (_) { /* ignore */ }
  }
  return fallbackLabel || '';
}

export function CinemaTicketCard({ ticket, compact = false }) {
  const { movie, showtime, date, seats, combos, total, ticketCode, theater } = ticket || {};

  // Subscribe reactively to storeProducts so comboList updates after async fetch
  const storeProducts = useBookingStore((s) => s.products);

  // Resolve combos to display strings (checking combos, combo, activeCombos)
  const comboList = useMemo(() => {
    const rawCombo = combos || ticket?.combo || ticket?.combos || ticket?.activeCombos;

    if (Array.isArray(rawCombo)) {
      return rawCombo.filter(Boolean);
    }

    if (typeof rawCombo === 'string' && rawCombo.trim() && rawCombo !== 'Không kèm combo') {
      return [rawCombo.trim()];
    }

    if (rawCombo && typeof rawCombo === 'object') {
      return Object.entries(rawCombo)
        .filter(([, qty]) => Number(qty) > 0)
        .map(([id, qty]) => {
          const fromStore = storeProducts.find((p) => String(p.id) === String(id));
          const fromConst = COMBOS.find((c) => String(c.id) === String(id));
          const idxMatch = !isNaN(Number(id)) ? COMBOS[Number(id) - 1] : null;
          const name = fromStore?.name || fromConst?.name || idxMatch?.name || `Combo ${id}`;
          return `${qty}x ${name}`;
        });
    }
    return [];
  }, [combos, ticket?.combo, ticket?.combos, ticket?.activeCombos, storeProducts]);

  const fmtVND = (n) => (n || n === 0) ? Number(n).toLocaleString('vi-VN') + 'đ' : '0đ';

  const rawDate = date?.rawDate;
  const dateLabel = date?.dateLabel || '';
  const displayDate = formatShowDate(rawDate, dateLabel);
  const timeLabel = showtime?.start || '';
  const theaterName = theater || showtime?.room || 'Rạp chiếu phim';

  const seatListStr = useMemo(() => {
    if (!seats) return '-';
    if (typeof seats === 'string') return seats || '-';
    if (Array.isArray(seats)) {
      const formatted = seats.map(s => {
        if (!s) return '';
        if (typeof s === 'string') return s;
        if (typeof s === 'object') {
          if (s.id) return s.id;
          if (s.seatRowLabel && s.seatColNumber) return `${s.seatRowLabel}${s.seatColNumber}`;
        }
        return String(s);
      }).filter(Boolean);
      return formatted.length > 0 ? formatted.join(', ') : '-';
    }
    return '-';
  }, [seats]);

  const qrData = ticketCode || 'NO_CODE';
  const qrSize = compact ? 110 : 130;

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-2xl border border-zinc-800/80 w-full max-w-[345px] sm:max-w-sm mx-auto select-none text-left"
      style={{ background: 'linear-gradient(160deg, #1e1e22 0%, #141416 100%)' }}
    >
      {/* ── TOP ACCENT BAR ── */}
      <div className="h-1.5 w-full bg-gold shrink-0" />

      {/* ── TOP SECTION: Poster + Title + Badges ── */}
      <div className={`flex flex-col items-center px-4.5 ${compact ? 'pt-3.5 pb-2.5' : 'pt-4.5 pb-3.5'}`}>
        {/* Poster */}
        <div className={`${compact ? 'w-20 h-28 mb-2' : 'w-24 h-35 mb-3'} rounded-xl overflow-hidden shadow-lg border border-zinc-700/50 flex-shrink-0 transition-all`}>
          {movie?.posterUrl
            ? <img src={movie.posterUrl} alt={movie?.title} className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500 text-xs">No Image</div>
          }
        </div>

        {/* Movie title */}
        <h2 className={`text-white font-bold text-center leading-tight mb-1 ${compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'}`}>
          {movie?.title}
        </h2>

        {/* Format + Lang + Age */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          <span className={`text-zinc-400 ${compact ? 'text-[11px]' : 'text-xs sm:text-sm'}`}>
            {(() => {
              const fmt = showtime?.format || '2D';
              const lng = showtime?.lang || '';
              const fmtLower = fmt.toLowerCase();
              if (!lng || fmtLower.includes('phụ đề') || fmtLower.includes('lồng tiếng') || fmtLower.includes('thuyết minh') || fmtLower.includes(lng.toLowerCase())) {
                return fmt;
              }
              return `${fmt} ${lng}`;
            })()}
          </span>
          {movie?.ageRating && (
            <span
              className="text-white text-[10px] font-bold px-1.5 py-0.5 rounded leading-none"
              style={{ backgroundColor: '#CF0F47' }}
            >
              {movie.ageRating}
            </span>
          )}
        </div>
      </div>

      {/* ── DASHED DIVIDER 1 ── */}
      <div className="relative h-px mx-0">
        <div
          className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-6.5 h-6.5 rounded-full z-10"
          style={{ background: '#121212' }}
        />
        <div
          className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-6.5 h-6.5 rounded-full z-10"
          style={{ background: '#121212' }}
        />
        <div className="border-t-2 border-dashed border-zinc-700/60 mx-4" />
      </div>

      {/* ── MIDDLE SECTION: Cinema + Showtime + QR ── */}
      <div className={`flex flex-col items-center px-4.5 ${compact ? 'py-2.5' : 'py-3.5'}`}>
        {/* Cinema name */}
        <p className={`font-bold text-white text-center ${compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'}`}>{theaterName}</p>

        {/* Showtime */}
        <p className={`text-zinc-400 mt-0.5 text-center ${compact ? 'text-xs' : 'text-xs sm:text-sm'}`}>
          Suất: <strong className="text-zinc-100">{timeLabel}</strong>
          {displayDate && (
            <> - <strong className="text-zinc-100">{displayDate}</strong></>
          )}
        </p>

        {/* QR Code */}
        <div className={`${compact ? 'mt-2.5 p-1.5' : 'mt-3.5 p-2'} rounded-xl bg-white border border-white/20 shadow-md inline-flex`}>
          <QRCodeOffline value={qrData} size={qrSize} fgColor="#000000" bgColor="#FFFFFF" margin={2} />
        </div>
      </div>

      {/* ── DASHED DIVIDER 2 ── */}
      <div className="relative h-px mx-0">
        <div
          className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-6.5 h-6.5 rounded-full z-10"
          style={{ background: '#121212' }}
        />
        <div
          className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-6.5 h-6.5 rounded-full z-10"
          style={{ background: '#121212' }}
        />
        <div className="border-t-2 border-dashed border-zinc-700/60 mx-4" />
      </div>

      {/* ── BOTTOM SECTION: Mã vé | Ghế | Giá ── */}
      <div className={`px-4.5 grid grid-cols-3 text-center divide-x divide-zinc-700/40 ${compact ? 'pt-2.5 pb-2' : 'pt-3.5 pb-2.5'}`}>
        <div className="px-1">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-0.5">Mã vé</p>
          <p className="text-xs sm:text-sm font-bold text-white break-all leading-tight">{ticketCode}</p>
        </div>
        <div className="px-1">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-0.5">Ghế</p>
          <p className="text-xs sm:text-sm font-bold text-white break-words leading-tight">{seatListStr}</p>
        </div>
        <div className="px-1">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-0.5">Giá</p>
          <p className="text-xs sm:text-sm font-bold text-gold">{fmtVND(total)}</p>
        </div>
      </div>

      {/* ── COMBO ROW (Clean Design System) ── */}
      {comboList.length > 0 && (
        <div className={`px-4.5 border-t border-zinc-800/50 ${compact ? 'py-2' : 'py-2.5'}`}>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-0.5 text-center font-medium">Combo bắp nước</p>
          <p className="text-xs sm:text-sm font-bold text-white text-center break-words leading-relaxed">
            {comboList.join(' • ')}
          </p>
        </div>
      )}

      {/* ── NOTE ── */}
      <div className={`px-4.5 text-center border-t border-zinc-800/60 ${compact ? 'pt-2.5 pb-3' : 'pt-3.5 pb-5'}`}>
        <p className="text-[10px] sm:text-xs text-zinc-500 leading-tight">
          Bạn cần trợ giúp? Liên hệ:
        </p>
        <p className="text-[10px] sm:text-xs mt-0.5">
          <a href="tel:19002224" className="font-semibold" style={{ color: '#0EA1CF' }}>1900 2224</a>
          <span className="text-zinc-600"> • </span>
          <a href="mailto:hotro@cinemaapp.vn" className="font-semibold" style={{ color: '#0EA1CF' }}>hotro@cinemaapp.vn</a>
        </p>
      </div>
    </div>
  );
}

export default function CinemaTicketModal({ ticket, onClose }) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3.5"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />

      {/* Ticket Card */}
      <div
        className="relative z-10 w-full max-w-[345px] sm:max-w-sm cinema-ticket-animate"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-9 right-0 w-7 h-7 rounded-full bg-zinc-800/80 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <CinemaTicketCard ticket={ticket} />
      </div>

      <style>{`
        @keyframes cinema-ticket-in {
          from { opacity: 0; transform: scale(0.93) translateY(14px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        .cinema-ticket-animate {
          animation: cinema-ticket-in 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
}
