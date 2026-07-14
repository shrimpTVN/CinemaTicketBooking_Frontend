const renderStars = (ratingCount, sizeClass = "w-4 h-4") => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${sizeClass} ${star <= ratingCount ? 'text-gold' : 'text-zinc-700'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

export default function ReviewSection({
  movie,
  filterRating,
  setFilterRating,
  filteredReviews,
}) {
  return (
    <div className="space-y-6">
      {/* Review Statistics Row */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 flex flex-row items-center gap-6">
        {/* Big Number */}
        <div className="text-center flex-shrink-0">
          <span className="text-4xl sm:text-5xl font-bold text-text-main">
            {movie.rating > 0 ? movie.rating : '0.0'}
          </span>
          <span className="text-[12px] text-text-sub3 block mt-2">/10 điểm</span>
          <div className="mt-2 flex justify-center">
            {renderStars(Math.round((movie.rating || 0) / 2))}
          </div>
        </div>
        {/* Breakdown ratings progress bars */}
        <div className="flex-grow space-y-1.5 text-body3">
          {[
            { star: 5, fill: "w-[75%]" },
            { star: 4, fill: "w-[15%]" },
            { star: 3, fill: "w-[6%]" },
            { star: 2, fill: "w-[3%]" },
            { star: 1, fill: "w-[1%]" }
          ].map((row) => (
            <div key={row.star} className="flex items-center gap-3">
              <span className="w-4 text-text-sub2 text-[12px] font-bold text-right">{row.star}★</span>
              <div className="flex-grow h-1.5 bg-zinc-800 rounded overflow-hidden">
                <div className={`h-full bg-gold ${row.fill}`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review filters list */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-[#222222] pb-4">
        {[
          { label: "Tất cả", value: "all" },
          { label: "Mới nhất", value: "newest" },
          { label: "5★", value: "5" },
          { label: "4★", value: "4" },
          { label: "3★", value: "3" },
          { label: "2★", value: "2" },
          { label: "1★", value: "1" }
        ].map((btn) => (
          <button
            key={btn.value}
            onClick={() => setFilterRating(btn.value)}
            className={`px-4 py-1.5 rounded-full border text-body3 font-medium transition-all cursor-pointer ${
              filterRating === btn.value
                ? 'bg-gold border-gold text-bg-dark font-bold'
                : 'border-zinc-800 text-text-sub2 bg-zinc-900/30 hover:border-zinc-700 hover:text-text-main'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Review Comments list */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-10 bg-zinc-900/10 border border-zinc-800/30 rounded-xl text-text-sub3 text-body2">
          Chưa có đánh giá nào phù hợp với bộ lọc này.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="border-b border-zinc-800 pb-5 text-left"
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                {/* Left avatar/info */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-text-sub3 font-bold text-body3 uppercase">
                    {review.username.slice(0, 1)}
                  </div>
                  <div>
                    <span className="font-bold text-text-main text-body2 block">{review.username}</span>
                    <span className="text-[11px] text-text-sub3">{review.date}</span>
                  </div>
                </div>
                {/* Stars */}
                <div>
                  {renderStars(review.rating)}
                </div>
              </div>
              <p className="text-body2 text-text-sub2 pl-11 leading-relaxed">
                {review.comment}
              </p>
            </div>
          ))}

          {/* See more reviews */}
          <div className="pt-4 flex justify-center">
            <button className="border border-zinc-800 hover:border-zinc-700 text-text-sub2 hover:text-text-main text-body3 px-6 py-2.5 rounded font-medium transition-all cursor-pointer">
              Xem thêm
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
