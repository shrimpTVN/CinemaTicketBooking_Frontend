import { USE_MOCK } from './apiConfig';
import * as mockService from './movieMockService';
import * as apiService from './movieApiService';

/**
 * Lấy toàn bộ danh sách phim (dùng cho admin)
 * @returns {Promise<Array>}
 */
export const getAllMovies = async () => {
  return USE_MOCK ? mockService.getAllMovies() : apiService.getAllMovies();
};

/**
 * Lấy danh sách phim đang chiếu (status: "now-showing")
 * @returns {Promise<Array>}
 */
export const getNowShowing = async () => {
  return USE_MOCK ? mockService.getNowShowing() : apiService.getNowShowing();
};

/**
 * Lấy danh sách phim sắp chiếu (status: "coming-soon")
 * @returns {Promise<Array>}
 */
export const getComingSoon = async () => {
  return USE_MOCK ? mockService.getComingSoon() : apiService.getComingSoon();
};

/**
 * Lấy chi tiết một bộ phim bằng ID
 * @param {number|string} id 
 * @returns {Promise<Object|null>}
 */
export const getMovieById = async (id) => {
  return USE_MOCK ? mockService.getMovieById(id) : apiService.getMovieById(id);
};

/**
 * Lấy danh sách 3 phim liên quan (cùng thể loại)
 * @param {Object} movie 
 * @returns {Promise<Array>}
 */
export const getRelatedMovies = async (movie) => {
  return USE_MOCK ? mockService.getRelatedMovies(movie) : apiService.getRelatedMovies(movie);
};

/**
 * Tạo mới một bộ phim (admin)
 * @param {Object} movieData
 * @returns {Promise<Object|null>}
 */
export const createMovie = async (movieData) => {
  return USE_MOCK ? mockService.createMovie(movieData) : apiService.createMovie(movieData);
};

/**
 * Cập nhật thông tin một bộ phim (admin)
 * @param {number|string} id
 * @param {Object} movieData
 * @returns {Promise<Object|null>}
 */
export const updateMovie = async (id, movieData) => {
  return USE_MOCK ? mockService.updateMovie(id, movieData) : apiService.updateMovie(id, movieData);
};

/**
 * Xóa một bộ phim (admin)
 * @param {number|string} id
 * @returns {Promise<boolean>}
 */
export const deleteMovie = async (id) => {
  return USE_MOCK ? mockService.deleteMovie(id) : apiService.deleteMovie(id);
};
