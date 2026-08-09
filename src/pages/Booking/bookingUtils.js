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
          displayName: `${left.displayName || left.id}, ${right.displayName || right.id}`,
          type: 'couple',
          row: left.row,
          price: (left.price || 0) + (right.price || 0),
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
    const label = seat.displayName || seat.id;
    groups[key].ids.push(label);
    groups[key].totalPrice += (seat.price || 0);
  });
  
  return Object.values(groups).map(g => {
    const typeLabel = g.type === 'vip' ? 'Ghế VIP' : g.type === 'couple' ? 'Ghế Đôi' : 'Ghế Thường';
    const count = g.ids.length;
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
    body: JSON.stringify({ invoiceId, amount, feOrigin: window.location.origin }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`[VNPay] BE trả lỗi khi tạo payment URL: ${err}`);
  }

  const data = await res.json();
  console.log('>>> [VNPay] Payment URL từ BE:', data.paymentUrl);
  return data.paymentUrl;
};

/**
 * Trả về mảng các kích thước cụm con cho phép tùy theo tổng số vé N:
 * - N = 1: [1]
 * - N = 2: [2]
 * - N = 3: [3] (không được tách 2+1)
 * - N = 4: [4, 2] (4 hoặc 2+2)
 * - N = 5: [3, 2] (chỉ chọn cụm 3 và cụm 2, không chọn 5)
 * - N = 6: [4, 3, 2] (tách 4+2, 3+3, 2+2+2)
 * - N = 7: [4, 3, 2] (chỉ chấp nhận tổ hợp 4+3 hoặc 3+2+2)
 * - N >= 8: [4, 3, 2] (tách 4+4, 3+3+2, 2+2+2+2)
 */
export const getValidSubBlockSizes = (ticketCount) => {
  if (ticketCount <= 0) return [];
  if (ticketCount === 1) return [1];
  if (ticketCount === 2) return [2];
  if (ticketCount === 3) return [3];
  if (ticketCount === 4) return [4, 2];
  if (ticketCount === 5) return [3, 2];
  if (ticketCount === 6) return [4, 3, 2];
  if (ticketCount === 7) return [4, 3, 2];
  if (ticketCount >= 8) return [4, 3, 2];
  return [2];
};

/**
 * Kiểm tra xem một ghế tại vị trí colIdx trong rowSeats có bị DISABLE hay không
 * khi chọn số lượng vé ticketCount và danh sách ghế đã chọn selectedSeatIds.
 */
export const isSeatDisabledForCount = (seat, rowSeats, ticketCountOrBlockSize, selectedSeatIds) => {
  if (!seat || seat.status === 'booked' || seat.status === 'held') return false;
  if (ticketCountOrBlockSize <= 0) return false;

  const selectedSet = new Set(selectedSeatIds);
  if (selectedSet.has(seat.id)) return false;

  const validSizes = typeof ticketCountOrBlockSize === 'number'
    ? [ticketCountOrBlockSize]
    : getValidSubBlockSizes(ticketCountOrBlockSize);

  const colIdx = rowSeats.findIndex((s) => s.id === seat.id || s.col === seat.col);
  if (colIdx === -1) return false;

  const isTaken = (s) => {
    if (!s) return true;
    if (s.status === 'booked' || s.status === 'held') return true;
    if (selectedSet.has(s.id)) return true;
    if (s.type === 'walkway') return true;
    return false;
  };

  const totalCols = rowSeats.length;

  for (const size of validSizes) {
    if (size > totalCols) continue;
    for (let startIdx = colIdx - size + 1; startIdx <= colIdx; startIdx++) {
      if (startIdx < 0 || startIdx + size > totalCols) continue;
      const endIdx = startIdx + size - 1;

      let blockValid = true;
      for (let i = startIdx; i <= endIdx; i++) {
        if (isTaken(rowSeats[i])) {
          blockValid = false;
          break;
        }
      }
      if (!blockValid) continue;

      let leftValid = true;
      if (startIdx > 0) {
        const left1 = rowSeats[startIdx - 1];
        if (!isTaken(left1)) {
          const left2 = startIdx > 1 ? rowSeats[startIdx - 2] : null;
          if (isTaken(left2)) {
            leftValid = false;
          }
        }
      }

      let rightValid = true;
      if (endIdx < totalCols - 1) {
        const right1 = rowSeats[endIdx + 1];
        if (!isTaken(right1)) {
          const right2 = endIdx < totalCols - 2 ? rowSeats[endIdx + 2] : null;
          if (isTaken(right2)) {
            rightValid = false;
          }
        }
      }

      if (leftValid && rightValid) {
        return false;
      }
    }
  }

  return true;
};

