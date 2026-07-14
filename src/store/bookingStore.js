import { create } from 'zustand';
import apiClient from '../services/apiClient';
import { USE_MOCK } from '../services/apiConfig';
import { useAuthStore } from './authStore';

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
  ticketCount: 0, // Số lượng người/vé cần đặt (mặc định là 0)
  audienceSelection: { 'Người lớn': 0, 'U22': 0, 'Trẻ nhỏ': 0 },
  dbPrices: [],
  products: [], // Danh sách sản phẩm/combo từ BE
  paymentMethods: [], // Danh sách phương thức thanh toán từ BE
  
  // Timer States
  holdTimer: 300, // 5 phút (300 giây)
  holdIntervalId: null,

  // Setters
  setStep: (step) => set({ step }),
  setMovie: (movie) => set({ movie, showtime: null, date: null, selectedSeats: [], combos: {}, audienceSelection: { 'Người lớn': 0, 'U22': 0, 'Trẻ nhỏ': 0 }, ticketCount: 0 }),
  setDate: (date) => set({ date, showtime: null, selectedSeats: [], combos: {} }),
  setShowtime: async (showtime) => {
    set({ showtime, selectedSeats: [], combos: {} });
    if (showtime) {
      await get().initLayout();
    }
  },
  setPayment: (payment) => set({ payment }),
  setCombos: (combos) => set({ combos }),
  setTicketCount: async (count) => {
    set({ ticketCount: count });
    await get().initLayout();
  },
  setAudienceSelection: (selection) => {
    const ticketCount = Object.values(selection).reduce((sum, count) => sum + count, 0);
    set({ audienceSelection: selection, ticketCount });
    
    // Trim extra selected seats if count decreased
    const { selectedSeats } = get();
    if (selectedSeats.length > ticketCount) {
      const extraSeats = selectedSeats.slice(ticketCount);
      const user = useAuthStore.getState().user;
      const userId = user?.id || 1;
      const showtime = get().showtime;
      if (extraSeats.length > 0 && showtime && !USE_MOCK) {
        apiClient.post(`/showtime-seats/showtimes/${showtime.id}/release`, {
          seatIds: extraSeats.map(s => s.dbId),
          userId
        }).catch(err => console.error("Error releasing trimmed seats:", err));
      }
      set({ selectedSeats: selectedSeats.slice(0, ticketCount) });
    }
  },

  // Fetch danh sách sản phẩm/combo từ BE (cached)
  fetchProducts: async () => {
    const { products } = get();
    if (products.length > 0) return; // Already cached
    try {
      const res = await apiClient.get('/products');
      const data = res?.data || res || [];
      if (Array.isArray(data) && data.length > 0) {
        set({ products: data });
      }
    } catch (err) {
      console.warn('Failed to load products from BE:', err);
    }
  },

  // Fetch danh sách phương thức thanh toán từ BE
  fetchPaymentMethods: async () => {
    if (USE_MOCK) return;
    try {
      const res = await apiClient.get('/payment-methods');
      const data = res?.data || res || [];
      if (Array.isArray(data) && data.length > 0) {
        set({ paymentMethods: data });
      }
    } catch (err) {
      console.warn('Failed to load payment methods from BE:', err);
    }
  },

  // Get ticket price for a specific seat type & audience type
  getSeatPriceForAudience: (seatTypeId, audienceTypeName) => {
    const { dbPrices, showtime, date } = get();
    const format = showtime?.format || '2D';
    
    let dayCode = 'MON';
    if (date?.key) {
      const dateObj = new Date(date.key);
      const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      dayCode = daysOfWeek[dateObj.getDay()];
    }

    const typeMapping = { 1: 'normal', 2: 'vip', 3: 'couple' };
    const type = typeMapping[seatTypeId] || 'normal';
    const defaultPrices = { normal: 85000, vip: 120000, couple: 90000 };

    if (!Array.isArray(dbPrices) || dbPrices.length === 0) {
      return defaultPrices[type];
    }

    const priceItem = dbPrices.find(p => {
      const p_hall = (p.hallType || '').toUpperCase();
      const p_seat = (p.seatType || '').toUpperCase();
      const p_aud = (p.audienceType || '').toUpperCase();
      
      const formatMatch = p_hall.includes(format.toUpperCase());
      const audMatch = p_aud.includes(audienceTypeName.toUpperCase());
      
      let seatMatch = false;
      if (seatTypeId === 1 && (p_seat.includes('THƯỜNG') || p_seat.includes('NORMAL'))) {
        seatMatch = true;
      } else if (seatTypeId === 2 && (p_seat.includes('VIP'))) {
        seatMatch = true;
      } else if (seatTypeId === 3 && (p_seat.includes('SWEETBOX') || p_seat.includes('COUPLE'))) {
        seatMatch = true;
      }
      
      const dayMatch = Array.isArray(p.days) && p.days.includes(dayCode);
      return formatMatch && seatMatch && audMatch && dayMatch;
    });

    return priceItem ? priceItem.price : defaultPrices[type];
  },

  // Map selected seats to audience selections sequentially
  getAssignedSeats: () => {
    const { selectedSeats, audienceSelection } = get();
    const assignedTypes = [];
    Object.entries(audienceSelection).forEach(([type, count]) => {
      for (let i = 0; i < count; i++) {
        assignedTypes.push(type);
      }
    });

    return selectedSeats.map((seat, index) => {
      const audienceType = assignedTypes[index] || 'Người lớn';
      const typeIds = { 'normal': 1, 'vip': 2, 'couple': 3 };
      const seatTypeId = typeIds[seat.type] || 1;
      const price = get().getSeatPriceForAudience(seatTypeId, audienceType);
      
      return {
        ...seat,
        audienceType,
        price: Number(price)
      };
    });
  },

  // Khởi tạo sơ đồ ghế
  initLayout: async () => {
    const { showtime, date } = get();
    const room = showtime?.room || 'Phòng 1';
    const config = ROOM_CONFIGS[room] || ROOM_CONFIGS['Phòng 1'];
    
    let newLayout = {};
    let roomConfig = config;

    const hallId = showtime?.hallId;
    if (hallId && showtime?.id && !USE_MOCK) {
      try {
        const [seatsRes, showtimeSeatsRes, priceListRes, seatTypesRes] = await Promise.race([
          Promise.all([
            apiClient.get(`/halls/${hallId}/seat-map`),
            apiClient.get(`/showtime-seats/showtimes/${showtime.id}`).catch(err => {
              console.warn('Failed to load showtime seats status from BE:', err);
              return [];
            }),
            apiClient.get(`/price-lists`).catch(err => {
              console.warn('Failed to load price lists from BE:', err);
              return [];
            }),
            apiClient.get(`/seat-types`).catch(err => {
              console.warn('Failed to load seat types from BE:', err);
              return [];
            })
          ]),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout fetching seat map')), 1500))
        ]);

        const dbSeats = seatsRes?.data || seatsRes || [];
        const dbShowtimeSeats = showtimeSeatsRes?.data || showtimeSeatsRes || [];
        const dbPrices = priceListRes?.data || priceListRes || [];
        const seatTypes = seatTypesRes?.data || seatTypesRes || [];

        // Save dbPrices
        set({ dbPrices });

        if (Array.isArray(dbSeats) && dbSeats.length > 0) {
          const typeMapping = {
            1: 'normal',
            2: 'vip',
            3: 'couple'
          };

          // Tìm tất cả ID của loại ghế 'Lối đi' (Walkway)
          const walkwayTypeIds = Array.isArray(seatTypes) && seatTypes.length > 0
            ? seatTypes
                .filter(t => t.name.toLowerCase().includes('lối đi') || t.name.toLowerCase().includes('walkway'))
                .map(t => t.id)
            : [5, 9]; // fallback IDs

          // Create a lookup for showtime seat statuses
          const showtimeSeatStatuses = {};
          if (Array.isArray(dbShowtimeSeats)) {
            dbShowtimeSeats.forEach(sts => {
              showtimeSeatStatuses[sts.seatId] = sts.status;
            });
          }

          // Determine dayCode
          let dayCode = 'MON';
          if (date?.key) {
            const dateObj = new Date(date.key);
            const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
            dayCode = daysOfWeek[dateObj.getDay()];
          }
          
          // Lấy danh sách hàng ghế (bỏ qua hàng 'KO' đóng vai trò là lối đi dọc)
          const uniqueRows = [...new Set(dbSeats.map(s => s.rowLabel).filter(r => r && r !== 'KO'))].sort();
          
          // Cấu hình sơ đồ hàng ghế động
          const dynamicLayout = {};
          uniqueRows.forEach(row => {
            // Lọc ra các ghế của hàng này nhưng BỎ QUA ghế là Lối đi
            const rowSeats = dbSeats.filter(s => s.rowLabel === row && !walkwayTypeIds.includes(s.seatTypeId));
            const cols = rowSeats.map(s => s.colNumber).sort((a, b) => b - a);
            // Use the highest seatTypeId across all seats in the row (couple=3 > vip=2 > normal=1)
            const maxSeatTypeId = Math.max(...rowSeats.map(s => s.seatTypeId || 1));
            const type = typeMapping[maxSeatTypeId] || 'normal';
            
            dynamicLayout[row] = {
              type,
              cols
            };
          });
          
          // Xác định cột là lối đi (cột có rowLabel = 'KO')
          const walkwayCols = [...new Set(dbSeats.filter(s => s.rowLabel === 'KO').map(s => s.colNumber))];
          
          roomConfig = {
            name: room,
            rows: uniqueRows,
            layout: dynamicLayout,
            aisles: walkwayCols,
            centerAisle: null,
            soldSeats: [],
            heldSeats: []
          };
          
          dbSeats.forEach(s => {
            // Bỏ qua ghế 'KO' hoặc ghế có loại là Lối đi (Walkway)
            if (s.rowLabel === 'KO' || walkwayTypeIds.includes(s.seatTypeId)) return;
            
            const type = typeMapping[s.seatTypeId] || 'normal';
            const beStatus = showtimeSeatStatuses[s.id] || s.status;
            let status = 'available';
            const statusUpper = (beStatus || '').toUpperCase();
            if (statusUpper === 'SOLD' || statusUpper === 'OFF' || statusUpper === 'BOOKED') {
              status = 'booked';
            } else if (statusUpper === 'HELD') {
              status = 'held';
            }

            // Get dynamic price based on "Người lớn" as default display on map
            const price = get().getSeatPriceForAudience(s.seatTypeId, 'Người lớn');
            
            newLayout[s.rowLabel + s.colNumber] = {
              id: s.rowLabel + s.colNumber,
              dbId: s.id,
              row: s.rowLabel,
              col: s.colNumber,
              type,
              status,
              price: Number(price)
            };
          });
          
          set({ layout: newLayout, selectedSeats: [], roomConfig });
          return;
        }
      } catch (error) {
        console.warn(`Không thể tải sơ đồ ghế cho phòng ${hallId} từ cơ sở dữ liệu, sử dụng dữ liệu mock:`, error);
      }
    }

    const mockHeldSeats = new Set(config.heldSeats);
    const mockSoldSeats = new Set(config.soldSeats);

    config.rows.forEach((row) => {
      const cols = config.layout[row].cols;
      const type = config.layout[row].type;
      
      if (type === 'couple') {
        cols.forEach((col) => {
          // Even column and its odd partner
          const evenCol = col % 2 === 0 ? col : col + 1;
          const oddCol = evenCol - 1;
          
          [evenCol, oddCol].forEach((c) => {
            const id = `${row}${c}`;
            let status = 'available';
            if (mockSoldSeats.has(id)) {
              status = 'booked';
            } else if (mockHeldSeats.has(id)) {
              status = 'held';
            }
            newLayout[id] = {
              id,
              row,
              col: c,
              type,
              status,
              price: SEAT_PRICE[type]
            };
          });
        });
      } else {
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
      }
    });

    set({ layout: newLayout, selectedSeats: [], roomConfig: config });
  },

  // Chọn/bỏ chọn ghế
  toggleSeat: async (row, col, pushToast) => {
    const { layout, selectedSeats, roomConfig, ticketCount, showtime } = get();
    const type = roomConfig.layout[row]?.type || 'normal';
    const id = `${row}${col}`;
    const seat = layout[id];

    if (!seat || seat.status === 'booked' || seat.status === 'held') return;

    const isSelected = selectedSeats.some(s => s.id === id);
    if (!isSelected && selectedSeats.length > 0) {
      const activeType = selectedSeats[0].type;
      if (activeType !== seat.type) {
        const typeNames = { normal: 'Thường', vip: 'VIP', couple: 'Đôi' };
        pushToast(`Bạn chỉ được chọn các ghế cùng loại ${typeNames[activeType] || activeType}!`, "warning");
        return;
      }
    }

    // get user ID from authStore
    const user = useAuthStore.getState().user;
    const userId = user?.id || 1;

    // Xử lý ghế đôi
    if (type === 'couple') {
      const cols = roomConfig.layout[row]?.cols || [];
      const sortedCols = [...cols].sort((a, b) => a - b);
      let partnerCol = null;
      for (let i = 0; i < sortedCols.length; i += 2) {
        const c1 = sortedCols[i];
        const c2 = sortedCols[i+1];
        if (c1 === col) {
          partnerCol = c2;
          break;
        } else if (c2 === col) {
          partnerCol = c1;
          break;
        }
      }
      
      const partnerId = `${row}${partnerCol}`;
      const partner = layout[partnerId];

      if (!partner || partner.status === 'booked' || partner.status === 'held') return;

      if (isSelected) {
        // Hủy chọn cả 2
        if (!USE_MOCK && showtime) {
          try {
            await apiClient.post(`/showtime-seats/showtimes/${showtime.id}/release`, {
              seatIds: [seat.dbId, partner.dbId],
              userId: userId
            });
          } catch (error) {
            console.error("Failed to release seats:", error);
            pushToast("Không thể giải phóng ghế đôi!", "error");
            return;
          }
        }

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

        // Call backend hold API before setting state
        if (!USE_MOCK && showtime) {
          try {
            await apiClient.post(`/showtime-seats/showtimes/${showtime.id}/hold`, {
              seatIds: [seat.dbId, partner.dbId],
              userId: userId
            });
          } catch (error) {
            const msg = error.response?.data || error.message || "Không thể giữ ghế";
            pushToast(typeof msg === 'string' ? msg : "Ghế đã được chọn hoặc giữ bởi người khác!", "error");
            return;
          }
        }

        const nextSelected = [
          ...selectedSeats,
          { id, row, col, type: seat.type, price: seat.price, dbId: seat.dbId },
          { id: partnerId, row, col: partnerCol, type: partner.type, price: partner.price, dbId: partner.dbId }
        ];

        const nextLayout = { ...layout };
        nextLayout[id] = { ...nextLayout[id], status: 'selected' };
        nextLayout[partnerId] = { ...nextLayout[partnerId], status: 'selected' };

        set({ selectedSeats: nextSelected, layout: nextLayout });
      }
    } else {
      // Ghế thường hoặc VIP
      const nextLayout = { ...layout };

      if (isSelected) {
        // Bỏ chọn
        if (!USE_MOCK && showtime) {
          try {
            await apiClient.post(`/showtime-seats/showtimes/${showtime.id}/release`, {
              seatIds: [seat.dbId],
              userId: userId
            });
          } catch (error) {
            console.error("Failed to release seat:", error);
            pushToast("Không thể giải phóng ghế!", "error");
            return;
          }
        }

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

        // Call backend hold API before setting state
        if (!USE_MOCK && showtime) {
          try {
            console.log(">>> [holdSeats] Calling hold API with:", {
              showtimeId: showtime.id,
              seatIds: [seat.dbId],
              userId: userId
            });
            await apiClient.post(`/showtime-seats/showtimes/${showtime.id}/hold`, {
              seatIds: [seat.dbId],
              userId: userId
            });
          } catch (error) {
            console.error(">>> [holdSeats] Hold API failed:", error);
            const msg = error.response?.data || error.message || "Không thể giữ ghế";
            pushToast(typeof msg === 'string' ? msg : "Ghế đã được chọn hoặc giữ bởi người khác!", "error");
            return;
          }
        }

        const nextSelected = [...selectedSeats, { id, row, col, type: seat.type, price: seat.price, dbId: seat.dbId }];
        nextLayout[id] = { ...nextLayout[id], status: 'selected' };

        set({ selectedSeats: nextSelected, layout: nextLayout });
      }
    }
  },

  // Reset rạp
  resetSelection: async () => {
    const { layout, selectedSeats, showtime } = get();
    const user = useAuthStore.getState().user;
    const userId = user?.id || 1;
    
    if (selectedSeats.length > 0 && showtime && !USE_MOCK) {
      try {
        const seatIds = selectedSeats.map(s => s.dbId);
        await apiClient.post(`/showtime-seats/showtimes/${showtime.id}/release`, {
          seatIds: seatIds,
          userId: userId
        });
      } catch (error) {
        console.error("Failed to release seats on reset:", error);
      }
    }
    
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
    // Nếu timer đang chạy rồi thì không reset — chỉ tiếp tục đếm ngược
    if (holdIntervalId) return;

    set({ holdTimer: 300 }); // Chỉ reset về 5 phút khi bắt đầu phiên mới

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
      ticketCount: 0,
      audienceSelection: { 'Người lớn': 0, 'U22': 0, 'Trẻ nhỏ': 0 },
      dbPrices: []
    });
  }
}));
