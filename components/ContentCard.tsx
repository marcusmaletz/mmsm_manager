
import React, { useState, useRef, useEffect } from 'react';
import { GeneratedContent, ContentStatus } from '../types';
import { Copy, Smartphone, Check, Clock, Save, XCircle, Image as ImageIcon, Upload, Sparkles, Loader2, Maximize2, X, ChevronLeft, ChevronRight, PenLine, RefreshCw, ClipboardCopy, ClipboardPaste, Move, Download, Send } from 'lucide-react';
import { PlatformPreview } from './PlatformPreview';

interface ContentCardProps {
  data: GeneratedContent;
  onUpdate: (updatedData: GeneratedContent) => void;
  onApprove: (id: string) => void; 
  onGenerateImage: (platform: string, prompt: string) => Promise<void>;
  isGeneratingImage: boolean;
  globalClipboardImage?: string | null;
  onCopyImage?: (url: string) => void;
  onPublishNow: () => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({ 
    data, 
    onUpdate, 
    onApprove, 
    onGenerateImage, 
    isGeneratingImage,
    globalClipboardImage,
    onCopyImage,
    onPublishNow
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(data.content);
  // Local state for the visual prompt, always editable
  const [visualPrompt, setVisualPrompt] = useState(data.visualPrompt || '');
  
  const [showPreview, setShowPreview] = useState(false);
  const [showFullscreenImage, setShowFullscreenImage] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync local visual prompt state if data updates externally (e.g. after generation)
  useEffect(() => {
    setVisualPrompt(data.visualPrompt || '');
  }, [data.visualPrompt]);

  // Sync content when entering edit mode or data changes
  useEffect(() => {
    setEditedContent(data.content);
  }, [data.content]);

  const getPlatformIcon = (platform: string) => {
    const classes = "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm";
    switch (platform) {
      case 'instagram_feed': return <div className={`${classes} bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600`}>IG</div>;
      case 'linkedin': return <div className={`${classes} bg-[#0077b5]`}>LI</div>;
      case 'facebook': return <div className={`${classes} bg-[#1877f2]`}>FB</div>;
      case 'blog_post': return <div className={`${classes} bg-orange-500`}>BL</div>;
      case 'instagram_story': return <div className={`${classes} bg-gradient-to-tr from-purple-500 to-pink-500`}>ST</div>;
      case 'reels_shorts': return <div className={`${classes} bg-black`}>YT</div>;
      case 'youtube_video': return <div className={`${classes} bg-red-600`}>YT</div>;
      default: return <div className={`${classes} bg-gray-500`} />;
    }
  };

  const getStatusBadge = (status: ContentStatus) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5";
    switch (status) {
      case ContentStatus.Approved:
        return <span className={`${baseClasses} bg-green-50 text-green-700 border-green-200`}><Check className="w-3 h-3" /> Genehmigt</span>;
      case ContentStatus.Scheduled:
        return <span className={`${baseClasses} bg-purple-50 text-purple-700 border-purple-200`}><Clock className="w-3 h-3" /> Geplant</span>;
      case ContentStatus.Published:
        return <span className={`${baseClasses} bg-blue-50 text-blue-700 border-blue-200`}>Veröffentlicht</span>;
      default:
        return <span className={`${baseClasses} bg-slate-100 text-slate-600 border-slate-200`}>Entwurf</span>;
    }
  };

  const handleSave = () => {
    onUpdate({ 
        ...data, 
        content: editedContent,
        visualPrompt: visualPrompt
    });
    setIsEditing(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadImage = (e?: React.MouseEvent, url?: string) => {
      e?.stopPropagation();
      const imageToDownload = url || data.imageUrl;
      if (!imageToDownload) return;

      const link = document.createElement('a');
      link.href = imageToDownload;
      link.download = `multiplier-${data.platform}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onUpdate({ 
            ...data, 
            imageUrl: base64String,
            imageCandidates: [base64String] 
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const selectCandidate = (url: string) => {
      onUpdate({ ...data, imageUrl: url });
  };

  const handleNextImage = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (!data.imageCandidates || data.imageCandidates.length === 0) return;
      const currentIndex = data.imageUrl ? data.imageCandidates.indexOf(data.imageUrl) : 0;
      const nextIndex = (currentIndex + 1) % data.imageCandidates.length;
      selectCandidate(data.imageCandidates[nextIndex]);
  };

  const handlePrevImage = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (!data.imageCandidates || data.imageCandidates.length === 0) return;
      const currentIndex = data.imageUrl ? data.imageCandidates.indexOf(data.imageUrl) : 0;
      const prevIndex = (currentIndex - 1 + data.imageCandidates.length) % data.imageCandidates.length;
      selectCandidate(data.imageCandidates[prevIndex]);
  };

  // --- DRAG AND DROP HANDLERS ---
  const handleDragStart = (e: React.DragEvent) => {
      if (data.imageUrl) {
          e.dataTransfer.setData('text/plain', data.imageUrl);
          e.dataTransfer.effectAllowed = 'copy';
      }
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault(); // Necessary to allow dropping
      setIsDraggedOver(true);
  };

  const handleDragLeave = () => {
      setIsDraggedOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDraggedOver(false);
      const imageUrl = e.dataTransfer.getData('text/plain');
      if (imageUrl && imageUrl.startsWith('data:image')) {
          onUpdate({
              ...data,
              imageUrl: imageUrl,
              imageCandidates: [imageUrl, ...(data.imageCandidates || [])]
          });
      }
  };

  // --- CLIPBOARD HANDLERS ---
  const handlePasteImage = () => {
      if (globalClipboardImage) {
          onUpdate({
              ...data,
              imageUrl: globalClipboardImage,
              imageCandidates: [globalClipboardImage, ...(data.imageCandidates || [])]
          });
      }
  };


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (!showFullscreenImage) return;
        if (e.key === 'ArrowRight') handleNextImage();
        if (e.key === 'ArrowLeft') handlePrevImage();
        if (e.key === 'Escape') setShowFullscreenImage(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showFullscreenImage, data.imageUrl, data.imageCandidates]);


  return (
    <>
      <div className={`group bg-white rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden ${isEditing ? 'border-indigo-400 ring-4 ring-indigo-50 shadow-xl z-10' : 'border-slate-200 hover:border-indigo-200 hover:shadow-lg'}`}>
        
        {/* --- Header Section --- */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start bg-gradient-to-b from-white to-slate-50/50">
          <div className="flex items-start gap-4">
            {getPlatformIcon(data.platform)}
            <div className="pt-0.5">
              <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase opacity-90">{data.platform.replace(/_/g, ' ')}</h3>
              <p className="text-sm text-slate-500 font-medium truncate max-w-[180px]">{data.title}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {getStatusBadge(data.status)}
            {!isEditing && (
                <button 
                    onClick={() => setIsEditing(true)} 
                    className="text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors mt-1"
                >
                    <PenLine className="w-3 h-3" /> Bearbeiten
                </button>
            )}
          </div>
        </div>

        {/* --- Body Section --- */}
        <div className="flex-1 flex flex-col divide-y divide-slate-100">
          
          {/* Copywriting Section */}
          <div className="p-6 relative bg-white">
            <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    Textinhalt
                </label>
                <button 
                    onClick={handleCopy}
                    className={`p-1.5 rounded-md transition-all ${copied ? 'bg-green-100 text-green-700' : 'bg-slate-50 text-slate-400 hover:text-indigo-600'}`}
                    title="Text kopieren"
                >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
            </div>

            {isEditing ? (
                <textarea
                    className="w-full min-h-[250px] p-4 text-sm text-slate-800 border border-indigo-200 bg-indigo-50/30 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-y font-normal leading-relaxed shadow-inner"
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    placeholder="Generiere Text..."
                />
            ) : (
                <div 
                    className="min-h-[120px] max-h-[400px] overflow-y-auto text-sm text-slate-700 whitespace-pre-wrap leading-relaxed cursor-pointer rounded-xl border border-transparent hover:bg-slate-50 hover:border-slate-100 p-2 -mx-2 transition-all"
                    onClick={() => setIsEditing(true)}
                >
                    {data.content}
                </div>
            )}
          </div>

          {/* Visuals Studio Section */}
          <div className="p-6 bg-slate-50/50">
             <div className="flex justify-between items-end mb-4">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                     <ImageIcon className="w-3.5 h-3.5" /> Creative Studio
                 </label>
                 
                 <div className="flex gap-2">
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-medium text-slate-500 hover:text-slate-800 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5"
                    >
                        <Upload className="w-3 h-3" /> Upload
                    </button>
                 </div>
             </div>

             {/* Visual Prompt (Always Editable) */}
             <div className="mb-4">
                 <div className="relative group">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Bild-Prompt (Editierbar)</span>
                    </div>
                    <textarea
                        className="w-full h-24 p-3 text-xs text-slate-700 border border-slate-200 bg-white rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none shadow-sm transition-shadow hover:border-indigo-200"
                        value={visualPrompt}
                        onChange={(e) => setVisualPrompt(e.target.value)}
                        placeholder="Beschreibe das Bild für die KI..."
                    />
                 </div>
                 
                 <button 
                    onClick={async () => {
                         if(visualPrompt) await onGenerateImage(data.platform, visualPrompt);
                    }}
                    disabled={isGeneratingImage || !visualPrompt}
                    className={`w-full mt-2 flex items-center justify-center py-2.5 rounded-lg text-xs font-bold text-white shadow-sm transition-all ${isGeneratingImage || !visualPrompt ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-indigo-600 hover:shadow-md'}`}
                 >
                    {isGeneratingImage ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 mr-2" />}
                    {isGeneratingImage ? 'KI arbeitet...' : '4 Varianten generieren'}
                 </button>
             </div>

             {/* Gallery Area */}
             <div className="space-y-4">
                 {/* Main Stage & Drop Zone */}
                 <div 
                    className={`bg-white p-2 rounded-xl border-2 transition-all shadow-sm ${isDraggedOver ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' : 'border-slate-200'}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                 >
                    {data.imageUrl ? (
                        <div 
                            className="relative aspect-video w-full rounded-lg overflow-hidden group bg-slate-100 cursor-grab active:cursor-grabbing"
                            draggable={true}
                            onDragStart={handleDragStart}
                        >
                             <img 
                                 src={data.imageUrl} 
                                 alt="Main Visual" 
                                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                 // onClick removed to prevent conflict with dragging
                             />
                             
                             {/* Overlay Controls */}
                             <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                <div className="flex gap-2">
                                    {/* Zoom Button */}
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setShowFullscreenImage(true); }}
                                        className="bg-white/90 hover:bg-white text-slate-900 px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 transform hover:scale-105 transition-all cursor-pointer"
                                    >
                                        <Maximize2 className="w-3.5 h-3.5" /> Vergrößern
                                    </button>
                                    
                                    {/* Download Button */}
                                    <button 
                                        onClick={(e) => handleDownloadImage(e)}
                                        className="bg-white/90 hover:bg-white text-slate-900 p-2 rounded-full shadow-lg transform hover:scale-105 transition-all cursor-pointer"
                                        title="Bild herunterladen"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                
                                {/* Drag Hint (Visual only) */}
                                <div className="text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 drop-shadow-md mt-2">
                                    <Move className="w-3 h-3" /> Ziehen zum Verschieben
                                </div>
                             </div>

                             {/* Actions Corner */}
                             <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                 {onCopyImage && (
                                     <button
                                        onClick={(e) => { e.stopPropagation(); onCopyImage(data.imageUrl!); }}
                                        className="bg-black/60 hover:bg-indigo-600 text-white p-1.5 rounded-md backdrop-blur-sm transition-colors"
                                        title="Bild kopieren"
                                     >
                                         <ClipboardCopy className="w-3.5 h-3.5" />
                                     </button>
                                 )}
                                 <button 
                                    onClick={(e) => { e.stopPropagation(); onUpdate({...data, imageUrl: undefined, imageCandidates: []}) }}
                                    className="bg-black/60 hover:bg-red-500 text-white p-1.5 rounded-md backdrop-blur-sm transition-colors"
                                    title="Bild entfernen"
                                 >
                                    <X className="w-3.5 h-3.5" />
                                 </button>
                             </div>
                        </div>
                    ) : (
                        <div className="aspect-video w-full rounded-lg bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 group relative">
                            {globalClipboardImage ? (
                                <button 
                                    onClick={handlePasteImage}
                                    className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                >
                                    <ClipboardPaste className="w-8 h-8" />
                                    <span className="text-xs font-bold">Bild aus Zwischenablage einfügen</span>
                                </button>
                            ) : (
                                <>
                                    <div className={`transition-all duration-300 ${isDraggedOver ? 'scale-110 text-indigo-500' : ''}`}>
                                        <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                                    </div>
                                    <span className="text-xs">{isDraggedOver ? 'Bild jetzt loslassen!' : 'Kein Bild ausgewählt / Bild hierher ziehen'}</span>
                                </>
                            )}
                        </div>
                    )}
                 </div>

                 {/* Candidate Strip */}
                 {data.imageCandidates && data.imageCandidates.length > 0 && (
                     <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Varianten-Auswahl</div>
                        <div className="grid grid-cols-4 gap-2">
                            {data.imageCandidates.map((url, idx) => (
                                <div 
                                    key={idx}
                                    onClick={() => selectCandidate(url)}
                                    className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${data.imageUrl === url ? 'border-indigo-600 ring-2 ring-indigo-100 shadow-md scale-[1.02]' : 'border-transparent hover:border-slate-300 opacity-70 hover:opacity-100'}`}
                                >
                                    <img src={url} alt={`Var ${idx}`} className="w-full h-full object-cover" />
                                    {data.imageUrl === url && <div className="absolute inset-0 bg-indigo-600/10 z-10" />}
                                </div>
                            ))}
                        </div>
                     </div>
                 )}
             </div>
          </div>
        </div>

        {/* --- Footer Actions --- */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center gap-4">
            <button 
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-xs font-bold px-3 py-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm transition-all"
            >
                <Smartphone className="w-4 h-4" /> Vorschau
            </button>

            <div className="flex gap-2">
                {isEditing ? (
                    <>
                        <button 
                            onClick={() => setIsEditing(false)} 
                            className="px-4 py-2 text-slate-500 hover:text-slate-800 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors"
                        >
                            Abbrechen
                        </button>
                        <button 
                            onClick={handleSave}
                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                        >
                            <Save className="w-3 h-3" /> Speichern
                        </button>
                    </>
                ) : (
                    <>
                        {data.status === ContentStatus.Draft && (
                            <button 
                                onClick={() => onApprove(data.platform)}
                                className="px-5 py-2 bg-white border border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 text-xs font-bold rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2"
                            >
                                <Check className="w-3 h-3" /> Genehmigen
                            </button>
                        )}
                        {(data.status === ContentStatus.Approved || data.status === ContentStatus.Scheduled) && (
                            <button 
                                onClick={onPublishNow}
                                className="px-5 py-2 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2"
                                title="Ohne Kalender sofort an n8n senden"
                            >
                                <Send className="w-3 h-3" /> Sofort posten
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
      </div>
      
      {/* Mobile Preview Modal */}
      <PlatformPreview isOpen={showPreview} onClose={() => setShowPreview(false)} data={data} />
      
      {/* Fullscreen Lightbox */}
      {showFullscreenImage && data.imageUrl && (
          <div className="fixed inset-0 z-[120] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-fade-in" onClick={() => setShowFullscreenImage(false)}>
              
              <button className="absolute top-6 right-6 text-white/50 hover:text-white p-2 transition-colors z-[130]">
                  <X className="w-10 h-10" />
              </button>

              {(data.imageCandidates?.length || 0) > 1 && (
                  <>
                    <button className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm transition-all z-[130]" onClick={handlePrevImage}>
                        <ChevronLeft className="w-8 h-8" />
                    </button>
                    <button className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm transition-all z-[130]" onClick={handleNextImage}>
                        <ChevronRight className="w-8 h-8" />
                    </button>
                  </>
              )}

              <div className="flex flex-col items-center w-full max-w-6xl h-full justify-center gap-8" onClick={(e) => e.stopPropagation()}>
                  <div className="relative flex-1 w-full flex items-center justify-center min-h-0">
                    <img 
                        src={data.imageUrl} 
                        alt="Fullscreen" 
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl ring-1 ring-white/10"
                    />
                  </div>
                  
                  {/* Thumbnails in Lightbox */}
                  <div className="flex gap-4 overflow-x-auto pb-4 max-w-full px-4">
                      {data.imageCandidates?.map((url, idx) => (
                          <button
                            key={idx}
                            onClick={() => selectCandidate(url)}
                            className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${data.imageUrl === url ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] scale-110 z-10' : 'border-white/20 opacity-50 hover:opacity-100'}`}
                          >
                              <img src={url} alt="" className="w-full h-full object-cover" />
                          </button>
                      ))}
                  </div>

                  <div className="flex gap-4">
                      <button 
                        onClick={() => setShowFullscreenImage(false)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 transform active:scale-95 transition-all"
                      >
                          <Check className="w-5 h-5" /> Auswahl bestätigen
                      </button>
                      <button 
                        onClick={(e) => handleDownloadImage(e)}
                        className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 transition-all border border-white/20"
                      >
                          <Download className="w-5 h-5" /> Download
                      </button>
                  </div>
              </div>
          </div>
      )}
    </>
  );
};
