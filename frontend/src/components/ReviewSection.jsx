import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { reviewApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/constants';

export default function ReviewSection({ growerId, onReviewSubmit }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      const { data } = await reviewApi.get(growerId);
      setReviews(data.data.reviews);
      setStats(data.data.stats);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [growerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await reviewApi.add(growerId, { rating, comment });
      toast.success('Review submitted!');
      setComment('');
      fetchReviews();
      if (onReviewSubmit) {
        onReviewSubmit();
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const isConsumer = user?.role === 'consumer';

  return (
    <div className="mt-8 border-t border-slate-100 pt-6 text-left">
      <h3 className="text-base font-bold text-slate-900 mb-3">Customer Reviews</h3>
      
      {/* Stats Summary */}
      <div className="flex items-center gap-4 mb-5 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
        <span className="text-3xl font-extrabold text-amber-500">{stats.averageRating || '0.0'}</span>
        <div>
          <div className="flex items-center text-amber-400 gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className="text-lg">
                {star <= Math.round(stats.averageRating) ? '★' : '☆'}
              </span>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Based on {stats.totalReviews} reviews</p>
        </div>
      </div>

      {/* Review Submission Form (Only for Consumers) */}
      {isConsumer && (
        <form onSubmit={handleSubmit} className="mb-5 p-4 rounded-xl border border-primary-100 bg-primary-50/10 space-y-4">
          <h4 className="text-xs font-semibold text-primary-900 uppercase tracking-wider">Write a Review</h4>
          
          {/* Interactive Star Picker */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Your Rating</label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-2xl transition-transform hover:scale-110 focus:outline-none"
                >
                  <span className={star <= (hoverRating || rating) ? 'text-amber-500' : 'text-slate-300'}>
                    ★
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Your Comment</label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about your experience with this grower..."
              className="input-field py-2 text-sm w-full"
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full py-2 text-xs font-semibold">
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
        {loading ? (
          <div className="flex justify-center py-6"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" /></div>
        ) : reviews.length === 0 ? (
          <p className="text-xs text-slate-500 italic text-center py-4 bg-slate-50/30 rounded border border-dashed">No reviews yet. Be the first to write one!</p>
        ) : (
          reviews.map((rev) => (
            <div key={rev._id} className="p-3 bg-white rounded-lg border border-slate-100 space-y-1.5 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="text-xs font-bold text-slate-800">{rev.consumerName}</h5>
                  <div className="flex items-center text-amber-500 gap-0.5 text-[10px]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star}>{star <= rev.rating ? '★' : '☆'}</span>
                    ))}
                  </div>
                </div>
                <span className="text-[9px] text-slate-400">
                  {new Date(rev.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              {rev.comment && <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-2 rounded">{rev.comment}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
