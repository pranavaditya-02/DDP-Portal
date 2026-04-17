'use client'

import React from "react"

import { useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { apiClient } from '@/lib/api'
import type { AuthUser } from '@/lib/auth-session'
import { Toaster } from 'react-hot-toast'

const PUBLIC_PATHS = ['/', '/login', '/register']

export function Providers({ children, initialUser }: { children: React.ReactNode; initialUser: AuthUser | null }) {
  useEffect(() => {
    const shouldLoadRoleAccess = () => {
      const state = useAuthStore.getState()
      return state.allowedRoutes.length === 0 && state.allowedResources.length === 0
    }

    const loadRoleAccess = async () => {
      try {
        const access = await apiClient.getMyRoleAccess()
        useAuthStore.getState().setAllowedRoutes(access.routePaths || [])
        useAuthStore.getState().setAllowedResources(access.resources || [])
      } catch {
        useAuthStore.getState().setAllowedRoutes([])
        useAuthStore.getState().setAllowedResources([])
      }
    }

    const state = useAuthStore.getState()
    const currentUser = state.user

    if (state._hasHydrated && (state.isAuthenticated || PUBLIC_PATHS.includes(window.location.pathname))) {
      return
    }

    if (initialUser) {
      useAuthStore.setState({
        user: initialUser,
        isAuthenticated: true,
        _hasHydrated: true,
      })
      if (shouldLoadRoleAccess()) {
        void loadRoleAccess()
      }
      return
    }

    if (currentUser) {
      useAuthStore.setState({
        isAuthenticated: true,
        _hasHydrated: true,
      })
      if (shouldLoadRoleAccess()) {
        void loadRoleAccess()
      }
      return
    }

    if (PUBLIC_PATHS.includes(window.location.pathname)) {
      useAuthStore.setState({
        _hasHydrated: true,
        allowedRoutes: [],
        allowedResources: [],
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
        if (shouldLoadRoleAccess()) {
          await loadRoleAccess()
        }
      } catch (error) {
        console.error('Auth verification failed:', error)
        useAuthStore.getState().logout()
      }
    }

    void verifyAuth()
  }, [initialUser])

  return (
    <>
      {children}
      <Toaster position="top-right" />
    </>
  )
}
