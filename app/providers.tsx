'use client'

import React from "react"

import { useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { apiClient } from '@/lib/api'
import toast, { Toaster } from 'react-hot-toast'

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Verify token on app load
    const verifyAuth = async () => {
      const token = useAuthStore.getState().token
      if (!token) return

      // Skip API verification for demo tokens — they are client-side only
      if (token.startsWith('demo-')) return

      try {
        const response = await apiClient.getMe()
        useAuthStore.setState({
          user: response.user,
          isAuthenticated: true,
        })
      } catch (error) {
        console.error('Auth verification failed:', error)
        useAuthStore.getState().logout()
      }
    }

    verifyAuth()
  }, [])

  return (
    <>
      {children}
      <Toaster position="top-right" />
    </>
  )
}
