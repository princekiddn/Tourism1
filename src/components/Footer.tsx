import { Globe, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

interface FooterProps { onNavigate: (page: string) => void; }

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-sky-600"><Globe className="w-5 h-5 text-white" /></div>
              <span className="font-bold text-xl text-white">WanderLux</span>
            </div>
            <p className="text-sm text-gray-400 mb-5">Your gateway to the world's most extraordinary destinations.</p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (<a key={i} href="#" className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-sky-600 transition-colors"><Icon className="w-4 h-4" /></a>))}
            </div>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {[{ label: 'Home', page: 'home' }, { label: 'Destinations', page: 'destinations' }, { label: 'Tour Packages', page: 'packages' }, { label: 'Hotels', page: 'hotels' }].map(item => (
                <li key={item.page}><button onClick={() => onNavigate(item.page)} className="text-sm text-gray-400 hover:text-sky-400">{item.label}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Categories</h3>
            <ul className="space-y-2.5">
              {['Beach Holidays', 'Adventure Tours', 'Cultural Trips', 'Mountain Treks', 'City Breaks'].map(cat => (<li key={cat}><a href="#" className="text-sm text-gray-400 hover:text-sky-400">{cat}</a></li>))}
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-gray-400"><MapPin className="w-4 h-4 mt-0.5 text-sky-400 shrink-0" />123 Travel Avenue, Suite 100, New York, NY 10001</li>
              <li className="flex items-center gap-2.5 text-sm text-gray-400"><Phone className="w-4 h-4 text-sky-400 shrink-0" />+1 (800) 123-4567</li>
              <li className="flex items-center gap-2.5 text-sm text-gray-400"><Mail className="w-4 h-4 text-sky-400 shrink-0" />hello@wanderlux.com</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">© 2026 WanderLux. All rights reserved.</p>
          <div className="flex gap-5 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-300">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
