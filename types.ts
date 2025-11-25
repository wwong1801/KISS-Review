export enum Category {
  KEEP = 'KEEP',
  IMPROVE = 'IMPROVE',
  START = 'START',
  STOP = 'STOP',
}

export interface RetroSubItem {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface RetroItem {
  id: string;
  text: string;
  category: Category;
  likes: number; // Keeping for backward compatibility but UI will prioritize stars
  isStarred?: boolean;
  order?: number;
  subItems?: RetroSubItem[];
  createdAt: number;
}

export interface RetroSession {
  id: string;
  goal: string;
  strategy?: string;
  items: RetroItem[];
  createdAt: number;
  lastUpdated: number;
}

export interface AIAnalysisResult {
  summary: string;
  sentiment: string;
  topActionItems: string[];
  categoryInsights: {
    category: string;
    insight: string;
  }[];
}

export interface BrainstormResult {
  [Category.KEEP]: string[];
  [Category.IMPROVE]: string[];
  [Category.START]: string[];
  [Category.STOP]: string[];
}

export const CATEGORY_CONFIG: Record<Category, { 
  label: string; 
  color: string; 
  icon: string; 
  bg: string;
  border: string;
  text: string;
}> = {
  [Category.KEEP]: {
    label: 'Keep',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    icon: 'CheckCircle'
  },
  [Category.IMPROVE]: {
    label: 'Improve',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    icon: 'ArrowUpCircle'
  },
  [Category.START]: {
    label: 'Start',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: 'PlayCircle'
  },
  [Category.STOP]: {
    label: 'Stop',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-800',
    icon: 'StopCircle'
  }
};