import { useMemo } from 'react';
import { Ticket } from 'lucide-react';

const VN_DAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

function getMonthKey(ticket) {
  // Try rawDate: "2026-07-29"
  if (ticket.rawDate) {
    const m = String(ticket.rawDate).match(/^(\d{4})-(\d{2})/);
    if (m) return { key: `${m[1]}-${m[2]}`, label: `Tháng ${m[2]}/${m[1]}` };
  }
  // Try date: "15/7/2026" or "15/07/2026"
  if (ticket.date) {
    const m = String(ticket.date).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (m) {
      const mm = String(m[2]).padStart(2, '0');
      return { key: `${m[3]}-${mm}`, label: `Tháng ${mm}/${m[3]}` };
    }
  }
  return { key: 'unknown', label: 'Khác' };
}

function formatDisplayTime(ticket) {
  const parts = [];
  if (ticket.time) parts.push(ticket.time);
  // Try to get day of week from rawDate
  if (ticket.rawDate) {
    try {
      const m = String(ticket.rawDate).match(/(\d{4})-(\d{2})-(\d{2})/);
      if (m) {
        const d = new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]));
        const dd = String(m[3]).padStart(2, '0');
        const mm = String(m[2]).padStart(2, '0');
        parts.push(`${VN_DAYS[d.getDay()]}, ${dd}/${mm}/${m[1]}`);
      }
    } catch (_) { /* ignore */ }
  } else if (ticket.date) {
    parts.push(ticket.date);
  }
  return parts.join(' - ');
}

export default function HistoryTab({ allTickets, handleTicketClick }) {
  // Group at most 20 tickets by month, sorted most recent first
  const grouped = useMemo(() => {
    const limitedTickets = (allTickets || []).slice(0, 20);
    const map = new Map();
    limitedTickets.forEach(ticket => {
      const { key, label } = getMonthKey(ticket);
      if (!map.has(key)) map.set(key, { label, tickets: [] });
      map.get(key).tickets.push(ticket);
    });
    return [...map.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([, v]) => v);
  }, [allTickets]);

  if (allTickets.length === 0) {
    return (
      <div className="relative z-10 flex flex-col items-center gap-4 py-16 text-center">
        <Ticket className="w-12 h-12 text-zinc-600" />
        <p className="text-zinc-500 text-sm">Bạn chưa có giao dịch nào.</p>
        <p className="text-zinc-600 text-xs">Hãy đặt vé xem phim để xem lịch sử tại đây.</p>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex flex-col gap-5 text-left">
      {/* Note */}
      <p className="text-center text-xs text-zinc-500 italic">
        Lưu ý: chỉ hiển thị 20 giao dịch gần nhất
      </p>

      {grouped.map(group => (
        <div key={group.label} className="flex flex-col gap-2">
          {/* Month header */}
          <p className="text-sm font-semibold text-zinc-400 border-b border-zinc-800/60 pb-1.5">
            {group.label}
          </p>

          {group.tickets.map((ticket, idx) => {
            const displayTime = formatDisplayTime(ticket);

            return (
              <div
                key={idx}
                className="flex items-center gap-4 rounded-xl px-4 py-3 border border-zinc-800/70 hover:border-zinc-700/60 transition-all duration-200 group"
                style={{ background: 'linear-gradient(135deg, #1c1c1e 0%, #111113 100%)' }}
              >
                {/* Poster */}
                <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0 border border-zinc-800 bg-zinc-800/60">
                  {ticket.poster
                    ? <img src={ticket.poster} alt={ticket.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-zinc-700/50 flex items-center justify-center">
                        <Ticket className="w-4 h-4 text-zinc-500" />
                      </div>
                  }
                </div>

                {/* Movie info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate leading-tight">{ticket.title}</p>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="text-zinc-400 text-xs">
                      {ticket.format || '2D'} {ticket.lang || 'Phụ đề'}
                    </span>
                    {ticket.ageRating && (
                      <span
                        className="text-white text-[10px] font-bold px-1.5 py-0.5 rounded leading-none"
                        style={{ backgroundColor: '#CF0F47' }}
                      >
                        {ticket.ageRating}
                      </span>
                    )}
                  </div>
                </div>

                {/* Cinema + showtime */}
                <div className="text-right shrink-0 hidden sm:block">
                  <p className="text-xs text-zinc-400 font-medium">{ticket.theater || 'Cinema'}</p>
                  {displayTime && (
                    <p className="text-xs text-zinc-200 font-semibold mt-0.5 leading-tight">{displayTime}</p>
                  )}
                </div>

                {/* Chi tiết button */}
                <button
                  onClick={e => { e.stopPropagation(); handleTicketClick(ticket); }}
                  className="shrink-0 text-sm font-semibold transition-colors cursor-pointer hover:opacity-80 ml-1 whitespace-nowrap"
                  style={{ color: '#CF0F47' }}
                >
                  Chi tiết
                </button>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
