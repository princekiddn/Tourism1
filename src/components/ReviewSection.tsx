import { useState, useEffect } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Review } from '../lib/database.types';
import StarRating from './StarRating';

interface ReviewSectionProps {
  type: 'destination' | 'hotel' | 'package';
  itemId: string;
}

type ReviewWithUser = Review & { profiles?: { full_name: string } | null };

export default function ReviewSection({ type, itemId }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const col = type === 'destination' ? 'destination_id' : type === 'hotel' ? 'hotel_id' : 'package_id';
    supabase.from('reviews').select('*, profiles(full_name)').eq(col, itemId).order('created_at', { ascending: false }).then(({ data }) => {
      setReviews((data as ReviewWithUser[]) || []);
      setLoading(false);
    });
  }, [type, itemId]);

  if (loading) return <div className="py-4"><div className="h-20 bg-gray-100 rounded-xl animate-pulse" /></div>;
  if (reviews.length === 0) return null;

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const displayed = showAll ? reviews : reviews.slice(0, 3);

  return (
    <div className="mt-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-sky-600" />
          <h3 className="font-bold text-gray-900">Reviews</h3>
          <span className="text-sm text-gray-500">({reviews.length})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <StarRating rating={avgRating} size="sm" />
          <span className="text-sm font-semibold text-gray-700">{avgRating.toFixed(1)}</span>
        </div>
      </div>
      <div className="space-y-3">
        {displayed.map(review => (
          <div key={review.id} className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center text-xs font-bold text-sky-700">{(review.profiles?.full_name || 'U')[0].toUpperCase()}</div>
                <span className="text-sm font-medium text-gray-900">{review.profiles?.full_name || 'User'}</span>
              </div>
              <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1 mb-1"><StarRating rating={review.rating} size="sm" /></div>
            {review.title && <h4 className="font-semibold text-gray-900 text-sm">{review.title}</h4>}
            <p className="text-gray-600 text-sm mt-1">{review.body}</p>
          </div>
        ))}
      </div>
      {reviews.length > 3 && !showAll && (
        <button onClick={() => setShowAll(true)} className="w-full py-2.5 mt-3 text-sky-600 hover:bg-sky-50 rounded-xl text-sm font-medium transition-colors">Show all {reviews.length} reviews</button>
      )}
    </div>
  );
}
