import React, { useState } from 'react';
import { Persona, PromptConfig } from '../types';
import { Save, Plus, Trash2, RotateCcw } from 'lucide-react';
import { DEFAULT_PROMPTS } from '../services/defaults';

interface SettingsViewProps {
  personas: Persona[];
  onSavePersonas: (personas: Persona[]) => void;
  prompts: PromptConfig;
  onSavePrompts: (prompts: PromptConfig) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ personas, onSavePersonas, prompts, onSavePrompts }) => {
  const [activeTab, setActiveTab] = useState<'personas' | 'prompts'>('personas');
  const [localPrompts, setLocalPrompts] = useState<PromptConfig>(prompts);
  
  // Persona State
  const [editingPersona, setEditingPersona] = useState<Partial<Persona> | null>(null);

  const handlePromptChange = (key: keyof PromptConfig, value: string) => {
    setLocalPrompts({ ...localPrompts, [key]: value });
  };

  const savePrompts = () => {
    onSavePrompts(localPrompts);
  };

  const resetPrompts = () => {
      setLocalPrompts(DEFAULT_PROMPTS);
  };

  const handleSavePersona = () => {
    if (!editingPersona?.name || !editingPersona?.description) return;

    if (editingPersona.id) {
        // Update existing
        const updated = personas.map(p => p.id === editingPersona.id ? editingPersona as Persona : p);
        onSavePersonas(updated);
    } else {
        // Add new
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="border-b border-slate-200 flex">
        <button 
            onClick={() => setActiveTab('personas')}
            className={`px-6 py-4 font-medium text-sm transition-colors ${activeTab === 'personas' ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-700'}`}
        >
            Zielgruppen / Personas
        </button>
        <button 
            onClick={() => setActiveTab('prompts')}
            className={`px-6 py-4 font-medium text-sm transition-colors ${activeTab === 'prompts' ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-700'}`}
        >
            Prompt-Einstellungen
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'personas' && (
            <div className="space-y-6">
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
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 animate-fade-in">
                        <h4 className="font-bold text-slate-800 mb-4">{editingPersona.id ? 'Persona bearbeiten' : 'Neue Persona erstellen'}</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Name der Persona</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="z.B. Marketing Manager"
                                    value={editingPersona.name}
                                    onChange={e => setEditingPersona({...editingPersona, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Beschreibung / Charakteristika</label>
                                <textarea 
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-none h-24"
                                    placeholder="Beschreibe Demografie, Probleme, Ziele..."
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
                                    Speichern
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
                                    <button 
                                        onClick={() => setEditingPersona(persona)}
                                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                                    >
                                        <Save className="w-4 h-4" /> {/* Using Save icon as Edit for simplicity in import */}
                                    </button>
                                    <button 
                                        onClick={() => handleDeletePersona(persona.id)}
                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {activeTab === 'prompts' && (
            <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-sm text-yellow-800 mb-6">
                    <strong>Achtung:</strong> Hier definierst du die "Gehirn"-Anweisungen der KI. Änderungen wirken sich auf alle zukünftigen Generierungen aus.
                </div>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-2">Globale Anweisung (Gilt für alles)</label>
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

                <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-slate-100 flex justify-between items-center">
                    <button 
                        onClick={resetPrompts}
                        className="flex items-center text-slate-500 hover:text-red-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Auf Standards zurücksetzen
                    </button>
                    <button 
                        onClick={savePrompts}
                        className="flex items-center bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 shadow-md transition-transform active:scale-95"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Einstellungen speichern
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};