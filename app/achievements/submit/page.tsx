'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'
import {
  ChevronLeft, Loader2, Plus, Trash2,
} from 'lucide-react'
import Link from 'next/link'

// Import hooks and components
import { useAchievementForm } from './hooks/useAchievementForm'
import {
  GuestLectureForm,
  OnlineCourseForm,
  PaperPresentationForm,
  EventsAttendedForm,
  EventsOrganisedForm,
} from './components/CategoryForms'
import { ACHIEVEMENT_CATEGORIES } from './constants'
import { submitAchievements, validateAchievement } from './services/achievementService'

/**
 * Main Achievement Submission Page
 * Manages multiple achievement submissions with role-based form rendering
 */
export default function AchievementsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Use the achievement form hook for all state management
  const {
    achievements,
    setAchievements,
    handleAchievementChange,
    removeAchievement,
    addAchievement,
    handleEventDataChange,
    handleEventsOrganisedChange,
    addInternalFacultyMember,
    removeInternalFacultyMember,
    updateInternalFacultyMember,
    addStudentMember,
    removeStudentMember,
    updateStudentMember,
    addGuestSpeaker,
    removeGuestSpeaker,
    updateGuestSpeaker,
    removeProofFile,
    handleGuestLectureChange,
    handleOnlineCourseChange,
    handlePaperPresentationChange,
  } = useAchievementForm()

  /**
   * Handle category-specific field changes
   * Routes to appropriate handler based on achievement category
   */
  const handleCategoryChange = (achievementId: string, field: string, value: string | File) => {
    const achievement = achievements.find(a => a.id === achievementId)
    if (!achievement) return

    switch (achievement.category) {
      case 'Events Attended':
        handleEventDataChange(achievementId, field, value)
        break
      case 'Events Organized':
        handleEventsOrganisedChange(achievementId, field, value)
        break
      case 'Guest Lecture Delivered':
        handleGuestLectureChange(achievementId, field, value)
        break
      case 'Online Course':
        handleOnlineCourseChange(achievementId, field, value)
        break
      case 'Paper Presentation':
        handlePaperPresentationChange(achievementId, field, value)
        break
      default:
        handleAchievementChange(achievementId, field, value)
    }
  }

  /**
   * Validate and submit all achievements
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all achievements
    for (const achievement of achievements) {
      const validation = validateAchievement(achievement)
      if (!validation.isValid) {
        toast.error(validation.errors[0] || 'Validation failed')
        return
      }
    }

    setIsSubmitting(true)
    try {
      if (!user?.id) {
        toast.error('User ID not found')
        return
      }

      const response = await submitAchievements(achievements, String(user.id))
      
      if (response.success) {
        toast.success('Achievements submitted for verification!')
        router.push('/dashboard')
      } else {
        toast.error(response.error || 'Failed to submit achievements')
      }
    } catch (error) {
      toast.error('An error occurred while submitting')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header Navigation */}
      <Link 
        href="/dashboard" 
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Submit Achievements</h1>
        <p className="text-sm text-slate-500 mt-1">
          Add your achievements with supporting evidence. You can add multiple achievements in different categories.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {achievements.map((achievement, idx) => (
          <div key={achievement.id} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            {/* Achievement Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-800">Achievement #{idx + 1}</h2>
              {achievements.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    removeAchievement(achievement.id)
                  }}
                  className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Basic Achievement Fields */}
            <div className="space-y-4 pb-4 border-b">
              <div>
                <label className="form-label">Category *</label>
                <select
                  value={achievement.category}
                  onChange={(e) => handleAchievementChange(achievement.id, 'category', e.target.value)}
                  className="form-select"
                  required
                >
                  <option value="">Select Category</option>
                  {ACHIEVEMENT_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.label}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category-Specific Forms */}
            {achievement.category === 'Guest Lecture Delivered' && (
              <GuestLectureForm
                achievement={achievement}
                onChange={(field, value) => handleCategoryChange(achievement.id, field, value)}
              />
            )}

            {achievement.category === 'Online Course' && (
              <OnlineCourseForm
                achievement={achievement}
                onChange={(field, value) => handleCategoryChange(achievement.id, field, value)}
              />
            )}

            {achievement.category === 'Paper Presentation' && (
              <PaperPresentationForm
                achievement={achievement}
                onChange={(field, value) => handleCategoryChange(achievement.id, field, value)}
              />
            )}

            {achievement.category === 'Events Attended' && (
              <EventsAttendedForm
                achievement={achievement}
                onChange={(field, value) => handleCategoryChange(achievement.id, field, value)}
              />
            )}

            {achievement.category === 'Events Organized' && (
              <EventsOrganisedForm
                achievement={achievement}
                onChange={(field, value) => handleCategoryChange(achievement.id, field, value)}
                onAddInternalFaculty={() => addInternalFacultyMember(achievement.id)}
                onRemoveInternalFaculty={(memberId) => removeInternalFacultyMember(achievement.id, memberId)}
                onUpdateInternalFaculty={(memberId, field, value) => 
                  updateInternalFacultyMember(achievement.id, memberId, field, value)
                }
                onAddStudent={() => addStudentMember(achievement.id)}
                onRemoveStudent={(studentId) => removeStudentMember(achievement.id, studentId)}
                onUpdateStudent={(studentId, name) => updateStudentMember(achievement.id, studentId, name)}
                onAddGuestSpeaker={() => addGuestSpeaker(achievement.id)}
                onRemoveGuestSpeaker={(speakerId) => removeGuestSpeaker(achievement.id, speakerId)}
                onUpdateGuestSpeaker={(speakerId, field, value) => 
                  updateGuestSpeaker(achievement.id, speakerId, field, value)
                }
                onRemoveProofFile={(index) => removeProofFile(achievement.id, index)}
              />
            )}

            {/* Message for non-implemented categories */}
            {achievement.category && 
             !['Guest Lecture Delivered', 'Online Course', 'Paper Presentation', 'Events Attended', 'Events Organized'].includes(achievement.category) && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Form for <strong>{achievement.category}</strong> is coming soon. Please use the basic fields above.
                </p>
              </div>
            )}
          </div>
        ))}

        {/* Add Achievement Button */}
        <button
          type="button"
          onClick={addAchievement}
          className="w-full py-3 px-4 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Another Achievement
        </button>

        {/* Submit Button */}
        <div className="flex gap-3 pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Achievements'
            )}
          </button>
          <Link
            href="/dashboard"
            className="px-6 py-3 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-semibold"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
