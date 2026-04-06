'use client'

import React, { useEffect, useState } from 'react'
import { useRoles } from '@/hooks/useRoles'
import { Mail, Save, RotateCcw, Search, Trash2, ShieldAlert } from 'lucide-react'
import toast from 'react-hot-toast'

interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  type: 'deadline-reminder' | 'submission-confirmation' | 'approval-notification' | 'custom'
  placeholders: string[]
}

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: 'deadline-reminder',
    name: 'Deadline Reminder',
    type: 'deadline-reminder',
    subject: 'Deadline Reminder: {{taskTitle}} due in {{daysRemaining}} day(s)',
    content: `Dear {{facultyName}},

This is a reminder that your task "{{taskTitle}}" is due on {{deadlineDate}}.

You have {{daysRemaining}} day(s) to complete and submit this task.

Important Details:
- Task: {{taskTitle}}
- Deadline: {{deadlineDate}}
- Status: {{taskStatus}}

Please log in to the Faculty Achievement Dashboard to submit your work before the deadline.

Dashboard Link: {{dashboardLink}}

This is an automated email. Please do not reply to this message.`,
    placeholders: ['facultyName', 'taskTitle', 'daysRemaining', 'deadlineDate', 'taskStatus', 'dashboardLink'],
  },
  {
    id: 'submission-confirmation',
    name: 'Submission Confirmation',
    type: 'submission-confirmation',
    subject: 'Submission Confirmed: {{taskTitle}}',
    content: `Dear {{facultyName}},

Your submission for "{{taskTitle}}" has been received successfully.

Submission Details:
- Task: {{taskTitle}}
- Submission Date: {{submissionDate}}
- Reference ID: {{submissionId}}

Your submission is now under review. You will be notified once it has been verified.

This is an automated email. Please do not reply to this message.`,
    placeholders: ['facultyName', 'taskTitle', 'submissionDate', 'submissionId'],
  },
  {
    id: 'approval-notification',
    name: 'Approval Notification',
    type: 'approval-notification',
    subject: '{{taskTitle}} - Approved',
    content: `Dear {{facultyName}},

Great news! Your submission for "{{taskTitle}}" has been approved.

Approval Details:
- Task: {{taskTitle}}
- Points Earned: {{pointsEarned}}
- Approval Date: {{approvalDate}}
- Status: Approved

Your achievement points have been updated in the system.

This is an automated email. Please do not reply to this message.`,
    placeholders: ['facultyName', 'taskTitle', 'pointsEarned', 'approvalDate'],
  },
]

const TEMPLATES_STORAGE_KEY = 'email-templates-v1'

