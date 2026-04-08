# InterviewAI — React Frontend

Production-ready React frontend for the AI Interviewer platform. Built with Vite, Tailwind CSS, and React Router.

---

## Quick Start

```bash
cd frontend
npm install
cp .env.example .env       # configure if needed
npm run dev                # → http://localhost:3000
```

Make sure the backend is running on `http://localhost:5000` first.
The Vite dev server automatically proxies all `/api` requests to the backend.

---

## Project Structure

```
src/
├── components/
│   ├── Layout.jsx       # HRLayout, CandidateLayout, RequireAuth
│   ├── Loaders.jsx      # Spinner, PageLoader, SkeletonCards, SkeletonRow
│   ├── Toast.jsx        # Toast notification container
│   └── UI.jsx           # Avatar, ScoreCard, ProgressBar, EmptyState, ConfirmModal…
├── context/
│   └── AuthContext.jsx  # JWT auth state, login(), signup(), logout()
├── hooks/
│   └── useToast.js      # Toast system + useAsync hook
├── pages/
│   ├── AuthPage.jsx                 # Login + signup, role selection, demo accounts
│   ├── HRJobsPage.jsx               # Create jobs, AI question generation, copy link
│   ├── HRCandidatesPage.jsx         # Filter/list all submissions with scores
│   ├── HRCandidateDetailPage.jsx    # Transcript, scores, AI feedback, shortlist/reject
│   ├── CandidateDashboardPage.jsx   # Browse jobs, see completed interviews
│   ├── InterviewInstructionsPage.jsx # Pre-interview briefing + session start
│   ├── InterviewPage.jsx            # Q&A flow, AI follow-ups, submission
│   └── NotFoundPage.jsx
├── services/
│   └── api.js           # Axios instance with JWT interceptors + all API methods
├── utils/
│   └── helpers.js       # Formatting, score colors, badge variants, clipboard
├── App.jsx              # Router + AuthProvider + ToastContainer
├── main.jsx             # React root
└── index.css            # Tailwind + design system
```

---

## API Integration

All API calls are in `src/services/api.js`. The Axios instance automatically:
- Attaches `Authorization: Bearer <token>` to every request
- Redirects to `/login` on 401 responses
- Normalizes errors to a readable `err.message` string

### Auth
```js
authService.signup({ name, email, password, role })  // POST /api/auth/signup
authService.login({ email, password })                // POST /api/auth/login
authService.getMe()                                   // GET  /api/auth/me
```

### Jobs
```js
jobService.create(data)     // POST   /api/jobs
jobService.list()           // GET    /api/jobs
jobService.getById(id)      // GET    /api/jobs/:id
jobService.update(id, data) // PATCH  /api/jobs/:id
jobService.delete(id)       // DELETE /api/jobs/:id
```

### Interviews
```js
interviewService.start({ jobId })              // POST /api/interviews/start
interviewService.saveAnswer({ interviewId, question, answer, followUp, followUpAnswer })
interviewService.submit({ interviewId, answers, scores, feedback, … })
interviewService.getById(id)                   // GET  /api/interviews/:id
interviewService.getByJob(jobId)               // GET  /api/interviews/job/:jobId
interviewService.getMyList()                   // GET  /api/interviews/my
interviewService.updateStatus(id, status)      // PATCH /api/interviews/:id/status
```

### AI
```js
aiService.generateQuestions({ title, description, count })  // POST /api/ai/generate-questions
aiService.followUp({ question, answer, role })               // POST /api/ai/follow-up
aiService.evaluate({ answers, role, criteria })              // POST /api/ai/evaluate
```

---

## Routes

| Path | Component | Access |
|------|-----------|--------|
| `/login` | AuthPage | Public |
| `/hr/jobs` | HRJobsPage | HR only |
| `/hr/candidates` | HRCandidatesPage | HR only |
| `/hr/candidates/:id` | HRCandidateDetailPage | HR only |
| `/dashboard` | CandidateDashboardPage | Candidate only |
| `/interview/:jobId` | InterviewInstructionsPage | Candidate only |
| `/interview/:jobId/go` | InterviewPage | Candidate only |

Shareable interview links have the format: `https://yourapp.com/interview/:jobId`
Candidates can enter via this URL and will be prompted to log in first if not authenticated.

---

## Design System

The app uses a custom dark theme built on Tailwind CSS with:
- **Fonts**: Sora (headings), DM Sans (body), DM Mono (code/labels)
- **Colors**: `brand-*` (indigo-violet), `surface-*` (dark grays)
- **Components**: `.btn`, `.btn-primary`, `.card`, `.input`, `.badge`, `.skeleton` — all defined as Tailwind component classes in `index.css`

---

## Production Build

```bash
npm run build    # outputs to dist/
npm run preview  # local preview of production build
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variable in Vercel dashboard:
# VITE_API_URL = https://your-backend-url.railway.app/api
```

### Vercel `vercel.json` (for SPA routing)

Create a `vercel.json` at the root with:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Production only | Full backend URL e.g. `https://api.yoursite.com/api` |

In development, no env vars are needed — the Vite proxy handles `/api` routing.

---

## Demo Accounts

After running `npm run seed` in the backend:

| Role | Email | Password |
|------|-------|----------|
| HR | hr@demo.com | demo123 |
| Candidate | candidate@demo.com | demo123 |
