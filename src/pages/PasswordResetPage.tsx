import { useState } from 'react';
import { Globe, Mail, ArrowLeft, CheckCircle, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PasswordResetPageProps { onNavigate: (page: string) => void; }

export default function PasswordResetPage({ onNavigate }: PasswordResetPageProps) {
  const { resetPassword, updatePassword, user } = useAuth();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [updated, setUpdated] = useState(false);

  const isRecovery = !!user && window.location.hash.includes('type=recovery');

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const { error: err } = await resetPassword(email);
    setLoading(false);
    if (err) setError(err.message);
    else setSent(true);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    const { error: err } = await updatePassword(newPassword);
    setLoading(false);
    if (err) setError(err.message);
    else setUpdated(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src="https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg" alt="Travel" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-sky-900/70 to-sky-700/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white">
          <div className="flex items-center gap-3 mb-8"><div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm"><Globe className="w-7 h-7 text-white" /></div><span className="text-2xl font-bold">WanderLux</span></div>
          <h2 className="text-4xl font-bold text-center mb-4">Never Stop Exploring</h2>
          <p className="text-white/80 text-center text-lg">Reset your password and get back to planning your next adventure.</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden"><div className="p-1.5 rounded-lg bg-sky-600"><Globe className="w-5 h-5 text-white" /></div><span className="font-bold text-xl text-sky-600">WanderLux</span></div>

          {updated ? (
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-green-500" /></div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Updated!</h1>
              <p className="text-gray-500 mb-6">Your password has been changed successfully.</p>
              <button onClick={() => onNavigate('login')} className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-xl font-semibold text-sm">Sign In</button>
            </div>
          ) : isRecovery ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Set New Password</h1>
              <p className="text-gray-500 text-sm mb-8">Enter your new password below.</p>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">New Password</label>
                  <div className="relative"><Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500" /></div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                  <div className="relative"><Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter password" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500" /></div>
                </div>
                {error && (<div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>)}
                <button type="submit" disabled={loading} className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-sky-300 text-white py-3 rounded-xl font-semibold text-sm transition-colors">{loading ? 'Updating...' : 'Update Password'}</button>
              </form>
            </>
          ) : sent ? (
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-green-500" /></div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h1>
              <p className="text-gray-500 mb-6">We sent a password reset link to <strong>{email}</strong>.</p>
              <button onClick={() => onNavigate('login')} className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-xl font-semibold text-sm">Back to Sign In</button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Reset Password</h1>
              <p className="text-gray-500 text-sm mb-8">Enter your email and we'll send you a reset link.</p>
              <form onSubmit={handleSendReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email</label>
                  <div className="relative"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500" /></div>
                </div>
                {error && (<div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>)}
                <button type="submit" disabled={loading} className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-sky-300 text-white py-3 rounded-xl font-semibold text-sm transition-colors">{loading ? 'Sending...' : 'Send Reset Link'}</button>
              </form>
            </>
          )}

          <button onClick={() => onNavigate('login')} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mt-6 text-sm w-full justify-center"><ArrowLeft className="w-4 h-4" />Back to Sign In</button>
        </div>
      </div>
    </div>
  );
}
