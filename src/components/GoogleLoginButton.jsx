import { useEffect, useRef, useState, useCallback } from 'react';
import { googleLogin } from '../services/authService';
import { GOOGLE_CLIENT_ID } from '../services/apiConfig';

export default function GoogleLoginButton({ onSuccess, onError, text = 'Tiếp tục với Google', className = '' }) {
  const overlayRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleResponse = useCallback(async (response) => {
    if (!response?.credential) return;
    try {
      setLoading(true);
      console.log('>>> [GoogleAuth] Received ID Token from Google GIS, verifying with Backend...');
      const res = await googleLogin(response.credential);
      if (res?.user) {
        onSuccess?.(res.user);
      }
    } catch (err) {
      console.error('[GoogleLogin] Authentication error:', err);
      const msg = err.response?.data?.message || err.message || 'Đăng nhập Google thất bại!';
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError]);

  const initGoogleGIS = useCallback(() => {
    if (!window.google?.accounts?.id || !overlayRef.current) return false;
    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Clear previous buttons if any
      overlayRef.current.innerHTML = '';

      window.google.accounts.id.renderButton(overlayRef.current, {
        theme: 'outline',
        size: 'large',
        width: '380',
        text: 'continue_with',
        locale: 'vi',
      });
      return true;
    } catch (e) {
      console.warn('[GoogleLogin] Failed to init GIS:', e);
      return false;
    }
  }, [handleGoogleResponse]);

  useEffect(() => {
    let timer = null;
    if (!initGoogleGIS()) {
      timer = setInterval(() => {
        if (initGoogleGIS()) {
          clearInterval(timer);
        }
      }, 300);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [initGoogleGIS]);

  const handleCustomButtonClick = () => {
    if (!window.google?.accounts?.id) {
      onError?.('Đang kết nối dịch vụ Google, vui lòng thử lại sau giây lát!');
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });

      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // If prompt notification is blocked by browser, attempt to click native overlay button
          const buttonEl = overlayRef.current?.querySelector('div[role="button"]') || overlayRef.current?.querySelector('iframe');
          if (buttonEl) {
            buttonEl.click();
          }
        }
      });
    } catch (err) {
      console.warn('[GoogleLogin] Prompt error:', err);
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-lg select-none group">
      {/* Custom App Button Visuals */}
      <button
        type="button"
        disabled={loading}
        onClick={handleCustomButtonClick}
        className={`w-full bg-[#333333]/50 hover:bg-[#3f3f3f]/60 text-white py-2 sm:py-3 border border-zinc-700/40 rounded-lg text-xs sm:text-body2 font-medium flex items-center justify-center gap-2 sm:gap-3 cursor-pointer light-cast-google ${className}`}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69a5.74 5.74 0 0 1-2.48 3.77v3.13h4.01c2.34-2.16 3.69-5.32 3.69-8.75Z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-4.01-3.13c-1.12.75-2.54 1.19-3.95 1.19-3.05 0-5.63-2.06-6.55-4.83H1.31v3.23A12 12 0 0 0 12 24Z" />
              <path fill="#FBBC05" d="M5.45 14.32a7.14 7.14 0 0 1 0-4.64V6.45H1.31a12 12 0 0 0 0 11.1l4.14-3.23Z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43A11.96 11.96 0 0 0 12 0 12 12 0 0 0 1.31 6.45l4.14 3.23c.92-2.77 3.5-4.83 6.55-4.83Z" />
            </svg>
            <span>{text}</span>
          </>
        )}
      </button>

      {/* Invisible Native Google GIS Iframe Overlay */}
      <div
        ref={overlayRef}
        id="google-gis-overlay"
        className="absolute inset-0 opacity-0 overflow-hidden cursor-pointer pointer-events-auto z-10 flex items-center justify-center scale-125"
        style={{ opacity: 0.001 }}
      />
    </div>
  );
}
