import { useState, useEffect } from 'react';
import { Search, X, Calendar, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { TourPackage } from '../lib/database.types';
import PackageCard from '../components/PackageCard';

interface PackagesPageProps { onNavigate: (page: string, data?: unknown) => void; }

export default function PackagesPage({ onNavigate }: PackagesPageProps) {
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [filtered, setFiltered] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [maxDays, setMaxDays] = useState(30);
  const [maxPrice, setMaxPrice] = useState(10000);

  useEffect(() => {
    supabase.from('tour_packages').select('*').eq('is_active', true).then(({ data }) => {
      if (data) { setPackages(data); setFiltered(data); }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let result = [...packages];
    if (search) { const q = search.toLowerCase(); result = result.filter(p => p.name.toLowerCase().includes(q)); }
    result = result.filter(p => p.duration_days <= maxDays && p.price <= maxPrice);
    result.sort((a, b) => {
      if (sortBy === 'featured') return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return 0;
    });
    setFiltered(result);
  }, [search, sortBy, maxDays, maxPrice, packages]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-64 overflow-hidden">
        <img src="https://images.pexels.com/photos/2929906/pexels-photo-2929906.jpeg" alt="Packages" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Tour Packages</h1>
          <div className="flex items-center gap-4 text-white/70 text-sm"><span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Multi-day</span><span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />Groups</span></div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex items-center gap-2 flex-1 bg-gray-50 rounded-xl px-4 py-2.5">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input type="text" placeholder="Search packages..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent text-sm outline-none" />
              {search && (<button onClick={() => setSearch('')}><X className="w-4 h-4 text-gray-400" /></button>)}
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-gray-50 border-0 rounded-xl px-4 py-2.5 text-sm outline-none">
              <option value="featured">Most Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Max Duration: {maxDays} days</label>
              <input type="range" min={1} max={30} value={maxDays} onChange={e => setMaxDays(parseInt(e.target.value))} className="w-full accent-sky-600" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Max Price: ${maxPrice.toLocaleString()}</label>
              <input type="range" min={100} max={10000} step={100} value={maxPrice} onChange={e => setMaxPrice(parseInt(e.target.value))} className="w-full accent-sky-600" />
            </div>
          </div>
        </div>
        <p className="text-gray-500 text-sm mb-5">{filtered.length} packages available</p>
        {loading ? (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{[...Array(8)].map((_, i) => (<div key={i} className="bg-white rounded-2xl h-80 animate-pulse" />))}</div>) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{filtered.map(pkg => (<PackageCard key={pkg.id} pkg={pkg} onBook={() => onNavigate('booking', { type: 'package', item: pkg })} />))}</div>
        )}
      </div>
    </div>
  );
}
