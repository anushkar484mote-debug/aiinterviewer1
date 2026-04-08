import { useState, useEffect, useCallback } from 'react'
import { HRLayout } from '../components/Layout'
import { SectionHeader, EmptyState, CopyButton } from '../components/UI'
import { SkeletonCards, Spinner } from '../components/Loaders'
import { jobService, aiService } from '../services/api'
import { toast } from '../hooks/useToast'
import { formatDate, interviewLink, truncate } from '../utils/helpers'

export default function HRJobsPage() {
  const [jobs, setJobs]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)

  const fetchJobs = useCallback(async () => {
    try {
      const res = await jobService.list()
      setJobs(res.data.jobs || [])
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  function onJobCreated(job) {
    setJobs((prev) => [job, ...prev])
    setShowForm(false)
    toast.success('Job role created!')
  }

  return (
    <HRLayout>
      <SectionHeader
        title="Job Roles"
        subtitle={`${jobs.length} active position${jobs.length !== 1 ? 's' : ''}`}
        action={
          <button
            className="btn-primary btn"
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                Cancel
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                New Role
              </>
            )}
          </button>
        }
      />

      {showForm && (
        <div className="mb-6 animate-fade-up">
          <CreateJobForm onSuccess={onJobCreated} />
        </div>
      )}

      {loading ? (
        <SkeletonCards count={3} />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon="💼"
          title="No job roles yet"
          description="Create your first role and share the interview link with candidates."
          action={<button className="btn-primary btn" onClick={() => setShowForm(true)}>Create first role</button>}
        />
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      )}
    </HRLayout>
  )
}

// ── Create Job Form ────────────────────────────────────────────────────────
function CreateJobForm({ onSuccess }) {
  const [form, setForm]             = useState({ title: '', description: '' })
  const [questions, setQuestions]   = useState([])
  const [editingQ, setEditingQ]     = useState(null)
  const [saving, setSaving]         = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError]           = useState('')

  function update(k) { return (e) => setForm((f) => ({ ...f, [k]: e.target.value })) }

  async function generateQuestions() {
    if (!form.title.trim()) return setError('Enter a job title before generating.')
    setError('')
    setGenerating(true)
    try {
      const res = await aiService.generateQuestions({
        title: form.title,
        description: form.description,
        count: 5,
      })
      setQuestions(res.data.questions || [])
      toast.success('5 questions generated!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setGenerating(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) return setError('Job title is required.')
    setSaving(true)
    setError('')
    try {
      const finalQuestions = questions.length ? questions : [
        `Tell me about your experience relevant to ${form.title}.`,
        `What are your key strengths for this ${form.title} role?`,
        'Describe a challenging situation you handled.',
        'How do you approach problem-solving under pressure?',
        `Where do you see yourself in 5 years as a ${form.title}?`,
      ]
      const res = await jobService.create({
        ...form,
        questions: finalQuestions,
        evaluationCriteria: { communication: true, technical: true, confidence: true },
      })
      onSuccess(res.data.job)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card p-6 border-brand-500/20 bg-brand-500/3">
      <h3 className="text-base font-display font-semibold text-surface-50 mb-5">Create New Role</h3>

      {error && (
        <div className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Job Title *</label>
            <input type="text" className="input" placeholder="e.g. Senior Frontend Engineer" value={form.title} onChange={update('title')} />
          </div>
          <div>
            <label className="label">Description</label>
            <input type="text" className="input" placeholder="Brief role description…" value={form.description} onChange={update('description')} />
          </div>
        </div>

        {/* AI Question Generation */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="label mb-0">Interview Questions</label>
            <button
              type="button"
              onClick={generateQuestions}
              disabled={generating}
              className="btn btn-secondary btn-sm gap-1.5"
            >
              {generating ? (
                <><Spinner size="sm" />Generating…</>
              ) : (
                <>
                  <span className="text-brand-400">✦</span>
                  Generate with AI
                </>
              )}
            </button>
          </div>

          {questions.length > 0 ? (
            <div className="bg-surface-900 rounded-xl border border-surface-700 divide-y divide-surface-800">
              {questions.map((q, i) => (
                <div key={i} className="px-4 py-3 flex items-start gap-3 group">
                  <span className="text-xs font-mono text-surface-500 mt-0.5 w-5 shrink-0">Q{i + 1}</span>
                  {editingQ === i ? (
                    <input
                      type="text"
                      className="input text-xs py-1.5 flex-1"
                      value={q}
                      onChange={(e) => {
                        const updated = [...questions]
                        updated[i] = e.target.value
                        setQuestions(updated)
                      }}
                      onBlur={() => setEditingQ(null)}
                      autoFocus
                    />
                  ) : (
                    <p
                      className="text-sm text-surface-300 flex-1 cursor-text hover:text-surface-100 transition-colors"
                      onClick={() => setEditingQ(i)}
                    >
                      {q}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setQuestions(questions.filter((_, idx) => idx !== i))}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-surface-500 hover:text-red-400"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <div className="px-4 py-2">
                <p className="text-[10px] text-surface-500">Click any question to edit. AI-generated — review before publishing.</p>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-surface-700 rounded-xl px-5 py-6 text-center">
              <p className="text-sm text-surface-500">Click "Generate with AI" to create questions,</p>
              <p className="text-sm text-surface-500">or default questions will be used.</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={saving} className="btn-primary btn gap-2">
            {saving ? <><Spinner size="sm" />Creating…</> : 'Create Job Role →'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ── Job Card ───────────────────────────────────────────────────────────────
function JobCard({ job }) {
  const link = interviewLink(job._id)

  return (
    <div className="card p-5 flex flex-col sm:flex-row gap-4">
      <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-lg shrink-0">
        💼
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-3 justify-between">
          <div>
            <h3 className="text-sm font-display font-semibold text-surface-100">{job.title}</h3>
            <p className="text-xs text-surface-400 mt-0.5">{truncate(job.description, 90)}</p>
          </div>
          <span className="badge-neutral badge shrink-0">
            {job.questions?.length || 0}q
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-4 mt-3">
          <span className="text-xs text-surface-500">
            {job.applicantCount != null ? `${job.applicantCount} applicant${job.applicantCount !== 1 ? 's' : ''}` : ''}
          </span>
          <span className="text-xs text-surface-600">Created {formatDate(job.createdAt)}</span>
        </div>
        {/* Interview link */}
        <div className="flex items-center gap-2 mt-3 p-2.5 rounded-xl bg-surface-800 border border-surface-700">
          <code className="text-xs text-brand-300 flex-1 truncate font-mono">{link}</code>
          <CopyButton text={link} label="Copy link" />
        </div>
      </div>
    </div>
  )
}
