import apiClient from './apiClient';
import { USE_MOCK } from './apiConfig';

/**
 * Đăng nhập người dùng
 * @param {Object} credentials - Chứa email và password
 * @returns {Promise<Object>} Trả về { user, token }
 */
export const login = async (credentials) => {
  if (USE_MOCK) {
    // Giả lập cuộc gọi API thành công sau 800ms
    await new Promise((resolve) => setTimeout(resolve, 800));

    const namePart = credentials.email.split('@')[0];
    const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    return {
      user: {
        fullName: displayName || 'Nguyễn Văn A',
        email: credentials.email,
        birthday: '2000-01-01',
        phoneNumber: '0912345678',
        stars: 15,
        spending: 4200000,
        avatar: '',
      },
      token: 'mock-jwt-token-xyz',
    };
  }

  // Kết nối API thật với Backend
  // Endpoint mặc định là POST /auth/login hoặc /login tùy thuộc vào Backend của bạn
  const res = await apiClient.post('/auth/login', credentials);
  
  // Trả về dữ liệu. Chú ý cấu trúc response từ backend của bạn.
  // Thông thường backend trả về { user: {...}, token: "..." } hoặc { data: { user, token } }
  // apiClient interceptor response trả về response.data trực tiếp, nên ta có:
  return res.data || res;
};

/**
 * Đăng ký tài khoản mới
 * @param {Object} userData - Chứa fullName, email, birthday, phoneNumber, password
 * @returns {Promise<Object>} Trả về { user, token }
 */
export const register = async (userData) => {
  if (USE_MOCK) {
    // Giả lập cuộc gọi API thành công sau 800ms
    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      user: {
        fullName: userData.fullName || 'Nguyễn Văn A',
        email: userData.email,
        birthday: userData.birthday || '2000-01-01',
        phoneNumber: userData.phoneNumber || '0912345678',
        stars: 0,
        spending: 0,
        avatar: '',
      },
      token: 'mock-jwt-token-xyz',
    };
  }

  // Kết nối API thật với Backend
  // Endpoint mặc định là POST /auth/register hoặc /register tùy thuộc vào Backend của bạn
  // Chúng ta gửi các thông tin người dùng đi, loại bỏ trường confirmPassword không cần thiết cho backend
  const { confirmPassword, ...registerPayload } = userData;
  const res = await apiClient.post('/auth/register', registerPayload);
  
  return res.data || res;
};
