import { useState, useEffect } from 'react';
import { Search, X, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Hotel } from '../lib/database.types';
import HotelCard from '../components/HotelCard';

interface HotelsPageProps { onNavigate: (page: string, data?: unknown) => void; }

export default function HotelsPage({ onNavigate }: HotelsPageProps) {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filtered, setFiltered] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [minStars, setMinStars] = useState(1);
  const [maxPrice, setMaxPrice] = useState(2000);

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
      if (sortBy === 'price_asc') return a.price_per_night - b.price_per_night;
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{filtered.map(hotel => (<HotelCard key={hotel.id} hotel={hotel} onBook={() => onNavigate('booking', { type: 'hotel', item: hotel })} />))}</div>
        )}
      </div>
    </div>
  );
}
