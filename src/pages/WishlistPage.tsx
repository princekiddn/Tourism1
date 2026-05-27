import { useState, useEffect } from 'react';
import { Heart, MapPin, Star, Calendar, Trash2, Hotel, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Destination, Hotel as HotelType, TourPackage, Wishlist } from '../lib/database.types';
import StarRating from '../components/StarRating';

interface WishlistPageProps { onNavigate: (page: string, data?: unknown) => void; }

type WishlistItem = Wishlist & {
  destinations?: Destination | null;
  hotels?: HotelType | null;
  tour_packages?: TourPackage | null;
};

export default function WishlistPage({ onNavigate }: WishlistPageProps) {
  const { user, wishlist, toggleWishlist } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data } = await supabase
        .from('wishlists')
        .select('*, destinations(*), hotels(*), tour_packages(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setItems(data as WishlistItem[] || []);
      setLoading(false);
    };
    fetchData();
  }, [user, wishlist]);

  const handleRemove = async (itemType: 'destination' | 'hotel' | 'package', itemId: string) => {
    await toggleWishlist(itemType, itemId);
    setItems(prev => prev.filter(i => !(i.item_type === itemType && i.item_id === itemId)));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center px-4">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sign in to view your wishlist</h2>
          <button onClick={() => onNavigate('login')} className="text-sky-600 font-medium hover:underline">Sign In</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-500 text-sm mt-0.5">{items.length} saved item{items.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{[...Array(3)].map((_, i) => (<div key={i} className="bg-white rounded-2xl h-64 animate-pulse" />))}</div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-gray-500 font-medium mb-2">Your wishlist is empty</h3>
            <p className="text-gray-400 text-sm mb-4">Save destinations, hotels, and packages you love.</p>
            <button onClick={() => onNavigate('destinations')} className="text-sky-600 font-medium hover:underline">Explore Destinations</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => {
              const isDestination = item.item_type === 'destination';
              const isHotel = item.item_type === 'hotel';
              const isPackage = item.item_type === 'package';
              const data = item.destinations || item.hotels || item.tour_packages;
              if (!data) return null;

              return (
                <div key={item.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 animate-fade-in">
                  <div className="relative overflow-hidden h-48">
                    <img src={data.image_url} alt={data.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="flex items-center gap-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">
                        {isDestination && <MapPin className="w-3 h-3" />}
                        {isHotel && <Hotel className="w-3 h-3" />}
                        {isPackage && <Package className="w-3 h-3" />}
                        {item.item_type}
                      </span>
                    </div>
                    <button onClick={() => handleRemove(item.item_type, item.item_id)} className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-50 transition-colors group/btn">
                      <Trash2 className="w-4 h-4 text-red-500 group-hover/btn:text-red-600" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{data.name}</h3>
                    {isDestination && (
                      <div className="flex items-center gap-1 text-gray-500 text-sm mb-2"><MapPin className="w-3 h-3" />{(data as Destination).country}</div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <StarRating rating={data.rating} size="sm" />
                        <span className="text-sm font-medium text-gray-700">{data.rating.toFixed(1)}</span>
                      </div>
                      <div className="text-sky-600 font-bold">
                        ${isHotel ? (data as HotelType).price_per_night + '/night' : isPackage ? (data as TourPackage).price.toLocaleString() + '/pp' : (data as Destination).price_per_day + '/day'}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (isHotel) onNavigate('booking', { type: 'hotel', item: data });
                        else if (isPackage) onNavigate('booking', { type: 'package', item: data });
                        else onNavigate('destinations');
                      }}
                      className="w-full mt-3 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-semibold transition-colors"
                    >
                      {isHotel || isPackage ? 'Book Now' : 'View Details'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
