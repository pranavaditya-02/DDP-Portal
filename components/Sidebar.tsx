'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { useRoles } from '@/hooks/useRoles'
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Building2,
  Trophy,
  GraduationCap,
  ShieldCheck,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Settings,
  User,
  ChevronDown,
  Award,
  Clipboard,
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  show: boolean
  badge?: number
}

interface NavGroup {
  title: string
  items: NavItem[]
}

export const Sidebar: React.FC = () => {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const { isFaculty, isHod, isDean, isVerification, isMaintenance } = useRoles()
  const [collapsed, setCollapsed] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (!user) return null

  const navGroups: NavGroup[] = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, show: true },
      ],
    },
    {
      title: 'Faculty',
      items: [
        { label: 'My Activities', href: '/activities', icon: FileText, show: isFaculty() },
        { label: 'Submit Activity', href: '/activities/submit', icon: PlusCircle, show: isFaculty() },
        { label: 'Submit Achievements', href: '/achievements/submit', icon: Award, show: isFaculty() },
        { label: 'Submit Action Plan', href: '/action-plan/submit', icon: Clipboard, show: isFaculty() },
      ],
    },
    {
      title: 'Department',
      items: [
        { label: 'Department', href: '/department', icon: Building2, show: isHod() },
        { label: 'Leaderboard', href: '/leaderboard', icon: Trophy, show: isHod() },
      ],
    },
    {
      title: 'College',
      items: [
        { label: 'College Overview', href: '/college', icon: GraduationCap, show: isDean() },
      ],
    },
    {
      title: 'Management',
      items: [
        { label: 'Verification Queue', href: '/verification', icon: ShieldCheck, show: isVerification(), badge: 7 },
        { label: 'User Management', href: '/users', icon: Users, show: isMaintenance() },
        { label: 'Settings', href: '/settings', icon: Settings, show: isMaintenance() },
      ],
    },
  ]

  // Filter groups: only show groups that have at least one visible item
  const visibleGroups = navGroups
    .map(g => ({ ...g, items: g.items.filter(i => i.show) }))
    .filter(g => g.items.length > 0)

  const isActive = (href: string) => pathname === href

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      faculty: 'bg-blue-500/20 text-blue-300',
      hod: 'bg-emerald-500/20 text-emerald-300',
      dean: 'bg-purple-500/20 text-purple-300',
      verification: 'bg-amber-500/20 text-amber-300',
      maintenance: 'bg-red-500/20 text-red-300',
    }
    return colors[role] || 'bg-slate-500/20 text-slate-300'
  }

  return (
    <aside
      style={{ width: collapsed ? 72 : 260, transition: 'width 0.2s ease-in-out' }}
      className="fixed left-0 top-0 h-screen bg-slate-900 text-white flex flex-col z-50 border-r border-slate-800"
    >
      {/* Header / Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          {!collapsed && (
            <span className="font-semibold text-sm whitespace-nowrap animate-fade-in">
              Faculty Tracker
            </span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin">
        {visibleGroups.map((group) => (
          <div key={group.title}>
            {!collapsed && (
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2 px-3">
                {group.title}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative ${
                      active
                        ? 'bg-blue-600/20 text-blue-400'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    {active && (
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-blue-500 rounded-r-full"
                      />
                    )}
                    <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-blue-400' : ''}`} />
                    {!collapsed && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}
                    {!collapsed && item.badge && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {collapsed && item.badge && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 text-[9px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className="border-t border-slate-800 p-3">
        {/* Roles */}
        {!collapsed && (
          <div className="flex flex-wrap gap-1 mb-3 px-1">
            {user.roles.map((role) => (
              <span
                key={role}
                className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${getRoleBadgeColor(role)}`}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </span>
            ))}
          </div>
        )}

        {/* User Info */}
        <div
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          onClick={() => setProfileOpen(!profileOpen)}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0 text-sm font-bold">
            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
            </div>
          )}
          {!collapsed && (
            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
          )}
        </div>

        {/* Profile dropdown */}
        {profileOpen && !collapsed && (
            <div
              className="overflow-hidden animate-fade-in"
            >
              <div className="pt-2 space-y-1">
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                  <Bell className="w-4 h-4" />
                  Notifications
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}

        {/* Collapsed logout */}
        {collapsed && (
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="w-full flex items-center justify-center p-2 mt-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </aside>
  )
}
