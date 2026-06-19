import { create } from 'zustand';

export const useBookingStore = create((set) => ({
  // State mẫu theo yêu cầu
  selectedMovie: null,

  // Action cập nhật selectedMovie
  setSelectedMovie: (movie) => set({ selectedMovie: movie }),

  // Action reset store (nếu cần)
  resetBooking: () => set({ selectedMovie: null }),
}));
