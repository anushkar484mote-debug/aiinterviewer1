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

  // Simplified change handler
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    if (e) e.preventDefault()
    if (loading) return
    setError('')

    const isLogin = mode === 'login'
    
    if (!isLogin && !form.name.trim()) {
      return setError('Full name is required.')
    }
    if (!form.email || !form.password) {
      return setError('Email and password are required.')
    }

    setLoading(true)
    try {
      const user = isLogin
        ? await login({ email: form.email, password: form.password })
        : await signup(form)

      toast.success(`Welcome back!`)
      // Wait a tiny bit to ensure state is committed
      setTimeout(() => {
        navigate(user.role === 'hr' ? '/hr/jobs' : '/dashboard', { replace: true })
      }, 100)
    } catch (err) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500 shadow-2xl shadow-brand-500/20 mb-4">
            <span className="text-white text-2xl font-bold">✦</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">InterviewAI</h1>
          <p className="text-surface-400 mt-2">
            {mode === 'login' ? 'Sign in to continue' : 'Start your journey today'}
          </p>
        </div>

        <div className="card p-8 border border-white/5 shadow-2xl">
          <div className="flex bg-surface-800 rounded-xl p-1 mb-8">
            <button
              onClick={() => { setMode('login'); setError('') }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'login' ? 'bg-surface-700 text-white shadow-sm' : 'text-surface-400'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError('') }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'signup' ? 'bg-surface-700 text-white shadow-sm' : 'text-surface-400'}`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6 flex items-center gap-3">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <div>
                <label className="label">Full Name</label>
                <input
                  name="name"
                  type="text"
                  className="input"
                  placeholder="Arjun Mehta"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div>
              <label className="label">Email</label>
              <input
                name="email"
                type="email"
                className="input"
                placeholder="arjun@example.com"
                value={form.email}
                onChange={handleChange}
                required
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
                required
              />
            </div>

            {mode === 'signup' && (
              <div className="space-y-3">
                <label className="label">I am a...</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, role: 'candidate' }))}
                    className={`p-3 rounded-xl border text-sm font-bold transition-all ${form.role === 'candidate' ? 'bg-brand-500/10 border-brand-500 text-brand-400' : 'bg-surface-800 border-surface-700 text-surface-500'}`}
                  >
                    Candidate
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, role: 'hr' }))}
                    className={`p-3 rounded-xl border text-sm font-bold transition-all ${form.role === 'hr' ? 'bg-brand-500/10 border-brand-500 text-brand-400' : 'bg-surface-800 border-surface-700 text-surface-500'}`}
                  >
                    HR / Recruiter
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              {loading ? <Spinner size="sm" /> : (mode === 'login' ? 'Continue →' : 'Create Account')}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
             <p className="text-[10px] text-surface-500 uppercase tracking-widest text-center font-bold">Quick Access</p>
             <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => { setMode('login'); setForm({ ...form, email: 'hr@demo.com', password: 'demo123' }) }}
                  className="p-3 bg-surface-800/50 rounded-xl border border-surface-700 text-[11px] font-bold text-surface-300"
                >
                  HR Demo
                </button>
                <button 
                  onClick={() => { setMode('login'); setForm({ ...form, email: 'candidate@demo.com', password: 'demo123' }) }}
                  className="p-3 bg-surface-800/50 rounded-xl border border-surface-700 text-[11px] font-bold text-surface-300"
                >
                  Candidate Demo
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
