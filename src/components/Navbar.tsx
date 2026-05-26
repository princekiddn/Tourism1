import { useState, useEffect } from 'react';
import { Menu, X, Globe, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps { currentPage: string; onNavigate: (page: string) => void; }

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { user, profile, signOut, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [{ key: 'home', label: 'Home' }, { key: 'destinations', label: 'Destinations' }, { key: 'packages', label: 'Packages' }, { key: 'hotels', label: 'Hotels' }];

  const handleNav = (page: string) => { onNavigate(page); setMenuOpen(false); setUserDropdown(false); };
  const handleSignOut = async () => { await signOut(); setUserDropdown(false); onNavigate('home'); };

  const isTransparent = currentPage === 'home' && !scrolled;

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

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button onClick={() => setUserDropdown(!userDropdown)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${isTransparent ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isTransparent ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-700'}`}>{(profile?.full_name || user.email || '?')[0].toUpperCase()}</div>
                  <span>{profile?.full_name || user.email?.split('@')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {userDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                    <button onClick={() => handleNav(isAdmin ? 'admin' : 'dashboard')} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"><LayoutDashboard className="w-4 h-4" />{isAdmin ? 'Admin Panel' : 'Dashboard'}</button>
                    <button onClick={() => handleNav('dashboard')} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"><User className="w-4 h-4" />Profile</button>
                    <div className="border-t border-gray-100" />
                    <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"><LogOut className="w-4 h-4" />Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button onClick={() => handleNav('login')} className={`px-4 py-2 rounded-lg text-sm font-medium ${isTransparent ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'}`}>Sign In</button>
                <button onClick={() => handleNav('register')} className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium shadow-sm">Get Started</button>
              </>
            )}
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className={`md:hidden p-2 rounded-lg ${isTransparent ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'}`}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(link => (<button key={link.key} onClick={() => handleNav(link.key)} className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${currentPage === link.key ? 'bg-sky-50 text-sky-600' : 'text-gray-700 hover:bg-gray-50'}`}>{link.label}</button>))}
            <div className="border-t border-gray-100 pt-2 mt-2">
              {user ? (
                <>
                  <button onClick={() => handleNav(isAdmin ? 'admin' : 'dashboard')} className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">{isAdmin ? 'Admin Panel' : 'Dashboard'}</button>
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
