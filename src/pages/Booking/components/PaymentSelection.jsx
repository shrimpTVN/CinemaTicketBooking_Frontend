import { useState } from 'react';
import { PAYMENT_METHODS } from '../bookingConstants';
import { useBookingStore } from '../../../store/bookingStore';
import Toast from '../../../components/Toast';

// Map of styling configurations for database payment methods
const methodStyling = {
  'MOMO': { bg: '#a50e5f', letter: 'M' },
  'ZALOPAY': { bg: '#0468e6', letter: 'Z' },
  'VNPAY': { bg: '#005bab', letter: 'V' },
  'BANK_CARD': { bg: '#1a56db', letter: 'C' },
  'CASH': { bg: '#15803d', letter: '₫' },
};

export default function PaymentSelection({ booking, setBooking }) {
  const dbPaymentMethods = useBookingStore((state) => state.paymentMethods);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'warning', title) => {
    const id = Date.now();
    setToasts([{ id, message, type, title }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // If we have payment methods loaded from backend, use them. Otherwise fallback to hardcoded constants.
  const rawMethods = dbPaymentMethods.length > 0
    ? dbPaymentMethods
        .filter(pm => pm.status === 'ON')
        .map(pm => {
          const code = pm.code.toUpperCase();
          const style = methodStyling[code] || { bg: '#3f3f46', letter: 'P' };
          return {
            id: code,
            name: pm.name,
            desc: pm.description,
            bg: style.bg,
            letter: style.letter,
            logo: pm.logo,
            disabled: false,
          };
        })
    : PAYMENT_METHODS;

  const displayedMethods = rawMethods;

  const handleSelectMethod = (id, name) => {
    const target = displayedMethods.find((m) => m.id === id);
    if (target?.disabled) {
      addToast(`Cổng thanh toán ${name} đang bảo trì, vui lòng chọn VNPAY`, 'warning', 'Phương thức bảo trì');
      return;
    }
    setToasts([]);
    setBooking((p) => ({ ...p, payment: id }));
  };

  return (
    <div className="rounded-2xl border border-white/8 overflow-hidden relative" style={{ background: '#1A1A1A' }}>
      <Toast toasts={toasts} onRemove={removeToast} position="bottom-center" />

      <div className="px-5 py-4 border-b border-white/6 text-left">
        <h2 className="text-white font-bold text-sm">Phương thức thanh toán</h2>
        <p className="text-zinc-500 text-xs mt-0.5">Chọn phương thức thanh toán phù hợp</p>
      </div>
      <div className="divide-y divide-white/5 p-3">
        {displayedMethods.map((pm) => {
          const sel = booking.payment === pm.id;
          return (
            <div
              key={pm.id}
              onClick={() => handleSelectMethod(pm.id, pm.name)}
              className={`flex items-center gap-4 p-3.5 rounded-xl cursor-pointer transition-all hover:bg-white/4 group select-none ${
                sel ? 'border border-white/10' : 'border border-transparent'
              }`}
              style={{ background: 'transparent' }}
            >
              <div
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                style={{ borderColor: sel ? '#CF0F47' : '#444' }}
              >
                {sel && <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#CF0F47' }} />}
              </div>
              
              {/* Render dynamic DB logo image if available, else fall back to letter pill */}
              {pm.logo ? (
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-white flex items-center justify-center shrink-0 p-1.5 shadow-md border border-white/10">
                  <img src={pm.logo} alt={pm.name} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0"
                  style={{ background: pm.bg }}
                >
                  {pm.letter}
                </div>
              )}

              <div className="flex-grow text-left">
                <p className="text-white text-sm font-semibold">{pm.name}</p>
                <p className="text-zinc-500 text-xs mt-0.5">{pm.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
