import apiClient from './apiClient';
import { USE_MOCK } from './apiConfig';

/**
 * Tải ảnh poster phim lên Cloudinary qua Backend API
 * @param {File} file 
 * @returns {Promise<string>} Trả về URL HTTPS của ảnh từ Cloudinary
 */
export const uploadMoviePoster = async (file) => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return URL.createObjectURL(file);
  }

  const formData = new FormData();
  formData.append('file', file);

  const res = await apiClient.post('/media/upload/movie-poster', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const data = res?.data || res;
  return data.url;
};

/**
 * Tải ảnh loại ghế lên Cloudinary qua Backend API
 * @param {File} file 
 * @returns {Promise<string>}
 */
export const uploadSeatTypeImage = async (file) => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return URL.createObjectURL(file);
  }

  const formData = new FormData();
  formData.append('file', file);

  const res = await apiClient.post('/media/upload/seat-type-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const data = res?.data || res;
  return data.url;
};

/**
 * Tải ảnh combo / sản phẩm lên Cloudinary qua Backend API
 * @param {File} file 
 * @returns {Promise<string>}
 */
export const uploadComboImage = async (file) => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return URL.createObjectURL(file);
  }

  const formData = new FormData();
  formData.append('file', file);

  const res = await apiClient.post('/media/upload/combo-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const data = res?.data || res;
  return data.url;
};

/**
 * Tải nhiều ảnh phòng chiếu lên Cloudinary qua Backend API
 * @param {FileList|Array<File>} files 
 * @returns {Promise<Array<string>>} Trả về mảng các URL HTTPS
 */
export const uploadHallImages = async (files) => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return Array.from(files).map(f => URL.createObjectURL(f));
  }

  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append('files', file);
  });

  const res = await apiClient.post('/media/upload/hall-images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res?.data || res || [];
};

/**
 * Tải ảnh sự kiện lên Cloudinary qua Backend API
 * @param {File} file 
 * @returns {Promise<string>}
 */
export const uploadEventPoster = async (file) => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return URL.createObjectURL(file);
  }

  const formData = new FormData();
  formData.append('file', file);

  const res = await apiClient.post('/media/upload/event-poster', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const data = res?.data || res;
  return data.url;
};

/**
 * Tải ảnh banner sự kiện lên Cloudinary qua Backend API
 * @param {File} file 
 * @returns {Promise<string>}
 */
export const uploadEventBanner = async (file) => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return URL.createObjectURL(file);
  }

  const formData = new FormData();
  formData.append('file', file);

  const res = await apiClient.post('/media/upload/event-banner', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const data = res?.data || res;
  return data.url;
};
