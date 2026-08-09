/**
 * Chống hiện tượng từ mồ côi (Orphan word / Single word on last line)
 * Hàm này tự động thay thế khoảng trắng giữa 2 từ cuối cùng bằng Non-Breaking Space (\u00A0),
 * ép 2 từ cuối luôn dính liền với nhau khi xuống dòng.
 *
 * @param {string} text - Chuỗi văn bản nhập vào
 * @returns {string} - Chuỗi văn bản đã được gắn dính 2 từ cuối
 */
export const preventOrphan = (text) => {
  if (!text || typeof text !== 'string') return '';
  const trimmed = text.trim();
  if (!trimmed.includes(' ')) return trimmed;
  return trimmed.replace(/\s+([^\s]+)$/, '\u00A0$1');
};
