const STEP_LABELS = ['Phim & Suất chiếu', 'Chọn ghế', 'Combo', 'Thanh toán'];

export default function StepIndicator({ step }) {
  const allDone = step === 'success';
  const displayStep = step === 'failure' ? 4 : step;

  const items = [];
  STEP_LABELS.forEach((label, i) => {
    const n = i + 1;
    const done = allDone || n < displayStep;
    const active = !allDone && n === displayStep;

    items.push(
      <div key={`step-${n}`} className="flex flex-col items-center gap-1 sm:gap-1.5" style={{ minWidth: 48 }}>
        <div
          className="w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300"
          style={{
            background: done ? '#CF0F47' : 'transparent',
            border: done ? 'none' : `2px solid ${active ? '#CF0F47' : '#3f3f3f'}`,
            color: done ? '#fff' : active ? '#CF0F47' : '#555',
            boxShadow: active ? '0 0 0 3px rgba(207,15,71,0.12)' : 'none',
          }}
        >
          {done ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-3 h-3 sm:w-4 sm:h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <span style={{ color: active ? '#CF0F47' : '#555' }}>{n}</span>
          )}
        </div>
        <span
          className="text-[10px] sm:text-xs font-medium tracking-wide text-center leading-tight"
          style={{ maxWidth: 56, color: done ? '#CF0F47' : active ? '#fff' : '#555' }}
        >
          {label}
        </span>
      </div>
    );

    if (i < STEP_LABELS.length - 1) {
      items.push(
        <div key={`connector-${n}`} className="flex-1 mx-1 sm:mx-2" style={{ marginTop: 14, maxWidth: 60 }}>
          <div className="h-[2px] rounded-full w-full" style={{ background: '#2a2a2a' }}>
            <div
              className="h-full rounded-full transition-all duration-500 ease-in-out"
              style={{ width: done ? '100%' : '0%', background: '#CF0F47' }}
            />
          </div>
        </div>
      );
    }
  });

  return (
    <div className="flex items-start justify-center py-3 sm:py-6 px-2 sm:px-4">
      {items}
    </div>
  );
}
