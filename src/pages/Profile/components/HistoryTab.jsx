export default function HistoryTab({ allTickets, handleTicketClick }) {
  return (
    <div className="relative z-10 flex flex-col gap-6 text-left">
      <h3 className="text-subtitle font-bold text-white pb-2 border-b border-zinc-800/60 text-lg">
        Lịch sử giao dịch
      </h3>

      <div className="flex flex-col gap-5">
        {allTickets.map((ticket, idx) => (
          <div
            key={idx}
            onClick={() => handleTicketClick(ticket)}
            className="w-full rounded-2xl relative shadow-lg border border-zinc-850 bg-[#1C1C1E] flex flex-col md:flex-row overflow-visible text-left hover:border-zinc-700/80 transition-all duration-300 group cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #1C1C1E 0%, #0F0F10 100%)',
              borderColor: '#27272A'
            }}
          >
            {/* Left and Right Perforation Notches on outer borders */}
            <div className="absolute top-1/2 -translate-y-1/2 -left-3.5 w-7 h-7 rounded-full bg-bg-dark border-r border-zinc-800 z-20" style={{ background: '#121212', borderColor: '#27272A' }}></div>
            <div className="absolute top-1/2 -translate-y-1/2 -right-3.5 w-7 h-7 rounded-full bg-bg-dark border-l border-zinc-800 z-20" style={{ background: '#121212', borderColor: '#27272A' }}></div>

            {/* Left panel (Movie details) */}
            <div className="flex-grow p-6 flex gap-5">
              {/* Poster */}
              <div className="w-20 h-28 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0 shadow-md">
                {ticket.poster && (
                  <img src={ticket.poster} alt={ticket.title} className="w-full h-full object-cover" />
                )}
              </div>

              {/* Movie info details */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex justify-between items-start gap-4 flex-wrap mb-2">
                  <h4 className="text-white font-bold text-base leading-tight truncate max-w-[200px] sm:max-w-[300px]">
                    {ticket.title}
                  </h4>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    {ticket.status}
                  </span>
                </div>

                {/* Labels Row */}
                <div className="flex flex-wrap gap-2 mb-3.5">
                  <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-text-sub3 uppercase tracking-wide">
                    {ticket.format || '2D'}
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-text-sub3 tracking-wide">
                    {ticket.lang || 'Phụ đề'}
                  </span>
                </div>

                {/* Booking Info Grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                  <div>
                    <p className="text-[9px] text-zinc-500 uppercase tracking-wider">Ngày chiếu</p>
                    <p className="text-white text-xs font-semibold mt-0.5">{ticket.date}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-zinc-500 uppercase tracking-wider">Suất chiếu</p>
                    <p className="text-white text-xs font-semibold mt-0.5">{ticket.time}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-zinc-500 uppercase tracking-wider">Phòng chiếu</p>
                    <p className="text-white text-xs font-semibold mt-0.5">{ticket.room}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-zinc-500 uppercase tracking-wider">Ghế ngồi</p>
                    <p className="text-[#0ECF67] text-xs font-bold mt-0.5">{ticket.seats}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[9px] text-zinc-500 uppercase tracking-wider">Rạp</p>
                    <p className="text-white text-xs font-semibold mt-0.5">{ticket.theater}</p>
                  </div>
                  {ticket.combo && ticket.combo !== 'Không kèm combo' && (
                    <div className="col-span-2">
                      <p className="text-[9px] text-zinc-500 uppercase tracking-wider">Đồ ăn &amp; Nước uống</p>
                      <p className="text-zinc-400 text-xs font-medium mt-0.5">{ticket.combo}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Perforation line */}
            <div className="relative flex md:flex-col items-center justify-between" style={{ minWidth: 1 }}>
              <div className="hidden md:block absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-bg-dark border-b border-zinc-800 z-10" style={{ background: '#121212', borderColor: '#27272A' }} />
              <div className="flex-1 w-full border-t md:border-t-0 md:border-l border-dashed border-zinc-800/80 my-0 md:my-4 h-px md:h-auto" style={{ borderColor: '#27272A' }} />
              <div className="hidden md:block absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-bg-dark border-t border-zinc-800 z-10" style={{ background: '#121212', borderColor: '#27272A' }} />
            </div>

            {/* Right panel (Pricing & Barcode) */}
            <div className="w-full md:w-44 p-6 flex flex-col justify-between items-center border-t md:border-t-0 border-zinc-850" style={{ borderColor: '#27272A' }}>
              {/* QR Barcode Visual */}
              <div className="flex flex-col items-center">
                <div className="flex gap-[1.5px] h-10 items-center justify-center bg-white p-2 rounded-lg w-32 shadow-inner">
                  {[1, 2, 1, 3, 1, 1, 2, 4, 1, 2, 3, 1, 2, 1, 4, 2].map((w, i) => (
                    <span key={i} className="bg-black h-full shrink-0" style={{ width: w }}></span>
                  ))}
                </div>
                <p className="text-zinc-500 text-[9px] mt-1.5 font-mono tracking-wider">{ticket.id}</p>
              </div>

              <div className="text-center mt-4 md:mt-0">
                <p className="text-zinc-500 text-[9px] uppercase tracking-wider mb-0.5">Tổng tiền</p>
                <p className="text-lg font-black text-cta leading-none" style={{ color: '#CF0F47' }}>{ticket.price.toLocaleString('vi-VN')} đ</p>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
