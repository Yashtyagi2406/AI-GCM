import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
  role: string
  orgId: string
  teamId?: string
}

interface DateRange {
  start: string
  end: string
}

interface AppState {
  user: User | null
  dateRange: DateRange
  selectedTeamId: string | null
  sidebarOpen: boolean

  setUser: (user: User | null) => void
  setDateRange: (range: DateRange) => void
  setSelectedTeamId: (id: string | null) => void
  toggleSidebar: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        end: new Date().toISOString().slice(0, 10),
      },
      selectedTeamId: null,
      sidebarOpen: true,

      setUser: (user) => set({ user }),
      setDateRange: (dateRange) => set({ dateRange }),
      setSelectedTeamId: (selectedTeamId) => set({ selectedTeamId }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    { name: 'ai-gcm-app-state', partialize: (s) => ({ dateRange: s.dateRange, sidebarOpen: s.sidebarOpen }) }
  )
)
