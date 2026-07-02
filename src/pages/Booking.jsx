import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getNowShowing } from '../services/movieService';
import HolographicTicket from '../components/HolographicTicket';
import { useBookingStore, MAX_SEATS } from '../store/bookingStore';
import { Minus, Plus } from 'lucide-react';

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
  if (row === 'H') return 'couple';
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
  A: { type: 'normal', cols: [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
  B: { type: 'normal', cols: [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
  C: { type: 'normal', cols: [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
  D: { type: 'vip', cols: [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
  E: { type: 'vip', cols: [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
  F: { type: 'vip', cols: [17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
  G: { type: 'normal', cols: [17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
  H: { type: 'couple', cols: [18, 16, 14, 12, 10, 8, 6, 4, 2] }
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

const fmtVND = (n) => (n === 0 ? '0đ' : n.toLocaleString('vi-VN') + 'đ');

const areSeatsAdjacent = (row, col1, col2) => {
  if (Math.abs(col1 - col2) !== 1) return false;
  const min = Math.min(col1, col2);
  const max = Math.max(col1, col2);
  
  const isVIPRow = ['D', 'E', 'F'].includes(row);
  if (min === 10 && max === 11) return false;
  if (min === 2 && max === 3) return false;
  if (min === 6 && max === 7) {
    return isVIPRow; // Hàng VIP D, E, F không có lối đi ở giữa (cột 6 và 7 kề nhau)
  }
  return true;
};

/**
 * Tính toán kích thước cụm ghế trống liên tục chứa col (loại trừ các ghế đã bán và đã chọn)
 */
const getBlockSizeWithSelection = (row, col, selectedSet) => {
  const cols = getRowSingleCols(row);
  if (!cols.includes(col)) return 0;
  
  let left = col;
  while (cols.includes(left + 1) && areSeatsAdjacent(row, left, left + 1) && !SOLD_SEATS.has(`${row}${left + 1}`) && !selectedSet.has(`${row}${left + 1}`)) {
    left++;
  }
  
  let right = col;
  while (cols.includes(right - 1) && areSeatsAdjacent(row, right, right - 1) && !SOLD_SEATS.has(`${row}${right - 1}`) && !selectedSet.has(`${row}${right - 1}`)) {
    right--;
  }
  
  return left - right + 1;
};

/* ═══════════════════════════════════════════════════════════════════════
   SEAT CONSTRAINT HELPERS
   ═══════════════════════════════════════════════════════════════════════ */

/** Lấy tất cả cột hợp lệ của một hàng */
const getRowSingleCols = (row) => THEATER_LAYOUT[row]?.cols ?? [];

/**
 * Kiểm tra xem một tập `selectedSet` có tạo ra ghế lẻ bị kẹp trong hàng không.
 * Ghế lẻ = chưa bán, chưa chọn, cả 2 bên đều bị chặn (chọn/bán/biên hàng/lối đi).
 */
const hasOrphanInSet = (row, selectedSet) => {
  if (getSeatType(row) === 'couple') return false; // Ghế đôi không áp dụng luật ghế kẹp đơn lẻ
  const cols = getRowSingleCols(row);
  const colSet = new Set(cols);
  for (const col of cols) {
    const id = `${row}${col}`;
    if (selectedSet.has(id) || SOLD_SEATS.has(id)) continue;
    
    // Nếu cụm ghế trống ban đầu trước khi chọn chỉ có kích thước là 2, việc để lại 1 ghế trống đơn lẻ là hoàn toàn được phép
    const originalSize = getBlockSizeWithSelection(row, col, new Set());
    if (originalSize === 2) continue;

    const leftCol = col + 1;
    const rightCol = col - 1;
    const leftId = `${row}${leftCol}`;
    const rightId = `${row}${rightCol}`;
    const leftBlocked = selectedSet.has(leftId) || SOLD_SEATS.has(leftId) || !colSet.has(leftCol) || !areSeatsAdjacent(row, col, leftCol);
    const rightBlocked = selectedSet.has(rightId) || SOLD_SEATS.has(rightId) || !colSet.has(rightCol) || !areSeatsAdjacent(row, col, rightCol);
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
 */
const isOrphanBlocked = (row, id, selectedIds) => {
  if (getSeatType(row) === 'couple') return false;
  if (SOLD_SEATS.has(id) || selectedIds.has(id)) return false;
  
  const col = parseInt(id.replace(row, ''), 10);
  const originalSize = getBlockSizeWithSelection(row, col, new Set());
  if (originalSize === 2) return false; // Nếu cụm ghế ban đầu chỉ có 2 ghế, không chặn hiển thị
  
  const cols = getRowSingleCols(row);
  const colSet = new Set(cols);
  const leftCol = col + 1;
  const rightCol = col - 1;
  const leftId = `${row}${leftCol}`;
  const rightId = `${row}${rightCol}`;
  const leftBlocked = selectedIds.has(leftId) || SOLD_SEATS.has(leftId) || !colSet.has(leftCol) || !areSeatsAdjacent(row, col, leftCol);
  const rightBlocked = selectedIds.has(rightId) || SOLD_SEATS.has(rightId) || !colSet.has(rightCol) || !areSeatsAdjacent(row, col, rightCol);
  return leftBlocked && rightBlocked;
};

/**
 * Tìm cụm ghế liên tiếp chứa clickedCol không gây lỗi kẹp ghế lẻ (orphan)
 */
const findConsecutiveGroupWithNoOrphan = (row, clickedCol, count, selectedIds) => {
  const cols = getRowSingleCols(row);
  const colSet = new Set(cols);

  for (let start = clickedCol - count + 1; start <= clickedCol; start++) {
    const window = [];
    let valid = true;
    for (let c = start; c < start + count; c++) {
      if (!colSet.has(c)) { valid = false; break; }
      const seatId = `${row}${c}`;
      if (SOLD_SEATS.has(seatId) || selectedIds.has(seatId)) { valid = false; break; }
      if (c > start && !areSeatsAdjacent(row, c, c - 1)) { valid = false; break; }
      window.push(c);
    }
    if (!valid) continue;

    // Kiểm tra xem chọn cụm này có tạo ra orphan không
    const nextSelected = new Set(selectedIds);
    window.forEach(c => nextSelected.add(`${row}${c}`));
    if (hasOrphanInSet(row, nextSelected)) continue;

    return window;
  }
  return null;
};

/**
 * Tìm nhóm `count` ghế liên tiếp bao gồm `clickedCol`, tất cả đều available.
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
      if (c > start && !areSeatsAdjacent(row, c, c - 1)) { valid = false; break; }
      window.push(c);
    }
    if (valid) return window;
  }
  return null;
};

/**
 * Tìm nhóm liên tiếp LỚN NHẤT có thể bao gồm `clickedCol`, tối đa `maxCount`.
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
  const holdTimer = useBookingStore(state => state.holdTimer);

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

        {/* Countdown timer if holding */}
        {(step === 3 || step === 4) && (
          <div className="bg-[#F59E0B]/10 border-b border-[#F59E0B]/20 py-2.5 px-5 flex items-center justify-between text-xs animate-pulse text-[#F59E0B]">
            <div className="flex items-center gap-1.5 font-semibold">
              <span>⏳</span>
              <span>Thời gian giữ ghế:</span>
            </div>
            <span className="font-mono font-bold text-sm tracking-wide bg-[#F59E0B]/20 px-2 py-0.5 rounded text-white border border-[#F59E0B]/30">
              {formatTimer(holdTimer)}
            </span>
          </div>
        )}

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
  const [movieOpen, setMovieOpen] = useState(!booking.movie);
  const [showtimeOpen, setShowtimeOpen] = useState(!!booking.movie);
  const movieScrollRef = useRef(null);

  useEffect(() => {
    if (booking.movie) {
      setMovieOpen(false);
      setShowtimeOpen(true);
    } else {
      setMovieOpen(true);
      setShowtimeOpen(false);
    }
  }, [booking.movie]);

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

const formatTimer = (sec) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

function SeatCell({ seat, selected, isClickable, onToggle, pushToast }) {
  const { id, row, col, type, status, price } = seat;

  if (status === 'booked') {
    return (
      <div className="relative group">
        <button
          disabled
          title={`Ghế ${id} đã được bán`}
          className="w-7 h-7 rounded flex items-center justify-center bg-[#1C1C1C] border border-[#2D2D2D] text-zinc-700 cursor-not-allowed select-none"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
          </svg>
        </button>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-zinc-950/95 text-[10px] text-white px-2.5 py-1 rounded-md shadow-xl whitespace-nowrap border border-white/10 pointer-events-none z-50 transition-all duration-150">
          Ghế {id} - Đã bán
        </div>
      </div>
    );
  }

  if (status === 'held') {
    return (
      <div className="relative group">
        <button
          disabled
          title={`Ghế ${id} đang được người khác giữ tạm`}
          className="w-7 h-7 rounded flex items-center justify-center bg-[#F59E0B]/20 border border-[#F59E0B]/40 text-[#F59E0B] cursor-not-allowed select-none animate-pulse"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-zinc-950/95 text-[10px] text-white px-2.5 py-1 rounded-md shadow-xl whitespace-nowrap border border-white/10 pointer-events-none z-50 transition-all duration-150">
          Ghế {id} - Đang giữ tạm
        </div>
      </div>
    );
  }

  const disabled = !isClickable;

  let btnClasses = "w-7 h-7 rounded flex items-center justify-center text-xs font-bold border transition-all duration-150 select-none ";
  if (selected) {
    if (type === 'vip') {
      btnClasses += "bg-amber-500 border-amber-500 text-zinc-950 hover:opacity-90 hover:scale-110 cursor-pointer";
    } else {
      btnClasses += "bg-[#CF0F47] border-[#CF0F47] text-white hover:opacity-90 hover:scale-110 cursor-pointer";
    }
  } else {
    if (disabled) {
      btnClasses += "bg-zinc-800/20 border-zinc-900/40 text-zinc-650 opacity-30 cursor-not-allowed";
    } else {
      if (type === 'vip') {
        btnClasses += "bg-amber-500/5 border-2 border-amber-500/35 text-amber-400 hover:bg-amber-500/10 hover:scale-110 cursor-pointer";
      } else {
        btnClasses += "bg-zinc-800/40 border border-zinc-700/60 text-zinc-300 hover:bg-zinc-700/40 hover:scale-110 cursor-pointer";
      }
    }
  }

  return (
    <div className="relative group">
      <button
        disabled={disabled}
        onClick={() => onToggle(row, col, pushToast)}
        className={btnClasses}
        style={{ fontSize: '10px' }}
      >
        {col}
      </button>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-zinc-950/95 text-[10px] text-white px-2.5 py-1 rounded-md shadow-xl whitespace-nowrap border border-white/10 pointer-events-none z-50 transition-all duration-150">
        Ghế {id} - {type === 'vip' ? 'VIP' : 'Thường'} - {fmtVND(price)}
      </div>
    </div>
  );
}

function Step2({ booking, setBooking, pushToast, toasts }) {
  const { layout, selectedSeats, toggleSeat, simulateRealtimeSync, roomConfig, ticketCount, setTicketCount } = useBookingStore();

  useEffect(() => {
    const cleanup = simulateRealtimeSync();
    return () => {
      if (cleanup) cleanup();
    };
  }, [simulateRealtimeSync]);

  const selectedIds = useMemo(() => new Set(selectedSeats.map(s => s.id)), [selectedSeats]);
  const isMaxReached = selectedSeats.length >= ticketCount;

  // Tính số cột lớn nhất của cấu hình phòng hiện tại
  const maxColsInLayout = useMemo(() => {
    let max = 0;
    roomConfig.rows.forEach(row => {
      const cols = roomConfig.layout[row]?.cols ?? [];
      if (cols.length > 0 && cols[0] > max) {
        max = cols[0];
      }
    });
    return max;
  }, [roomConfig]);

  // Tạo danh sách cột từ lớn đến nhỏ (phục vụ hiển thị sơ đồ)
  const ALL_COLS = useMemo(() => {
    return Array.from({ length: maxColsInLayout }, (_, i) => maxColsInLayout - i);
  }, [maxColsInLayout]);

  return (
    <>
      <div className="rounded-2xl border border-white/8 overflow-hidden flex flex-col gap-0" style={{ background: '#1A1A1A' }}>
        {/* Tiêu đề phòng chiếu */}
        <div className="px-5 py-4 border-b border-white/6 flex items-center justify-between" style={{ background: '#1A1A1A' }}>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#CF0F47]" />
            <h3 className="text-white font-bold text-sm uppercase tracking-wider">
              {roomConfig.name || 'Phòng Chiếu'}
            </h3>
          </div>
          <span className="text-[11px] text-zinc-400 font-semibold bg-zinc-800 px-2.5 py-1 rounded-md border border-zinc-700/50">
            Đã chọn: {selectedSeats.length}/{ticketCount} ghế
          </span>
        </div>

        {/* Seat Selection Area – Nền đen tối hẳn để tạo phân vùng */}
        <div className="px-5 pt-6 pb-6 overflow-x-auto text-center flex flex-col items-center" style={{ background: '#0F0F0F' }}>
          {/* Custom Ticket Count Stepper */}
          <div className="mb-8 flex items-center justify-between w-full max-w-xs bg-zinc-900/60 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/8 shadow-xl shadow-black/20">
            <div className="flex flex-col items-start text-left">
              <span className="text-zinc-400 text-[10px] font-extrabold uppercase tracking-wider">Số lượng vé</span>
              <span className="text-zinc-500 text-[9px] mt-0.5">Tối đa 8 người</span>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                type="button"
                disabled={ticketCount <= 1}
                onClick={() => setTicketCount(ticketCount - 1)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all duration-150 ${
                  ticketCount <= 1
                    ? 'border-white/5 text-zinc-700 bg-zinc-950/20 cursor-not-allowed'
                    : 'border-white/10 text-zinc-300 hover:text-white hover:border-[#CF0F47]/50 hover:bg-[#CF0F47]/10 active:scale-95 cursor-pointer'
                }`}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              
              <div className="flex flex-col items-center min-w-[32px]">
                <span className="text-white font-black text-lg leading-none">{ticketCount}</span>
                <span className="text-[8px] text-[#CF0F47] uppercase font-extrabold tracking-wider mt-0.5">Người</span>
              </div>
              
              <button
                type="button"
                disabled={ticketCount >= 8}
                onClick={() => setTicketCount(ticketCount + 1)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all duration-150 ${
                  ticketCount >= 8
                    ? 'border-white/5 text-zinc-700 bg-zinc-950/20 cursor-not-allowed'
                    : 'border-white/10 text-zinc-300 hover:text-white hover:border-[#CF0F47]/50 hover:bg-[#CF0F47]/10 active:scale-95 cursor-pointer'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

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
                {roomConfig.rows.map((row) => {
                  const type = roomConfig.layout[row]?.type || 'normal';
                  const rowLayout = roomConfig.layout[row];
                  if (!rowLayout) return null;

                  const isCouple = type === 'couple';
                  const isVIPRow = type === 'vip';

                  return (
                    <div key={row} className="flex flex-col gap-2 w-full">
                      {/* Gap line between E and F for standard Room 1 layout */}
                      {row === 'F' && roomConfig.rows.includes('F') && roomConfig.rows.includes('E') && roomConfig.name === 'Phòng Chiếu 1' && (
                        <div className="h-6" />
                      )}
                      <div className="flex items-center gap-1 justify-between w-full">
                        {/* Left label */}
                        <span className="w-5 text-center text-xs font-bold" style={{ color: isCouple ? '#0EA1CF' : isVIPRow ? '#fbbf24' : '#555' }}>
                          {row}
                        </span>

                        {/* Seats columns track */}
                        <div className="flex gap-1 items-center">
                          {ALL_COLS.map((col) => {
                            // Nếu cột vượt quá cột tối đa của hàng này thì render ô trống
                            if (!rowLayout.cols.includes(col)) {
                              return <div key={col} className="w-7 h-7" />;
                            }

                            if (isCouple && col % 2 !== 0) return null;

                            // Lối đi
                            const showAisleBefore = roomConfig.aisles.includes(col) || (roomConfig.centerAisle === col && !isVIPRow);

                            return (
                              <div key={col} className="flex items-center">
                                {showAisleBefore && <div className="w-4 shrink-0" />}
                                {isCouple ? (
                                  (() => {
                                    const leftCol = col;
                                    const rightCol = col - 1;
                                    const idL = `${row}${leftCol}`;
                                    const idR = `${row}${rightCol}`;
                                    
                                    const seatL = layout[idL];
                                    const seatR = layout[idR];

                                    if (!seatL || !seatR) return null;

                                    const sold = seatL.status === 'booked' || seatR.status === 'booked';
                                    const held = seatL.status === 'held' || seatR.status === 'held';
                                    const sel = selectedIds.has(idL) && selectedIds.has(idR);
                                    
                                    if (sold) {
                                      return (
                                        <div className="relative group">
                                          <button
                                            disabled
                                            className="w-[60px] h-7 rounded flex items-center justify-center gap-2 bg-[#1C1C1C] border border-[#2D2D2D] text-zinc-700 cursor-not-allowed select-none p-1"
                                            style={{ fontSize: '10px' }}
                                          >
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                              <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                                            </svg>
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                              <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                                            </svg>
                                          </button>
                                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-zinc-950/95 text-[10px] text-white px-2.5 py-1 rounded-md shadow-xl whitespace-nowrap border border-white/10 pointer-events-none z-50 transition-all duration-150">
                                            Ghế đôi {idL}-{idR} - Đã bán
                                          </div>
                                        </div>
                                      );
                                    }

                                    if (held) {
                                      return (
                                        <div className="relative group">
                                          <button
                                            disabled
                                            className="w-[60px] h-7 rounded flex items-center justify-center gap-1.5 bg-[#F59E0B]/20 border border-[#F59E0B]/40 text-[#F59E0B] cursor-not-allowed select-none animate-pulse p-1"
                                            style={{ fontSize: '10px' }}
                                          >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                          </button>
                                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-zinc-950/95 text-[10px] text-white px-2.5 py-1 rounded-md shadow-xl whitespace-nowrap border border-white/10 pointer-events-none z-50 transition-all duration-150">
                                            Ghế đôi {idL}-{idR} - Đang giữ tạm
                                          </div>
                                        </div>
                                      );
                                    }

                                    const disabled = !sel && (selectedSeats.length + 2 > ticketCount);

                                    let btnClasses = "w-[60px] h-7 rounded flex items-center justify-between px-2 text-xs font-bold border transition-all duration-150 hover:scale-105 ";
                                    if (sel) {
                                      btnClasses += "bg-[#CF0F47] border-[#CF0F47] text-white cursor-pointer";
                                    } else {
                                      if (disabled) {
                                        btnClasses += "bg-zinc-850 border-zinc-900/50 text-zinc-650 opacity-30 cursor-not-allowed";
                                      } else {
                                        btnClasses += "bg-sky-500/5 border border-sky-500/30 text-sky-400 hover:bg-sky-500/10 cursor-pointer";
                                      }
                                    }

                                    return (
                                      <div className="relative group">
                                        <button
                                          disabled={disabled}
                                          onClick={() => toggleSeat(row, leftCol, pushToast)}
                                          className={btnClasses}
                                          style={{ fontSize: '10px' }}
                                        >
                                          <span>{leftCol}</span>
                                          <span>{rightCol}</span>
                                        </button>
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-zinc-950/95 text-[10px] text-white px-2.5 py-1 rounded-md shadow-xl whitespace-nowrap border border-white/10 pointer-events-none z-50 transition-all duration-150">
                                          Ghế đôi {idL}-{idR} - {fmtVND(seatL.price + seatR.price)}
                                        </div>
                                      </div>
                                    );
                                  })()
                                ) : (
                                  <SeatCell
                                    seat={layout[`${row}${col}`]}
                                    selected={selectedIds.has(`${row}${col}`)}
                                    isClickable={selectedIds.has(`${row}${col}`) || !isMaxReached}
                                    onToggle={toggleSeat}
                                    pushToast={pushToast}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Right label */}
                        <span className="w-5 text-center text-xs font-bold" style={{ color: isCouple ? '#0EA1CF' : isVIPRow ? '#fbbf24' : '#555' }}>
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
          <div className="flex flex-wrap items-center gap-5 mt-8 justify-center select-none">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded border bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.15)]" />
              <span className="text-zinc-500 text-xs">Thường</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded border bg-[rgba(251,191,36,0.05)] border-[rgba(251,191,36,0.25)]" />
              <span className="text-zinc-500 text-xs">VIP</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-5 rounded border bg-[rgba(14,161,207,0.03)] border-[rgba(14,161,207,0.25)]" />
              <span className="text-zinc-500 text-xs">Couple</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded bg-[var(--color-select)]" />
              <span className="text-zinc-500 text-xs">Đang chọn</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded border bg-[#1C1C1C] border-[#2D2D2D] flex items-center justify-center text-zinc-700">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-zinc-500 text-xs">Đã bán</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded border bg-[#252525] border-[#3A3A3A]/40 flex items-center justify-center text-zinc-500/60 p-0.5">
                <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <span className="text-zinc-500 text-xs">Không được chọn</span>
            </div>
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

  const ticketCode = useMemo(() => `CTB${Date.now().toString().slice(-8).toUpperCase()}`, []);

  useEffect(() => {
    try {
      const existing = JSON.parse(localStorage.getItem('my_cinema_tickets') || '[]');
      if (!existing.some(t => t.ticketCode === ticketCode)) {
        const newTicket = {
          ticketCode,
          movie: {
            id: movie.id,
            title: movie.title,
            posterUrl: movie.posterUrl,
            ageRating: movie.ageRating
          },
          showtime: {
            format: showtime.format,
            lang: showtime.lang,
            start: showtime.start,
            end: showtime.end,
            room: showtime.room
          },
          date: {
            dateLabel: date.dateLabel,
            dayLabel: date.dayLabel
          },
          seats: seats.map(s => s.id),
          combos: activeCombos,
          total,
          payment: {
            name: pm?.name || 'Tiền mặt tại quầy',
            bg: pm?.bg || '#15803d',
            letter: pm?.letter || '₫'
          },
          bookingDate: new Date().toLocaleDateString('vi-VN')
        };
        localStorage.setItem('my_cinema_tickets', JSON.stringify([newTicket, ...existing]));
      }
    } catch (e) {
      console.error("Error saving ticket to local storage", e);
    }
  }, [ticketCode, movie, showtime, date, seats, activeCombos, total, pm]);

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

      {/* Holographic Digital Ticket */}
      <div className="w-full animate-ticket-up">
        <HolographicTicket ticket={{
          movie,
          showtime,
          date,
          seats,
          total,
          ticketCode,
          payment: pm ? { name: pm.name, bg: pm.bg, letter: pm.letter } : { name: 'Thanh toán trực tiếp', bg: '#15803d', letter: '₫' },
          combos: activeCombos
        }} />
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
    resetStore
  } = useBookingStore();

  const location = useLocation();
  const navigate = useNavigate();
  const preMovieId = location.state?.movieId;

  const [movies, setMovies] = useState([]);
  const [dateWindowStart, setDateWindowStart] = useState(0);
  const [toasts, setToasts] = useState([]);

  const pushToast = (message, type = 'error') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  useEffect(() => {
    getNowShowing().then(data => {
      setMovies(data);
      if (preMovieId) {
        const found = data.find(m => m.id === Number(preMovieId));
        if (found) {
          let selectedDate = ALL_DATES[0];
          if (location.state?.date) {
            const matchedDate = ALL_DATES.find(d => d.dateLabel === location.state.date);
            if (matchedDate) selectedDate = matchedDate;
          }

          let selectedShowtime = null;
          if (location.state?.showtime) {
            const matchedShowtime = SHOWTIMES.find(st => st.start === location.state.showtime);
            if (matchedShowtime) {
              selectedShowtime = matchedShowtime;
            } else {
              const format = location.state.format || '2D';
              const isLồngTiếng = format.includes('Lồng Tiếng');
              const timeParts = location.state.showtime.split(':');
              const startHour = parseInt(timeParts[0], 10);
              const startMin = timeParts[1] || '00';
              const endHour = String((startHour + 2) % 24).padStart(2, '0');
              selectedShowtime = {
                id: `st-dynamic-${Date.now()}`,
                format: format.includes('IMAX') ? 'IMAX' : '2D',
                lang: isLồngTiếng ? 'Thuyết minh' : 'Phụ đề',
                start: location.state.showtime,
                end: `${endHour}:${startMin}`,
                available: 78,
                room: format.includes('IMAX') ? 'Phòng IMAX' : 'Phòng 1'
              };
            }
          }

          setMovie(found);
          setDate(selectedDate);
          if (selectedShowtime) {
            setShowtime(selectedShowtime);
            setStep(2);
          }
        }
      }
    });
  }, [preMovieId, location.state, setMovie, setDate, setShowtime, setStep]);

  // Bộ đếm countdown giữ ghế khi qua bước 3 hoặc 4
  useEffect(() => {
    if (step === 3 || step === 4) {
      startHoldTimer(() => {
        pushToast("Đã hết thời gian giữ ghế tạm thời! Vui lòng chọn lại ghế.", "warning");
        setStep(2);
      });
    } else {
      clearHoldTimer();
    }
    return () => clearHoldTimer();
  }, [step, startHoldTimer, clearHoldTimer, setStep]);

  // Tự động cuộn lên đầu trang khi chuyển đổi bước đặt vé
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const canNext = useMemo(() => {
    if (step === 1) return !!movie && !!showtime;
    if (step === 2) return selectedSeats.length > 0;
    if (step === 3) return true;
    if (step === 4) return !!payment;
    return false;
  }, [step, movie, showtime, selectedSeats, payment]);

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else setStep('success');
  };

  const handleBack = () => {
    if (typeof step === 'number' && step > 1) setStep(step - 1);
  };

  const bookingCompat = {
    movie,
    date,
    showtime,
    seats: selectedSeats,
    combos,
    payment
  };

  const setBookingCompat = (fn) => {
    const dummy = fn({ movie, date, showtime, combos, payment });
    if (dummy.movie !== movie) setMovie(dummy.movie);
    if (dummy.date !== date) setDate(dummy.date);
    if (dummy.showtime !== showtime) setShowtime(dummy.showtime);
    if (dummy.combos) setCombos(dummy.combos);
    if (dummy.payment !== payment) setPayment(dummy.payment);
  };

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

  return (
    <div className="min-h-screen" style={{ background: '#121212' }}>
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <StepIndicator step={step} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_288px] gap-5 mt-2">
          {/* Main content */}
          <div>
            {/* Countdown banner at the top for Step 3 and Step 4 */}
            {(step === 3 || step === 4) && (
              <div className="mb-4 bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-2xl py-3 px-5 flex items-center justify-between text-xs text-[#F59E0B] animate-pulse">
                <div className="flex items-center gap-2">
                  <span className="text-sm">⏳</span>
                  <span className="font-semibold">Vui lòng hoàn tất thanh toán trong thời gian quy định để giữ chỗ!</span>
                </div>
                <span className="font-mono font-black text-sm text-white bg-[#F59E0B]/30 border border-[#F59E0B]/30 px-2.5 py-1 rounded">
                  {formatTimer(holdTimer)}
                </span>
              </div>
            )}

            {step === 1 && (
              <Step1
                booking={bookingCompat}
                setBooking={setBookingCompat}
                movies={movies}
                dateWindowStart={dateWindowStart}
                setDateWindowStart={setDateWindowStart}
              />
            )}
            {step === 2 && (
              <Step2
                booking={bookingCompat}
                setBooking={setBookingCompat}
                pushToast={pushToast}
                toasts={toasts}
              />
            )}
            {step === 3 && <Step3 booking={bookingCompat} setBooking={setBookingCompat} />}
            {step === 4 && <Step4 booking={bookingCompat} setBooking={setBookingCompat} />}
          </div>

          {/* Sidebar */}
          <div>
            <OrderSidebar
              booking={bookingCompat}
              step={step}
              onBack={handleBack}
              onNext={handleNext}
              canNext={canNext}
            />
          </div>
        </div>
      </div>
      <SeatToast toasts={toasts} />
    </div>
  );
}

