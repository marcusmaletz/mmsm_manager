import React, { useState } from 'react';
import { GeneratedContent, ContentStatus } from '../types';
import { ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';

interface CalendarViewProps {
  content: GeneratedContent[];
  onSchedule: (platform: string, date: string) => void;
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
    return content.filter(c => c.scheduledDate === dateStr);
  };

  const unscheduledItems = content.filter(c => c.status === ContentStatus.Approved && !c.scheduledDate);

  const handleDrop = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    const platform = e.dataTransfer.getData("platform");
    if (platform) {
      onSchedule(platform, dateStr);
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
        <div className="w-full lg:w-64 bg-slate-100 rounded-xl p-4 border border-slate-200">
          <h3 className="text-xs font-bold uppercase text-slate-500 mb-3 tracking-wider">Ungeplant ({unscheduledItems.length})</h3>
          <div className="space-y-2">
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
                    className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 cursor-move hover:shadow-md transition-shadow active:cursor-grabbing"
                >
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 capitalize">{item.platform.replace('_', ' ')}</span>
                        <GripVertical className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-600 truncate">{item.title}</p>
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
                        className="border-r border-slate-200 last:border-r-0 min-h-[200px] p-2 transition-colors hover:bg-white"
                    >
                        {getItemsForDay(day.dateStr).map(item => (
                            <div key={item.platform} className="mb-2 bg-indigo-50 border border-indigo-100 p-2 rounded text-xs shadow-sm group relative">
                                <div className="font-bold text-indigo-900 capitalize mb-1">{item.platform.replace('_', ' ')}</div>
                                <div className="text-indigo-700 truncate">{item.title}</div>
                                <button 
                                    onClick={() => onSchedule(item.platform, '')} // Unschedule
                                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    &times;
                                </button>
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