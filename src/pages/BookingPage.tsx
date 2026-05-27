import { useState, useEffect } from 'react';
import { Calendar, Users, MessageSquare, CheckCircle, ArrowLeft, Hotel, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Hotel as HotelType, TourPackage } from '../lib/database.types';

interface BookingItem { type: 'hotel' | 'package'; item: HotelType | TourPackage; }
interface BookingPageProps { bookingData?: BookingItem; onNavigate: (page: string, data?: unknown) => void; }

export default function BookingPage({ bookingData, onNavigate }: BookingPageProps) {
  const { user } = useAuth();
  const [type, setType] = useState<'hotel' | 'package'>('hotel');
  const [hotels, setHotels] = useState<HotelType[]>([]);
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [form, setForm] = useState({ check_in: '', check_out: '', guests: 1, special_requests: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([supabase.from('hotels').select('*').eq('is_available', true), supabase.from('tour_packages').select('*').eq('is_active', true)]).then(([hRes, pRes]) => {
      if (hRes.data) setHotels(hRes.data);
      if (pRes.data) setPackages(pRes.data);
    });
    if (bookingData) { setType(bookingData.type); setSelectedId(bookingData.item.id); }
  }, [bookingData]);

  const selectedItem = type === 'hotel' ? hotels.find(h => h.id === selectedId) : packages.find(p => p.id === selectedId);

  const calculatePrice = () => {
    if (!selectedItem || !form.check_in || !form.check_out) return 0;
    const nights = Math.ceil((new Date(form.check_out).getTime() - new Date(form.check_in).getTime()) / (1000 * 60 * 60 * 24));
    if (nights <= 0) return 0;
    if (type === 'hotel') return (selectedItem as HotelType).price_per_night * nights * form.guests;
    return (selectedItem as TourPackage).price * form.guests;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { onNavigate('login'); return; }
    if (!selectedId) { setError('Please select a hotel or package.'); return; }
    const total = calculatePrice();
    if (total <= 0) { setError('Please select valid dates.'); return; }
    setLoading(true); setError('');
    const { error: err } = await supabase.from('bookings').insert({
      user_id: user.id, booking_type: type, hotel_id: type === 'hotel' ? selectedId : null,
      package_id: type === 'package' ? selectedId : null, check_in: form.check_in, check_out: form.check_out,
      guests: form.guests, total_price: total, special_requests: form.special_requests, status: 'pending',
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    // Send booking notification
    try {
      const item = selectedItem;
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/booking-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({
          bookingId: 'pending', userEmail: user.email, userName: user.user_metadata?.full_name,
          itemName: item?.name, checkIn: form.check_in, checkOut: form.check_out,
          guests: form.guests, totalPrice: total, bookingType: type,
        }),
      });
    } catch { /* notification is non-critical */ }
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pt-16">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle className="w-10 h-10 text-green-500" /></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-500 mb-6">Your booking is pending confirmation.</p>
          <div className="flex gap-3">
            <button onClick={() => onNavigate('dashboard')} className="flex-1 bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-xl font-semibold">View My Bookings</button>
            <button onClick={() => onNavigate('home')} className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold">Back to Home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4">
        <button onClick={() => onNavigate('home')} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm"><ArrowLeft className="w-4 h-4" />Back</button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Your Experience</h1>
        <p className="text-gray-500 mb-8">Complete the form to reserve your spot</p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">What are you booking?</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => { setType('hotel'); setSelectedId(''); }} className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 font-medium text-sm ${type === 'hotel' ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-gray-200 text-gray-500'}`}><Hotel className="w-5 h-5" />Hotel</button>
                  <button type="button" onClick={() => { setType('package'); setSelectedId(''); }} className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 font-medium text-sm ${type === 'package' ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-gray-200 text-gray-500'}`}><Package className="w-5 h-5" />Package</button>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Select {type === 'hotel' ? 'Hotel' : 'Package'}</h3>
                <select required value={selectedId} onChange={e => setSelectedId(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-500">
                  <option value="">-- Select --</option>
                  {(type === 'hotel' ? hotels : packages).map(item => (<option key={item.id} value={item.id}>{item.name}</option>))}
                </select>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Travel Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5"><Calendar className="w-3.5 h-3.5 inline mr-1" />Check-in</label>
                    <input type="date" required min={new Date().toISOString().split('T')[0]} value={form.check_in} onChange={e => setForm(f => ({ ...f, check_in: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5"><Calendar className="w-3.5 h-3.5 inline mr-1" />Check-out</label>
                    <input type="date" required min={form.check_in || new Date().toISOString().split('T')[0]} value={form.check_out} onChange={e => setForm(f => ({ ...f, check_out: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5"><Users className="w-3.5 h-3.5 inline mr-1" />Guests</label>
                    <input type="number" required min={1} max={20} value={form.guests} onChange={e => setForm(f => ({ ...f, guests: parseInt(e.target.value) || 1 }))} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4"><MessageSquare className="w-4 h-4 inline mr-2" />Special Requests</h3>
                <textarea value={form.special_requests} onChange={e => setForm(f => ({ ...f, special_requests: e.target.value }))} placeholder="Any special requirements..." rows={4} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none resize-none" />
              </div>
              {error && (<div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>)}
              {!user && (<div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-3 text-sm">Please <button onClick={() => onNavigate('login')} className="font-semibold underline">sign in</button> to book.</div>)}
              <button type="submit" disabled={loading || !user} className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-gray-200 disabled:text-gray-400 text-white py-4 rounded-xl font-bold text-base transition-colors">{loading ? 'Processing...' : 'Confirm Booking'}</button>
            </form>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Booking Summary</h3>
              {selectedItem ? (
                <>
                  <div className="relative rounded-xl overflow-hidden h-40 mb-4">
                    <img src={selectedItem.image_url} alt={selectedItem.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 left-3 text-white text-sm font-semibold">{selectedItem.name}</div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-medium capitalize">{type}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Guests</span><span className="font-medium">{form.guests}</span></div>
                    {calculatePrice() > 0 && (<div className="flex justify-between border-t border-gray-100 pt-3"><span className="font-bold text-gray-900">Total</span><span className="font-bold text-sky-600 text-lg">${calculatePrice().toLocaleString()}</span></div>)}
                  </div>
                </>
              ) : (<div className="text-center py-8 text-gray-400"><Package className="w-10 h-10 mx-auto mb-2 opacity-30" /><p className="text-sm">Select a {type}</p></div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
