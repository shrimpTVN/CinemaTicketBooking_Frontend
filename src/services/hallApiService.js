import apiClient from './apiClient';

/**
 * Lấy danh sách toàn bộ phòng chiếu
 */
export const getAllHalls = async () => {
  try {
    let res;
    try {
      res = await apiClient.get('/halls');
    } catch {
      res = await apiClient.get('/halls/');
    }
    const data = res?.data || res;
    return Array.isArray(data) ? data : (data?.content || []);
  } catch (error) {
    console.error('getAllHalls API error:', error);
    return [];
  }
};

/**
 * Lấy chi tiết phòng chiếu theo ID
 */
export const getHallById = async (id) => {
  try {
    const res = await apiClient.get(`/halls/${id}`);
    return res?.data || res;
  } catch (error) {
    console.error(`getHallById (${id}) API error:`, error);
    return null;
  }
};

/**
 * Tạo mới một phòng chiếu
 * @param {Object} hallData - { name, width, height, hallTypeId }
 */
export const createHall = async (hallData) => {
  try {
    const res = await apiClient.post('/halls', {
      name: hallData.name,
      width: Number(hallData.width),
      height: Number(hallData.height),
      hallTypeId: Number(hallData.hallTypeId)
    });
    return res?.data || res;
  } catch (error) {
    console.error('createHall API error:', error);
    return null;
  }
};

/**
 * Cập nhật thông tin phòng chiếu
 * @param {number|string} id
 * @param {Object} hallData - { name, width, height, hallTypeId }
 */
export const updateHall = async (id, hallData) => {
  try {
    const res = await apiClient.patch(`/halls/${id}`, {
      name: hallData.name,
      width: Number(hallData.width),
      height: Number(hallData.height),
      hallTypeId: Number(hallData.hallTypeId)
    });
    return res?.data || res;
  } catch (error) {
    console.error(`updateHall (${id}) API error:`, error);
    return null;
  }
};

/**
 * Lấy toàn bộ loại phòng chiếu từ CSDL
 */
export const getAllHallTypes = async () => {
  try {
    let res;
    try {
      res = await apiClient.get('/hall-types');
    } catch {
      res = await apiClient.get('/hall-types/');
    }
    const data = res?.data || res;
    return Array.isArray(data) ? data : (data?.content || []);
  } catch (error) {
    console.error('getAllHallTypes API error:', error);
    return [];
  }
};

/**
 * Lấy danh sách loại ghế từ CSDL
 */
export const getAllSeatTypes = async () => {
  try {
    let res;
    try {
      res = await apiClient.get('/seat-types');
    } catch {
      res = await apiClient.get('/seat-types/');
    }
    const data = res?.data || res;
    return Array.isArray(data) ? data : (data?.content || []);
  } catch (error) {
    console.error('getAllSeatTypes API error:', error);
    return [];
  }
};

/**
 * Lấy sơ đồ ghế của phòng chiếu theo ID
 */
export const getHallSeatMap = async (id) => {
  try {
    const res = await apiClient.get(`/halls/${id}/seat-map`);
    return Array.isArray(res) ? res : res?.data || [];
  } catch (error) {
    console.error(`getHallSeatMap (${id}) API error:`, error);
    return [];
  }
};

/**
 * Cập nhật/Lưu sơ đồ ghế của phòng chiếu
 * @param {number|string} id
 * @param {Array<Object>} seatList - Mảng danh sách SeatDto { id, seatTypeId, rowLabel, colNumber, status }
 */
export const updateHallSeatMap = async (id, seatList) => {
  try {
    const res = await apiClient.patch(`/halls/${id}/seat-map`, seatList);
    return Array.isArray(res) ? res : res?.data || [];
  } catch (error) {
    console.error(`updateHallSeatMap (${id}) API error:`, error);
    return null;
  }
};

/**
 * Khởi tạo sơ đồ ghế ban đầu cho phòng chiếu (POST)
 */
export const generateHallSeatMap = async (id, seatList) => {
  try {
    const res = await apiClient.post(`/halls/${id}/seat-map`, seatList);
    return Array.isArray(res) ? res : res?.data || [];
  } catch (error) {
    console.error(`generateHallSeatMap (${id}) API error:`, error);
    return null;
  }
};

/**
 * Tạo mới một loại phòng chiếu
 */
export const createHallType = async (hallTypeData) => {
  try {
    const res = await apiClient.post('/hall-types', {
      name: hallTypeData.name,
      description: hallTypeData.description,
      convenience: hallTypeData.convenience,
      style: hallTypeData.style,
      images: Array.isArray(hallTypeData.images) ? hallTypeData.images : []
    });
    return res?.data || res;
  } catch (error) {
    console.error('createHallType API error:', error);
    return null;
  }
};

/**
 * Cập nhật một loại phòng chiếu
 */
export const updateHallType = async (id, hallTypeData) => {
  try {
    const res = await apiClient.patch(`/hall-types/${id}`, {
      name: hallTypeData.name,
      description: hallTypeData.description,
      convenience: hallTypeData.convenience,
      style: hallTypeData.style,
      images: Array.isArray(hallTypeData.images) ? hallTypeData.images : []
    });
    return res?.data || res;
  } catch (error) {
    console.error(`updateHallType (${id}) API error:`, error);
    return null;
  }
};
