'use client'

import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Edit3, Plus, Search, Trash2, X, FileCode } from 'lucide-react'
import { apiClient, getApiErrorMessage, type AppPageRecord } from '@/lib/api'

const normalizeRoutePath = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (!trimmed.startsWith('/')) return `/${trimmed}`
  return trimmed.replace(/\/+$/, '') || '/'
}

const generatePageKey = (routePath: string) => {
  const normalized = normalizeRoutePath(routePath)
  if (!normalized) return ''

  if (normalized === '/') return 'home'

  return normalized
    .slice(1)
    .replace(/\//g, '.')
    .replace(/\[(\.\.\.)?([^\]]+)\]/g, '$2')
    .replace(/[^a-zA-Z0-9.]+/g, '-')
    .replace(/\.{2,}/g, '.')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

export default function PagesManagementClientPage() {
  const [pages, setPages] = useState<AppPageRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editingPage, setEditingPage] = useState<AppPageRecord | null>(null)
  const [modalPageName, setModalPageName] = useState('')
  const [modalRoutePath, setModalRoutePath] = useState('')
  const [isModalSubmitting, setIsModalSubmitting] = useState(false)

  const loadPages = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getManagedPages()
      setPages(response.pages || [])
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load pages'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadPages()
  }, [])

  const filteredPages = useMemo(() => {
    if (!query.trim()) return pages

    const search = query.toLowerCase()
    return pages.filter((page) => {
      return (
        page.pageName.toLowerCase().includes(search)
        || page.pageKey.toLowerCase().includes(search)
        || page.routePath.toLowerCase().includes(search)
      )
    })
  }, [pages, query])

  const keyPreview = useMemo(() => generatePageKey(modalRoutePath), [modalRoutePath])

  const handleDeletePage = async (page: AppPageRecord) => {
    const shouldDelete = window.confirm(`Delete page route "${page.pageName}" (${page.routePath})?`)
    if (!shouldDelete) return

    try {
      await apiClient.deleteManagedPage(page.id)
      toast.success('Page route deleted successfully')
      await loadPages()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete page'))
    }
  }

  const openCreateModal = () => {
    setModalMode('create')
    setEditingPage(null)
    setModalPageName('')
    setModalRoutePath('')
    setIsModalOpen(true)
  }

  const openEditModal = (page: AppPageRecord) => {
    setModalMode('edit')
    setEditingPage(page)
    setModalPageName(page.pageName)
    setModalRoutePath(page.routePath)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setModalMode('create')
    setEditingPage(null)
    setModalPageName('')
    setModalRoutePath('')
  }

  const handleSubmitModal = async () => {
    if (modalMode === 'edit' && !editingPage) return

    const normalizedPath = normalizeRoutePath(modalRoutePath)

    if (!modalPageName.trim()) {
      toast.error('Page name is required')
      return
    }

    if (!normalizedPath) {
      toast.error('Route path is required')
      return
    }

    if (!normalizedPath.startsWith('/')) {
      toast.error('Route path must start with /')
      return
    }

    try {
      setIsModalSubmitting(true)

      if (modalMode === 'create') {
        await apiClient.createManagedPage({
          pageName: modalPageName.trim(),
          routePath: normalizedPath,
        })
        toast.success('Page route added successfully')
      } else {
        await apiClient.updateManagedPage(editingPage.id, {
          pageName: modalPageName.trim(),
          routePath: normalizedPath,
        })
        toast.success('Page route updated successfully')
      }

      closeModal()
      await loadPages()
    } catch (error) {
      toast.error(getApiErrorMessage(error, modalMode === 'create' ? 'Failed to create page' : 'Failed to update page'))
    } finally {
      setIsModalSubmitting(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileCode className="w-6 h-6 text-blue-600" />
            Page Route Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage rows in the app_pages route table.</p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Add Page
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-3 flex-wrap">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search page name, key, route"
              className="input-base pl-10"
            />
          </div>
          <p className="text-xs text-slate-500">Total: {pages.length}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Page Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Page Key</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Route Path</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-400" colSpan={4}>Loading page routes...</td>
                </tr>
              ) : filteredPages.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-400" colSpan={4}>No page routes found</td>
                </tr>
              ) : (
                filteredPages.map((page) => (
                  <tr key={page.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                    <td className="px-4 py-3 text-slate-800">{page.pageName}</td>
                    <td className="px-4 py-3 text-slate-600 font-mono">{page.pageKey}</td>
                    <td className="px-4 py-3 text-slate-600 font-mono">{page.routePath}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(page)}
                          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs text-blue-600 hover:bg-blue-50"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => void handleDeletePage(page)}
                          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h3 className="text-base font-semibold text-slate-900">{modalMode === 'create' ? 'Add Page Route' : 'Edit Page Route'}</h3>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Page Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={modalPageName}
                  onChange={(event) => setModalPageName(event.target.value)}
                  placeholder="Enter page name"
                  className="input-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Route Path <span className="text-red-500">*</span>
                </label>
                <input
                  value={modalRoutePath}
                  onChange={(event) => setModalRoutePath(event.target.value)}
                  placeholder="Enter route path"
                  className="input-base"
                />
              </div>

              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-xs font-medium text-slate-600">Page key is auto-generated from the route path.</p>
                <p className="text-xs text-slate-500 mt-1">Preview: <span className="font-mono">{keyPreview || '-'}</span></p>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button
                onClick={closeModal}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleSubmitModal()}
                disabled={isModalSubmitting}
                className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isModalSubmitting ? (modalMode === 'create' ? 'Adding...' : 'Saving...') : (modalMode === 'create' ? 'Add Page' : 'Save Changes')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
