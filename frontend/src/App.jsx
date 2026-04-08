import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastContainer } from './components/Toast'

// Pages
import AuthPage                   from './pages/AuthPage'
import HRJobsPage                 from './pages/HRJobsPage'
import HRCandidatesPage           from './pages/HRCandidatesPage'
import HRCandidateDetailPage      from './pages/HRCandidateDetailPage'
import CandidateDashboardPage     from './pages/CandidateDashboardPage'
import InterviewInstructionsPage  from './pages/InterviewInstructionsPage'
import InterviewPage              from './pages/InterviewPage'
import ForbiddenPage              from './pages/NotFoundPage' // Reusing it
import StableVoiceApp             from './stable-app/StableVoiceApp'
import NotFoundPage               from './pages/NotFoundPage'

// ── Route guards ─────────────────────────────────────────────────────────────
function RequireAuth({ children, role }) {
  const { user, loading } = useAuth()

  if (loading) return null // Wait for rehydration

  if (!user) return <Navigate to="/login" replace />

  if (role && user.role !== role) {
    return <Navigate to={user.role === 'hr' ? '/hr/jobs' : '/dashboard'} replace />
  }

  return children
}

function RedirectIfAuthed({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to={user.role === 'hr' ? '/hr/jobs' : '/dashboard'} replace />
  return children
}

// ── Router ────────────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Auth */}
      <Route
        path="/login"
        element={
          <RedirectIfAuthed>
            <AuthPage />
          </RedirectIfAuthed>
        }
      />

      {/* ── HR Routes ── */}
      <Route
        path="/hr/jobs"
        element={
          <RequireAuth role="hr">
            <HRJobsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/hr/candidates"
        element={
          <RequireAuth role="hr">
            <HRCandidatesPage />
          </RequireAuth>
        }
      />
      <Route
        path="/hr/candidates/:id"
        element={
          <RequireAuth role="hr">
            <HRCandidateDetailPage />
          </RequireAuth>
        }
      />

      {/* ── Candidate Routes ── */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth role="candidate">
            <CandidateDashboardPage />
          </RequireAuth>
        }
      />

      {/* Interview entry via shareable link — accessible even if not logged in yet
          (will redirect to login first, then back) */}
      <Route
        path="/interview/:jobId"
        element={
          <RequireAuth role="candidate">
            <InterviewInstructionsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/interview/:jobId/go"
        element={
          <RequireAuth role="candidate">
            <InterviewPage />
          </RequireAuth>
        }
      />
      <Route
        path="/stable"
        element={<StableVoiceApp />}
      />

      {/* Catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        {/* Global toast notifications */}
        <ToastContainer />
      </AuthProvider>
    </BrowserRouter>
  )
}
