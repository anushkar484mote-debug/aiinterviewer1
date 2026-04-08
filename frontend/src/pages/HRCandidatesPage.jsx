import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { HRLayout } from '../components/Layout'
import { Avatar, SectionHeader, EmptyState } from '../components/UI'
import { SkeletonCards } from '../components/Loaders'
import { interviewService, jobService } from '../services/api'
import { toast } from '../hooks/useToast'
import { avgScore, scoreColor, statusBadge, formatDate, timeAgo } from '../utils/helpers'

export default function HRCandidatesPage() {
  const [interviews, setInterviews] = useState([])
  const [jobs, setJobs]             = useState([])
  const [loading, setLoading]       = useState(true)
  const [filterJob, setFilterJob]   = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const navigate = useNavigate()

  const fetchData = useCallback(async () => {
    try {
      // Fetch all jobs first, then fetch interviews per job
      const jobsRes = await jobService.list()
      const allJobs = jobsRes.data.jobs || []
      setJobs(allJobs)

      const allInterviews = []
      await Promise.all(
        allJobs.map(async (job) => {
          try {
            const res = await interviewService.getByJob(job._id)
            const enriched = (res.data.interviews || []).map((i) => ({
              ...i,
              jobTitle: job.title,
            }))
            allInterviews.push(...enriched)
          } catch { /* skip if no interviews */ }
        })
      )

      // Sort by completedAt desc
      allInterviews.sort((a, b) => new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt))
      setInterviews(allInterviews)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = interviews.filter((i) => {
    const jobMatch    = filterJob === 'all' || i.jobId === filterJob || i.jobId?._id === filterJob
    const statusMatch = filterStatus === 'all' || i.status === filterStatus
    return jobMatch && statusMatch
  })

  const statusCounts = {
    all:         interviews.length,
    pending:     interviews.filter((i) => i.status === 'pending').length,
    shortlisted: interviews.filter((i) => i.status === 'shortlisted').length,
    rejected:    interviews.filter((i) => i.status === 'rejected').length,
  }

  return (
    <HRLayout>
      <SectionHeader
        title="Candidates"
        subtitle={`${interviews.length} submission${interviews.length !== 1 ? 's' : ''}`}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        {/* Status tabs */}
        <div className="flex bg-surface-900 border border-surface-800 rounded-xl p-1 gap-1">
          {['all', 'pending', 'shortlisted', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium font-body capitalize transition-all ${
                filterStatus === s
                  ? 'bg-surface-700 text-surface-50'
                  : 'text-surface-500 hover:text-surface-300'
              }`}
            >
              {s} <span className="ml-1 opacity-60">({statusCounts[s]})</span>
            </button>
          ))}
        </div>

        {/* Job filter */}
        {jobs.length > 1 && (
          <select
            value={filterJob}
            onChange={(e) => setFilterJob(e.target.value)}
            className="select py-2 text-xs w-auto max-w-xs"
          >
            <option value="all">All roles</option>
            {jobs.map((j) => (
              <option key={j._id} value={j._id}>{j.title}</option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <SkeletonCards count={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No candidates yet"
          description="Share your interview links with candidates to start receiving submissions."
        />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((interview) => (
            <CandidateRow
              key={interview._id}
              interview={interview}
              onClick={() => navigate(`/hr/candidates/${interview._id}`)}
            />
          ))}
        </div>
      )}
    </HRLayout>
  )
}

// ── Candidate Row ──────────────────────────────────────────────────────────
function CandidateRow({ interview, onClick }) {
  const name   = interview.candidateId?.name || 'Unknown'
  const email  = interview.candidateId?.email || ''
  const avg    = avgScore(interview.scores)
  const status = statusBadge(interview.status)

  return (
    <button
      onClick={onClick}
      className="card-hover w-full text-left p-4 flex items-center gap-4"
    >
      <Avatar name={name} size="md" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-surface-100">{name}</span>
          <span className={`badge ${status.cls}`}>{status.label}</span>
          {interview.recommendation && (
            <span className={`badge ${
              interview.recommendation === 'hire'   ? 'badge-success' :
              interview.recommendation === 'reject' ? 'badge-danger' :
              'badge-warning'
            }`}>
              AI: {interview.recommendation}
            </span>
          )}
        </div>
        <p className="text-xs text-surface-400 mt-0.5 truncate">
          {email} · {interview.jobTitle || 'Unknown role'}
        </p>
        <p className="text-xs text-surface-600 mt-0.5">
          {interview.completedAt ? `Completed ${timeAgo(interview.completedAt)}` : 'In progress'}
        </p>
      </div>

      {/* Scores */}
      <div className="hidden sm:flex items-center gap-3 shrink-0">
        {interview.scores && Object.entries(interview.scores)
          .filter(([, v]) => v != null)
          .map(([key, val]) => (
            <div key={key} className="text-center">
              <div className={`text-lg font-display font-bold ${scoreColor(val)}`}>{val}</div>
              <div className="text-[9px] text-surface-500 capitalize">{key.slice(0, 4)}</div>
            </div>
          ))
        }
        {avg != null && (
          <div className="text-center ml-2 pl-3 border-l border-surface-700">
            <div className={`text-xl font-display font-bold ${scoreColor(avg)}`}>{avg}</div>
            <div className="text-[9px] text-surface-500">avg</div>
          </div>
        )}
      </div>

      <svg className="w-4 h-4 text-surface-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </button>
  )
}
