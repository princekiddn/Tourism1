import { MapPin, Wifi, Coffee, Waves, Heart } from 'lucide-react';
import StarRating from './StarRating';
import { useAuth } from '../context/AuthContext';
import type { Hotel } from '../lib/database.types';

interface HotelCardProps { hotel: Hotel; onBook?: () => void; }

const amenityIcons: Record<string, React.ReactNode> = { 'Free WiFi': <Wifi className="w-3 h-3" />, Pool: <Waves className="w-3 h-3" />, Restaurant: <Coffee className="w-3 h-3" /> };

export default function HotelCard({ hotel, onBook }: HotelCardProps) {
  const { user, isInWishlist, toggleWishlist } = useAuth();
  const wishlisted = isInWishlist('hotel', hotel.id);
  const amenities = Array.isArray(hotel.amenities) ? hotel.amenities : [];

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    toggleWishlist('hotel', hotel.id);
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1 animate-fade-in">
      <div className="relative overflow-hidden h-48">
        <img src={hotel.image_url} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute top-3 right-3 bg-white text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">{'★'.repeat(hotel.star_rating)} {hotel.star_rating}-Star</div>
        {user && (
          <button onClick={handleHeartClick} className="absolute top-3 left-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-transform">
            <Heart className={`w-4 h-4 transition-colors ${wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
          </button>
        )}
        {!hotel.is_available && (<div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="text-white font-semibold bg-red-600 px-3 py-1 rounded-full text-sm">Fully Booked</span></div>)}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-base mb-1">{hotel.name}</h3>
        {hotel.address && (<div className="flex items-center gap-1 text-gray-500 text-xs mb-2"><MapPin className="w-3 h-3 shrink-0" /><span className="line-clamp-1">{hotel.address}</span></div>)}
        <p className="text-gray-500 text-sm line-clamp-2 mb-3">{hotel.description}</p>
        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {amenities.slice(0, 4).map((a) => (<span key={a} className="flex items-center gap-1 bg-sky-50 text-sky-700 text-xs px-2 py-0.5 rounded-full">{amenityIcons[a]}{a}</span>))}
            {amenities.length > 4 && (<span className="text-xs text-gray-400 px-2 py-0.5">+{amenities.length - 4}</span>)}
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5"><StarRating rating={hotel.rating} /><span className="text-sm font-medium text-gray-700">{hotel.rating.toFixed(1)}</span></div>
          <div className="text-right"><span className="text-sky-600 font-bold text-lg">${hotel.price_per_night}</span><span className="text-gray-400 text-xs">/night</span></div>
        </div>
        {onBook && (<button onClick={onBook} disabled={!hotel.is_available} className="w-full mt-3 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl text-sm font-semibold transition-colors">{hotel.is_available ? 'Book Now' : 'Unavailable'}</button>)}
      </div>
    </div>
  );
}
