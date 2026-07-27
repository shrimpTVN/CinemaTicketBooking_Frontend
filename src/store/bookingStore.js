import { create } from 'zustand';
import apiClient from '../services/apiClient';
import { USE_MOCK, API_URL } from '../services/apiConfig';
import { useAuthStore } from './authStore';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

let stompClient = null;

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
  orphanSeatIds: [], // Danh sách ID ghế mồ côi bị lỗi cần highlight
  ticketCount: 0, // Số lượng người/vé cần đặt (mặc định là 0)
  audienceSelection: { 'Người lớn': 0, 'U22': 0, 'Trẻ nhỏ': 0 },
  dbPrices: [],
  products: [], // Danh sách sản phẩm/combo từ BE
  paymentMethods: [], // Danh sách phương thức thanh toán từ BE
  
  // Timer States
  holdTimer: 300, // 5 phút (300 giây)
  holdExpiresAt: null,
  holdIntervalId: null,

  // Setters
  setStep: (step) => set({ step }),
  setOrphanSeatIds: (orphanSeatIds) => set({ orphanSeatIds }),
  setMovie: (movie) => set({ movie, showtime: null, date: null, selectedSeats: [], orphanSeatIds: [], combos: {}, audienceSelection: { 'Người lớn': 0, 'U22': 0, 'Trẻ nhỏ': 0 }, ticketCount: 0 }),
  setDate: (date) => set({ date, showtime: null, selectedSeats: [], orphanSeatIds: [], combos: {} }),
  setShowtime: async (showtime) => {
    set({ showtime, selectedSeats: [], orphanSeatIds: [], combos: {} });
    if (showtime) {
      await get().initLayout();
    }
  },
  setPayment: (payment) => set({ payment }),
  setCombos: (combos) => set({ combos }),
  setTicketCount: async (count) => {
    set({ ticketCount: count, orphanSeatIds: [] });
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
        const [seatsRes, showtimeSeatsRes, priceListRes, seatTypesRes] = await Promise.all([
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

          // Create a lookup for showtime seat statuses and who held them
          const showtimeSeatStatuses = {};
          const showtimeSeatHolders = {};
          if (Array.isArray(dbShowtimeSeats)) {
            dbShowtimeSeats.forEach(sts => {
              showtimeSeatStatuses[sts.seatId] = sts.status;
              showtimeSeatHolders[sts.seatId] = sts.holdBy;
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
          
          // Build seat display number mapping per row (colNumber -> 1, 2, 3...)
          const seatDisplayNumbers = {};
          uniqueRows.forEach(row => {
            const rowSeats = dbSeats.filter(s => s.rowLabel === row && !walkwayTypeIds.includes(s.seatTypeId));
            const sortedAscCols = rowSeats.map(s => s.colNumber).sort((a, b) => a - b);
            seatDisplayNumbers[row] = {};
            let counter = 1;
            sortedAscCols.forEach(col => {
              seatDisplayNumbers[row][col] = counter++;
            });
          });

          const restoredSelectedSeats = [];

          dbSeats.forEach(s => {
            // Bỏ qua ghế 'KO' hoặc ghế có loại là Lối đi (Walkway)
            if (s.rowLabel === 'KO' || walkwayTypeIds.includes(s.seatTypeId)) return;
            
            const type = typeMapping[s.seatTypeId] || 'normal';
            const beStatus = showtimeSeatStatuses[s.id] || s.status;
            const holdBy = showtimeSeatHolders[s.id];
            let status = 'available';
            const statusUpper = (beStatus || '').toUpperCase();
            
            const displayNum = seatDisplayNumbers[s.rowLabel]?.[s.colNumber] || s.colNumber;
            const displayName = `${s.rowLabel}${displayNum}`;

            if (statusUpper === 'SOLD' || statusUpper === 'OFF' || statusUpper === 'BOOKED') {
              status = 'booked';
            } else if (statusUpper === 'HELD') {
              const currentUser = useAuthStore.getState().user;
              const currentUserId = currentUser?.id ? String(currentUser.id) : null;
              const isHeldByOthers = holdBy && String(holdBy) !== "0" && String(holdBy) !== String(currentUserId);

              if (isHeldByOthers) {
                status = 'held';
              } else if ((currentUserId && String(holdBy) === String(currentUserId)) || get().selectedSeats.some(sel => String(sel.dbId) === String(s.id))) {
                status = 'selected';
                
                // If held by current user in DB, ensure it's in selectedSeats
                const alreadySelected = get().selectedSeats.some(sel => String(sel.dbId) === String(s.id));
                if (!alreadySelected) {
                  const price = get().getSeatPriceForAudience(s.seatTypeId, 'Người lớn');
                  restoredSelectedSeats.push({
                    id: s.rowLabel + s.colNumber,
                    displayName,
                    dbId: s.id,
                    row: s.rowLabel,
                    col: s.colNumber,
                    type,
                    price: Number(price)
                  });
                }
              } else {
                status = 'held';
              }
            }

            // Get dynamic price based on "Người lớn" as default display on map
            const price = get().getSeatPriceForAudience(s.seatTypeId, 'Người lớn');
            
            newLayout[s.rowLabel + s.colNumber] = {
              id: s.rowLabel + s.colNumber,
              displayName,
              dbId: s.id,
              row: s.rowLabel,
              col: s.colNumber,
              type,
              status,
              price: Number(price)
            };
          });
          
          // Giữ lại các ghế hợp lệ và tự động loại bỏ các ghế đã bị người khác giữ (HELD) hoặc đã bán (SOLD/BOOKED)
          const currentUser = useAuthStore.getState().user;
          const currentUserId = currentUser?.id ? String(currentUser.id) : null;

          const validSelectedSeats = [
            ...get().selectedSeats.filter(sel => {
              const dbStatus = (showtimeSeatStatuses[sel.dbId] || showtimeSeatStatuses[String(sel.dbId)] || '').toUpperCase();
              const holdBy = showtimeSeatHolders[sel.dbId] ?? showtimeSeatHolders[String(sel.dbId)];
              const isHeldByOthers = dbStatus === 'HELD' && holdBy && String(holdBy) !== "0" && String(holdBy) !== String(currentUserId);
              const isUnavailable = dbStatus === 'SOLD' || dbStatus === 'OFF' || dbStatus === 'BOOKED' || isHeldByOthers;
              return !isUnavailable;
            }),
            ...restoredSelectedSeats
          ];
          
          set({ layout: newLayout, selectedSeats: validSelectedSeats, roomConfig });
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
              const isCurrentlySelectedByUser = get().selectedSeats.some(sel => sel.id === id);
              status = isCurrentlySelectedByUser ? 'selected' : 'held';
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
            const isCurrentlySelectedByUser = get().selectedSeats.some(sel => sel.id === id);
            status = isCurrentlySelectedByUser ? 'selected' : 'held';
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

    set({ layout: newLayout, selectedSeats: get().selectedSeats, roomConfig: config });
  },

  // Chọn/bỏ chọn ghế (Chọn tự do tại Bước 2, chỉ giữ trên Frontend; Backend giữ ghế khi bấm "Tiếp tục")
  toggleSeat: (row, col, pushToast) => {
    const { layout, selectedSeats, roomConfig, ticketCount } = get();
    const type = roomConfig.layout[row]?.type || 'normal';
    const id = `${row}${col}`;
    const seat = layout[id];

    if (!seat || seat.status === 'booked' || seat.status === 'held') return;

    const isSelected = selectedSeats.some(s => s.id === id);

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
        const nextSelected = selectedSeats.filter(s => s.id !== id && s.id !== partnerId);
        const nextLayout = { ...layout };
        nextLayout[id] = { ...nextLayout[id], status: 'available' };
        nextLayout[partnerId] = { ...nextLayout[partnerId], status: 'available' };
        set({ selectedSeats: nextSelected, layout: nextLayout });
      } else {
        if (selectedSeats.length + 2 > ticketCount) {
          pushToast(`Số lượng vé (${ticketCount} ghế) không đủ để đặt cặp ghế đôi!`, "warning");
          return;
        }

        const nextSelected = [
          ...selectedSeats,
          { id, displayName: seat.displayName || id, row, col, type: seat.type, price: seat.price, dbId: seat.dbId },
          { id: partnerId, displayName: partner.displayName || partnerId, row, col: partnerCol, type: partner.type, price: partner.price, dbId: partner.dbId }
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
        const nextSelected = selectedSeats.filter(s => s.id !== id);
        nextLayout[id] = { ...nextLayout[id], status: 'available' };
        set({ selectedSeats: nextSelected, layout: nextLayout });
      } else {
        if (selectedSeats.length + 1 > ticketCount) {
          pushToast(`Bạn đã chọn đủ số lượng ghế (${ticketCount} ghế)!`, "warning");
          return;
        }

        const nextSelected = [...selectedSeats, { id, displayName: seat.displayName || id, row, col, type: seat.type, price: seat.price, dbId: seat.dbId }];
        nextLayout[id] = { ...nextLayout[id], status: 'selected' };

        set({ selectedSeats: nextSelected, layout: nextLayout });
      }
    }
  },

  // Chọn/bỏ chọn cụm ghế (Block Selection)
  toggleSeatBlock: async (seatsToToggle, pushToast) => {
    if (!Array.isArray(seatsToToggle) || seatsToToggle.length === 0) return;
    const { layout, selectedSeats, ticketCount, showtime } = get();
    const user = useAuthStore.getState().user;
    const userId = user?.id || 1;

    const validSeats = seatsToToggle.filter((s) => s && s.status !== 'booked' && s.status !== 'held');
    if (validSeats.length === 0) return;

    const unselectedSeats = validSeats.filter((s) => !selectedSeats.some((sel) => sel.id === s.id));
    if (unselectedSeats.length > 0) {
      if (selectedSeats.length + unselectedSeats.length > ticketCount) {
        pushToast(`Số lượng vé đã chọn (${ticketCount} ghế) không đủ để chọn cụm ${unselectedSeats.length} ghế!`, "warning");
        return;
      }

      const dbIdsToHold = unselectedSeats.map((s) => s.dbId).filter(Boolean);
      if (!USE_MOCK && showtime && dbIdsToHold.length > 0) {
        try {
          await apiClient.post(`/showtime-seats/showtimes/${showtime.id}/hold`, {
            seatIds: dbIdsToHold,
            userId: userId
          });
        } catch (error) {
          const msg = error.response?.data || error.message || "Không thể giữ cụm ghế!";
          pushToast(typeof msg === 'string' ? msg : "Một số ghế trong cụm đã được giữ bởi người khác!", "error");
          return;
        }
      }

      const newObjects = unselectedSeats.map((s) => ({
        id: s.id,
        displayName: s.displayName || s.id,
        row: s.row,
        col: s.col,
        type: s.type,
        price: s.price,
        dbId: s.dbId
      }));

      const nextSelected = [...selectedSeats, ...newObjects];
      const nextLayout = { ...layout };
      unselectedSeats.forEach((s) => {
        if (nextLayout[s.id]) {
          nextLayout[s.id] = { ...nextLayout[s.id], status: 'selected' };
        }
      });

      set({ selectedSeats: nextSelected, layout: nextLayout });
    }
  },

  // Bỏ chọn nguyên cụm ghế (Block Deselection)
  releaseSeatBlock: async (seatsToRelease, pushToast) => {
    if (!Array.isArray(seatsToRelease) || seatsToRelease.length === 0) return;
    const { layout, selectedSeats, showtime } = get();
    const user = useAuthStore.getState().user;
    const userId = user?.id || 1;

    const releaseIds = new Set(seatsToRelease.map((s) => s.id));
    const dbIdsToRelease = seatsToRelease.map((s) => s.dbId).filter(Boolean);

    if (!USE_MOCK && showtime && dbIdsToRelease.length > 0) {
      try {
        await apiClient.post(`/showtime-seats/showtimes/${showtime.id}/release`, {
          seatIds: dbIdsToRelease,
          userId: userId
        });
      } catch (error) {
        console.error("Failed to release seat block:", error);
        if (pushToast) pushToast("Không thể bỏ chọn cụm ghế!", "error");
        return;
      }
    }

    const nextSelected = selectedSeats.filter((s) => !releaseIds.has(s.id));
    const nextLayout = { ...layout };
    releaseIds.forEach((id) => {
      if (nextLayout[id]) {
        nextLayout[id] = { ...nextLayout[id], status: 'available' };
      }
    });

    set({ selectedSeats: nextSelected, layout: nextLayout });
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

  // Countdown timer giữ ghế dựa trên mốc thời gian thực tế (tránh bị reset khi chuyển bước)
  startHoldTimer: (onExpired, forceReset = false) => {
    const { holdIntervalId, holdExpiresAt } = get();
    if (holdIntervalId) {
      clearInterval(holdIntervalId);
    }

    const now = Date.now();
    let expiresAt = holdExpiresAt;

    if (forceReset || !expiresAt || expiresAt <= now) {
      expiresAt = now + 300 * 1000;
    }

    const remainingSecs = Math.max(0, Math.ceil((expiresAt - now) / 1000));
    set({ holdExpiresAt: expiresAt, holdTimer: remainingSecs });

    const intervalId = setInterval(() => {
      const { holdExpiresAt: currentExpiresAt } = get();
      const currentNow = Date.now();
      const remaining = currentExpiresAt ? Math.max(0, Math.ceil((currentExpiresAt - currentNow) / 1000)) : 0;

      if (remaining <= 0) {
        clearInterval(intervalId);
        set({ holdTimer: 0, holdExpiresAt: null, holdIntervalId: null });
        get().resetSelection();
        if (onExpired) onExpired();
      } else {
        set({ holdTimer: remaining });
      }
    }, 1000);

    set({ holdIntervalId: intervalId });
  },

  clearHoldTimer: () => {
    const { holdIntervalId } = get();
    if (holdIntervalId) {
      clearInterval(holdIntervalId);
      set({ holdIntervalId: null, holdExpiresAt: null, holdTimer: 300 });
    }
  },

  // Đồng bộ thời gian thực qua WebSocket (Chỉ dùng Polling dự phòng khi WebSocket bị lỗi)
  simulateRealtimeSync: () => {
    const showtime = get().showtime;
    if (!showtime?.id || USE_MOCK) {
      return () => {};
    }

    let pollInterval = null;
    let stompClientInstance = null;
    let isClosedIntentionally = false;

    const fetchLatestSeats = async () => {
      if (!showtime?.id || USE_MOCK) return;
      try {
        const res = await apiClient.get(`/showtime-seats/showtimes/${showtime.id}`);
        const dbShowtimeSeats = res?.data || res || [];
        if (!Array.isArray(dbShowtimeSeats)) return;

        const { layout, selectedSeats } = get();
        const currentUser = useAuthStore.getState().user;
        const currentUserId = currentUser?.id ? String(currentUser.id) : null;
        const nextLayout = { ...layout };
        let hasChange = false;

        dbShowtimeSeats.forEach((sts) => {
          const seatKey = Object.keys(nextLayout).find((key) => String(nextLayout[key].dbId) === String(sts.seatId));
          if (seatKey) {
            const stsStatus = (sts.status || '').toUpperCase();
            let targetStatus = 'available';

            if (stsStatus === 'SOLD' || stsStatus === 'OFF' || stsStatus === 'BOOKED') {
              targetStatus = 'booked';
            } else if (stsStatus === 'HELD') {
              const isHeldByMe = currentUserId && sts.holdBy && String(sts.holdBy) === String(currentUserId);
              const isSelectedByMe = selectedSeats.some(sel => String(sel.dbId) === String(sts.seatId));
              if (isHeldByMe || isSelectedByMe) {
                targetStatus = 'selected';
              } else {
                targetStatus = 'held';
              }
            }

            if (nextLayout[seatKey].status !== targetStatus || nextLayout[seatKey].holdBy !== sts.holdBy) {
              nextLayout[seatKey] = { ...nextLayout[seatKey], status: targetStatus, holdBy: sts.holdBy };
              hasChange = true;
            }
          }
        });

        if (hasChange) {
          set({ layout: nextLayout });
        }
      } catch (err) {
        console.warn('[RealtimeSync] Polling error:', err);
      }
    };

    const startFallbackPolling = () => {
      if (!pollInterval && !isClosedIntentionally) {
        console.log('⚠️ WebSocket disconnected or error. Starting fallback polling (4s)...');
        fetchLatestSeats();
        pollInterval = setInterval(fetchLatestSeats, 4000);
      }
    };

    const stopFallbackPolling = () => {
      if (pollInterval) {
        console.log('🛑 WebSocket is active. Disabling fallback polling.');
        clearInterval(pollInterval);
        pollInterval = null;
      }
    };

    try {
      let wsBaseUrl = '/ws-cinema';
      if (typeof window !== 'undefined') {
        if (API_URL && API_URL.startsWith('http')) {
          wsBaseUrl = API_URL.replace(/\/api\/?$/, '/ws-cinema');
        } else {
          wsBaseUrl = `${window.location.origin}/ws-cinema`;
        }
      }
      const socket = new SockJS(wsBaseUrl);

      stompClientInstance = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        onConnect: () => {
          console.log('✅ Connected to WebSocket for showtime:', showtime.id);
          // Tắt Polling dự phòng ngay khi WebSocket kết nối thành công
          stopFallbackPolling();

          stompClientInstance.subscribe(`/topic/showtimes/${showtime.id}/seats`, (message) => {
            try {
              const event = JSON.parse(message.body);
              console.log('>>> Received seat update event:', event);

              if (event && Array.isArray(event.seatIds) && event.seatIds.length > 0) {
                const { layout, selectedSeats } = get();
                const currentUser = useAuthStore.getState().user;
                const currentUserId = currentUser?.id ? String(currentUser.id) : null;
                const eventStatus = (event.status || '').toUpperCase();
                const eventUserId = event.userId ? String(event.userId) : null;

                const seatIdSet = new Set(event.seatIds.map(id => String(id)));
                const nextLayout = { ...layout };
                let hasChange = false;

                Object.keys(nextLayout).forEach((key) => {
                  const seat = nextLayout[key];
                  if (seat && seatIdSet.has(String(seat.dbId))) {
                    let targetStatus = 'available';

                    if (eventStatus === 'SOLD' || eventStatus === 'OFF' || eventStatus === 'BOOKED') {
                      targetStatus = 'booked';
                    } else if (eventStatus === 'HELD') {
                      const isMe = currentUserId && eventUserId && String(eventUserId) === String(currentUserId);
                      const isSelectedByMe = selectedSeats.some(sel => String(sel.dbId) === String(seat.dbId));
                      if (isMe || isSelectedByMe) {
                        targetStatus = 'selected';
                      } else {
                        targetStatus = 'held';
                      }
                    } else if (eventStatus === 'AVAILABLE') {
                      targetStatus = 'available';
                    }

                    const targetHoldBy = targetStatus === 'available' ? 0 : event.userId;
                    if (seat.status !== targetStatus || seat.holdBy !== targetHoldBy) {
                      nextLayout[key] = { ...seat, status: targetStatus, holdBy: targetHoldBy };
                      hasChange = true;
                    }
                  }
                });

                if (hasChange) {
                  // Tự động bỏ chọn khỏi selectedSeats nếu ghế bị người khác giữ/bán
                  const updatedSelectedSeats = selectedSeats.filter((sel) => {
                    const updatedSeat = nextLayout[sel.id];
                    return updatedSeat && updatedSeat.status === 'selected';
                  });

                  set({ layout: nextLayout, selectedSeats: updatedSelectedSeats });
                }
              }
            } catch (e) {
              console.warn('[RealtimeSync] Error parsing WS event:', e);
            }
          });

          // Đồng bộ trạng thái mới nhất từ DB ngay sau khi kết nối/tái kết nối
          // Đảm bảo không bỏ lỡ các sự kiện trong lúc WebSocket bị ngắt
          fetchLatestSeats();
        },
        onWebSocketClose: () => {
          if (!isClosedIntentionally) startFallbackPolling();
        },
        onWebSocketError: (err) => {
          console.warn('[RealtimeSync] WebSocket error:', err);
          if (!isClosedIntentionally) startFallbackPolling();
        },
        onStompError: (frame) => {
          console.warn('STOMP broker error:', frame?.headers?.['message']);
          if (!isClosedIntentionally) startFallbackPolling();
        }
      });

      stompClientInstance.activate();
    } catch (err) {
      console.warn('WebSocket init error, fallback to polling:', err);
      startFallbackPolling();
    }

    return () => {
      isClosedIntentionally = true;
      stopFallbackPolling();
      if (stompClientInstance) {
        try {
          stompClientInstance.deactivate();
        } catch (e) {}
      }
    };
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
