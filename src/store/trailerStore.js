import { create } from 'zustand';

export const useTrailerStore = create((set) => ({
  isOpen: false,
  trailerUrl: '',
  openTrailer: (url) => set({ isOpen: true, trailerUrl: url }),
  closeTrailer: () => set({ isOpen: false, trailerUrl: '' }),
}));
