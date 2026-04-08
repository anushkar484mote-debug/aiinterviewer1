import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/Loaders'
import { toast } from '../hooks/useToast'

export default function AuthPage() {
  const [mode, setMode]   = useState('login') // 'login' | 'signup'
  const [form, setForm]   = useState({ name: '', email: '', password: '', role: 'candidate' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, signup } = useAuth()
  const navigate = useNavigate()

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
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
    <div className="min-h-screen flex items-center justify-center bg-surface-950 px-4 py-12">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-600/8 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-500 shadow-xl shadow-brand-500/30 mb-4">
            <span className="text-white text-xl font-bold">✦</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-surface-50">InterviewAI</h1>
          <p className="text-sm text-surface-400 mt-1">
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        {/* Card */}
        <div className="card p-7">
          {/* Mode toggle */}
          <div className="flex bg-surface-800 rounded-xl p-1 mb-6">
            {['login', 'signup'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium font-body transition-all duration-200 ${
                  mode === m
                    ? 'bg-surface-700 text-surface-50 shadow-sm'
                    : 'text-surface-400 hover:text-surface-200'
                }`}
              >
                {m === 'login' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm mb-5 animate-fade-in">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="animate-fade-in">
                <label className="label">Full name</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Arjun Mehta"
                  value={form.name}
                  onChange={update('name')}
                  autoFocus
                />
              </div>
            )}

            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                className="input"
                placeholder="you@company.com"
                value={form.email}
                onChange={update('email')}
                autoFocus={mode === 'login'}
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={update('password')}
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
                          ? 'bg-brand-500/15 border-brand-500/40 text-brand-300'
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
              className="btn-primary btn w-full mt-2 justify-center py-3"
            >
              {loading ? (
                <><Spinner size="sm" /> {mode === 'login' ? 'Signing in…' : 'Creating account…'}</>
              ) : (
                mode === 'login' ? 'Sign in →' : 'Create account →'
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 pt-5 border-t border-surface-800">
            <p className="text-xs text-surface-500 text-center mb-3 font-mono">Demo accounts</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'HR Demo',    email: 'hr@demo.com',        role: 'HR' },
                { label: 'Candidate',  email: 'candidate@demo.com', role: 'Candidate' },
              ].map((d) => (
                <button
                  key={d.email}
                  type="button"
                  onClick={() => {
                    setMode('login')
                    setForm((f) => ({ ...f, email: d.email, password: 'demo123' }))
                  }}
                  className="flex flex-col items-center px-3 py-2.5 rounded-xl bg-surface-800 border border-surface-700 hover:border-surface-600 transition-all"
                >
                  <span className="text-xs font-medium text-surface-200">{d.label}</span>
                  <span className="text-[10px] text-surface-500 mt-0.5">{d.email}</span>
                </button>
              ))}
            </div>
            <p className="text-center text-[10px] text-surface-600 mt-2">Password: demo123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
