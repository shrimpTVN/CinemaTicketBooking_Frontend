import apiClient from './apiClient';
import { USE_MOCK } from './apiConfig';

/**
 * Đăng nhập người dùng
 * @param {Object} credentials - Chứa email và password
 * @returns {Promise<Object>} Trả về { user, token }
 */
/**
 * Chuẩn hóa dữ liệu user từ Backend về đúng format Frontend sử dụng
 */
const normalizeUser = (user) => {
  if (!user) return null;
  return {
    id: user.id || null,
    fullName: user.name || '',
    email: user.email || '',
    birthday: user.doB || '',
    phoneNumber: user.phoneNumber || '',
    stars: user.point || 0,
    spending: user.spending || 0,
    avatar: user.avatar || '',
  };
};

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
        id: 99,
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
  const res = await apiClient.post('/auth/login', credentials);
  const data = res?.data || res;
  
  // Trả về định dạng đúng và một token tượng trưng (vì token thật nằm trong HttpOnly Cookie)
  return {
    user: normalizeUser(data.user),
    token: 'cookie-managed-token',
  };
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
        id: 99,
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
  // Map các trường của Frontend sang định dạng DTO của Backend
  const registerPayload = {
    name: userData.fullName,
    doB: userData.birthday,
    phoneNumber: userData.phoneNumber,
    email: userData.email,
    password: userData.password,
  };

  await apiClient.post('/auth/register', registerPayload);
  
  // Sau khi đăng ký thành công, tự động gọi hàm login để thiết lập cookie phiên làm việc
  return await login({
    email: userData.email,
    password: userData.password,
  });
};

/**
 * Đổi mật khẩu người dùng
 * @param {number} userId
 * @param {string} email
 * @param {string} oldPassword
 * @param {string} newPassword
 */
export const changePassword = async (userId, email, oldPassword, newPassword) => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return;
  }
  await apiClient.patch(`/users/${userId}/change-password`, {
    email,
    oldPassword,
    newPassword,
  });
};
