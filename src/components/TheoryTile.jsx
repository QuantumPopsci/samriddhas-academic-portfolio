import React from 'react';
import { BookOpen, Info } from 'lucide-react';

const TheoryTile = ({ title, physics, formula }) => {
  return (
    <div className="content-card mt-[-2rem] mb-12 border-t-0 rounded-t-none border-blue-500/30 bg-blue-50/5 dark:bg-blue-900/5">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen size={16} className="text-blue-500" />
        <h4 className="text-xs font-bold tracking-widest uppercase text-blue-600 dark:text-blue-400">
          Theoretical Background: {title}
        </h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
          {physics}
        </div>
        
        <div className="flex flex-col justify-center items-center p-4 bg-white/5 rounded border border-white/10">
          <span className="text-xs text-slate-500 uppercase mb-2">Key Relation</span>
          <div className="text-lg font-mono text-blue-500 dark:text-blue-300">
            {formula}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TheoryTile;
