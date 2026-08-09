import React from 'react';

/**
 * Global Shared Toast Notification Component for Cinema Ticket Booking App
 * Design: Dark glassmorphic card with bottom status glow bar, circular status icon,
 * contextual bold title, message, and close button (matching design system).
 */
export default function Toast({ toasts = [], onRemove, position = 'bottom-right' }) {
  if (!toasts || toasts.length === 0) return null;

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6 flex-col',
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2 flex-col items-center',
    'bottom-left': 'bottom-6 left-6 flex-col',
    'top-right': 'top-6 right-6 flex-col',
    'top-center': 'top-6 left-1/2 -translate-x-1/2 flex-col items-center',
  }[position] || 'bottom-6 right-6 flex-col';

  return (
    <div
      className={`fixed z-[99999] flex gap-3 pointer-events-none ${positionClasses}`}
      style={{ maxWidth: '420px', width: 'calc(100vw - 32px)' }}
    >
      {toasts.map((t) => {
        const type = t.type || 'info';

        // Styling configuration per toast type (Success, Error, Warning, Info)
        const config = {
          success: {
            bgGlow: 'bg-[#10b981]',
            shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.4)]',
            iconBg: 'bg-[#10b981]',
            defaultTitle: t.title || 'Saved Successfully',
            icon: (
              <svg className="w-4 h-4 text-zinc-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ),
          },
          error: {
            bgGlow: 'bg-[#ef4444]',
            shadow: 'shadow-[0_0_15px_rgba(239,68,68,0.4)]',
            iconBg: 'bg-[#ef4444]',
            defaultTitle: t.title || 'Error Occurred',
            icon: (
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ),
          },
          warning: {
            bgGlow: 'bg-[#f59e0b]',
            shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.4)]',
            iconBg: 'bg-[#f59e0b]',
            defaultTitle: t.title || 'Action Required',
            icon: (
              <svg className="w-4 h-4 text-zinc-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01" />
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" fill="none" />
              </svg>
            ),
          },
          info: {
            bgGlow: 'bg-[#38bdf8]',
            shadow: 'shadow-[0_0_15px_rgba(56,189,248,0.4)]',
            iconBg: 'bg-[#38bdf8]',
            defaultTitle: t.title || 'Notification',
            icon: (
              <svg className="w-4 h-4 text-zinc-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" fill="none" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 11v5M12 8h.01" />
              </svg>
            ),
          },
        }[type] || {};

        // Safely format message to string to prevent React rendering errors
        let displayMessage = '';
        if (typeof t.message === 'string') {
          displayMessage = t.message;
        } else if (t.message && typeof t.message === 'object') {
          displayMessage = t.message.errorMessage || t.message.message || 'Thao tác không thành công';
        }

        return (
          <div
            key={t.id}
            className="relative pointer-events-auto w-full bg-[#18181b]/95 backdrop-blur-md border border-zinc-800/90 rounded-xl p-4 shadow-2xl shadow-black/80 flex items-start gap-3.5 transition-all duration-300 animate-toast-slide-in overflow-hidden select-none"
          >
            {/* Circular Icon Badge */}
            <div className={`w-7 h-7 rounded-full ${config.iconBg} flex items-center justify-center shrink-0 mt-0.5 shadow-md`}>
              {config.icon}
            </div>

            {/* Contextual Text Content */}
            <div className="flex-1 min-w-0 pr-1">
              <h4 className="font-google-sans text-sm font-bold text-white tracking-tight leading-tight">
                {config.defaultTitle}
              </h4>
              {displayMessage && (
                <p className="font-google-sans text-xs text-zinc-300 font-normal leading-relaxed mt-1 break-words">
                  {displayMessage}
                </p>
              )}
            </div>

            {/* Close Button */}
            {onRemove && (
              <button
                onClick={() => onRemove(t.id)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                title="Đóng"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {/* Bottom Glow Accent Line */}
            <div className={`absolute bottom-0 left-0 right-0 h-[3px] ${config.bgGlow} ${config.shadow}`} />
          </div>
        );
      })}
    </div>
  );
}
