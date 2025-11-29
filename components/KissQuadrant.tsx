import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Star, GripVertical, ListPlus, CheckCircle2, Circle, X, Target, MoreHorizontal, ChevronDown, ChevronRight } from 'lucide-react';
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

  // Collapse State for Items with Sub-items
  const [collapsedItemIds, setCollapsedItemIds] = useState<Set<string>>(new Set());

  // Mobile Active States (Slide-to-reveal emulation)
  const [activeMobileSubId, setActiveMobileSubId] = useState<string | null>(null);
  const [activeMobileItemId, setActiveMobileItemId] = useState<string | null>(null);

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

  // Handle outside click to clear mobile active states
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Clear Sub Item Active State
      if (activeMobileSubId && !target.closest('.sub-item-row')) {
        setActiveMobileSubId(null);
      }
      
      // Clear Main Item Active State
      if (activeMobileItemId && !target.closest('.main-item-row')) {
        setActiveMobileItemId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMobileSubId, activeMobileItemId]);


  // Sort items: Starred first, then by custom order
  const sortedItems = [...items].sort((a, b) => {
    if (a.isStarred === b.isStarred) {
      return (a.order ?? 0) - (b.order ?? 0);
    }
    return a.isStarred ? -1 : 1;
  });

  const toggleCollapse = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedItemIds(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

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
    setActiveMobileItemId(null); // Clear active state
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
      // Ensure expanded when adding
      setCollapsedItemIds(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    } else {
      setAddingSubItemId(null);
    }
  };

  const startEditingSubItem = (subItem: RetroSubItem) => {
    setEditingSubItemId(subItem.id);
    setEditSubItemValue(subItem.text);
    setActiveMobileSubId(null); // Clear active state when editing starts
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
        
        {sortedItems.map((item) => {
          const isItemActive = activeMobileItemId === item.id;
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isCollapsed = collapsedItemIds.has(item.id);
          
          return (
          <div 
            key={item.id} 
            draggable={editingId !== item.id && !editingSubItemId && !isCreating}
            onDragStart={(e) => handleDragStart(e, item.id)}
            onDragOver={(e) => e.preventDefault()} 
            onDrop={(e) => handleItemDrop(e, item.id)}
            onClick={(e) => {
                // Handle Mobile Tap to Reveal Actions for Main Item
                // Don't trigger if clicking interactive elements
                if (!(e.target as HTMLElement).closest('button') && !(e.target as HTMLElement).closest('input') && !(e.target as HTMLElement).closest('textarea') && !(e.target as HTMLElement).closest('.sub-item-row')) {
                    setActiveMobileItemId(isItemActive ? null : item.id);
                }
            }}
            className={`main-item-row group relative bg-white p-3 rounded-lg shadow-sm border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all duration-200 cursor-grab 
                ${editingId === item.id ? 'ring-2 ring-indigo-500' : 'active:cursor-grabbing'} 
                ${item.isStarred ? 'ring-1 ring-amber-300 bg-amber-50/30' : ''}
                ${isItemActive ? 'ring-1 ring-indigo-300 bg-indigo-50/30' : ''}
            `}
          >
            {/* Actions Toolbar - Floating Top Right */}
            {/* Logic: Visible if NOT editing AND (Mobile Active OR Desktop Hover) */}
            {editingId !== item.id && !editingSubItemId && (
              <div 
                className={`absolute top-2 right-2 flex items-center gap-0.5 transition-all duration-200 bg-white/95 backdrop-blur shadow-sm border border-slate-100 rounded-md p-0.5 z-20
                    ${isItemActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0'}
                `}
              >
                <button 
                  onClick={(e) => { e.stopPropagation(); onStar(item.id); }}
                  className={`p-1.5 md:p-1 rounded hover:bg-slate-100 transition-colors ${item.isStarred ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'}`}
                  title="Star to top"
                >
                  <Star className={`w-4 h-4 md:w-3.5 md:h-3.5 ${item.isStarred ? 'fill-amber-500' : ''}`} />
                </button>

                 <button 
                  onClick={(e) => { e.stopPropagation(); onPinToStrategy(item.text); setActiveMobileItemId(null); }}
                  className="p-1.5 md:p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                  title="Pin to Focus"
                >
                  <Target className="w-4 h-4 md:w-3.5 md:h-3.5" />
                </button>

                 <button 
                  onClick={(e) => { e.stopPropagation(); setAddingSubItemId(item.id); setActiveMobileItemId(null); }}
                  className="p-1.5 md:p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                  title="Add Stage/Step"
                >
                  <ListPlus className="w-4 h-4 md:w-3.5 md:h-3.5" />
                </button>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                  className="p-1.5 md:p-1 text-slate-400 hover:text-rose-500 hover:bg-slate-100 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 md:w-3.5 md:h-3.5" />
                </button>
              </div>
            )}

            {/* Permanent Star Indicator (when not hovering/active) */}
            {item.isStarred && editingId !== item.id && !isItemActive && (
               <div className="absolute top-2.5 right-2.5 text-amber-400 group-hover:opacity-0 transition-opacity z-10 pointer-events-none">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
               </div>
            )}

            <div className="flex gap-2 items-start">
               {/* Drag Handle & Collapse Toggle */}
              {editingId !== item.id && !editingSubItemId && (
                <div className="mt-0.5 text-slate-300 flex items-center gap-0.5 flex-shrink-0">
                  <div className="cursor-grab active:cursor-grabbing">
                     <GripVertical className="w-4 h-4" />
                  </div>
                  {hasSubItems && (
                    <button 
                      onClick={(e) => toggleCollapse(item.id, e)}
                      className="hover:text-indigo-500 transition-colors p-0.5 rounded"
                      title={isCollapsed ? "Show Details" : "Hide Details"}
                    >
                      {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              )}
              
              <div className="flex-1 min-w-0 pr-2 md:pr-6">
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
                    onClick={(e) => { e.stopPropagation(); startEditing(item); }}
                    className={`text-sm leading-relaxed whitespace-pre-wrap cursor-text hover:text-indigo-800 transition-colors ${item.isStarred ? 'font-medium text-slate-900' : 'text-slate-700'}`}
                  >
                    {item.text}
                  </p>
                )}
              </div>
            </div>

            {/* Sub Items (Stages) */}
            {(hasSubItems || addingSubItemId === item.id) && !isCollapsed && (
              <div className="pl-6 pt-2 space-y-1 animate-in slide-in-from-top-1 duration-200">
                {item.subItems?.map(sub => {
                  const isActive = activeMobileSubId === sub.id;
                  return (
                    <div 
                      key={sub.id} 
                      className={`sub-item-row group/sub flex items-center gap-2 text-xs relative py-1.5 min-h-[36px] transition-colors rounded-md -mx-2 px-2 ${isActive ? 'bg-indigo-50/60' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation(); // Stop propagation to prevent Main Item Active trigger
                        // Toggle active state on row click (for mobile experience)
                        if ((e.target as HTMLElement).tagName !== 'INPUT' && !(e.target as HTMLElement).closest('button')) {
                          setActiveMobileSubId(isActive ? null : sub.id);
                        }
                      }}
                    >
                       <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleSubItem(item.id, sub.id);
                          }}
                          className={`transition-colors flex-shrink-0 p-1 md:p-0 z-10 ${sub.isCompleted ? 'text-green-500' : 'text-slate-300 hover:text-slate-400'}`}
                       >
                         {sub.isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                       </button>
                       
                       <div className="flex-1 min-w-0 pr-8 transition-all duration-300">
                          {editingSubItemId === sub.id ? (
                             <input
                                ref={subItemEditRef}
                                value={editSubItemValue}
                                onChange={(e) => setEditSubItemValue(e.target.value)}
                                onBlur={() => saveEditingSubItem(item.id, sub.id)}
                                onKeyDown={(e) => handleSubItemKeyDown(e, item.id, sub.id)}
                                className="w-full bg-transparent border-b border-indigo-300 focus:outline-none py-1"
                             />
                          ) : (
                             <span 
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditingSubItem(sub);
                              }}
                              className={`cursor-pointer hover:text-indigo-700 transition-colors block truncate py-1 ${sub.isCompleted ? 'line-through text-slate-400' : 'text-slate-600'}`}
                             >
                                {sub.text}
                             </span>
                          )}
                       </div>

                       {/* Mobile "More" hint (visible when inactive on mobile) */}
                       {!isActive && (
                         <div className="absolute right-2 md:hidden text-slate-300">
                           <MoreHorizontal className="w-4 h-4" />
                         </div>
                       )}

                       {/* Actions: Desktop (Hover) & Mobile (Active State) */}
                       <div 
                        className={`
                          absolute right-0 top-0 bottom-0 flex items-center gap-1 pl-4 pr-1
                          bg-gradient-to-l from-white via-white to-transparent 
                          md:from-white/95 md:to-white/95 md:backdrop-blur-[1px] md:rounded-l-md 
                          transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
                          ${isActive 
                              ? 'opacity-100 translate-x-0 bg-white/80 backdrop-blur-md rounded-l-lg shadow-sm' // Mobile Active
                              : 'opacity-0 translate-x-4 pointer-events-none md:pointer-events-auto md:translate-x-0 md:group-hover/sub:opacity-100' // Desktop Hover
                          }
                        `}
                       >
                          <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onPinToStrategy(`${item.text}: ${sub.text}`);
                                setActiveMobileSubId(null);
                              }}
                              className="p-2 md:p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-full md:rounded transition-colors active:scale-95"
                              title="Pin to Focus"
                          >
                              <Target className="w-5 h-5 md:w-3.5 md:h-3.5" />
                          </button>
                          <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSubItem(item.id, sub.id);
                              }}
                              className="p-2 md:p-1 text-slate-400 hover:text-rose-500 hover:bg-slate-100 rounded-full md:rounded transition-colors active:scale-95"
                              title="Delete"
                          >
                              <X className="w-5 h-5 md:w-3.5 md:h-3.5" />
                          </button>
                       </div>
                    </div>
                  );
                })}

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
                             setAddingSubItemId(null);
                             setNewSubItemText('');
                          }
                        }}
                      />
                   </form>
                )}
              </div>
            )}
            
            {/* Collapsed Indicator / Add SubItem Hint if collapsed */}
            {isCollapsed && hasSubItems && (
                <div 
                    onClick={(e) => toggleCollapse(item.id, e)}
                    className="pl-6 pt-1 flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-500 cursor-pointer w-fit"
                >
                    <div className="w-1 h-1 bg-slate-300 rounded-full" />
                    <div className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span className="ml-1">{item.subItems?.length} items hidden</span>
                </div>
            )}
          </div>
        );
        })}
      </div>
    </div>
  );
};