import axios from 'axios';

const AUTH_STORAGE_KEY = 'cafeteria_auth';
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export function getStoredAuth() {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function saveAuth(credentials) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(credentials));
}

export function clearAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

function makeBasicToken(username, password) {
  return window.btoa(`${username}:${password}`);
}

apiClient.interceptors.request.use((config) => {
  const auth = getStoredAuth();

  if (auth?.username && auth?.password) {
    config.headers.Authorization = `Basic ${makeBasicToken(auth.username, auth.password)}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();
    }

    return Promise.reject(error);
  },
);
