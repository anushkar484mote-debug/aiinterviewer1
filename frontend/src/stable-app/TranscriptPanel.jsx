import React, { useRef, useEffect } from 'react';
import { MessageCircle, Info } from 'lucide-react';

export function TranscriptPanel({ messages }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-[#0a0d14] border-l border-white/10 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20 backdrop-blur-md">
        <h3 className="font-bold flex items-center gap-2 text-slate-100">
          <MessageCircle className="w-5 h-5 text-blue-500" />
          Live Transcript
        </h3>
        <div className="px-3 py-1 rounded-full bg-blue-500/10 text-[10px] font-bold text-blue-400 uppercase tracking-widest border border-blue-500/20 animate-pulse">
          Live Session
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth scrollbar-hide"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}
          >
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1 px-1">
              {msg.role === 'ai' ? 'AI Interviewer' : 'You'}
            </span>
            <div className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed transition-all duration-300 shadow-md
              ${msg.role === 'ai' 
                ? 'bg-slate-900 text-slate-300 rounded-tl-none border border-white/5 shadow-white/5' 
                : 'bg-blue-600 text-white rounded-tr-none shadow-blue-600/10'
              }
            `}>
              {msg.text}
            </div>
          </div>
        ))}

        {messages.length === 1 && (
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 opacity-30 mt-12">
            <Info className="w-12 h-12 text-slate-400" />
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              Interview has started. <br />
              Click the microphone button to respond.
            </p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-black/10 border-t border-white/5 text-center">
        <p className="text-[10px] text-slate-600 font-medium uppercase tracking-tighter">
          End-to-end encrypted session • Response captured via webkit
        </p>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
