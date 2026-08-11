import apiClient from './apiClient';

const FALLBACK_GENRES = [
  { id: 1, name: 'Hành động', description: '' },
  { id: 2, name: 'Phiêu lưu', description: '' },
  { id: 3, name: 'Hài hước', description: '' },
  { id: 4, name: 'Kinh dị', description: '' },
  { id: 5, name: 'Lãng mạng', description: '' },
  { id: 6, name: 'Giả tưởng', description: '' },
  { id: 7, name: 'Tâm lý', description: '' },
  { id: 8, name: 'Hoạt hình', description: '' },
  { id: 9, name: 'Gia đình', description: '' },
  { id: 10, name: 'Giật gân', description: '' },
  { id: 11, name: 'Kỳ ảo', description: '' },
  { id: 12, name: 'Nhạc kịch', description: '' },
  { id: 13, name: 'Lịch sử', description: '' },
  { id: 14, name: 'Chiến tranh', description: '' },
  { id: 15, name: 'Bí ẩn', description: '' },
  { id: 16, name: 'Tội phạm', description: '' },
  { id: 17, name: 'Tiểu sử', description: '' },
  { id: 18, name: 'Tài liệu', description: '' },
];

/**
 * Lấy toàn bộ danh sách thể loại từ API
 * @returns {Promise<Array>}
 */
export const getAllGenres = async () => {
  try {
    const res = await apiClient.get('/genres');
    return Array.isArray(res) ? res : res?.data || [];
  } catch (error) {
    console.error('getAllGenres API error, using fallback:', error);
    return FALLBACK_GENRES;
  }
};

/**
 * Chuyển đổi dữ liệu phim từ định dạng Frontend sang định dạng DTO của Backend
 * @param {Object} movieData 
 * @param {Array} allGenres 
 * @returns {Object}
 */
const denormalizeMovie = (movieData, allGenres = []) => {
  const lookupGenres = allGenres.length > 0 ? allGenres : FALLBACK_GENRES;

  const genres = (movieData.genre || []).map(name => {
    const normalizedName = name.toLowerCase().replace(/\s+/g, '');
    const matched = lookupGenres.find(g => g.name.toLowerCase().replace(/\s+/g, '') === normalizedName);
    if (matched) {
      return { id: matched.id, name: matched.name, description: matched.description || '' };
    }
    return null;
  }).filter(Boolean);

  let ageLimit = 0;
  if (movieData.ageRating) {
    if (movieData.ageRating === 'C' || movieData.ageRating === 'T18') {
      ageLimit = 18;
    } else {
      const match = movieData.ageRating.match(/\d+/);
      if (match) {
        ageLimit = parseInt(match[0], 10);
      }
    }
  }

  let premiereDate = null;
  if (movieData.releaseDate) {
    try {
      const dateVal = new Date(movieData.releaseDate);
      if (!isNaN(dateVal.getTime())) {
        premiereDate = dateVal.toISOString();
      }
    } catch (e) {
      console.warn("Failed to parse releaseDate to premiereDate:", e);
    }
  }
  if (!premiereDate) {
    premiereDate = new Date().toISOString();
  }

  let status = movieData.status === 'OFF' ? 'OFF' : 'ON';

  const posterUrl = (movieData.posterUrl || movieData.avatar || '').trim() || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba';
  const trailerUrl = (movieData.trailerUrl || movieData.trailer || '').trim() || 'https://www.youtube.com';
  const castStr = Array.isArray(movieData.cast) ? movieData.cast.join(', ') : (movieData.cast || movieData.actors || '');
  const actors = castStr.trim() || 'Đang cập nhật';
  const director = (movieData.director || '').trim() || 'Đang cập nhật';

  return {
    id: movieData.id ? Number(movieData.id) : undefined,
    title: movieData.title,
    duration: Number(movieData.duration),
    avatar: posterUrl,
    trailer: trailerUrl,
    description: movieData.description || '',
    country: movieData.country || 'Việt Nam',
    ageLimit,
    premiereDate,
    rating: movieData.rating ? Number(movieData.rating) : 0.0,
    actors,
    director,
    status,
    genres
  };
};

