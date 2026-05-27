import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import DestinationsPage from './pages/DestinationsPage';
import PackagesPage from './pages/PackagesPage';
import HotelsPage from './pages/HotelsPage';
import BookingPage from './pages/BookingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PasswordResetPage from './pages/PasswordResetPage';
import WishlistPage from './pages/WishlistPage';

type Page =
  | 'home'
  | 'destinations'
  | 'packages'
  | 'hotels'
  | 'booking'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'admin'
  | 'profile'
  | 'reset-password'
  | 'wishlist';

const FULL_SCREEN_PAGES: Page[] = ['login', 'register', 'reset-password'];
const NO_FOOTER_PAGES: Page[] = ['login', 'register', 'dashboard', 'admin', 'profile', 'reset-password', 'wishlist'];

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [bookingData, setBookingData] = useState<unknown>(null);
  const { loading } = useAuth();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const navigate = (page: string, data?: unknown) => {
    setCurrentPage(page as Page);
    if (data) setBookingData(data);
    else setBookingData(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400 text-sm">Loading WanderLux...</span>
        </div>
      </div>
    );
  }

  const isFullScreen = FULL_SCREEN_PAGES.includes(currentPage);
  const showFooter = !NO_FOOTER_PAGES.includes(currentPage);

  return (
    <div className="min-h-screen flex flex-col">
      {!isFullScreen && <Navbar currentPage={currentPage} onNavigate={navigate} />}

      <main className="flex-1">
        {currentPage === 'home' && <HomePage onNavigate={navigate} />}
        {currentPage === 'destinations' && <DestinationsPage onNavigate={navigate} />}
        {currentPage === 'packages' && <PackagesPage onNavigate={navigate} />}
        {currentPage === 'hotels' && <HotelsPage onNavigate={navigate} />}
        {currentPage === 'booking' && <BookingPage bookingData={bookingData as { type: 'hotel' | 'package'; item: unknown }} onNavigate={navigate} />}
        {currentPage === 'login' && <LoginPage onNavigate={navigate} />}
        {currentPage === 'register' && <RegisterPage onNavigate={navigate} />}
        {(currentPage === 'dashboard' || currentPage === 'profile') && <UserDashboard onNavigate={navigate} />}
        {currentPage === 'admin' && <AdminDashboard onNavigate={navigate} />}
        {currentPage === 'reset-password' && <PasswordResetPage onNavigate={navigate} />}
        {currentPage === 'wishlist' && <WishlistPage onNavigate={navigate} />}
      </main>

      {showFooter && <Footer onNavigate={navigate} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
