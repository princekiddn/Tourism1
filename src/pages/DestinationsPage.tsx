import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X, MapPin, Heart, Calendar, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Destination } from '../lib/database.types';
import StarRating from '../components/StarRating';
import ReviewSection from '../components/ReviewSection';

interface DestinationsPageProps { onNavigate: (page: string, data?: unknown) => void; }

const CATEGORIES = ['all', 'beach', 'adventure', 'cultural', 'nature', 'city', 'mountain'];
const categoryColors: Record<string, string> = { beach: 'bg-cyan-100 text-cyan-700', adventure: 'bg-orange-100 text-orange-700', cultural: 'bg-amber-100 text-amber-700', nature: 'bg-green-100 text-green-700', city: 'bg-blue-100 text-blue-700', mountain: 'bg-slate-100 text-slate-700' };

export default function DestinationsPage({ onNavigate }: DestinationsPageProps) {
  const { user, isInWishlist, toggleWishlist } = useAuth();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [filtered, setFiltered] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);

  useEffect(() => {
    supabase.from('destinations').select('*').then(({ data }) => {
      if (data) { setDestinations(data); setFiltered(data); }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let result = [...destinations];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(d => d.name.toLowerCase().includes(q) || d.country.toLowerCase().includes(q) || d.city.toLowerCase().includes(q));
    }
    if (category !== 'all') result = result.filter(d => d.category === category);
    result = result.filter(d => d.price_per_day >= priceRange[0] && d.price_per_day <= priceRange[1]);
    result.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price_asc') return a.price_per_day - b.price_per_day;
      if (sortBy === 'price_desc') return b.price_per_day - a.price_per_day;
      return 0;
    });
    setFiltered(result);
  }, [search, category, sortBy, priceRange, destinations]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-64 overflow-hidden">
        <img src="https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg" alt="Destinations" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">All Destinations</h1>
          <div className="flex items-center gap-1 text-white/70 text-sm"><MapPin className="w-3.5 h-3.5" />{destinations.length} places worldwide</div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 flex-1 bg-gray-50 rounded-xl px-4 py-2.5">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input type="text" placeholder="Search destinations..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder-gray-400" />
              {search && (<button onClick={() => setSearch('')}><X className="w-4 h-4 text-gray-400" /></button>)}
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-gray-50 border-0 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none">
              <option value="rating">Top Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
            <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${showFilters ? 'bg-sky-600 text-white' : 'bg-gray-50 text-gray-700'}`}><SlidersHorizontal className="w-4 h-4" />Filters</button>
          </div>
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <label className="text-xs font-semibold text-gray-500 uppercase mb-3 block">Max Price/Day: ${priceRange[1]}</label>
              <input type="range" min={0} max={1000} step={10} value={priceRange[1]} onChange={e => setPriceRange([0, parseInt(e.target.value)])} className="w-full accent-sky-600" />
            </div>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${category === cat ? 'bg-sky-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-sky-300'}`}>{cat === 'all' ? 'All Categories' : cat}</button>
          ))}
        </div>
        <p className="text-gray-500 text-sm mb-5">{loading ? 'Loading...' : `${filtered.length} destination${filtered.length !== 1 ? 's' : ''} found`}</p>
        {loading ? (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{[...Array(6)].map((_, i) => (<div key={i} className="bg-white rounded-2xl h-72 animate-pulse" />))}</div>) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(dest => {
              const wishlisted = isInWishlist('destination', dest.id);
              return (
                <div key={dest.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:-translate-y-1 animate-fade-in" onClick={() => setSelectedDestination(dest)}>
                  <div className="relative overflow-hidden h-52">
                    <img src={dest.image_url} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    {dest.is_featured && (<div className="absolute top-3 left-3 flex items-center gap-1 bg-sky-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full"><TrendingUp className="w-3 h-3" />Featured</div>)}
                    <div className={`absolute top-3 right-3 text-xs font-medium px-2.5 py-1 rounded-full capitalize ${categoryColors[dest.category] || 'bg-gray-100 text-gray-700'}`}>{dest.category}</div>
                    {user && (
                      <button onClick={e => { e.stopPropagation(); toggleWishlist('destination', dest.id); }} className="absolute bottom-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                        <Heart className={`w-4 h-4 transition-colors ${wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                      </button>
                    )}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white text-sm"><MapPin className="w-3.5 h-3.5" /><span>{dest.country}</span></div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-gray-900 text-lg">{dest.name}</h3>
                      <span className="text-sky-600 font-bold text-sm">${dest.price_per_day}/day</span>
                    </div>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-3">{dest.description}</p>
                    <div className="flex items-center gap-1.5"><StarRating rating={dest.rating} /><span className="text-sm font-medium text-gray-700">{dest.rating.toFixed(1)}</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Destination Detail Modal */}
      {selectedDestination && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 px-4 pt-20 overflow-y-auto" onClick={() => setSelectedDestination(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full mb-8 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="relative h-64 rounded-t-2xl overflow-hidden">
              <img src={selectedDestination.image_url} alt={selectedDestination.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button onClick={() => setSelectedDestination(null)} className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"><X className="w-4 h-4" /></button>
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-3xl font-bold text-white mb-1">{selectedDestination.name}</h2>
                <div className="flex items-center gap-3 text-white/90 text-sm">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{selectedDestination.city && selectedDestination.city + ', '}{selectedDestination.country}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${categoryColors[selectedDestination.category] || 'bg-gray-100 text-gray-700'}`}>{selectedDestination.category}</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2"><StarRating rating={selectedDestination.rating} size="lg" /><span className="text-lg font-semibold text-gray-900">{selectedDestination.rating.toFixed(1)}</span></div>
                <div className="text-sky-600 font-bold text-2xl">${selectedDestination.price_per_day}<span className="text-gray-400 text-sm font-normal">/day</span></div>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">{selectedDestination.description}</p>
              <div className="flex gap-3">
                <button onClick={() => { setSelectedDestination(null); onNavigate('booking', { type: 'package', item: selectedDestination }); }} className="flex-1 bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"><Calendar className="w-4 h-4" />Book a Trip</button>
                {user && (
                  <button onClick={() => toggleWishlist('destination', selectedDestination.id)} className={`px-4 py-3 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2 ${isInWishlist('destination', selectedDestination.id) ? 'bg-red-50 text-red-600' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}><Heart className={`w-4 h-4 ${isInWishlist('destination', selectedDestination.id) ? 'fill-red-500' : ''}`} />{isInWishlist('destination', selectedDestination.id) ? 'Saved' : 'Save'}</button>
                )}
              </div>
              <div className="mt-6 border-t border-gray-100 pt-6">
                <ReviewSection type="destination" itemId={selectedDestination.id} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TrendingUp({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
  );
}
