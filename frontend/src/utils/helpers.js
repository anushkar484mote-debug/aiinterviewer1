/**
 * utils/helpers.js
 * Shared utility functions used across the app.
 */

/** Return initials from a full name */
export function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

/** Format ISO date string to readable form */
export function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

/** Format ISO date to relative time */
export function timeAgo(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

/** Average of an object's numeric values */
export function avgScore(scores = {}) {
  const vals = Object.values(scores).filter((v) => typeof v === 'number')
  if (!vals.length) return null
  return +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
}

/** Color class based on score 0-10 */
export function scoreColor(score) {
  if (score == null) return 'text-surface-500'
  if (score >= 7.5)  return 'text-emerald-400'
  if (score >= 5)    return 'text-amber-400'
  return 'text-red-400'
}

/** Border color class for score cards */
export function scoreBorderColor(score) {
  if (score == null) return 'border-surface-700'
  if (score >= 7.5)  return 'border-emerald-500/30'
  if (score >= 5)    return 'border-amber-500/30'
  return 'border-red-500/30'
}

/** Background color class for score cards */
export function scoreBgColor(score) {
  if (score == null) return 'bg-surface-800'
  if (score >= 7.5)  return 'bg-emerald-500/10'
  if (score >= 5)    return 'bg-amber-500/10'
  return 'bg-red-500/10'
}

/** Recommendation badge variant */
export function recBadge(rec) {
  const map = {
    hire:   { cls: 'badge-success', label: 'Hire',   icon: '✓' },
    maybe:  { cls: 'badge-warning', label: 'Maybe',  icon: '~' },
    reject: { cls: 'badge-danger',  label: 'Reject', icon: '✕' },
  }
  return map[rec] || { cls: 'badge-neutral', label: rec || 'Pending', icon: '?' }
}

/** Status badge variant */
export function statusBadge(status) {
  const map = {
    pending:     { cls: 'badge-neutral', label: 'Pending' },
    shortlisted: { cls: 'badge-success', label: 'Shortlisted' },
    rejected:    { cls: 'badge-danger',  label: 'Rejected' },
  }
  return map[status] || { cls: 'badge-neutral', label: status || '—' }
}

/** Build a shareable candidate interview URL */
export function interviewLink(jobId) {
  return `${window.location.origin}/interview/${jobId}`
}

/** Copy text to clipboard and return success boolean */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/** Truncate text to max length */
export function truncate(str = '', len = 80) {
  return str.length > len ? str.slice(0, len) + '…' : str
}
