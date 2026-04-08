import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { CandidateLayout } from '../components/Layout'
import { Avatar, SectionHeader, EmptyState, ScoreCard } from '../components/UI'
import { SkeletonCards } from '../components/Loaders'
import { jobService, interviewService } from '../services/api'
import { toast } from '../hooks/useToast'
import { useAuth } from '../context/AuthContext'
import { avgScore, scoreColor, statusBadge, formatDate, truncate } from '../utils/helpers'

export default function CandidateDashboardPage() {
  const [jobs, setJobs]               = useState([])
  const [myInterviews, setMyInterviews] = useState([])
  const [loading, setLoading]         = useState(true)
  const { user }                      = useAuth()
  const navigate                      = useNavigate()

  const fetchData = useCallback(async () => {
    try {
      const [jobsRes, intRes] = await Promise.all([
        jobService.list(),
        interviewService.getMyList(),
      ])
      setJobs(jobsRes.data.jobs || [])
      setMyInterviews(intRes.data.interviews || [])
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  function getInterviewForJob(jobId) {
    return myInterviews.find(
      (i) => (i.jobId?._id || i.jobId) === jobId
    )
  }

  return (
    <CandidateLayout>
      {/* Welcome */}
      <div className="mb-8 animate-fade-up">
        <div className="flex items-center gap-3 mb-1">
          <Avatar name={user?.name} size="lg" />
          <div>
            <h1 className="text-2xl font-display font-bold text-surface-50">
              Welcome back, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-sm text-surface-400">Browse open positions and begin your AI interview</p>
          </div>
        </div>
      </div>

      {/* My completed interviews */}
      {myInterviews.filter((i) => i.completedAt).length > 0 && (
        <div className="mb-8 animate-fade-up" style={{ animationDelay: '0.05s' }}>
          <h2 className="text-xs font-mono text-surface-400 uppercase tracking-widest mb-3">My Interviews</h2>
          <div className="space-y-2.5">
            {myInterviews
              .filter((i) => i.completedAt)
              .map((interview) => (
                <CompletedInterviewCard key={interview._id} interview={interview} />
              ))}
          </div>
        </div>
      )}

      {/* Open positions */}
      <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <SectionHeader
          title="Open Positions"
          subtitle="Click a role to view details and start your interview"
        />

        {loading ? (
          <SkeletonCards count={3} />
        ) : jobs.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No open positions"
            description="Check back soon — new roles will appear here."
          />
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => {
              const existing = getInterviewForJob(job._id)
              const done     = existing?.completedAt
              return (
                <JobListingCard
                  key={job._id}
                  job={job}
                  done={!!done}
                  status={existing?.status}
                  onClick={() => {
                    if (done) return
                    navigate(`/interview/${job._id}`)
                  }}
                />
              )
            })}
          </div>
        )}
      </div>
    </CandidateLayout>
  )
}

// ── Job Listing Card ───────────────────────────────────────────────────────
function JobListingCard({ job, done, status, onClick }) {
  const sb = status ? statusBadge(status) : null

  return (
    <div
      onClick={done ? undefined : onClick}
      className={`card p-5 flex items-start gap-4 transition-all duration-200 ${
        done
          ? 'opacity-60 cursor-default'
          : 'card-hover'
      }`}
    >
      <div className="w-11 h-11 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-xl shrink-0">
        💼
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <h3 className="text-sm font-display font-semibold text-surface-100">{job.title}</h3>
          <div className="flex items-center gap-2">
            {sb && <span className={`badge ${sb.cls}`}>{sb.label}</span>}
            {done && (
              <span className="badge badge-neutral">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Done
              </span>
            )}
          </div>
        </div>
        <p className="text-xs text-surface-400 mt-1">{truncate(job.description, 100)}</p>
        <div className="flex items-center gap-4 mt-2.5">
          <span className="text-xs text-surface-500">
            📋 {job.questions?.length || 5} questions
          </span>
          <span className="text-xs text-surface-500">
            ⏱ ~{(job.questions?.length || 5) * 3} min
          </span>
          <span className="text-xs text-surface-500">
            📅 {formatDate(job.createdAt)}
          </span>
        </div>
      </div>

      {!done && (
        <div className="shrink-0 self-center">
          <span className="btn btn-primary btn-sm">
            Start →
          </span>
        </div>
      )}
    </div>
  )
}

// ── Completed Interview Card ───────────────────────────────────────────────
function CompletedInterviewCard({ interview }) {
  const job    = interview.jobId
  const avg    = avgScore(interview.scores)
  const status = statusBadge(interview.status)

  return (
    <div className="card p-4 flex items-center gap-4">
      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-base shrink-0">
        ✅
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-surface-200">{job?.title || 'Unknown role'}</p>
          <span className={`badge ${status.cls}`}>{status.label}</span>
        </div>
        <p className="text-xs text-surface-500 mt-0.5">
          Submitted {formatDate(interview.completedAt)}
        </p>
      </div>
      {avg != null && (
        <div className="text-center shrink-0">
          <div className={`text-xl font-display font-bold ${scoreColor(avg)}`}>{avg}</div>
          <div className="text-[10px] text-surface-500">avg score</div>
        </div>
      )}
    </div>
  )
}
