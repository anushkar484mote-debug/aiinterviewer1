import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function NotFoundPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-800 border border-surface-700 flex items-center justify-center text-3xl mb-5">
        🔍
      </div>
      <h1 className="text-4xl font-display font-bold text-surface-50 mb-2">404</h1>
      <p className="text-surface-400 mb-6">This page doesn't exist.</p>
      <button
        onClick={() => navigate(user?.role === 'hr' ? '/hr/jobs' : user ? '/dashboard' : '/login')}
        className="btn-primary btn"
      >
        Go home
      </button>
    </div>
  )
}
