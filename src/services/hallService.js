import { USE_MOCK } from './apiConfig';
import * as mockService from './hallMockService';
import * as apiService from './hallApiService';

export const getAllHalls = async () => {
  return USE_MOCK ? mockService.getAllHalls() : apiService.getAllHalls();
};

export const getHallById = async (id) => {
  return USE_MOCK ? mockService.getHallById(id) : apiService.getHallById(id);
};

export const createHall = async (hallData) => {
  return USE_MOCK ? mockService.createHall(hallData) : apiService.createHall(hallData);
};

export const updateHall = async (id, hallData) => {
  return USE_MOCK ? mockService.updateHall(id, hallData) : apiService.updateHall(id, hallData);
};

export const getAllHallTypes = async () => {
  return USE_MOCK ? mockService.getAllHallTypes() : apiService.getAllHallTypes();
};

export const getAllSeatTypes = async () => {
  return USE_MOCK ? mockService.getAllSeatTypes() : apiService.getAllSeatTypes();
};

export const getHallSeatMap = async (id) => {
  return USE_MOCK ? mockService.getHallSeatMap(id) : apiService.getHallSeatMap(id);
};

export const updateHallSeatMap = async (id, seatList) => {
  return USE_MOCK ? mockService.updateHallSeatMap(id, seatList) : apiService.updateHallSeatMap(id, seatList);
};

export const generateHallSeatMap = async (id, seatList) => {
  return USE_MOCK ? mockService.generateHallSeatMap(id, seatList) : apiService.generateHallSeatMap(id, seatList);
};

export const createHallType = async (hallTypeData) => {
  return USE_MOCK ? mockService.createHallType(hallTypeData) : apiService.createHallType(hallTypeData);
};

export const updateHallType = async (id, hallTypeData) => {
  return USE_MOCK ? mockService.updateHallType(id, hallTypeData) : apiService.updateHallType(id, hallTypeData);
};
