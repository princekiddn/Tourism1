import { useState, useEffect, useRef } from 'react';
import { Menu, X, Globe, User, LogOut, LayoutDashboard, ChevronDown, Search, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { Destination, Hotel, TourPackage } from '../lib/database.types';

interface NavbarProps { currentPage: string; onNavigate: (page: string) => void; }

type SearchResult = { type: 'destination' | 'hotel' | 'package'; id: string; name: string; image_url: string; subtitle: string };

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { user, profile, signOut, isAdmin, wishlist } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [allDestinations, setAllDestinations] = useState<Destination[]>([]);
  const [allHotels, setAllHotels] = useState<Hotel[]>([]);
  const [allPackages, setAllPackages] = useState<TourPackage[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    Promise.all([
      supabase.from('destinations').select('*'),
      supabase.from('hotels').select('*'),
      supabase.from('tour_packages').select('*').eq('is_active', true),
    ]).then(([d, h, p]) => {
      if (d.data) setAllDestinations(d.data);
      if (h.data) setAllHotels(h.data);
      if (p.data) setAllPackages(p.data);
    });
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const q = searchQuery.toLowerCase();
    const results: SearchResult[] = [];
    allDestinations.filter(d => d.name.toLowerCase().includes(q) || d.country.toLowerCase().includes(q)).slice(0, 3).forEach(d => results.push({ type: 'destination', id: d.id, name: d.name, image_url: d.image_url, subtitle: d.country }));
    allHotels.filter(h => h.name.toLowerCase().includes(q) || h.address.toLowerCase().includes(q)).slice(0, 3).forEach(h => results.push({ type: 'hotel', id: h.id, name: h.name, image_url: h.image_url, subtitle: h.address }));
    allPackages.filter(p => p.name.toLowerCase().includes(q)).slice(0, 3).forEach(p => results.push({ type: 'package', id: p.id, name: p.name, image_url: p.image_url, subtitle: `${p.duration_days} days` }));
    setSearchResults(results);
  }, [searchQuery, allDestinations, allHotels, allPackages]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const navLinks = [{ key: 'home', label: 'Home' }, { key: 'destinations', label: 'Destinations' }, { key: 'packages', label: 'Packages' }, { key: 'hotels', label: 'Hotels' }];

  const handleNav = (page: string) => { onNavigate(page); setMenuOpen(false); setUserDropdown(false); setSearchOpen(false); };
  const handleSignOut = async () => { await signOut(); setUserDropdown(false); onNavigate('home'); };

  const isTransparent = currentPage === 'home' && !scrolled;

  const handleSearchResult = (result: SearchResult) => {
    if (result.type === 'destination') onNavigate('destinations');
    else if (result.type === 'hotel') onNavigate('hotels');
    else onNavigate('packages');
    setSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isTransparent ? 'bg-transparent' : 'bg-white shadow-lg'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => handleNav('home')} className="flex items-center gap-2 font-bold text-xl">
            <div className={`p-1.5 rounded-lg ${isTransparent ? 'bg-white/20' : 'bg-sky-600'}`}><Globe className="w-5 h-5 text-white" /></div>
            <span className={isTransparent ? 'text-white' : 'text-sky-600'}>WanderLux</span>
          </button>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <button key={link.key} onClick={() => handleNav(link.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentPage === link.key ? (isTransparent ? 'bg-white/20 text-white' : 'bg-sky-50 text-sky-600') : (isTransparent ? 'text-white/90 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-50')}`}>
                {link.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {/* Search */}
            <div ref={searchRef} className="relative">
              <button onClick={() => setSearchOpen(!searchOpen)} className={`p-2 rounded-lg transition-colors ${isTransparent ? 'text-white hover:bg-white/10' : 'text-gray-600 hover:bg-gray-50'}`}>
                <Search className="w-5 h-5" />
              </button>
              {searchOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-slide-down">
                  <div className="p-3">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
                      <Search className="w-4 h-4 text-gray-400 shrink-0" />
                      <input type="text" placeholder="Search destinations, hotels, packages..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} autoFocus className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400" />
                    </div>
                  </div>
                  {searchResults.length > 0 && (
                    <div className="border-t border-gray-100 py-1">
                      {searchResults.map(r => (
                        <button key={`${r.type}-${r.id}`} onClick={() => handleSearchResult(r)} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 text-left transition-colors">
                          <img src={r.image_url} alt={r.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">{r.name}</div>
                            <div className="text-xs text-gray-500 truncate">{r.subtitle}</div>
                          </div>
                          <span className="text-xs text-gray-400 capitalize shrink-0">{r.type}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchQuery && searchResults.length === 0 && (
                    <div className="border-t border-gray-100 p-4 text-center text-sm text-gray-400">No results found</div>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist */}
            {user && (
              <button onClick={() => handleNav('wishlist')} className={`p-2 rounded-lg transition-colors relative ${isTransparent ? 'text-white hover:bg-white/10' : 'text-gray-600 hover:bg-gray-50'}`}>
                <Heart className={`w-5 h-5 ${wishlist.length > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{wishlist.length}</span>
                )}
              </button>
            )}

            {user ? (
              <div className="relative">
                <button onClick={() => setUserDropdown(!userDropdown)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${isTransparent ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isTransparent ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-700'}`}>{(profile?.full_name || user.email || '?')[0].toUpperCase()}</div>
                  <span>{profile?.full_name || user.email?.split('@')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {userDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-slide-down">
                    <button onClick={() => handleNav(isAdmin ? 'admin' : 'dashboard')} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"><LayoutDashboard className="w-4 h-4" />{isAdmin ? 'Admin Panel' : 'Dashboard'}</button>
                    <button onClick={() => handleNav('wishlist')} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"><Heart className="w-4 h-4" />Wishlist</button>
                    <button onClick={() => handleNav('dashboard')} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"><User className="w-4 h-4" />Profile</button>
                    <div className="border-t border-gray-100" />
                    <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"><LogOut className="w-4 h-4" />Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button onClick={() => handleNav('login')} className={`px-4 py-2 rounded-lg text-sm font-medium ${isTransparent ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'}`}>Sign In</button>
                <button onClick={() => handleNav('register')} className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors">Get Started</button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            {user && (
              <button onClick={() => handleNav('wishlist')} className="p-2 relative">
                <Heart className={`w-5 h-5 ${wishlist.length > 0 ? 'fill-red-500 text-red-500' : isTransparent ? 'text-white' : 'text-gray-600'}`} />
                {wishlist.length > 0 && (<span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{wishlist.length}</span>)}
              </button>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)} className={`p-2 rounded-lg ${isTransparent ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'}`}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg animate-slide-down">
          <div className="px-4 py-3 space-y-1">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 mb-2">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400" />
            </div>
            {searchQuery && searchResults.length > 0 && (
              <div className="space-y-1 mb-2">
                {searchResults.slice(0, 4).map(r => (
                  <button key={`${r.type}-${r.id}`} onClick={() => handleSearchResult(r)} className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 text-left">
                    <img src={r.image_url} alt={r.name} className="w-8 h-8 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0"><div className="text-sm font-medium text-gray-900 truncate">{r.name}</div></div>
                  </button>
                ))}
              </div>
            )}
            {navLinks.map(link => (<button key={link.key} onClick={() => handleNav(link.key)} className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${currentPage === link.key ? 'bg-sky-50 text-sky-600' : 'text-gray-700 hover:bg-gray-50'}`}>{link.label}</button>))}
            <div className="border-t border-gray-100 pt-2 mt-2">
              {user ? (
                <>
                  <button onClick={() => handleNav(isAdmin ? 'admin' : 'dashboard')} className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">{isAdmin ? 'Admin Panel' : 'Dashboard'}</button>
                  <button onClick={() => handleNav('wishlist')} className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Wishlist ({wishlist.length})</button>
                  <button onClick={handleSignOut} className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">Sign Out</button>
                </>
              ) : (
                <>
                  <button onClick={() => handleNav('login')} className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Sign In</button>
                  <button onClick={() => handleNav('register')} className="w-full px-3 py-2.5 bg-sky-600 text-white rounded-lg text-sm font-medium mt-1">Get Started</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
