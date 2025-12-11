import React from 'react';
import { FamilyEvent } from '../types';
import { Circle, Flag, Heart, Baby, Star } from 'lucide-react';

interface TimelineProps {
  events: FamilyEvent[];
}

const Timeline: React.FC<TimelineProps> = ({ events }) => {
  // Sort events by date descending
  const sortedEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getIcon = (type: FamilyEvent['type']) => {
    switch (type) {
        case 'birth': return <Baby className="text-blue-500" size={16} />;
        case 'marriage': return <Heart className="text-rose-500" size={16} />;
        case 'achievement': return <Star className="text-amber-500" size={16} />;
        case 'migration': return <Flag className="text-green-500" size={16} />;
        default: return <Circle className="text-slate-400" size={16} />;
    }
  };

  return (
    <div className="px-4 py-6 pb-24 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-slate-800 px-2">Family Chronicle</h2>
        
        <div className="relative border-l-2 border-slate-200 ml-3 space-y-8">
            {sortedEvents.map((event) => (
                <div key={event.id} className="relative pl-8">
                    {/* Dot on line */}
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-indigo-100 flex items-center justify-center shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                             <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">
                                {event.date}
                             </span>
                             <span className="bg-slate-50 p-1 rounded-full">{getIcon(event.type)}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">{event.title}</h3>
                        <p className="text-slate-600 text-sm mt-1 leading-relaxed">{event.description}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default Timeline;
