import { SOLD_SEATS, THEATER_LAYOUT, getSeatType } from './bookingConstants';
import { sha512 } from 'js-sha512';

export const fmtVND = (n) => (n === 0 ? '0đ' : n.toLocaleString('vi-VN') + 'đ');

export const areSeatsAdjacent = (row, col1, col2) => {
  if (Math.abs(col1 - col2) !== 1) return false;
  const min = Math.min(col1, col2);
  const max = Math.max(col1, col2);
  
  const isVIPRow = ['D', 'E', 'F'].includes(row);
  if (min === 10 && max === 11) return false;
  if (min === 2 && max === 3) return false;
  if (min === 6 && max === 7) {
    return isVIPRow; // Hàng VIP D, E, F không có lối đi ở giữa
  }
  return true;
};

export const getRowSingleCols = (row) => THEATER_LAYOUT[row]?.cols ?? [];

export const getBlockSizeWithSelection = (row, col, selectedSet) => {
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

export const hasOrphanInSet = (row, selectedSet) => {
  if (getSeatType(row) === 'couple') return false;
  const cols = getRowSingleCols(row);
  const colSet = new Set(cols);
  for (const col of cols) {
    const id = `${row}${col}`;
    if (selectedSet.has(id) || SOLD_SEATS.has(id)) continue;
    
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

export const wouldCreateOrphan = (row, newId, selectedIds) => {
  const next = new Set(selectedIds);
  next.add(newId);
  return hasOrphanInSet(row, next);
};

export const wouldCreateOrphanOnRemove = (row, removeId, selectedIds) => {
  const next = new Set(selectedIds);
  next.delete(removeId);
  return hasOrphanInSet(row, next);
};

export const isOrphanBlocked = (row, id, selectedIds) => {
  if (getSeatType(row) === 'couple') return false;
  if (SOLD_SEATS.has(id) || selectedIds.has(id)) return false;
  
  const col = parseInt(id.replace(row, ''), 10);
  const originalSize = getBlockSizeWithSelection(row, col, new Set());
  if (originalSize === 2) return false;
  
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

export const findConsecutiveGroupWithNoOrphan = (row, clickedCol, count, selectedIds) => {
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

    const nextSelected = new Set(selectedIds);
    window.forEach(c => nextSelected.add(`${row}${c}`));
    if (hasOrphanInSet(row, nextSelected)) continue;

    return window;
  }
  return null;
};

export const findConsecutiveGroup = (row, clickedCol, count, selectedIds) => {
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

export const findBestConsecutiveGroup = (row, clickedCol, maxCount, selectedIds) => {
  for (let count = maxCount; count >= 1; count--) {
    const group = findConsecutiveGroup(row, clickedCol, count, selectedIds);
    if (group) return group;
  }
  return null;
};

export const formatTimer = (holdTimer) => {
  if (holdTimer <= 0) return '00:00';
  const m = String(Math.floor(holdTimer / 60)).padStart(2, '0');
  const s = String(holdTimer % 60).padStart(2, '0');
  return `${m}:${s}`;
};

export const groupSeats = (seats) => {
  if (!Array.isArray(seats)) return [];
  const normalSeats = seats.filter(s => s.type !== 'couple');
  const coupleSeats = seats.filter(s => s.type === 'couple');
  
  const groupedCouples = [];
  const rowGroups = {};
  coupleSeats.forEach(s => {
    if (!rowGroups[s.row]) rowGroups[s.row] = [];
    rowGroups[s.row].push(s);
  });
  
  Object.entries(rowGroups).forEach(([row, rowSeats]) => {
    const sorted = [...rowSeats].sort((a, b) => a.col - b.col);
    while (sorted.length > 0) {
      if (sorted.length >= 2 && Math.abs(sorted[0].col - sorted[1].col) <= 2) {
        const s1 = sorted.shift();
        const s2 = sorted.shift();
        const left = s1.col > s2.col ? s1 : s2;
        const right = s1.col > s2.col ? s2 : s1;
        
        groupedCouples.push({
          id: `${left.id}, ${right.id}`,
          type: 'couple',
          row: left.row,
          price: left.price,
          audienceType: left.audienceType,
          isGroupedCouple: true
        });
      } else {
        const s = sorted.shift();
        groupedCouples.push(s);
      }
    }
  });
  
  return [...normalSeats, ...groupedCouples];
};

export const groupSeatsByDisplay = (seats) => {
  if (!Array.isArray(seats)) return [];
  const preGrouped = groupSeats(seats);
  
  const groups = {};
  preGrouped.forEach(seat => {
    const key = `${seat.type}_${seat.audienceType}`;
    if (!groups[key]) {
      groups[key] = {
        type: seat.type,
        audienceType: seat.audienceType,
        ids: [],
        totalPrice: 0
      };
    }
    groups[key].ids.push(seat.id);
    groups[key].totalPrice += (seat.price || 0);
  });
  
  return Object.values(groups).map(g => {
    const typeLabel = g.type === 'vip' ? 'Ghế VIP' : g.type === 'couple' ? 'Ghế Đôi' : 'Ghế Thường';
    // couple seats: 2 physical seats = 1 unit; others: each seat = 1 unit
    const count = g.type === 'couple' ? Math.ceil(g.ids.length / 2) : g.ids.length;
    return {
      id: `${g.type}_${g.audienceType}_${g.ids.join('_')}`,
      label: `${typeLabel} (${g.audienceType}) ${g.ids.join(', ')}`,
      typeLabel: `${typeLabel} (${g.audienceType})`,
      seatCodes: g.ids.join(', '),
      count,
      totalPrice: g.totalPrice
    };
  });
};

// Helper to calculate HMAC-SHA512 using built-in browser Web Crypto API
export const calculateHmac512 = async (key, data) => {
  if (window.crypto && window.crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const keyBuffer = encoder.encode(key);
      const dataBuffer = encoder.encode(data);
      
      const cryptoKey = await window.crypto.subtle.importKey(
        "raw",
        keyBuffer,
        { name: "HMAC", hash: { name: "SHA-512" } },
        false,
        ["sign"]
      );
      
      const signature = await window.crypto.subtle.sign(
        "HMAC",
        cryptoKey,
        dataBuffer
      );
      
      return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } catch (e) {
      console.warn("Native Web Crypto failed, falling back to js-sha512:", e);
    }
  }
  
  // Robust fallback for non-secure HTTP contexts (e.g. access via IP address)
  return sha512.hmac(key, data);
};

// ─────────────────────────────────────────────────────────────────────────────
//  generateVnPayUrl  –  GỌI BE ĐỂ TẠO URL (ĐÚNG CHUẨN)
// ─────────────────────────────────────────────────────────────────────────────
//  Thay vì tự tính HMAC-SHA512 và thời gian ở FE (dễ sai timezone, lộ secret),
//  FE giờ chỉ gọi BE endpoint → BE dùng đồng hồ server + secret an toàn.
//
//  BE cần implement: POST /api/vnpay/create-payment-url
//  Request:  { invoiceId, amount }
//  Response: { paymentUrl }
// ─────────────────────────────────────────────────────────────────────────────
export const generateVnPayUrl = async ({ invoiceId, amount, returnUrl }) => {
  const beBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

  const res = await fetch(`${beBaseUrl}/vnpay/create-payment-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // gửi cookie JWT nếu endpoint yêu cầu auth
    body: JSON.stringify({ invoiceId, amount }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`[VNPay] BE trả lỗi khi tạo payment URL: ${err}`);
  }

  const data = await res.json();
  console.log('>>> [VNPay] Payment URL từ BE:', data.paymentUrl);
  return data.paymentUrl;
};

