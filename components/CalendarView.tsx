import React, { useState } from 'react';
import { GeneratedContent, ContentStatus } from '../types';
import { ChevronLeft, ChevronRight, GripVertical, Clock, Image as ImageIcon } from 'lucide-react';

interface CalendarViewProps {
  content: GeneratedContent[];
  onSchedule: (platform: string, date: string, time?: string) => void;
  onPublish: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ content, onSchedule, onPublish }) => {
  const [currentWeekStart] = useState(new Date());
  const [publishing, setPublishing] = useState(false);

  // Generate 7 days starting from today
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    return {
      dateObj: d,
      dateStr: d.toISOString().split('T')[0], // YYYY-MM-DD
      dayName: d.toLocaleDateString('de-DE', { weekday: 'short' }),
      dayNumber: d.getDate()
    };
  });

  const getItemsForDay = (dateStr: string) => {
    return content.filter(c => c.scheduledDate === dateStr).sort((a, b) => {
        // Sort by time
        return (a.scheduledTime || '00:00').localeCompare(b.scheduledTime || '00:00');
    });
  };

  const unscheduledItems = content.filter(c => c.status === ContentStatus.Approved && !c.scheduledDate);

  const handleDrop = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    const platform = e.dataTransfer.getData("platform");
    if (platform) {
      // Default time when dropped is 10:00 if not already set
      onSchedule(platform, dateStr, "10:00");
    }
  };

  const handleDragStart = (e: React.DragEvent, platform: string) => {
    e.dataTransfer.setData("platform", platform);
  };

  const handlePublishClick = () => {
    setPublishing(true);
    setTimeout(() => {
        onPublish();
        setPublishing(false);
    }, 2500);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Content Kalender</h2>
        <div className="flex space-x-2">
           <button 
             className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md font-medium text-sm transition-all flex items-center"
             onClick={handlePublishClick}
             disabled={publishing}
           >
             {publishing ? (
                 <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Veröffentliche...
                 </>
             ) : 'Geplantes veröffentlichen'}
           </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Unscheduled Sidebar */}
        <div className="w-full lg:w-72 bg-slate-100 rounded-xl p-4 border border-slate-200">
          <h3 className="text-xs font-bold uppercase text-slate-500 mb-3 tracking-wider">Ungeplant ({unscheduledItems.length})</h3>
          <div className="space-y-3">
            {unscheduledItems.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm italic">
                    Keine genehmigten Inhalte zum Planen.
                </div>
            ) : (
                unscheduledItems.map(item => (
                <div 
                    key={item.platform}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.platform)}
                    className="bg-white rounded-lg shadow-sm border border-slate-200 cursor-move hover:shadow-md transition-shadow active:cursor-grabbing group overflow-hidden"
                >
                    <div className="flex">
                        {/* Thumbnail Sidebar */}
                        <div className="w-16 h-auto bg-slate-200 shrink-0">
                            {item.imageUrl ? (
                                <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <ImageIcon className="w-5 h-5" />
                                </div>
                            )}
                        </div>
                        {/* Content */}
                        <div className="p-3 flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase tracking-wide truncate">
                                    {item.platform.replace(/_/g, ' ')}
                                </span>
                                <GripVertical className="w-4 h-4 text-slate-300" />
                            </div>
                            <p className="text-xs text-slate-800 font-semibold line-clamp-2 leading-tight" title={item.title}>
                                {item.title}
                            </p>
                        </div>
                    </div>
                </div>
                ))
            )}
          </div>
          <div className="mt-4 p-3 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100">
            <span className="font-bold">Tipp:</span> Ziehe Elemente von hier in das Kalenderraster, um sie zu planen.
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                {days.map(day => (
                    <div key={day.dateStr} className="py-3 text-center border-r border-slate-100 last:border-r-0">
                        <div className="text-xs text-slate-500 uppercase font-semibold">{day.dayName}</div>
                        <div className="text-lg font-bold text-slate-800">{day.dayNumber}</div>
                    </div>
                ))}
            </div>
            <div className="flex-1 grid grid-cols-7 bg-slate-50/30">
                {days.map(day => (
                    <div 
                        key={day.dateStr} 
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, day.dateStr)}
                        className="border-r border-slate-200 last:border-r-0 min-h-[200px] p-2 transition-colors hover:bg-white flex flex-col gap-2"
                    >
                        {getItemsForDay(day.dateStr).map(item => (
                            <div key={item.platform} className="bg-white border border-slate-200 rounded-lg shadow-sm group relative cursor-default hover:shadow-md transition-all overflow-hidden flex flex-col">
                                {/* Top Image Section */}
                                <div className="h-16 bg-slate-100 relative w-full">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <ImageIcon className="w-6 h-6" />
                                        </div>
                                    )}
                                    {/* Platform Badge Overlay */}
                                    <div className="absolute top-1 left-1 bg-black/60 text-white text-[8px] font-bold px-1.5 py-0.5 rounded backdrop-blur-md uppercase">
                                        {item.platform.replace(/_/g, ' ')}
                                    </div>
                                    {/* Unschedule Button */}
                                    <button 
                                        onClick={() => onSchedule(item.platform, '')}
                                        className="absolute top-1 right-1 w-5 h-5 bg-red-500/90 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10 hover:bg-red-600"
                                        title="Entfernen"
                                    >
                                        &times;
                                    </button>
                                </div>
                                
                                {/* Info Section */}
                                <div className="p-2">
                                    <div className="flex items-center gap-1 mb-1.5">
                                        <Clock className="w-3 h-3 text-indigo-500" />
                                        <input 
                                            type="time" 
                                            className="text-[10px] font-bold text-slate-700 bg-transparent focus:bg-indigo-50 rounded focus:outline-none focus:ring-1 focus:ring-indigo-300 w-full cursor-pointer"
                                            value={item.scheduledTime || '10:00'}
                                            onChange={(e) => onSchedule(item.platform, day.dateStr, e.target.value)}
                                        />
                                    </div>
                                    <div className="text-[11px] font-medium text-slate-800 line-clamp-2 leading-tight" title={item.title}>
                                        {item.title}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};