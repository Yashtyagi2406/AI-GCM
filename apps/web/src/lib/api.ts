const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

class ApiClient {
  private token: string | null = null

  setToken(token: string) { this.token = token }
  clearToken() { this.token = null }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }))
      throw new Error(err.error || `HTTP ${res.status}`)
    }
    return res.json()
  }

  get<T>(path: string)              { return this.request<T>(path) }
  post<T>(path: string, body: unknown) { return this.request<T>(path, { method: 'POST', body: JSON.stringify(body) }) }
  put<T>(path: string, body: unknown)  { return this.request<T>(path, { method: 'PUT',  body: JSON.stringify(body) }) }
  delete<T>(path: string)           { return this.request<T>(path, { method: 'DELETE' }) }
}

export const api = new ApiClient()
