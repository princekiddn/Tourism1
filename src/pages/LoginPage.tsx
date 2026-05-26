import { useState } from 'react';
import { Globe, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

interface LoginPageProps { onNavigate: (page: string) => void; }

export default function LoginPage({ onNavigate }: LoginPageProps) {
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) setError(err.message.includes('Invalid') ? 'Invalid email or password.' : err.message);
    else onNavigate('home');
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true); setError('');
    const { error: err } = await signInWithGoogle();
    if (err) { setError(err.message); setGoogleLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src="https://images.pexels.com/photos/2474689/pexels-photo-2474689.jpeg" alt="Travel" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-sky-900/70 to-sky-700/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white">
          <div className="flex items-center gap-3 mb-8"><div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm"><Globe className="w-7 h-7 text-white" /></div><span className="text-2xl font-bold">WanderLux</span></div>
          <h2 className="text-4xl font-bold text-center mb-4">Welcome Back, Traveler</h2>
          <p className="text-white/80 text-center text-lg">Sign in to access your bookings and recommendations.</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden"><div className="p-1.5 rounded-lg bg-sky-600"><Globe className="w-5 h-5 text-white" /></div><span className="font-bold text-xl text-sky-600">WanderLux</span></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h1>
          <p className="text-gray-500 text-sm mb-8">Don't have an account? <button onClick={() => onNavigate('register')} className="text-sky-600 font-medium hover:underline">Create one free</button></p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email</label>
              <div className="relative"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500" /></div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative"><Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div>
            </div>
            {error && (<div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>)}
            <button type="submit" disabled={loading} className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-sky-300 text-white py-3 rounded-xl font-semibold text-sm transition-colors">{loading ? 'Signing in...' : 'Sign In'}</button>
            <div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div><div className="relative flex justify-center text-xs"><span className="bg-gray-50 px-3 text-gray-500">or continue with</span></div></div>
            <button type="button" onClick={handleGoogleSignIn} disabled={googleLoading} className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-medium text-sm transition-colors disabled:opacity-50"><GoogleIcon />{googleLoading ? 'Signing in...' : 'Continue with Google'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
