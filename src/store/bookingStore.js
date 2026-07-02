import { create } from 'zustand';

/* ═══════════════════════════════════════════════════════════════════════
   ROOM CONFIGURATIONS
   ═══════════════════════════════════════════════════════════════════════ */

export const ROOM_CONFIGS = {
  'Phòng 1': {
    name: 'Phòng Chiếu 1',
    rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    layout: {
      A: { type: 'normal', cols: [16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
      B: { type: 'normal', cols: [16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
      C: { type: 'normal', cols: [16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
      D: { type: 'vip', cols: [16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
      E: { type: 'vip', cols: [16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
      F: { type: 'vip', cols: [16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
      G: { type: 'vip', cols: [16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
      H: { type: 'couple', cols: [16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] }
    },
    aisles: [4, 12], // Lối đi sau cột 4 và 12
    centerAisle: null,
    soldSeats: ['A4', 'B7', 'B8', 'C9', 'C10', 'D5', 'D6', 'E11', 'E12', 'F5', 'F6', 'G9', 'G10'],
    heldSeats: ['A1', 'B5', 'B6', 'C11', 'C12', 'D7', 'D8', 'E9', 'E10', 'F7', 'F8', 'G11', 'G12']
  },
  'Phòng 2': {
    name: 'Phòng Chiếu Cozy 2',
    rows: ['A', 'B', 'C', 'D', 'E', 'F'],
    layout: {
      A: { type: 'normal', cols: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
      B: { type: 'normal', cols: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
      C: { type: 'vip', cols: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
      D: { type: 'vip', cols: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
      E: { type: 'normal', cols: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
      F: { type: 'couple', cols: [10, 8, 6, 4, 2] }
    },
    aisles: [3, 7], // Lối đi sau cột 3 và 7
    centerAisle: null,
    soldSeats: ['B4', 'B5', 'C4', 'C5', 'F4', 'E9'],
    heldSeats: ['A2', 'D7']
  },
  'Phòng IMAX': {
    name: 'Phòng IMAX Thượng Hạng',
    rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'],
    layout: {
      A: { type: 'normal', cols: [16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
      B: { type: 'normal', cols: [16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
      C: { type: 'normal', cols: [16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
      D: { type: 'normal', cols: [16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
      E: { type: 'vip', cols: [16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
      F: { type: 'vip', cols: [16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
      G: { type: 'vip', cols: [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
      H: { type: 'vip', cols: [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
      J: { type: 'normal', cols: [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
      K: { type: 'couple', cols: [20, 18, 16, 14, 12, 10, 8, 6, 4, 2] }
    },
    aisles: [4, 16], // Lối đi sau cột 4 và 16
    centerAisle: 10, // Lối đi giữa sau cột 10 (ngoại trừ hàng VIP)
    soldSeats: ['G10', 'G11', 'H10', 'H11', 'E8', 'E9'],
    heldSeats: ['C12', 'J4', 'K6']
  }
};

const SEAT_PRICE = { normal: 85_000, vip: 120_000, couple: 90_000 };

/* ═══════════════════════════════════════════════════════════════════════
   HELPER FUNCTIONS FOR ORPHAN AND ADJACENT CHECK
   ═══════════════════════════════════════════════════════════════════════ */

const getSeatType = (row, config) => {
  const rowConfig = config.layout[row];
  return rowConfig ? rowConfig.type : 'normal';
};

const areSeatsAdjacent = (row, col1, col2, config) => {
  if (Math.abs(col1 - col2) !== 1) return false;
  const min = Math.min(col1, col2);
  const max = Math.max(col1, col2);
  
  if (config.aisles.includes(min)) return false;
  
  if (config.centerAisle === min) {
    // Nếu là hàng VIP thì không có lối đi ở giữa
    const type = getSeatType(row, config);
    return type === 'vip';
  }
  
  return true;
};

const getBlockSizeWithSelection = (row, col, selectedSet, layout, config) => {
  const cols = config.layout[row]?.cols ?? [];
  if (!cols.includes(col)) return 0;
  
  let left = col;
  while (
    cols.includes(left + 1) && 
    areSeatsAdjacent(row, left, left + 1, config) && 
    layout[`${row}${left + 1}`]?.status !== 'booked' && 
    !selectedSet.has(`${row}${left + 1}`)
  ) {
    left++;
  }
  
  let right = col;
  while (
    cols.includes(right - 1) && 
    areSeatsAdjacent(row, right, right - 1, config) && 
    layout[`${row}${right - 1}`]?.status !== 'booked' && 
    !selectedSet.has(`${row}${right - 1}`)
  ) {
    right--;
  }
  
  return left - right + 1;
};

const isOrphan = (row, col, selectedSet, layout, config) => {
  const cols = config.layout[row]?.cols ?? [];
  const colSet = new Set(cols);
  const id = `${row}${col}`;
  
  const status = layout[id]?.status;
  if (selectedSet.has(id) || status === 'booked' || status === 'held') return false;
  const leftCol = col + 1;
  const rightCol = col - 1;
  const leftId = `${row}${leftCol}`;
  const rightId = `${row}${rightCol}`;
  
  const leftStatus = layout[leftId]?.status;
  const rightStatus = layout[rightId]?.status;

  const leftBlocked = selectedSet.has(leftId) || leftStatus === 'booked' || leftStatus === 'held' || !colSet.has(leftCol) || !areSeatsAdjacent(row, col, leftCol, config);
  const rightBlocked = selectedSet.has(rightId) || rightStatus === 'booked' || rightStatus === 'held' || !colSet.has(rightCol) || !areSeatsAdjacent(row, col, rightCol, config);
  
  return leftBlocked && rightBlocked;
};

const createsNewOrphan = (row, prevSelected, nextSelected, layout, config) => {
  if (getSeatType(row, config) === 'couple') return false;
  const cols = config.layout[row]?.cols ?? [];
  
  return cols.some(col => {
    const nextOrphan = isOrphan(row, col, nextSelected, layout, config);
    const prevOrphan = isOrphan(row, col, prevSelected, layout, config);
    return nextOrphan && !prevOrphan;
  });
};

/* ═══════════════════════════════════════════════════════════════════════
   ZUSTAND STORE
   ═══════════════════════════════════════════════════════════════════════ */

export const MAX_SEATS = 8;

export const useBookingStore = create((set, get) => ({
  // Core Wizard States
  step: 1,
  movie: null,
  date: null,
  showtime: null,
  combos: {},
  payment: null,

  // Seat Booking States
  layout: {}, // Map của { seatId: { id, row, col, type, status, price } }
  roomConfig: ROOM_CONFIGS['Phòng 1'], // Cấu hình phòng chiếu hiện tại
  selectedSeats: [], // Mảng các đối tượng ghế đang chọn: { id, row, col, type, price }
  ticketCount: 1, // Số lượng người/vé cần đặt (mặc định là 1)
  
  // Timer States
  holdTimer: 300, // 5 phút (300 giây)
  holdIntervalId: null,

  // Setters
  setStep: (step) => set({ step }),
  setMovie: (movie) => set({ movie, showtime: null, date: null, selectedSeats: [], combos: {} }),
  setDate: (date) => set({ date, showtime: null, selectedSeats: [], combos: {} }),
  setShowtime: (showtime) => {
    set({ showtime, selectedSeats: [], combos: {} });
    if (showtime) {
      get().initLayout();
    }
  },
  setPayment: (payment) => set({ payment }),
  setCombos: (combos) => set({ combos }),
  setTicketCount: (count) => {
    set({ ticketCount: count });
    get().initLayout();
  },

  // Khởi tạo sơ đồ ghế
  initLayout: () => {
    const { showtime } = get();
    const room = showtime?.room || 'Phòng 1';
    const config = ROOM_CONFIGS[room] || ROOM_CONFIGS['Phòng 1'];
    
    const newLayout = {};
    const mockHeldSeats = new Set(config.heldSeats);
    const mockSoldSeats = new Set(config.soldSeats);

    config.rows.forEach((row) => {
      const cols = config.layout[row].cols;
      const type = config.layout[row].type;
      cols.forEach((col) => {
        const id = `${row}${col}`;
        let status = 'available';
        if (mockSoldSeats.has(id)) {
          status = 'booked';
        } else if (mockHeldSeats.has(id)) {
          status = 'held';
        }
        newLayout[id] = {
          id,
          row,
          col,
          type,
          status,
          price: SEAT_PRICE[type]
        };
      });
    });

    set({ layout: newLayout, selectedSeats: [], roomConfig: config });
  },

  // Chọn/bỏ chọn ghế
  toggleSeat: (row, col, pushToast) => {
    const { layout, selectedSeats, roomConfig, ticketCount } = get();
    const type = roomConfig.layout[row]?.type || 'normal';
    const id = `${row}${col}`;
    const seat = layout[id];

    if (!seat || seat.status === 'booked' || seat.status === 'held') return;

    // Xử lý ghế đôi
    if (type === 'couple') {
      const partnerCol = col % 2 === 0 ? col - 1 : col + 1;
      const partnerId = `${row}${partnerCol}`;
      const partner = layout[partnerId];

      if (!partner || partner.status === 'booked' || partner.status === 'held') return;

      const isSelected = selectedSeats.some(s => s.id === id);

      if (isSelected) {
        // Hủy chọn cả 2
        const nextSelected = selectedSeats.filter(s => s.id !== id && s.id !== partnerId);
        const nextLayout = { ...layout };
        nextLayout[id] = { ...nextLayout[id], status: 'available' };
        nextLayout[partnerId] = { ...nextLayout[partnerId], status: 'available' };
        
        set({ selectedSeats: nextSelected, layout: nextLayout });
      } else {
        // Chọn cả 2
        if (selectedSeats.length + 2 > ticketCount) {
          pushToast(`Số lượng vé (${ticketCount} ghế) không đủ để đặt cặp ghế đôi!`, "warning");
          return;
        }

        // Validate orphan rule
        const tentativeSelected = new Set(selectedSeats.map(s => s.id));
        tentativeSelected.add(id);
        tentativeSelected.add(partnerId);

        const prevSelected = new Set(selectedSeats.map(s => s.id));

        // Chỉ kiểm tra luật ghế mồ côi khi đã chọn đủ số ghế (đạt đến ticketCount)
        if (selectedSeats.length + 2 === ticketCount) {
          if (createsNewOrphan(row, prevSelected, tentativeSelected, layout, roomConfig)) {
            pushToast("Vui lòng không để trống 1 ghế đơn lẻ!", "warning");
            return;
          }
        }

        const nextSelected = [
          ...selectedSeats,
          { id, row, col, type, price: seat.price },
          { id: partnerId, row, col: partnerCol, type, price: partner.price }
        ];

        const nextLayout = { ...layout };
        nextLayout[id] = { ...nextLayout[id], status: 'selected' };
        nextLayout[partnerId] = { ...nextLayout[partnerId], status: 'selected' };

        set({ selectedSeats: nextSelected, layout: nextLayout });
      }
    } else {
      // Ghế thường hoặc VIP
      const isSelected = selectedSeats.some(s => s.id === id);
      const nextLayout = { ...layout };

      if (isSelected) {
        // Bỏ chọn
        const nextSelected = selectedSeats.filter(s => s.id !== id);
        nextLayout[id] = { ...nextLayout[id], status: 'available' };

        set({ selectedSeats: nextSelected, layout: nextLayout });
      } else {
        // Chọn
        if (selectedSeats.length + 1 > ticketCount) {
          pushToast(`Bạn đã chọn đủ số lượng ghế (${ticketCount} ghế)!`, "warning");
          return;
        }

        const tentativeSelected = new Set(selectedSeats.map(s => s.id));
        tentativeSelected.add(id);

        const prevSelected = new Set(selectedSeats.map(s => s.id));

        // Chỉ kiểm tra luật ghế mồ côi khi đã chọn đủ số ghế (đạt đến ticketCount)
        if (selectedSeats.length + 1 === ticketCount) {
          if (createsNewOrphan(row, prevSelected, tentativeSelected, layout, roomConfig)) {
            pushToast("Vui lòng không để trống 1 ghế đơn lẻ!", "warning");
            return;
          }
        }

        const nextSelected = [...selectedSeats, { id, row, col, type, price: seat.price }];
        nextLayout[id] = { ...nextLayout[id], status: 'selected' };

        set({ selectedSeats: nextSelected, layout: nextLayout });
      }
    }
  },

  // Reset rạp
  resetSelection: () => {
    const { layout } = get();
    const nextLayout = { ...layout };
    Object.keys(nextLayout).forEach(id => {
      if (nextLayout[id].status === 'selected') {
        nextLayout[id].status = 'available';
      }
    });
    set({ selectedSeats: [], layout: nextLayout });
  },

  // Countdown timer giữ ghế
  startHoldTimer: (onExpired) => {
    const { holdIntervalId } = get();
    if (holdIntervalId) clearInterval(holdIntervalId);

    set({ holdTimer: 300 }); // Reset về 5 phút

    const intervalId = setInterval(() => {
      const { holdTimer } = get();
      if (holdTimer <= 1) {
        clearInterval(intervalId);
        set({ holdTimer: 0, holdIntervalId: null });
        get().resetSelection();
        if (onExpired) onExpired();
      } else {
        set({ holdTimer: holdTimer - 1 });
      }
    }, 1000);

    set({ holdIntervalId: intervalId });
  },

  clearHoldTimer: () => {
    const { holdIntervalId } = get();
    if (holdIntervalId) {
      clearInterval(holdIntervalId);
      set({ holdIntervalId: null });
    }
  },

  // Giả lập đồng bộ thời gian thực qua WebSocket
  simulateRealtimeSync: () => {
    // Đã tắt mô phỏng giữ ghế ngẫu nhiên thời gian thực để giữ dữ liệu mẫu cố định hợp lệ
    return () => {};
  },

  resetStore: () => {
    get().clearHoldTimer();
    set({
      step: 1,
      movie: null,
      date: null,
      showtime: null,
      combos: {},
      payment: null,
      layout: {},
      selectedSeats: [],
      holdTimer: 300,
      ticketCount: 1
    });
  }
}));
