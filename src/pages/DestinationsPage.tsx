import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Destination } from '../lib/database.types';
import DestinationCard from '../components/DestinationCard';

interface DestinationsPageProps { onNavigate: (page: string, data?: unknown) => void; }

const CATEGORIES = ['all', 'beach', 'adventure', 'cultural', 'nature', 'city', 'mountain'];

export default function DestinationsPage({ onNavigate }: DestinationsPageProps) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [filtered, setFiltered] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);

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
            <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${showFilters ? 'bg-sky-600 text-white' : 'bg-gray-50 text-gray-700'}`}><SlidersHorizontal className="w-4 h-4" />Filters</button>
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
            <button key={cat} onClick={() => setCategory(cat)} className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium capitalize ${category === cat ? 'bg-sky-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-sky-300'}`}>{cat === 'all' ? 'All Categories' : cat}</button>
          ))}
        </div>
        <p className="text-gray-500 text-sm mb-5">{loading ? 'Loading...' : `${filtered.length} destination${filtered.length !== 1 ? 's' : ''} found`}</p>
        {loading ? (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{[...Array(6)].map((_, i) => (<div key={i} className="bg-white rounded-2xl h-72 animate-pulse" />))}</div>) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{filtered.map(dest => (<DestinationCard key={dest.id} destination={dest} onNavigate={onNavigate} />))}</div>
        )}
      </div>
    </div>
  );
}
