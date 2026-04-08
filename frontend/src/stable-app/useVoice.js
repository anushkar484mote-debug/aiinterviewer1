import { useState, useEffect, useCallback, useRef } from 'react';
import { voiceService } from '../services/api';
import { toast } from '../hooks/useToast';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
  recognition.continuous = false; 
  recognition.interimResults = false;
  recognition.lang = 'en-US';
}

export function useVoice(jobId) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState([]);
  const [interviewId, setInterviewId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState(null);

  // ── Text to Speech (TTS) ────────────────────────────────────────────────
  const speak = useCallback((text, onEnd) => {
    if (!window.speechSynthesis) {
        onEnd?.();
        return;
    }
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      onEnd?.();
    };
    utterance.onerror = (err) => {
      console.error('TTS Error:', err);
      setIsSpeaking(false);
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  // ── API: Start Interview ───────────────────────────────────────────────
  const startInterview = useCallback(async () => {
    try {
      setLoading(true);
      const res = await voiceService.start({ jobId });
      const { interviewId: id, text } = res.data;
      setInterviewId(id);
      
      const aiMsg = { role: 'ai', text };
      setMessages([aiMsg]);
      
      // AI speaks greeting
      setTimeout(() => {
        speak(text);
      }, 1000);
      
      setLoading(false);
    } catch (err) {
      setError('Connection failed. Please refresh.');
      toast.error(err.message);
      setLoading(false);
    }
  }, [jobId, speak]);

  useEffect(() => {
    if (jobId) startInterview();
    return () => window.speechSynthesis.cancel();
  }, [jobId, startInterview]);

  // ── Speech to Text (STT) ────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (!recognition) {
      setError('Speech recognition not supported.');
      return;
    }
    if (isSpeaking) return;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) handleUserResponse(transcript);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === 'not-allowed') setError('Mic access denied.');
      else setError('Retry recording.');
    };

    recognition.onend = () => setIsListening(false);

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
    }
  }, [isSpeaking]);

  const stopListening = useCallback(() => {
    if (recognition) recognition.stop();
    setIsListening(false);
  }, []);

  // ── Handle Interaction ──────────────────────────────────────────────────
  const handleUserResponse = async (text) => {
    // 1. Add user message
    const userMsg = { role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);

    try {
      // 2. Call backend for next step
      const lastAiQuestion = messages[messages.length - 1].text;
      const res = await voiceService.next({
        interviewId,
        answer: text,
        question: lastAiQuestion
      });

      const { text: nextText, finished } = res.data;

      // 3. Add AI message
      setMessages((prev) => [...prev, { role: 'ai', text: nextText }]);

      // 4. Speak AI response
      speak(nextText, async () => {
        if (finished) {
          handleEndInterview();
        }
      });

    } catch (err) {
      toast.error('Sync failed: ' + err.message);
      setError('Retry last response.');
    }
  };

  const handleEndInterview = async () => {
    toast.loading('Analyzing your performance...');
    try {
      const res = await voiceService.end({ interviewId });
      setEvaluation(res.data.evaluation);
      toast.success('Interview complete!');
    } catch (err) {
      toast.error('Evaluation failed: ' + err.message);
    }
  };

  return {
    isListening,
    isSpeaking,
    messages,
    loading,
    evaluation,
    error,
    startListening,
    stopListening,
    isFinished: !!evaluation
  };
}
