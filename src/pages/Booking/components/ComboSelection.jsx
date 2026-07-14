import { useState, useEffect } from 'react';
import { useBookingStore } from '../../../store/bookingStore';
import { COMBOS } from '../bookingConstants';
import { fmtVND } from '../bookingUtils';

export default function ComboSelection({ booking, setBooking }) {
  const products = useBookingStore((s) => s.products);
  const fetchProducts = useBookingStore((s) => s.fetchProducts);
  const [loading, setLoading] = useState(true);
  const [imgErrors, setImgErrors] = useState({});

  useEffect(() => {
    setLoading(true);
    fetchProducts().finally(() => setLoading(false));
  }, [fetchProducts]);

  const displayList = products.length > 0
    ? products
        .filter((p) => !p.status || p.status === 'ON')
        .map((p) => ({
          id: String(p.id),
          name: p.name,
          desc: p.description,
          price: Number(p.price),
          image: p.image,
        }))
    : COMBOS;

  const change = (id, delta) => {
    setBooking((b) => {
      const currentQty = b.combos[id] || 0;
      const nextQty = Math.max(0, currentQty + delta);
      return {
        ...b,
        combos: { ...b.combos, [id]: nextQty },
      };
    });
  };

  return (
    <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: '#1A1A1A' }}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/6 flex items-center justify-between">
        <div className="text-left">
          <h2 className="text-white font-bold text-sm">Combo (tuỳ chọn)</h2>
          <p className="text-zinc-500 text-xs mt-0.5">Thêm bắp rang và nước ngọt để hoàn thiện trải nghiệm</p>
        </div>
        {loading && (
          <div className="w-4 h-4 rounded-full border-2 border-zinc-700 border-t-[#CF0F47] animate-spin shrink-0" />
        )}
      </div>

      <div className="divide-y divide-white/5">
        {loading && products.length === 0 ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
              <div className="w-24 h-24 rounded-xl shrink-0 bg-white/5" />
              <div className="flex-1 space-y-2">
                <div className="h-3 rounded w-2/5 bg-white/5" />
                <div className="h-2.5 rounded w-3/5 bg-white/5" />
                <div className="h-3 rounded w-1/4 bg-white/5" />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-8 h-8 rounded-full bg-white/5" />
                <div className="w-5 h-3 rounded bg-white/5" />
                <div className="w-8 h-8 rounded-full bg-white/5" />
              </div>
            </div>
          ))
        ) : displayList.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-3 px-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl bg-white/5">🍿</div>
            <p className="text-zinc-300 text-sm font-semibold">Chưa có combo nào</p>
            <p className="text-zinc-650 text-xs leading-relaxed">Hệ thống chưa cập nhật dữ liệu combo. Bạn có thể bỏ qua bước này.</p>
          </div>
        ) : (
          displayList.map((combo) => {
            const qty = booking.combos[combo.id] || 0;
            const hasImage = combo.image && !imgErrors[combo.id];
            return (
              <div key={combo.id} className="flex items-start gap-3 sm:gap-4 p-3.5 sm:p-5 hover:bg-white/2 transition-colors">
                <div
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl flex items-center justify-center shrink-0 overflow-hidden bg-white/5"
                >
                  {hasImage ? (
                    <img
                      src={combo.image}
                      alt={combo.name}
                      className="w-full h-full object-cover"
                      onError={() => setImgErrors((e) => ({ ...e, [combo.id]: true }))}
                    />
                  ) : (
                    <span className="text-2xl">{combo.icon || '🍿'}</span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                  <div className="flex-grow min-w-0">
                    <p className="text-white text-xs sm:text-sm font-semibold leading-snug">{combo.name}</p>
                    <p className="text-zinc-500 text-[10px] sm:text-xs mt-0.5 leading-relaxed">{combo.desc}</p>
                    <p className="text-white text-xs sm:text-sm font-extrabold mt-1">
                      {fmtVND(combo.price)}
                      {qty > 0 && (
                        <span className="ml-2 text-[#CF0F47] text-xs font-bold">= {fmtVND(combo.price * qty)}</span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => change(combo.id, -1)}
                      disabled={qty === 0}
                      className="w-9 h-9 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center font-bold transition-colors duration-100 cursor-pointer disabled:opacity-30 hover:bg-white/8 text-white border-white/10 active:bg-white/15"
                      style={{ touchAction: 'manipulation' }}
                    >
                      &minus;
                    </button>
                    <span className="w-6 text-center text-white font-black text-xs sm:text-sm select-none">{qty}</span>
                    <button
                      onClick={() => change(combo.id, 1)}
                      className="w-9 h-9 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center font-bold transition-colors duration-100 cursor-pointer hover:bg-white/8 text-white border-white/10 active:bg-white/15"
                      style={{ touchAction: 'manipulation' }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
