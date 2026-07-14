export default function ShowtimeSelector({
  movie,
  dates,
  selectedDateIndex,
  setSelectedDateIndex,
  formatsToDisplay,
  handleShowtimeClick,
  hasNoShowtimes,
}) {
  return (
    <section>
      {movie.status === 'coming-soon' ? (
        <div className="p-8 text-center bg-zinc-900/30 border border-zinc-800 rounded-xl text-text-sub3 text-body2">
          Phim sắp chiếu hiện chưa có lịch chiếu cụ thể. Vui lòng quay lại sau khi phim chính thức công chiếu.
        </div>
      ) : hasNoShowtimes ? (
        <div className="p-8 text-center bg-zinc-900/30 border border-zinc-800 rounded-xl text-text-sub3 text-body2">
          Hiện tại phim đang không có suất chiếu.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Date Slider Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-800">
            {dates.map((day, idx) => (
              <button
                key={day.id}
                onClick={() => setSelectedDateIndex(idx)}
                className={`flex flex-col items-center justify-center min-w-[70px] h-[52px] rounded-lg border transition-all cursor-pointer ${
                  selectedDateIndex === idx
                    ? 'text-text-main font-bold'
                    : 'border-zinc-800 bg-zinc-900/50 text-text-sub2 hover:border-zinc-700 hover:text-text-main'
                }`}
                style={selectedDateIndex === idx ? { background: 'var(--color-select)', borderColor: 'var(--color-select)' } : {}}
              >
                <span className="text-[12px] font-bold uppercase">{day.dayName}</span>
                <span className="text-[11px] font-medium mt-0.5 opacity-80">{day.dateStr}</span>
              </button>
            ))}
          </div>

          {/* Formats and Showtimes items */}
          <div className="space-y-4 pt-2">
            {formatsToDisplay.length === 0 ? (
              <div className="p-8 text-center bg-zinc-900/30 border border-zinc-800 rounded-xl text-text-sub3 text-body2">
                Không có suất chiếu nào cho phim vào ngày này.
              </div>
            ) : (
              formatsToDisplay.map((format, idx) => (
                <div
                  key={idx}
                  className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-start justify-between gap-4"
                >
                  {/* Format Heading Left */}
                  <div className="flex-shrink-0">
                    <h4 className="text-body2 font-bold text-text-main uppercase tracking-wider">{format.name}</h4>
                    <span className="text-[11px] text-text-sub3 block mt-1">{format.price}</span>
                  </div>

                  {/* Times List Grid Right */}
                  <div className="flex flex-wrap gap-2 flex-grow md:justify-end">
                    {format.times.map((st) => (
                      <button
                        key={st.id || st.start}
                        onClick={() => handleShowtimeClick(format.name, st.start, st.id, st.room)}
                        className="flex flex-col items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.03] hover:bg-[#0EA1CF] hover:border-[#0EA1CF] transition-all duration-200 cursor-pointer hover:-translate-y-0.5 text-center overflow-hidden group"
                        style={{
                          width: '82px',
                          height: '72px',
                          padding: 0,
                        }}
                      >
                        {/* Hour */}
                        <div className="flex-1 flex flex-col justify-center items-center pt-1.5">
                          <span className="font-extrabold text-sm tracking-wide text-white group-hover:text-white transition-colors" style={{ lineHeight: 1.1 }}>
                            {st.start}
                          </span>
                          <span className="text-[10px] font-normal text-zinc-500 group-hover:text-white/70 transition-colors mt-0.5">
                            ~ {st.end}
                          </span>
                        </div>

                        {/* Available seats */}
                        <div
                          className="w-full py-0.5 flex items-center justify-center border-t text-[9px] font-semibold bg-black/25 group-hover:bg-black/15 border-white/5 transition-colors"
                        >
                          <span className="text-zinc-500 group-hover:text-white transition-colors">
                            {st.available}/100
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </section>
  );
}
