import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VoiceOrb } from './VoiceOrb';
import { Controls } from './Controls';
import { TranscriptPanel } from './TranscriptPanel';
import { useVoice } from './useVoice';
import { Monitor, AlertCircle, Trophy, ChevronRight, Home } from 'lucide-react';

export default function StableVoiceApp() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const { 
    isListening, 
    isSpeaking, 
    messages, 
    loading,
    evaluation,
    error, 
    startListening, 
    stopListening,
    isFinished 
  } = useVoice(jobId);

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleEndCall = () => {
    if (confirm('Are you sure you want to exit the interview?')) {
      navigate('/dashboard');
    }
  };

  // ── LOADING STATE ───────────────────────────────────────────────────────
  if (loading && !messages.length) {
    return (
      <div className="h-screen w-screen bg-[#05070a] flex flex-col items-center justify-center text-white font-sans animate-fade-in">
        <div className="relative mb-8">
            <div className="w-16 h-16 rounded-3xl bg-blue-500/20 flex items-center justify-center outline outline-blue-500/30">
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-ping" />
            </div>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-200">Initializing Voice AI...</h2>
        <p className="text-sm text-slate-500 mt-2 font-medium uppercase tracking-[0.2em]">Secure connection established</p>
      </div>
    );
  }

  // ── FINISHED STATE (Evaluation) ─────────────────────────────────────────
  if (isFinished && evaluation) {
    return (
      <div className="h-screen w-screen bg-[#05070a] text-slate-100 flex flex-col items-center justify-center p-8 overflow-y-auto animate-fade-in font-sans">
        <div className="max-w-3xl w-full bg-[#0a0d14] border border-white/10 rounded-3xl p-10 shadow-3xl">
          
          <header className="flex items-center gap-6 mb-12">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10 outline outline-emerald-500/20">
               <Trophy className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white leading-tight">Interview Analyzed!</h1>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">AI Session Summary # {jobId.slice(-4)}</p>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-[#0f121a] p-6 rounded-2xl border border-white/5 shadow-inner">
               <p className="text-[10px] font-black text-slate-600 uppercase mb-2 tracking-widest font-mono">Communication</p>
               <p className="text-4xl font-black text-blue-400 font-mono tracking-tighter">{evaluation.scores.communication}<span className="text-lg text-slate-800">/10</span></p>
            </div>
            <div className="bg-[#0f121a] p-6 rounded-2xl border border-white/5 shadow-inner">
               <p className="text-[10px] font-black text-slate-600 uppercase mb-2 tracking-widest font-mono">Technical Depth</p>
               <p className="text-4xl font-black text-emerald-400 font-mono tracking-tighter">{evaluation.scores.technical}<span className="text-lg text-slate-800">/10</span></p>
            </div>
            <div className="bg-[#0f121a] p-6 rounded-2xl border border-white/5 shadow-inner">
               <p className="text-[10px] font-black text-slate-600 uppercase mb-2 tracking-widest font-mono">Confidence</p>
               <p className="text-4xl font-black text-amber-400 font-mono tracking-tighter">{evaluation.scores.confidence}<span className="text-lg text-slate-800">/10</span></p>
            </div>
          </div>

          <div className="bg-[#0f121a] p-8 rounded-3xl border border-white/5 space-y-6">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-200">
               <div className="w-1 h-4 bg-blue-500 rounded-full" />
               Expert AI Feedback
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">{evaluation.feedback}</p>
          </div>

          <div className="mt-12 flex items-center justify-between">
             <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black transition-all duration-300 shadow-xl shadow-blue-600/10 group"
             >
                <Home className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                DASHBOARD
                <ChevronRight className="w-5 h-5" />
             </button>
             <p className="text-xs text-slate-700 font-bold max-w-[200px] text-right">
                Your detailed transcript has been shared with the HR team.
             </p>
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN INTERFACE ───────────────────────────────────────────────────────
  return (
    <div className="h-screen w-screen bg-[#05070a] text-white flex overflow-hidden font-sans select-none antialiased">
      
      {/* ── LEFT Area (60%) ── */}
      <div className="w-[60%] flex flex-col items-center justify-center p-8 border-r border-white/5 relative bg-gradient-to-br from-slate-900/20 via-transparent to-transparent">
        
        {/* Top Header Badge */}
        <div className="absolute top-12 left-12 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/30 outline outline-blue-500/20">
            <Monitor className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-100 tracking-tight uppercase leading-none">Live Interview AI</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] leading-none">Encrypted Connection</p>
            </div>
          </div>
        </div>

        {/* Animation & Status */}
        <div className="mt-[-2rem]">
          <VoiceOrb 
            isSpeaking={isSpeaking} 
            isListening={isListening} 
          />
        </div>

        {/* Bottom Controls */}
        <Controls 
          isListening={isListening} 
          isSpeaking={isSpeaking} 
          onMicClick={handleMicClick}
          onEndCall={handleEndCall}
        />

        {/* Error Notification */}
        {error && (
          <div className="absolute bottom-12 left-12 right-12 mx-auto max-w-sm px-6 py-4 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-3 animate-fade-in shadow-2xl">
            <AlertCircle className="w-5 h-5" />
            {error.toUpperCase()} — CHECK MIC PERMISSIONS
          </div>
        )}
      </div>

      {/* ── RIGHT Area (40%) ── */}
      <div className="w-[40%] h-full flex flex-col shadow-2xl relative z-10">
        <TranscriptPanel messages={messages} />
      </div>

      {/* Styles for global handling */}
      <style jsx global>{`
        body { margin: 0; padding: 0; overflow: hidden; background: #05070a; user-select: none; }
        @keyframes fade-in { 
          from { opacity: 0; transform: scale(0.98) translateY(10px); } 
          to { opacity: 1; transform: scale(1) translateY(0); } 
        }
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}
