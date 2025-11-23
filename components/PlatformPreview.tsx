import React from 'react';
import { X, Wifi, Battery, Signal } from 'lucide-react';
import { GeneratedContent } from '../types';

interface PlatformPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  data: GeneratedContent;
}

export const PlatformPreview: React.FC<PlatformPreviewProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;

  const renderContent = () => {
    switch (data.platform) {
      case 'instagram_feed':
        return (
          <div className="bg-white h-full flex flex-col">
            <div className="h-12 border-b flex items-center px-4 font-bold text-sm">Instagram</div>
            <div className="aspect-square bg-slate-200 flex items-center justify-center text-slate-500 text-xs text-center overflow-hidden">
              {data.imageUrl ? (
                  <img src={data.imageUrl} alt="Post Visual" className="w-full h-full object-cover" />
              ) : (
                  <div className="p-4">{data.visualPrompt ? `[Bildidee: ${data.visualPrompt.substring(0, 100)}...]` : '[Platzhalterbild]'}</div>
              )}
            </div>
            <div className="p-3 text-sm">
              <p className="font-bold mb-1">social_multiplier_app</p>
              <p className="whitespace-pre-wrap text-xs text-slate-800">{data.content}</p>
              <div className="mt-2 text-indigo-600 text-xs">
                {data.hashtags?.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ')}
              </div>
            </div>
          </div>
        );
      case 'linkedin':
        return (
            <div className="bg-[#f3f2ef] h-full flex flex-col p-2">
                <div className="bg-white rounded-lg shadow-sm p-3 mb-2">
                   <div className="flex items-center mb-2">
                       <div className="w-10 h-10 rounded-full bg-slate-300"></div>
                       <div className="ml-2">
                           <div className="font-bold text-sm">Max Mustermann</div>
                           <div className="text-xs text-slate-500">Gerade eben • 🌐</div>
                       </div>
                   </div>
                   <div className="text-sm whitespace-pre-wrap mb-2">{data.content}</div>
                   {data.imageUrl ? (
                       <img src={data.imageUrl} alt="Post Visual" className="w-full h-auto rounded border border-slate-100" />
                   ) : (
                       data.visualPrompt && (
                           <div className="bg-slate-100 border rounded p-4 text-xs text-slate-500 italic">
                               Slide Carousel Struktur:<br/>
                               {data.visualPrompt}
                           </div>
                       )
                   )}
                </div>
            </div>
        );
      case 'facebook':
          return (
            <div className="bg-[#f0f2f5] h-full flex flex-col pt-2">
                <div className="bg-white shadow-sm mb-2 pb-2">
                   <div className="flex items-center p-3 mb-1">
                       <div className="w-10 h-10 rounded-full bg-slate-300"></div>
                       <div className="ml-2">
                           <div className="font-bold text-sm">Social Page</div>
                           <div className="text-xs text-slate-500">Gestern um 10:42 • 🌎</div>
                       </div>
                   </div>
                   <div className="text-sm whitespace-pre-wrap px-3 pb-3">{data.content}</div>
                   {data.imageUrl ? (
                       <img src={data.imageUrl} alt="Post Visual" className="w-full h-auto bg-slate-100" />
                   ) : (
                       <div className="aspect-video bg-slate-200 flex items-center justify-center text-xs text-slate-500">
                           {data.visualPrompt || "Bildplatzhalter"}
                       </div>
                   )}
                   <div className="px-3 py-2 mt-1 border-t border-slate-100 flex justify-between text-slate-500 text-xs font-semibold">
                       <span>Gefällt mir</span>
                       <span>Kommentieren</span>
                       <span>Teilen</span>
                   </div>
                </div>
            </div>
          );
      default:
        return (
          <div className="p-4 overflow-y-auto h-full bg-white">
            <h3 className="font-bold text-lg mb-2 capitalize">{data.platform.replace('_', ' ')}</h3>
            {data.imageUrl && (
                <img src={data.imageUrl} alt="Visual" className="w-full h-auto rounded-lg mb-4 border border-slate-200" />
            )}
            <div className="whitespace-pre-wrap text-sm text-slate-700">{data.content}</div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="relative w-full max-w-sm h-[80vh] md:h-[700px] bg-white rounded-[3rem] border-[8px] border-slate-900 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Inner container with overflow hidden matches the border radius minus border width roughly */}
        <div className="relative w-full h-full overflow-hidden rounded-[2.5rem] flex flex-col bg-white">
            
            {/* Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-20"></div>
            
            {/* Status Bar */}
            <div className="h-10 bg-white flex justify-between items-center px-6 pt-2 select-none z-10 border-b border-slate-100 shrink-0">
                <span className="text-xs font-semibold">9:41</span>
                <div className="flex space-x-1">
                    <Signal className="w-3 h-3" />
                    <Wifi className="w-3 h-3" />
                    <Battery className="w-3 h-3" />
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-slate-50 scrollbar-hide relative">
                {renderContent()}
            </div>

            {/* Home Indicator */}
            <div className="h-6 bg-white w-full flex justify-center items-center shrink-0">
                <div className="w-1/3 h-1 bg-slate-900 rounded-full"></div>
            </div>
        </div>

        {/* Close Button - Positioned absolutely relative to the phone frame, but outside overflow-hidden */}
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 md:-right-16 md:top-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-slate-900 hover:bg-red-50 hover:text-red-600 transition-colors z-50 cursor-pointer"
            aria-label="Schließen"
        >
            <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};