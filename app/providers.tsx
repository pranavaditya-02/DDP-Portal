'use client'

import React from "react"

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { apiClient } from '@/lib/api'
import type { AuthUser } from '@/lib/auth-session'
import toast, { Toaster } from 'react-hot-toast'

const PUBLIC_PATHS = ['/', '/login', '/register']

export function Providers({ children, initialUser }: { children: React.ReactNode; initialUser: AuthUser | null }) {
  const pathname = usePathname()

  useEffect(() => {
    const currentUser = useAuthStore.getState().user

    if (initialUser) {
      useAuthStore.setState({
        user: initialUser,
        isAuthenticated: true,
        _hasHydrated: true,
      })
      return
    }

    if (currentUser) {
      useAuthStore.setState({
        isAuthenticated: true,
        _hasHydrated: true,
      })
      return
    }

    if (PUBLIC_PATHS.includes(pathname)) {
      useAuthStore.setState({
        _hasHydrated: true,
      })
      return
    }

    const verifyAuth = async () => {
      try {
        const response = await apiClient.getMe()
        useAuthStore.setState({
          user: response.user,
          isAuthenticated: true,
          _hasHydrated: true,
        })
      } catch (error) {
        console.error('Auth verification failed:', error)
        useAuthStore.getState().logout()
      }
    }

    verifyAuth()
  }, [initialUser, pathname])

  return (
    <>
      {children}
      <Toaster position="top-right" />
    </>
  )
}
