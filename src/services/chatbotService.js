import apiClient from './apiClient';
import { USE_MOCK } from './apiConfig';

/**
 * Gửi tin nhắn tới AI Chatbot
 * @param {string} message - Nội dung câu hỏi từ người dùng
 * @param {string} conversationId - ID phiên làm việc
 * @returns {Promise<{reply: string, conversationId: string}>}
 */
export const sendChatMessage = async (message, conversationId) => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      reply: `[MOCK AI] Xin chào! Tôi đã nhận được câu hỏi: "${message}". Hiện tại ứng dụng đang ở chế độ MOCK DATA. Để kết nối AI Chatbot thật, hãy chuyển sang chế độ REAL API!`,
      conversationId: conversationId || 'mock_session_123',
    };
  }

  const res = await apiClient.post('/chatbot/chat', {
    message,
    conversationId,
  });

  return res?.data || res;
};

/**
 * Xóa lịch sử chat phiên làm việc hiện tại
 * @param {string} conversationId 
 */
export const clearChatHistory = async (conversationId) => {
  if (USE_MOCK || !conversationId) return;
  try {
    await apiClient.delete(`/chatbot/chat/${conversationId}`);
  } catch (err) {
    console.error('Failed to clear chat history:', err);
  }
};
