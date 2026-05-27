import { useState, useEffect } from 'react';
import { Search, X, Star, MapPin, Wifi, Coffee, Waves, Heart, Calendar, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Hotel } from '../lib/database.types';
import StarRating from '../components/StarRating';
import ReviewSection from '../components/ReviewSection';

interface HotelsPageProps { onNavigate: (page: string, data?: unknown) => void; }

const amenityIcons: Record<string, React.ReactNode> = { 'Free WiFi': <Wifi className="w-4 h-4" />, Pool: <Waves className="w-4 h-4" />, Restaurant: <Coffee className="w-4 h-4" /> };

export default function HotelsPage({ onNavigate }: HotelsPageProps) {
  const { user, isInWishlist, toggleWishlist } = useAuth();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filtered, setFiltered] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [minStars, setMinStars] = useState(1);
  const [maxPrice, setMaxPrice] = useState(2000);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

  useEffect(() => {
    supabase.from('hotels').select('*').then(({ data }) => {
      if (data) { setHotels(data); setFiltered(data); }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let result = [...hotels];
    if (search) { const q = search.toLowerCase(); result = result.filter(h => h.name.toLowerCase().includes(q) || h.address.toLowerCase().includes(q)); }
    result = result.filter(h => h.star_rating >= minStars && h.price_per_night <= maxPrice);
    result.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price_asc') return a.price_per_night - a.price_per_night;
      if (sortBy === 'price_desc') return b.price_per_night - a.price_per_night;
      return 0;
    });
    setFiltered(result);
  }, [search, sortBy, minStars, maxPrice, hotels]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-64 overflow-hidden">
        <img src="https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg" alt="Hotels" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Hotels & Resorts</h1>
          <div className="flex items-center gap-1 text-white/70 text-sm"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />World-class accommodations</div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex items-center gap-2 flex-1 bg-gray-50 rounded-xl px-4 py-2.5">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input type="text" placeholder="Search hotels..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent text-sm outline-none" />
              {search && (<button onClick={() => setSearch('')}><X className="w-4 h-4 text-gray-400" /></button>)}
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-gray-50 border-0 rounded-xl px-4 py-2.5 text-sm outline-none">
              <option value="rating">Top Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Min Stars: {minStars}</label>
              <input type="range" min={1} max={5} value={minStars} onChange={e => setMinStars(parseInt(e.target.value))} className="w-full accent-sky-600" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Max Price: ${maxPrice}</label>
              <input type="range" min={50} max={2000} step={50} value={maxPrice} onChange={e => setMaxPrice(parseInt(e.target.value))} className="w-full accent-sky-600" />
            </div>
          </div>
        </div>
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4, 5].map(s => (<button key={s} onClick={() => setMinStars(s)} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all ${minStars === s ? 'bg-sky-600 text-white' : 'bg-white text-gray-600 border'}`}>{s}<Star className="w-3 h-3 fill-current" /></button>))}
        </div>
        <p className="text-gray-500 text-sm mb-5">{filtered.length} hotels found</p>
        {loading ? (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{[...Array(8)].map((_, i) => (<div key={i} className="bg-white rounded-2xl h-72 animate-pulse" />))}</div>) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(hotel => {
              const wishlisted = isInWishlist('hotel', hotel.id);
              const amenities = Array.isArray(hotel.amenities) ? hotel.amenities : [];
              return (
                <div key={hotel.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1 cursor-pointer animate-fade-in" onClick={() => setSelectedHotel(hotel)}>
                  <div className="relative overflow-hidden h-48">
                    <img src={hotel.image_url} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <div className="absolute top-3 right-3 bg-white text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">{'★'.repeat(hotel.star_rating)} {hotel.star_rating}-Star</div>
                    {user && (
                      <button onClick={e => { e.stopPropagation(); toggleWishlist('hotel', hotel.id); }} className="absolute top-3 left-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                        <Heart className={`w-4 h-4 transition-colors ${wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                      </button>
                    )}
                    {!hotel.is_available && (<div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="text-white font-semibold bg-red-600 px-3 py-1 rounded-full text-sm">Fully Booked</span></div>)}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-base mb-1">{hotel.name}</h3>
                    {hotel.address && (<div className="flex items-center gap-1 text-gray-500 text-xs mb-2"><MapPin className="w-3 h-3 shrink-0" /><span className="line-clamp-1">{hotel.address}</span></div>)}
                    {amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {amenities.slice(0, 3).map((a) => (<span key={a} className="flex items-center gap-1 bg-sky-50 text-sky-700 text-xs px-2 py-0.5 rounded-full">{amenityIcons[a]}{a}</span>))}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5"><StarRating rating={hotel.rating} size="sm" /><span className="text-sm font-medium text-gray-700">{hotel.rating.toFixed(1)}</span></div>
                      <div className="text-right"><span className="text-sky-600 font-bold text-lg">${hotel.price_per_night}</span><span className="text-gray-400 text-xs">/night</span></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Hotel Detail Modal */}
      {selectedHotel && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 px-4 pt-20 overflow-y-auto" onClick={() => setSelectedHotel(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full mb-8 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="relative h-64 rounded-t-2xl overflow-hidden">
              <img src={selectedHotel.image_url} alt={selectedHotel.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button onClick={() => setSelectedHotel(null)} className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"><X className="w-4 h-4" /></button>
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-3xl font-bold text-white mb-1">{selectedHotel.name}</h2>
                <div className="flex items-center gap-2 text-white/90 text-sm"><MapPin className="w-3.5 h-3.5" />{selectedHotel.address}</div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-amber-500">{'★'.repeat(selectedHotel.star_rating)}</span>
                  <StarRating rating={selectedHotel.rating} size="lg" />
                  <span className="text-lg font-semibold">{selectedHotel.rating.toFixed(1)}</span>
                </div>
                <div className="text-sky-600 font-bold text-2xl">${selectedHotel.price_per_night}<span className="text-gray-400 text-sm font-normal">/night</span></div>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">{selectedHotel.description}</p>
              {Array.isArray(selectedHotel.amenities) && selectedHotel.amenities.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedHotel.amenities.map((a) => (<span key={a} className="flex items-center gap-1.5 bg-sky-50 text-sky-700 text-sm px-3 py-1.5 rounded-full">{amenityIcons[a] || <Coffee className="w-4 h-4" />}{a}</span>))}
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => { setSelectedHotel(null); onNavigate('booking', { type: 'hotel', item: selectedHotel }); }} disabled={!selectedHotel.is_available} className="flex-1 bg-sky-600 hover:bg-sky-700 disabled:bg-gray-200 disabled:text-gray-400 text-white py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"><Calendar className="w-4 h-4" />{selectedHotel.is_available ? 'Book Now' : 'Unavailable'}</button>
                {user && (
                  <button onClick={() => toggleWishlist('hotel', selectedHotel.id)} className={`px-4 py-3 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2 ${isInWishlist('hotel', selectedHotel.id) ? 'bg-red-50 text-red-600' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}><Heart className={`w-4 h-4 ${isInWishlist('hotel', selectedHotel.id) ? 'fill-red-500' : ''}`} />{isInWishlist('hotel', selectedHotel.id) ? 'Saved' : 'Save'}</button>
                )}
              </div>
              <div className="mt-6 border-t border-gray-100 pt-6">
                <ReviewSection type="hotel" itemId={selectedHotel.id} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
