import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { InputForm } from './components/InputForm';
import { ContentCard } from './components/ContentCard';
import { CalendarView } from './components/CalendarView';
import { SettingsView } from './components/SettingsView';
import { BriefingData, GeneratedContent, ContentStatus, Persona, PromptConfig } from './types';
import { generateSocialContent, generateAiImage } from './services/geminiService';
import { LayoutDashboard } from 'lucide-react';
import { DEFAULT_PERSONAS, DEFAULT_PROMPTS } from './services/defaults';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'settings'>('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [generatingImageFor, setGeneratingImageFor] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // Settings State with LocalStorage initialization
  const [personas, setPersonas] = useState<Persona[]>(() => {
    const saved = localStorage.getItem('sm_personas');
    return saved ? JSON.parse(saved) : DEFAULT_PERSONAS;
  });

  const [promptConfig, setPromptConfig] = useState<PromptConfig>(() => {
    const saved = localStorage.getItem('sm_prompts');
    return saved ? JSON.parse(saved) : DEFAULT_PROMPTS;
  });

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('sm_personas', JSON.stringify(personas));
  }, [personas]);

  useEffect(() => {
    localStorage.setItem('sm_prompts', JSON.stringify(promptConfig));
  }, [promptConfig]);


  // Show notification toast
  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleGenerate = async (briefing: BriefingData) => {
    setIsLoading(true);
    try {
      const result = await generateSocialContent(briefing, promptConfig);
      
      const newContent: GeneratedContent[] = [
        {
          platform: 'instagram_feed',
          title: 'Instagram Beitrag',
          content: result.instagram_feed.caption,
          visualPrompt: result.instagram_feed.visual_idea,
          hashtags: result.instagram_feed.hashtags,
          status: ContentStatus.Draft
        },
        {
          platform: 'linkedin',
          title: 'LinkedIn Fachbeitrag',
          content: result.linkedin.text,
          visualPrompt: `Folien-Struktur: ${result.linkedin.slide_structure.join(' | ')}`,
          status: ContentStatus.Draft
        },
        {
          platform: 'facebook',
          title: 'Facebook Community Post',
          content: result.facebook.text,
          visualPrompt: result.facebook.visual_idea,
          status: ContentStatus.Draft
        },
        {
          platform: 'blog_post',
          title: result.blog_post.title,
          content: result.blog_post.body_html,
          visualPrompt: result.blog_post.meta_description,
          status: ContentStatus.Draft
        },
        {
          platform: 'instagram_story',
          title: 'Story Sequenz',
          content: result.instagram_story.sequences.join('\n\n---\n\n'),
          status: ContentStatus.Draft
        },
        {
          platform: 'reels_shorts',
          title: 'Video Skript',
          content: result.reels_shorts.script_table.map(row => `[BILD]: ${row.visual}\n[TON]: ${row.audio}`).join('\n\n'),
          status: ContentStatus.Draft
        },
        {
          platform: 'youtube_video',
          title: 'YouTube Outline',
          content: `TITEL:\n${result.youtube_video.title_ideas.join('\n')}\n\nGLIEDERUNG:\n${result.youtube_video.outline.join('\n')}`,
          status: ContentStatus.Draft
        }
      ];

      setGeneratedContent(newContent);
      showNotification("Content erfolgreich generiert!");
    } catch (error) {
      console.error(error);
      showNotification("Fehler beim Generieren. API-Key prüfen.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageGeneration = async (platform: string, prompt: string) => {
      setGeneratingImageFor(platform);
      try {
          const imageUrl = await generateAiImage(prompt);
          setGeneratedContent(prev => 
            prev.map(item => item.platform === platform ? { ...item, imageUrl } : item)
          );
          showNotification("Bild erfolgreich erstellt!");
      } catch (error) {
          console.error(error);
          showNotification("Fehler bei der Bildgenerierung.");
      } finally {
          setGeneratingImageFor(null);
      }
  };

  const handleUpdateContent = (updatedItem: GeneratedContent) => {
    setGeneratedContent(prev => 
      prev.map(item => item.platform === updatedItem.platform ? updatedItem : item)
    );
  };

  const handleApprove = (platform: string) => {
    setGeneratedContent(prev => 
      prev.map(item => item.platform === platform ? { ...item, status: ContentStatus.Approved } : item)
    );
    showNotification("Content genehmigt! Bereit für den Kalender.");
  };

  const handleSchedule = (platform: string, date: string) => {
      setGeneratedContent(prev => 
        prev.map(item => item.platform === platform ? { 
            ...item, 
            status: date ? ContentStatus.Scheduled : ContentStatus.Approved,
            scheduledDate: date || undefined
        } : item)
      );
  };

  const handlePublish = () => {
    setGeneratedContent(prev => 
        prev.map(item => item.status === ContentStatus.Scheduled ? { ...item, status: ContentStatus.Published } : item)
    );
    showNotification("Alle geplanten Posts erfolgreich veröffentlicht! 🚀");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="ml-0 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 capitalize">
                {activeTab === 'dashboard' ? 'Dashboard' : activeTab === 'settings' ? 'Einstellungen' : 'Kalender'}
              </h1>
              <p className="text-slate-500 mt-1">
                {activeTab === 'dashboard' ? 'Verwalte und wiederverwende deinen Content.' : activeTab === 'settings' ? 'Personas und KI-Prompts konfigurieren.' : 'Plane deinen Veröffentlichungszeitplan.'}
              </p>
            </div>
            
            {/* Stats (Mock) - Hide on Settings */}
            {activeTab !== 'settings' && (
                <div className="hidden md:flex space-x-6">
                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-100">
                        <div className="text-xs text-slate-400 font-bold uppercase">Generiert</div>
                        <div className="text-xl font-bold text-slate-800">{generatedContent.length} Inhalte</div>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-100">
                        <div className="text-xs text-slate-400 font-bold uppercase">Fertig</div>
                        <div className="text-xl font-bold text-indigo-600">{generatedContent.filter(c => c.status === ContentStatus.Approved || c.status === ContentStatus.Scheduled).length} Posts</div>
                    </div>
                </div>
            )}
          </header>

          {activeTab === 'dashboard' && (
            <>
              <InputForm 
                onSubmit={handleGenerate} 
                isLoading={isLoading} 
                personas={personas}
                onOpenSettings={() => setActiveTab('settings')}
              />
              
              {generatedContent.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {generatedContent.map((item) => (
                        <ContentCard 
                            key={item.platform} 
                            data={item} 
                            onUpdate={handleUpdateContent}
                            onApprove={() => handleApprove(item.platform)}
                            onGenerateImage={handleImageGeneration}
                            isGeneratingImage={generatingImageFor === item.platform}
                        />
                    ))}
                 </div>
              ) : (
                !isLoading && (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 text-indigo-500 mb-4">
                            <LayoutDashboard className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">Noch kein Content generiert</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mt-2">Starte, indem du ein Thema im Formular eingibst, um die KI-Magie zu entfesseln.</p>
                    </div>
                )
              )}

              {isLoading && generatedContent.length === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white rounded-xl h-64 p-4 shadow-sm border border-slate-100 animate-pulse">
                            <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
                            <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                            <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                            <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
                            <div className="h-32 bg-slate-100 rounded w-full"></div>
                        </div>
                    ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'calendar' && (
              <CalendarView 
                content={generatedContent} 
                onSchedule={handleSchedule}
                onPublish={handlePublish}
              />
          )}

          {activeTab === 'settings' && (
              <SettingsView 
                personas={personas}
                onSavePersonas={(newPersonas) => {
                    setPersonas(newPersonas);
                    showNotification("Personas gespeichert!");
                }}
                prompts={promptConfig}
                onSavePrompts={(newPrompts) => {
                    setPromptConfig(newPrompts);
                    showNotification("Prompts aktualisiert!");
                }}
              />
          )}

        </div>
      </main>

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-6 py-3 rounded-lg shadow-xl z-[100] flex items-center animate-bounce-in">
            <div className="mr-3 text-green-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            {notification}
        </div>
      )}
    </div>
  );
};

export default App;