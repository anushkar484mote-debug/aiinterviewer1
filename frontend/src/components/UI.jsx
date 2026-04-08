import { getInitials, scoreColor, scoreBorderColor, scoreBgColor } from '../utils/helpers'

/** Avatar circle with initials fallback */
export function Avatar({ name = '', size = 'md', className = '' }) {
  const sizes = {
    sm:  'w-7 h-7 text-xs',
    md:  'w-9 h-9 text-sm',
    lg:  'w-11 h-11 text-base',
    xl:  'w-14 h-14 text-lg',
  }
  return (
    <div className={`${sizes[size]} rounded-xl bg-brand-500/15 border border-brand-500/25 flex items-center justify-center font-display font-semibold text-brand-300 shrink-0 ${className}`}>
      {getInitials(name)}
    </div>
  )
}

/** Score display card */
export function ScoreCard({ label, score }) {
  return (
    <div className={`score-pill ${scoreBorderColor(score)} ${scoreBgColor(score)}`}>
      <span className={`text-xl font-display font-bold ${scoreColor(score)}`}>
        {score ?? '—'}
      </span>
      <span className="text-[10px] font-mono text-surface-400 mt-0.5 capitalize leading-tight text-center">
        {label}
      </span>
    </div>
  )
}

/** Progress bar */
export function ProgressBar({ value, max, label, className = '' }) {
  const pct = max ? Math.round((value / max) * 100) : 0
  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-surface-400 font-body">{label}</span>
          <span className="text-xs font-mono text-surface-300">{pct}%</span>
        </div>
      )}
      <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

/** Step-by-step progress dots */
export function StepProgress({ current, total }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i < current
              ? 'bg-emerald-400 w-4'
              : i === current
              ? 'bg-brand-400 w-6'
              : 'bg-surface-700 w-2'
          }`}
        />
      ))}
    </div>
  )
}

/** Empty state with icon and call to action */
export function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-800 border border-surface-700 flex items-center justify-center text-2xl mb-4">
        {icon}
      </div>
      <h3 className="text-base font-display font-semibold text-surface-200 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-surface-400 max-w-sm mb-5">{description}</p>
      )}
      {action}
    </div>
  )
}

/** Confirmation modal dialog */
export function ConfirmModal({ open, title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel, danger = false }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="card p-6 max-w-sm w-full animate-fade-up shadow-2xl">
        <h3 className="text-base font-display font-semibold text-surface-100 mb-2">{title}</h3>
        {description && <p className="text-sm text-surface-400 mb-6">{description}</p>}
        <div className="flex gap-3 justify-end">
          <button className="btn-secondary btn-sm" onClick={onCancel}>{cancelLabel}</button>
          <button className={danger ? 'btn-danger btn btn-sm' : 'btn-primary btn btn-sm'} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

/** Section heading with optional action */
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h2 className="text-xl font-display font-semibold text-surface-50">{title}</h2>
        {subtitle && <p className="text-sm text-surface-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

/** Horizontal divider with optional label */
export function Divider({ label }) {
  if (!label) return <hr className="border-surface-800 my-4" />
  return (
    <div className="flex items-center gap-3 my-5">
      <hr className="flex-1 border-surface-800" />
      <span className="text-xs text-surface-500 font-mono">{label}</span>
      <hr className="flex-1 border-surface-800" />
    </div>
  )
}

/** Copy-to-clipboard button */
export function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <button
      onClick={handleCopy}
      className={`btn btn-secondary btn-sm gap-1.5 transition-all ${copied ? 'text-emerald-400 border-emerald-500/30' : ''}`}
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
          </svg>
          {label}
        </>
      )}
    </button>
  )
}

// Need useState for CopyButton
import { useState } from 'react'
