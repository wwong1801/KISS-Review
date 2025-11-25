import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { RetroBoard } from './components/RetroBoard';
import { RetroSession, RetroItem } from './types';

const SESSIONS_KEY = 'kiss-retro-sessions';
// Legacy keys for migration
const LEGACY_GOAL_KEY = 'kiss-retro-goal';
const LEGACY_ITEMS_KEY = 'kiss-retro-items';

// Simple UUID generator fallback for wider browser compatibility
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export default function App() {
  const [sessions, setSessions] = useState<RetroSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load sessions and handle migration on mount
  useEffect(() => {
    try {
      // 1. Load existing sessions
      const savedSessionsJson = localStorage.getItem(SESSIONS_KEY);
      let loadedSessions: RetroSession[] = savedSessionsJson ? JSON.parse(savedSessionsJson) : [];

      // 2. Check for legacy data to migrate
      const legacyGoal = localStorage.getItem(LEGACY_GOAL_KEY);
      const legacyItemsJson = localStorage.getItem(LEGACY_ITEMS_KEY);

      if (legacyGoal || legacyItemsJson) {
        const legacyItems: RetroItem[] = legacyItemsJson ? JSON.parse(legacyItemsJson) : [];
        // Only migrate if there's actual data
        if (legacyGoal || legacyItems.length > 0) {
          const migratedSession: RetroSession = {
            id: generateId(),
            goal: legacyGoal || 'Untitled Session',
            items: legacyItems,
            createdAt: Date.now(),
            lastUpdated: Date.now()
          };
          loadedSessions = [migratedSession, ...loadedSessions];
          
          // Clear legacy keys
          localStorage.removeItem(LEGACY_GOAL_KEY);
          localStorage.removeItem(LEGACY_ITEMS_KEY);
        }
      }

      setSessions(loadedSessions);
    } catch (error) {
      console.error("Failed to load sessions:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save sessions whenever they change, but only after initial load
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    }
  }, [sessions, isLoaded]);

  const handleCreateSession = (goal: string) => {
    const newSession: RetroSession = {
      id: generateId(),
      goal,
      items: [],
      createdAt: Date.now(),
      lastUpdated: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this session?')) {
      setSessions(prev => prev.filter(s => s.id !== id));
      if (activeSessionId === id) {
        setActiveSessionId(null);
      }
    }
  };

  const handleUpdateSession = (updatedSession: RetroSession) => {
    setSessions(prev => prev.map(s => 
      s.id === updatedSession.id ? { ...updatedSession, lastUpdated: Date.now() } : s
    ));
  };

  // Specifically for updating goal text from Landing Page
  const handleUpdateSessionGoal = (id: string, newGoal: string) => {
    setSessions(prev => prev.map(s => 
      s.id === id ? { ...s, goal: newGoal, lastUpdated: Date.now() } : s
    ));
  };

  const handleReorderSessions = (newSessions: RetroSession[]) => {
    setSessions(newSessions);
  };

  const activeSession = sessions.find(s => s.id === activeSessionId);

  return (
    <>
      {activeSession ? (
        <RetroBoard 
          session={activeSession}
          onUpdateSession={handleUpdateSession}
          onBack={() => setActiveSessionId(null)}
        />
      ) : (
        <LandingPage 
          onStart={handleCreateSession}
          sessions={sessions}
          onSelectSession={(id) => setActiveSessionId(id)}
          onDeleteSession={handleDeleteSession}
          onUpdateSessionGoal={handleUpdateSessionGoal}
          onReorderSessions={handleReorderSessions}
        />
      )}
    </>
  );
}