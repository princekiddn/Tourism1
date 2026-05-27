import { useState, useEffect } from 'react';
import { Calendar, MapPin, Package, Clock, CheckCircle, XCircle, Star, Plus, User, MessageSquare, Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Booking, Review } from '../lib/database.types';
import StarRating from '../components/StarRating';

interface UserDashboardProps { onNavigate: (page: string, data?: unknown) => void; }

type BookingWithDetails = Booking & { hotels?: { name: string; image_url: string } | null; tour_packages?: { name: string; image_url: string } | null; destinations?: { name: string } | null; };

const STATUS_CONFIG = { pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock }, confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-700', icon: CheckCircle }, cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle }, completed: { label: 'Completed', color: 'bg-gray-100 text-gray-600', icon: CheckCircle } };

export default function UserDashboard({ onNavigate }: UserDashboardProps) {
  const { user, profile, updateProfile, updatePassword } = useAuth();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bookings' | 'reviews' | 'profile'>('bookings');
  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: '', phone: '' });
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Review creation state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ booking_id: '', rating: 5, title: '', body: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Password change state
  const [changePassword, setChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;
    setProfileForm({ full_name: profile?.full_name || '', phone: profile?.phone || '' });
    fetchData();
  }, [user, profile]);

  const fetchData = async () => {
    if (!user) return;
    const [bRes, rRes] = await Promise.all([
      supabase.from('bookings').select('*, hotels(name, image_url), tour_packages(name, image_url), destinations(name)').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('reviews').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ]);
    if (bRes.data) setBookings(bRes.data as BookingWithDetails[]);
    if (rRes.data) setReviews(rRes.data);
    setLoading(false);
  };

  const cancelBooking = async (id: string) => { setCancellingId(id); await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id); setCancellingId(null); fetchData(); };
  const handleProfileSave = async () => { await updateProfile({ full_name: profileForm.full_name, phone: profileForm.phone }); setEditProfile(false); };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setReviewLoading(true); setReviewError('');
    const booking = bookings.find(b => b.id === reviewForm.booking_id);
    if (!booking) { setReviewError('Booking not found.'); setReviewLoading(false); return; }

    const reviewData: Record<string, unknown> = {
      user_id: user.id,
      rating: reviewForm.rating,
      title: reviewForm.title,
      body: reviewForm.body,
    };

    if (booking.booking_type === 'hotel') reviewData.hotel_id = booking.hotel_id;
    else reviewData.package_id = booking.package_id;
    if (booking.destination_id) reviewData.destination_id = booking.destination_id;

    const { error } = await supabase.from('reviews').insert(reviewData);
    setReviewLoading(false);
    if (error) { setReviewError(error.message); return; }
    setShowReviewForm(false);
    setReviewForm({ booking_id: '', rating: 5, title: '', body: '' });
    fetchData();
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) { setPasswordError('Passwords do not match.'); return; }
    if (passwordForm.new.length < 6) { setPasswordError('Password must be at least 6 characters.'); return; }
    setPasswordLoading(true); setPasswordError('');
    const { error } = await updatePassword(passwordForm.new);
    setPasswordLoading(false);
    if (error) { setPasswordError(error.message); return; }
    setPasswordSuccess(true);
    setChangePassword(false);
    setPasswordForm({ current: '', new: '', confirm: '' });
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  const completedBookingsWithoutReview = bookings.filter(b => b.status === 'completed' && !reviews.some(r => (b.booking_type === 'hotel' && r.hotel_id === b.hotel_id) || (b.booking_type === 'package' && r.package_id === b.package_id)));

  const stats = [
    { label: 'Total Bookings', value: bookings.length, icon: Calendar, color: 'bg-sky-50 text-sky-600' },
    { label: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
    { label: 'Reviews', value: reviews.length, icon: Star, color: 'bg-amber-50 text-amber-600' },
    { label: 'Total Spent', value: `$${bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + b.total_price, 0).toLocaleString()}`, icon: MapPin, color: 'bg-rose-50 text-rose-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div><h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1><p className="text-gray-500 text-sm mt-0.5">Welcome back, {profile?.full_name || user?.email?.split('@')[0]}</p></div>
          <button onClick={() => onNavigate('booking')} className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"><Plus className="w-4 h-4" />New Booking</button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(stat => (<div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm animate-fade-in"><div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}><stat.icon className="w-5 h-5" /></div><div className="text-2xl font-bold text-gray-900 mb-0.5">{stat.value}</div><div className="text-xs text-gray-500">{stat.label}</div></div>))}
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
          {(['bookings', 'reviews', 'profile'] as const).map(tab => (<button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>{tab}</button>))}
        </div>

        {activeTab === 'bookings' && (
          <div>
            {loading ? (<div className="space-y-3">{[...Array(3)].map((_, i) => (<div key={i} className="bg-white rounded-2xl h-24 animate-pulse" />))}</div>) : bookings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center"><Calendar className="w-12 h-12 text-gray-200 mx-auto mb-3" /><h3 className="text-gray-500 font-medium mb-2">No bookings yet</h3><button onClick={() => onNavigate('booking')} className="text-sky-600 text-sm hover:underline">Make your first booking</button></div>
            ) : (
              <div className="space-y-4">
                {bookings.map(booking => {
                  const name = booking.hotels?.name || booking.tour_packages?.name || booking.destinations?.name || 'Booking';
                  const image = booking.hotels?.image_url || booking.tour_packages?.image_url;
                  const status = STATUS_CONFIG[booking.status];
                  const StatusIcon = status.icon;
                  return (
                    <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-slide-up">
                      <div className="flex flex-col sm:flex-row">
                        {image && (<div className="w-full sm:w-32 h-32 sm:h-auto shrink-0"><img src={image} alt={name} className="w-full h-full object-cover" /></div>)}
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div><h3 className="font-semibold text-gray-900">{name}</h3><span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${status.color}`}><StatusIcon className="w-3 h-3" />{status.label}</span></div>
                            <div className="text-right shrink-0"><div className="font-bold text-sky-600">${booking.total_price.toLocaleString()}</div><div className="text-xs text-gray-400 capitalize">{booking.booking_type}</div></div>
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3"><span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{booking.check_in} – {booking.check_out}</span><span className="flex items-center gap-1"><Package className="w-3 h-3" />{booking.guests} guest{booking.guests > 1 ? 's' : ''}</span></div>
                          <div className="flex gap-2">
                            {booking.status === 'pending' && (<button onClick={() => cancelBooking(booking.id)} disabled={cancellingId === booking.id} className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-medium transition-colors">{cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}</button>)}
                            {booking.status === 'completed' && !reviews.some(r => (booking.booking_type === 'hotel' && r.hotel_id === booking.hotel_id) || (booking.booking_type === 'package' && r.package_id === booking.package_id)) && (
                              <button onClick={() => { setShowReviewForm(true); setReviewForm({ booking_id: booking.id, rating: 5, title: '', body: '' }); }} className="px-3 py-1.5 bg-sky-50 text-sky-600 hover:bg-sky-100 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"><MessageSquare className="w-3 h-3" />Write Review</button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Review Form Modal */}
            {showReviewForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" onClick={() => setShowReviewForm(false)}>
                <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-scale-in" onClick={e => e.stopPropagation()}>
                  <h3 className="font-bold text-gray-900 text-lg mb-4">Write a Review</h3>
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <button key={s} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: s }))} className="transition-transform hover:scale-110">
                            <Star className={`w-7 h-7 ${s <= reviewForm.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Title</label>
                      <input type="text" required value={reviewForm.title} onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))} placeholder="Summarize your experience" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Review</label>
                      <textarea required value={reviewForm.body} onChange={e => setReviewForm(f => ({ ...f, body: e.target.value }))} placeholder="Tell us about your experience..." rows={4} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none resize-none focus:ring-2 focus:ring-sky-500" />
                    </div>
                    {reviewError && (<div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{reviewError}</div>)}
                    <div className="flex gap-3">
                      <button type="submit" disabled={reviewLoading} className="flex-1 bg-sky-600 hover:bg-sky-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">{reviewLoading ? 'Submitting...' : 'Submit Review'}</button>
                      <button type="button" onClick={() => setShowReviewForm(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold">Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          reviews.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <Star className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <h3 className="text-gray-500 font-medium mb-2">No reviews yet</h3>
              {completedBookingsWithoutReview.length > 0 && (
                <button onClick={() => { setActiveTab('bookings'); }} className="text-sky-600 text-sm hover:underline">Review your completed bookings</button>
              )}
            </div>
          ) : (
            <div className="space-y-4">{reviews.map(review => (
              <div key={review.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm animate-slide-up">
                <div className="flex items-start justify-between mb-2"><StarRating rating={review.rating} size="md" /><span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span></div>
                <h3 className="font-semibold text-gray-900 mt-1">{review.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{review.body}</p>
              </div>
            ))}</div>
          )
        )}

        {activeTab === 'profile' && (
          <div className="max-w-lg space-y-6">
            {passwordSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm animate-fade-in">Password updated successfully.</div>
            )}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-sky-100 flex items-center justify-center text-2xl font-bold text-sky-700">{(profile?.full_name || user?.email || '?')[0].toUpperCase()}</div>
                <div><h2 className="font-bold text-gray-900">{profile?.full_name || 'Traveler'}</h2><p className="text-gray-500 text-sm">{user?.email}</p><span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize bg-sky-100 text-sky-700 mt-1 inline-block">{profile?.role}</span></div>
              </div>
              {editProfile ? (
                <div className="space-y-4">
                  <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Full Name</label><input type="text" value={profileForm.full_name} onChange={e => setProfileForm(f => ({ ...f, full_name: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-500" /></div>
                  <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Phone</label><input type="tel" value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-500" /></div>
                  <div className="flex gap-3"><button onClick={handleProfileSave} className="flex-1 bg-sky-600 hover:bg-sky-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">Save</button><button onClick={() => setEditProfile(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold">Cancel</button></div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 py-3 border-b border-gray-100"><User className="w-4 h-4 text-gray-400" /><div className="flex-1"><div className="text-xs text-gray-500">Full Name</div><div className="text-sm font-medium text-gray-900">{profile?.full_name || '—'}</div></div></div>
                  <div className="flex items-center gap-3 py-3 border-b border-gray-100"><div className="text-gray-400 text-sm">@</div><div className="flex-1"><div className="text-xs text-gray-500">Email</div><div className="text-sm font-medium text-gray-900">{user?.email}</div></div></div>
                  <button onClick={() => setEditProfile(true)} className="w-full mt-2 border border-sky-200 text-sky-600 hover:bg-sky-50 py-2.5 rounded-xl text-sm font-semibold transition-colors">Edit Profile</button>
                </div>
              )}
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2"><Lock className="w-4 h-4 text-gray-400" /><h3 className="font-semibold text-gray-900">Password</h3></div>
                <button onClick={() => setChangePassword(!changePassword)} className="text-sky-600 text-sm font-medium hover:underline">{changePassword ? 'Cancel' : 'Change'}</button>
              </div>
              {changePassword ? (
                <form onSubmit={handlePasswordChange} className="space-y-3">
                  <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">New Password</label><div className="relative"><Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type={showPasswords ? 'text' : 'password'} required value={passwordForm.new} onChange={e => setPasswordForm(f => ({ ...f, new: e.target.value }))} placeholder="Min 6 characters" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500" /></div></div>
                  <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Confirm Password</label><div className="relative"><Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type={showPasswords ? 'text' : 'password'} required value={passwordForm.confirm} onChange={e => setPasswordForm(f => ({ ...f, confirm: e.target.value }))} placeholder="Re-enter password" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500" /><button type="button" onClick={() => setShowPasswords(!showPasswords)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">{showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></div>
                  {passwordError && (<div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{passwordError}</div>)}
                  <button type="submit" disabled={passwordLoading} className="w-full bg-sky-600 hover:bg-sky-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">{passwordLoading ? 'Updating...' : 'Update Password'}</button>
                </form>
              ) : (
                <p className="text-gray-500 text-sm">Your password is securely stored. Click "Change" to update it.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
