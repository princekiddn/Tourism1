import { Calendar, Users, CheckCircle, TrendingUp } from 'lucide-react';
import type { TourPackage } from '../lib/database.types';

interface PackageCardProps { pkg: TourPackage; onBook?: () => void; }

export default function PackageCard({ pkg, onBook }: PackageCardProps) {
  const includes = Array.isArray(pkg.includes) ? pkg.includes : [];
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1 flex flex-col">
      <div className="relative overflow-hidden h-52">
        <img src={pkg.image_url} alt={pkg.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {pkg.is_featured && (<div className="absolute top-3 left-3 flex items-center gap-1 bg-sky-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full"><TrendingUp className="w-3 h-3" />Popular</div>)}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center gap-3 text-white text-xs">
            <span className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full"><Calendar className="w-3 h-3" />{pkg.duration_days} days</span>
            <span className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full"><Users className="w-3 h-3" />Max {pkg.max_people}</span>
          </div>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 text-base mb-2">{pkg.name}</h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-3 flex-1">{pkg.description}</p>
        {includes.length > 0 && (
          <div className="space-y-1 mb-4">
            {includes.slice(0, 3).map((item) => (<div key={item} className="flex items-center gap-1.5 text-xs text-gray-600"><CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />{item}</div>))}
            {includes.length > 3 && (<div className="text-xs text-gray-400 pl-5">+{includes.length - 3} more</div>)}
          </div>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div><span className="text-sky-600 font-bold text-xl">${pkg.price.toLocaleString()}</span><span className="text-gray-400 text-xs ml-1">/person</span></div>
          {onBook && (<button onClick={onBook} disabled={!pkg.is_active} className="px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-gray-200 text-white rounded-xl text-sm font-semibold transition-colors">Book Now</button>)}
        </div>
      </div>
    </div>
  );
}
