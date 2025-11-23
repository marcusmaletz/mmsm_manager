
import React, { useState, useEffect } from 'react';
import { Persona, PromptConfig, UserProfile, AutomationConfig } from '../types';
import { Save, Plus, Trash2, RotateCcw, User, MessageSquare, Zap, CheckCircle2, Loader2, Edit2, Webhook, ShieldAlert } from 'lucide-react';
import { DEFAULT_PROMPTS } from '../services/defaults';

interface SettingsViewProps {
  personas: Persona[];
  onSavePersonas: (personas: Persona[]) => void;
  prompts: PromptConfig;
  onSavePrompts: (prompts: PromptConfig) => void;
  userProfile: UserProfile;
  onSaveUserProfile: (profile: UserProfile) => void;
  automationConfig: AutomationConfig;
  onSaveAutomation: (config: AutomationConfig) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
    personas, onSavePersonas, 
    prompts, onSavePrompts,
    userProfile, onSaveUserProfile,
    automationConfig, onSaveAutomation
}) => {
  const [activeTab, setActiveTab] = useState<'personas' | 'prompts' | 'profile' | 'automation'>('profile');
  
  // Local State
  const [localPrompts, setLocalPrompts] = useState<PromptConfig>(prompts);
  const [localProfile, setLocalProfile] = useState<UserProfile>(userProfile);
  const [localAutomation, setLocalAutomation] = useState<AutomationConfig>(automationConfig);
  
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [editingPersona, setEditingPersona] = useState<Partial<Persona> | null>(null);

  // Initialize local state ONLY ONCE on mount to avoid overwriting user input while typing
  useEffect(() => {
    setLocalProfile(userProfile);
    setLocalAutomation(automationConfig);
    setLocalPrompts(prompts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array = run once on mount

  const handlePromptChange = (key: keyof PromptConfig, value: string) => {
    setLocalPrompts(prev => ({ ...prev, [key]: value }));
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setLocalProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAutomationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalAutomation(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGlobalSave = () => {
      setIsSaving(true);
      
      // Save all sections
      onSaveUserProfile(localProfile);
      onSavePrompts(localPrompts);
      onSaveAutomation(localAutomation);

      setTimeout(() => {
          setIsSaving(false);
          setLastSaved(new Date());
      }, 800);
  };

  const handleSavePersona = () => {
    if (!editingPersona?.name || !editingPersona?.description) return;
    if (editingPersona.id) {
        const updated = personas.map(p => p.id === editingPersona.id ? editingPersona as Persona : p);
        onSavePersonas(updated);
    } else {
        const newPersona: Persona = {
            id: Date.now().toString(),
            name: editingPersona.name,
            description: editingPersona.description
        };
        onSavePersonas([...personas, newPersona]);
    }
    setEditingPersona(null);
  };

  const handleDeletePersona = (id: string) => {
    if (confirm('Möchtest du diese Persona wirklich löschen?')) {
        onSavePersonas(personas.filter(p => p.id !== id));
    }
  };

  const resetPrompts = () => {
      if(confirm('Alle Prompts auf Standard zurücksetzen?')) {
        setLocalPrompts(DEFAULT_PROMPTS);
      }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="border-b border-slate-200 flex overflow-x-auto">
        <button 
            onClick={() => setActiveTab('profile')}
            className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'profile' ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-700'}`}
        >
            <User className="w-4 h-4" />
            <span>Mein Profil</span>
        </button>
        <button 
            onClick={() => setActiveTab('automation')}
            className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'automation' ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-700'}`}
        >
            <Webhook className="w-4 h-4" />
            <span>Automation (n8n)</span>
        </button>
        <button 
            onClick={() => setActiveTab('personas')}
            className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'personas' ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-700'}`}
        >
            <Zap className="w-4 h-4" />
            <span>Zielgruppen</span>
        </button>
        <button 
            onClick={() => setActiveTab('prompts')}
            className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'prompts' ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-700'}`}
        >
            <MessageSquare className="w-4 h-4" />
            <span>Prompts</span>
        </button>
      </div>

      <div className="p-6">
        {/* --- GLOBAL HEADER SAVE --- */}
        <div className="flex justify-end mb-6 sticky top-0 z-10 bg-white/95 backdrop-blur py-2 border-b border-slate-100">
             <div className="flex items-center gap-3">
                {lastSaved && !isSaving && (
                    <span className="text-xs font-bold text-green-600 flex items-center animate-fade-in">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Gespeichert
                    </span>
                )}
                <button 
                    onClick={handleGlobalSave}
                    disabled={isSaving}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold shadow-sm hover:bg-indigo-700 active:scale-95 transition-all flex items-center"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Änderungen speichern
                </button>
             </div>
        </div>

        {/* --- PROFILE TAB --- */}
        {activeTab === 'profile' && (
            <div className="space-y-6 max-w-3xl animate-fade-in">
                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg text-sm text-indigo-800">
                    Diese Informationen sind das Fundament für die KI. Bitte fülle sie sorgfältig aus und klicke oben auf Speichern.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-2">Dein Name / Brand Name</label>
                        <input 
                            type="text"
                            name="name"
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={localProfile.name}
                            onChange={handleProfileChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-2">Branche / Business</label>
                        <input 
                            type="text"
                            name="business"
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={localProfile.business}
                            onChange={handleProfileChange}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-800 mb-2">Dein Angebot</label>
                        <textarea 
                            name="offer"
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-none h-24"
                            value={localProfile.offer}
                            onChange={handleProfileChange}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-800 mb-2">Dein USP</label>
                        <textarea 
                            name="usp"
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-none h-24"
                            value={localProfile.usp}
                            onChange={handleProfileChange}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-800 mb-2">Schreibstil</label>
                        <input 
                            type="text"
                            name="writingStyle"
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={localProfile.writingStyle}
                            onChange={handleProfileChange}
                        />
                    </div>
                </div>
            </div>
        )}

        {/* --- AUTOMATION TAB (n8n) --- */}
        {activeTab === 'automation' && (
            <div className="space-y-6 max-w-3xl animate-fade-in">
                <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                         <div className="bg-pink-500 p-2 rounded-lg"><Webhook className="w-6 h-6 text-white"/></div>
                         <h3 className="text-xl font-bold">n8n / Make Automation</h3>
                    </div>
                    <p className="text-slate-300 text-sm mb-6">
                        Verbinde deine Social Media Plattformen professionell über einen Webhook. 
                        Wenn du auf "Veröffentlichen" klickst, sendet die App die Daten (JSON Payload) an diese URL.
                    </p>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Webhook URL (POST)</label>
                            <input 
                                type="url"
                                name="webhookUrl"
                                placeholder="https://primary.n8n.cloud/webhook/..."
                                className="w-full px-4 py-3 rounded-lg border border-slate-700 bg-slate-800 text-white focus:ring-2 focus:ring-pink-500 outline-none font-mono text-sm"
                                value={localAutomation.webhookUrl}
                                onChange={handleAutomationChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Secret Token (Optional Header)</label>
                            <input 
                                type="password"
                                name="secretToken"
                                placeholder="Sicherheits-Token..."
                                className="w-full px-4 py-3 rounded-lg border border-slate-700 bg-slate-800 text-white focus:ring-2 focus:ring-pink-500 outline-none font-mono text-sm"
                                value={localAutomation.secretToken || ''}
                                onChange={handleAutomationChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-sm text-yellow-800">
                    <strong>Payload Struktur:</strong> Die App sendet folgendes JSON an deinen Webhook:<br/>
                    <code className="block mt-2 bg-yellow-100 p-2 rounded text-xs font-mono">
                        {`{
  "platform": "instagram_feed",
  "content": "...",
  "image": "data:image/png;base64,...",
  "scheduledTime": "14:00"
}`}
                    </code>
                </div>
            </div>
        )}

        {/* --- PERSONAS TAB --- */}
        {activeTab === 'personas' && (
            <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">Gespeicherte Personas</h3>
                    {!editingPersona && (
                        <button 
                            onClick={() => setEditingPersona({ name: '', description: '' })}
                            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
                        >
                            <Plus className="w-4 h-4" /> <span>Neu erstellen</span>
                        </button>
                    )}
                </div>

                {editingPersona ? (
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <h4 className="font-bold text-slate-800 mb-4">{editingPersona.id ? 'Persona bearbeiten' : 'Neue Persona erstellen'}</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Name der Persona</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={editingPersona.name}
                                    onChange={e => setEditingPersona({...editingPersona, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Beschreibung</label>
                                <textarea 
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-none h-24"
                                    value={editingPersona.description}
                                    onChange={e => setEditingPersona({...editingPersona, description: e.target.value})}
                                />
                            </div>
                            <div className="flex space-x-3 pt-2">
                                <button 
                                    onClick={handleSavePersona}
                                    disabled={!editingPersona.name || !editingPersona.description}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50"
                                >
                                    Zur Liste hinzufügen
                                </button>
                                <button 
                                    onClick={() => setEditingPersona(null)}
                                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium"
                                >
                                    Abbrechen
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {personas.map(persona => (
                            <div key={persona.id} className="p-4 border border-slate-200 rounded-xl hover:border-indigo-300 transition-colors bg-white group relative">
                                <h4 className="font-bold text-slate-800">{persona.name}</h4>
                                <p className="text-sm text-slate-600 mt-2 line-clamp-3">{persona.description}</p>
                                <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setEditingPersona(persona)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeletePersona(persona.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* --- PROMPTS TAB --- */}
        {activeTab === 'prompts' && (
            <div className="space-y-6 animate-fade-in">
                 <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-sm text-yellow-800 mb-6">
                    <strong>Achtung:</strong> Hier definierst du die "Gehirn"-Anweisungen der KI.
                </div>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-2">Globale Anweisung</label>
                        <textarea 
                            className="w-full h-24 p-3 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                            value={localPrompts.global}
                            onChange={(e) => handlePromptChange('global', e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {Object.keys(localPrompts).filter(k => k !== 'global').map((key) => (
                            <div key={key}>
                                <label className="block text-sm font-bold text-slate-700 mb-2 capitalize">{key.replace('_', ' ')}</label>
                                <textarea 
                                    className="w-full h-32 p-3 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                                    value={localPrompts[key as keyof PromptConfig]}
                                    onChange={(e) => handlePromptChange(key as keyof PromptConfig, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100">
                    <button onClick={resetPrompts} className="flex items-center text-slate-500 hover:text-red-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-50">
                        <RotateCcw className="w-4 h-4 mr-2" /> Standards wiederherstellen
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
