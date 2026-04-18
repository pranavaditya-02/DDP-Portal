'use client'

import dynamic from 'next/dynamic'

const PagesManagementClient = dynamic(() => import('./page.client'), {
  ssr: false,
  loading: () => (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </main>
  ),
})

export default function PagesManagementPage() {
  return <PagesManagementClient />
}
