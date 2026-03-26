import React from 'react';
import { 
  ShieldCheck, 
  AlertCircle, 
  Info, 
  Zap, 
  Target, 
  Activity,
  ChevronRight,
  Search,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { motion } from 'motion/react';

interface AuraAuditorPanelProps {
  problems: any[];
  projectName: string;
  files: any[];
  onFocusProblem: (problem: any) => void;
}

export const AuraAuditorPanel: React.FC<AuraAuditorPanelProps> = ({
  problems,
  projectName,
  files,
  onFocusProblem
}) => {
  const errorCount = problems.filter(p => p.severity === 'error').length;
  const warningCount = problems.filter(p => p.severity === 'warning').length;
  
  // Hitung Skor Kesehatan (0-100)
  const calculateScore = () => {
    if (files.length === 0) return 100;
    const baseScore = 100;
    const penalty = (errorCount * 10) + (warningCount * 2);
    return Math.max(0, baseScore - penalty);
  };

  const score = calculateScore();
  const getScoreColor = () => {
    if (score > 80) return 'text-green-400';
    if (score > 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-[#adbac7]">
      {/* Header Audit */}
      <div className="p-4 border-b border-white/5 bg-gradient-to-br from-purple-500/10 to-blue-500/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-purple-400" />
            <h2 className="text-[14px] font-bold tracking-tight">Project Auditor</h2>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 bg-black/40 rounded-full border border-white/5">
            <span className="text-[9px] font-bold text-gray-400 uppercase">AURA-v7</span>
          </div>
        </div>

        {/* Score Card */}
        <div className="relative p-4 bg-black/40 rounded-2xl border border-white/10 overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity size={40} className="text-purple-500" />
          </div>
          
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Health Score</span>
            <div className="flex items-end gap-2 mt-1">
              <span className={cn("text-4xl font-black leading-none", getScoreColor())}>{score}</span>
              <span className="text-[12px] font-bold text-gray-600 mb-1">/ 100</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                className={cn("h-full", score > 80 ? 'bg-green-500' : score > 50 ? 'bg-yellow-500' : 'bg-red-500')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Audit Sections */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Real-time Issues */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[11px] font-bold uppercase text-gray-500 tracking-wider">Critical Issues</h3>
            <span className="text-[10px] font-bold text-red-400 bg-red-400/10 px-2 rounded-full">{errorCount}</span>
          </div>
          
          <div className="space-y-2">
            {problems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center bg-green-500/5 border border-green-500/10 rounded-2xl">
                <CheckCircle2 size={24} className="text-green-500 mb-2 opacity-40" />
                <p className="text-[11px] font-bold text-green-400">Project is Clean</p>
                <p className="text-[9px] text-gray-500 mt-1">No critical issues detected.</p>
              </div>
            ) : (
              problems.map((p, i) => (
                <div 
                  key={i}
                  onClick={() => onFocusProblem(p)}
                  className="p-3 bg-black/20 hover:bg-white/5 border border-white/5 rounded-xl transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-3">
                    {p.severity === 'error' ? (
                      <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
                    ) : (
                      <Info size={14} className="text-yellow-400 mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-gray-300 leading-relaxed truncate">{p.message}</p>
                      <div className="flex items-center gap-2 mt-1.5 opacity-60">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-white/5 rounded">Line {p.line}</span>
                        <ChevronRight size={10} />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* AI Recommendations */}
        <section>
          <h3 className="text-[11px] font-bold uppercase text-gray-500 tracking-wider mb-3 px-1 flex items-center gap-2">
            <Zap size={12} className="text-yellow-400" /> AI Suggestions
          </h3>
          
          <div className="space-y-3">
            <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Target size={12} className="text-blue-400" />
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">Optimization</span>
              </div>
              <p className="text-[10px] leading-relaxed text-gray-400 italic">
                {score < 100 ? "AI mendeteksi beberapa pola redundansi. Gunakan 'Refactor' untuk meningkatkan efisiensi." : "Struktur kode sudah mengikuti best practices. Pertahankan performa ini."}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Project Meta */}
      <div className="p-4 bg-black/20 border-t border-white/5">
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex flex-col flex-1">
            <span className="text-gray-500 uppercase font-black tracking-tighter">Active Project</span>
            <span className="font-bold truncate text-white">{projectName}</span>
          </div>
          <div className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full font-bold">
            {files.length} Files
          </div>
        </div>
      </div>
    </div>
  );
};
