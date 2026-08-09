import apiClient from './apiClient';
import { USE_MOCK } from './apiConfig';

/**
 * Fetch all comment ratings for a specific movie ID
 */
export const getCommentRatingsByMovieId = async (movieId) => {
  if (USE_MOCK) {
    return [
      {
        id: 1,
        username: "Trần Anh Vũ",
        date: "18/06/2026",
        rating: 5,
        comment: "Phim thực sự rất tuyệt vời! Kịch bản xuất sắc, lời thoại ý nghĩa và hình ảnh được trau chuốt từng khung hình."
      },
      {
        id: 2,
        username: "Lê Minh Hương",
        date: "18/06/2026",
        rating: 4,
        comment: "Diễn xuất đỉnh cao của dàn cast gánh phim cực tốt. Nhạc phim cảm xúc, tuy nhiên đoạn kết hơi vội vàng."
      },
      {
        id: 3,
        username: "Nguyễn Công Danh",
        date: "17/06/2026",
        rating: 5,
        comment: "Rất lâu rồi mới xem một tác phẩm Việt Nam chỉn chu thế này. Xứng đáng đồng tiền bát gạo ra rạp!"
      }
    ];
  }

  try {
    const res = await apiClient.get(`/comment-ratings/movies/${movieId}`);
    const data = Array.isArray(res) ? res : (res?.data || []);
    return data.map((item) => {
      // Backend DTO mapping: rating & comment fields might be swapped in record
      const commentText = typeof item.rating === 'string' 
        ? item.rating 
        : (typeof item.comment === 'string' ? item.comment : '');
      const starRating = typeof item.comment === 'number' 
        ? item.comment 
        : (typeof item.rating === 'number' ? item.rating : 5);
      const createdAt = item.createdAt 
        ? new Date(item.createdAt).toLocaleDateString('vi-VN') 
        : new Date().toLocaleDateString('vi-VN');

      return {
        id: item.id,
        userId: item.userId,
        username: item.userName || 'Người dùng',
        date: createdAt,
        rating: Math.round(starRating),
        comment: commentText
      };
    });
  } catch (err) {
    console.error(`Failed to fetch comment ratings for movie ${movieId}:`, err);
    return [];
  }
};

/**
 * Submit a new comment rating to backend
 */
export const createCommentRating = async ({ movieId, userId, rating, comment }) => {
  if (USE_MOCK) {
    return {
      id: Date.now(),
      userId,
      username: 'Bạn',
      date: new Date().toLocaleDateString('vi-VN'),
      rating,
      comment
    };
  }

  const payload = {
    movieId: Number(movieId),
    userId: Number(userId),
    rating: parseFloat(rating),
    comment: comment.trim()
  };

  const res = await apiClient.post('/comment-ratings', payload);
  const data = res?.data || res;

  const commentText = typeof data.rating === 'string' 
    ? data.rating 
    : (typeof data.comment === 'string' ? data.comment : comment);
  const starRating = typeof data.comment === 'number' 
    ? data.comment 
    : (typeof data.rating === 'number' ? data.rating : rating);
  const createdAt = data.createdAt 
    ? new Date(data.createdAt).toLocaleDateString('vi-VN') 
    : new Date().toLocaleDateString('vi-VN');

  return {
    id: data.id || Date.now(),
    userId: data.userId || userId,
    username: data.userName || 'Bạn',
    date: createdAt,
    rating: Math.round(starRating),
    comment: commentText
  };
};

/**
 * Update an existing comment rating
 */
export const updateCommentRating = async (id, { movieId, userId, rating, comment }) => {
  if (USE_MOCK) {
    return {
      id,
      userId,
      username: 'Bạn',
      date: new Date().toLocaleDateString('vi-VN'),
      rating,
      comment
    };
  }

  const payload = {
    movieId: Number(movieId),
    userId: Number(userId),
    rating: parseFloat(rating),
    comment: comment.trim()
  };

  const res = await apiClient.patch(`/comment-ratings/${id}`, payload);
  const data = res?.data || res;

  const commentText = typeof data.rating === 'string' 
    ? data.rating 
    : (typeof data.comment === 'string' ? data.comment : comment);
  const starRating = typeof data.comment === 'number' 
    ? data.comment 
    : (typeof data.rating === 'number' ? data.rating : rating);
  const createdAt = data.createdAt 
    ? new Date(data.createdAt).toLocaleDateString('vi-VN') 
    : new Date().toLocaleDateString('vi-VN');

  return {
    id: data.id || id,
    userId: data.userId || userId,
    username: data.userName || 'Bạn',
    date: createdAt,
    rating: Math.round(starRating),
    comment: commentText
  };
};
