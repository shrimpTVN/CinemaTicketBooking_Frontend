import moviesData from '../mocks/movies.json';

// In-memory store – initialized from JSON, persists for the session
let moviesStore = [...moviesData];
let nextId = Math.max(...moviesData.map(m => m.id)) + 1;

/**
 * Lấy toàn bộ danh sách phim (dùng cho admin)
 * @returns {Promise<Array>}
 */
export const getAllMovies = async () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...moviesStore]), 150);
  });
};

/**
 * Lấy danh sách phim đang chiếu (status: "now-showing")
 * @returns {Promise<Array>}
 */
export const getNowShowing = async () => {
  return new Promise((resolve) => {
    // Giả lập độ trễ mạng để dễ thay thế bằng axios sau này
    setTimeout(() => {
      const nowShowing = moviesStore.filter(movie => movie.status === 'now-showing');
      resolve(nowShowing);
    }, 200);
  });
};

/**
 * Lấy danh sách phim sắp chiếu (status: "coming-soon")
 * @returns {Promise<Array>}
 */
export const getComingSoon = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const comingSoon = moviesStore.filter(movie => movie.status === 'coming-soon');
      resolve(comingSoon);
    }, 200);
  });
};

/**
 * Lấy chi tiết một bộ phim bằng ID
 * @param {number|string} id 
 * @returns {Promise<Object|null>}
 */
export const getMovieById = async (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const movie = moviesStore.find(m => m.id === Number(id));
      resolve(movie || null);
    }, 150);
  });
};

/**
 * Tạo mới một bộ phim (admin)
 * @param {Object} movieData
 * @returns {Promise<Object>}
 */
export const createMovie = async (movieData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newMovie = { ...movieData, id: nextId++ };
      moviesStore = [newMovie, ...moviesStore];
      resolve(newMovie);
    }, 200);
  });
};

/**
 * Cập nhật thông tin một bộ phim (admin)
 * @param {number|string} id
 * @param {Object} movieData
 * @returns {Promise<Object|null>}
 */
export const updateMovie = async (id, movieData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const idx = moviesStore.findIndex(m => m.id === Number(id));
      if (idx === -1) return resolve(null);
      moviesStore[idx] = { ...moviesStore[idx], ...movieData, id: Number(id) };
      resolve({ ...moviesStore[idx] });
    }, 200);
  });
};

/**
 * Xóa một bộ phim (admin)
 * @param {number|string} id
 * @returns {Promise<boolean>}
 */
export const deleteMovie = async (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const before = moviesStore.length;
      moviesStore = moviesStore.filter(m => m.id !== Number(id));
      resolve(moviesStore.length < before);
    }, 200);
  });
};

/**
 * Lấy danh sách 3 phim liên quan (cùng thể loại)
 * @param {Object} movie 
 * @returns {Promise<Array>}
 */
export const getRelatedMovies = async (movie) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!movie) return resolve([]);
      const related = moviesStore.filter(m => 
        m.id !== movie.id && 
        m.genre?.some(g => movie.genre?.includes(g))
      ).slice(0, 3);
      if (related.length < 3) {
        const remaining = moviesStore.filter(m => 
          m.id !== movie.id && 
          !related.some(r => r.id === m.id)
        );
        resolve([...related, ...remaining].slice(0, 3));
      } else {
        resolve(related);
      }
    }, 150);
  });
};