/**
 * Chuẩn hóa dữ liệu phim từ Backend API về đúng format mà Frontend đang sử dụng
 * @param {Object} movie 
 * @returns {Object}
 */
const normalizeMovie = (movie) => {
  if (!movie) return null;

  // 1. Phân tích ngày chiếu để quyết định Trạng thái (status) động
  let status = movie.status || 'ON';
  const now = new Date();
  let premiereDateObj = null;
  const pDate = movie.premiereDate || movie.premiere_date || movie.releaseDate;
  if (pDate) {
    try {
      premiereDateObj = new Date(pDate);
    } catch (e) {
      console.warn("Failed to parse date for status calculation:", e);
    }
  }

  const isMovieActive = (status === 'ON' || status === 'NOW_SHOWING' || status === 'COMING_SOON');

  if (!isMovieActive || status === 'OFF') {
    status = 'stopped';
  } else {
    if (premiereDateObj && !isNaN(premiereDateObj.getTime())) {
      if (premiereDateObj <= now) {
        status = 'now-showing';
      } else {
        status = 'coming-soon';
      }
    } else {
      status = 'now-showing';
    }
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

  let ageRating = movie.ageRating;
  if (movie.ageLimit !== undefined && movie.ageLimit !== null) {
    ageRating = movie.ageLimit === 0 ? 'P' : 'T' + movie.ageLimit;
  }

  let releaseDate = movie.releaseDate;
  if (pDate) {
    try {
      const d = new Date(pDate);
      if (!isNaN(d.getTime())) {
        releaseDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      }
    } catch (e) {
      console.warn("Failed to parse premiereDate:", e);
    }
  }

  return {
    ...movie,
    posterUrl: movie.avatar || movie.posterUrl,  // Ánh xạ avatar -> posterUrl
    trailerUrl: movie.trailer || movie.trailerUrl, // Ánh xạ trailer -> trailerUrl
    releaseDate: releaseDate || movie.releaseDate || 'Đang cập nhật',
    ageRating,
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
    const res = await apiClient.get('/movies/special-list', { params: { type: 'SHOWING' } });
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
    const res = await apiClient.get('/movies/special-list', { params: { type: 'COMING_SOON' } });
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
    return movies
      .map(normalizeMovie)
      .filter(m =>
        m.status !== 'stopped' &&
        m.genre?.some(g => movie.genre?.includes(g))
      )
      .sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0))
      .slice(0, 3);
  } catch (error) {
    console.warn('Failed to fetch related movies from API, falling back to local filtering.', error);

    try {
      const res = await apiClient.get('/movies');
      const allMovies = Array.isArray(res) ? res : res?.data || [];
      const activeMovies = allMovies.map(normalizeMovie).filter(m => m.status !== 'stopped');

      const related = activeMovies
        .filter(m =>
          m.id !== movie.id &&
          m.genre?.some(g => movie.genre?.includes(g))
        )
        .sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0))
        .slice(0, 3);

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
    const allGenres = await getAllGenres();
    const payload = denormalizeMovie(movieData, allGenres);
    const res = await apiClient.post('/movies', payload);
    return normalizeMovie(res?.data || res);
  } catch (error) {
    console.error('createMovie API error:', error);
    throw error;
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
    const allGenres = await getAllGenres();
    const payload = denormalizeMovie({ ...movieData, id }, allGenres);
    const res = await apiClient.patch(`/movies/${id}`, payload);
    return normalizeMovie(res?.data || res);
  } catch (error) {
    console.error(`updateMovie (${id}) API error:`, error);
    throw error;
  }
};

/**
 * Xóa một bộ phim
 * @param {number|string} id
 * @returns {Promise<boolean>}
 */
export const deleteMovie = async (id) => {
  // Backend không hỗ trợ endpoint xóa phim vì liên quan đến lịch chiếu/vé/hóa đơn
  console.warn(`deleteMovie (${id}) is not supported by the backend API.`);
  return false;
};

/**
 * Gọi API cập nhật danh sách phim đặc biệt (đang chiếu, sắp chiếu)
 * @returns {Promise<boolean>}
 */
export const updateSpecialList = async () => {
  try {
    await apiClient.get('/movies/update-special-list');
    return true;
  } catch (error) {
    console.error('Failed to call update-special-list API:', error);
    return false;
  }
};
