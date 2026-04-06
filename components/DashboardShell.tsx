'use client'

import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { Sidebar } from './Sidebar'
import { Menu } from 'lucide-react'
import Link from 'next/link'

const PUBLIC_PATHS = ['/login', '/register', '/']

export const DashboardShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname()
  const { isAuthenticated, _hasHydrated } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

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

  // Desktop margin: collapsed → 72px, expanded → 260px
  const desktopMargin = collapsed ? 'md:ml-[72px]' : 'md:ml-[260px]'

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main content area */}
      <main className={`dashboard-main flex-1 min-h-screen transition-all duration-300 ease-in-out ml-0 ${desktopMargin} overflow-x-hidden`}>
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-30 flex items-center gap-3 h-14 px-4 bg-white border-b border-slate-200 shadow-sm">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="font-semibold text-sm text-slate-900">Faculty Tracker</span>
          </Link>
        </div>

        {children}
      </main>
    </div>
  )
}
