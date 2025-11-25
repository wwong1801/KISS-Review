import React, { useState } from 'react';
import { X, Lightbulb, Check, Plus, ArrowRight } from 'lucide-react';
import { BrainstormResult, Category, CATEGORY_CONFIG } from '../types';

interface BrainstormModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: BrainstormResult | null;
  isLoading: boolean;
  onAddItem: (text: string, category: Category) => void;
  onGenerate: (context: string) => void;
  goal: string;
}

export const BrainstormModal: React.FC<BrainstormModalProps> = ({ 
  isOpen, 
  onClose, 
  result, 
  isLoading,
  onAddItem,
  onGenerate,
  goal
}) => {
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [context, setContext] = useState('');

  if (!isOpen) return null;

  const handleAdd = (text: string, category: Category) => {
    onAddItem(text, category);
    setAddedItems(prev => new Set(prev).add(text + category));
  };

  const handleGenerate = () => {
    onGenerate(context);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        handleGenerate();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-white flex-shrink-0">
          <div className="flex items-center gap-2 text-amber-600">
            <Lightbulb className="w-5 h-5 fill-amber-100" />
            <h2 className="text-xl font-bold text-slate-900">AI Ideas Generator</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full py-20 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
              <p className="text-slate-500 animate-pulse">Brainstorming strategies for your goal...</p>
            </div>
          ) : result ? (
            // Results View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(Object.keys(CATEGORY_CONFIG) as Category[]).map((category) => {
                const config = CATEGORY_CONFIG[category];
                const items = result[category] || [];
                
                return (
                  <div key={category} className="flex flex-col gap-3">
                    <div className={`flex items-center gap-2 pb-2 border-b-2 ${config.border} ${config.text}`}>
                      <h3 className="font-bold uppercase tracking-wider text-sm">{config.label}</h3>
                    </div>
                    
                    <div className="space-y-2">
                      {items.map((item, idx) => {
                        const isAdded = addedItems.has(item + category);
                        return (
                          <button
                            key={idx}
                            onClick={() => !isAdded && handleAdd(item, category)}
                            disabled={isAdded}
                            className={`w-full text-left p-3 rounded-lg border transition-all duration-200 text-sm leading-relaxed relative group ${
                              isAdded 
                                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-default' 
                                : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md text-slate-700 hover:-translate-y-0.5'
                            }`}
                          >
                            {item}
                            {isAdded ? (
                              <div className="absolute top-2 right-2 text-green-500">
                                <Check className="w-4 h-4" />
                              </div>
                            ) : (
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-indigo-500 transition-opacity">
                                <Plus className="w-4 h-4" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
             // Input View
             <div className="flex flex-col h-full max-w-2xl mx-auto py-4">
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
                        Goal
                    </label>
                    <div className="text-xl font-bold text-slate-900 p-4 bg-white border border-slate-200 rounded-xl">
                        {goal}
                    </div>
                </div>

                <div className="flex-1 flex flex-col mb-8">
                     <label className="block text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
                        Specific Focus / Context (Optional)
                    </label>
                    <textarea
                        autoFocus
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="e.g. Focus on improving sleep schedule and consistency in diet..."
                        className="w-full flex-1 p-4 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all resize-none text-slate-800 placeholder:text-slate-400 bg-white min-h-[160px]"
                    />
                    <p className="text-xs text-slate-400 mt-2 text-right">
                        Press Cmd+Enter to generate
                    </p>
                </div>
                
                <button
                    onClick={handleGenerate}
                    className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-lg shadow-lg shadow-slate-900/10 transition-all hover:-translate-y-1 active:scale-[0.99] flex items-center justify-center gap-2"
                >
                    <Lightbulb className="w-5 h-5 text-amber-300" />
                    Generate Ideas
                </button>
             </div>
          )}
        </div>

        {/* Footer */}
        {result && (
            <div className="p-4 border-t border-slate-100 bg-white flex justify-end">
            <button 
                onClick={onClose}
                className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm shadow-md"
            >
                Done
            </button>
            </div>
        )}
      </div>
    </div>
  );
};