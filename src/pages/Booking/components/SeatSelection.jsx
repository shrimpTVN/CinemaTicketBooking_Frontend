import React, { useEffect, useMemo, useState, useRef, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';
import { Minus, Plus } from 'lucide-react';
import { useBookingStore } from '../../../store/bookingStore';
import { fmtVND } from '../bookingUtils';

function SeatToast({ toasts }) {
  return (
    <div className="fixed bottom-6 left-1/2 z-[9999] flex flex-col gap-2 pointer-events-none" style={{ transform: 'translateX(-50%)', minWidth: 320, maxWidth: 480 }}>
      {toasts.map(t => (
        <div
          key={t.id}
          className="flex items-start gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium"
          style={{
            background: t.type === 'error' ? 'rgba(207,15,71,0.95)' : 'rgba(202,138,4,0.95)',
            color: '#fff',
            backdropFilter: 'blur(10px)',
            border: t.type === 'error' ? '1px solid rgba(255,100,100,0.3)' : '1px solid rgba(255,220,50,0.3)',
            animation: 'slide-up-toast 0.3s ease-out forwards',
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1.4 }}>{t.type === 'error' ? '🚫' : '⚠️'}</span>
          <span style={{ lineHeight: 1.5 }}>{t.message}</span>
        </div>
      ))}
      <style>{`
        @keyframes slide-up-toast {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const CustomDropdown = memo(function CustomDropdown({ value, max, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const wrapperRef = useRef(null);
  const popoverRef = useRef(null);

  useEffect(() => { setLocalValue(value); }, [value]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    function handleOutside(e) {
      const inWrapper = wrapperRef.current?.contains(e.target);
      const inPopover = popoverRef.current?.contains(e.target);
      if (!inWrapper && !inPopover) {
        commitValue(localValue);
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [isOpen, localValue]);

  const commitValue = useCallback((val) => {
    onChange(val);
    setLocalValue(val);
  }, [onChange]);

  const sliderPanel = (
    <div
      ref={popoverRef}
      className={
        isMobile
          ? 'fixed left-1/2 top-1/2 w-[calc(100vw-32px)] max-w-[300px] rounded-2xl border border-white/10 shadow-2xl z-[99999] p-5 flex flex-col gap-4'
          : 'absolute right-0 mt-2 w-60 rounded-2xl border border-white/10 shadow-2xl z-[9999] p-4 flex flex-col gap-3'
      }
      style={{
        backgroundColor: '#18181b',
        animation: isMobile ? 'fadeInDDMobile 0.15s ease-out forwards' : 'fadeInDDDesktop 0.15s ease-out forwards',
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider">
          Số lượng: <span className="text-[#CF0F47]">{localValue} vé</span>
        </span>
        {isMobile && (
          <button
            onClick={() => { commitValue(localValue); setIsOpen(false); }}
            className="text-[10px] text-zinc-400 hover:text-white font-bold px-3 py-1 rounded-lg border border-white/10 active:bg-zinc-700/60 transition-colors"
            style={{ touchAction: 'manipulation' }}
          >
            Xong
          </button>
        )}
      </div>

      <div className="px-1 pt-1 pb-0">
        <input
          type="range"
          min="0"
          max={max}
          value={localValue}
          onChange={e => setLocalValue(parseInt(e.target.value, 10))}
          onPointerUp={e => commitValue(parseInt(e.target.value, 10))}
          onMouseUp={e => commitValue(parseInt(e.target.value, 10))}
          onTouchEnd={e => commitValue(parseInt(e.currentTarget.value, 10))}
          className="custom-ticket-range"
          style={{ touchAction: 'pan-x' }}
        />

        <div
          className="flex justify-between mt-2.5 text-[9px] font-black text-zinc-500 select-none"
          style={{ paddingLeft: 14, paddingRight: 14 }}
        >
          {Array.from({ length: max + 1 }, (_, v) => (
            <span
              key={v}
              onClick={() => { commitValue(v); setIsOpen(false); }}
              className={`cursor-pointer transition-colors duration-75 ${
                localValue === v ? 'text-[#CF0F47] font-bold scale-110' : 'hover:text-zinc-300 active:text-white'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              {v}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative inline-block" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => { setLocalValue(value); setIsOpen(o => !o); }}
        className="w-20 bg-zinc-950/60 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl border border-white/8 hover:border-[#CF0F47]/50 focus:outline-none focus:border-[#CF0F47] transition-colors flex items-center justify-between cursor-pointer select-none"
        style={{ boxShadow: isOpen ? '0 0 0 1px #CF0F47' : 'none', touchAction: 'manipulation' }}
      >
        <span>{value} vé</span>
        <svg
          className={`w-3 h-3 text-zinc-400 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isOpen && (
        isMobile
          ? createPortal(
              <>
                <div
                  className="fixed inset-0 bg-black/60 z-[99998]"
                  style={{ animation: 'fadeInBackdrop 0.15s ease-out forwards' }}
                  onClick={() => { commitValue(localValue); setIsOpen(false); }}
                />
                {sliderPanel}
              </>,
              document.body
            )
          : sliderPanel
      )}

      <style>{`
        input.custom-ticket-range[type=range] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
          width: 100%;
          touch-action: pan-x;
        }
        input.custom-ticket-range[type=range]:focus { outline: none; }
        input.custom-ticket-range[type=range]::-webkit-slider-runnable-track {
          background: rgba(255,255,255,0.1);
          height: 6px;
          border-radius: 9999px;
        }
        input.custom-ticket-range[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 36px;
          height: 44px;
          background-color: transparent;
          background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 16'%3E%3Cdefs%3E%3ClinearGradient id='tg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23EF4444'/%3E%3Cstop offset='100%25' stop-color='%23991B1B'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M3 0a3 3 0 0 0-3 3v2a2 2 0 0 1 0 4v2a3 3 0 0 0 3 3h26a3 3 0 0 0 3-3V9a2 2 0 0 1 0-4V3a3 3 0 0 0-3-3H3Z' fill='url(%23tg)'/%3E%3Cpath d='M4 2h24v12H4V2Z' fill='none' stroke='%23FFF' stroke-opacity='.3' stroke-width='.8' stroke-dasharray='2 1.5'/%3E%3Cline x1='8' y1='2' x2='8' y2='14' stroke='%23FFF' stroke-opacity='.4' stroke-width='.8' stroke-dasharray='1.5 1.5'/%3E%3Cpath d='M20 5.5l.8 1.6 1.8.3-1.3 1.3.3 1.8-1.6-.8-1.6.8.3-1.8-1.3-1.3 1.8-.3z' fill='%23FFF' fill-opacity='.8'/%3E%3C/svg%3E");
          background-position: center;
          background-repeat: no-repeat;
          background-size: 36px 18px;
          cursor: ew-resize;
          border: none;
          filter: drop-shadow(0 0 4px rgba(207,15,71,0.5));
          margin-top: -19px;
        }
        input.custom-ticket-range[type=range]::-webkit-slider-thumb:active {
          filter: drop-shadow(0 0 8px rgba(207,15,71,0.8));
        }
        input.custom-ticket-range[type=range]::-moz-range-track {
          background: rgba(255,255,255,0.1);
          height: 6px;
          border-radius: 9999px;
        }
        input.custom-ticket-range[type=range]::-moz-range-thumb {
          width: 36px;
          height: 44px;
          background-color: transparent;
          background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 16'%3E%3Cdefs%3E%3ClinearGradient id='tg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23EF4444'/%3E%3Cstop offset='100%25' stop-color='%23991B1B'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M3 0a3 3 0 0 0-3 3v2a2 2 0 0 1 0 4v2a3 3 0 0 0 3 3h26a3 3 0 0 0 3-3V9a2 2 0 0 1 0-4V3a3 3 0 0 0-3-3H3Z' fill='url(%23tg)'/%3E%3Cpath d='M4 2h24v12H4V2Z' fill='none' stroke='%23FFF' stroke-opacity='.3' stroke-width='.8' stroke-dasharray='2 1.5'/%3E%3Cline x1='8' y1='2' x2='8' y2='14' stroke='%23FFF' stroke-opacity='.4' stroke-width='.8' stroke-dasharray='1.5 1.5'/%3E%3Cpath d='M20 5.5l.8 1.6 1.8.3-1.3 1.3.3 1.8-1.6-.8-1.6.8.3-1.8-1.3-1.3 1.8-.3z' fill='%23FFF' fill-opacity='.8'/%3E%3C/svg%3E");
          background-position: center;
          background-repeat: no-repeat;
          background-size: 36px 18px;
          cursor: ew-resize;
          border: none;
          filter: drop-shadow(0 0 4px rgba(207,15,71,0.5));
        }

        @keyframes fadeInBackdrop {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes fadeInDDMobile {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes fadeInDDDesktop {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
});


const SeatCell = memo(function SeatCell({ seat, selected, onToggle, displayNumber, zoom = 1.0 }) {
  if (!seat) return null;
  const { id, row, col, type, status, price } = seat;

  const sizePx = Math.round(28 * zoom);
  const fontSizePx = Math.round(10 * zoom);
  const iconSizePx = Math.round(14 * zoom);

  const baseStyle = {
    width: `${sizePx}px`,
    height: `${sizePx}px`,
    fontSize: `${fontSizePx}px`,
    touchAction: 'manipulation',
  };

  if (status === 'booked') {
    return (
      <div className="relative group">
        <button
          disabled
          title={`Ghế ${id} đã được bán`}
          className="rounded flex items-center justify-center bg-[#1C1C1C] border border-[#2D2D2D] text-zinc-700 cursor-not-allowed select-none"
          style={baseStyle}
        >
          <svg style={{ width: `${iconSizePx}px`, height: `${iconSizePx}px` }} fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
          </svg>
        </button>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden md:group-hover:block bg-zinc-950/95 text-[10px] text-white px-2.5 py-1 rounded-md shadow-xl whitespace-nowrap border border-white/10 pointer-events-none z-50">
          Ghế {id} - Đã bán
        </div>
      </div>
    );
  }

  if (status === 'held') {
    return (
      <div className="relative group">
        <button
          disabled
          title={`Ghế ${id} đang được người khác giữ tạm`}
          className="rounded flex items-center justify-center bg-[#F59E0B]/20 border border-[#F59E0B]/40 text-[#F59E0B] cursor-not-allowed select-none animate-pulse"
          style={baseStyle}
        >
          <svg style={{ width: `${iconSizePx}px`, height: `${iconSizePx}px` }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden md:group-hover:block bg-zinc-950/95 text-[10px] text-white px-2.5 py-1 rounded-md shadow-xl whitespace-nowrap border border-white/10 pointer-events-none z-50">
          Ghế {id} - Đang giữ tạm
        </div>
      </div>
    );
  }

  // Use CSS marker classes: seat-avail on all available buttons,
  // seat-sel on selected buttons. The .seats-maxed container class
  // applies disabled styling via CSS without any React re-render.
  let btnClasses = "seat-avail rounded flex items-center justify-center font-bold border transition-colors duration-100 select-none ";
  if (selected) {
    btnClasses += "seat-sel bg-[#0EA1CF] border-[#0EA1CF] text-zinc-950 active:opacity-80 cursor-pointer";
  } else {
    if (type === 'vip') {
      btnClasses += "bg-amber-500/5 border-2 border-amber-500/35 text-amber-400 hover:bg-amber-500/15 active:bg-amber-500/25 cursor-pointer";
    } else {
      btnClasses += "bg-zinc-800/40 border border-zinc-700/60 text-zinc-300 hover:bg-zinc-700/60 active:bg-zinc-600/60 cursor-pointer";
    }
  }

  return (
    <div className="relative group">
      <button
        onClick={() => onToggle(row, col)}
        className={btnClasses}
        style={baseStyle}
      >
        {displayNumber}
      </button>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden md:group-hover:block bg-zinc-950/95 text-[10px] text-white px-2.5 py-1 rounded-md shadow-xl whitespace-nowrap border border-white/10 pointer-events-none z-50">
        Ghế {id} - {type === 'vip' ? 'VIP' : 'Thường'} - {fmtVND(price)}
      </div>
    </div>
  );
});

const CoupleSeatCell = memo(function CoupleSeatCell({
  row,
  leftCol,
  rightCol,
  seatL,
  seatR,
  selected,
  disabled,
  onToggle,
  displayNumberL,
  displayNumberR,
  seatSizePx,
  fontSizePx,
  iconSizePx,
  gapPx,
}) {
  if (!seatL || !seatR) return null;

  const idL = `${row}${leftCol}`;
  const idR = `${row}${rightCol}`;

  // Single wide button spanning exactly 2 seat-widths + 1 inter-seat gap
  const btnWidth = 2 * seatSizePx + gapPx;
  const btnStyle = {
    width: `${btnWidth}px`,
    height: `${seatSizePx}px`,
    fontSize: `${fontSizePx}px`,
    touchAction: 'manipulation',
  };

  const eitherSold = seatL.status === 'booked' || seatR.status === 'booked';
  const eitherHeld = seatL.status === 'held' || seatR.status === 'held';

  if (eitherSold) {
    return (
      <button
        disabled
        style={btnStyle}
        title={`Ghế đôi ${idL}-${idR} - Đã bán`}
        className="rounded flex items-center justify-center bg-[#1C1C1C] border border-[#2D2D2D] text-zinc-700 cursor-not-allowed select-none"
      >
        <svg style={{ width: `${iconSizePx}px`, height: `${iconSizePx}px` }} fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
        </svg>
      </button>
    );
  }

  if (eitherHeld) {
    return (
      <button
        disabled
        style={btnStyle}
        title={`Ghế đôi ${idL}-${idR} - Đang giữ tạm`}
        className="rounded flex items-center justify-center bg-[#F59E0B]/20 border border-[#F59E0B]/40 text-[#F59E0B] cursor-not-allowed select-none animate-pulse"
      >
        <svg style={{ width: `${iconSizePx}px`, height: `${iconSizePx}px` }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    );
  }

  let btnClass = "rounded flex items-center justify-around font-bold border transition-colors duration-100 select-none ";
  if (selected) {
    btnClass += "bg-[#0EA1CF] border-[#0EA1CF] text-zinc-950 active:opacity-80 cursor-pointer";
  } else if (disabled) {
    btnClass += "bg-zinc-800/20 border-zinc-900/40 text-zinc-500 opacity-30 cursor-not-allowed";
  } else {
    btnClass += "bg-[#CF0F47]/5 border border-[#CF0F47]/30 text-[#CF0F47] hover:bg-[#CF0F47]/15 active:bg-[#CF0F47]/25 cursor-pointer";
  }

  return (
    <button
      disabled={disabled}
      onClick={() => onToggle(row, leftCol)}
      className={btnClass}
      style={btnStyle}
      title={`Ghế đôi ${idL}-${idR}`}
    >
      <span>{displayNumberL}</span>
      <span>{displayNumberR}</span>
    </button>
  );
});

export default function SeatSelection({ booking, setBooking, pushToast, toasts }) {
  const {
    layout,
    selectedSeats,
    toggleSeat,
    simulateRealtimeSync,
    roomConfig,
    ticketCount,
    setTicketCount,
    audienceSelection,
    setAudienceSelection,
  } = useBookingStore();

  const [zoom, setZoom] = useState(1.0);
  const hasAutoZoomedRef = useRef(false);

  useEffect(() => {
    const cleanup = simulateRealtimeSync();
    return () => {
      if (cleanup) cleanup();
    };
  }, [simulateRealtimeSync]);

  const selectedIds = useMemo(() => new Set(selectedSeats.map((s) => s.id)), [selectedSeats]);
  const isMaxReached = selectedSeats.length >= ticketCount;

  // Calculate max cols
  const maxColsInLayout = useMemo(() => {
    let max = 0;
    roomConfig.rows.forEach((row) => {
      const cols = roomConfig.layout[row]?.cols ?? [];
      if (cols.length > 0 && cols[0] > max) {
        max = cols[0];
      }
    });
    return max;
  }, [roomConfig]);

  // Auto-zoom to fit mobile screen width on load
  useEffect(() => {
    if (maxColsInLayout > 0 && !hasAutoZoomedRef.current) {
      if (window.innerWidth < 768) {
        // approximate width of the seat block: columns * 32px (seat+gap) + row labels + padding
        const approximateSeatBlockWidth = maxColsInLayout * 32 + 70;
        const containerWidth = window.innerWidth - 32;
        if (approximateSeatBlockWidth > containerWidth) {
          const ratio = Math.max(0.55, Math.min(1.0, containerWidth / approximateSeatBlockWidth));
          // Round to nearest 0.05
          setZoom(Math.round(ratio * 20) / 20);
        }
      }
      hasAutoZoomedRef.current = true;
    }
  }, [maxColsInLayout]);

  const ALL_COLS = useMemo(() => {
    return Array.from({ length: maxColsInLayout }, (_, i) => maxColsInLayout - i);
  }, [maxColsInLayout]);

  const seatDisplayNumbers = useMemo(() => {
    const mapping = {};
    roomConfig.rows.forEach((row) => {
      const rowLayout = roomConfig.layout[row];
      if (!rowLayout) return;

      const cols = rowLayout.cols;
      const sortedCols = [...cols].sort((a, b) => a - b);

      mapping[row] = {};
      let counter = 1;
      sortedCols.forEach((col) => {
        mapping[row][col] = counter++;
      });
    });
    return mapping;
  }, [roomConfig]);

  const couplePairsByRow = useMemo(() => {
    const pairs = {};
    roomConfig.rows.forEach((row) => {
      const rowLayout = roomConfig.layout[row];
      if (!rowLayout || rowLayout.type !== 'couple') return;

      const cols = rowLayout.cols;
      const sortedCols = [...cols].sort((a, b) => a - b);

      pairs[row] = [];
      for (let i = 0; i < sortedCols.length; i += 2) {
        const c1 = sortedCols[i];
        const c2 = sortedCols[i + 1];
        if (c1 !== undefined && c2 !== undefined) {
          pairs[row].push([c2, c1]); // Left is larger (c2), Right is smaller (c1)
        }
      }
    });
    return pairs;
  }, [roomConfig]);

  // Sync component booking state when selectedSeats changes
  useEffect(() => {
    setBooking((b) => ({ ...b, seats: selectedSeats }));
  }, [selectedSeats, setBooking]);

  // Stable toggle handler to keep SeatCell/CoupleSeatCell memo references unchanged
  const handleToggle = useCallback((row, col) => {
    toggleSeat(row, col, pushToast);
  }, [toggleSeat, pushToast]);

  // Dynamic values based on zoom level
  const rowLabelWidthPx = Math.round(20 * zoom);
  const rowLabelFontSizePx = Math.round(11 * zoom);
  const aisleWidthPx = Math.round(16 * zoom);
  const gapPx = Math.max(2, Math.round(4 * zoom));
  const rowGapPx = Math.max(4, Math.round(8 * zoom));

  const seatSizePx = Math.round(28 * zoom);
  const fontSizePx = Math.round(10 * zoom);
  const iconSizePx = Math.round(14 * zoom);

  const seatBlockWidth = maxColsInLayout * (28 + 4) * zoom + (rowLabelWidthPx * 2) + 40;

  return (
    <>
      <div className="rounded-2xl border border-white/8 overflow-hidden flex flex-col gap-0" style={{ background: '#1A1A1A' }}>
        {/* Room Header */}
        <div className="px-5 py-3 border-b border-white/6 flex flex-wrap items-center justify-between gap-3" style={{ background: '#1A1A1A' }}>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#CF0F47]" />
            <h3 className="text-white font-bold text-sm uppercase tracking-wider">
              {roomConfig.name || 'Phòng Chiếu'}
            </h3>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-zinc-950/60 p-0.5 rounded-lg border border-white/8">
              <button
                type="button"
                onClick={() => setZoom(z => Math.max(z - 0.1, 0.55))}
                className="w-6 h-6 rounded-md flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer animate-none"
                title="Thu nhỏ sơ đồ ghế"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] text-zinc-300 font-bold px-1 min-w-[32px] text-center select-none">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom(z => Math.min(z + 0.1, 1.35))}
                className="w-6 h-6 rounded-md flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer animate-none"
                title="Phóng to sơ đồ ghế"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <span className="text-[11px] text-zinc-400 font-semibold bg-zinc-800 px-2.5 py-1 rounded-md border border-zinc-700/50">
              Đã chọn: {selectedSeats.length}/{ticketCount} ghế
            </span>
          </div>
        </div>

        {/* Seat Selection Grid */}
        <div className="w-full pt-6 pb-6 text-center flex flex-col items-center" style={{ background: '#0F0F0F' }}>
          {/* Audience selection panel - Horizontal Row */}
          <div className="mb-6 w-[calc(100%-2.5rem)] max-w-4xl bg-zinc-900/60 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/8 shadow-xl shadow-black/20 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-30">
            {/* Header Title */}
            <div className="text-left">
              <span className="text-zinc-400 text-[10px] font-extrabold uppercase tracking-wider block">Chọn loại vé &amp; Số lượng</span>
              <span className="text-zinc-500 text-[9px] block mt-0.5">
                Tối đa 8 người | Tổng: <span className="text-[#CF0F47] font-bold">{ticketCount} vé</span>
              </span>
            </div>

            {/* Inline ticket types selector */}
            <div className="flex flex-wrap items-center gap-4 flex-1 md:justify-end">
              {Object.keys(audienceSelection).map((audType) => {
                const audCount = audienceSelection[audType] || 0;
                const desc = audType === 'Người lớn' ? 'Khách từ 18 tuổi' : audType === 'U22' ? 'Khách từ 6-22 tuổi' : 'Trẻ em từ 3-5 tuổi';
                const maxForThisType = 8 - (ticketCount - audCount);

                return (
                  <div key={audType} className="flex flex-col sm:flex-row sm:items-center gap-2 bg-zinc-950/20 px-3 py-1.5 rounded-xl border border-white/4">
                    <div className="text-left pr-1">
                      <span className="text-white text-xs font-bold block leading-tight">{audType}</span>
                      <span className="text-[9px] text-zinc-500 block leading-normal">{desc}</span>
                    </div>

                    <CustomDropdown
                      value={audCount}
                      max={maxForThisType}
                      onChange={(val) => {
                        const nextSelection = { ...audienceSelection, [audType]: val };
                        setAudienceSelection(nextSelection);
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Swipe gesture tip for mobile */}
          <div className="md:hidden flex items-center justify-center gap-1.5 text-zinc-500 text-[10px] font-bold mb-4 animate-pulse select-none">
            <span>↔ Vuốt ngang để xem thêm / Nhấp +/- để thu phóng</span>
          </div>

          {/* Seat Map Horizontal Scroll Container */}
          <div className="w-full overflow-x-auto pb-6 px-5 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent select-none">
            <div className="mx-auto w-fit min-w-max flex flex-col items-center py-2">
              
              {/* Screen curve */}
              <div className="relative w-full mb-10 mt-2 text-center" style={{ width: '100%', maxWidth: `${seatBlockWidth}px`, minWidth: '280px' }}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-8 bg-sky-500/10 blur-xl rounded-full" />
                <div className="w-full h-2 border-t-[3px] border-sky-400/30 rounded-[100%] shadow-[0_-3px_10px_rgba(14,161,207,0.15)]" />
                <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-[0.2em] mt-2">Màn hình</p>
              </div>

              {/* Rows */}
              <div className="flex flex-col w-full animate-fadeIn" style={{ gap: `${rowGapPx}px` }}>
                {roomConfig.rows.map((row) => {
                  const type = roomConfig.layout[row]?.type || 'normal';
                  const rowLayout = roomConfig.layout[row];
                  if (!rowLayout) return null;

                  const isCouple = type === 'couple';
                  const isVIPRow = type === 'vip';
                  const rowPairs = couplePairsByRow[row] || [];

                  return (
                    <div key={row} className="flex flex-col w-full" style={{ gap: `${rowGapPx}px` }}>
                      {row === 'F' && roomConfig.rows.includes('F') && roomConfig.rows.includes('E') && roomConfig.name === 'Phòng Chiếu 1' && (
                        <div style={{ height: `${24 * zoom}px` }} />
                      )}
                      <div className="flex items-center justify-between w-full" style={{ gap: `${gapPx}px` }}>
                        <span className="text-center font-bold" style={{ width: `${rowLabelWidthPx}px`, fontSize: `${rowLabelFontSizePx}px`, color: isCouple ? '#CF0F47' : isVIPRow ? '#fbbf24' : '#555' }}>
                          {row}
                        </span>

                        <div className={`flex items-center${isMaxReached ? ' seats-maxed' : ''}`} style={{ gap: `${gapPx}px` }}>
                          {ALL_COLS.map((col) => {
                            const activePair = rowPairs.find((p) => p[0] === col);
                            const isRightOfPair = rowPairs.some((p) => p[1] === col);

                            if (isCouple) {
                              if (isRightOfPair) return null;
                              if (!activePair) {
                                return <div key={col} style={{ width: `${seatSizePx}px`, height: `${seatSizePx}px` }} />;
                              }
                            } else {
                              if (!rowLayout.cols.includes(col)) return <div key={col} style={{ width: `${28 * zoom}px`, height: `${28 * zoom}px` }} />;
                            }

                            const showAisleBefore = roomConfig.aisles.includes(col) || (roomConfig.centerAisle === col && !isVIPRow);

                            return (
                              <div key={col} className="flex items-center">
                                {showAisleBefore && <div className="shrink-0" style={{ width: `${aisleWidthPx}px` }} />}
                                {isCouple ? (
                                  <CoupleSeatCell
                                    row={row}
                                    leftCol={activePair[0]}
                                    rightCol={activePair[1]}
                                    seatL={layout[`${row}${activePair[0]}`]}
                                    seatR={layout[`${row}${activePair[1]}`]}
                                    selected={selectedIds.has(`${row}${activePair[0]}`) && selectedIds.has(`${row}${activePair[1]}`)}
                                    disabled={!selectedIds.has(`${row}${activePair[0]}`) && (selectedSeats.length + 2 > ticketCount)}
                                    onToggle={handleToggle}
                                    displayNumberL={seatDisplayNumbers[row]?.[activePair[0]] || activePair[0]}
                                    displayNumberR={seatDisplayNumbers[row]?.[activePair[1]] || activePair[1]}
                                    seatSizePx={seatSizePx}
                                    fontSizePx={fontSizePx}
                                    iconSizePx={iconSizePx}
                                    gapPx={gapPx}
                                  />
                                ) : (
                                  <SeatCell
                                    seat={layout[`${row}${col}`]}
                                    selected={selectedIds.has(`${row}${col}`)}
                                    onToggle={handleToggle}
                                    displayNumber={seatDisplayNumbers[row]?.[col] || col}
                                    zoom={zoom}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <span className="text-center font-bold" style={{ width: `${rowLabelWidthPx}px`, fontSize: `${rowLabelFontSizePx}px`, color: isCouple ? '#CF0F47' : isVIPRow ? '#fbbf24' : '#555' }}>
                          {row}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="w-full px-5">
            <div className="flex flex-wrap items-center gap-5 mt-4 justify-center select-none">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded border bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.15)]" />
                <span className="text-zinc-500 text-xs">Thường</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded border bg-[rgba(251,191,36,0.05)] border-[rgba(251,191,36,0.25)]" />
                <span className="text-zinc-500 text-xs">VIP</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-5 rounded border bg-[rgba(207,15,71,0.05)] border-[rgba(207,15,71,0.25)]" />
                <span className="text-zinc-500 text-xs">Couple</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded bg-[#0EA1CF]" />
                <span className="text-zinc-500 text-xs">Đang chọn</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded border bg-[#1C1C1C] border-[#2D2D2D] flex items-center justify-center text-zinc-700">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-zinc-500 text-xs">Đã bán</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded border bg-[#252525] border-[#3A3A3A]/40 flex items-center justify-center text-zinc-500/60 p-0.5">
                  <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span className="text-zinc-500 text-xs">Không được chọn</span>
              </div>
            </div>


          </div>
        </div>
      </div>
      <SeatToast toasts={toasts} />
      
      {/* Custom Styles for Scrollbars */}
      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          height: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 9999px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 9999px;
          border: 1px solid rgba(0, 0, 0, 0.2);
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        /* When max seats reached: disable all available-unselected seats via CSS.
           This is a single DOM class change, NOT a React re-render of each cell. */
        .seats-maxed .seat-avail:not(.seat-sel) {
          opacity: 0.28;
          cursor: not-allowed;
          pointer-events: none;
        }
        /* Keep couple-avail cells disabled too when maxed */
        .seats-maxed .couple-avail:not(.couple-sel) {
          opacity: 0.28;
          cursor: not-allowed;
          pointer-events: none;
        }
      `}</style>
    </>
  );
}
