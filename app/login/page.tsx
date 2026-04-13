'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { apiClient } from '@/lib/api'
import { getPostLoginRoute, AUTH_COOKIE_NAME } from '@/lib/auth-session'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential?: string }) => void
          }) => void
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void
          prompt: () => void
        }
      }
    }
  }
}

export default function LoginPage() {
  const router = useRouter()
  const { user, setUser } = useAuthStore()
  const buttonRef = useRef<HTMLDivElement | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [scriptReady, setScriptReady] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (user) {
      router.replace(getPostLoginRoute(user.roles))
    }
  }, [router, user])

  useEffect(() => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-google-identity-script="true"]')

    const setupButton = () => {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      const google = window.google
      if (!google || !buttonRef.current || !clientId) return

      google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          if (!credential) return

          try {
            setIsLoading(true)
            const response = await apiClient.loginWithGoogle(credential)
            setUser(response.user)
            toast.success('Signed in successfully')
            router.replace(getPostLoginRoute(response.user.roles || []))
          } catch (error: any) {
            const message = error.response?.data?.error || 'Google sign-in failed'
            toast.error(message)
            console.error('Google login error:', error)
          } finally {
            setIsLoading(false)
          }
        },
      })

      buttonRef.current.innerHTML = ''
      google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        width: 370,
        text: 'signin_with',
      })
    }

    if (window.google) {
      setupButton()
      setScriptReady(true)
      return
    }

    const script = existingScript || document.createElement('script')
    if (!existingScript) {
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.dataset.googleIdentityScript = 'true'
      script.onload = () => {
        setupButton()
        setScriptReady(true)
      }
      document.head.appendChild(script)
    }

    return () => {
      void script
    }
  }, [router, setUser])

  return (
    <div className="min-h-screen bg-[#eef2ff] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <div className="w-full max-w-[448px] rounded-[16px] border border-white/80 bg-white px-6 py-9 shadow-[0_6px_18px_rgba(15,23,42,0.12)] sm:px-10">
          <div className="space-y-6">
            <div className="space-y-4 text-center">
              <div>
                <h1 className="text-[28px] font-semibold tracking-tight text-slate-900">DDP</h1>
              </div>
            </div>

            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault()
                
                if (process.env.NODE_ENV === 'development') {
                  const uRole = username.toLowerCase();
                  let assignedRole = 'faculty';
                  if (uRole.includes('student')) assignedRole = 'student';
                  else if (uRole.includes('dean')) assignedRole = 'dean';
                  else if (uRole.includes('hod')) assignedRole = 'hod';
                  else if (uRole.includes('admin')) assignedRole = 'admin';
                  else if (uRole.includes('verification')) assignedRole = 'verification';

                  const mockPayload = {
                    id: 1,
                    username: username || 'testuser',
                    name: username || 'Test User',
                    email: `${username || 'test'}@example.com`,
                    roleId: 1,
                    roleName: assignedRole,
                    roles: [assignedRole]
                  };
                  
                  const base64Payload = btoa(JSON.stringify(mockPayload));
                  const token = `mock.${base64Payload}.mock`;
                  document.cookie = `${AUTH_COOKIE_NAME}=${token}; path=/;`;
                  
                  setUser(mockPayload);
                  toast.success(`Signed in as ${assignedRole} (Mock)`);
                  router.replace(getPostLoginRoute(mockPayload.roles));
                  return;
                }

                toast('Use Google Sign-In to access the portal')
              }}
            >
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-800">Username</span>
                <input
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Enter your username"
                  className="h-10 w-full rounded-[7px] border border-[#e5ebf7] bg-[#edf1fb] px-3 text-sm text-slate-800 outline-none transition focus:border-[#a78bfa] focus:bg-white focus:ring-2 focus:ring-[#c4b5fd]/40"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-800">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="h-10 w-full rounded-[7px] border border-[#e5ebf7] bg-[#edf1fb] px-3 text-sm text-slate-800 outline-none transition focus:border-[#a78bfa] focus:bg-white focus:ring-2 focus:ring-[#c4b5fd]/40"
                />
              </label>

              <button
                type="submit"
                className="mt-1 inline-flex h-11 w-full items-center justify-center rounded-[7px] bg-[#7c5cf2] px-4 text-base font-medium text-white shadow-[0_4px_10px_rgba(124,92,242,0.28)] transition hover:bg-[#6f4ef1]"
              >
                Login
              </button>
            </form>

            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="h-px flex-1 bg-slate-200" />
              <span>or</span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="space-y-3">
              <div className="min-h-[46px] rounded-[8px] border border-[#edf0f7] bg-white px-2 py-1">
                <div ref={buttonRef} className="flex justify-center" />
                {!scriptReady ? (
                  <button
                    type="button"
                    disabled
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[7px] border border-[#edf0f7] bg-white text-sm font-medium text-slate-500"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading Google sign-in...
                  </button>
                ) : null}
              </div>

              {isLoading ? (
                <div className="flex items-center justify-ceneer gap-2 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing you in...
                </div>
              ) : null}


            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
