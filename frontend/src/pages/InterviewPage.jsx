import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, PhoneOff, Volume2, VolumeX, MessageSquare, Clock, Trophy } from 'lucide-react'
import { jobService, voiceService } from '../services/api'
import { toast } from '../hooks/useToast'

// ── Speech Recognition Setup ────────────────────────────────────────────────
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const recognition = SpeechRecognition ? new SpeechRecognition() : null
if (recognition) {
  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = 'en-US'
}

export default function InterviewPage() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  
  // State
  const [job, setJob] = useState(null)
  const [interviewId, setInterviewId] = useState(null)
  const [status, setStatus] = useState('Initializing...') // 'AI Speaking', 'Listening', 'Thinking', 'Finished'
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [transcript, setTranscript] = useState([]) // [{ role: 'ai' | 'user', text: string }]
  const [currentTranscript, setCurrentTranscript] = useState('')
  const [timer, setTimer] = useState(0)
  const [showTranscript, setShowTranscript] = useState(true)
  const [loading, setLoading] = useState(true)
  const [evaluation, setEvaluation] = useState(null)
  
  const transcriptRef = useRef(null)
  const timerRef = useRef(null)
  const speechRef = useRef(null) // To store current speech synthesis utterance

  // ── Auto-scroll transcript ───────────────────────────────────────────────
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [transcript, currentTranscript])

  // ── Timer ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (status !== 'Finished' && status !== 'Initializing...') {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1)
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [status])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // ── AI Speech (TTS) ─────────────────────────────────────────────────────
  const speak = useCallback((text, onEnd) => {
    if (!window.speechSynthesis) return onEnd?.()
    
    // Stop any current speech
    window.speechSynthesis.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.1
    utterance.pitch = 1.0
    
    utterance.onstart = () => {
      setIsSpeaking(true)
      setStatus('AI Speaking...')
    }
    
    utterance.onend = () => {
      setIsSpeaking(false)
      onEnd?.()
    }
    
    utterance.onerror = (err) => {
      console.error('TTS Error:', err)
      setIsSpeaking(false)
      onEnd?.()
    }
    
    speechRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [])

  // ── User Speech (STT) ───────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (!recognition || isMuted) return
    
    recognition.onresult = (event) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          const final = event.results[i][0].transcript
          setCurrentTranscript('')
          handleUserAnswer(final)
          recognition.stop()
        } else {
          interim += event.results[i][0].transcript
        }
      }
      setCurrentTranscript(interim)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
    setIsListening(true)
    setStatus('Listening...')
  }, [isMuted])

  const stopListening = useCallback(() => {
    if (recognition) recognition.stop()
    setIsListening(false)
  }, [])

  // ── Lifecycle: Start Interview ──────────────────────────────────────────
  const boot = useCallback(async () => {
    try {
      const jobRes = await jobService.getById(jobId)
      setJob(jobRes.data.job)

      const res = await voiceService.start({ jobId })
      setInterviewId(res.data.interviewId)
      
      const introText = res.data.text
      setTranscript([{ role: 'ai', text: introText }])
      
      setLoading(false)
      
      // AI speaks intro
      setTimeout(() => {
        speak(introText, () => {
          startListening()
        })
      }, 500)
    } catch (err) {
      toast.error('Failed to start interview: ' + err.message)
      navigate('/dashboard')
    }
  }, [jobId, navigate, speak, startListening])

  useEffect(() => {
    boot()
    return () => {
      window.speechSynthesis.cancel()
      if (recognition) recognition.stop()
    }
  }, [boot])

  // ── Handle Response ─────────────────────────────────────────────────────
  const handleUserAnswer = async (answer) => {
    if (!answer.trim()) {
      startListening()
      return
    }

    setTranscript((prev) => [...prev, { role: 'user', text: answer }])
    setStatus('Thinking...')
    
    try {
      const res = await voiceService.next({
        interviewId,
        answer,
        question: transcript[transcript.length - 1].text, // Last AI question
      })

      if (res.data.finished) {
        setTranscript((prev) => [...prev, { role: 'ai', text: res.data.text }])
        speak(res.data.text, () => {
          handleEndInterview()
        })
      } else {
        const nextQ = res.data.text
        setTranscript((prev) => [...prev, { role: 'ai', text: nextQ }])
        speak(nextQ, () => {
          startListening()
        })
      }
    } catch (err) {
      toast.error('Connection error: ' + err.message)
      setStatus('Paused')
    }
  }

  const handleEndInterview = async () => {
    setStatus('Finished')
    stopListening()
    window.speechSynthesis.cancel()
    
    toast.loading('Analyzing your interview...')
    try {
      const res = await voiceService.end({ interviewId })
      setEvaluation(res.data.evaluation)
      toast.success('Interview evaluated!')
    } catch (err) {
      toast.error('Evaluation failed: ' + err.message)
    }
  }

  // ── UI Components ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 bg-blue-500 rounded-full blur-xl mb-4"
        />
        <p className="text-slate-400 font-medium animate-pulse">Establishing secure connection...</p>
      </div>
    )
  }

  if (evaluation) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Interview Summary</h1>
              <p className="text-slate-400">Application for {job?.title}</p>
            </div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors"
            >
              Back to Dashboard
            </button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
              <p className="text-slate-500 text-sm mb-1 uppercase tracking-wider font-semibold font-mono">Communication</p>
              <p className="text-4xl font-bold text-blue-400">{evaluation.scores.communication}/10</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
              <p className="text-slate-500 text-sm mb-1 uppercase tracking-wider font-semibold font-mono">Technical Depth</p>
              <p className="text-4xl font-bold text-emerald-400">{evaluation.scores.technical}/10</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
              <p className="text-slate-500 text-sm mb-1 uppercase tracking-wider font-semibold font-mono">Confidence</p>
              <p className="text-4xl font-bold text-amber-400">{evaluation.scores.confidence}/10</p>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              AI Feedback
            </h2>
            <p className="text-slate-300 leading-relaxed text-lg mb-8">{evaluation.feedback}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Key Strengths
                </h3>
                <ul className="space-y-3">
                  {evaluation.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-400">
                      <span className="text-emerald-500 text-lg leading-tight">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-rose-400 font-bold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                  Areas for Growth
                </h3>
                <ul className="space-y-3">
                  {evaluation.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-400">
                      <span className="text-rose-500 text-lg leading-tight">•</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-white flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <span className="font-bold text-xl">A</span>
          </div>
          <div>
            <h2 className="font-bold text-slate-200">AI Interviewer</h2>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">{job?.title}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
            <span className="text-sm font-bold text-rose-500 uppercase tracking-tighter">Live Session</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="font-mono text-sm text-slate-300">{formatTime(timer)}</span>
          </div>
        </div>
      </div>

      <main className="flex-1 flex overflow-hidden">
        {/* Left: Interaction Area */}
        <div className={`flex-1 flex flex-col items-center justify-center p-8 transition-all duration-500 ${showTranscript ? 'md:pr-0' : ''}`}>
          <div className="relative mb-24">
            {/* Pulsing Orb */}
            <AnimatePresence mode="wait">
              {isSpeaking ? (
                <motion.div
                  key="speaking"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="relative"
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      boxShadow: [
                        "0 0 40px rgba(59, 130, 246, 0.4)",
                        "0 0 80px rgba(59, 130, 246, 0.6)",
                        "0 0 40px rgba(59, 130, 246, 0.4)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-48 h-48 bg-blue-600 rounded-full blur-[2px] flex items-center justify-center"
                  >
                    <div className="w-44 h-44 bg-slate-950 rounded-full flex items-center justify-center overflow-hidden border-2 border-blue-500/30">
                      <div className="flex gap-1 items-center">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ height: [12, 40, 12] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                            className="w-1.5 bg-blue-400 rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ) : isListening ? (
                <motion.div
                  key="listening"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="relative"
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      boxShadow: [
                        "0 0 40px rgba(16, 185, 129, 0.3)",
                        "0 0 60px rgba(16, 185, 129, 0.5)",
                        "0 0 40px rgba(16, 185, 129, 0.3)"
                      ]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="w-48 h-48 bg-emerald-500 rounded-full blur-[2px] flex items-center justify-center"
                  >
                    <div className="w-44 h-44 bg-slate-950 rounded-full flex items-center justify-center border-2 border-emerald-500/30">
                      <Mic className="w-12 h-12 text-emerald-400" />
                    </div>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="w-48 h-48 bg-slate-800 rounded-full flex items-center justify-center blur-[2px]"
                >
                   <div className="w-44 h-44 bg-slate-950 rounded-full border-2 border-white/10" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Status Label */}
            <motion.div 
              key={status}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap"
            >
              <span className="text-lg font-medium text-slate-300 tracking-tight">{status}</span>
            </motion.div>
          </div>

          {/* Current Transcript Bubble */}
          <div className="h-24 w-full max-w-xl text-center px-4">
             {currentTranscript && (
               <motion.p 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="text-xl text-white/70 italic font-medium leading-relaxed"
               >
                 "{currentTranscript}"
               </motion.p>
             )}
          </div>
        </div>

        {/* Right: Transcript Panel */}
        <AnimatePresence>
          {showTranscript && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="hidden lg:flex flex-col border-l border-white/10 bg-[#0a0d14]"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  Live Transcript
                </h3>
              </div>
              <div 
                ref={transcriptRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
              >
                {transcript.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 px-1">
                      {msg.role === 'ai' ? 'Assistant' : 'You'}
                    </span>
                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'ai' 
                        ? 'bg-slate-900 text-slate-300 rounded-tl-none border border-white/5' 
                        : 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-600/10'
                    }`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Controls */}
      <div className="p-8 flex items-center justify-center gap-6 bg-black/40 backdrop-blur-xl border-t border-white/5">
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className={`p-4 rounded-full transition-all duration-300 ${
            isMuted 
              ? 'bg-rose-500/20 text-rose-500 border border-rose-500/50' 
              : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
          }`}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        <button 
          onClick={handleEndInterview}
          className="px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-full font-bold flex items-center gap-3 transition-all duration-300 shadow-xl shadow-rose-600/20"
        >
          <PhoneOff className="w-5 h-5" />
          End Interview
        </button>

        <button 
          onClick={() => setShowTranscript(!showTranscript)}
          className={`p-4 rounded-full transition-all duration-300 ${
            showTranscript 
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' 
              : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
          }`}
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      </div>

      <style jsx global>{`
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
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
