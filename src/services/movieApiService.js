import apiClient from './apiClient';

/**
 * Chuẩn hóa dữ liệu phim từ Backend API về đúng format mà Frontend đang sử dụng
 * @param {Object} movie 
 * @returns {Object}
 */
const normalizeMovie = (movie) => {
  if (!movie) return null;

  // 1. Chuẩn hóa trạng thái (status) từ UPPERCASE/snake_case về lowercase/kebab-case
  let status = movie.status;
  if (status) {
    status = status.toLowerCase().replace('_', '-');
  }

  // 2. Chuẩn hóa danh sách diễn viên (nếu API trả về chuỗi actors thay vì mảng cast)
  let cast = movie.cast;
  if (typeof movie.actors === 'string') {
    cast = movie.actors.split(',').map(item => item.trim());
  }

  // 3. Chuẩn hóa thể loại (nếu API dùng key genres thay vì genre)
  let genre = movie.genre;
  if (Array.isArray(movie.genres)) {
    genre = movie.genres.map(g => typeof g === 'string' ? g : g.name || g.title);
  }

  return {
    ...movie,
    posterUrl: movie.avatar || movie.posterUrl,  // Ánh xạ avatar -> posterUrl
    trailerUrl: movie.trailer || movie.trailerUrl, // Ánh xạ trailer -> trailerUrl
    status,
    cast,
    genre: genre || [],
  };
};

/**
 * Lấy danh sách phim đang chiếu từ API (status: "now-showing")
 * @returns {Promise<Array>}
 */
export const getNowShowing = async () => {
  try {
    // API có thể trả về trực tiếp mảng hoặc đối tượng chứa mảng
    const res = await apiClient.get('/movies', { params: { status: 'NOW_SHOWING' } });
    const movies = Array.isArray(res) ? res : res?.data || [];
    return movies.map(normalizeMovie);
  } catch (error) {
    console.error('getNowShowing API error, returning empty array:', error);
    return [];
  }
};

/**
 * Lấy danh sách phim sắp chiếu từ API (status: "coming-soon")
 * @returns {Promise<Array>}
 */
export const getComingSoon = async () => {
  try {
    const res = await apiClient.get('/movies', { params: { status: 'COMING_SOON' } });
    const movies = Array.isArray(res) ? res : res?.data || [];
    return movies.map(normalizeMovie);
  } catch (error) {
    console.error('getComingSoon API error, returning empty array:', error);
    return [];
  }
};

/**
 * Lấy chi tiết một bộ phim bằng ID từ API
 * @param {number|string} id 
 * @returns {Promise<Object|null>}
 */
export const getMovieById = async (id) => {
  try {
    const res = await apiClient.get(`/movies/${id}`);
    const movie = res?.data || res;
    return normalizeMovie(movie);
  } catch (error) {
    console.error(`getMovieById (${id}) API error, returning null:`, error);
    return null;
  }
};

/**
 * Lấy danh sách 3 phim liên quan từ API hoặc lọc cục bộ nếu API chưa hỗ trợ
 * @param {Object} movie 
 * @returns {Promise<Array>}
 */
export const getRelatedMovies = async (movie) => {
  if (!movie) return [];

  try {
    const res = await apiClient.get(`/movies/${movie.id}/related`);
    const movies = Array.isArray(res) ? res : res?.data || [];
    return movies.map(normalizeMovie);
  } catch (error) {
    console.warn('Failed to fetch related movies from API, falling back to local filtering.', error);

    try {
      const res = await apiClient.get('/movies');
      const allMovies = Array.isArray(res) ? res : res?.data || [];
      const normalizedMovies = allMovies.map(normalizeMovie);

      const related = normalizedMovies.filter(m =>
        m.id !== movie.id &&
        m.genre?.some(g => movie.genre?.includes(g))
      ).slice(0, 3);

      if (related.length < 3) {
        const remaining = normalizedMovies.filter(m =>
          m.id !== movie.id &&
          !related.some(r => r.id === m.id)
        );
        return [...related, ...remaining].slice(0, 3);
      }
      return related;
    } catch (fallbackError) {
      console.error('Related movies fallback error:', fallbackError);
      return [];
    }
  }
};

/**
 * Lấy toàn bộ danh sách phim (dùng cho admin)
 * @returns {Promise<Array>}
 */
export const getAllMovies = async () => {
  try {
    const res = await apiClient.get('/movies');
    const movies = Array.isArray(res) ? res : res?.data || [];
    return movies.map(normalizeMovie);
  } catch (error) {
    console.error('getAllMovies API error:', error);
    return [];
  }
};

/**
 * Tạo mới một bộ phim
 * @param {Object} movieData
 * @returns {Promise<Object|null>}
 */
export const createMovie = async (movieData) => {
  try {
    const res = await apiClient.post('/movies', movieData);
    return normalizeMovie(res?.data || res);
  } catch (error) {
    console.error('createMovie API error:', error);
    return null;
  }
};

/**
 * Cập nhật thông tin một bộ phim
 * @param {number|string} id
 * @param {Object} movieData
 * @returns {Promise<Object|null>}
 */
export const updateMovie = async (id, movieData) => {
  try {
    const res = await apiClient.put(`/movies/${id}`, movieData);
    return normalizeMovie(res?.data || res);
  } catch (error) {
    console.error(`updateMovie (${id}) API error:`, error);
    return null;
  }
};

/**
 * Xóa một bộ phim
 * @param {number|string} id
 * @returns {Promise<boolean>}
 */
export const deleteMovie = async (id) => {
  try {
    await apiClient.delete(`/movies/${id}`);
    return true;
  } catch (error) {
    console.error(`deleteMovie (${id}) API error:`, error);
    return false;
  }
};