export default function MailAlertsPage() {
  const { isMaintenance } = useRoles()
  const [templates, setTemplates] = useState<EmailTemplate[]>(DEFAULT_TEMPLATES)
  const [hasChanges, setHasChanges] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [dirtyMap, setDirtyMap] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY)
    if (!raw) return

    try {
      const parsed = JSON.parse(raw) as EmailTemplate[]
      setTemplates(parsed)
    } catch {
      localStorage.removeItem(TEMPLATES_STORAGE_KEY)
    }
  }, [])

  if (!isMaintenance()) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
        <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
          <div className="mb-3 inline-flex rounded-lg bg-red-50 p-2 text-red-600">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Access Restricted</h1>
          <p className="mt-1 text-sm text-slate-500">You do not have permission to access this page.</p>
        </div>
      </div>
    )
  }

  const handleTemplateUpdate = (id: string, field: keyof EmailTemplate, value: string) => {
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)))
    setHasChanges(true)
    setDirtyMap((prev) => ({ ...prev, [id]: true }))
  }

  const handleSaveAll = () => {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates))
    setHasChanges(false)
    setDirtyMap({})
    toast.success('Email templates saved successfully', { duration: 3000 })
  }

  const handleSaveTemplate = (id: string, label: string) => {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates))
    const nextDirtyMap = { ...dirtyMap, [id]: false }
    setDirtyMap(nextDirtyMap)
    setHasChanges(Object.values(nextDirtyMap).some(Boolean))
    toast.success(`${label} template saved`, { duration: 2500 })
  }

  const handleReset = () => {
    if (confirm('Are you sure? This will reset all templates to defaults.')) {
      setTemplates(DEFAULT_TEMPLATES)
      localStorage.removeItem(TEMPLATES_STORAGE_KEY)
      setHasChanges(false)
      setDirtyMap({})
      toast.success('Templates reset to defaults', { duration: 3000 })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this template? This cannot be undone.')) {
      setTemplates((prev) => prev.filter((t) => t.id !== id))
      setHasChanges(true)
      setDirtyMap((prev) => ({ ...prev, [id]: false }))
      toast.error('Template deleted', { duration: 3000 })
    }
  }

  const normalizedSearch = searchTerm.trim().toLowerCase()
  const filteredTemplates = templates.filter((template) => {
    if (!normalizedSearch) return true
    return (
      template.name.toLowerCase().includes(normalizedSearch) ||
      template.type.toLowerCase().includes(normalizedSearch) ||
      template.subject.toLowerCase().includes(normalizedSearch) ||
      template.content.toLowerCase().includes(normalizedSearch)
    )
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Mail className="w-6 h-6 text-violet-600" />
          Email Templates
        </h1>
        <p className="text-sm text-slate-500 mt-1">Manage template subject/content and personalize alert communication.</p>
      </div>

      <div className="space-y-6 animate-fade-in">
        <div className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, type, subject, or content"
                className="input-base pl-10 border-violet-200 focus:border-violet-400 focus:ring-violet-200"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Defaults
              </button>
              <button
                onClick={handleSaveAll}
                disabled={!hasChanges}
                className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                Save All
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="rounded-2xl border border-violet-100 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="border-b border-violet-100 bg-violet-50 px-6 py-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{template.name}</h2>
                    <p className="text-violet-700 text-sm mt-1">Type: {template.type}</p>
                  </div>
                  {template.type === 'custom' ? (
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="p-2 hover:bg-red-100 rounded transition-colors text-red-600"
                      title="Delete template"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Email Subject</label>
                  <input
                    type="text"
                    value={template.subject}
                    onChange={(e) => handleTemplateUpdate(template.id, 'subject', e.target.value)}
                    className="input-base border-violet-200 focus:border-violet-400 focus:ring-violet-200"
                    placeholder="Enter email subject"
                  />
                  <p className="text-xs text-slate-500 mt-1">Use {'{{placeholder}}'} syntax for dynamic values</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Email Content</label>
                  <textarea
                    value={template.content}
                    onChange={(e) => handleTemplateUpdate(template.id, 'content', e.target.value)}
                    rows={8}
                    className="input-base border-violet-200 focus:border-violet-400 focus:ring-violet-200 font-mono text-sm"
                    placeholder="Enter email content"
                  />
                  <p className="text-xs text-slate-500 mt-1">Use {'{{placeholder}}'} syntax for dynamic values</p>
                </div>

                <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-slate-900 mb-2">Available Placeholders:</p>
                  <div className="flex flex-wrap gap-2">
                    {template.placeholders.map((placeholder) => (
                      <code key={placeholder} className="bg-white border border-violet-200 text-slate-700 px-2 py-1 rounded text-xs font-mono">
                        {`{{${placeholder}}}`}
                      </code>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-violet-200 bg-violet-50 p-3">
                  <p className="text-xs text-violet-700">This template is used for: <strong>{template.type}</strong></p>
                  <button
                    type="button"
                    onClick={() => handleSaveTemplate(template.id, template.name)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-100"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {dirtyMap[template.id] ? 'Save This Template' : 'Saved'}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredTemplates.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50 p-6 text-sm text-slate-500 lg:col-span-2">
              No templates found for "{searchTerm}".
            </div>
          ) : null}
        </div>
      </div>

      {hasChanges ? (
        <div className="fixed bottom-6 right-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 shadow-lg">
          You have unsaved changes. Use Save This Template or Save All.
        </div>
      ) : null}
    </div>
  )
}
