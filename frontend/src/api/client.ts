import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';

import { API_BASE_URL, STORAGE_KEYS } from '@/lib/constants';

/**
 * NEXHIRE AI — HTTP client
 *
 * - Attaches JWT bearer to every request when present
 * - Normalizes error shape for the UI
 * - Token refresh hook is wired from AuthProvider
 */

export interface ApiError {
  status: number;
  code: string;
  message: string;
  fieldErrors?: Record<string, string[]>;
  timestamp: string;
  path?: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

export interface ApiResult<T> {
  data: T;
  status: number;
}

const STORAGE =
  typeof window !== 'undefined' ? window.localStorage : null;

function getToken(key: string): string | null {
  return STORAGE?.getItem(key) ?? null;
}

function setToken(key: string, value: string | null): void {
  if (!STORAGE) return;
  if (value) STORAGE.setItem(key, value);
  else STORAGE.removeItem(key);
}

export const tokenStore = {
  get access(): string | null {
    return getToken(STORAGE_KEYS.ACCESS_TOKEN);
  },
  get refresh(): string | null {
    return getToken(STORAGE_KEYS.REFRESH_TOKEN);
  },
  set(access: string, refresh?: string): void {
    setToken(STORAGE_KEYS.ACCESS_TOKEN, access);
    if (refresh) setToken(STORAGE_KEYS.REFRESH_TOKEN, refresh);
  },
  clear(): void {
    setToken(STORAGE_KEYS.ACCESS_TOKEN, null);
    setToken(STORAGE_KEYS.REFRESH_TOKEN, null);
  },
};

function normalizeError(err: AxiosError<unknown>): ApiError {
  const status = err.response?.status ?? 0;
  const payload = err.response?.data as
    | {
        code?: string;
        message?: string;
        fieldErrors?: Record<string, string[]>;
        timestamp?: string;
        path?: string;
      }
    | undefined;

  // Network / CORS / no response
  if (!err.response) {
    return {
      status: 0,
      code: 'NETWORK_ERROR',
      message: err.message || 'Network error — please check your connection.',
      timestamp: new Date().toISOString(),
    };
  }

  return {
    status,
    code: payload?.code ?? 'ERROR',
    message:
      payload?.message ?? err.message ?? `Request failed with status ${status}.`,
    fieldErrors: payload?.fieldErrors,
    timestamp: payload?.timestamp ?? new Date().toISOString(),
    path: payload?.path,
  };
}

const config: AxiosRequestConfig = {
  baseURL: API_BASE_URL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Client': 'nexhire-web',
  },
  withCredentials: true,
};

export const api: AxiosInstance = axios.create(config);

// ── Request interceptor: attach bearer & ensure proper baseURL ──────────────
api.interceptors.request.use((req: InternalAxiosRequestConfig) => {
  if (
    typeof window !== 'undefined' &&
    (!req.baseURL || req.baseURL.includes('localhost:8080')) &&
    !window.location.hostname.includes('localhost') &&
    !window.location.hostname.includes('127.0.0.1')
  ) {
    req.baseURL = 'https://nexhireai-1.onrender.com/api';
  }
  const token = tokenStore.access;
  if (token && req.headers) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// ── Response interceptor: normalize errors & auto refresh on 401 ───────────
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<unknown>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const refreshToken = tokenStore.refresh;
      if (
        refreshToken &&
        !originalRequest.url?.includes('/auth/refresh') &&
        !originalRequest.url?.includes('/auth/login')
      ) {
        if (isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(normalizeError(err)));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          const newAccess = res.data?.accessToken;
          const newRefresh = res.data?.refreshToken || refreshToken;

          if (newAccess) {
            tokenStore.set(newAccess, newRefresh);
            api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            processQueue(null, newAccess);
            return api(originalRequest);
          }
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          tokenStore.clear();
        } finally {
          isRefreshing = false;
        }
      }
    }

    return Promise.reject(normalizeError(error));
  },
);

/** Typed wrapper helpers so call-sites are concise. */
export const http = {
  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const res = await api.get<T>(url, { params });
    return res.data;
  },
  async post<T>(url: string, body?: unknown): Promise<T> {
    const res = await api.post<T>(url, body);
    return res.data;
  },
  async put<T>(url: string, body?: unknown): Promise<T> {
    const res = await api.put<T>(url, body);
    return res.data;
  },
  async patch<T>(url: string, body?: unknown): Promise<T> {
    const res = await api.patch<T>(url, body);
    return res.data;
  },
  async delete<T>(url: string): Promise<T> {
    const res = await api.delete<T>(url);
    return res.data;
  },
  async upload<T>(
    url: string,
    file: File | Blob,
    fieldName = 'file',
    onProgress?: (percent: number) => void,
  ): Promise<T> {
    const form = new FormData();
    form.append(fieldName, file);
    const res = await api.post<T>(url, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (!onProgress || e.total == null) return;
        onProgress(Math.round((e.loaded * 100) / e.total));
      },
    });
    return res.data;
  },
  async uploadMultipart<T>(
    url: string,
    formData: FormData,
  ): Promise<T> {
    const res = await api.post<T>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};

export type { AxiosRequestConfig };
