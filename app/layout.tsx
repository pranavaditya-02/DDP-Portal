import React from "react"
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { Inter, JetBrains_Mono } from 'next/font/google'

import './globals.css'
import { Providers } from './providers'
import { DashboardShell } from '@/components/DashboardShell'
import { AUTH_COOKIE_NAME, decodeAuthToken } from '@/lib/auth-session'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'Faculty Achievement Tracking System',
  description:
    'Role-based faculty achievement tracking dashboard for Bannari Amman Institute of Technology',
  icons: {
    icon: '/favicon.ico',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value || null
  const initialUser = token ? decodeAuthToken(token) : null

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased overflow-x-hidden`}>
        <Providers initialUser={initialUser}>
          <DashboardShell>
            {children}
          </DashboardShell>
        </Providers>
      </body>
    </html>
  )
}
