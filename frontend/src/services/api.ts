import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (email: string, password: string) => {
  const params = new URLSearchParams();
  params.append('username', email);
  params.append('password', password);
  const res = await api.post('/api/auth/login', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    withCredentials: false,
  });
  return res.data;
};

export const register = async (username: string, email: string, password: string) => {
  const res = await api.post('/api/auth/register', { username, email, password });
  return res.data;
};

export const createSession = async () => {
  const res = await api.post('/api/chat/session');
  return res.data;
};

export const sendMessage = async (message: string, session_id: string) => {
  const res = await api.post('/api/chat/message', { message, session_id });
  return res.data;
};

export const getChatHistory = async (session_id: string) => {
  const res = await api.get(`/api/chat/history/${session_id}`);
  return res.data;
};

export const getSessions = async () => {
  const res = await api.get('/api/chat/sessions');
  return res.data;
};

export const getAnalytics = async () => {
  const res = await api.get('/api/analytics/dashboard');
  return res.data;
};

export default api;