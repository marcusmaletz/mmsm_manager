import React, { useState, KeyboardEvent } from 'react';
import { BriefingData, Persona } from '../types';
import { Sparkles, X, User } from 'lucide-react';
import { TONE_SUGGESTIONS } from '../services/defaults';

interface InputFormProps {
  onSubmit: (data: BriefingData) => void;
  isLoading: boolean;
  personas: Persona[];
  onOpenSettings: () => void;
}

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading, personas, onOpenSettings }) => {
  const [formData, setFormData] = useState<BriefingData>({
    topic: '',
    url: '',
    tone: [],
    targetAudience: '' // This will store the persona description
  });
  
  const [currentToneInput, setCurrentToneInput] = useState('');
  const [selectedPersonaId, setSelectedPersonaId] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePersonaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const id = e.target.value;
      setSelectedPersonaId(id);
      const persona = personas.find(p => p.id === id);
      if (persona) {
          setFormData({ ...formData, targetAudience: persona.description });
      } else {
          setFormData({ ...formData, targetAudience: '' });
      }
  };

  const handleToneKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentToneInput.trim()) {
      e.preventDefault();
      if (!formData.tone.includes(currentToneInput.trim())) {
        setFormData({ ...formData, tone: [...formData.tone, currentToneInput.trim()] });
      }
      setCurrentToneInput('');
    }
  };

  const addTone = (tone: string) => {
    if (!formData.tone.includes(tone)) {
        setFormData({ ...formData, tone: [...formData.tone, tone] });
    }
  };

  const removeTone = (toneToRemove: string) => {
    setFormData({ ...formData, tone: formData.tone.filter(t => t !== toneToRemove) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
      <div className="flex items-center space-x-2 mb-6">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Sparkles className="w-5 h-5 text-indigo-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Neues Content Briefing</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Hauptthema / Idee</label>
            <input
              type="text"
              name="topic"
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-900 placeholder-slate-400"
              placeholder="z.B. Die Zukunft von Remote Work 2025"
              value={formData.topic}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Quell-URL (Optional)</label>
            <input
              type="url"
              name="url"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-900 placeholder-slate-400"
              placeholder="https://beispiel.de/artikel"
              value={formData.url}
              onChange={handleChange}
            />
          </div>

          {/* Zielgruppe / Persona Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Zielgruppe (Persona)</label>
            <div className="flex gap-2">
                <select
                    name="persona"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-900"
                    value={selectedPersonaId}
                    onChange={handlePersonaChange}
                >
                    <option value="">-- Persona wählen --</option>
                    {personas.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
                <button 
                    type="button"
                    onClick={onOpenSettings}
                    className="px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                    title="Personas verwalten"
                >
                    <User className="w-5 h-5" />
                </button>
            </div>
            {selectedPersonaId && (
                <p className="mt-2 text-xs text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-100">
                    {formData.targetAudience}
                </p>
            )}
          </div>

          {/* Tag Input for Tone */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Tonfall / Stimmung (Mehrfachwahl möglich)</label>
            <div className="p-2 rounded-lg border border-slate-300 bg-white focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all min-h-[50px] flex flex-wrap gap-2">
                {formData.tone.map((tag, index) => (
                    <span key={index} className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md text-sm font-medium flex items-center">
                        {tag}
                        <button type="button" onClick={() => removeTone(tag)} className="ml-1 text-indigo-400 hover:text-indigo-900">
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    className="flex-1 min-w-[120px] outline-none bg-transparent text-sm py-1"
                    placeholder="Tippen & Enter..."
                    value={currentToneInput}
                    onChange={(e) => setCurrentToneInput(e.target.value)}
                    onKeyDown={handleToneKeyDown}
                />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
                {TONE_SUGGESTIONS.map(suggestion => (
                    <button
                        key={suggestion}
                        type="button"
                        onClick={() => addTone(suggestion)}
                        className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                            formData.tone.includes(suggestion) 
                            ? 'bg-slate-800 text-white border-slate-800' 
                            : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                        }`}
                    >
                        + {suggestion}
                    </button>
                ))}
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-2 pt-4">
             <button
              type="submit"
              disabled={isLoading || !formData.topic || !selectedPersonaId || formData.tone.length === 0}
              className={`w-full py-4 px-6 rounded-lg text-white font-semibold shadow-lg flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.01] active:scale-95 ${
                isLoading || !formData.topic || !selectedPersonaId || formData.tone.length === 0 ? 'bg-indigo-300 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generiere Assets...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Magischen Content generieren</span>
                </>
              )}
            </button>
            {(!selectedPersonaId || formData.tone.length === 0) && (
                <p className="text-center text-xs text-red-400 mt-2">Bitte Thema, Persona und mindestens einen Tonfall wählen.</p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};