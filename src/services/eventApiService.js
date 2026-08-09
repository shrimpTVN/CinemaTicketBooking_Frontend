import apiClient from './apiClient';

/**
 * Get all events from Backend REST API
 */
export const getAllEvents = async () => {
  try {
    let res;
    try {
      res = await apiClient.get('/events');
    } catch {
      res = await apiClient.get('/events/');
    }
    const data = res?.data || res;
    return Array.isArray(data) ? data : (data?.content || []);
  } catch (error) {
    console.error('getAllEvents API error:', error);
    return [];
  }
};

/**
 * Get event by ID
 * @param {number|string} id
 */
export const getEventById = async (id) => {
  try {
    const res = await apiClient.get(`/events/${id}`);
    return res?.data || res;
  } catch (error) {
    console.error(`getEventById (${id}) API error:`, error);
    return null;
  }
};

/**
 * Create a new event
 * @param {Object} eventData - { title, description, poster, banner }
 */
export const createEvent = async (eventData) => {
  try {
    const res = await apiClient.post('/events', {
      title: eventData.title,
      description: eventData.description,
      poster: eventData.poster || '',
      banner: eventData.banner || eventData.poster || ''
    });
    return res?.data || res;
  } catch (error) {
    console.error('createEvent API error:', error);
    return null;
  }
};

/**
 * Update event details
 * @param {number|string} id
 * @param {Object} eventData - { title, description, poster, banner }
 */
export const updateEvent = async (id, eventData) => {
  try {
    const res = await apiClient.patch(`/events/${id}`, {
      title: eventData.title,
      description: eventData.description,
      poster: eventData.poster || '',
      banner: eventData.banner || eventData.poster || ''
    });
    return res?.data || res;
  } catch (error) {
    console.error(`updateEvent (${id}) API error:`, error);
    return null;
  }
};

/**
 * Update event status (ACTIVE / INACTIVE)
 * @param {number|string} id
 * @param {string} status
 */
export const updateEventStatus = async (id, status) => {
  try {
    const res = await apiClient.patch(`/events/${id}/change-status`, null, {
      params: { status }
    });
    return res?.data || res;
  } catch (error) {
    console.error(`updateEventStatus (${id}) API error:`, error);
    return null;
  }
};
