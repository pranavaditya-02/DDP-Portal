'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store'
import { apiClient } from '@/lib/api'
import { Mail, Lock, Loader2, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'

const DEMO_ACCOUNTS = [
  { label: 'Faculty', email: 'faculty@bit.edu', name: 'Dr. Priya Sharma', roles: ['faculty'], departmentId: 1, color: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200' },
  { label: 'HOD', email: 'hod@bit.edu', name: 'Dr. Rajesh Kumar', roles: ['faculty', 'hod'], departmentId: 1, color: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200' },
  { label: 'Dean', email: 'dean@bit.edu', name: 'Dr. Anitha Devi', roles: ['faculty', 'dean'], departmentId: undefined, color: 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200' },
  { label: 'Student', email: 'student@bit.edu', name: 'Arun Student', roles: ['student'], departmentId: 1, color: 'bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200' },
  { label: 'Verification', email: 'verify@bit.edu', name: 'Prof. Suresh Babu', roles: ['faculty', 'verification'], departmentId: 1, color: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200' },
  { label: 'Admin', email: 'admin@bit.edu', name: 'Admin User', roles: ['maintenance'], departmentId: undefined, color: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200' },
]

function getPostLoginRoute(roles: string[] = []) {
  if (roles.includes('dean')) return '/college'
  if (roles.includes('student')) return '/students'
  return '/dashboard'
}

export default function LoginPage() {
  const router = useRouter()
  const { setUser, setToken } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await apiClient.login(email, password)
      setToken(response.token)
      setUser(response.user)
      toast.success('Login successful!')
      router.push(getPostLoginRoute(response.user?.roles || []))
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed'
      toast.error(message)
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = (account: typeof DEMO_ACCOUNTS[number]) => {
    setIsLoading(true)
    // Simulate a demo token for client-side navigation
    const demoToken = `demo-${account.roles[0]}-${Date.now()}`
    setToken(demoToken)
    setUser({
      id: DEMO_ACCOUNTS.indexOf(account) + 1,
      email: account.email,
      name: account.name,
      roles: account.roles,
      departmentId: account.departmentId,
    })
    toast.success(`Logged in as ${account.label} (Demo)`)
    router.push(getPostLoginRoute(account.roles))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-900 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white text-3xl font-bold">F</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h1>
          <p className="text-slate-600">Faculty Achievement Tracking System</p>
        </div>

        {/* Login Form */}
        <div className="card-elevated p-8 space-y-6 animate-fade-in">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-base pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-base pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 rounded border-border" />
                <span className="text-slate-600">Remember me</span>
              </label>
              <Link href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary justify-center mt-6 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:scale-[0.98] transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500 font-medium">Or try a demo account</span>
            </div>
          </div>

          {/* Demo Login Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.label}
                type="button"
                disabled={isLoading}
                onClick={() => handleDemoLogin(account)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all disabled:opacity-50 hover:-translate-y-0.5 active:scale-[0.97] ${account.color}`}
              >
                <UserCheck className="w-3.5 h-3.5 flex-shrink-0" />
                <div className="text-left">
                  <div>{account.label}</div>
                  <div className="opacity-60 font-normal text-[10px] truncate">{account.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-600 mt-6">
          Don't have an account?{' '}
          <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
