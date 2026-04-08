import React from 'react';

export function VoiceOrb({ isSpeaking, isListening }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Animated Rings */}
        <div 
          className={`absolute inset-0 rounded-full bg-blue-500/20 blur-xl transition-all duration-500 
            ${isSpeaking ? 'animate-pulse scale-110' : ''} 
            ${isListening ? 'animate-ping scale-100 opacity-30' : 'scale-0'}
          `} 
        />
        
        {/* The Core Orb */}
        <div 
          className={`w-32 h-32 rounded-full border-4 transition-all duration-500 shadow-2xl flex items-center justify-center
            ${isSpeaking ? 'bg-blue-600 border-blue-400 scale-105 shadow-blue-500/40' : ''}
            ${isListening ? 'bg-emerald-500 border-emerald-300 scale-95 shadow-emerald-500/30' : ''}
            ${!isSpeaking && !isListening ? 'bg-slate-700 border-slate-500' : ''}
          `}
        >
          {/* Internal Indicator */}
          <div className="flex space-x-1">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className={`w-1.5 h-6 rounded-full transition-all duration-300 
                  ${isSpeaking ? 'bg-white/80 animate-bounce' : 'bg-white/20'}
                  ${isListening ? 'bg-white/80 animate-pulse' : ''}
                `}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </div>
      
      <p className="text-xl font-medium tracking-tight text-slate-200">
        {isSpeaking ? 'AI Speaking...' : isListening ? 'Listening...' : 'Ready'}
      </p>
    </div>
  );
}
