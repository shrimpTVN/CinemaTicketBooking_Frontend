export default function ReviewForm({
  username,
  setUsername,
  userRating,
  setUserRating,
  commentText,
  setCommentText,
  handleAddReview,
}) {
  return (
    <form onSubmit={handleAddReview} className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-5 space-y-4 text-left">
      <div className="flex items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-text-sub2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Tên của bạn..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-transparent border-b border-zinc-800 text-body2 text-text-main focus:outline-hidden focus:border-gold py-0.5 transition-colors placeholder:text-text-sub3 w-32 sm:w-40"
          />
        </div>
        {/* Star Selection Row */}
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => setUserRating(star)}
              className="focus:outline-hidden cursor-pointer"
            >
              <svg
                className={`w-5 h-5 ${star <= userRating ? 'text-gold' : 'text-zinc-700'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Text Input area */}
      <textarea
        rows="2"
        placeholder="Viết đánh giá của bạn..."
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        className="w-full bg-zinc-900 border border-zinc-800 text-text-main rounded-lg focus:outline-hidden focus:border-gold p-3 text-body2 transition-all placeholder:text-text-sub3"
        required
      ></textarea>
      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-cta hover:bg-cta-light text-text-main text-body3 px-5 py-2 rounded font-bold uppercase transition-colors cursor-pointer"
        >
          Gửi
        </button>
      </div>
    </form>
  );
}