/**
 * Tính toán kích thước cụm ghế mục tiêu cho bước chọn tiếp theo dựa trên số vé còn lại
 */
export const getActiveBlockSize = (ticketCount, selectedCount, selectedBlockModeSize) => {
  const remaining = ticketCount - selectedCount;
  if (remaining <= 0) return 1;

  if (ticketCount === 5) {
    if (remaining === 3) return 3;
    if (remaining === 2) return 2;
    return selectedBlockModeSize || 3;
  }

  if (ticketCount === 7) {
    if (selectedBlockModeSize === 4) {
      if (remaining === 3) return 3;
      if (remaining >= 4) return 4;
    } else {
      if (remaining === 3) return 3;
      if (remaining === 2) return 2;
      if (remaining >= 4) return 3;
    }
  }

  if (ticketCount === 6 && selectedBlockModeSize === 4) {
    if (remaining === 2) return 2;
    if (remaining >= 4) return 4;
  }

  if (ticketCount >= 8 && selectedBlockModeSize === 3) {
    if (remaining === 2) return 2;
    if (remaining >= 3) return 3;
  }

  return Math.min(remaining, selectedBlockModeSize || remaining);
};

/**
 * Trả về danh sách các chế độ Radio "Chọn ghế liền nhau" phù hợp với tổng số vé N:
 * Ví dụ: N = 4 -> [{ size: 2, label: '2 ghế liền nhau (2+2)' }, { size: 4, label: '4 ghế liền nhau' }]
 */
export const getBlockModesForTicketCount = (ticketCount) => {
  if (ticketCount <= 0) return [];
  if (ticketCount === 1) return [{ size: 1, label: '1 ghế', count: 1 }];
  if (ticketCount === 2) return [{ size: 2, label: '2 ghế liền nhau', count: 2 }];
  if (ticketCount === 3) return [{ size: 3, label: '3 ghế liền nhau', count: 3 }];
  if (ticketCount === 4) return [
    { size: 2, label: '2 ghế (2+2)', count: 2 },
    { size: 4, label: '4 ghế liền', count: 4 },
  ];
  if (ticketCount === 5) return [
    { size: 2, label: 'Cụm 2 & 3 ghế (2+3)', count: 2 },
    { size: 3, label: 'Cụm 3 & 2 ghế (3+2)', count: 3 },
  ];
  if (ticketCount === 6) return [
    { size: 2, label: '2 ghế (2+2+2)', count: 2 },
    { size: 3, label: '3 ghế (3+3)', count: 3 },
    { size: 4, label: '4 ghế (4+2)', count: 4 },
  ];
  if (ticketCount === 7) return [
    { size: 4, label: '4 + 3 ghế', count: 4 },
    { size: 3, label: '3 + 2 + 2 ghế', count: 3 },
  ];
  if (ticketCount >= 8) return [
    { size: 2, label: '2 ghế (2x4)', count: 2 },
    { size: 3, label: '3 ghế (3+3+2)', count: 3 },
    { size: 4, label: '4 ghế (4+4)', count: 4 },
  ];
  return [{ size: 2, label: '2 ghế liền nhau', count: 2 }];
};

/**
 * Tìm khối ghế con hợp lệ tốt nhất có độ dài `blockSize` chứa `colIdx` trong `rowSeats`.
 * Khối hợp lệ PHẢI:
 * 1. Phù hợp với cụm phân chia tự nhiên từ lề rạp (Grid Alignment: [6,5], [4,3], [2,1]).
 * 2. Không chứa ghế đã bán, đã giữ, đã chọn, hoặc lối đi.
 * 3. Tối thiểu hóa ô trống 1 ghế đơn lẻ ở 2 bên.
 */
