import { useState, useEffect } from 'react';
import { Users, MapPin, Hotel, Package, Calendar, CheckCircle, Clock, XCircle, TrendingUp, Plus, Trash2, Save, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Destination, Hotel as HotelType, TourPackage, Booking, Profile } from '../lib/database.types';

interface AdminDashboardProps { onNavigate: (page: string) => void; }

type BookingWithUser = Booking & { profiles?: { full_name: string } | null };
type ActiveTab = 'overview' | 'destinations' | 'hotels' | 'packages' | 'bookings' | 'users';

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [hotels, setHotels] = useState<HotelType[]>([]);
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [bookings, setBookings] = useState<BookingWithUser[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDestination, setShowAddDestination] = useState(false);
  const [newDestination, setNewDestination] = useState({ name: '', country: '', city: '', description: '', image_url: '', price_per_day: 0, category: 'beach', is_featured: false });

  useEffect(() => { if (!isAdmin) { onNavigate('home'); return; } fetchAll(); }, [isAdmin]);

  const fetchAll = async () => {
    const [dRes, hRes, pRes, bRes, uRes] = await Promise.all([
      supabase.from('destinations').select('*').order('created_at', { ascending: false }),
      supabase.from('hotels').select('*').order('created_at', { ascending: false }),
      supabase.from('tour_packages').select('*').order('created_at', { ascending: false }),
      supabase.from('bookings').select('*, profiles(full_name)').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    ]);
    if (dRes.data) setDestinations(dRes.data);
    if (hRes.data) setHotels(hRes.data);
    if (pRes.data) setPackages(pRes.data);
    if (bRes.data) setBookings(bRes.data as BookingWithUser[]);
    if (uRes.data) setUsers(uRes.data);
    setLoading(false);
  };

  const updateBookingStatus = async (id: string, status: Booking['status']) => { await supabase.from('bookings').update({ status }).eq('id', id); fetchAll(); };
  const deleteDestination = async (id: string) => { if (!confirm('Delete this destination?')) return; await supabase.from('destinations').delete().eq('id', id); fetchAll(); };
  const addDestination = async (e: React.FormEvent) => { e.preventDefault(); await supabase.from('destinations').insert({ ...newDestination, rating: 0 }); setShowAddDestination(false); setNewDestination({ name: '', country: '', city: '', description: '', image_url: '', price_per_day: 0, category: 'beach', is_featured: false }); fetchAll(); };
  const togglePackageActive = async (id: string, current: boolean) => { await supabase.from('tour_packages').update({ is_active: !current }).eq('id', id); fetchAll(); };
  const toggleHotelAvailable = async (id: string, current: boolean) => { await supabase.from('hotels').update({ is_available: !current }).eq('id', id); fetchAll(); };

  const revenue = bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + b.total_price, 0);
  const stats = [
    { label: 'Revenue', value: `$${revenue.toLocaleString()}`, icon: TrendingUp, color: 'bg-green-50 text-green-600' },
    { label: 'Bookings', value: bookings.length, icon: Calendar, color: 'bg-sky-50 text-sky-600' },
    { label: 'Users', value: users.length, icon: Users, color: 'bg-violet-50 text-violet-600' },
    { label: 'Destinations', value: destinations.length, icon: MapPin, color: 'bg-amber-50 text-amber-600' },
  ];

  const STATUS_CONFIG = { pending: { color: 'bg-amber-100 text-amber-700', icon: Clock }, confirmed: { color: 'bg-green-100 text-green-700', icon: CheckCircle }, cancelled: { color: 'bg-red-100 text-red-700', icon: XCircle }, completed: { color: 'bg-gray-100 text-gray-600', icon: CheckCircle } };
  const tabs: { key: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
    { key: 'destinations', label: 'Destinations', icon: <MapPin className="w-4 h-4" /> },
    { key: 'hotels', label: 'Hotels', icon: <Hotel className="w-4 h-4" /> },
    { key: 'packages', label: 'Packages', icon: <Package className="w-4 h-4" /> },
    { key: 'bookings', label: 'Bookings', icon: <Calendar className="w-4 h-4" /> },
    { key: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
  ];

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        <div className="flex flex-col lg:flex-row gap-6">
          <nav className="lg:w-48 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {tabs.map(tab => (<button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium ${activeTab === tab.key ? 'bg-sky-50 text-sky-700 border-r-2 border-sky-600' : 'text-gray-600 hover:bg-gray-50'}`}>{tab.icon}{tab.label}</button>))}
            </div>
          </nav>
          <div className="flex-1 min-w-0">
            {loading ? (<div className="space-y-3">{[...Array(4)].map((_, i) => (<div key={i} className="bg-white rounded-2xl h-20 animate-pulse" />))}</div>) : (
              <>
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{stats.map(s => (<div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"><div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}><s.icon className="w-5 h-5" /></div><div className="text-2xl font-bold text-gray-900">{s.value}</div><div className="text-xs text-gray-500">{s.label}</div></div>))}</div>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-100 font-semibold">Recent Bookings</div>
                      <div className="divide-y divide-gray-100">{bookings.slice(0, 5).map(booking => { const sc = STATUS_CONFIG[booking.status]; return (<div key={booking.id} className="px-6 py-3 flex items-center justify-between"><div><div className="text-sm font-medium text-gray-900">{booking.profiles?.full_name || 'User'}</div><div className="text-xs text-gray-500">{booking.check_in}</div></div><div className="flex items-center gap-3"><span className="font-semibold">${booking.total_price.toLocaleString()}</span><span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${sc.color}`}>{booking.status}</span></div></div>); })}</div>
                    </div>
                  </div>
                )}
                {activeTab === 'destinations' && (
                  <div>
                    <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-gray-900">{destinations.length} Destinations</h3><button onClick={() => setShowAddDestination(true)} className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl text-sm font-semibold"><Plus className="w-4 h-4" />Add</button></div>
                    {showAddDestination && (
                      <div className="bg-white rounded-2xl border border-sky-200 p-5 mb-4 shadow-sm">
                        <h4 className="font-semibold text-gray-900 mb-4">New Destination</h4>
                        <form onSubmit={addDestination} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input type="text" required placeholder="Name" value={newDestination.name} onChange={e => setNewDestination(f => ({ ...f, name: e.target.value }))} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-400" />
                          <input type="text" required placeholder="Country" value={newDestination.country} onChange={e => setNewDestination(f => ({ ...f, country: e.target.value }))} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" />
                          <input type="number" required placeholder="Price/Day" value={newDestination.price_per_day || ''} onChange={e => setNewDestination(f => ({ ...f, price_per_day: parseFloat(e.target.value) || 0 }))} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" />
                          <select value={newDestination.category} onChange={e => setNewDestination(f => ({ ...f, category: e.target.value }))} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none">{['adventure', 'beach', 'cultural', 'nature', 'city', 'mountain'].map(c => (<option key={c} value={c}>{c}</option>))}</select>
                          <div className="sm:col-span-2 flex gap-2"><button type="submit" className="flex items-center gap-1.5 bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-700"><Save className="w-4 h-4" />Save</button><button type="button" onClick={() => setShowAddDestination(false)} className="flex items-center gap-1.5 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"><X className="w-4 h-4" />Cancel</button></div>
                        </form>
                      </div>
                    )}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead><tr className="bg-gray-50 border-b border-gray-100"><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Destination</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Country</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Price</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Featured</th><th className="px-4 py-3"></th></tr></thead>
                          <tbody className="divide-y divide-gray-100">
                            {destinations.map(d => (
                              <tr key={d.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3"><div className="flex items-center gap-2.5"><img src={d.image_url} alt={d.name} className="w-8 h-8 rounded-lg object-cover" /><span className="font-medium text-gray-900">{d.name}</span></div></td>
                                <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{d.country}</td>
                                <td className="px-4 py-3 font-medium">${d.price_per_day}</td>
                                <td className="px-4 py-3"><button onClick={() => supabase.from('destinations').update({ is_featured: !d.is_featured }).eq('id', d.id).then(fetchAll)} className={`text-xs px-2 py-0.5 rounded-full font-medium ${d.is_featured ? 'bg-sky-100 text-sky-700' : 'bg-gray-100 text-gray-500'}`}>{d.is_featured ? 'Yes' : 'No'}</button></td>
                                <td className="px-4 py-3"><button onClick={() => deleteDestination(d.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'hotels' && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">{hotels.length} Hotels</h3>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead><tr className="bg-gray-50 border-b border-gray-100"><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Hotel</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Stars</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Price</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Available</th></tr></thead>
                          <tbody className="divide-y divide-gray-100">
                            {hotels.map(h => (
                              <tr key={h.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3"><div className="flex items-center gap-2.5"><img src={h.image_url} alt={h.name} className="w-8 h-8 rounded-lg object-cover" /><span className="font-medium text-gray-900">{h.name}</span></div></td>
                                <td className="px-4 py-3 hidden sm:table-cell">{'★'.repeat(h.star_rating)}</td>
                                <td className="px-4 py-3 font-medium">${h.price_per_night}</td>
                                <td className="px-4 py-3"><button onClick={() => toggleHotelAvailable(h.id, h.is_available)} className={`text-xs px-2 py-0.5 rounded-full font-medium ${h.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{h.is_available ? 'Yes' : 'No'}</button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'packages' && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">{packages.length} Packages</h3>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead><tr className="bg-gray-50 border-b border-gray-100"><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Package</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Days</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Price</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Active</th></tr></thead>
                          <tbody className="divide-y divide-gray-100">
                            {packages.map(p => (
                              <tr key={p.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3"><div className="flex items-center gap-2.5"><img src={p.image_url} alt={p.name} className="w-8 h-8 rounded-lg object-cover" /><span className="font-medium text-gray-900">{p.name}</span></div></td>
                                <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{p.duration_days}</td>
                                <td className="px-4 py-3 font-medium">${p.price.toLocaleString()}</td>
                                <td className="px-4 py-3"><button onClick={() => togglePackageActive(p.id, p.is_active)} className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{p.is_active ? 'Yes' : 'No'}</button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'bookings' && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">{bookings.length} Bookings</h3>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead><tr className="bg-gray-50 border-b border-gray-100"><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Type</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Dates</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th><th className="px-4 py-3"></th></tr></thead>
                          <tbody className="divide-y divide-gray-100">
                            {bookings.map(b => { const sc = STATUS_CONFIG[b.status]; return (
                              <tr key={b.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-900">{b.profiles?.full_name || 'User'}</td>
                                <td className="px-4 py-3 capitalize text-gray-600 hidden md:table-cell">{b.booking_type}</td>
                                <td className="px-4 py-3 text-gray-500 text-xs">{b.check_in}</td>
                                <td className="px-4 py-3 font-semibold">${b.total_price.toLocaleString()}</td>
                                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${sc.color}`}>{b.status}</span></td>
                                <td className="px-4 py-3"><select value={b.status} onChange={e => updateBookingStatus(b.id, e.target.value as Booking['status'])} className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 outline-none"><option value="pending">Pending</option><option value="confirmed">Confirm</option><option value="cancelled">Cancel</option><option value="completed">Complete</option></select></td>
                              </tr>
                            ); })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'users' && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">{users.length} Users</h3>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead><tr className="bg-gray-50 border-b border-gray-100"><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th><th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Joined</th></tr></thead>
                          <tbody className="divide-y divide-gray-100">
                            {users.map(u => (
                              <tr key={u.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3"><div className="flex items-center gap-2.5"><div className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center text-xs font-bold text-sky-700">{(u.full_name || '?')[0].toUpperCase()}</div><span className="font-medium text-gray-900">{u.full_name || 'User'}</span></div></td>
                                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${u.role === 'admin' ? 'bg-sky-100 text-sky-700' : 'bg-gray-100 text-gray-600'}`}>{u.role}</span></td>
                                <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">{new Date(u.created_at).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
