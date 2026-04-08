# AI Interviewer — Backend

A clean REST API for the AI Interviewer platform built with Node.js, Express, MongoDB, and the Anthropic Claude API.

---

## Quick Start

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Edit `.env` and fill in:
- `MONGO_URI` — your MongoDB connection string
- `JWT_SECRET` — any long random string
- `ANTHROPIC_API_KEY` — your Claude API key (https://console.anthropic.com)

### 3. Seed demo data (optional)
```bash
npm run seed
```

### 4. Start the server
```bash
npm run dev      # development (nodemon)
npm start        # production
```

Server runs at `http://localhost:5000`

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: 5000) |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | No | Token lifetime (default: 7d) |
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key |
| `CLIENT_URL` | No | Frontend URL for CORS (default: *) |

---

## API Reference

All protected routes require the header:
```
Authorization: Bearer <token>
```

---

### Auth

#### POST /api/auth/signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane HR","email":"jane@company.com","password":"secret123","role":"hr"}'
```

**Response:**
```json
{
  "token": "eyJ...",
  "user": { "id": "...", "name": "Jane HR", "email": "jane@company.com", "role": "hr" }
}
```

#### POST /api/auth/login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"hr@demo.com","password":"demo123"}'
```

#### GET /api/auth/me  *(protected)*
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

---

### Jobs

#### POST /api/jobs  *(HR only)*
```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Authorization: Bearer <hr_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Backend Engineer",
    "description": "Node.js API developer role",
    "questions": ["Tell me about yourself", "Describe your Node.js experience"],
    "evaluationCriteria": { "communication": true, "technical": true, "confidence": true }
  }'
```

#### GET /api/jobs  *(protected)*
HR sees their own jobs; candidates see all active jobs.
```bash
curl http://localhost:5000/api/jobs \
  -H "Authorization: Bearer <token>"
```

#### GET /api/jobs/:id  *(protected)*
```bash
curl http://localhost:5000/api/jobs/64abc123... \
  -H "Authorization: Bearer <token>"
```

#### PATCH /api/jobs/:id  *(HR only)*
```bash
curl -X PATCH http://localhost:5000/api/jobs/64abc123... \
  -H "Authorization: Bearer <hr_token>" \
  -H "Content-Type: application/json" \
  -d '{"isActive": false}'
```

#### DELETE /api/jobs/:id  *(HR only)*
```bash
curl -X DELETE http://localhost:5000/api/jobs/64abc123... \
  -H "Authorization: Bearer <hr_token>"
```

---

### Interviews

#### POST /api/interviews/start  *(Candidate only)*
```bash
curl -X POST http://localhost:5000/api/interviews/start \
  -H "Authorization: Bearer <candidate_token>" \
  -H "Content-Type: application/json" \
  -d '{"jobId": "64abc123..."}'
```

**Response:** `{ interview: {...}, questions: ["Q1", "Q2", ...] }`

#### POST /api/interviews/answer  *(Candidate only)*
Call after each question (including follow-up).
```bash
curl -X POST http://localhost:5000/api/interviews/answer \
  -H "Authorization: Bearer <candidate_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "interviewId": "64def456...",
    "question": "Tell me about yourself",
    "answer": "I have 5 years of Node.js experience...",
    "followUp": "What was your biggest project?",
    "followUpAnswer": "A payment platform serving 50k users."
  }'
```

#### POST /api/interviews/submit  *(Candidate only)*
Submit final interview with AI evaluation results.
```bash
curl -X POST http://localhost:5000/api/interviews/submit \
  -H "Authorization: Bearer <candidate_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "interviewId": "64def456...",
    "answers": [...],
    "scores": { "communication": 8, "technical": 9, "confidence": 7 },
    "feedback": "Strong technical candidate with clear communication.",
    "strengths": ["Deep Node.js knowledge", "Good system design thinking"],
    "weaknesses": ["Could improve on testing practices"],
    "recommendation": "hire"
  }'
```

#### GET /api/interviews/my  *(Candidate only)*
```bash
curl http://localhost:5000/api/interviews/my \
  -H "Authorization: Bearer <candidate_token>"
```

#### GET /api/interviews/job/:jobId  *(HR only)*
```bash
curl http://localhost:5000/api/interviews/job/64abc123... \
  -H "Authorization: Bearer <hr_token>"
```

#### GET /api/interviews/:id  *(HR or owning candidate)*
```bash
curl http://localhost:5000/api/interviews/64def456... \
  -H "Authorization: Bearer <token>"
```

#### PATCH /api/interviews/:id/status  *(HR only)*
```bash
curl -X PATCH http://localhost:5000/api/interviews/64def456.../status \
  -H "Authorization: Bearer <hr_token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "shortlisted"}'
```
Status values: `pending` | `shortlisted` | `rejected`

---

### AI

#### POST /api/ai/generate-questions  *(HR only)*
```bash
curl -X POST http://localhost:5000/api/ai/generate-questions \
  -H "Authorization: Bearer <hr_token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Backend Engineer","description":"Node.js API role","count":5}'
```

**Response:** `{ "questions": ["Q1?", "Q2?", "Q3?", "Q4?", "Q5?"] }`

Optionally pass `"jobId"` to auto-save questions to that job.

#### POST /api/ai/follow-up  *(Candidate only)*
```bash
curl -X POST http://localhost:5000/api/ai/follow-up \
  -H "Authorization: Bearer <candidate_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Describe your Node.js experience",
    "answer": "I built several REST APIs and one GraphQL service.",
    "role": "Backend Engineer"
  }'
```

**Response:** `{ "followUp": "Can you walk me through a specific API design challenge you solved?" }`

#### POST /api/ai/evaluate  *(Candidate only)*
```bash
curl -X POST http://localhost:5000/api/ai/evaluate \
  -H "Authorization: Bearer <candidate_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "Backend Engineer",
    "criteria": { "communication": true, "technical": true, "confidence": true },
    "answers": [
      {
        "question": "Describe your Node.js experience",
        "answer": "5 years of experience building REST APIs...",
        "followUp": "Tell me about your biggest project",
        "followUpAnswer": "A payment platform serving 50k users..."
      }
    ]
  }'
```

**Response:**
```json
{
  "evaluation": {
    "scores": { "communication": 8, "technical": 9, "confidence": 7 },
    "feedback": "Strong candidate with solid backend fundamentals...",
    "strengths": ["Deep Node.js knowledge", "Clear communication", "Concrete examples"],
    "weaknesses": ["Limited testing mentions", "Could expand on architecture decisions"],
    "recommendation": "hire"
  }
}
```

---

## Frontend Integration

Replace all `localStorage` calls with API calls using these conventions:

```js
const API = 'http://localhost:5000/api';
const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

// Login
const { token, user } = await fetch(`${API}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
}).then(r => r.json());
localStorage.setItem('token', token);

// Get jobs
const { jobs } = await fetch(`${API}/jobs`, { headers: headers() }).then(r => r.json());

// Start interview
const { interview, questions } = await fetch(`${API}/interviews/start`, {
  method: 'POST', headers: headers(),
  body: JSON.stringify({ jobId }),
}).then(r => r.json());
```

---

## Error Response Format

All errors follow this format:
```json
{ "error": "Human-readable error message" }
```

Common HTTP status codes:
- `400` Bad Request — missing or invalid fields
- `401` Unauthorized — no/invalid/expired token
- `403` Forbidden — wrong role
- `404` Not Found
- `409` Conflict — duplicate (email, completed interview)
- `502` Bad Gateway — AI API error
- `500` Internal Server Error
