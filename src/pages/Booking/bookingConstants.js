export const VN_DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export const generateDates = (n = 10) => {
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

export const ALL_DATES = generateDates(10);

export const SHOWTIMES = [
  { id: 'st1', format: '2D', lang: 'Phụ đề', start: '10:00', end: '12:15', available: 85, room: 'Phòng 1' },
  { id: 'st2', format: '2D', lang: 'Phụ đề', start: '13:30', end: '15:45', available: 52, room: 'Phòng 1' },
  { id: 'st3', format: '2D', lang: 'Thuyết minh', start: '16:00', end: '18:15', available: 98, room: 'Phòng 2' },
  { id: 'st4', format: '2D', lang: 'Phụ đề', start: '18:30', end: '20:45', available: 34, room: 'Phòng 1' },
  { id: 'st5', format: '2D', lang: 'Thuyết minh', start: '20:00', end: '22:15', available: 67, room: 'Phòng 2' },
  { id: 'st6', format: '2D', lang: 'Phụ đề', start: '22:30', end: '00:45', available: 12, room: 'Phòng 1' },
];

export const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
export const COLS = [17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

export const getSeatType = (row) => {
  if (row === 'H') return 'couple';
  if (['D', 'E', 'F'].includes(row)) return 'vip';
  return 'normal';
};

export const SEAT_PRICE = { normal: 85_000, vip: 120_000, couple: 90_000 };

export const SOLD_SEATS = new Set([
  'C7', 'C6', 'C5',
  'D7', 'D6', 'D5',
  'B8', 'B9', 'E12', 'F9', 'G10', 'H4', 'H5'
]);

export const THEATER_LAYOUT = {
  A: { type: 'normal', cols: [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
  B: { type: 'normal', cols: [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
  C: { type: 'normal', cols: [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
  D: { type: 'vip', cols: [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
  E: { type: 'vip', cols: [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
  F: { type: 'vip', cols: [17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
  G: { type: 'normal', cols: [17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
  H: { type: 'couple', cols: [18, 16, 14, 12, 10, 8, 6, 4, 2] }
};

export const getCouplePair = (row, col) => {
  const base = col % 2 === 0 ? col - 1 : col;
  return [`${row}${base + 1}`, `${row}${base}`];
};

export const COMBOS = [
  { id: 'c1', name: 'Bắp rang bơ vừa', desc: 'Vị mặn hoặc ngọt, size M', price: 45_000, icon: '🍿' },
  { id: 'c2', name: 'Bắp rang bơ lớn', desc: 'Vị mặn hoặc ngọt, size L', price: 60_000, icon: '🍿' },
  { id: 'c3', name: 'Nước ngọt vừa', desc: 'Coca-Cola / Sprite / Fanta, 330ml', price: 30_000, icon: '🥤' },
  { id: 'c4', name: 'Nước ngọt lớn', desc: 'Coca-Cola / Sprite / Fanta, 500ml', price: 40_000, icon: '🥤' },
  { id: 'c5', name: 'Combo Đôi', desc: '1 Bắp rang lớn + 2 Nước ngọt vừa', price: 99_000, icon: '🎉' },
];

export const PAYMENT_METHODS = [
  { id: 'MOMO', name: 'Ví MoMo', desc: 'Thanh toán qua ví điện tử MoMo', bg: '#a50e5f', letter: 'M' },
  { id: 'ZALOPAY', name: 'ZaloPay', desc: 'Thanh toán qua ví điện tử ZaloPay', bg: '#0468e6', letter: 'Z' },
  { id: 'VNPAY', name: 'VNPay', desc: 'Thanh toán qua cổng thanh toán VNPay', bg: '#005bab', letter: 'V' },
  { id: 'BANK_CARD', name: 'Thẻ Visa / Mastercard', desc: 'Visa, Mastercard, JCB, American Express', bg: '#1a56db', letter: 'C' },
  { id: 'CASH', name: 'Tiền mặt tại quầy', desc: 'Thanh toán trực tiếp tại quầy vé rạp', bg: '#15803d', letter: '₫' },
];