export const findBestValidCandidateBlock = (colIdx, blockSize, rowSeats, selectedSet) => {
  if (colIdx === -1 || blockSize <= 0 || !Array.isArray(rowSeats)) return null;

  const totalCols = rowSeats.length;

  const isTaken = (s) => {
    if (!s) return true;
    if (s.status === 'booked' || s.status === 'held') return true;
    if (selectedSet && selectedSet.has(s.id)) return true;
    if (s.type === 'walkway') return true;
    return false;
  };

  const candidates = [];
  const gridStartIdx = Math.floor(colIdx / blockSize) * blockSize;

  for (let offset = 0; offset < blockSize; offset++) {
    const startIdx = colIdx - offset;
    if (startIdx < 0 || startIdx + blockSize > totalCols) continue;
    const endIdx = startIdx + blockSize - 1;

    let blockValid = true;
    for (let i = startIdx; i <= endIdx; i++) {
      if (isTaken(rowSeats[i])) {
        blockValid = false;
        break;
      }
    }
    if (!blockValid) continue;

    let leftOrphan = false;
    if (startIdx > 0) {
      const left1 = rowSeats[startIdx - 1];
      if (!isTaken(left1)) {
        const left2 = startIdx > 1 ? rowSeats[startIdx - 2] : null;
        if (isTaken(left2)) {
          leftOrphan = true;
        }
      }
    }

    let rightOrphan = false;
    if (endIdx < totalCols - 1) {
      const right1 = rowSeats[endIdx + 1];
      if (!isTaken(right1)) {
        const right2 = endIdx < totalCols - 2 ? rowSeats[endIdx + 2] : null;
        if (isTaken(right2)) {
          rightOrphan = true;
        }
      }
    }

    const orphanCount = (leftOrphan ? 1 : 0) + (rightOrphan ? 1 : 0);
    candidates.push({
      startIdx,
      block: rowSeats.slice(startIdx, startIdx + blockSize),
      orphanCount,
      isGridMatch: startIdx === gridStartIdx,
    });
  }

  if (candidates.length === 0) return null;

  // 1. Ưu tiên cụm khớp 100% với lưới chia tự nhiên [6,5], [4,3], [2,1] không có ô mồ côi
  const gridZeroOrphan = candidates.find((c) => c.orphanCount === 0 && c.isGridMatch);
  if (gridZeroOrphan) return gridZeroOrphan.block;

  // 2. Dự phòng: Bất kỳ cụm nào không có ô mồ côi
  const zeroOrphan = candidates.find((c) => c.orphanCount === 0);
  if (zeroOrphan) return zeroOrphan.block;

  // 3. Sắp xếp ưu tiên theo orphanCount nhỏ nhất, rồi đến c.isGridMatch
  candidates.sort((a, b) => {
    if (a.orphanCount !== b.orphanCount) return a.orphanCount - b.orphanCount;
    if (a.isGridMatch !== b.isGridMatch) return a.isGridMatch ? -1 : 1;
    return 0;
  });

  return candidates[0].block;
};

/**
 * Quét toàn bộ ghế đã chọn để tìm xem có ô ghế trống đơn lẻ (1 ghế mồ côi) nào vô tình được tạo ra trên các hàng ghế đã chọn hay không.
 */
export const findOrphanSeats = (selectedSeats, layout, roomConfig) => {
  if (!Array.isArray(selectedSeats) || selectedSeats.length === 0) return [];
  const selectedSet = new Set(selectedSeats.map((s) => s.id));
  const orphanSeatIds = new Set();

  const rowsWithSelection = [...new Set(selectedSeats.map((s) => s.row))];

  rowsWithSelection.forEach((row) => {
    const rowLayout = roomConfig?.layout?.[row];
    if (!rowLayout) return;

    const cols = rowLayout.cols;
    const sortedCols = [...cols].sort((a, b) => b - a);

    const list = [];
    sortedCols.forEach((c, idx) => {
      const seatObj = layout[`${row}${c}`] || { id: `${row}${c}`, row, col: c, status: 'available' };
      list.push(seatObj);
      const nextCol = sortedCols[idx + 1];
      const isColGap = nextCol !== undefined && Math.abs(c - nextCol) > 1;
      const type = rowLayout.type || 'normal';
      const isVIPRow = type === 'vip';
      const hasAisle = roomConfig?.aisles?.includes(c) || (roomConfig?.centerAisle === c && !isVIPRow) || isColGap;
      if (hasAisle) {
        list.push({ id: `walkway-${row}-${c}`, row, col: `walkway-${c}`, type: 'walkway', status: 'available' });
      }
    });

    const isTaken = (s) => {
      if (!s) return true;
      if (s.status === 'booked' || s.status === 'held') return true;
      if (selectedSet.has(s.id)) return true;
      if (s.type === 'walkway') return true;
      return false;
    };

    list.forEach((s, idx) => {
      if (s.type === 'walkway' || isTaken(s)) return;
      const leftTaken = isTaken(list[idx - 1]);
      const rightTaken = isTaken(list[idx + 1]);

      if (leftTaken && rightTaken) {
        orphanSeatIds.add(s.id);
      }
    });
  });

  return Array.from(orphanSeatIds);
};

