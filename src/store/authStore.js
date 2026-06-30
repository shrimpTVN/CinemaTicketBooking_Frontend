import { create } from 'zustand';
import { USE_MOCK } from '../services/apiConfig';

// Helper to get initial state from localStorage safely
const getInitialUser = () => {
  try {
    const saved = localStorage.getItem('user');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to parse user from localStorage', e);
  }
  
  // Default mock user only if not found AND we are in mock mode
  if (USE_MOCK) {
    return {
      fullName: 'Nguyễn Văn A',
      email: 'nguyenvana@gmail.com',
      birthday: '2000-01-01',
      phoneNumber: '0912345678',
      stars: 12,
      spending: 3500000,
      avatar: '',
    };
  }
  return null;
};

const getInitialToken = () => {
  const token = localStorage.getItem('token');
  if (token) return token;
  return USE_MOCK ? 'mock-jwt-token-xyz' : null;
};

export const useAuthStore = create((set) => ({
  user: getInitialUser(),
  token: getInitialToken(),
  
  login: (userData, tokenVal) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', tokenVal);
    set({ user: userData, token: tokenVal });
  },
  
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
  
  updateUser: (updatedData) => {
    set((state) => {
      const newUser = state.user ? { ...state.user, ...updatedData } : updatedData;
      localStorage.setItem('user', JSON.stringify(newUser));
      return { user: newUser };
    });
  }
}));
