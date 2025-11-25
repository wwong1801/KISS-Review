import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Star, GripVertical, ListPlus, CheckCircle2, Circle, X, MapPin } from 'lucide-react';
import { Category, RetroItem, CATEGORY_CONFIG, RetroSubItem } from '../types';

interface KissQuadrantProps {
  category: Category;
  items: RetroItem[];
  onAdd: (text: string, category: Category) => void;
  onEdit: (id: string, newText: string) => void;
  onDelete: (id: string) => void;
  onStar: (id: string) => void;
  onMoveItem: (id: string, newCategory: Category) => void;
  onReorder: (sourceId: string, targetId: string) => void;
  // Sub-items props
  onAddSubItem: (itemId: string, text: string) => void;
  onToggleSubItem: (itemId: string, subItemId: string) => void;
  onDeleteSubItem: (itemId: string, subItemId: string) => void;
  onEditSubItem: (itemId: string, subItemId: string, newText: string) => void;
  onPinToStrategy: (text: string) => void;
}

export const KissQuadrant: React.FC<KissQuadrantProps> = ({ 
  category, 
  items, 
  onAdd, 
  onEdit,
  onDelete,
  onStar,
  onMoveItem,
  onReorder,
  onAddSubItem,
  onToggleSubItem,
  onDeleteSubItem,
  onEditSubItem,
  onPinToStrategy
}) => {
  const [isOver, setIsOver] = useState(false);
  
  // Creation State
  const [isCreating, setIsCreating] = useState(false);
  const [creationText, setCreationText] = useState('');
  const creationRef = useRef<HTMLTextAreaElement>(null);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sub Item Adding State
  const [addingSubItemId, setAddingSubItemId] = useState<string | null>(null);
  const [newSubItemText, setNewSubItemText] = useState('');
  const subItemInputRef = useRef<HTMLInputElement>(null);

  // Sub Item Editing State
  const [editingSubItemId, setEditingSubItemId] = useState<string | null>(null);
  const [editSubItemValue, setEditSubItemValue] = useState('');
  const subItemEditRef = useRef<HTMLInputElement>(null);

  const config = CATEGORY_CONFIG[category];

  useEffect(() => {
    if (editingId && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [editingId]);

  useEffect(() => {
    if (addingSubItemId && subItemInputRef.current) {
      subItemInputRef.current.focus();
    }
  }, [addingSubItemId]);

  useEffect(() => {
    if (editingSubItemId && subItemEditRef.current) {
      subItemEditRef.current.focus();
    }
  }, [editingSubItemId]);

  useEffect(() => {
    if (isCreating && creationRef.current) {
      creationRef.current.focus();
    }
  }, [isCreating]);

  // Sort items: Starred first, then by custom order
  const sortedItems = [...items].sort((a, b) => {
    if (a.isStarred === b.isStarred) {
      return (a.order ?? 0) - (b.order ?? 0);
    }
    return a.isStarred ? -1 : 1;
  });

  // Creation Logic
  const handleCreationSubmit = () => {
    if (creationText.trim()) {
      onAdd(creationText.trim(), category);
    }
    setCreationText('');
    setIsCreating(false);
  };

  const handleCreationKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreationSubmit();
    } else if (e.key === 'Escape') {
      setCreationText('');
      setIsCreating(false);
    }
  };

  // Editing logic for Main Items
  const startEditing = (item: RetroItem) => {
    setEditingId(item.id);
    setEditValue(item.text);
  };

  const saveEditing = (id: string) => {
    if (editValue.trim()) {
      onEdit(id, editValue.trim());
    }
    setEditingId(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEditing(id);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  // --- Sub Items Logic ---

  const handleSubItemSubmit = (e: React.FormEvent, itemId: string) => {
    e.preventDefault();
    if (newSubItemText.trim()) {
      onAddSubItem(itemId, newSubItemText.trim());
      setNewSubItemText('');
      // Keep input open to add more stages quickly
    } else {
      setAddingSubItemId(null);
    }
  };

  const startEditingSubItem = (subItem: RetroSubItem) => {
    setEditingSubItemId(subItem.id);
    setEditSubItemValue(subItem.text);
  };

  const saveEditingSubItem = (itemId: string, subItemId: string) => {
    if (editSubItemValue.trim()) {
      onEditSubItem(itemId, subItemId, editSubItemValue.trim());
    }
    setEditingSubItemId(null);
  };

  const handleSubItemKeyDown = (e: React.KeyboardEvent, itemId: string, subItemId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEditingSubItem(itemId, subItemId);
    } else if (e.key === 'Escape') {
      setEditingSubItemId(null);
    } else if (e.key === 'Backspace' && editSubItemValue === '') {
      e.preventDefault();
      onDeleteSubItem(itemId, subItemId);
      setEditingSubItemId(null);
    }
  };

  // --- Drag handlers ---
  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (editingId || editingSubItemId || isCreating) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const id = e.dataTransfer.getData('text/plain');
    if (id) {
      onMoveItem(id, category);
    }
  };

  const handleItemDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation(); 
    setIsOver(false); 
    
    const sourceId = e.dataTransfer.getData('text/plain');
    if (sourceId && sourceId !== targetId) {
      onReorder(sourceId, targetId);
    }
  };

  return (
    <div 
      className={`flex flex-col h-full rounded-2xl border ${config.bg} ${config.border} overflow-hidden shadow-sm transition-all duration-300 ${isOver ? 'ring-2 ring-indigo-400 ring-offset-2 scale-[1.01]' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className={`p-3 border-b ${config.border} bg-white/50 backdrop-blur-sm sticky top-0 z-10 flex justify-between items-center group/header`}>
        <h2 className={`text-lg font-black tracking-wide uppercase ${config.text}`}>
          {config.label}
        </h2>
        <button
          onClick={() => setIsCreating(true)}
          className={`p-1.5 rounded-md hover:bg-white/80 transition-all text-slate-400 hover:text-indigo-600 active:scale-95 ${isCreating ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          title={`Add to ${config.label}`}
        >
           <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Items List */}
      <div 
        className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar"
        onClick={(e) => {
           // Allow tapping empty space in empty list to start creation
           if (e.target === e.currentTarget && items.length === 0) {
               setIsCreating(true);
           }
        }}
      >
        {/* Creation Input Card - Shown at top */}
        {isCreating && (
             <div className="bg-white p-3 rounded-lg shadow-sm border border-indigo-300 ring-2 ring-indigo-500/20 animate-in slide-in-from-top-2 duration-200">
                <textarea
                    ref={creationRef}
                    value={creationText}
                    onChange={(e) => {
                      setCreationText(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    onBlur={handleCreationSubmit}
                    onKeyDown={handleCreationKeyDown}
                    placeholder="Type..."
                    className="w-full text-sm leading-relaxed text-slate-900 bg-transparent resize-none outline-none overflow-hidden placeholder:text-slate-300"
                    rows={1}
                  />
             </div>
        )}

        {items.length === 0 && !isCreating && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400/50 text-sm cursor-pointer hover:text-indigo-400 transition-colors">
            <p>Tap to add item</p>
          </div>
        )}
        
        {sortedItems.map((item) => (
          <div 
            key={item.id} 
            draggable={editingId !== item.id && !editingSubItemId && !isCreating}
            onDragStart={(e) => handleDragStart(e, item.id)}
            onDragOver={(e) => e.preventDefault()} 
            onDrop={(e) => handleItemDrop(e, item.id)}
            className={`group relative bg-white p-3 rounded-lg shadow-sm border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all duration-200 cursor-grab ${editingId === item.id ? 'ring-2 ring-indigo-500' : 'active:cursor-grabbing'} ${item.isStarred ? 'ring-1 ring-amber-300 bg-amber-50/30' : ''}`}
          >
            {/* Actions Toolbar - Floating Top Right */}
            {editingId !== item.id && !editingSubItemId && (
              <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 backdrop-blur shadow-sm border border-slate-100 rounded-md p-0.5 z-20">
                <button 
                  onClick={() => onStar(item.id)}
                  className={`p-1 rounded hover:bg-slate-100 transition-colors ${item.isStarred ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'}`}
                  title="Star to top"
                >
                  <Star className={`w-3.5 h-3.5 ${item.isStarred ? 'fill-amber-500' : ''}`} />
                </button>

                 <button 
                  onClick={() => onPinToStrategy(item.text)}
                  className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                  title="Pin to The Way"
                >
                  <MapPin className="w-3.5 h-3.5" />
                </button>

                 <button 
                  onClick={() => setAddingSubItemId(item.id)}
                  className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                  title="Add Stage/Step"
                >
                  <ListPlus className="w-3.5 h-3.5" />
                </button>
                
                <button 
                  onClick={() => onDelete(item.id)}
                  className="p-1 text-slate-400 hover:text-rose-500 hover:bg-slate-100 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Permanent Star Indicator (when not hovering) */}
            {item.isStarred && editingId !== item.id && (
               <div className="absolute top-2.5 right-2.5 text-amber-400 group-hover:opacity-0 transition-opacity z-10 pointer-events-none">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
               </div>
            )}

            <div className="flex gap-2 items-start">
               {/* Drag Handle */}
              {editingId !== item.id && !editingSubItemId && (
                <div className="mt-0.5 text-slate-300 cursor-grab active:cursor-grabbing flex-shrink-0">
                  <GripVertical className="w-4 h-4" />
                </div>
              )}
              
              <div className="flex-1 min-w-0 pr-6">
                {editingId === item.id ? (
                  <textarea
                    ref={textareaRef}
                    value={editValue}
                    onChange={(e) => {
                      setEditValue(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    onBlur={() => saveEditing(item.id)}
                    onKeyDown={(e) => handleKeyDown(e, item.id)}
                    className="w-full text-sm leading-relaxed text-slate-900 bg-transparent resize-none outline-none overflow-hidden"
                    rows={1}
                  />
                ) : (
                  <p 
                    onClick={() => startEditing(item)}
                    className={`text-sm leading-relaxed whitespace-pre-wrap cursor-text hover:text-indigo-800 transition-colors ${item.isStarred ? 'font-medium text-slate-900' : 'text-slate-700'}`}
                  >
                    {item.text}
                  </p>
                )}
              </div>
            </div>

            {/* Sub Items (Stages) */}
            {(item.subItems && item.subItems.length > 0 || addingSubItemId === item.id) && (
              <div className="pl-6 pt-2 space-y-1">
                {item.subItems?.map(sub => (
                  <div key={sub.id} className="group/sub flex items-center gap-2 text-xs relative">
                     <button 
                        onClick={() => onToggleSubItem(item.id, sub.id)}
                        className={`transition-colors flex-shrink-0 ${sub.isCompleted ? 'text-green-500' : 'text-slate-300 hover:text-slate-400'}`}
                     >
                       {sub.isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                     </button>
                     
                     <div className="flex-1 min-w-0 pr-4">
                        {editingSubItemId === sub.id ? (
                           <input
                              ref={subItemEditRef}
                              value={editSubItemValue}
                              onChange={(e) => setEditSubItemValue(e.target.value)}
                              onBlur={() => saveEditingSubItem(item.id, sub.id)}
                              onKeyDown={(e) => handleSubItemKeyDown(e, item.id, sub.id)}
                              className="w-full bg-transparent border-b border-indigo-300 focus:outline-none py-0.5"
                           />
                        ) : (
                           <span 
                            onClick={() => startEditingSubItem(sub)}
                            className={`cursor-pointer hover:text-indigo-700 transition-colors block truncate ${sub.isCompleted ? 'line-through text-slate-400' : 'text-slate-600'}`}
                           >
                              {sub.text}
                           </span>
                        )}
                     </div>

                     <button 
                        onClick={() => onDeleteSubItem(item.id, sub.id)}
                        className="absolute right-0 opacity-0 group-hover/sub:opacity-100 text-slate-300 hover:text-rose-500 transition-opacity p-0.5"
                     >
                        <X className="w-3 h-3" />
                     </button>
                  </div>
                ))}

                {/* Add Sub Item Input */}
                {addingSubItemId === item.id && (
                   <form onSubmit={(e) => handleSubItemSubmit(e, item.id)} className="flex items-center gap-2 pt-1 animate-in slide-in-from-top-1 duration-200">
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-300 border-dashed flex-shrink-0" />
                      <input
                        ref={subItemInputRef}
                        type="text"
                        value={newSubItemText}
                        onChange={(e) => setNewSubItemText(e.target.value)}
                        placeholder="Next stage..."
                        className="flex-1 bg-slate-50 border-none text-xs focus:ring-0 focus:bg-white rounded px-2 py-1 min-w-0"
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            setAddingSubItemId(null);
                            setNewSubItemText('');
                          } else if (e.key === 'Backspace' && newSubItemText === '') {
                             // Handle "Cancel/Remove" empty new stage
                             setAddingSubItemId(null);
                             setNewSubItemText('');
                          }
                        }}
                      />
                   </form>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};