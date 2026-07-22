import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
  role: string
  orgId: string
  teamId?: string
  orgName?: string
}

interface DateRange {
  start: string
  end: string
}

interface AppState {
  user: User | null
  token: string | null
  dateRange: DateRange
  selectedTeamId: string | null
  sidebarOpen: boolean

  setUser: (user: User | null) => void
  setAuth: (token: string, user: User) => void
  logout: () => void
  setDateRange: (range: DateRange) => void
  setSelectedTeamId: (id: string | null) => void
  toggleSidebar: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        end: new Date().toISOString().slice(0, 10),
      },
      selectedTeamId: null,
      sidebarOpen: true,

      setUser: (user) => set({ user }),
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      setDateRange: (dateRange) => set({ dateRange }),
      setSelectedTeamId: (selectedTeamId) => set({ selectedTeamId }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    {
      name: 'ai-gcm-app-state',
      partialize: (s) => ({
        token: s.token,
        user: s.user,
        dateRange: s.dateRange,
        sidebarOpen: s.sidebarOpen,
      }),
    }
  )
)
