
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { InputForm } from './components/InputForm';
import { ContentCard } from './components/ContentCard';
import { CalendarView } from './components/CalendarView';
import { SettingsView } from './components/SettingsView';
import { BriefingData, GeneratedContent, ContentStatus, Persona, PromptConfig, UserProfile, AutomationConfig } from './types';
import { generateSocialContent, generateAiImages } from './services/geminiService';
import { DEFAULT_PERSONAS, DEFAULT_PROMPTS, DEFAULT_USER_PROFILE, DEFAULT_AUTOMATION_CONFIG } from './services/defaults';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'settings'>('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [generatingImageFor, setGeneratingImageFor] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [globalClipboardImage, setGlobalClipboardImage] = useState<string | null>(null);

  // --- SAFE INITIALIZATION WRAPPER ---
  const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
      try {
          const saved = localStorage.getItem(key);
          if (!saved) return defaultValue;
          const parsed = JSON.parse(saved);
          // If it's an object, merge with default to ensure no missing keys
          if (typeof defaultValue === 'object' && defaultValue !== null && !Array.isArray(defaultValue)) {
              return { ...defaultValue, ...parsed };
          }
          return parsed;
      } catch (e) {
          console.error(`Failed to load ${key}`, e);
          return defaultValue;
      }
  };

  const [personas, setPersonas] = useState<Persona[]>(() => loadFromStorage('sm_personas', DEFAULT_PERSONAS));
  const [promptConfig, setPromptConfig] = useState<PromptConfig>(() => loadFromStorage('sm_prompts', DEFAULT_PROMPTS));
  const [userProfile, setUserProfile] = useState<UserProfile>(() => loadFromStorage('sm_user_profile', DEFAULT_USER_PROFILE));
  const [automationConfig, setAutomationConfig] = useState<AutomationConfig>(() => loadFromStorage('sm_automation', DEFAULT_AUTOMATION_CONFIG));

  // Persistence Effects
  useEffect(() => { localStorage.setItem('sm_personas', JSON.stringify(personas)); }, [personas]);
  useEffect(() => { localStorage.setItem('sm_prompts', JSON.stringify(promptConfig)); }, [promptConfig]);
  useEffect(() => { localStorage.setItem('sm_user_profile', JSON.stringify(userProfile)); }, [userProfile]);
  useEffect(() => { localStorage.setItem('sm_automation', JSON.stringify(automationConfig)); }, [automationConfig]);


  const showNotification = (msg: string, isError = false) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), isError ? 5000 : 3000);
  };

  const handleGenerate = async (briefing: BriefingData) => {
    setIsLoading(true);
    try {
      const result = await generateSocialContent(briefing, promptConfig, userProfile);
      
      const newContent: GeneratedContent[] = [
        {
          platform: 'instagram_feed',
          title: briefing.topic,
          content: result.instagram_feed.caption,
          visualPrompt: result.instagram_feed.visual_idea,
          hashtags: result.instagram_feed.hashtags,
          status: ContentStatus.Draft
        },
        {
          platform: 'linkedin',
          title: briefing.topic,
          content: result.linkedin.text,
          visualPrompt: `Folien-Struktur: ${result.linkedin.slide_structure.join(' | ')}`,
          status: ContentStatus.Draft
        },
        {
          platform: 'facebook',
          title: briefing.topic,
          content: result.facebook.text,
          visualPrompt: result.facebook.visual_idea,
          status: ContentStatus.Draft
        },
        {
          platform: 'blog_post',
          title: result.blog_post.title || briefing.topic,
          content: result.blog_post.body_html,
          visualPrompt: result.blog_post.meta_description,
          status: ContentStatus.Draft
        },
        {
          platform: 'instagram_story',
          title: briefing.topic,
          content: result.instagram_story.sequences.join('\n\n---\n\n'),
          status: ContentStatus.Draft
        },
        {
          platform: 'reels_shorts',
          title: briefing.topic,
          content: result.reels_shorts.script_table.map(row => `[BILD]: ${row.visual}\n[TON]: ${row.audio}`).join('\n\n'),
          status: ContentStatus.Draft
        },
        {
          platform: 'youtube_video',
          title: briefing.topic,
          content: `TITEL:\n${result.youtube_video.title_ideas.join('\n')}\n\nGLIEDERUNG:\n${result.youtube_video.outline.join('\n')}`,
          status: ContentStatus.Draft
        }
      ];

      setGeneratedContent(newContent);
      showNotification("Content erfolgreich generiert!");
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes('quota') || error.message?.includes('429')) {
        showNotification("Limit erreicht: Das tägliche KI-Kontingent ist erschöpft.", true);
      } else {
        showNotification("Fehler beim Generieren.", true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageGeneration = async (platform: string, prompt: string) => {
      setGeneratingImageFor(platform);
      try {
          const images = await generateAiImages(prompt);
          setGeneratedContent(prev => 
            prev.map(item => item.platform === platform ? { 
                ...item, 
                imageUrl: images[0], 
                imageCandidates: images 
            } : item)
          );
          showNotification("4 Bildvarianten erfolgreich erstellt!");
      } catch (error: any) {
          if (error.message?.includes('quota') || error.message?.includes('429')) {
              showNotification("Fehler: Tägliches Bild-Limit (Quota) überschritten.", true);
          } else {
              showNotification("Fehler bei der Bildgenerierung.", true);
          }
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

  const handleSchedule = (platform: string, date: string, time?: string) => {
      setGeneratedContent(prev => 
        prev.map(item => item.platform === platform ? { 
            ...item, 
            status: date ? ContentStatus.Scheduled : ContentStatus.Approved,
            scheduledDate: date || undefined,
            scheduledTime: time !== undefined ? time : item.scheduledTime
        } : item)
      );
  };

  const handlePublish = async () => {
    const scheduledItems = generatedContent.filter(item => item.status === ContentStatus.Scheduled);
    
    if (scheduledItems.length === 0) {
        showNotification("Nichts zum Veröffentlichen (Status 'Geplant' erforderlich).", true);
        return;
    }

    if (!automationConfig.webhookUrl) {
        showNotification("Fehler: Keine n8n Webhook URL in den Einstellungen hinterlegt!", true);
        setActiveTab('settings');
        return;
    }

    let successCount = 0;
    let failCount = 0;

    showNotification("Sende Daten an n8n...", false);

    for (const item of scheduledItems) {
        try {
            // Send REAL HTTP Request to n8n Webhook
            const response = await fetch(automationConfig.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(automationConfig.secretToken ? { 'x-auth-token': automationConfig.secretToken } : {})
                },
                body: JSON.stringify({
                    platform: item.platform,
                    content: item.content,
                    title: item.title,
                    image: item.imageUrl || null,
                    scheduledTime: `${item.scheduledDate}T${item.scheduledTime || '10:00:00'}`,
                    status: 'PUBLISH_REQUEST'
                })
            });

            if (response.ok) {
                successCount++;
                // Update local status to Published
                setGeneratedContent(prev => 
                    prev.map(c => c.platform === item.platform ? { ...c, status: ContentStatus.Published } : c)
                );
            } else {
                failCount++;
                console.error(`Failed to publish ${item.platform}`, await response.text());
            }

        } catch (error) {
            failCount++;
            console.error("Webhook Error", error);
        }
    }

    if (successCount > 0) {
        showNotification(`${successCount} Posts erfolgreich an n8n gesendet! 🚀`);
    }
    if (failCount > 0) {
        setTimeout(() => showNotification(`Warnung: ${failCount} Posts konnten nicht gesendet werden. Prüfe Webhook.`, true), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="ml-0 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 transition-all duration-300">
        
        {notification && (
          <div className={`fixed top-4 right-4 z-[100] px-6 py-3 rounded-lg shadow-xl text-white font-medium transform transition-all animate-fade-in-up ${notification.includes('Warnung') ? 'bg-orange-500' : notification.includes('Fehler') || notification.includes('Limit') ? 'bg-red-500' : 'bg-green-600'}`}>
            {notification}
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="max-w-7xl mx-auto">
             <InputForm 
               onSubmit={handleGenerate} 
               isLoading={isLoading} 
               personas={personas}
               onOpenSettings={() => setActiveTab('settings')}
               userProfile={userProfile}
             />

             {generatedContent.length > 0 && (
               <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                 {generatedContent.map((item, index) => (
                   <ContentCard
                     key={`${item.platform}-${index}`}
                     data={item}
                     onUpdate={handleUpdateContent}
                     onApprove={() => handleApprove(item.platform)}
                     onGenerateImage={handleImageGeneration}
                     isGeneratingImage={generatingImageFor === item.platform}
                     globalClipboardImage={globalClipboardImage}
                     onCopyImage={(url) => {
                         setGlobalClipboardImage(url);
                         showNotification("Bild kopiert!");
                     }}
                   />
                 ))}
               </div>
             )}
          </div>
        )}

        {activeTab === 'calendar' && (
          <CalendarView 
            content={generatedContent}
            onSchedule={handleSchedule}
            onPublish={handlePublish}
          />
        )}

        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Einstellungen</h2>
            <SettingsView 
              personas={personas} 
              onSavePersonas={setPersonas}
              prompts={promptConfig}
              onSavePrompts={setPromptConfig}
              userProfile={userProfile}
              onSaveUserProfile={setUserProfile}
              automationConfig={automationConfig}
              onSaveAutomation={setAutomationConfig}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
