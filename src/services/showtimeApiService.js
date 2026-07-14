import apiClient from './apiClient';

/**
 * Lấy toàn bộ danh sách suất chiếu
 */
export const getAllShowtimes = async () => {
  try {
    const res = await apiClient.get('/showtimes');
    return Array.isArray(res) ? res : res?.data || [];
  } catch (error) {
    console.error('getAllShowtimes API error:', error);
    return [];
  }
};

/**
 * Lọc suất chiếu theo phim, phòng, hoặc ngày
 * @param {Object} filters - { movieId, date, hallId }
 */
export const filterShowtimes = async (filters = {}) => {
  try {
    const params = {};
    if (filters.movieId) params.movieId = Number(filters.movieId);
    if (filters.date) params.date = filters.date; // YYYY-MM-DD
    if (filters.hallId) params.hallId = Number(filters.hallId);

    const res = await apiClient.get('/showtimes/filter', { params });
    return Array.isArray(res) ? res : res?.data || [];
  } catch (error) {
    console.error('filterShowtimes API error:', error);
    return [];
  }
};

/**
 * Lấy chi tiết suất chiếu theo ID
 */
export const getShowtimeById = async (id) => {
  try {
    const res = await apiClient.get(`/showtimes/${id}`);
    return res?.data || res;
  } catch (error) {
    console.error(`getShowtimeById (${id}) API error:`, error);
    return null;
  }
};

/**
 * Tạo mới suất chiếu (Admin)
 * @param {Object} showtimeData - { hallId, movieId, date, startTime, type }
 */
export const createShowtime = async (showtimeData) => {
  try {
    const res = await apiClient.post('/showtimes', {
      hallId: Number(showtimeData.hallId),
      movieId: Number(showtimeData.movieId),
      date: showtimeData.date, // YYYY-MM-DD
      startTime: showtimeData.startTime, // HH:MM
      type: showtimeData.type
    });
    return res?.data || res;
  } catch (error) {
    console.error('createShowtime API error:', error);
    return null;
  }
};

/**
 * Cập nhật suất chiếu (Admin)
 * @param {number|string} id
 * @param {Object} showtimeData - { hallId, movieId, date, startTime, type }
 */
export const updateShowtime = async (id, showtimeData) => {
  try {
    const res = await apiClient.patch(`/showtimes/${id}`, {
      hallId: Number(showtimeData.hallId),
      movieId: Number(showtimeData.movieId),
      date: showtimeData.date, // YYYY-MM-DD
      startTime: showtimeData.startTime, // HH:MM
      type: showtimeData.type
    });
    return res?.data || res;
  } catch (error) {
    console.error(`updateShowtime (${id}) API error:`, error);
    return null;
  }
};
