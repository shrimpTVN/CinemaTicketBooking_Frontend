import { USE_MOCK } from './apiConfig';
import * as mockService from './eventMockService';
import * as apiService from './eventApiService';

/**
 * Lấy toàn bộ danh sách sự kiện
 */
export const getAllEvents = async () => {
  if (USE_MOCK) return mockService.getAllEvents();
  try {
    const res = await apiService.getAllEvents();
    if (Array.isArray(res)) {
      return res;
    }
  } catch (err) {
    console.error('getAllEvents service error, falling back to mock:', err);
  }
  return mockService.getAllEvents();
};

/**
 * Lấy thông tin chi tiết sự kiện theo ID
 */
export const getEventById = async (id) => {
  if (!id) return null;
  
  if (USE_MOCK) {
    const mockRes = await mockService.getEventById(id);
    if (mockRes) return mockRes;
  }

  try {
    const res = await apiService.getEventById(id);
    if (res && (res.id || res.title)) {
      return res;
    }
  } catch (err) {
    console.error(`getEventById (${id}) service error, attempting fallbacks:`, err);
  }

  // Fallback 1: Tìm trong mockService
  const mockRes = await mockService.getEventById(id);
  if (mockRes) return mockRes;

  // Fallback 2: Tìm trong toàn bộ danh sách (getAllEvents)
  try {
    const all = await getAllEvents();
    const found = all.find(e => String(e.id) === String(id));
    if (found) return found;
  } catch (err) {
    console.error('getEventById search fallback error:', err);
  }

  return null;
};

/**
 * Tạo mới sự kiện (Admin)
 */
export const createEvent = async (eventData) => {
  if (USE_MOCK) return mockService.createEvent(eventData);
  try {
    const res = await apiService.createEvent(eventData);
    if (res) return res;
  } catch (err) {
    console.error('createEvent service error, falling back to mock:', err);
  }
  return mockService.createEvent(eventData);
};

/**
 * Cập nhật thông tin sự kiện (Admin)
 */
export const updateEvent = async (id, eventData) => {
  if (USE_MOCK) return mockService.updateEvent(id, eventData);
  try {
    const res = await apiService.updateEvent(id, eventData);
    if (res) return res;
  } catch (err) {
    console.error(`updateEvent (${id}) service error, falling back to mock:`, err);
  }
  return mockService.updateEvent(id, eventData);
};

/**
 * Thay đổi trạng thái sự kiện (ACTIVE/INACTIVE) (Admin)
 */
export const updateEventStatus = async (id, status) => {
  if (USE_MOCK) return mockService.updateEventStatus(id, status);
  try {
    const res = await apiService.updateEventStatus(id, status);
    if (res) return res;
  } catch (err) {
    console.error(`updateEventStatus (${id}) service error, falling back to mock:`, err);
  }
  return mockService.updateEventStatus(id, status);
};
