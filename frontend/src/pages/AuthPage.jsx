import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/Loaders'
import { toast } from '../hooks/useToast'

export default function AuthPage() {
  const [mode, setMode]   = useState('login')
  const [form, setForm]   = useState({ name: '', email: '', password: '', role: 'candidate' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, signup } = useAuth()
  const navigate = useNavigate()

  // Memoized change handler to prevent function recreation on every render
  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (loading) return
    setError('')

    if (mode === 'signup' && !form.name.trim()) {
      return setError('Full name is required.')
    }
    if (!form.email || !form.password) {
      return setError('Email and password are required.')
    }

    setLoading(true)
    try {
      const user = mode === 'login'
        ? await login({ email: form.email, password: form.password })
        : await signup(form)

      toast.success(`Welcome${mode === 'signup' ? ', ' + user.name.split(' ')[0] : ' back'}!`)
      navigate(user.role === 'hr' ? '/hr/jobs' : '/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 px-4 py-12 overflow-hidden relative">
      {/* Optimized Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-600/5 rounded-full blur-[100px]" 
          style={{ willChange: 'transform, opacity' }}
        />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-500 shadow-xl shadow-brand-500/30 mb-4 transition-transform hover:scale-105 active:scale-95 cursor-default">
            <span className="text-white text-xl font-bold">✦</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-surface-50">InterviewAI</h1>
          <p className="text-sm text-surface-400 mt-1">
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        {/* Card */}
        <div className="card p-7 shadow-2xl shadow-black/40">
          {/* Mode toggle */}
          <div className="flex bg-surface-800 rounded-xl p-1 mb-6 border border-surface-700/50">
            {['login', 'signup'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  mode === m
                    ? 'bg-surface-700 text-surface-50 shadow-sm border border-surface-600'
                    : 'text-surface-400 hover:text-surface-200'
                }`}
              >
                {m === 'login' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm mb-5 animate-slide-in">
              <span className="shrink-0 text-red-400">⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <div className="animate-fade-in">
                <label className="label">Full name</label>
                <input
                  name="name"
                  type="text"
                  className="input"
                  placeholder="Arjun Mehta"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>
            )}

            <div>
              <label className="label">Email address</label>
              <input
                name="email"
                type="email"
                className="input"
                placeholder="you@company.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                name="password"
                type="password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {mode === 'signup' && (
              <div className="animate-fade-in">
                <label className="label">I am a</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: 'candidate', icon: '👤', label: 'Candidate' },
                    { val: 'hr',        icon: '🏢', label: 'HR / Recruiter' },
                  ].map(({ val, icon, label }) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, role: val }))}
                      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150 ${
                        form.role === val
                          ? 'bg-brand-500/15 border-brand-500/40 text-brand-300 ring-2 ring-brand-500/10'
                          : 'bg-surface-800 border-surface-700 text-surface-400 hover:border-surface-600 hover:text-surface-200'
                      }`}
                    >
                      <span className="text-base">{icon}</span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary btn w-full mt-2 justify-center py-3.5 text-base font-bold tracking-tight shadow-brand-500/10"
            >
              {loading ? (
                <><Spinner size="sm" /> {mode === 'login' ? 'Signing in…' : 'Creating account…'}</>
              ) : (
                mode === 'login' ? 'Sign in →' : 'Create account →'
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-8 pt-5 border-t border-white/5">
            <p className="text-xs text-surface-500 text-center mb-4 uppercase tracking-widest font-bold">Quick Demo</p>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: 'HR Demo',    email: 'hr@demo.com' },
                { label: 'Candidate',  email: 'candidate@demo.com' },
              ].map((d) => (
                <button
                  key={d.email}
                  type="button"
                  onClick={() => {
                    setMode('login')
                    setForm({ ...form, email: d.email, password: 'demo123' })
                  }}
                  className="flex flex-col items-center px-3 py-3 rounded-xl bg-surface-800/50 border border-surface-700/50 hover:bg-surface-700/50 hover:border-brand-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-black/5"
                >
                  <span className="text-[11px] font-bold text-surface-200 mb-0.5">{d.label}</span>
                  <span className="text-[10px] text-surface-500">{d.email}</span>
                </button>
              ))}
            </div>
            <p className="text-center text-[10px] text-surface-600 mt-3 font-mono">PWD: demo123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
