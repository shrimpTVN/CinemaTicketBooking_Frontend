let mockHalls = [
  { id: 1, name: 'Phòng chiếu 1', width: 10, height: 8, hallType: 'Phòng chiếu 2D', status: 'ON' },
  { id: 2, name: 'Phòng chiếu 2', width: 12, height: 9, hallType: 'IMAX', status: 'ON' },
  { id: 3, name: 'Phòng chiếu 3', width: 8, height: 6, hallType: 'Lagom', status: 'OFF' },
];

let mockHallTypes = [
  { id: 1, name: 'Phòng chiếu 2D', description: 'Phòng chiếu phim 2D tiêu chuẩn', convenience: 'Âm thanh Dolby 7.1', style: 'Thông thường' },
  { id: 2, name: 'IMAX', description: 'Trải nghiệm điện ảnh đỉnh cao IMAX', convenience: 'Màn hình khổng lồ, Âm thanh đa hướng', style: 'Công nghệ' },
  { id: 3, name: 'Lagom', description: 'Không gian ấm áp, cân bằng', convenience: 'Ghế nằm BoConcept, Phục vụ đồ ăn', style: 'Phong cách' },
];

let mockSeatTypes = [
  { id: 1, name: 'Ghế thường', description: 'Ghế ngồi cơ bản', image: 'regular_seat.jpg' },
  { id: 2, name: 'Ghế VIP', description: 'Ghế ngồi cao cấp rộng rãi', image: 'vip_seat.jpg' },
  { id: 3, name: 'SweetBox', description: 'Ghế đôi cho cặp đôi', image: 'couple_seat.jpg' },
  { id: 4, name: 'Bean Bag', description: 'Ghế lười êm ái', image: 'bean_bag.jpg' },
  { id: 5, name: 'Lối đi', description: 'Khoảng trống di chuyển', image: 'walkway.jpg' },
];

let mockSeatMaps = {};

export const getAllHalls = async () => {
  return [...mockHalls];
};

export const getHallById = async (id) => {
  return mockHalls.find(h => h.id === Number(id)) || null;
};

export const createHall = async (hallData) => {
  const typeObj = mockHallTypes.find(t => t.id === Number(hallData.hallTypeId)) || mockHallTypes[0];
  const newHall = {
    id: mockHalls.length > 0 ? Math.max(...mockHalls.map(h => h.id)) + 1 : 1,
    name: hallData.name,
    width: Number(hallData.width),
    height: Number(hallData.height),
    hallType: typeObj.name,
    status: 'ON'
  };
  mockHalls.push(newHall);
  return newHall;
};

export const updateHall = async (id, hallData) => {
  const hall = mockHalls.find(h => h.id === Number(id));
  if (!hall) return null;
  const typeObj = mockHallTypes.find(t => t.id === Number(hallData.hallTypeId));
  
  hall.name = hallData.name;
  hall.width = Number(hallData.width);
  hall.height = Number(hallData.height);
  if (typeObj) hall.hallType = typeObj.name;
  return hall;
};

export const getAllHallTypes = async () => {
  return [...mockHallTypes];
};

export const getAllSeatTypes = async () => {
  return [...mockSeatTypes];
};

export const getHallSeatMap = async (id) => {
  const hallId = Number(id);
  if (mockSeatMaps[hallId]) {
    return mockSeatMaps[hallId];
  }
  
  const hall = mockHalls.find(h => h.id === hallId);
  if (!hall) return [];
  
  // Tự động sinh sơ đồ ghế mặc định nếu chưa có
  const list = [];
  let seatId = 1;
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
  for (let r = 0; r < hall.height; r++) {
    const rowLabel = rows[r] || `R${r + 1}`;
    for (let c = 1; c <= hall.width; c++) {
      // Mặc định cho hàng cuối là Sweetbox, hàng giữa là VIP, còn lại là ghế thường
      let seatTypeId = 1;
      if (r === hall.height - 1) seatTypeId = 3;
      else if (r >= 3 && r <= 5) seatTypeId = 2;
      
      list.push({
        id: seatId++,
        seatTypeId,
        rowLabel,
        colNumber: c,
        status: 'ACTIVE'
      });
    }
  }
  mockSeatMaps[hallId] = list;
  return list;
};

export const updateHallSeatMap = async (id, seatList) => {
  const hallId = Number(id);
  mockSeatMaps[hallId] = seatList;
  return seatList;
};

export const generateHallSeatMap = async (id, seatList) => {
  const hallId = Number(id);
  // Sinh id giả cho mỗi ghế để mô phỏng Database tự tăng
  const seatsWithId = seatList.map((s, idx) => ({
    ...s,
    id: s.id || (idx + 1)
  }));
  mockSeatMaps[hallId] = seatsWithId;
  return seatsWithId;
};

export const createHallType = async (hallTypeData) => {
  const newType = {
    id: mockHallTypes.length > 0 ? Math.max(...mockHallTypes.map(t => t.id)) + 1 : 1,
    name: hallTypeData.name,
    description: hallTypeData.description,
    convenience: hallTypeData.convenience,
    style: hallTypeData.style,
    images: Array.isArray(hallTypeData.images) ? hallTypeData.images : []
  };
  mockHallTypes.push(newType);
  return newType;
};

export const updateHallType = async (id, hallTypeData) => {
  const type = mockHallTypes.find(t => t.id === Number(id));
  if (!type) return null;
  type.name = hallTypeData.name;
  type.description = hallTypeData.description;
  type.convenience = hallTypeData.convenience;
  type.style = hallTypeData.style;
  type.images = Array.isArray(hallTypeData.images) ? hallTypeData.images : [];
  return type;
};
