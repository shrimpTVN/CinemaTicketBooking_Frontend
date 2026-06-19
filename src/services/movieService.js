import moviesData from '../mocks/movies.json';

/**
 * Lấy danh sách phim đang chiếu (status: "now-showing")
 * @returns {Promise<Array>}
 */
export const getNowShowing = async () => {
  return new Promise((resolve) => {
    // Giả lập độ trễ mạng để dễ thay thế bằng axios sau này
    setTimeout(() => {
      const nowShowing = moviesData.filter(movie => movie.status === 'now-showing');
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
      const comingSoon = moviesData.filter(movie => movie.status === 'coming-soon');
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
      const movie = moviesData.find(m => m.id === Number(id));
      resolve(movie || null);
    }, 150);
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
      const related = moviesData.filter(m => 
        m.id !== movie.id && 
        m.genre?.some(g => movie.genre?.includes(g))
      ).slice(0, 3);
      if (related.length < 3) {
        const remaining = moviesData.filter(m => 
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
