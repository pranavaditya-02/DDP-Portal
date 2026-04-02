'use client'

import React, { useState, useMemo } from 'react'
import { useAuthStore } from '@/lib/store'
import { myActivities, type Activity } from '@/lib/mock-data'
import {
  FileText, Search, Filter, ChevronDown, ExternalLink,
  CheckCircle2, Clock, XCircle, Plus, ArrowUpDown,
  Calendar, Tag, Award,
} from 'lucide-react'
import Link from 'next/link'
import { apiClient } from '@/lib/api'

const STATUS_OPTIONS = ['all', 'approved', 'pending', 'rejected'] as const
const CATEGORY_OPTIONS = ['all', 'Research', 'Teaching', 'Professional Development', 'Service', 'Industry'] as const
const SORT_OPTIONS = [
  { label: 'Newest First', value: 'date-desc' },
  { label: 'Oldest First', value: 'date-asc' },
  { label: 'Highest Points', value: 'points-desc' },
  { label: 'Lowest Points', value: 'points-asc' },
] as const

function StatusBadge({ status }: { status: Activity['status'] }) {
  const config = {
    approved: { icon: CheckCircle2, class: 'bg-emerald-50 text-emerald-600', label: 'Approved' },
    pending: { icon: Clock, class: 'bg-amber-50 text-amber-600', label: 'Pending' },
    rejected: { icon: XCircle, class: 'bg-red-50 text-red-600', label: 'Rejected' },
  }
  const cfg = config[status]
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.class}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  )
}

export default function ActivitiesPage() {
  const { user } = useAuthStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<typeof STATUS_OPTIONS[number]>('all')
  const [categoryFilter, setCategoryFilter] = useState<typeof CATEGORY_OPTIONS[number]>('all')
  const [sort, setSort] = useState<string>('date-desc')
  const [importFile, setImportFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importMessage, setImportMessage] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let data = [...myActivities]

    // Search
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(a => a.title.toLowerCase().includes(q) || a.type.toLowerCase().includes(q))
    }

    // Status filter
    if (statusFilter !== 'all') {
      data = data.filter(a => a.status === statusFilter)
    }

    // Category filter
    if (categoryFilter !== 'all') {
      data = data.filter(a => a.category === categoryFilter)
    }

    // Sort
    switch (sort) {
      case 'date-asc': data.sort((a, b) => a.date.localeCompare(b.date)); break
      case 'date-desc': data.sort((a, b) => b.date.localeCompare(a.date)); break
      case 'points-asc': data.sort((a, b) => a.points - b.points); break
      case 'points-desc': data.sort((a, b) => b.points - a.points); break
    }

    return data
  }, [search, statusFilter, categoryFilter, sort])

  const statusCounts = useMemo(() => ({
    all: myActivities.length,
    approved: myActivities.filter(a => a.status === 'approved').length,
    pending: myActivities.filter(a => a.status === 'pending').length,
    rejected: myActivities.filter(a => a.status === 'rejected').length,
  }), [])

  const handleImport = async () => {
    if (!importFile) {
      setImportMessage('Please choose a CSV file before importing.')
      return
    }

    try {
      setIsImporting(true)
      setImportMessage(null)
      const response = await apiClient.importEventsAttendedCsv(importFile)
      const summary = response?.summary
      if (summary) {
        setImportMessage(
          `Imported. Rows: ${summary.processedRows}, Events inserted: ${summary.insertedEvents}, Submissions inserted: ${summary.insertedSubmissions}, Documents inserted: ${summary.insertedDocuments}, Skipped: ${summary.skippedRows}`
        )
      } else {
        setImportMessage('Import completed successfully.')
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Import failed.'
      setImportMessage(message)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">My Activities</h1>
          <p className="text-sm text-slate-500 mt-1">Track and manage your faculty achievements</p>
        </div>
        <Link
          href="/activities/submit"
          className="btn-primary w-fit"
        >
          <Plus className="w-4 h-4" />
          Submit Activity
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-2">Bulk Import (Events Attended CSV)</h2>
        <p className="text-xs text-slate-500 mb-3">Upload a CSV file to import legacy Events Attended records into the database.</p>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setImportFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
          />
          <button
            type="button"
            onClick={handleImport}
            disabled={isImporting}
            className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isImporting ? 'Importing...' : 'Import CSV'}
          </button>
        </div>
        {importMessage && (
          <p className="mt-3 text-xs text-slate-600">{importMessage}</p>
        )}
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              statusFilter === s
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            <span className="ml-1.5 text-xs opacity-70">({statusCounts[s]})</span>
          </button>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search activities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-10"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as any)}
          className="input-base w-full sm:w-48"
        >
          {CATEGORY_OPTIONS.map(c => (
            <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="input-base w-full sm:w-44"
        >
          {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Results count */}
      <p className="text-xs text-slate-400 mb-4">{filtered.length} activit{filtered.length === 1 ? 'y' : 'ies'} found</p>

      {/* Activities list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500">No activities found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search query</p>
          </div>
        ) : (
          filtered.map((act) => (
            <div
              key={act.id}
              className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 hover:shadow-sm hover:border-slate-300 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-sm font-semibold text-slate-900">{act.title}</h3>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{act.type}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{act.date}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium">{act.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <span className="text-lg font-bold text-slate-800" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      +{act.points}
                    </span>
                    <p className="text-[10px] text-slate-400">points</p>
                  </div>
                  <StatusBadge status={act.status} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
