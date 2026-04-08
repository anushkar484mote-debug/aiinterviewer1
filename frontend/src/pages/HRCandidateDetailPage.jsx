import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { HRLayout } from '../components/Layout'
import { Avatar, ScoreCard, EmptyState, ConfirmModal } from '../components/UI'
import { Spinner, PageLoader } from '../components/Loaders'
import { interviewService } from '../services/api'
import { toast } from '../hooks/useToast'
import {
  avgScore, scoreColor, scoreBorderColor, recBadge,
  statusBadge, formatDate, timeAgo,
} from '../utils/helpers'

export default function HRCandidateDetailPage() {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [confirm, setConfirm]   = useState(null) // { action, label }

  const fetchInterview = useCallback(async () => {
    try {
      const res = await interviewService.getById(id)
      setData(res.data.interview)
    } catch (err) {
      toast.error(err.message)
      navigate('/hr/candidates')
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  useEffect(() => { fetchInterview() }, [fetchInterview])

  async function handleStatus(status) {
    setActionLoading(true)
    try {
      const res = await interviewService.updateStatus(id, status)
      setData((prev) => ({ ...prev, status: res.data.interview.status }))
      toast.success(`Candidate ${status === 'shortlisted' ? 'shortlisted ✓' : 'rejected'}`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setActionLoading(false)
      setConfirm(null)
    }
  }

  if (loading) return <HRLayout><PageLoader /></HRLayout>
  if (!data)   return null

  const candidate = data.candidateId
  const job       = data.jobId
  const avg       = avgScore(data.scores)
  const rec       = recBadge(data.recommendation)
  const status    = statusBadge(data.status)

  return (
    <HRLayout>
      {/* Back + header */}
      <div className="flex items-start gap-4 mb-6">
        <button
          onClick={() => navigate('/hr/candidates')}
          className="btn btn-ghost btn-sm mt-0.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <Avatar name={candidate?.name} size="lg" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-display font-bold text-surface-50">
                  {candidate?.name || 'Unknown'}
                </h1>
                <span className={`badge ${status.cls}`}>{status.label}</span>
                {data.recommendation && (
                  <span className={`badge ${rec.cls}`}>
                    {rec.icon} AI: {rec.label}
                  </span>
                )}
              </div>
              <p className="text-sm text-surface-400 mt-0.5">
                {candidate?.email} · {job?.title || 'Unknown role'}
              </p>
              {data.completedAt && (
                <p className="text-xs text-surface-600 mt-0.5">
                  Completed {formatDate(data.completedAt)} ({timeAgo(data.completedAt)})
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 shrink-0">
          <button
            disabled={actionLoading || data.status === 'shortlisted'}
            onClick={() => setConfirm({ action: 'shortlisted', label: 'Shortlist' })}
            className="btn btn-success"
          >
            {actionLoading ? <Spinner size="sm" /> : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
            Shortlist
          </button>
          <button
            disabled={actionLoading || data.status === 'rejected'}
            onClick={() => setConfirm({ action: 'rejected', label: 'Reject' })}
            className="btn btn-danger"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Reject
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left column - scores + feedback */}
        <div className="lg:col-span-1 space-y-4">

          {/* Score cards */}
          {data.scores && (
            <div className="card p-5">
              <h2 className="text-xs font-mono text-surface-400 uppercase tracking-widest mb-4">Scores</h2>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {Object.entries(data.scores)
                  .filter(([, v]) => v != null)
                  .map(([key, val]) => (
                    <ScoreCard key={key} label={key} score={val} />
                  ))}
              </div>
              {avg != null && (
                <div className={`flex items-center justify-between px-3 py-2 rounded-xl border ${scoreBorderColor(avg)} bg-surface-800/50`}>
                  <span className="text-xs text-surface-400">Overall average</span>
                  <span className={`text-2xl font-display font-bold ${scoreColor(avg)}`}>{avg}</span>
                </div>
              )}
            </div>
          )}

          {/* AI Summary */}
          {data.feedback && (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-brand-400 text-sm">✦</span>
                <h2 className="text-xs font-mono text-surface-400 uppercase tracking-widest">AI Summary</h2>
              </div>
              <p className="text-sm text-surface-300 leading-relaxed">{data.feedback}</p>
            </div>
          )}

          {/* Strengths & Weaknesses */}
          {(data.strengths?.length > 0 || data.weaknesses?.length > 0) && (
            <div className="card p-5 space-y-4">
              {data.strengths?.length > 0 && (
                <div>
                  <h3 className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-2.5">Strengths</h3>
                  <ul className="space-y-1.5">
                    {data.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-surface-300">
                        <svg className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {data.weaknesses?.length > 0 && (
                <div>
                  <h3 className="text-xs font-mono text-amber-400 uppercase tracking-widest mb-2.5">Areas to Improve</h3>
                  <ul className="space-y-1.5">
                    {data.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-surface-300">
                        <svg className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column - transcript */}
        <div className="lg:col-span-2">
          <div className="card p-5">
            <h2 className="text-xs font-mono text-surface-400 uppercase tracking-widest mb-5">Interview Transcript</h2>

            {!data.answers?.length ? (
              <EmptyState icon="📝" title="No answers recorded" description="This interview has no submitted answers." />
            ) : (
              <div className="space-y-5">
                {data.answers.map((a, i) => (
                  <TranscriptEntry key={i} index={i} answer={a} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm modal */}
      <ConfirmModal
        open={!!confirm}
        title={`${confirm?.label} this candidate?`}
        description={
          confirm?.action === 'shortlisted'
            ? 'This will move the candidate to your shortlist.'
            : 'This will mark the candidate as rejected. This can be undone.'
        }
        confirmLabel={confirm?.label}
        danger={confirm?.action === 'rejected'}
        onConfirm={() => handleStatus(confirm.action)}
        onCancel={() => setConfirm(null)}
      />
    </HRLayout>
  )
}

// ── Transcript Entry ───────────────────────────────────────────────────────
function TranscriptEntry({ index, answer }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="border border-surface-800 rounded-xl overflow-hidden">
      {/* Question header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-surface-800/50 hover:bg-surface-800 transition-colors text-left"
      >
        <span className="text-xs font-mono text-surface-500 w-6 shrink-0">Q{index + 1}</span>
        <p className="text-sm font-medium text-surface-200 flex-1">{answer.question}</p>
        <svg
          className={`w-4 h-4 text-surface-500 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="px-4 py-3 space-y-3 animate-fade-in">
          {/* Answer */}
          <div className="pl-3 border-l-2 border-brand-500/40">
            <p className="text-[10px] text-surface-500 mb-1 font-mono uppercase tracking-wide">Answer</p>
            <p className="text-sm text-surface-300 leading-relaxed">
              {answer.answer || <span className="text-surface-600 italic">No answer provided</span>}
            </p>
          </div>

          {/* Follow-up */}
          {answer.followUp && (
            <>
              <div className="flex items-center gap-2 px-3">
                <div className="flex-1 h-px bg-surface-800" />
                <span className="text-[10px] font-mono text-surface-500">AI follow-up</span>
                <div className="flex-1 h-px bg-surface-800" />
              </div>
              <div className="pl-3 border-l-2 border-surface-600/40">
                <p className="text-xs text-brand-300 mb-1">↩ {answer.followUp}</p>
              </div>
              {answer.followUpAnswer && (
                <div className="pl-3 border-l-2 border-surface-600/40">
                  <p className="text-[10px] text-surface-500 mb-1 font-mono uppercase tracking-wide">Follow-up answer</p>
                  <p className="text-sm text-surface-300 leading-relaxed">{answer.followUpAnswer}</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
