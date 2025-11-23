import React, { useState, useRef } from 'react';
import { GeneratedContent, ContentStatus } from '../types';
import { Copy, Edit2, Smartphone, Check, Clock, Save, XCircle, Image as ImageIcon, Upload, Sparkles, Loader2 } from 'lucide-react';
import { PlatformPreview } from './PlatformPreview';

interface ContentCardProps {
  data: GeneratedContent;
  onUpdate: (updatedData: GeneratedContent) => void;
  onApprove: (id: string) => void; 
  onGenerateImage: (platform: string, prompt: string) => Promise<void>;
  isGeneratingImage: boolean;
}

export const ContentCard: React.FC<ContentCardProps> = ({ data, onUpdate, onApprove, onGenerateImage, isGeneratingImage }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(data.content);
  const [editedVisualPrompt, setEditedVisualPrompt] = useState(data.visualPrompt || '');
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram_feed': return <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">IG</div>;
      case 'linkedin': return <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center text-white font-bold text-xs">LI</div>;
      case 'facebook': return <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">FB</div>;
      case 'blog_post': return <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-xs">BL</div>;
      case 'instagram_story': return <div className="w-8 h-8 rounded-full border-2 border-pink-500 flex items-center justify-center text-pink-500 font-bold text-xs">St</div>;
      case 'reels_shorts': return <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white font-bold text-xs">YT</div>;
      case 'youtube_video': return <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-xs">YT</div>;
      default: return <div className="w-8 h-8 rounded-lg bg-gray-500" />;
    }
  };

  const getStatusBadge = (status: ContentStatus) => {
    switch (status) {
      case ContentStatus.Approved:
        return <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium flex items-center"><Check className="w-3 h-3 mr-1" /> Genehmigt</span>;
      case ContentStatus.Scheduled:
        return <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium flex items-center"><Clock className="w-3 h-3 mr-1" /> Geplant</span>;
      case ContentStatus.Published:
        return <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">Veröffentlicht</span>;
      default:
        return <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">Entwurf</span>;
    }
  };

  const handleSave = () => {
    onUpdate({ 
        ...data, 
        content: editedContent,
        visualPrompt: editedVisualPrompt
    });
    setIsEditing(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onUpdate({ ...data, imageUrl: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageGenClick = async () => {
      const promptToUse = isEditing ? editedVisualPrompt : data.visualPrompt;
      if (promptToUse) {
          await onGenerateImage(data.platform, promptToUse);
      }
  };

  return (
    <>
      <div className={`bg-white rounded-xl shadow-sm border transition-all duration-300 ${isEditing ? 'border-indigo-500 ring-2 ring-indigo-50 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {getPlatformIcon(data.platform)}
            <div>
              <h3 className="font-bold text-slate-800 capitalize text-sm">{data.platform.replace(/_/g, ' ')}</h3>
              <p className="text-xs text-slate-500 truncate max-w-[150px]">{data.title}</p>
            </div>
          </div>
          <div>
            {getStatusBadge(data.status)}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Textinhalt</label>
            {isEditing ? (
                <textarea
                className="w-full h-40 p-3 text-sm text-slate-700 border border-slate-200 bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-mono"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                />
            ) : (
                <div 
                className="h-40 overflow-y-auto text-sm text-slate-600 whitespace-pre-wrap cursor-pointer hover:bg-slate-50 rounded-lg p-2 transition-colors border border-transparent hover:border-slate-200"
                onClick={() => setIsEditing(true)}
                title="Zum Bearbeiten klicken"
                >
                {data.content}
                </div>
            )}
          </div>
          
          {/* Media Section */}
          <div className="pt-2 border-t border-slate-50">
             <label className="text-[10px] uppercase font-bold text-slate-400 mb-2 block flex justify-between">
                 <span>Medien / Visuals</span>
             </label>
             
             {/* Visual Prompt Editor */}
             {data.visualPrompt && (
                 <div className="mb-3">
                     {isEditing ? (
                         <textarea
                            className="w-full h-16 p-2 text-xs text-slate-600 border border-slate-200 bg-slate-50 rounded focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                            value={editedVisualPrompt}
                            onChange={(e) => setEditedVisualPrompt(e.target.value)}
                            placeholder="Beschreibe das Bild für die KI..."
                         />
                     ) : (
                         <div className="bg-slate-50 p-2 rounded border border-slate-100 text-xs text-slate-500 italic truncate cursor-pointer hover:bg-slate-100" onClick={() => setIsEditing(true)}>
                            {data.visualPrompt}
                         </div>
                     )}
                 </div>
             )}

             {/* Image Preview & Controls */}
             <div className="flex gap-4 items-start">
                 <div className="w-20 h-20 bg-slate-100 rounded-lg flex-shrink-0 border border-slate-200 overflow-hidden flex items-center justify-center relative group">
                     {data.imageUrl ? (
                         <img src={data.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                     ) : (
                         <ImageIcon className="w-6 h-6 text-slate-300" />
                     )}
                     {data.imageUrl && (
                        <button 
                            onClick={() => onUpdate({...data, imageUrl: undefined})} 
                            className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <XCircle className="w-3 h-3" />
                        </button>
                     )}
                 </div>
                 
                 <div className="flex flex-col gap-2 w-full">
                     <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileUpload}
                     />
                     <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center w-full py-1.5 px-3 border border-slate-300 rounded text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                     >
                         <Upload className="w-3 h-3 mr-2" /> Bild hochladen
                     </button>
                     
                     {data.visualPrompt && (
                        <button 
                            onClick={handleImageGenClick}
                            disabled={isGeneratingImage}
                            className={`flex items-center justify-center w-full py-1.5 px-3 rounded text-xs font-medium text-white transition-all ${isGeneratingImage ? 'bg-indigo-300' : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-sm'}`}
                        >
                            {isGeneratingImage ? (
                                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                            ) : (
                                <Sparkles className="w-3 h-3 mr-2" />
                            )}
                            {isGeneratingImage ? 'Generiere...' : 'KI-Bild erstellen'}
                        </button>
                     )}
                 </div>
             </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-slate-50 rounded-b-xl border-t border-slate-100 flex justify-between items-center">
          <div className="flex space-x-1">
             <button 
                onClick={() => setShowPreview(true)}
                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Mobile Vorschau"
            >
                <Smartphone className="w-4 h-4" />
             </button>
             <button 
                onClick={handleCopy}
                className={`p-2 rounded-lg transition-colors ${copied ? 'text-green-600 bg-green-50' : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'}`}
                title="Kopieren"
            >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
             </button>
          </div>

          <div className="flex space-x-2">
            {isEditing ? (
                <>
                    <button onClick={() => setIsEditing(false)} className="p-2 text-slate-400 hover:text-red-500"><XCircle className="w-4 h-4" /></button>
                    <button 
                        onClick={handleSave}
                        className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 flex items-center"
                    >
                        <Save className="w-3 h-3 mr-1" /> Speichern
                    </button>
                </>
            ) : (
                data.status === ContentStatus.Draft && (
                    <button 
                        onClick={() => onApprove(data.platform)}
                        className="px-4 py-2 border border-green-600 text-green-700 hover:bg-green-50 text-xs font-bold rounded-lg flex items-center transition-colors"
                    >
                        <Check className="w-3 h-3 mr-1" /> Genehmigen
                    </button>
                )
            )}
          </div>
        </div>
      </div>
      <PlatformPreview isOpen={showPreview} onClose={() => setShowPreview(false)} data={data} />
    </>
  );
};