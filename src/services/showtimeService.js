import { USE_MOCK } from './apiConfig';
import * as mockService from './showtimeMockService';
import * as apiService from './showtimeApiService';

export const getAllShowtimes = async () => {
  return USE_MOCK ? mockService.getAllShowtimes() : apiService.getAllShowtimes();
};

export const filterShowtimes = async (filters = {}) => {
  return USE_MOCK ? mockService.filterShowtimes(filters) : apiService.filterShowtimes(filters);
};

export const getShowtimeById = async (id) => {
  return USE_MOCK ? mockService.getShowtimeById(id) : apiService.getShowtimeById(id);
};

export const createShowtime = async (showtimeData) => {
  return USE_MOCK ? mockService.createShowtime(showtimeData) : apiService.createShowtime(showtimeData);
};

export const updateShowtime = async (id, showtimeData) => {
  return USE_MOCK ? mockService.updateShowtime(id, showtimeData) : apiService.updateShowtime(id, showtimeData);
};
