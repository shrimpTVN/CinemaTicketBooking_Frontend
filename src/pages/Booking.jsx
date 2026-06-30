import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getNowShowing } from '../services/movieService';

/* ═══════════════════════════════════════════════════════════════════════
   CONSTANTS & MOCK DATA
═══════════════════════════════════════════════════════════════════════ */

const VN_DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const generateDates = (n = 10) => {
  const today = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      key: d.toISOString().slice(0, 10),
      dayLabel: i === 0 ? 'Hôm nay' : VN_DAYS[d.getDay()],
      dateLabel: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`,
      dateObj: d,
    };
  });
};

const ALL_DATES = generateDates(10);

const SHOWTIMES = [
  { id: 'st1', format: '2D', lang: 'Phụ đề', start: '10:00', end: '12:15', available: 85, room: 'Phòng 1' },
  { id: 'st2', format: '2D', lang: 'Phụ đề', start: '13:30', end: '15:45', available: 52, room: 'Phòng 1' },
  { id: 'st3', format: '2D', lang: 'Thuyết minh', start: '16:00', end: '18:15', available: 98, room: 'Phòng 2' },
  { id: 'st4', format: '2D', lang: 'Phụ đề', start: '18:30', end: '20:45', available: 34, room: 'Phòng 1' },
  { id: 'st5', format: '2D', lang: 'Thuyết minh', start: '20:00', end: '22:15', available: 67, room: 'Phòng 2' },
  { id: 'st6', format: '2D', lang: 'Phụ đề', start: '22:30', end: '00:45', available: 12, room: 'Phòng 1' },
];

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const COLS = [17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

const getSeatType = (row) => {
  if (row === 'A') return 'couple';
  if (['D', 'E', 'F'].includes(row)) return 'vip';
  return 'normal';
};

const SEAT_PRICE = { normal: 85_000, vip: 120_000, couple: 90_000 };

const SOLD_SEATS = new Set([
  'C7', 'C6', 'C5',
  'D7', 'D6', 'D5',
  'B8', 'B9', 'E12', 'F9', 'G10', 'H4', 'H5'
]);

const THEATER_LAYOUT = {
  A: { type: 'couple', cols: [18, 16, 14, 12, 10, 8, 6, 4, 2] },
  B: { type: 'normal', cols: [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
  C: { type: 'normal', cols: [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
  D: { type: 'vip', cols: [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
  E: { type: 'vip', cols: [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
  F: { type: 'vip', cols: [17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
  G: { type: 'normal', cols: [17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
  H: { type: 'normal', cols: [17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] }
};

const getCouplePair = (row, col) => {
  const base = col % 2 === 0 ? col - 1 : col;
  return [`${row}${base + 1}`, `${row}${base}`];
};

const COMBOS = [
  { id: 'c1', name: 'Bắp rang bơ vừa', desc: 'Vị mặn hoặc ngọt, size M', price: 45_000, icon: '🍿' },
  { id: 'c2', name: 'Bắp rang bơ lớn', desc: 'Vị mặn hoặc ngọt, size L', price: 60_000, icon: '🍿' },
  { id: 'c3', name: 'Nước ngọt vừa', desc: 'Coca-Cola / Sprite / Fanta, 330ml', price: 30_000, icon: '🥤' },
  { id: 'c4', name: 'Nước ngọt lớn', desc: 'Coca-Cola / Sprite / Fanta, 500ml', price: 40_000, icon: '🥤' },
  { id: 'c5', name: 'Combo Đôi', desc: '1 Bắp rang lớn + 2 Nước ngọt vừa', price: 99_000, icon: '🎉' },
];

const PAYMENT_METHODS = [
  { id: 'momo', name: 'Ví MoMo', desc: 'Thanh toán qua ví điện tử MoMo', bg: '#a50e5f', letter: 'M' },
  { id: 'zalo', name: 'ZaloPay', desc: 'Thanh toán qua ví điện tử ZaloPay', bg: '#0468e6', letter: 'Z' },
  { id: 'vnpay', name: 'VNPay', desc: 'Thanh toán qua cổng thanh toán VNPay', bg: '#005bab', letter: 'V' },
  { id: 'card', name: 'Thẻ Visa / Mastercard', desc: 'Visa, Mastercard, JCB, American Express', bg: '#1a56db', letter: 'C' },
  { id: 'cash', name: 'Tiền mặt tại quầy', desc: 'Thanh toán trực tiếp tại quầy vé rạp', bg: '#15803d', letter: '₫' },
];

/* ═══════════════════════════════════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════════════════════════════════ */

const fmtVND = (n) => (n === 0 ? '0đ' : n.toLocaleString('vi-VN') + 'đ');

/* ═══════════════════════════════════════════════════════════════════════
   SEAT CONSTRAINT HELPERS
═══════════════════════════════════════════════════════════════════════ */

/** Lấy tất cả cột hợp lệ của một hàng */
const getRowSingleCols = (row) => THEATER_LAYOUT[row]?.cols ?? [];

/**
 * Kiểm tra xem một tập `selectedSet` có tạo ra ghế lẻ bị kẹp trong hàng không.
 * Ghế lẻ = chưa bán, chưa chọn, cả 2 bên đều bị chặn (chọn/bán/biên hàng).
 */
const hasOrphanInSet = (row, selectedSet) => {
  const cols = getRowSingleCols(row);
  const colSet = new Set(cols);
  for (const col of cols) {
    const id = `${row}${col}`;
    if (selectedSet.has(id) || SOLD_SEATS.has(id)) continue;
    const leftId = `${row}${col + 1}`;
    const rightId = `${row}${col - 1}`;
    const leftBlocked = selectedSet.has(leftId) || SOLD_SEATS.has(leftId) || !colSet.has(col + 1);
    const rightBlocked = selectedSet.has(rightId) || SOLD_SEATS.has(rightId) || !colSet.has(col - 1);
    if (leftBlocked && rightBlocked) return true;
  }
  return false;
};

/** Kiểm tra nếu THÊM ghế `newId` vào selectedIds sẽ tạo orphan */
const wouldCreateOrphan = (row, newId, selectedIds) => {
  const next = new Set(selectedIds);
  next.add(newId);
  return hasOrphanInSet(row, next);
};

/** Kiểm tra nếu XÓA ghế `removeId` khỏi selectedIds sẽ tạo orphan */
const wouldCreateOrphanOnRemove = (row, removeId, selectedIds) => {
  const next = new Set(selectedIds);
  next.delete(removeId);
  return hasOrphanInSet(row, next);
};

/**
 * Kiểm tra ghế bị kẹp HIỆN TẠI (để disable trên sơ đồ).
 * Một ghế bị kẹp khi cả 2 bên đều bị chặn (chọn/bán/biên hàng).
 */
const isOrphanBlocked = (row, id, selectedIds) => {
  if (SOLD_SEATS.has(id) || selectedIds.has(id)) return false;
  const cols = getRowSingleCols(row);
  const colSet = new Set(cols);
  const col = parseInt(id.replace(row, ''), 10);
  const leftId = `${row}${col + 1}`;
  const rightId = `${row}${col - 1}`;
  const leftBlocked = selectedIds.has(leftId) || SOLD_SEATS.has(leftId) || !colSet.has(col + 1);
  const rightBlocked = selectedIds.has(rightId) || SOLD_SEATS.has(rightId) || !colSet.has(col - 1);
  return leftBlocked && rightBlocked;
};

/**
 * Tìm nhóm `count` ghế liên tiếp bao gồm `clickedCol`, tất cả đều available.
 * Thử tất cả cửa sổ có thể chứa clickedCol.
 * Trả về mảng cột nếu tìm thấy, null nếu không.
 */
const findConsecutiveGroup = (row, clickedCol, count, selectedIds) => {
  const cols = getRowSingleCols(row);
  const colSet = new Set(cols);

  for (let start = clickedCol - count + 1; start <= clickedCol; start++) {
    const window = [];
    let valid = true;
    for (let c = start; c < start + count; c++) {
      if (!colSet.has(c)) { valid = false; break; }
      const seatId = `${row}${c}`;
      if (SOLD_SEATS.has(seatId) || selectedIds.has(seatId)) { valid = false; break; }
      window.push(c);
    }
    if (valid) return window;
  }
  return null;
};

/**
 * Tìm nhóm liên tiếp LỚN NHẤT có thể bao gồm `clickedCol`, tối đa `maxCount`.
 * Trả về nhóm lớn nhất tìm được (ít nhất 1 ghế).
 */
const findBestConsecutiveGroup = (row, clickedCol, maxCount, selectedIds) => {
  for (let count = maxCount; count >= 1; count--) {
    const group = findConsecutiveGroup(row, clickedCol, count, selectedIds);
    if (group) return group;
  }
  return null;
};

/* ═══════════════════════════════════════════════════════════════════════
   TOAST COMPONENT
═══════════════════════════════════════════════════════════════════════ */

function SeatToast({ toasts }) {
  return (
    <div className="fixed bottom-6 left-1/2 z-[9999] flex flex-col gap-2 pointer-events-none" style={{ transform: 'translateX(-50%)', minWidth: 320, maxWidth: 480 }}>
      {toasts.map(t => (
        <div
          key={t.id}
          className="flex items-start gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium"
          style={{
            background: t.type === 'error' ? 'rgba(207,15,71,0.95)' : 'rgba(202,138,4,0.95)',
            color: '#fff',
            backdropFilter: 'blur(10px)',
            border: t.type === 'error' ? '1px solid rgba(255,100,100,0.3)' : '1px solid rgba(255,220,50,0.3)',
            animation: 'slide-up-toast 0.3s ease-out forwards',
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1.4 }}>{t.type === 'error' ? '🚫' : '⚠️'}</span>
          <span style={{ lineHeight: 1.5 }}>{t.message}</span>
        </div>
      ))}
      <style>{`
        @keyframes slide-up-toast {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   STEP INDICATOR
═══════════════════════════════════════════════════════════════════════ */

const STEP_LABELS = ['Phim & Suất chiếu', 'Chọn ghế', 'Combo', 'Thanh toán'];

function StepIndicator({ step }) {
  const allDone = step === 'success';

  // Build flat list: [step, connector, step, connector, step, connector, step]
  const items = [];
  STEP_LABELS.forEach((label, i) => {
    const n = i + 1;
    const done = allDone || n < step;
    const active = !allDone && n === step;

    // Step node
    items.push(
      <div key={`step-${n}`} className="flex flex-col items-center gap-1.5" style={{ minWidth: 64 }}>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
          style={{
            background: done ? '#CF0F47' : 'transparent',
            border: done ? 'none' : `2px solid ${active ? '#CF0F47' : '#3f3f3f'}`,
            color: done ? '#fff' : active ? '#CF0F47' : '#555',
            boxShadow: active ? '0 0 0 4px rgba(207,15,71,0.12)' : 'none',
          }}
        >
          {done ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <span style={{ color: active ? '#CF0F47' : '#555' }}>{n}</span>
          )}
        </div>
        <span
          className="text-xs font-medium tracking-wide text-center leading-tight"
          style={{ maxWidth: 72, color: done ? '#CF0F47' : active ? '#fff' : '#555' }}
        >
          {label}
        </span>
      </div>
    );

    // Connector (not added after the last step)
    if (i < STEP_LABELS.length - 1) {
      items.push(
        <div key={`connector-${n}`} className="flex-1 mx-2" style={{ marginTop: 18, maxWidth: 80 }}>
          <div className="h-[2px] rounded-full w-full" style={{ background: '#2a2a2a' }}>
            <div
              className="h-full rounded-full transition-all duration-500 ease-in-out"
              style={{ width: done ? '100%' : '0%', background: '#CF0F47' }}
            />
          </div>
        </div>
      );
    }
  });

  return (
    <div className="flex items-start justify-center py-6 px-4">
      {items}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   ORDER SIDEBAR
═══════════════════════════════════════════════════════════════════════ */

function OrderSidebar({ booking, step, onBack, onNext, canNext }) {
  const { movie, showtime, date, seats, combos } = booking;

  const seatTotal = seats.reduce((s, seat) => s + SEAT_PRICE[seat.type], 0);
  const comboTotal = Object.entries(combos).reduce((s, [id, qty]) => {
    const c = COMBOS.find((x) => x.id === id);
    return s + (c ? c.price * qty : 0);
  }, 0);
  const total = seatTotal + comboTotal;

  const normalSeats = seats.filter((s) => s.type === 'normal');
  const vipSeats = seats.filter((s) => s.type === 'vip');
  const coupleSeats = seats.filter((s) => s.type === 'couple');

  const nextLabel =
    step === 4 ? 'Xác nhận thanh toán' :
      step === 3 ? 'Đến thanh toán' :
        step === 2 ? 'Chọn combo' : 'Chọn ghế';

  const getFullDayLabel = (dateObj) => {
    if (!dateObj) return '';
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return days[dateObj.getDay()];
  };

  return (
    <div className="flex flex-col gap-4 sticky top-20">
      {/* Outer Card Container */}
      <div className="rounded-2xl border border-white/8 overflow-hidden flex flex-col" style={{ background: '#1A1A1A' }}>
        {/* Top brand accent strip */}
        <div className="h-[4px] w-full" style={{ background: 'var(--color-cta)' }} />

        {/* Card Content */}
        <div className="p-5 flex flex-col">
          {movie ? (
            <>
              {/* Row 1: Poster + Movie title & format/lang */}
              <div className="flex gap-4 items-start">
                <div className="w-[84px] h-[120px] rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                  {movie.posterUrl ? (
                    <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">N/A</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-base leading-tight mb-2 line-clamp-2">{movie.title}</h3>
                  <div className="flex flex-wrap gap-1 text-[11px] text-zinc-400">
                    {showtime && (
                      <span>{showtime.format} {showtime.lang === 'Phụ đề' ? 'Phụ đề' : 'Thuyết minh'}</span>
                    )}
                    {showtime && movie.ageRating && (
                      <span className="text-zinc-600 px-1">•</span>
                    )}
                    {movie.ageRating && (
                      <span className="font-bold text-red-400">{movie.ageRating}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Space */}
              <div className="h-4" />

              {/* Row 2: Cinema - Room */}
              {showtime ? (
                <div className="text-zinc-300 text-sm font-semibold mb-1">
                  Galaxy Cinema - <span className="text-white uppercase">{showtime.room || 'RAP 3'}</span>
                </div>
              ) : (
                <div className="text-zinc-500 text-sm italic mb-1">Chưa chọn suất chiếu</div>
              )}

              {/* Row 3: Showtime formatted detail */}
              {showtime && date && (
                <div className="text-zinc-400 text-xs mb-3">
                  Suất: <span className="font-bold text-white text-sm">{showtime.start}</span> - {getFullDayLabel(date.dateObj)}, {date.dateLabel}/{date.dateObj.getFullYear()}
                </div>
              )}

              {/* Seats breakdown & Combos */}
              {(seats.length > 0 || Object.values(combos).some(v => v > 0)) && (
                <div className="border-t border-zinc-800/80 pt-3 mt-1 space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {normalSeats.length > 0 && (
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>{normalSeats.length}x Ghế Thường ({normalSeats.map(s => s.id).join(', ')})</span>
                      <span className="text-white font-medium">{fmtVND(normalSeats.length * SEAT_PRICE.normal)}</span>
                    </div>
                  )}
                  {vipSeats.length > 0 && (
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>{vipSeats.length}x Ghế VIP ({vipSeats.map(s => s.id).join(', ')})</span>
                      <span className="text-white font-medium">{fmtVND(vipSeats.length * SEAT_PRICE.vip)}</span>
                    </div>
                  )}
                  {coupleSeats.length > 0 && (
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>{coupleSeats.length}x Ghế Couple ({coupleSeats.map(s => s.id).join(', ')})</span>
                      <span className="text-white font-medium">{fmtVND(coupleSeats.length * SEAT_PRICE.couple)}</span>
                    </div>
                  )}
                  {Object.entries(combos).filter(([, qty]) => qty > 0).map(([id, qty]) => {
                    const c = COMBOS.find(x => x.id === id);
                    if (!c) return null;
                    return (
                      <div key={id} className="flex justify-between text-xs text-zinc-400">
                        <span>{qty}x {c.name}</span>
                        <span className="text-white font-medium">{fmtVND(c.price * qty)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-white/4 flex items-center justify-center text-zinc-600 mb-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                </svg>
              </div>
              <p className="text-zinc-500 text-sm">Vui lòng chọn phim để bắt đầu đặt vé</p>
            </div>
          )}

          {/* Dashed Separator */}
          <div className="border-t border-dashed border-zinc-700 my-4" />

          {/* Row 4: Total Price Block */}
          <div className="flex justify-between items-center">
            <span className="text-zinc-300 text-sm font-semibold">Tổng cộng</span>
            <span className="font-bold text-lg" style={{ color: 'var(--color-cta)' }}>
              {fmtVND(total)}
            </span>
          </div>
        </div>
      </div>

      {/* Row 5: Action Buttons (Quay lại / Tiếp tục) */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={step === 1}
          className="flex-1 py-3 rounded-xl border border-zinc-700/60 text-sm font-semibold transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-center"
          style={{
            borderColor: step === 1 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.12)',
            color: step === 1 ? '#555' : 'var(--color-cta)',
            background: 'transparent',
          }}
        >
          Quay lại
        </button>
        <button
          onClick={onNext}
          disabled={!canNext}
          className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 text-center"
          style={{
            background: canNext ? 'var(--color-cta)' : 'rgba(255,255,255,0.05)',
            color: canNext ? '#fff' : '#555',
          }}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   STEP 1 – MOVIE & SHOWTIME
═══════════════════════════════════════════════════════════════════════ */

function BookingMovieCard({ movie, selected, onClick }) {
  return (
    <div
      onClick={onClick}
      id={`movie-card-${movie.id}`}
      className="cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group flex flex-col"
      style={{ background: 'transparent' }}
    >
      {/* Poster – viền chỉ quanh poster */}
      <div
        className="relative aspect-[2/3] overflow-hidden bg-zinc-900 rounded-xl border-2 transition-all duration-200"
        style={{
          borderColor: selected ? 'var(--color-select)' : 'transparent',
          boxShadow: selected ? '0 0 0 3px rgba(14, 161, 207, 0.15)' : 'none',
        }}
      >
        {movie.posterUrl
          ? <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
            onError={e => e.target.style.display = 'none'}
          />
          : <div className="w-full h-full flex items-center justify-center text-zinc-700">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
              <rect x="2" y="4" width="20" height="16" rx="2" />
            </svg>
          </div>
        }

        {/* Age rating badge */}
        {movie.ageRating && (
          <div className="absolute top-2 left-2">
            <span
              className="text-white font-bold rounded"
              style={{ background: 'rgba(0,0,0,0.72)', fontSize: '10px', padding: '2px 6px', backdropFilter: 'blur(4px)' }}
            >
              {movie.ageRating}
            </span>
          </div>
        )}

        {/* Selected checkmark – giữa poster, dùng màu select */}
        {selected && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.42)' }}>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'var(--color-select)', boxShadow: '0 2px 12px rgba(14, 161, 207, 0.4)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}

        {/* Hover overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)' }}
        />
      </div>

      {/* Title block – luôn chiếm 2 dòng, font to hơn tí (text-sm/14px) */}
      <div className="px-1 pt-2 pb-1 flex-1">
        <p
          className="font-semibold leading-snug"
          style={{
            fontSize: '14px',
            color: selected ? 'var(--color-select)' : '#C3C3C3',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '40px',
            transition: 'color 0.2s',
          }}
        >
          {movie.title}
        </p>
      </div>
    </div>
  );
}

function Step1({ booking, setBooking, movies, dateWindowStart, setDateWindowStart }) {
  const [movieOpen, setMovieOpen] = useState(true);
  const [showtimeOpen, setShowtimeOpen] = useState(false);
  const movieScrollRef = useRef(null);

  const visibleDates = ALL_DATES.slice(dateWindowStart, dateWindowStart + 5);

  // Chia toàn bộ phim thành các cột chứa 2 phim (1 trên, 1 dưới) để tạo dạng 2 hàng và cuộn trượt ngang
  const pairedMovieColumns = useMemo(() => {
    const cols = [];
    const half = Math.ceil(movies.length / 2);
    for (let i = 0; i < half; i++) {
      cols.push({
        top: movies[i],
        bottom: movies[i + half],
      });
    }
    return cols;
  }, [movies]);

  const showtimesByLang = useMemo(() => {
    return SHOWTIMES.reduce((acc, st) => {
      const key = `${st.format} ${st.lang}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(st);
      return acc;
    }, {});
  }, []);

  const handleSelectMovie = (movie) => {
    setBooking(b => ({ ...b, movie, showtime: null }));
    setMovieOpen(false);
    setShowtimeOpen(true);
  };

  const scrollMovies = (direction) => {
    if (movieScrollRef.current) {
      const amount = direction * 280;
      movieScrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  // Tự động cuộn đến phim đang chọn và căn giữa khi accordion mở ra hoặc đổi phim
  useEffect(() => {
    if (movieOpen && booking.movie && movieScrollRef.current) {
      const selectedId = booking.movie.id;
      setTimeout(() => {
        const cardEl = document.getElementById(`movie-card-${selectedId}`);
        const container = movieScrollRef.current;
        if (cardEl && container) {
          const rect = cardEl.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          const containerWidth = container.offsetWidth;
          const scrollLeft = container.scrollLeft + rect.left - containerRect.left - (containerWidth / 2) + (rect.width / 2);
          container.scrollTo({
            left: scrollLeft,
            behavior: 'smooth'
          });
        }
      }, 150);
    }
  }, [movieOpen, booking.movie]);

  return (
    <div className="space-y-3">
      {/* ── Accordion: Chọn phim ── */}
      <div
        className="rounded-2xl border overflow-hidden transition-all duration-300"
        style={{ background: '#1A1A1A', borderColor: movieOpen ? 'var(--color-select)' : 'rgba(255,255,255,0.06)' }}
      >
        <button
          className="w-full flex items-center justify-between px-5 py-4 cursor-pointer group"
          onClick={() => setMovieOpen(o => !o)}
        >
          <h2 className="text-white font-bold text-base sm:text-lg flex items-center gap-2.5">
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center font-bold flex-shrink-0"
              style={{ background: '#CF0F47', fontSize: 12, color: '#fff' }}
            >
              1
            </span>
            <span>Chọn phim</span>
            {booking.movie && (
              <>
                <span className="text-zinc-500 font-normal">—</span>
                <span className="font-semibold truncate max-w-[320px]" style={{ color: 'var(--color-select)' }}>{booking.movie.title}</span>
              </>
            )}
          </h2>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:bg-white/8"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <svg
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              className="w-4 h-4 text-zinc-400 transition-transform duration-300"
              style={{ transform: movieOpen ? 'rotate(0deg)' : 'rotate(180deg)' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </div>
        </button>

        <div
          className="overflow-hidden transition-all duration-400 ease-in-out"
          style={{ maxHeight: movieOpen ? '9999px' : '0px' }}
        >
          {/* Movie Horizontal Slider Container (2 hàng, hiển thị 4 cột cùng lúc) */}
          <div className="border-t border-white/6 p-5 relative group/slider bg-zinc-950/20">
            {/* Left navigation arrow */}
            {movies.length > 8 && (
              <button
                onClick={() => scrollMovies(-1)}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center text-zinc-300 hover:text-white bg-zinc-900/90 hover:bg-zinc-800 transition-all cursor-pointer border border-white/8 shadow-xl"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4.5 h-4.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Horizontal scroll track – mỗi phần tử là 1 cột chứa top/bottom */}
            <div
              ref={movieScrollRef}
              className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 px-1"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {pairedMovieColumns.map((col, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-6 w-[calc((100%-16px)/2)] sm:w-[calc((100%-32px)/3)] lg:w-[calc((100%-48px)/4)] shrink-0 snap-start"
                >
                  {col.top && (
                    <BookingMovieCard
                      movie={col.top}
                      selected={booking.movie?.id === col.top.id}
                      onClick={() => handleSelectMovie(col.top)}
                    />
                  )}
                  {col.bottom && (
                    <BookingMovieCard
                      movie={col.bottom}
                      selected={booking.movie?.id === col.bottom.id}
                      onClick={() => handleSelectMovie(col.bottom)}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Right navigation arrow */}
            {movies.length > 8 && (
              <button
                onClick={() => scrollMovies(1)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center text-zinc-300 hover:text-white bg-zinc-900/90 hover:bg-zinc-800 transition-all cursor-pointer border border-white/8 shadow-xl"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4.5 h-4.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Accordion: Chọn suất chiếu ── */}
      <div
        className="rounded-2xl border overflow-hidden transition-all duration-300"
        style={{
          background: '#1A1A1A',
          borderColor: showtimeOpen ? 'var(--color-select)' : 'rgba(255,255,255,0.06)',
          opacity: !booking.movie && !showtimeOpen ? 0.45 : 1,
        }}
      >
        <button
          className="w-full flex items-center justify-between px-5 py-4 cursor-pointer group disabled:cursor-not-allowed"
          onClick={() => booking.movie && setShowtimeOpen(o => !o)}
          disabled={!booking.movie}
        >
          <h2 className="text-white font-bold text-base sm:text-lg flex items-center gap-2.5">
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center font-bold flex-shrink-0"
              style={{ background: '#CF0F47', fontSize: 12, color: '#fff' }}
            >
              2
            </span>
            <span>Chọn suất chiếu</span>
            {booking.showtime && (
              <>
                <span className="text-zinc-500 font-normal">—</span>
                <span className="font-semibold" style={{ color: 'var(--color-select)' }}>{booking.showtime.start}</span>
              </>
            )}
          </h2>
          <div className="flex items-center gap-2">
            {!booking.movie && (
              <span className="text-zinc-600 text-xs hidden sm:block">Vui lòng chọn phim trước</span>
            )}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:bg-white/8"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <svg
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                className="w-4 h-4 text-zinc-400 transition-transform duration-300"
                style={{ transform: showtimeOpen ? 'rotate(0deg)' : 'rotate(180deg)' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            </div>
          </div>
        </button>

        <div
          className="overflow-hidden transition-all duration-400 ease-in-out"
          style={{ maxHeight: showtimeOpen ? '9999px' : '0px' }}
        >
          <div className="border-t border-white/6">
            {/* Date Selector – Bỏ bg-black/10 */}
            <div className="flex items-center justify-center gap-3 px-4 py-5 border-b border-white/5 bg-transparent">
              <button
                onClick={() => setDateWindowStart(s => Math.max(0, s - 1))}
                disabled={dateWindowStart === 0}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/8 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-default"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" /></svg>
              </button>
              <div className="flex gap-2 justify-center">
                {visibleDates.map((d) => {
                  const sel = booking.date?.key === d.key;
                  return (
                    <button
                      key={d.key}
                      id={`date-${d.key}`}
                      onClick={() => setBooking(b => ({ ...b, date: d, showtime: null }))}
                      className="w-[72px] h-[56px] flex flex-col items-center justify-center rounded-xl border transition-all duration-200 cursor-pointer"
                      style={{
                        background: sel ? 'var(--color-select)' : 'rgba(255,255,255,0.03)',
                        borderColor: sel ? 'var(--color-select)' : 'rgba(255,255,255,0.07)',
                      }}
                    >
                      <span className="font-bold text-xs" style={{ color: sel ? '#fff' : '#8A8A8A' }}>{d.dayLabel}</span>
                      <span className="text-xs mt-0.5" style={{ color: sel ? '#E6E6E6' : '#555' }}>{d.dateLabel}</span>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setDateWindowStart(s => Math.min(ALL_DATES.length - 5, s + 1))}
                disabled={dateWindowStart >= ALL_DATES.length - 5}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/8 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-default"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" /></svg>
              </button>
            </div>

            {/* Showtime slots */}
            <div className="px-5 py-5 space-y-6">
              {Object.entries(showtimesByLang).map(([groupLabel, slots]) => {
                const parts = groupLabel.split(' ');
                const format = parts[0];
                const lang = parts.slice(1).join(' ');
                return (
                  <div key={groupLabel} className="space-y-3 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] tracking-widest font-bold px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded border border-zinc-700/50">
                        {format}
                      </span>
                      <span className="text-[10px] tracking-wider font-medium px-2 py-0.5 bg-zinc-900 text-zinc-400 rounded">
                        {lang}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      {slots.map((st) => {
                        const sel = booking.showtime?.id === st.id;
                        const low = st.available <= 20;
                        return (
                          <button
                            key={st.id}
                            id={`showtime-${st.id}`}
                            onClick={() => setBooking(b => ({ ...b, showtime: st }))}
                            className="flex flex-col items-center justify-between rounded-xl border transition-all duration-200 cursor-pointer hover:-translate-y-0.5 text-center overflow-hidden"
                            style={{
                              width: '92px',
                              height: '82px',
                              background: sel ? 'var(--color-select)' : 'rgba(255,255,255,0.03)',
                              borderColor: sel ? 'var(--color-select)' : 'rgba(255,255,255,0.07)',
                              padding: 0,
                            }}
                          >
                            {/* Phần trên: Giờ chiếu */}
                            <div className="flex-1 flex flex-col justify-center items-center pt-2">
                              <span className="font-extrabold text-base tracking-wide" style={{ color: '#FFFFFF', lineHeight: 1.1 }}>
                                {st.start}
                              </span>
                              <span className="text-[11px] font-normal" style={{ color: sel ? 'rgba(255, 255, 255, 0.7)' : '#555', marginTop: '1px' }}>
                                ~ {st.end}
                              </span>
                            </div>

                            {/* Phần dưới: Số ghế trống (Chỗ ngồi) */}
                            <div
                              className="w-full py-1 flex items-center justify-center border-t text-[10px] font-semibold"
                              style={{
                                background: sel ? 'rgba(0, 0, 0, 0.15)' : 'rgba(0, 0, 0, 0.25)',
                                borderColor: sel ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                              }}
                            >
                              <span style={{ color: low ? (sel ? '#FFFFFF' : '#ef4444') : (sel ? '#FFFFFF' : '#737373') }}>
                                {st.available}/100
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════
   STEP 2 – SEAT SELECTION
═══════════════════════════════════════════════════════════════════════ */

const SEAT_STYLES = {
  normal: {
    available: { bg: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255, 255, 255, 0.15)', color: '#D4D4D8' },
    selected: { bg: 'var(--color-select)', border: 'var(--color-select)', color: '#fff' },
    sold: { bg: '#2D2D2D', border: 'transparent', color: '#666' },
  },
  vip: {
    available: { bg: 'rgba(251,191,36,0.05)', border: 'rgba(251,191,36,0.25)', color: '#fbbf24' },
    selected: { bg: '#fbbf24', border: '#fbbf24', color: '#000' },
    sold: { bg: '#2D2D2D', border: 'transparent', color: '#666' },
  },
  couple: {
    available: { bg: 'rgba(14, 161, 207, 0.03)', border: 'rgba(14, 161, 207, 0.25)', color: '#0EA1CF' },
    selected: { bg: 'var(--color-select)', border: 'var(--color-select)', color: '#fff' },
    sold: { bg: '#2D2D2D', border: 'transparent', color: '#666' },
  },
};

function SeatCell({ row, col, selectedIds, onToggle, type, isOrphan }) {
  const id = `${row}${col}`;
  const sold = SOLD_SEATS.has(id);
  const selected = selectedIds.has(id);
  const blocked = !sold && !selected && isOrphan;

  const state = sold ? 'sold' : selected ? 'selected' : 'available';
  const style = SEAT_STYLES[type][state];

  const finalStyle = blocked
    ? { bg: 'rgba(251,146,60,0.08)', border: 'rgba(251,146,60,0.35)', color: 'rgba(251,146,60,0.5)' }
    : style;

  return (
    <button
      key={id}
      title={blocked ? `Ghế ${id} bị kẹp, không thể chọn` : `Ghế ${id} – ${type === 'normal' ? 'Thường' : 'VIP'} – ${fmtVND(SEAT_PRICE[type])}`}
      disabled={sold || blocked}
      onClick={() => !sold && !blocked && onToggle(row, col, type)}
      className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold border transition-all duration-150 hover:scale-110"
      style={{
        background: finalStyle.bg,
        borderColor: finalStyle.border,
        color: finalStyle.color,
        cursor: sold || blocked ? 'not-allowed' : 'pointer',
        fontSize: '10px',
      }}
    >
      {col}
    </button>
  );
}

function Step2({ booking, setBooking }) {
  const selectedIds = useMemo(() => new Set(booking.seats.map(s => s.id)), [booking.seats]);
  const [toasts, setToasts] = useState([]);

  const pushToast = (message, type = 'error') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const ticketCount = booking.ticketCount || { adult: 0, student: 0 };
  const totalTickets = ticketCount.adult + ticketCount.student;

  const updateTicketCount = (key, delta) => {
    setBooking(b => {
      const current = b.ticketCount || { adult: 0, student: 0 };
      const val = Math.max(0, current[key] + delta);
      const nextCount = { ...current, [key]: val };
      const nextTotal = nextCount.adult + nextCount.student;

      let nextSeats = [...b.seats];
      if (nextSeats.length > nextTotal) {
        nextSeats = nextSeats.slice(0, nextTotal);
      }
      return {
        ...b,
        ticketCount: nextCount,
        seats: nextSeats
      };
    });
  };

  const handleToggle = (row, col, type) => {
    if (type === 'couple') {
      /* ── Ghế đôi ── */
      const pair = [`${row}${col}`, `${row}${Number(col) - 1}`];
      if (pair.some(id => SOLD_SEATS.has(id))) return;
      const allSelected = pair.every(id => selectedIds.has(id));

      if (allSelected) {
        // Bỏ chọn cặp đôi
        setBooking(b => ({ ...b, seats: b.seats.filter(s => !pair.includes(s.id)) }));
      } else {
        // ── Ràng buộc 3: Chỉ 1 loại ghế ──
        const existingType = booking.seats[0]?.type;
        if (existingType && existingType !== 'couple') {
          pushToast(`Không thể chọn hỗn hợp loại ghế. Hãy bỏ chọn ghế ${existingType === 'normal' ? 'Thường' : 'VIP'} trước.`);
          return;
        }
        // ── Ràng buộc 4: Giới hạn số ghế ──
        const remaining = totalTickets - booking.seats.length;
        if (remaining < 2) {
          pushToast('Ghế đôi cần 2 vé trống. Vui lòng tăng số lượng vé hoặc bỏ chọn ghế khác!');
          return;
        }
        const toAdd = pair.map(id => ({ id, type: 'couple' }));
        setBooking(b => ({ ...b, seats: [...b.seats, ...toAdd] }));
      }
    } else {
      /* ── Ghế đơn (normal/vip) ── */
      const id = `${row}${col}`;

      if (selectedIds.has(id)) {
        // Bỏ chọn: kiểm tra orphan sau khi xóa
        if (wouldCreateOrphanOnRemove(row, id, selectedIds)) {
          pushToast('Bỏ chọn ghế này sẽ tạo ra ghế bị kẹp không thể chọn. Hãy bỏ chọn từ mép vào.', 'warning');
          return;
        }
        setBooking(b => ({ ...b, seats: b.seats.filter(s => s.id !== id) }));
      } else {
        // ── Ràng buộc: Chỉ 1 loại ghế ──
        const existingType = booking.seats[0]?.type;
        if (existingType && existingType !== type) {
          const typeName = { normal: 'Thường', vip: 'VIP', couple: 'Couple' };
          pushToast(`Không thể chọn hỗn hợp loại ghế. Hãy bỏ chọn ghế ${typeName[existingType]} trước.`);
          return;
        }

        const remaining = totalTickets - booking.seats.length;

        // ── Ràng buộc: Đã đủ ghế ──
        if (remaining <= 0) {
          pushToast(`Đã chọn đủ ${totalTickets} ghế. Tăng số lượng vé ở trên nếu muốn chọn thêm!`);
          return;
        }

        // ── Auto-select: tìm nhóm liên tiếp tốt nhất bao gồm ghế được click ──
        const group = findBestConsecutiveGroup(row, col, remaining, selectedIds);

        if (group && group.length >= 2) {
          // Kiểm tra orphan cho toàn nhóm
          const nextSelected = new Set(selectedIds);
          group.forEach(c => nextSelected.add(`${row}${c}`));
          if (hasOrphanInSet(row, nextSelected)) {
            pushToast('Vị trí này tạo ra ghế bị kẹp. Hãy thử vị trí khác!');
            return;
          }
          const toAdd = group.map(c => ({ id: `${row}${c}`, type }));
          setBooking(b => ({ ...b, seats: [...b.seats, ...toAdd] }));
        } else {
          // Chỉ 1 ghế còn lại hoặc không tìm được nhóm đủ
          if (wouldCreateOrphan(row, id, selectedIds)) {
            pushToast('Chọn ghế này sẽ tạo ra ô trống bị kẹp không thể chọn. Hãy chọn ghế khác!');
            return;
          }
          setBooking(b => ({ ...b, seats: [...b.seats, { id, type }] }));
        }
      }
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-white/8 overflow-hidden flex flex-col gap-0" style={{ background: '#1A1A1A' }}>
        {/* Showtime switcher – Nền xám đậm */}
        <div className="px-5 py-4 border-b border-white/6" style={{ background: '#1A1A1A' }}>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-2.5">Đổi suất chiếu nhanh cùng loại</p>
          <div className="flex flex-wrap gap-2.5">
            {SHOWTIMES.filter(st =>
              booking.showtime &&
              st.format === booking.showtime.format &&
              st.lang === booking.showtime.lang
            ).map((st) => {
              const sel = booking.showtime?.id === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => setBooking(b => ({ ...b, showtime: st, seats: [] }))}
                  className="flex flex-col items-center justify-center rounded-xl border transition-all duration-200 cursor-pointer hover:-translate-y-0.5 text-center"
                  style={{
                    width: '92px',
                    height: '58px',
                    background: sel ? 'var(--color-select)' : 'rgba(255,255,255,0.03)',
                    borderColor: sel ? 'var(--color-select)' : 'rgba(255,255,255,0.07)',
                  }}
                >
                  <span className="font-extrabold text-base tracking-wide" style={{ color: '#FFFFFF', lineHeight: 1.1 }}>
                    {st.start}
                  </span>
                  <span className="text-[11px] font-normal" style={{ color: sel ? 'rgba(255, 255, 255, 0.7)' : '#555', marginTop: '2px' }}>
                    ~ {st.end}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Ticket Counter Selector */}
        <div className="px-5 py-4 border-b border-white/6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-zinc-900/30">
          <div className="text-left">
            <h3 className="text-white font-bold text-sm">Chọn số lượng vé &amp; đối tượng</h3>
            <p className="text-zinc-500 text-xs mt-0.5">
              Tổng số vé: <span className="font-bold text-white text-sm">{totalTickets}</span> vé
              {totalTickets > 0 && ` (Đã chọn: ${booking.seats.length}/${totalTickets} ghế)`}
            </p>
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-white">Người lớn</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => updateTicketCount('adult', -1)}
                  disabled={ticketCount.adult === 0}
                  className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-white border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                >-</button>
                <span className="w-5 text-center text-xs font-bold text-white">{ticketCount.adult}</span>
                <button
                  onClick={() => updateTicketCount('adult', 1)}
                  className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-white border border-white/10"
                >+</button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-white">Học sinh/SV</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => updateTicketCount('student', -1)}
                  disabled={ticketCount.student === 0}
                  className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-white border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                >-</button>
                <span className="w-5 text-center text-xs font-bold text-white">{ticketCount.student}</span>
                <button
                  onClick={() => updateTicketCount('student', 1)}
                  className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-white border border-white/10"
                >+</button>
              </div>
            </div>
          </div>
        </div>

        {/* Seat Selection Area – Nền đen tối hẳn để tạo phân vùng */}
        <div className="px-5 pt-6 pb-6 overflow-x-auto text-center flex flex-col items-center" style={{ background: '#0F0F0F' }}>
          {/* Centered Seat grid and screen with scroll wrapper */}
          <div className="w-full flex justify-center py-2">
            <div className="flex flex-col items-center min-w-max">
              {/* Cinematic curved screen – Co dãn theo đúng chiều rộng sơ đồ ghế */}
              <div className="relative w-full mb-10 mt-2 text-center">
                {/* Glow behind the screen */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-8 bg-sky-500/10 blur-xl rounded-full" />
                {/* Screen arc */}
                <div className="w-full h-2 border-t-[3px] border-sky-400/30 rounded-[100%] shadow-[0_-3px_10px_rgba(14,161,207,0.15)]" />
                <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-[0.2em] mt-2">Màn hình</p>
              </div>

              {/* Seat Rows Grid */}
              <div className="flex flex-col gap-2 w-full">
                {ROWS.map((row) => {
                  const type = getSeatType(row);
                  const layout = THEATER_LAYOUT[row];
                  if (!layout) return null;

                  const isCouple = type === 'couple';

                  const ALL_COLS = [18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
                  return (
                    <div key={row} className="flex flex-col gap-2 w-full">
                      {row === 'F' && <div className="h-6" />} {/* Gap between E and F */}
                      <div className="flex items-center gap-1 justify-between w-full">
                        {/* Left label */}
                        <span className="w-5 text-center text-xs font-bold" style={{ color: isCouple ? '#0EA1CF' : type === 'vip' ? '#fbbf24' : '#555' }}>
                          {row}
                        </span>

                        {/* Seats columns track */}
                        <div className="flex gap-1 items-center">
                          {ALL_COLS.map((col) => {
                            const maxCol = layout.cols[0]; // 18 for A, 14 for B-E, 17 for F-H
                            if (col > maxCol) {
                              // Render empty placeholder to align columns
                              return <div key={col} className="w-7 h-7" />;
                            }

                            if (isCouple) {
                              if (col % 2 !== 0) return null; // Odd columns are handled by the even button

                              const leftCol = col;
                              const rightCol = col - 1;
                              const idL = `${row}${leftCol}`;
                              const idR = `${row}${rightCol}`;
                              const sold = SOLD_SEATS.has(idL) || SOLD_SEATS.has(idR);
                              const sel = selectedIds.has(idL) && selectedIds.has(idR);

                              let style = SEAT_STYLES.couple[sold ? 'sold' : sel ? 'selected' : 'available'];

                              return (
                                <button
                                  key={leftCol}
                                  disabled={sold}
                                  onClick={() => !sold && handleToggle(row, leftCol, 'couple')}
                                  className="w-[60px] h-7 rounded flex items-center justify-between px-2 text-xs font-bold border transition-all duration-150 hover:scale-105"
                                  style={{
                                    background: style.bg,
                                    borderColor: style.border,
                                    color: style.color,
                                    cursor: sold ? 'not-allowed' : 'pointer',
                                    fontSize: '10px'
                                  }}
                                >
                                  <span>{leftCol}</span>
                                  <span>{rightCol}</span>
                                </button>
                              );
                            } else {
                              const seatId = `${row}${col}`;
                              const orphan = isOrphanBlocked(row, seatId, selectedIds);
                              return (
                                <SeatCell
                                  key={col}
                                  row={row}
                                  col={col}
                                  selectedIds={selectedIds}
                                  onToggle={handleToggle}
                                  type={type}
                                  isOrphan={orphan}
                                />
                              );
                            }
                          })}
                        </div>

                        {/* Right label */}
                        <span className="w-5 text-center text-xs font-bold" style={{ color: isCouple ? '#0EA1CF' : type === 'vip' ? '#fbbf24' : '#555' }}>
                          {row}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-5 mt-8 justify-center">
            {[
              { label: 'Thường', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.15)' },
              { label: 'VIP', bg: 'rgba(251,191,36,0.05)', border: 'rgba(251,191,36,0.25)' },
              { label: 'Couple', bg: 'rgba(14, 161, 207, 0.03)', border: 'rgba(14, 161, 207, 0.25)' },
              { label: 'Đang chọn', bg: 'var(--color-select)', border: 'var(--color-select)' },
              { label: 'Đã bán', bg: '#2D2D2D', border: 'transparent' },
              { label: 'Không được chọn', bg: 'rgba(251,146,60,0.08)', border: 'rgba(251,146,60,0.35)' },
            ].map(({ label, bg, border }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded border" style={{ background: bg, borderColor: border }} />
                <span className="text-zinc-500 text-xs">{label}</span>
              </div>
            ))}
          </div>

          {/* Seat type price info */}
          <div className="flex flex-wrap gap-4 mt-4 justify-center text-xs text-zinc-600">
            <span>Thường: {fmtVND(SEAT_PRICE.normal)}</span>
            <span>VIP: {fmtVND(SEAT_PRICE.vip)}</span>
            <span>Couple: {fmtVND(SEAT_PRICE.couple)}/ghế</span>
          </div>
        </div>
      </div>
      <SeatToast toasts={toasts} />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   STEP 3 – COMBO
═══════════════════════════════════════════════════════════════════════ */

function Step3({ booking, setBooking }) {
  const change = (id, delta) =>
    setBooking(b => ({
      ...b,
      combos: { ...b.combos, [id]: Math.max(0, (b.combos[id] || 0) + delta) },
    }));

  return (
    <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: '#1A1A1A' }}>
      <div className="px-5 py-4 border-b border-white/6">
        <h2 className="text-white font-bold text-sm">Combo (tuỳ chọn)</h2>
        <p className="text-zinc-500 text-xs mt-0.5">Thêm bắp rang và nước ngọt để hoàn thiện trải nghiệm</p>
      </div>
      <div className="divide-y divide-white/5">
        {COMBOS.map((combo) => {
          const qty = booking.combos[combo.id] || 0;
          return (
            <div key={combo.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/2 transition-colors">
              {/* Icon */}
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                {combo.icon}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold">{combo.name}</p>
                <p className="text-zinc-500 text-xs mt-0.5">{combo.desc}</p>
                <p className="text-white text-xs font-bold mt-1">
                  {fmtVND(combo.price)}
                  {qty > 0 && (
                    <span className="ml-2 text-[#CF0F47]">= {fmtVND(combo.price * qty)}</span>
                  )}
                </p>
              </div>
              {/* Counter */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => change(combo.id, -1)}
                  disabled={qty === 0}
                  className="w-8 h-8 rounded-full border flex items-center justify-center font-bold transition-all cursor-pointer disabled:opacity-30 hover:bg-white/8"
                  style={{ borderColor: 'rgba(255,255,255,0.12)', color: '#fff' }}
                >−</button>
                <span className="w-6 text-center text-white font-bold text-sm">{qty}</span>
                <button
                  onClick={() => change(combo.id, 1)}
                  className="w-8 h-8 rounded-full border flex items-center justify-center font-bold transition-all cursor-pointer hover:bg-white/8"
                  style={{ borderColor: 'rgba(255,255,255,0.12)', color: '#fff' }}
                >+</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   STEP 4 – PAYMENT
═══════════════════════════════════════════════════════════════════════ */

function Step4({ booking, setBooking }) {
  return (
    <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: '#1A1A1A' }}>
      <div className="px-5 py-4 border-b border-white/6">
        <h2 className="text-white font-bold text-sm">Phương thức thanh toán</h2>
        <p className="text-zinc-500 text-xs mt-0.5">Chọn phương thức thanh toán phù hợp</p>
      </div>
      <div className="divide-y divide-white/5 p-3">
        {PAYMENT_METHODS.map((pm) => {
          const sel = booking.payment === pm.id;
          return (
            <label
              key={pm.id}
              htmlFor={`pay-${pm.id}`}
              className="flex items-center gap-4 p-3.5 rounded-xl cursor-pointer transition-all hover:bg-white/4 group"
              style={{ background: sel ? 'rgba(207,15,71,0.06)' : 'transparent' }}
            >
              {/* Radio */}
              <input
                type="radio"
                id={`pay-${pm.id}`}
                name="payment"
                value={pm.id}
                checked={sel}
                onChange={() => setBooking(b => ({ ...b, payment: pm.id }))}
                className="sr-only"
              />
              <div
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                style={{ borderColor: sel ? '#CF0F47' : '#444' }}
              >
                {sel && <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#CF0F47' }} />}
              </div>
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0"
                style={{ background: pm.bg }}
              >
                {pm.letter}
              </div>
              {/* Text */}
              <div className="flex-1">
                <p className="text-white text-sm font-semibold">{pm.name}</p>
                <p className="text-zinc-500 text-xs mt-0.5">{pm.desc}</p>
              </div>
              {sel && (
                <svg viewBox="0 0 24 24" fill="none" stroke="#CF0F47" strokeWidth="2.5" className="w-4 h-4 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SUCCESS SCREEN
═══════════════════════════════════════════════════════════════════════ */

function SuccessScreen({ booking }) {
  const navigate = useNavigate();
  const { movie, showtime, date, seats, combos, payment } = booking;
  const pm = PAYMENT_METHODS.find(p => p.id === payment);

  const seatTotal = seats.reduce((s, seat) => s + SEAT_PRICE[seat.type], 0);
  const comboTotal = Object.entries(combos).reduce((s, [id, qty]) => {
    const c = COMBOS.find(x => x.id === id);
    return s + (c ? c.price * qty : 0);
  }, 0);
  const total = seatTotal + comboTotal;

  const activeCombos = Object.entries(combos)
    .filter(([_, qty]) => qty > 0)
    .map(([id, qty]) => {
      const c = COMBOS.find(x => x.id === id);
      return c ? `${qty}x ${c.name}` : null;
    })
    .filter(Boolean);

  const ticketCode = `CTB${Date.now().toString().slice(-8).toUpperCase()}`;

  return (
    <div className="flex flex-col items-center py-8 px-4">
      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes check-bounce {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.15); }
          75% { transform: scale(0.95); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes check-draw {
          0% { stroke-dashoffset: 40; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes ticket-up {
          0% { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-check-bounce {
          animation: check-bounce 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-check-draw {
          stroke-dasharray: 40;
          stroke-dashoffset: 40;
          animation: check-draw 0.45s ease-out 0.4s forwards;
        }
        .animate-ticket-up {
          animation: ticket-up 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
      `}} />

      {/* Animated checkmark - Full green system color #0ECF67 with white check */}
      <div className="w-20 h-20 rounded-full bg-[#0ECF67] flex items-center justify-center mb-5 shadow-[0_10px_35px_rgba(14,207,103,0.35)] border-4 border-zinc-950 animate-check-bounce">
        <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.5" className="w-10 h-10">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" className="animate-check-draw" />
        </svg>
      </div>

      <h2 className="text-white font-black text-2xl mb-1">Đặt vé thành công!</h2>
      <p className="text-text-sub3 text-sm mb-8 text-center max-w-md">Cảm ơn bạn đã lựa chọn dịch vụ của chúng tôi. Thông tin vé đã được gửi về email.</p>

      {/* Ticket card */}
      <div
        className="w-full max-w-2xl rounded-2xl relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-zinc-800 animate-ticket-up overflow-visible"
        style={{ 
          background: 'linear-gradient(135deg, #1C1C1E 0%, #0F0F10 100%)'
        }}
      >
        {/* Left and Right Perforation Notches on outer borders */}
        <div className="absolute top-1/2 -translate-y-1/2 -left-3.5 w-7 h-7 rounded-full bg-bg-dark border-r border-zinc-800 z-20"></div>
        <div className="absolute top-1/2 -translate-y-1/2 -right-3.5 w-7 h-7 rounded-full bg-bg-dark border-l border-zinc-800 z-20"></div>

        <div className="flex flex-col md:flex-row relative">
          {/* Left panel (Movie details) */}
          <div className="flex-grow p-6 sm:p-7 flex gap-5">
            {/* Poster */}
            <div className="w-24 h-36 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0 shadow-lg">
              {movie?.posterUrl && (
                <img src={movie.posterUrl} alt={movie?.title} className="w-full h-full object-cover" />
              )}
            </div>

            {/* Movie info details */}
            <div className="flex-1 min-w-0 text-left">
              <h3 className="text-white font-bold text-lg leading-tight mb-2 truncate">
                {movie?.title}
              </h3>
              
              {/* Labels Row */}
              <div className="flex flex-wrap gap-2 mb-4">
                {showtime && (
                  <>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white/5 border border-white/10 text-text-sub2 uppercase tracking-wide">
                      {showtime.format}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white/5 border border-white/10 text-text-sub2 tracking-wide">
                      {showtime.lang === 'Phụ đề' ? 'Phụ đề' : 'Thuyết minh'}
                    </span>
                  </>
                )}
                {movie?.ageRating && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cta/10 border border-cta/20 text-cta uppercase tracking-wide">
                    {movie.ageRating}
                  </span>
                )}
              </div>

              {/* Booking Info Grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                <div>
                  <p className="text-[10px] text-text-sub3 uppercase tracking-wider">Ngày chiếu</p>
                  <p className="text-white text-xs font-semibold mt-0.5">
                    {date?.dateLabel} ({date?.dayLabel})
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-text-sub3 uppercase tracking-wider">Suất chiếu</p>
                  <p className="text-white text-xs font-semibold mt-0.5">
                    {showtime?.start} ~ {showtime?.end}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-text-sub3 uppercase tracking-wider">Phòng chiếu</p>
                  <p className="text-white text-xs font-semibold mt-0.5">
                    {showtime?.room}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-text-sub3 uppercase tracking-wider">Ghế ngồi</p>
                  <p className="text-[#0ECF67] text-xs font-bold mt-0.5">
                    {seats.map(s => s.id).join(', ')}
                  </p>
                </div>
                {activeCombos.length > 0 && (
                  <div className="col-span-2">
                    <p className="text-[10px] text-text-sub3 uppercase tracking-wider">Đồ ăn &amp; Nước uống</p>
                    <p className="text-text-sub2 text-xs font-medium mt-0.5">
                      {activeCombos.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Perforation line */}
          <div className="relative flex md:flex-col items-center justify-between" style={{ minWidth: 1 }}>
            {/* Top notch */}
            <div className="hidden md:block absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-bg-dark border-b border-zinc-800 z-10" />
            {/* Dashed line */}
            <div className="flex-1 w-full border-t md:border-t-0 md:border-l border-dashed border-zinc-800/80 my-0 md:my-6 h-px md:h-auto" />
            {/* Bottom notch */}
            <div className="hidden md:block absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-bg-dark border-t border-zinc-800 z-10" />
          </div>

          {/* Right panel (Pricing & Barcode) */}
          <div className="w-full md:w-52 p-6 sm:p-7 flex flex-col justify-between items-center border-t md:border-t-0 border-zinc-850">
            {/* QR Barcode Visual */}
            <div className="flex flex-col items-center">
              {/* Barcode Mock lines */}
              <div className="flex gap-[1.5px] h-12 items-center justify-center bg-white p-2.5 rounded-lg w-36 shadow-inner">
                {[1, 2, 1, 3, 1, 1, 2, 4, 1, 2, 3, 1, 2, 1, 4, 2, 1, 3, 2, 1, 1, 2].map((w, i) => (
                  <span key={i} className="bg-black h-full shrink-0" style={{ width: w }}></span>
                ))}
              </div>
              <p className="text-text-sub3 text-[10px] mt-2 font-mono tracking-wider">{ticketCode}</p>
            </div>

            <div className="text-center mt-6 md:mt-0">
              <p className="text-text-sub3 text-body3 uppercase tracking-wider mb-1">Tổng cộng</p>
              <p className="text-2xl font-black text-cta leading-none">{fmtVND(total)}</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-zinc-850 px-6 py-4 flex flex-col sm:flex-row gap-3 items-center justify-between bg-black/15 rounded-b-2xl text-left">
          <div className="flex items-center gap-2">
            {pm && (
              <>
                <div 
                  className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold shadow-sm" 
                  style={{ background: pm.bg }}
                >
                  {pm.letter}
                </div>
                <span className="text-text-sub2 text-xs font-medium">{pm.name}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-sub3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-[#0ECF67]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-text-sub3">Mã vé hợp lệ & Bảo mật</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mt-8">
        <a
          href="/"
          className="px-6 py-3 rounded-xl border border-zinc-800 text-body3 font-medium text-text-sub2 hover:text-white hover:bg-white/5 transition-all"
        >
          Về trang chủ
        </a>
        <button
          className="px-8 py-3 rounded-xl text-body3 font-bold text-white bg-cta hover:bg-cta-light hover:shadow-lg hover:shadow-cta/25 transition-all cursor-pointer"
          onClick={() => navigate('/profile?tab=history')}
        >
          Xem chi tiết vé
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN BOOKING PAGE
═══════════════════════════════════════════════════════════════════════ */

export default function Booking() {
  const location = useLocation();
  const preMovieId = location.state?.movieId;

  const [movies, setMovies] = useState([]);
  const [step, setStep] = useState(1);
  const [dateWindowStart, setDateWindowStart] = useState(0);
  const [booking, setBooking] = useState({
    movie: null,
    date: ALL_DATES[0],
    showtime: null,
    seats: [],
    combos: Object.fromEntries(COMBOS.map(c => [c.id, 0])),
    payment: null,
    ticketCount: { adult: 0, student: 0 },
  });

  useEffect(() => {
    getNowShowing().then(data => {
      setMovies(data);
      if (preMovieId) {
        const found = data.find(m => m.id === Number(preMovieId));
        if (found) setBooking(b => ({ ...b, movie: found }));
      }
    });
  }, [preMovieId]);

  // Tự động cuộn lên đầu trang khi chuyển đổi bước đặt vé
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const canNext = useMemo(() => {
    if (step === 1) return !!booking.movie && !!booking.showtime;
    if (step === 2) return booking.seats.length > 0;
    if (step === 3) return true;
    if (step === 4) return !!booking.payment;
    return false;
  }, [step, booking]);

  const handleNext = () => {
    if (step < 4) setStep(s => s + 1);
    else setStep('success');
  };

  const handleBack = () => {
    if (typeof step === 'number' && step > 1) setStep(s => s - 1);
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen" style={{ background: '#121212' }}>
        <div className="max-w-3xl mx-auto px-4">
          <StepIndicator step="success" />
          <SuccessScreen booking={booking} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#121212' }}>
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <StepIndicator step={step} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_288px] gap-5 mt-2">
          {/* Main content */}
          <div>
            {step === 1 && (
              <Step1
                booking={booking}
                setBooking={setBooking}
                movies={movies}
                dateWindowStart={dateWindowStart}
                setDateWindowStart={setDateWindowStart}
              />
            )}
            {step === 2 && <Step2 booking={booking} setBooking={setBooking} />}
            {step === 3 && <Step3 booking={booking} setBooking={setBooking} />}
            {step === 4 && <Step4 booking={booking} setBooking={setBooking} />}
          </div>

          {/* Sidebar */}
          <div>
            <OrderSidebar
              booking={booking}
              step={step}
              onBack={handleBack}
              onNext={handleNext}
              canNext={canNext}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

