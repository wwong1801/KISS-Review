import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, X, GripHorizontal } from 'lucide-react';
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

  // Drag and drop state
  const [draggedSessionId, setDraggedSessionId] = useState<string | null>(null);

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

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (editingId) {
      e.preventDefault();
      return;
    }
    setDraggedSessionId(id);
    e.dataTransfer.effectAllowed = 'move';
    // Transparent drag image hack if needed, but default is usually fine for cards
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedSessionId || draggedSessionId === targetId) return;

    const sourceIndex = sessions.findIndex(s => s.id === draggedSessionId);
    const targetIndex = sessions.findIndex(s => s.id === targetId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    const newSessions = [...sessions];
    const [movedSession] = newSessions.splice(sourceIndex, 1);
    newSessions.splice(targetIndex, 0, movedSession);

    onReorderSessions(newSessions);
  };

  const handleDragEnd = () => {
    setDraggedSessionId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-12 font-sans relative">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black tracking-tighter text-slate-900">KISS</h1>
          </div>
        </div>

        {/* Empty State */}
        {sessions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-white border border-slate-200 rounded-full flex items-center justify-center mb-6 text-slate-300 shadow-sm">
              <Plus className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">No sessions yet</h2>
            <p className="text-slate-500 mb-8 max-w-sm">Tap + to start a new KISS.</p>
          </div>
        )}

        {/* Grid of Sessions */}
        {sessions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
            {sessions.map((session) => (
              <div 
                key={session.id}
                draggable={editingId !== session.id}
                onDragStart={(e) => handleDragStart(e, session.id)}
                onDragOver={(e) => handleDragOver(e, session.id)}
                onDragEnd={handleDragEnd}
                onClick={() => {
                  if (editingId !== session.id) onSelectSession(session.id);
                }}
                className={`group bg-white rounded-xl border p-6 cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col justify-center min-h-[140px] ${
                  draggedSessionId === session.id ? 'opacity-50 scale-95 border-indigo-300' : 'border-slate-200 hover:shadow-xl hover:border-indigo-200'
                }`}
              >
                {/* Drag Handle Indicator (Visible on hover if not editing) */}
                {!editingId && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-slate-300 transition-opacity">
                    <GripHorizontal className="w-5 h-5" />
                  </div>
                )}

                <div className="absolute top-2 right-2">
                  <button
                    onClick={(e) => onDeleteSession(session.id, e)}
                    className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors z-10 opacity-0 group-hover:opacity-100"
                    title="Delete session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                {editingId === session.id ? (
                  <textarea
                    ref={textareaRef}
                    value={editValue}
                    onChange={(e) => {
                      setEditValue(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    onBlur={() => saveEditing(session.id)}
                    onKeyDown={(e) => handleKeyDown(e, session.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full text-2xl font-bold text-slate-800 bg-transparent resize-none outline-none border-b-2 border-indigo-500 leading-tight"
                    rows={1}
                  />
                ) : (
                  <h3 
                    onClick={(e) => startEditing(e, session)}
                    className="text-2xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors w-full pr-4 break-words leading-tight hover:underline decoration-indigo-200 underline-offset-4 decoration-2"
                    title="Click to edit title"
                  >
                    {session.goal || 'Untitled Session'}
                  </h3>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsCreating(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-full flex items-center justify-center shadow-xl shadow-slate-900/20 hover:scale-110 active:scale-95 transition-all duration-300 z-40"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Create Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-in zoom-in-95 duration-200 scale-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">New KISS</h2>
              <button 
                onClick={() => setIsCreating(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateSubmit}>
              <div className="mb-8">
                <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                  Goal / Focus
                </label>
                <textarea
                  autoFocus
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="e.g. Lose weight..."
                  className="w-full p-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none h-32 text-lg text-slate-800 placeholder:text-slate-400 bg-slate-50 focus:bg-white"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors hover:border-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newGoal.trim()}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold text-white transition-all shadow-md ${
                    newGoal.trim() 
                      ? 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5' 
                      : 'bg-slate-200 cursor-not-allowed shadow-none'
                  }`}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};