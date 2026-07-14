import { Copy } from 'lucide-react';

export default function RewardsTab({ user, mockVouchers, handleCopyCode }) {
  return (
    <div className="relative z-10 flex flex-col gap-6 text-left">
      <div className="flex justify-between items-center pb-2 border-b border-zinc-800/60">
        <h3 className="text-subtitle font-bold text-white text-lg">
          Ưu đãi và quà tặng
        </h3>
        <div className="bg-gold/10 border text-[13px] px-3 py-1 rounded-full font-bold flex items-center gap-1.5" style={{ color: '#f59e0b', borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)' }}>
          <span>🌟 {user.stars} sao tích lũy</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockVouchers.map((voucher, idx) => (
          <div
            key={idx}
            className="relative rounded-xl border border-zinc-850 bg-zinc-955/20 overflow-hidden flex flex-col justify-between group hover:border-cta/20 transition-all duration-300"
            style={{ borderColor: '#27272A' }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -left-2 w-3.5 h-3.5 bg-zinc-900 border border-zinc-850 rounded-full z-20" style={{ background: '#121212', borderColor: '#27272A' }}></div>
            <div className="absolute top-1/2 -translate-y-1/2 -right-2 w-3.5 h-3.5 bg-zinc-900 border border-zinc-850 rounded-full z-20" style={{ background: '#121212', borderColor: '#27272A' }}></div>

            <div className="p-4 flex flex-col gap-1.5 text-left">
              <div className="flex justify-between items-center gap-2 flex-wrap">
                <span className="text-[9px] border px-2 py-0.5 rounded font-bold uppercase tracking-wider" style={{ color: '#CF0F47', borderColor: '#CF0F47', backgroundColor: 'rgba(207,15,71,0.1)' }}>
                  {voucher.category}
                </span>
                <span className="text-[10px] text-zinc-500">Hạn dùng: {voucher.expiry}</span>
              </div>
              <h4 className="text-body2 font-bold text-white mt-1 leading-snug group-hover:text-cta-light transition-colors">
                {voucher.title}
              </h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed mt-1">
                {voucher.description}
              </p>
            </div>

            <div className="px-4 py-2 bg-zinc-955/20 border-t border-dashed border-zinc-850/80 flex justify-between items-center gap-4" style={{ borderColor: '#27272A' }}>
              <span className="font-mono text-body3 text-zinc-300 font-bold tracking-wide">{voucher.code}</span>
              <button
                onClick={() => handleCopyCode(voucher.code)}
                className="text-[11px] bg-zinc-800 hover:bg-cta hover:text-white border border-zinc-700 hover:border-cta text-zinc-400 px-3 py-1 rounded font-bold cursor-pointer transition-all flex items-center gap-1.5"
                style={{ background: '#27272A', borderColor: '#3F3F46' }}
              >
                <Copy className="w-3 h-3" />
                Sao chép
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
