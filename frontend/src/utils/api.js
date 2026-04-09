// src/utils/api.js — TalentMetrics API Client
// Axios wrapper that auto-attaches Firebase Bearer token to every request.

import axios from 'axios';
import { auth } from './firebase';

const BASE = process.env.NODE_ENV === 'production' ? '/api' : (process.env.REACT_APP_API_URL || 'http://localhost:5000/api');

// Normalize trailing slash to avoid double-slash issues
const normalizedBase = BASE.replace(/\/+$/, '');
const api = axios.create({ baseURL: normalizedBase });

// Inject Firebase ID token before every request
api.interceptors.request.use(async config => {
  try {
    const user  = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (_) {}
  return config;
});

// Unwrap response data; surface error messages
api.interceptors.response.use(
  res => res.data,
  err => Promise.reject(err.response?.data || err)
);

// ── Auth API ──────────────────────────────────────────────
export const authAPI = {
  register: data => api.post('/auth/register', data),
  login:    email => api.post('/auth/login', { email }),
  me:       ()   => api.get('/auth/me'),
};

// ── Interview API ─────────────────────────────────────────
export const interviewAPI = {
  start:         data     => api.post('/interview/start-interview', data),
  submit:        data     => api.post('/interview/submit-answers',  data),
  getResult:     resultId => api.get(`/interview/get-results/${resultId}`),
  getRanking:    jobId    => api.get(`/interview/get-ranking/${jobId}`),
  myResults:     ()       => api.get('/interview/my-results'),
  allCandidates: ()       => api.get('/interview/all-candidates'),
};

export default api;
