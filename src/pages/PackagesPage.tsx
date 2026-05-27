import { useState, useEffect } from 'react';
import { Search, X, Calendar, Users, CheckCircle, TrendingUp, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { TourPackage } from '../lib/database.types';
import StarRating from '../components/StarRating';
import ReviewSection from '../components/ReviewSection';

interface PackagesPageProps { onNavigate: (page: string, data?: unknown) => void; }

export default function PackagesPage({ onNavigate }: PackagesPageProps) {
  const { user, isInWishlist, toggleWishlist } = useAuth();
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [filtered, setFiltered] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [maxDays, setMaxDays] = useState(30);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [selectedPackage, setSelectedPackage] = useState<TourPackage | null>(null);

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(pkg => {
              const wishlisted = isInWishlist('package', pkg.id);
              const includes = Array.isArray(pkg.includes) ? pkg.includes : [];
              return (
                <div key={pkg.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1 flex flex-col cursor-pointer animate-fade-in" onClick={() => setSelectedPackage(pkg)}>
                  <div className="relative overflow-hidden h-52">
                    <img src={pkg.image_url} alt={pkg.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    {pkg.is_featured && (<div className="absolute top-3 left-3 flex items-center gap-1 bg-sky-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full"><TrendingUp className="w-3 h-3" />Popular</div>)}
                    {user && (
                      <button onClick={e => { e.stopPropagation(); toggleWishlist('package', pkg.id); }} className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                        <Heart className={`w-4 h-4 transition-colors ${wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                      </button>
                    )}
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-center gap-3 text-white text-xs">
                        <span className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full"><Calendar className="w-3 h-3" />{pkg.duration_days} days</span>
                        <span className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full"><Users className="w-3 h-3" />Max {pkg.max_people}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-gray-900 text-base mb-2">{pkg.name}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-3 flex-1">{pkg.description}</p>
                    {includes.length > 0 && (
                      <div className="space-y-1 mb-4">
                        {includes.slice(0, 3).map((item) => (<div key={item} className="flex items-center gap-1.5 text-xs text-gray-600"><CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />{item}</div>))}
                        {includes.length > 3 && (<div className="text-xs text-gray-400 pl-5">+{includes.length - 3} more</div>)}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div><span className="text-sky-600 font-bold text-xl">${pkg.price.toLocaleString()}</span><span className="text-gray-400 text-xs ml-1">/person</span></div>
                      <button onClick={e => { e.stopPropagation(); onNavigate('booking', { type: 'package', item: pkg }); }} disabled={!pkg.is_active} className="px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-gray-200 text-white rounded-xl text-sm font-semibold transition-colors">Book Now</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Package Detail Modal */}
      {selectedPackage && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 px-4 pt-20 overflow-y-auto" onClick={() => setSelectedPackage(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full mb-8 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="relative h-64 rounded-t-2xl overflow-hidden">
              <img src={selectedPackage.image_url} alt={selectedPackage.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button onClick={() => setSelectedPackage(null)} className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"><X className="w-4 h-4" /></button>
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-3xl font-bold text-white mb-1">{selectedPackage.name}</h2>
                <div className="flex items-center gap-3 text-white/90 text-sm">
                  <span className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full"><Calendar className="w-3.5 h-3.5" />{selectedPackage.duration_days} days</span>
                  <span className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full"><Users className="w-3.5 h-3.5" />Max {selectedPackage.max_people}</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2"><StarRating rating={selectedPackage.is_featured ? 4.5 : 4} size="lg" /><span className="text-lg font-semibold">{(selectedPackage.is_featured ? 4.5 : 4).toFixed(1)}</span></div>
                <div className="text-sky-600 font-bold text-2xl">${selectedPackage.price.toLocaleString()}<span className="text-gray-400 text-sm font-normal">/person</span></div>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">{selectedPackage.description}</p>
              {Array.isArray(selectedPackage.includes) && selectedPackage.includes.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 text-sm mb-2">What's Included</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedPackage.includes.map((item) => (<div key={item} className="flex items-center gap-1.5 text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-green-500 shrink-0" />{item}</div>))}
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => { setSelectedPackage(null); onNavigate('booking', { type: 'package', item: selectedPackage }); }} disabled={!selectedPackage.is_active} className="flex-1 bg-sky-600 hover:bg-sky-700 disabled:bg-gray-200 disabled:text-gray-400 text-white py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"><Calendar className="w-4 h-4" />Book Now</button>
                {user && (
                  <button onClick={() => toggleWishlist('package', selectedPackage.id)} className={`px-4 py-3 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2 ${isInWishlist('package', selectedPackage.id) ? 'bg-red-50 text-red-600' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}><Heart className={`w-4 h-4 ${isInWishlist('package', selectedPackage.id) ? 'fill-red-500' : ''}`} />{isInWishlist('package', selectedPackage.id) ? 'Saved' : 'Save'}</button>
                )}
              </div>
              <div className="mt-6 border-t border-gray-100 pt-6">
                <ReviewSection type="package" itemId={selectedPackage.id} />
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
