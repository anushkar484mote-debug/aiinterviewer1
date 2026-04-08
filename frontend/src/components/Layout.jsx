import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Avatar } from './UI'

const NAV = [
  {
    to: '/hr/jobs',
    label: 'Jobs',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
      </svg>
    ),
  },
  {
    to: '/hr/candidates',
    label: 'Candidates',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
]

export function HRLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface-950">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col bg-surface-900 border-r border-surface-800">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-surface-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <span className="text-white text-sm font-display font-bold">✦</span>
            </div>
            <div>
              <p className="text-sm font-display font-semibold text-surface-50 leading-none">InterviewAI</p>
              <p className="text-[10px] text-surface-500 mt-0.5 font-mono">HR Portal</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-500/15 text-brand-300 border border-brand-500/20'
                    : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800'
                }`
              }
            >
              {icon}
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 pb-4 border-t border-surface-800 pt-4">
          <div className="flex items-center gap-2.5 px-2 mb-3">
            <Avatar name={user?.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-200 truncate">{user?.name}</p>
              <p className="text-[10px] text-surface-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full btn btn-ghost btn-sm text-surface-500 hover:text-red-400 justify-start gap-2"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-7">
          {children}
        </div>
      </main>
    </div>
  )
}

/** Candidate top-bar layout */
export function CandidateLayout({ children, showNav = true }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-surface-950">
      {showNav && (
        <header className="sticky top-0 z-30 bg-surface-900/80 backdrop-blur border-b border-surface-800">
          <div className="max-w-4xl mx-auto px-5 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">✦</span>
              </div>
              <span className="text-sm font-display font-semibold text-surface-100">InterviewAI</span>
            </div>
            {user && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-surface-400 hidden sm:block">Hi, {user.name?.split(' ')[0]}</span>
                <button onClick={handleLogout} className="btn btn-ghost btn-sm text-xs">Sign out</button>
              </div>
            )}
          </div>
        </header>
      )}
      <main className="max-w-4xl mx-auto px-5 py-7">
        {children}
      </main>
    </div>
  )
}

/** Route guard component */
export function RequireAuth({ children, role }) {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  if (loading) return null

  if (!user) {
    navigate('/login', { replace: true })
    return null
  }

  if (role && user.role !== role) {
    navigate(user.role === 'hr' ? '/hr/jobs' : '/dashboard', { replace: true })
    return null
  }

  return children
}
