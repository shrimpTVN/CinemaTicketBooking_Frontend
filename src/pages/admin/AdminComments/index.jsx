import { useState, useEffect } from 'react';
import { MessageSquare, Trash2, Star, Search } from 'lucide-react';
import apiClient from '../../../services/apiClient';

function AdminCard({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-white/5 ${className}`} style={{ background: '#1A1A1A' }}>
      {children}
    </div>
  );
}

function StarRow({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'}`}
        />
      ))}
    </div>
  );
}

export default function AdminComments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        // 1. Fetch all movies to get their IDs
        const movRes = await apiClient.get('/movies');
        const movies = Array.isArray(movRes) ? movRes : (movRes?.data || []);

        // 2. Fetch comments for each movie in parallel (workaround for missing /comment-ratings/all)
        const results = await Promise.allSettled(
          movies.map(m => apiClient.get(`/comment-ratings/movies/${m.id}`).then(r => ({
            movieId: m.id,
            movieTitle: m.title || m.name || `Phim #${m.id}`,
            data: Array.isArray(r) ? r : (r?.data || []),
          })))
        );

        const all = [];
        results.forEach(res => {
          if (res.status === 'fulfilled') {
            const { movieTitle, data } = res.value;
            data.forEach(item => {
              // CommentRatingResponseDto: rating=String (text comment), comment=Float (star score)
              all.push({
                id: item.id,
                userId: item.userId,
                userName: item.userName || 'Người dùng',
                movieTitle,
                stars: Math.round(Number(item.comment) || 0),  // Float star score
                comment: item.rating || '',                      // String text content
                createdAt: item.createdAt
                  ? new Date(item.createdAt).toLocaleDateString('vi-VN')
                  : '—',
              });
            });
          }
        });

        // Sort newest first (by id desc)
        all.sort((a, b) => (b.id || 0) - (a.id || 0));
        setComments(all);
      } catch (err) {
        console.warn('AdminComments fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const filtered = comments.filter(c => {
    const q = searchQuery.toLowerCase();
    return !q
      || c.userName.toLowerCase().includes(q)
      || c.comment.toLowerCase().includes(q)
      || c.movieTitle.toLowerCase().includes(q);
  });

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa bình luận này?')) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/comment-ratings/${id}`);
      setComments(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Delete comment error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-zinc-400 text-sm">
            Tổng <span className="text-white font-bold">{comments.length}</span> bình luận từ {loading ? '—' : 'cơ sở dữ liệu'}
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Tìm tên, nội dung, tên phim..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-sm text-white pl-10 pr-4 py-2 rounded-xl focus:outline-none"
            style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </div>
      </div>

      {/* Comments Table */}
      <AdminCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead style={{ background: '#111111' }}>
              <tr className="text-xs uppercase text-zinc-500 font-bold border-b border-white/5">
                <th className="px-6 py-3.5">Người dùng</th>
                <th className="px-6 py-3.5">Phim</th>
                <th className="px-6 py-3.5">Đánh giá</th>
                <th className="px-6 py-3.5">Nội dung bình luận</th>
                <th className="px-6 py-3.5">Ngày</th>
                <th className="px-6 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-3 bg-white/5 rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-zinc-500 text-sm">
                    Không có bình luận nào.
                  </td>
                </tr>
              ) : (
                filtered.map(c => (
                  <tr key={c.id} className="hover:bg-white/3 transition-colors align-top">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ background: '#CF0F47' }}>
                          {c.userName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white text-xs font-semibold whitespace-nowrap">{c.userName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-zinc-300 text-xs">{c.movieTitle}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StarRow rating={c.stars} />
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-zinc-300 text-xs line-clamp-2 leading-relaxed">{c.comment || '—'}</p>
                    </td>
                    <td className="px-6 py-4 text-zinc-500 text-xs whitespace-nowrap">{c.createdAt}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(c.id)}
                        disabled={deletingId === c.id}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer border border-rose-500/20 disabled:opacity-40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  );
}
