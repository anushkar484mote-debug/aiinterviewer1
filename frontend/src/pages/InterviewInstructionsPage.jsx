import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CandidateLayout } from '../components/Layout'
import { Spinner, PageLoader } from '../components/Loaders'
import { jobService, interviewService } from '../services/api'
import { toast } from '../hooks/useToast'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../utils/helpers'

const TIPS = [
  {
    icon: '💬',
    title: 'Be specific and detailed',
    desc: 'Use real examples from your experience. Vague answers score lower than concrete ones.',
  },
  {
    icon: '⏱',
    title: 'Take your time',
    desc: 'There is no timer per question. Think through your answer before typing.',
  },
  {
    icon: '🤖',
    title: 'Expect AI follow-ups',
    desc: 'After some answers, the AI may ask a deeper follow-up. You can skip it.',
  },
  {
    icon: '📝',
    title: 'Write in full sentences',
    desc: 'Clear, structured writing signals strong communication to the evaluator.',
  },
]

export default function InterviewInstructionsPage() {
  const { jobId }     = useParams()
  const navigate      = useNavigate()
  const { user }      = useAuth()
  const [job, setJob]           = useState(null)
  const [loading, setLoading]   = useState(true)
  const [starting, setStarting] = useState(false)
  const [interviewId, setInterviewId] = useState(null)

  const fetchJob = useCallback(async () => {
    try {
      const res = await jobService.getById(jobId)
      setJob(res.data.job)

      // Pre-create the interview session so it's ready
      try {
        const intRes = await interviewService.start({ jobId })
        setInterviewId(intRes.data.interview._id)
        // If already completed, redirect to dashboard
        if (intRes.data.interview.completedAt) {
          toast.warn('You have already completed this interview.')
          navigate('/dashboard')
        }
      } catch (err) {
        if (err.message?.includes('already completed')) {
          toast.warn('You have already completed this interview.')
          navigate('/dashboard')
        }
        // Other errors: still allow them to view instructions
      }
    } catch (err) {
      toast.error('Interview not found.')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }, [jobId, navigate])

  useEffect(() => { fetchJob() }, [fetchJob])

  function handleStart() {
    if (!interviewId) {
      toast.error('Session not ready. Please try again.')
      return
    }
    // Store interviewId in session storage for the interview page
    // Navigate to the new stable voice interview
    navigate(`/stable/${jobId}`)
  }

  if (loading) return <CandidateLayout><PageLoader /></CandidateLayout>
  if (!job)    return null

  return (
    <CandidateLayout>
      <div className="max-w-2xl mx-auto animate-fade-up">

        {/* Job info */}
        <div className="card p-6 mb-5 border-brand-500/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-2xl shrink-0">
              💼
            </div>
            <div>
              <p className="text-xs font-mono text-brand-400 uppercase tracking-widest mb-1">
                You are applying for
              </p>
              <h1 className="text-xl font-display font-bold text-surface-50">{job.title}</h1>
              {job.description && (
                <p className="text-sm text-surface-400 mt-1.5 leading-relaxed">{job.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3">
                <span className="text-xs text-surface-500">📋 AI Conversational</span>
                <span className="text-xs text-surface-500">⏱ ~15 min estimated</span>
                <span className="text-xs text-surface-500">🎙️ Voice-based</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="card p-6 mb-5">
          <h2 className="text-sm font-display font-semibold text-surface-200 mb-4">
            Before you begin
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {TIPS.map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-surface-800 flex items-center justify-center text-base shrink-0">
                  {icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-surface-200">{title}</p>
                  <p className="text-xs text-surface-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What happens after */}
        <div className="px-5 py-4 rounded-xl bg-surface-900 border border-surface-800 mb-7">
          <div className="flex items-start gap-3">
            <span className="text-brand-400 text-sm mt-0.5">✦</span>
            <div>
              <p className="text-sm font-medium text-surface-200">AI-powered evaluation</p>
              <p className="text-xs text-surface-400 mt-0.5 leading-relaxed">
                After you submit, our AI will evaluate your answers on communication,
                technical depth, and confidence. The hiring team reviews these scores
                and will reach out with their decision.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-ghost"
          >
            ← Back to jobs
          </button>
          <button
            onClick={handleStart}
            disabled={starting || !interviewId}
            className="btn-primary btn btn-lg"
          >
            {starting || !interviewId ? (
              <><Spinner size="sm" />Preparing…</>
            ) : (
              'Begin Interview →'
            )}
          </button>
        </div>
      </div>
    </CandidateLayout>
  )
}
