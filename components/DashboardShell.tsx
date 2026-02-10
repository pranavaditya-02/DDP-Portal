'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { Sidebar } from './Sidebar'

const PUBLIC_PATHS = ['/login', '/register', '/']

export const DashboardShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname()
  const { isAuthenticated, _hasHydrated } = useAuthStore()

  const isPublicPage = PUBLIC_PATHS.includes(pathname)

  // Wait for zustand to rehydrate from localStorage before deciding layout
  if (!_hasHydrated) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  const showSidebar = isAuthenticated && !isPublicPage

  if (!showSidebar) {
    return <main className="min-h-screen bg-slate-50">{children}</main>
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      {/* Main content area — offset by sidebar width */}
      <main className="flex-1 ml-[260px] min-h-screen transition-all duration-200">
        {children}
      </main>
    </div>
  )
}
