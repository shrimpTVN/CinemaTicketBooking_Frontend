import { useMemo } from 'react';

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

export function ReviewStats({ movie, reviews = [] }) {
  const totalReviews = reviews.length;

  // Calculate dynamic average rating out of 10 points based on viewers' ratings
  const averageScore = useMemo(() => {
    if (totalReviews === 0) {
      return movie.rating > 0 ? Number(movie.rating).toFixed(1) : '0.0';
    }
    const sumStars = reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    // Rating in reviews is 1-5 stars. Convert to scale of 10 points
    const avgOutof10 = (sumStars / totalReviews) * 2;
    return avgOutof10.toFixed(1);
  }, [reviews, totalReviews, movie.rating]);

  // Breakdown percentages for 5★ to 1★
  const starBreakdown = useMemo(() => {
    if (totalReviews === 0) {
      return [
        { star: 5, percent: 0 },
        { star: 4, percent: 0 },
        { star: 3, percent: 0 },
        { star: 2, percent: 0 },
        { star: 1, percent: 0 }
      ];
    }
    return [5, 4, 3, 2, 1].map((star) => {
      const count = reviews.filter(r => Math.round(Number(r.rating)) === star).length;
      const percent = Math.round((count / totalReviews) * 100);
      return { star, percent };
    });
  }, [reviews, totalReviews]);

  return (
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 flex flex-row items-center gap-6 h-full text-left">
      {/* Big Number */}
      <div className="text-center flex-shrink-0">
        <span className="text-4xl sm:text-5xl font-bold text-text-main">
          {averageScore}
        </span>
        <span className="text-[12px] text-text-sub3 block mt-2">/10 điểm</span>
        <div className="mt-2 flex justify-center">
          {renderStars(Math.round(parseFloat(averageScore) / 2))}
        </div>
        <span className="text-[11px] text-zinc-500 block mt-1">
          ({totalReviews} lượt đánh giá)
        </span>
      </div>
      {/* Breakdown ratings progress bars */}
      <div className="flex-grow space-y-1.5 text-body3">
        {starBreakdown.map((row) => (
          <div key={row.star} className="flex items-center gap-3">
            <span className="w-4 text-text-sub2 text-[12px] font-bold text-right">{row.star}★</span>
            <div className="flex-grow h-1.5 bg-zinc-800 rounded overflow-hidden">
              <div
                className="h-full bg-gold transition-all duration-500"
                style={{ width: `${row.percent}%` }}
              ></div>
            </div>
            <span className="w-8 text-[11px] text-zinc-500 text-right font-mono">{row.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReviewList({ filterRating, setFilterRating, filteredReviews }) {
  return (
    <div className="space-y-6 mt-6">
      {/* Review filters list */}
      <div className="flex flex-wrap gap-2 pb-4 border-b border-[#222222]">
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
              className="border-b border-zinc-800/80 pb-5 text-left"
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                {/* Left avatar/info */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-text-sub3 font-bold text-body3 uppercase">
                    {(review.username || 'N').slice(0, 1)}
                  </div>
                  <div>
                    <span className="font-semibold text-zinc-300 text-body2 block">{review.username}</span>
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
        </div>
      )}
    </div>
  );
}

export default function ReviewSection({ movie, reviews = [], filterRating, setFilterRating, filteredReviews }) {
  return (
    <div className="space-y-6">
      <ReviewStats movie={movie} reviews={reviews} />
      <ReviewList
        filterRating={filterRating}
        setFilterRating={setFilterRating}
        filteredReviews={filteredReviews}
      />
    </div>
  );
}
