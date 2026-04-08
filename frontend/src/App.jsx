import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastContainer } from './components/Toast'

// ── Pages (Lazy Loaded) ──────────────────────────────────────────────────────
const AuthPage                  = lazy(() => import('./pages/AuthPage'))
const HRJobsPage                = lazy(() => import('./pages/HRJobsPage'))
const HRCandidatesPage          = lazy(() => import('./pages/HRCandidatesPage'))
const HRCandidateDetailPage     = lazy(() => import('./pages/HRCandidateDetailPage'))
const CandidateDashboardPage    = lazy(() => import('./pages/CandidateDashboardPage'))
const InterviewInstructionsPage = lazy(() => import('./pages/InterviewInstructionsPage'))
const InterviewPage             = lazy(() => import('./pages/InterviewPage'))
const NotFoundPage              = lazy(() => import('./pages/NotFoundPage'))
const StableVoiceApp            = lazy(() => import('./stable-app/StableVoiceApp'))

// Loading fallback components
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-surface-950">
    <div className="w-12 h-12 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
  </div>
)

// ── Route guards ─────────────────────────────────────────────────────────────
function RequireAuth({ children, role }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'hr' ? '/hr/jobs' : '/dashboard'} replace />
  }
  return children
}

function RedirectIfAuthed({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  if (user) return <Navigate to={user.role === 'hr' ? '/hr/jobs' : '/dashboard'} replace />
  return children
}

// ── Router ────────────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer />
      </AuthProvider>
    </BrowserRouter>
  )
}
