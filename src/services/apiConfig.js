/**
 * API Configuration helper
 * Handles toggling between Mock data and real API using environment variables & localStorage.
 */

// 1. Get mock preference from localStorage or fallback to environment variable
const getUseMockPreference = () => {
  const localStorageVal = localStorage.getItem('VITE_USE_MOCK_DATA');
  if (localStorageVal !== null) {
    return localStorageVal === 'true';
  }
  
  // Default to true if not specified in .env to prevent breaking when backend is down
  const envVal = import.meta.env.VITE_USE_MOCK_DATA;
  return envVal !== 'false';
};

export const USE_MOCK = getUseMockPreference();

// 2. Resolve API URL
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/**
 * Toggle between Mock and API mode dynamically in the browser console.
 * @param {boolean} useMock 
 */
export const toggleMockData = (useMock) => {
  localStorage.setItem('VITE_USE_MOCK_DATA', String(useMock));
  console.log(`[API Config] Switched USE_MOCK_DATA to: ${useMock}. Reloading page...`);
  window.location.reload();
};

// Auto-register helper to window object in dev mode for easy console access
if (import.meta.env.DEV) {
  window.toggleMockData = toggleMockData;
  console.log(
    `%c[shrimpTVN Debug] Current Mode: ${USE_MOCK ? 'MOCK DATA ⚠️' : 'REAL API 🌐'}%c\nRun %cwindow.toggleMockData(false)%c to switch to Real API\nRun %cwindow.toggleMockData(true)%c to switch to Mock Data`,
    'color: #eab308; font-weight: bold; font-size: 1.1em;',
    'color: inherit;',
    'background: #1e293b; color: #38bdf8; padding: 2px 5px; border-radius: 3px;',
    'color: inherit;',
    'background: #1e293b; color: #f59e0b; padding: 2px 5px; border-radius: 3px;',
    'color: inherit;'
  );
}
