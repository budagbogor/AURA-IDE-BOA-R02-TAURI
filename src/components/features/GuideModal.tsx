import React from 'react';
import { X, Bot, Sparkles, Box, Search, Shield, Activity, GitBranch, Cloudy, RefreshCw, Terminal, Keyboard } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GuideModal({ isOpen, onClose }: GuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1e1e1e] w-full max-w-4xl max-h-[90vh] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#252526]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Bot size={28} className="text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">AURA AI IDE v4.0.0</h2>
              <p className="text-[#858585] text-sm mt-1">The Next Generation AI-Powered Development Environment</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-[#858585] hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Core Features */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#858585] mb-4 flex items-center gap-2">
                  <Sparkles size={14} className="text-blue-400" /> Core Features
                </h3>
                <div className="space-y-3">
                  <div className="flex gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                    <div className="mt-1"><Bot size={16} className="text-emerald-400" /></div>
                    <div>
                      <h4 className="text-sm font-medium text-white mb-1">Multi-AI Architecture</h4>
                      <p className="text-xs text-[#858585] leading-relaxed">Pilih antara Gemini 2.0 Flash, OpenRouter (Claude/GPT-4), Bytez, atau SumoPod. Bebas beralih model kapan saja.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                    <div className="mt-1"><Box size={16} className="text-purple-400" /></div>
                    <div>
                      <h4 className="text-sm font-medium text-white mb-1">Super Claude Skills</h4>
                      <p className="text-xs text-[#858585] leading-relaxed">Gunakan perintah `/explain`, `/refactor`, `/test`, dll di chat AI untuk instruksi yang terkalibrasi khusus.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                    <div className="mt-1"><Search size={16} className="text-orange-400" /></div>
                    <div>
                      <h4 className="text-sm font-medium text-white mb-1">Context7 Mode</h4>
                      <p className="text-xs text-[#858585] leading-relaxed">Berikan AI pemahaman mendalam tentang seluruh arsitektur proyek Anda secara otomatis.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#858585] mb-4 flex items-center gap-2">
                  <Keyboard size={14} className="text-pink-400" /> Keyboard Shortcuts
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between p-2 rounded bg-white/[0.02]"><span className="text-[#858585]">Command Palette</span><kbd className="text-blue-400 font-mono">Ctrl+Shift+P</kbd></div>
                  <div className="flex justify-between p-2 rounded bg-white/[0.02]"><span className="text-[#858585]">File Search</span><kbd className="text-blue-400 font-mono">Ctrl+P</kbd></div>
                  <div className="flex justify-between p-2 rounded bg-white/[0.02]"><span className="text-[#858585]">Toggle Sidebar</span><kbd className="text-blue-400 font-mono">Ctrl+B</kbd></div>
                  <div className="flex justify-between p-2 rounded bg-white/[0.02]"><span className="text-[#858585]">Toggle Terminal</span><kbd className="text-blue-400 font-mono">Ctrl+`</kbd></div>
                </div>
              </div>
            </div>

            {/* Platform Integrations */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#858585] mb-4 flex items-center gap-2">
                  <Activity size={14} className="text-yellow-400" /> Integrations
                </h3>
                <div className="space-y-3">
                  <div className="flex gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                    <div className="mt-1"><GitBranch size={16} className="text-gray-300" /></div>
                    <div>
                      <h4 className="text-sm font-medium text-white mb-1">GitHub Native</h4>
                      <p className="text-xs text-[#858585] leading-relaxed">Clone repository, list project, dan auto-push ke GitHub langsung dari IDE tanpa CLI setup memusingkan.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                    <div className="mt-1"><Cloudy size={16} className="text-emerald-400" /></div>
                    <div>
                      <h4 className="text-sm font-medium text-white mb-1">Supabase Cloud Sync</h4>
                      <p className="text-xs text-[#858585] leading-relaxed">Simpan keseluruhan proyek sementara di Cloud (Supabase) dengan satu klik. Lanjutkan coding dimana saja.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                    <div className="mt-1"><Terminal size={16} className="text-blue-400" /></div>
                    <div>
                      <h4 className="text-sm font-medium text-white mb-1">MCP (Model Context Protocol)</h4>
                      <p className="text-xs text-[#858585] leading-relaxed">Hubungkan AI dengan server MCP eksternal (SSE/Stdio) untuk mengeksekusi tools pintar secara langsung.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Shield size={16} className="text-blue-400" /> Privacy First
                </h3>
                <p className="text-xs text-[#858585] leading-relaxed">
                  API Key Anda disimpan secara lokal (<code className="text-blue-300">localStorage</code>) di browser/komputer ini dan tidak pernah dikirimkan ke server AURA. Kami tidak menyimpan riwayat percakapan atau kode sumber Anda.
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-[#252526] flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20"
          >
            Mulai Coding
          </button>
        </div>
      </div>
    </div>
  );
}
