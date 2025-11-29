import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, X, Target, ArrowRight, Pencil } from 'lucide-react';
import { RetroSession } from '../types';

interface LandingPageProps {
  onStart: (goal: string) => void;
  sessions: RetroSession[];
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onUpdateSessionGoal: (id: string, newGoal: string) => void;
  onReorderSessions: (sessions: RetroSession[]) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onStart, 
  sessions, 
  onSelectSession, 
  onDeleteSession,
  onUpdateSessionGoal,
  onReorderSessions
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  
  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editingId && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [editingId]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoal.trim()) {
      onStart(newGoal);
      setNewGoal('');
      setIsCreating(false);
    }
  };

  // Editing Handlers
  const startEditing = (e: React.MouseEvent, session: RetroSession) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditValue(session.goal);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValue('');
  };

  const saveEditing = (id: string) => {
    if (editValue.trim()) {
      onUpdateSessionGoal(id, editValue.trim());
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEditing(id);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 flex flex-col relative">
      <div className="max-w-5xl mx-auto w-full px-4 md:px-6 py-8 md:py-12 flex-1 flex flex-col pb-24">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-6 mb-8 md:mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
              KISS <span className="text-indigo-600">Retro</span>
            </h1>
          </div>
          
          {/* Button moved to bottom right FAB */}
        </div>

        {/* Create Session Overlay/Modal Style */}
        {isCreating && (
          <div className="mb-10 animate-in slide-in-from-top-4 duration-300">
             <form onSubmit={handleCreateSubmit} className="bg-white p-4 md:p-2 rounded-2xl shadow-xl border border-indigo-100 flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-2 ring-4 ring-indigo-500/10">
                <div className="flex-1 w-full">
                   <input
                    autoFocus
                    type="text"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    placeholder="What is the main goal?"
                    className="w-full text-lg px-2 py-2 md:px-4 md:py-3 bg-transparent border-none focus:ring-0 placeholder:text-slate-300 font-medium"
                    onKeyDown={(e) => e.key === 'Escape' && setIsCreating(false)}
                   />
                </div>
                <div className="flex items-center gap-2 md:p-1 w-full md:w-auto">
                  <button 
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="flex-1 md:flex-none py-3 px-4 text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl transition-colors font-medium text-center"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={!newGoal.trim()}
                    className="flex-1 md:flex-none px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-200 text-center"
                  >
                    Start
                  </button>
                </div>
             </form>
          </div>
        )}

        {/* Sessions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
           {sessions.map((session) => (
             <div 
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className="group relative bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer hover:-translate-y-1 flex flex-col"
             >
                <div className="flex justify-between items-start gap-3 mb-3">
                   <div className="flex-1 min-w-0 group/title">
                      {editingId === session.id ? (
                        <textarea
                          ref={textareaRef}
                          value={editValue}
                          onChange={(e) => {
                            setEditValue(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                          }}
                          onClick={(e) => e.stopPropagation()}
                          onBlur={() => saveEditing(session.id)}
                          onKeyDown={(e) => handleKeyDown(e, session.id)}
                          className="w-full text-lg font-bold text-slate-900 bg-slate-50 p-2 rounded-lg -ml-2 resize-none outline-none focus:ring-2 focus:ring-indigo-500/20"
                          rows={1}
                        />
                      ) : (
                        <div className="flex items-start gap-2">
                            <h3 
                              className="text-lg font-bold text-slate-900 leading-snug break-words group-hover:text-indigo-700 transition-colors"
                              title="Double click to edit"
                              onDoubleClick={(e) => startEditing(e, session)}
                            >
                              {session.goal}
                            </h3>
                            <button
                                onClick={(e) => startEditing(e, session)}
                                className="opacity-0 group-hover/title:opacity-100 p-1 text-slate-400 hover:text-indigo-600 transition-opacity"
                                title="Edit Name"
                            >
                                <Pencil className="w-3.5 h-3.5" />
                            </button>
                        </div>
                      )}
                   </div>
                   <button
                    onClick={(e) => onDeleteSession(session.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                    title="Delete Session"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>

                {/* Focus of the Week Display - Separated Items */}
                {session.strategy && (
                  <div className="mb-4 flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                       <Target className="w-3.5 h-3.5" />
                       Focus
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {session.strategy.split(' + ').map((item, idx) => (
                        <div 
                          key={idx} 
                          className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md text-sm font-medium border border-indigo-100 leading-snug break-words max-w-full"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end text-xs font-medium text-slate-400 mt-auto pt-2 border-t border-slate-50">
                   <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform text-indigo-300 group-hover:text-indigo-500">
                     <span>Open</span>
                     <ArrowRight className="w-3.5 h-3.5" />
                   </div>
                </div>
             </div>
           ))}

           {sessions.length === 0 && !isCreating && (
             <div className="col-span-full py-20 flex flex-col items-center justify-center text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                  <Plus className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-lg font-medium text-slate-600">No sessions yet</p>
                <p className="text-sm">Create a new session to get started</p>
             </div>
           )}
        </div>
      </div>

      {/* Floating Action Button for New Session */}
      <button 
        onClick={() => {
          setIsCreating(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 group flex items-center justify-center w-14 h-14 bg-slate-900 text-white rounded-full shadow-xl shadow-slate-900/30 hover:scale-110 hover:shadow-2xl transition-all duration-300 active:scale-95 ${isCreating ? 'translate-y-20 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}
        title="New Session"
      >
        <Plus className="w-7 h-7 text-indigo-300 group-hover:rotate-90 transition-transform duration-300" />
      </button>

    </div>
  );
};