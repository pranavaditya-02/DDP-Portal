'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'
import {
  Upload, Calendar, Tag, Info,
  ChevronLeft, Loader2, CheckCircle2, Trash2, Plus,
} from 'lucide-react'
import Link from 'next/link'

const ACTION_PLAN_CATEGORIES = [
  { id: 1, label: 'Faculty Action Plan' },
  { id: 2, label: 'Journal Publication' },
  { id: 3, label: 'Patent' },
  { id: 4, label: 'Consultancy' },
  { id: 5, label: 'Funding' },
  { id: 6, label: 'Conference Publication' },
  { id: 7, label: 'Online Course' },
  { id: 8, label: 'Faculty Development and Industry Engagement' },
  { id: 9, label: 'Competency' },
]

interface ActionPlan {
  id: string
  category: string
  title: string
  description: string
  targetDate: string
  expectedOutcome: string
  image?: File
  imagePreview?: string
}

export default function SubmitActionPlanPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [plans, setPlans] = useState<ActionPlan[]>([
    {
      id: '1',
      category: '',
      title: '',
      description: '',
      targetDate: '',
      expectedOutcome: '',
    },
  ])

  const handleAddMore = () => {
    setPlans([
      ...plans,
      {
        id: Date.now().toString(),
        category: '',
        title: '',
        description: '',
        targetDate: '',
        expectedOutcome: '',
      },
    ])
  }

  const handleRemove = (id: string) => {
    if (plans.length > 1) {
      setPlans(plans.filter(p => p.id !== id))
      toast.success('Action plan removed')
    } else {
      toast.error('You must have at least one action plan')
    }
  }

  const handlePlanChange = (
    id: string,
    field: keyof ActionPlan,
    value: string | File
  ) => {
    setPlans(plans.map(p => {
      if (p.id === id) {
        if (field === 'image' && value instanceof File) {
          const reader = new FileReader()
          reader.onloadend = () => {
            setPlans(prev =>
              prev.map(item =>
                item.id === id
                  ? {
                      ...item,
                      image: value,
                      imagePreview: reader.result as string,
                    }
                  : item
              )
            )
          }
          reader.readAsDataURL(value)
          return p
        }
        return { ...p, [field]: value }
      }
      return p
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const isValid = plans.every(p => p.category && p.title && p.targetDate && p.expectedOutcome && p.image)
    if (!isValid) {
      toast.error('Please fill in all required fields and upload images for all action plans')
      return
    }

    setIsSubmitting(true)
    // Simulate API call
    await new Promise(r => setTimeout(r, 1200))
    toast.success('Action plans submitted for verification!')
    setIsSubmitting(false)
    router.push('/dashboard')
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Back link */}
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Submit Action Plan</h1>
        <p className="text-sm text-slate-500 mt-1">Define your action plans across different categories. Each plan should have supporting documentation.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Action Plans List */}
        {plans.map((plan, idx) => (
          <div key={plan.id} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-800">Action Plan #{idx + 1}</h2>
              {plans.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemove(plan.id)}
                  className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category *</label>
              <select
                value={plan.category}
                onChange={(e) => handlePlanChange(plan.id, 'category', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
              >
                <option value="">Select a category…</option>
                {ACTION_PLAN_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.label}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Plan Title *</label>
              <input
                type="text"
                value={plan.title}
                onChange={(e) => handlePlanChange(plan.id, 'title', e.target.value)}
                placeholder="Enter action plan title"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <textarea
                value={plan.description}
                onChange={(e) => handlePlanChange(plan.id, 'description', e.target.value)}
                placeholder="Describe the action plan in detail"
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
              />
            </div>

            {/* Target Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Target Date *</label>
              <input
                type="date"
                value={plan.targetDate}
                onChange={(e) => handlePlanChange(plan.id, 'targetDate', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            {/* Expected Outcome */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Expected Outcome *</label>
              <textarea
                value={plan.expectedOutcome}
                onChange={(e) => handlePlanChange(plan.id, 'expectedOutcome', e.target.value)}
                placeholder="What is the expected outcome of this action plan?"
                rows={2}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                required
              />
            </div>

            {/* Document/Image Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Supporting Document/Image *</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handlePlanChange(plan.id, 'image', e.target.files[0])
                    }
                  }}
                  className="hidden"
                  id={`file-${plan.id}`}
                  required
                />
                <label
                  htmlFor={`file-${plan.id}`}
                  className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  {plan.imagePreview ? (
                    <div className="text-center">
                      {plan.image?.type.startsWith('image/') ? (
                        <>
                          <img src={plan.imagePreview} alt="Preview" className="max-h-32 mx-auto mb-2 rounded" />
                          <p className="text-sm text-slate-600">{plan.image?.name}</p>
                        </>
                      ) : (
                        <>
                          <Tag className="w-8 h-8 mx-auto text-blue-400 mb-2" />
                          <p className="text-sm text-slate-600">{plan.image?.name}</p>
                        </>
                      )}
                      <p className="text-xs text-slate-500 mt-1">Click to change file</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-sm font-medium text-slate-600">Click to upload or drag and drop</p>
                      <p className="text-xs text-slate-500 mt-1">PNG, JPG, PDF, DOC, DOCX up to 10MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>
        ))}

        {/* Add More Button */}
        <button
          type="button"
          onClick={handleAddMore}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Another Action Plan
        </button>

        {/* Submit Button */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Submit Action Plans
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
