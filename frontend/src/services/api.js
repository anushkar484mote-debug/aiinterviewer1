/**
 * services/api.js
 * Central Axios instance with JWT injection and error normalization.
 * All backend calls go through this module.
 *
 * BASE_URL: set VITE_API_URL in .env for production.
 * In development, Vite proxy forwards /api → http://localhost:5000
 */
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000, // 30s for AI calls
})

// ── Request interceptor: attach JWT ──────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('aiv_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor: normalize errors ───────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Something went wrong'

    // Auto-logout on 401
    if (error.response?.status === 401) {
      localStorage.removeItem('aiv_token')
      localStorage.removeItem('aiv_user')
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }

    return Promise.reject(new Error(message))
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────
export const authService = {
  signup: (data) => api.post('/auth/signup', data),
  login:  (data) => api.post('/auth/login', data),
  getMe:  ()     => api.get('/auth/me'),
}

// ── Jobs ──────────────────────────────────────────────────────────────────
export const jobService = {
  create:  (data)   => api.post('/jobs', data),
  list:    ()       => api.get('/jobs'),
  getById: (id)     => api.get(`/jobs/${id}`),
  update:  (id, d)  => api.patch(`/jobs/${id}`, d),
  delete:  (id)     => api.delete(`/jobs/${id}`),
}

// ── Interviews ────────────────────────────────────────────────────────────
export const interviewService = {
  start:         (data)  => api.post('/interviews/start', data),
  saveAnswer:    (data)  => api.post('/interviews/answer', data),
  submit:        (data)  => api.post('/interviews/submit', data),
  getById:       (id)    => api.get(`/interviews/${id}`),
  getByJob:      (jobId) => api.get(`/interviews/job/${jobId}`),
  getMyList:     ()      => api.get('/interviews/my'),
  updateStatus:  (id, status) => api.patch(`/interviews/${id}/status`, { status }),
}

// ── AI ────────────────────────────────────────────────────────────────────
export const aiService = {
  generateQuestions: (data) => api.post('/ai/generate-questions', data),
  followUp:          (data) => api.post('/ai/follow-up', data),
  evaluate:          (data) => api.post('/ai/evaluate', data),
}

// ── Voice ────────────────────────────────────────────────────────────
export const voiceService = {
  start: (data) => api.post('/voice/start', data),
  next:  (data) => api.post('/voice/next', data),
  end:   (data) => api.post('/voice/end', data),
}

export default api
