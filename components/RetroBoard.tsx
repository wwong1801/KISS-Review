import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Trash2, 
  ArrowLeft,
  Lightbulb,
  Anchor,
  MapPin
} from 'lucide-react';
import { KissQuadrant } from './KissQuadrant';
import { AnalysisModal } from './AnalysisModal';
import { BrainstormModal } from './BrainstormModal';
import { Category, RetroItem, AIAnalysisResult, RetroSession, BrainstormResult, RetroSubItem } from '../types';
import { analyzeBoard, suggestIdeas } from '../services/geminiService';

interface RetroBoardProps {
  session: RetroSession;
  onUpdateSession: (session: RetroSession) => void;
  onBack: () => void;
}

export const RetroBoard: React.FC<RetroBoardProps> = ({ session, onUpdateSession, onBack }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);

  // Brainstorm state
  const [isBrainstormOpen, setIsBrainstormOpen] = useState(false);
  const [isBrainstorming, setIsBrainstorming] = useState(false);
  const [brainstormResult, setBrainstormResult] = useState<BrainstormResult | null>(null);

  // Strategy Editing State
  const [isEditingStrategy, setIsEditingStrategy] = useState(false);
  const [strategyText, setStrategyText] = useState(session.strategy || '');
  const strategyInputRef = useRef<HTMLTextAreaElement>(null);

  // Local state for immediate UI updates, synced back to parent
  const items = session.items;
  const goal = session.goal;
  const strategy = session.strategy || '';

  // Sync local strategy text if session updates externally
  useEffect(() => {
    setStrategyText(session.strategy || '');
  }, [session.strategy]);

  useEffect(() => {
    if (isEditingStrategy && strategyInputRef.current) {
      strategyInputRef.current.focus();
      strategyInputRef.current.style.height = 'auto';
      strategyInputRef.current.style.height = strategyInputRef.current.scrollHeight + 'px';
    }
  }, [isEditingStrategy]);

  const handleUpdateItems = (newItems: RetroItem[]) => {
    onUpdateSession({ ...session, items: newItems });
  };

  const handleUpdateStrategy = (newStrategy: string) => {
    onUpdateSession({ ...session, strategy: newStrategy });
  };

  const handlePinToStrategy = (text: string) => {
    const current = strategy.trim();
    const toAdd = text.trim();
    // Avoid duplicates if simple check
    if (current.includes(toAdd)) return;

    const nextStrategy = current ? `${current} + ${toAdd}` : toAdd;
    handleUpdateStrategy(nextStrategy);
    setStrategyText(nextStrategy); // update local state immediately
  };

  const generateId = () => {
    return (typeof crypto !== 'undefined' && crypto.randomUUID) 
      ? crypto.randomUUID() 
      : Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  const handleAdd = (text: string, category: Category) => {
    const newItem: RetroItem = {
      id: generateId(),
      text,
      category,
      likes: 0,
      isStarred: false,
      // Use timestamp as simple default order. Reordering will normalize this to 0,1,2...
      order: Date.now(),
      subItems: [],
      createdAt: Date.now(),
    };
    handleUpdateItems([...items, newItem]);
  };

  const handleEditItem = (id: string, newText: string) => {
    handleUpdateItems(items.map(item => 
      item.id === id ? { ...item, text: newText } : item
    ));
  };

  const handleDelete = (id: string) => {
    handleUpdateItems(items.filter(item => item.id !== id));
  };

  const handleToggleStar = (id: string) => {
    handleUpdateItems(items.map(item => 
      item.id === id ? { ...item, isStarred: !item.isStarred } : item
    ));
  };

  // --- Sub Item Handlers ---

  const handleAddSubItem = (itemId: string, text: string) => {
    const newSubItem: RetroSubItem = {
      id: generateId(),
      text,
      isCompleted: false
    };
    
    handleUpdateItems(items.map(item => {
      if (item.id === itemId) {
        return { ...item, subItems: [...(item.subItems || []), newSubItem] };
      }
      return item;
    }));
  };

  const handleToggleSubItem = (itemId: string, subItemId: string) => {
    handleUpdateItems(items.map(item => {
      if (item.id === itemId && item.subItems) {
        return {
          ...item,
          subItems: item.subItems.map(sub => 
            sub.id === subItemId ? { ...sub, isCompleted: !sub.isCompleted } : sub
          )
        };
      }
      return item;
    }));
  };

  const handleDeleteSubItem = (itemId: string, subItemId: string) => {
    handleUpdateItems(items.map(item => {
      if (item.id === itemId && item.subItems) {
        return {
          ...item,
          subItems: item.subItems.filter(sub => sub.id !== subItemId)
        };
      }
      return item;
    }));
  };

  const handleEditSubItem = (itemId: string, subItemId: string, newText: string) => {
    handleUpdateItems(items.map(item => {
      if (item.id === itemId && item.subItems) {
        return {
          ...item,
          subItems: item.subItems.map(sub => 
            sub.id === subItemId ? { ...sub, text: newText } : sub
          )
        };
      }
      return item;
    }));
  };

  // --- End Sub Item Handlers ---

  const handleMoveItem = (itemId: string, newCategory: Category) => {
    handleUpdateItems(items.map(item => 
      item.id === itemId ? { ...item, category: newCategory, order: Date.now() } : item
    ));
  };

  const handleReorder = (sourceId: string, targetId: string) => {
    const sourceItem = items.find(i => i.id === sourceId);
    const targetItem = items.find(i => i.id === targetId);
    
    if (!sourceItem || !targetItem) return;

    // If different categories, fallback to move (visual reorder across categories not supported in one go)
    if (sourceItem.category !== targetItem.category) {
      handleMoveItem(sourceId, targetItem.category);
      return;
    }

    // Get all items in this category
    const categoryItems = items
      .filter(i => i.category === sourceItem.category)
      .sort((a, b) => {
        // Must match the visual sort order in KissQuadrant
        if (a.isStarred !== b.isStarred) return a.isStarred ? -1 : 1;
        return (a.order ?? 0) - (b.order ?? 0);
      });

    const sourceIndex = categoryItems.findIndex(i => i.id === sourceId);
    const targetIndex = categoryItems.findIndex(i => i.id === targetId);

    if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) return;

    // Reorder in a temp array
    const reordered = [...categoryItems];
    reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, sourceItem);

    // Normalize order values to 0, 1, 2...
    const updates = reordered.map((item, index) => ({
      ...item,
      order: index
    }));

    // Update main items list
    const otherItems = items.filter(i => i.category !== sourceItem.category);
    handleUpdateItems([...otherItems, ...updates]);
  };

  const handleClearBoard = () => {
    if (window.confirm('Are you sure you want to clear the entire board? This cannot be undone.')) {
      handleUpdateItems([]);
      setAnalysisResult(null);
    }
  };

  const handleAnalyze = async () => {
    setIsModalOpen(true);
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    try {
      const result = await analyzeBoard(items, goal);
      setAnalysisResult(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBrainstormOpen = () => {
    setIsBrainstormOpen(true);
    setBrainstormResult(null);
    // Note: We don't start generating immediately anymore.
  };

  const handleGenerateIdeas = async (context: string) => {
    setIsBrainstorming(true);
    setBrainstormResult(null);
    try {
        const result = await suggestIdeas(goal, context);
        setBrainstormResult(result);
    } catch (error) {
        console.error(error);
    } finally {
        setIsBrainstorming(false);
    }
  };

  const getItemsByCategory = (cat: Category) => items.filter(i => i.category === cat);

  const sharedProps = {
    onAdd: handleAdd,
    onEdit: handleEditItem,
    onDelete: handleDelete,
    onStar: handleToggleStar,
    onMoveItem: handleMoveItem,
    onReorder: handleReorder,
    onAddSubItem: handleAddSubItem,
    onToggleSubItem: handleToggleSubItem,
    onDeleteSubItem: handleDeleteSubItem,
    onEditSubItem: handleEditSubItem,
    onPinToStrategy: handlePinToStrategy
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 flex flex-col animate-in fade-in duration-500">
      {/* Navbar */}
      <header className="flex-shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-40">
        <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <button 
                onClick={onBack}
                className="mr-2 p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors flex-shrink-0"
                title="Back to Sessions"
            >
                <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-bold text-xl tracking-tight text-slate-800 truncate">
              {goal || 'Untitled'}
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button 
              onClick={handleClearBoard}
              disabled={items.length === 0}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed hidden sm:block"
              title="Clear Board"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            <button
              onClick={handleBrainstormOpen}
              className="flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-lg font-medium text-sm hover:bg-amber-200 transition-all active:scale-95 border border-amber-200"
            >
                <Lightbulb className="w-4 h-4" />
                <span className="hidden sm:inline">Brainstorm</span>
            </button>

            <button
              onClick={handleAnalyze}
              disabled={items.length === 0}
              className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">Analyze</span>
            </button>
          </div>
        </div>
      </header>

      {/* Strategy Banner */}
      <div className="bg-slate-900 text-white border-b border-slate-800 relative z-30">
        <div className="max-w-[1600px] mx-auto px-4 py-3">
          {isEditingStrategy ? (
            <textarea
              ref={strategyInputRef}
              value={strategyText}
              onChange={(e) => {
                setStrategyText(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              onBlur={() => {
                handleUpdateStrategy(strategyText.trim());
                setIsEditingStrategy(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleUpdateStrategy(strategyText.trim());
                  setIsEditingStrategy(false);
                } else if (e.key === 'Escape') {
                  setStrategyText(session.strategy || '');
                  setIsEditingStrategy(false);
                }
              }}
              placeholder="What is your core strategy? e.g. Sleep + Exercise + Routine"
              className="w-full bg-transparent text-center font-medium text-lg placeholder:text-slate-600 focus:outline-none resize-none overflow-hidden"
              rows={1}
            />
          ) : (
            <div 
              onClick={() => setIsEditingStrategy(true)}
              className="flex items-center justify-center gap-2 cursor-pointer group py-1"
            >
              {strategy ? (
                 <>
                   <MapPin className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" />
                   <p className="font-bold text-lg tracking-wide text-center">
                     {strategy}
                   </p>
                 </>
              ) : (
                <div className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors">
                  <Anchor className="w-4 h-4" />
                  <span className="text-sm font-medium tracking-wider uppercase">Define The Way</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Board Area */}
      <main className="flex-1 px-4 py-6 max-w-[1600px] mx-auto w-full flex flex-col overflow-hidden min-h-0">
        
        {/* Quadrants Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
          <KissQuadrant 
            category={Category.KEEP} 
            items={getItemsByCategory(Category.KEEP)} 
            {...sharedProps}
          />
          <KissQuadrant 
            category={Category.IMPROVE} 
            items={getItemsByCategory(Category.IMPROVE)} 
            {...sharedProps}
          />
          <KissQuadrant 
            category={Category.START} 
            items={getItemsByCategory(Category.START)} 
            {...sharedProps}
          />
          <KissQuadrant 
            category={Category.STOP} 
            items={getItemsByCategory(Category.STOP)} 
            {...sharedProps}
          />
        </div>
      </main>

      {/* Analysis Modal */}
      <AnalysisModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        result={analysisResult} 
        isLoading={isAnalyzing} 
      />

      {/* Brainstorm Modal */}
      <BrainstormModal
        isOpen={isBrainstormOpen}
        onClose={() => setIsBrainstormOpen(false)}
        result={brainstormResult}
        isLoading={isBrainstorming}
        onAddItem={handleAdd}
        onGenerate={handleGenerateIdeas}
        goal={goal}
      />
    </div>
  );
};