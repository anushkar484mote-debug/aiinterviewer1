import React from 'react';
import { Mic, MicOff, PhoneOff } from 'lucide-react';

export function Controls({ isListening, isSpeaking, onMicClick, onEndCall }) {
  const isDisabled = isSpeaking;

  return (
    <div className="mt-20 flex gap-12 items-center justify-center">
      {/* Toggle Mic Button */}
      <button 
        onClick={onMicClick}
        disabled={isDisabled}
        className={`p-6 rounded-full transition-all duration-300 shadow-xl border-4 
          ${isListening 
            ? 'bg-rose-500 border-rose-400 text-white animate-pulse' 
            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-blue-500 hover:text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed shadow-blue-500/10'
          }
        `}
      >
        {isListening ? (
          <MicOff className="w-8 h-8" />
        ) : (
          <Mic className="w-8 h-8" />
        )}
      </button>

      {/* End Session Button */}
      <button 
        onClick={onEndCall}
        className="p-6 rounded-full bg-slate-900 border-4 border-slate-700 text-slate-400 hover:bg-rose-600 hover:border-rose-400 hover:text-white transition-all duration-300 shadow-xl"
      >
        <PhoneOff className="w-8 h-8" />
      </button>
    </div>
  );
}
