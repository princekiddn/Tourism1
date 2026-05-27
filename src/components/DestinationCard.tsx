import { MapPin, TrendingUp, Heart } from 'lucide-react';
import StarRating from './StarRating';
import { useAuth } from '../context/AuthContext';
import type { Destination } from '../lib/database.types';

interface DestinationCardProps { destination: Destination; onNavigate: (page: string, data?: unknown) => void; }

const categoryColors: Record<string, string> = { beach: 'bg-cyan-100 text-cyan-700', adventure: 'bg-orange-100 text-orange-700', cultural: 'bg-amber-100 text-amber-700', nature: 'bg-green-100 text-green-700', city: 'bg-blue-100 text-blue-700', mountain: 'bg-slate-100 text-slate-700' };

export default function DestinationCard({ destination, onNavigate }: DestinationCardProps) {
  const { user, isInWishlist, toggleWishlist } = useAuth();
  const wishlisted = isInWishlist('destination', destination.id);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    toggleWishlist('destination', destination.id);
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:-translate-y-1 animate-fade-in" onClick={() => onNavigate('destinations', destination)}>
      <div className="relative overflow-hidden h-52">
        <img src={destination.image_url} alt={destination.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {destination.is_featured && (<div className="absolute top-3 left-3 flex items-center gap-1 bg-sky-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full"><TrendingUp className="w-3 h-3" />Featured</div>)}
        <div className={`absolute top-3 right-3 text-xs font-medium px-2.5 py-1 rounded-full capitalize ${categoryColors[destination.category] || 'bg-gray-100 text-gray-700'}`}>{destination.category}</div>
        {user && (
          <button onClick={handleHeartClick} className="absolute bottom-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-transform">
            <Heart className={`w-4 h-4 transition-colors ${wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
          </button>
        )}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white text-sm"><MapPin className="w-3.5 h-3.5" /><span>{destination.country}</span></div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-gray-900 text-lg">{destination.name}</h3>
          <span className="text-sky-600 font-bold text-sm">${destination.price_per_day}/day</span>
        </div>
        <p className="text-gray-500 text-sm line-clamp-2 mb-3">{destination.description}</p>
        <div className="flex items-center gap-1.5"><StarRating rating={destination.rating} /><span className="text-sm font-medium text-gray-700">{destination.rating.toFixed(1)}</span></div>
      </div>
    </div>
  );
}
