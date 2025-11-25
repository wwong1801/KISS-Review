import React from 'react';
import { X, Sparkles, Target, Brain, Activity } from 'lucide-react';
import { AIAnalysisResult } from '../types';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: AIAnalysisResult | null;
  isLoading: boolean;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, result, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white">
          <div className="flex items-center gap-2 text-indigo-700">
            <Sparkles className="w-5 h-5" />
            <h2 className="text-xl font-bold">AI Retrospective Analysis</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="text-slate-500 animate-pulse">Consulting the Agile Oracle...</p>
            </div>
          ) : result ? (
            <>
              {/* Summary Section */}
              <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
                <div className="flex items-center gap-2 mb-2 text-indigo-800 font-semibold">
                  <Brain className="w-4 h-4" />
                  <h3>Executive Summary</h3>
                </div>
                <p className="text-slate-700 leading-relaxed">{result.summary}</p>
              </div>

              {/* Sentiment & Insights Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center gap-2 mb-3 text-slate-800 font-semibold">
                      <Activity className="w-4 h-4" />
                      <h3>Team Sentiment</h3>
                    </div>
                    <div className="inline-block px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-800 font-medium shadow-sm">
                      {result.sentiment}
                    </div>
                 </div>
                 
                 <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center gap-2 mb-3 text-slate-800 font-semibold">
                       <Target className="w-4 h-4" />
                       <h3>Top Action Items</h3>
                    </div>
                    <ul className="space-y-2">
                      {result.topActionItems.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold mt-0.5">
                            {idx + 1}
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                 </div>
              </div>

              {/* Category Breakdown */}
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Category Insights</h3>
                <div className="space-y-3">
                  {result.categoryInsights.map((insight, idx) => (
                    <div key={idx} className="flex gap-4 p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                      <div className="w-24 font-bold text-xs uppercase tracking-wide text-slate-500 pt-1">
                        {insight.category}
                      </div>
                      <div className="text-sm text-slate-700">
                        {insight.insight}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-slate-500 py-8">
              Analysis failed or returned empty. Please try again.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};