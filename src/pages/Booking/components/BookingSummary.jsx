import { useBookingStore } from '../../../store/bookingStore';
import { COMBOS } from '../bookingConstants';
import { fmtVND, formatTimer, groupSeatsByDisplay } from '../bookingUtils';
import AgeRatingTag from '../../../components/AgeRatingTag';

export default function BookingSummary({ booking, step, onBack, onNext, canNext }) {
  const { movie, showtime, date, seats, combos } = booking;
  const holdTimer = useBookingStore((state) => state.holdTimer);
  const storeProducts = useBookingStore((s) => s.products);

  const resolvedProducts = storeProducts.length > 0
    ? storeProducts.map((p) => ({ id: String(p.id), name: p.name, price: Number(p.price) }))
    : COMBOS;

  const displayGroups = groupSeatsByDisplay(seats);

  const seatTotal = displayGroups.reduce((s, g) => s + g.totalPrice, 0);
  const comboTotal = Object.entries(combos).reduce((s, [id, qty]) => {
    const c = resolvedProducts.find((x) => x.id === id);
    return s + (c ? c.price * qty : 0);
  }, 0);
  const total = seatTotal + comboTotal;

  const nextLabel =
    step === 4 ? 'Xác nhận thanh toán' :
      step === 3 ? 'Đến thanh toán' :
        step === 2 ? 'Chọn combo' : 'Chọn ghế';

  const getFullDayLabel = (dateObj) => {
    if (!dateObj) return '';
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return days[dateObj.getDay()];
  };

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <div className="hidden lg:flex flex-col gap-1.5 sticky top-20">
        {/* Timer OUTSIDE and ABOVE the card */}
        {(step === 3 || step === 4) && (
          <div className="text-center py-1">
            <span className="text-zinc-400 text-sm">Thời gian giữ ghế: </span>
            <span className="font-black text-sm text-[#F59E0B]">{formatTimer(holdTimer)}</span>
          </div>
        )}
        {/* Outer Card Container */}
        <div className="rounded-2xl border border-white/8 overflow-hidden flex flex-col" style={{ background: '#1A1A1A' }}>
          {/* Top brand accent strip */}
          <div className="h-[4px] w-full" style={{ backgroundColor: '#EAB308' }} />

          {/* Card Content */}
          <div className="p-5 flex flex-col text-left">
            {movie ? (
              <>
                {/* Row 1: Poster + Movie title */}
                <div className="flex gap-4 items-start text-left">
                  <div className="w-[84px] h-[120px] rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                    {movie.posterUrl ? (
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-650 text-xs">N/A</div>
                    )}
                  </div>
                  <div className="flex-grow min-w-0 text-left">
                    <h3 className="text-white font-bold text-base leading-tight mb-2 line-clamp-2">{movie.title}</h3>
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-400 text-left mt-1 leading-none">
                      {showtime ? (
                        <span>{showtime.format} {showtime.lang === 'Phụ đề' ? 'Phụ Đề' : 'Thuyết Minh'}</span>
                      ) : (
                        <span className="text-zinc-550 italic">Chưa chọn định dạng</span>
                      )}
                      {movie.ageRating && (
                        <>
                          <span className="text-zinc-650">-</span>
                          <AgeRatingTag rating={movie.ageRating} className="w-8 h-5 text-[10px]" />
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="h-4" />

                {/* Row 2: Cinema - Room */}
                {showtime ? (
                  <div className="text-zinc-300 text-sm font-semibold mb-1 text-left">
                    Galaxy Cinema - <span className="text-white uppercase">{showtime.room || 'RAP 3'}</span>
                  </div>
                ) : (
                  <div className="text-zinc-550 text-sm italic mb-1 text-left">Chưa chọn suất chiếu</div>
                )}

                {/* Row 3: Showtime formatted detail */}
                {showtime && date && (
                  <div className="text-zinc-450 text-xs mb-3 text-left">
                    Suất: <span className="font-bold text-white text-sm">{showtime.start}</span> - {getFullDayLabel(date.dateObj)}, {date.dateLabel}/{date.dateObj.getFullYear()}
                  </div>
                )}

                {/* Seats breakdown & Combos */}
                {(displayGroups.length > 0 || Object.values(combos).some((v) => v > 0)) && (
                  <div className="border-t border-zinc-800/80 mt-1 max-h-[180px] overflow-y-auto">
                    {/* Seat groups — no dividers between them */}
                    {displayGroups.length > 0 && (
                      <div className="py-2.5 flex flex-col gap-2">
                        {displayGroups.map((group) => (
                          <div key={group.id} className="flex flex-col gap-0.5">
                            <span className="text-zinc-400 text-xs">{group.count}x {group.typeLabel}</span>
                            <div className="flex justify-between items-center">
                              <span className="text-white font-bold text-xs">{group.seatCodes}</span>
                              <span className="text-white font-medium text-xs shrink-0 pl-2">{fmtVND(group.totalPrice)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Dashed divider only when both seats and combos exist */}
                    {displayGroups.length > 0 && Object.values(combos).some((v) => v > 0) && (
                      <div className="border-t border-dashed border-zinc-700/60" />
                    )}

                    {/* Combos — no dividers between them */}
                    {Object.values(combos).some((v) => v > 0) && (
                      <div className="py-2.5 flex flex-col gap-2">
                        {Object.entries(combos).filter(([, qty]) => qty > 0).map(([id, qty]) => {
                          const c = resolvedProducts.find((x) => x.id === id);
                          if (!c) return null;
                          return (
                            <div key={id} className="flex flex-col gap-0.5">
                              <span className="text-zinc-400 text-xs">{qty}x {c.name}</span>
                              <div className="flex justify-between items-center">
                                <span />
                                <span className="text-white font-medium text-xs">{fmtVND(c.price * qty)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-white/4 flex items-center justify-center text-zinc-600 mb-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                  </svg>
                </div>
                <p className="text-zinc-550 text-sm">Vui lòng chọn phim để bắt đầu đặt vé</p>
              </div>
            )}

            <div className="border-t border-dashed border-zinc-700 my-4" />

            {/* Row 4: Total Price Block */}
            <div className="flex justify-between items-center text-left">
              <span className="text-zinc-300 text-sm font-semibold">Tổng cộng</span>
              <span className="font-bold text-lg" style={{ color: '#EAB308' }}>
                {fmtVND(total)}
              </span>
            </div>
          </div>
        </div>

        {/* Row 5: Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onBack}
            disabled={step === 1}
            className="flex-1 py-3 rounded-xl border border-zinc-700/60 text-sm font-semibold transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-center"
            style={{
              borderColor: step === 1 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.12)',
              color: step === 1 ? '#555' : '#CF0F47',
              background: 'transparent',
            }}
          >
            Quay lại
          </button>
          <button
            onClick={onNext}
            disabled={!canNext}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 text-center"
            style={{
              background: canNext ? '#CF0F47' : 'rgba(255,255,255,0.05)',
              color: canNext ? '#fff' : '#555',
            }}
          >
            {nextLabel}
          </button>
        </div>
      </div>

      {/* Mobile Sticky Summary Footer (hidden on desktop) */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-[40] border-t border-white/8 flex flex-col"
        style={{
          backgroundColor: '#161618',
          boxShadow: '0 -10px 25px -5px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Timer row — sits at top of sticky bar, above drag line */}
        {(step === 3 || step === 4) && (
          <div className="text-center py-1.5 border-b border-white/5">
            <span className="text-zinc-400 text-xs">Thời gian giữ ghế: </span>
            <span className="font-black text-xs text-[#F59E0B]">{formatTimer(holdTimer)}</span>
          </div>
        )}
        <div
          className="p-4 flex flex-col gap-2.5"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
        >
        {/* Swipe drag line indicator */}
        <div className="w-12 h-1 bg-zinc-700/60 rounded-full mx-auto" />

        {movie && (
          <div className="flex flex-col gap-1.5 border-b border-white/4 pb-2">
            {/* List of seats with count and price */}
            {displayGroups.length > 0 ? (
              displayGroups.map((group) => {
                return (
                  <div key={group.id} className="flex justify-between items-baseline text-xs">
                    <div className="text-left min-w-0 flex-grow">
                      <span className="text-zinc-400 text-[11px] font-medium">{group.count}x {group.typeLabel}: </span>
                      <span className="text-white font-extrabold text-[12px]">{group.seatCodes}</span>
                    </div>
                    <span className="text-white font-semibold text-[11px] shrink-0 pl-2">{fmtVND(group.totalPrice)}</span>
                  </div>
                );
              })
            ) : (
              <div className="flex justify-between items-baseline text-xs">
                <span className="text-zinc-550 italic text-[11px]">Chưa chọn ghế</span>
                <span className="text-zinc-550 text-[11px] font-medium">{fmtVND(0)}</span>
              </div>
            )}

            {/* List of combos with count and price */}
            {Object.entries(combos).filter(([, qty]) => qty > 0).map(([id, qty]) => {
              const c = resolvedProducts.find((x) => x.id === id);
              if (!c) return null;
              return (
                <div key={id} className="flex justify-between items-baseline text-xs">
                  <div className="text-left min-w-0 flex-grow">
                    <span className="text-zinc-400 text-[11px] font-medium">{qty}x {c.name}</span>
                  </div>
                  <span className="text-white font-semibold text-[11px] shrink-0 pl-2">{fmtVND(c.price * qty)}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom row actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="text-left flex flex-col">
            <span className="text-zinc-500 text-[9px] uppercase font-black tracking-wider">Tổng cộng</span>
            <span className="font-black text-base text-[#EAB308]">
              {fmtVND(total)}
            </span>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={onBack}
              disabled={step === 1}
              className="px-4 py-2 rounded-xl border border-zinc-700/60 text-xs font-semibold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                borderColor: step === 1 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.12)',
                color: step === 1 ? '#555' : '#CF0F47',
                background: 'transparent',
              }}
            >
              Quay lại
            </button>
            <button
              onClick={onNext}
              disabled={!canNext}
              className="px-5 py-2 rounded-xl text-xs font-black text-white transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90"
              style={{
                background: canNext ? '#CF0F47' : 'rgba(255,255,255,0.05)',
                color: canNext ? '#fff' : '#555',
              }}
            >
              {nextLabel}
            </button>
          </div>
          </div>
        </div>
      </div>
    </>
  );
}
