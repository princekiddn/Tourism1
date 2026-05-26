import { useState, useEffect } from 'react';
import { Search, MapPin, ArrowRight, Shield, Headphones, Award, Users, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Destination, TourPackage } from '../lib/database.types';
import DestinationCard from '../components/DestinationCard';
import PackageCard from '../components/PackageCard';

interface HomePageProps { onNavigate: (page: string, data?: unknown) => void; }

export default function HomePage({ onNavigate }: HomePageProps) {
  const [featuredDestinations, setFeaturedDestinations] = useState<Destination[]>([]);
  const [featuredPackages, setFeaturedPackages] = useState<TourPackage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [destRes, pkgRes] = await Promise.all([supabase.from('destinations').select('*').eq('is_featured', true).limit(6), supabase.from('tour_packages').select('*').eq('is_featured', true).limit(4)]);
      if (destRes.data) setFeaturedDestinations(destRes.data);
      if (pkgRes.data) setFeaturedPackages(pkgRes.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSearch = () => { if (searchQuery.trim()) onNavigate('destinations'); };

  const stats = [{ value: '50K+', label: 'Happy Travelers' }, { value: '120+', label: 'Destinations' }, { value: '500+', label: 'Tour Packages' }, { value: '4.9', label: 'Avg. Rating' }];
  const features = [
    { icon: Shield, title: 'Safe & Secure', desc: 'Bank-grade security for payments and personal data.' },
    { icon: Headphones, title: '24/7 Support', desc: 'Expert travel consultants available around the clock.' },
    { icon: Award, title: 'Best Price Guarantee', desc: 'Found a lower price? We match and give 10% off.' },
    { icon: Users, title: 'Expert Guides', desc: 'Local experts curate every itinerary.' },
  ];
  const testimonials = [
    { name: 'Sarah Johnson', location: 'Bali Trip', rating: 5, text: 'WanderLux made our Bali honeymoon absolutely magical. Every detail was perfect.', avatar: 'S' },
    { name: 'Michael Chen', location: 'Japan Tour', rating: 5, text: 'The Kyoto cultural immersion package exceeded all expectations.', avatar: 'M' },
    { name: 'Emma Williams', location: 'Santorini', rating: 5, text: 'From booking to checkout, the experience was seamless.', avatar: 'E' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.pexels.com/photos/1483024/pexels-photo-1483024.jpeg" alt="Hero" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm px-4 py-2 rounded-full mb-6"><Star className="w-4 h-4 text-amber-400 fill-amber-400" />Rated #1 Travel Platform 2026</div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">Explore The World's<span className="block text-sky-400">Hidden Wonders</span></h1>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">Discover breathtaking destinations, handcrafted tour packages, and world-class hotels.</p>
          <div className="bg-white rounded-2xl p-2 shadow-2xl flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 flex-1 px-3"><MapPin className="w-5 h-5 text-sky-500 shrink-0" /><input type="text" placeholder="Where do you want to go?" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} className="flex-1 text-gray-700 placeholder-gray-400 outline-none py-2 text-sm" /></div>
            <button onClick={handleSearch} className="flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors text-sm"><Search className="w-4 h-4" />Search</button>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm text-white/70">
            {['Bali', 'Santorini', 'Kyoto', 'Maldives', 'Patagonia'].map(place => (<button key={place} onClick={() => onNavigate('destinations')} className="hover:text-white underline underline-offset-2">{place}</button>))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-sky-600 py-14">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map(stat => (<div key={stat.label}><div className="text-4xl font-bold text-white mb-1">{stat.value}</div><div className="text-sky-200 text-sm">{stat.label}</div></div>))}
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div><p className="text-sky-600 font-semibold text-sm uppercase tracking-widest mb-2">Explore the Globe</p><h2 className="text-4xl font-bold text-gray-900">Featured Destinations</h2></div>
            <button onClick={() => onNavigate('destinations')} className="hidden sm:flex items-center gap-1.5 text-sky-600 font-semibold hover:gap-3 transition-all text-sm">View All <ArrowRight className="w-4 h-4" /></button>
          </div>
          {loading ? (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{[...Array(6)].map((_, i) => (<div key={i} className="bg-gray-100 rounded-2xl h-72 animate-pulse" />))}</div>) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{featuredDestinations.map(dest => (<DestinationCard key={dest.id} destination={dest} onNavigate={onNavigate} />))}</div>
          )}
        </div>
      </section>

      {/* Tour Packages */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div><p className="text-sky-600 font-semibold text-sm uppercase tracking-widest mb-2">Curated Experiences</p><h2 className="text-4xl font-bold text-gray-900">Popular Packages</h2></div>
          </div>
          {loading ? (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{[...Array(4)].map((_, i) => (<div key={i} className="bg-white rounded-2xl h-80 animate-pulse" />))}</div>) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{featuredPackages.map(pkg => (<PackageCard key={pkg.id} pkg={pkg} onBook={() => onNavigate('booking', { type: 'package', item: pkg })} />))}</div>
          )}
        </div>
      </section>

      {/* Why Us */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14"><p className="text-sky-600 font-semibold text-sm uppercase tracking-widest mb-2">Why Choose Us</p><h2 className="text-4xl font-bold text-gray-900 mb-4">Travel With Confidence</h2></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map(f => (
              <div key={f.title} className="text-center group">
                <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-sky-600 transition-colors"><f.icon className="w-7 h-7 text-sky-600 group-hover:text-white transition-colors" /></div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14"><p className="text-sky-600 font-semibold text-sm uppercase tracking-widest mb-2">What Travelers Say</p><h2 className="text-4xl font-bold text-gray-900">Real Stories</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-0.5 mb-4">{Array.from({ length: t.rating }, (_, i) => (<Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />))}</div>
                <p className="text-gray-700 text-sm mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold text-sm">{t.avatar}</div><div><div className="font-semibold text-gray-900 text-sm">{t.name}</div><div className="text-gray-500 text-xs">{t.location}</div></div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg" alt="CTA" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-sky-900/80" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Ready for Your Next Adventure?</h2>
          <p className="text-sky-200 text-lg mb-8">Join thousands of travelers who trust WanderLux.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => onNavigate('packages')} className="bg-white text-sky-700 hover:bg-sky-50 px-8 py-3.5 rounded-xl font-semibold transition-colors">Explore Packages</button>
            <button onClick={() => onNavigate('register')} className="bg-sky-600 hover:bg-sky-500 border border-white/30 text-white px-8 py-3.5 rounded-xl font-semibold transition-colors">Sign Up Free</button>
          </div>
        </div>
      </section>
    </div>
  );
}
