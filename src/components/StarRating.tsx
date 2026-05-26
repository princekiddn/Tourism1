import { Star } from 'lucide-react';

interface StarRatingProps { rating: number; max?: number; size?: 'sm' | 'md' | 'lg'; interactive?: boolean; onChange?: (rating: number) => void; }

export default function StarRating({ rating, max = 5, size = 'sm', interactive = false, onChange }: StarRatingProps) {
  const sizeClass = size === 'sm' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6';
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.floor(rating);
        const partial = !filled && i < rating;
        return (
          <button key={i} type={interactive ? 'button' : undefined} onClick={interactive && onChange ? () => onChange(i + 1) : undefined} className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}>
            <Star className={`${sizeClass} ${filled ? 'text-amber-400 fill-amber-400' : partial ? 'text-amber-400 fill-amber-200' : 'text-gray-300 fill-gray-100'}`} />
          </button>
        );
      })}
    </div>
  );
}
