import { useAppStore } from '@/store/useAppStore'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

class ApiClient {
  private token: string | null = null

  setToken(token: string | null) { this.token = token }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const activeToken = this.token || useAppStore.getState().token
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }
    if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`

    const url = path.startsWith('/api/auth') ? path : `${API_BASE}${path}`
    const res = await fetch(url, { ...options, headers })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }))
      throw new Error(err.error || err.message || `HTTP ${res.status}`)
    }
    return res.json()
  }

  get<T>(path: string)              { return this.request<T>(path) }
  post<T>(path: string, body: unknown) { return this.request<T>(path, { method: 'POST', body: JSON.stringify(body) }) }
  put<T>(path: string, body: unknown)  { return this.request<T>(path, { method: 'PUT',  body: JSON.stringify(body) }) }
  delete<T>(path: string)           { return this.request<T>(path, { method: 'DELETE' }) }

  // Auth specific requests
  login<T>(body: unknown)    { return this.request<T>('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }) }
  register<T>(body: unknown) { return this.request<T>('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }) }
}

export const api = new ApiClient()
