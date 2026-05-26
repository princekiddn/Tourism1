import { MapPin, TrendingUp } from 'lucide-react';
import StarRating from './StarRating';
import type { Destination } from '../lib/database.types';

interface DestinationCardProps { destination: Destination; onNavigate: (page: string, data?: unknown) => void; }

const categoryColors: Record<string, string> = { beach: 'bg-cyan-100 text-cyan-700', adventure: 'bg-orange-100 text-orange-700', cultural: 'bg-amber-100 text-amber-700', nature: 'bg-green-100 text-green-700', city: 'bg-blue-100 text-blue-700', mountain: 'bg-slate-100 text-slate-700' };

export default function DestinationCard({ destination, onNavigate }: DestinationCardProps) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:-translate-y-1" onClick={() => onNavigate('destinations', destination)}>
      <div className="relative overflow-hidden h-52">
        <img src={destination.image_url} alt={destination.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {destination.is_featured && (<div className="absolute top-3 left-3 flex items-center gap-1 bg-sky-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full"><TrendingUp className="w-3 h-3" />Featured</div>)}
        <div className={`absolute top-3 right-3 text-xs font-medium px-2.5 py-1 rounded-full capitalize ${categoryColors[destination.category] || 'bg-gray-100 text-gray-700'}`}>{destination.category}</div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-1 text-white text-sm"><MapPin className="w-3.5 h-3.5" /><span>{destination.country}</span></div>
          <div className="bg-white/20 backdrop-blur-sm text-white text-sm font-semibold px-2.5 py-1 rounded-full">${destination.price_per_day}/day</div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-lg mb-1">{destination.name}</h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-3">{destination.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5"><StarRating rating={destination.rating} /><span className="text-sm font-medium text-gray-700">{destination.rating.toFixed(1)}</span></div>
        </div>
      </div>
    </div>
  );
}
