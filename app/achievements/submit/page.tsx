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

const ACHIEVEMENT_CATEGORIES = [
  { id: 1, label: 'Newsletter Archive' },
  { id: 2, label: 'E-Content Developed' },
  { id: 3, label: 'Events Attended' },
  { id: 4, label: 'Events Organized' },
  { id: 5, label: 'External Examiner' },
  { id: 6, label: 'Faculty Journal Reviewer' },
  { id: 7, label: 'Guest Lecture Delivered' },
  { id: 8, label: 'International Visit' },
  { id: 9, label: 'Notable Achievement/Awards' },
  { id: 10, label: 'Paper Presentation' },
  { id: 11, label: 'Resource Person' },
  { id: 12, label: 'Online Course' },
]

const SPECIAL_LAB_NAMES = ['Lab 1', 'Lab 2', 'Lab 3', 'Lab 4', 'Lab 5']
const EVENT_TYPES = ['Conference', 'Workshop', 'Seminar', 'Training', 'Webinar']
const ORGANIZER_TYPES = ['BIT', 'Industry', 'Foreign Institute', 'Others', 'Institute']
const EVENT_LEVELS = ['International', 'National', 'State', 'Local']
const SECTORS = ['Private', 'Government', 'Non-Profit']
const EVENT_MODES = ['Online', 'Offline', 'Hybrid']
const DURATION_UNITS = ['MONTHS', 'WEEKS', 'HOURS', 'DAYS']
const SPONSORSHIP_TYPES = ['Fully Sponsored', 'Partially Sponsored', 'Self-Sponsored']
const EVENT_OUTCOMES = ['Certificate Received', 'Award/Recognition', 'Knowledge Gained', 'Networking']

const DEPARTMENTS = [
  'Aeronautical Engineering',
  'Agricultural Engineering',
  'Artificial Intelligence and Data Science',
  'Artificial Intelligence and Machine Learning',
  'Automobile Engineering',
  'Biomedical Engineering',
  'Biotechnology',
  'Chemistry',
  'Civil Engineering',
  'Computer Applications - CT',
  'Computer Science & Engineering',
  'Computer Science and Business Systems',
  'Computer Science and Design',
  'Computer Technology',
  'Dean Office',
  'Electrical and Electronics Engineering',
  'Electronics and Communication Engineering',
  'Electronics and Instrumentation Engineering',
  'Fashion Technology',
  'Food Technology',
  'General Engineering',
  'Humanities',
  'Industrial Safety Engineering',
  'Information Science and Engineering',
  'Information Technology',
  'Library',
  'Master of Business Applications',
  'Mathematics',
  'Mechanical Engineering',
  'Mechatronics Engineering',
  'Physical Education',
  'Physics',
  'School of Management Studies',
  'Sports',
  'Technology Business Incubators',
  'Textile Technology',
  'Training and Placement',
  'Yoga',
]

const ROLES = ['Convener', 'Co-Convener', 'Co-ordinator', 'Organizing Secretary']
const EVENT_CATEGORIES = [
  'Awareness of Trends in Technology',
  'IPR',
  'Research Methodology',
  'Entrepreneurship',
  'Placement',
  'Technical Skill Development',
  'Life Skill',
  'Soft Skill',
  'Communication Skill',
]
const JOINTLY_ORGANIZED = ['None', 'Other institute in India', 'Foreign university', 'Industry', 'Technical society']
const GUEST_INSTITUTION_TYPES = ['International', 'National (Within TamilNadu)', 'National (Outside TamilNadu)']

interface EventsAttendedData {
  taskId: string
  specialLabsInvolved: string
  specialLabName?: string
  eventType: string
  organizerType: string
  eventLevel: string
  eventTitle: string
  organizationSector: string
  eventOrganizer: string
  eventMode: string
  eventDuration: string
  eventDurationValue: string
  eventDate: string
  endDate: string
  durationInDays: string
  otherOrganizerName?: string
  sponsorshipType: string
  eventOutcome: string
  certificateProof?: File
  certificatePreview?: string
  geotagPhotos?: File
  geotagPreview?: string
}

interface InternalFacultyMember {
  id: string
  name: string
  role: string
}

interface StudentMember {
  id: string
  name: string
}

interface GuestSpeaker {
  id: string
  type: string
  name: string
  designation: string
  email: string
  contact: string
  organization: string
}

interface EventsOrganisedData {
  taskId: string
  facultyName: string
  facultyRole: string
  claimedDepartment: string
  specialLabsInvolved: string
  iicEvent: string
  iicEventUpload: string
  iicBipId: string
  deptAssociation: string
  rAndD: string
  technicalSociety: string
  mouOutcome: string
  mouBipId: string
  irpOutcome: string
  irpBipId: string
  coeOrganized: string
  coeBipId: string
  islOrganized: string
  islBipId: string
  internalFaculty: InternalFacultyMember[]
  students: StudentMember[]
  eventName: string
  eventType: string
  eventCategory: string
  programType: string
  eventMode: string
  startDate: string
  endDate: string
  eventDuration: string
  eventLevel: string
  jointlyOrganizedWith: string
  internalStudentParticipants: string
  internalFacultyParticipants: string
  externalStudentParticipants: string
  externalFacultyParticipants: string
  guestSpeakerType: string
  alumniGuestSpeaker: string
  guestSpeakers: GuestSpeaker[]
  registrationAmount: string
  sponsorshipAmount: string
  managementAmount: string
  fundingAgency: string
  totalRevenue: string
  proofFiles?: File[]
  proofFilePreviews?: string[]
}

interface Achievement {
  id: string
  category: string
  title: string
  description: string
  date: string
  image?: File
  imagePreview?: string
  eventsAttendedData?: EventsAttendedData
  eventsOrganisedData?: EventsOrganisedData
}

export default function SubmitAchievementsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: '1',
      category: '',
      title: '',
      description: '',
      date: '',
    },
  ])

  const handleAddMore = () => {
    setAchievements([
      ...achievements,
      {
        id: Date.now().toString(),
        category: '',
        title: '',
        description: '',
        date: '',
      },
    ])
  }

  const handleRemove = (id: string) => {
    if (achievements.length > 1) {
      setAchievements(achievements.filter(a => a.id !== id))
      toast.success('Achievement removed')
    } else {
      toast.error('You must have at least one achievement')
    }
  }

  const handleAchievementChange = (
    id: string,
    field: string,
    value: string | File
  ) => {
    setAchievements(achievements.map(a => {
      if (a.id === id) {
        if (field === 'image' && value instanceof File) {
          const reader = new FileReader()
          reader.onloadend = () => {
            setAchievements(prev =>
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
          return a
        }
        return { ...a, [field]: value }
      }
      return a
    }))
  }

  const handleEventDataChange = (
    achievementId: string,
    field: string,
    value: string | File
  ) => {
    setAchievements(achievements.map(a => {
      if (a.id === achievementId) {
        const eventData = a.eventsAttendedData || {
          taskId: '',
          specialLabsInvolved: '',
          eventType: '',
          organizerType: '',
          eventLevel: '',
          eventTitle: '',
          organizationSector: '',
          eventOrganizer: '',
          eventMode: '',
          eventDuration: '',
          eventDurationValue: '',
          eventDate: '',
          endDate: '',
          durationInDays: '',
          sponsorshipType: '',
          eventOutcome: '',
        }

        if ((field === 'certificateProof' || field === 'geotagPhotos') && value instanceof File) {
          const reader = new FileReader()
          reader.onloadend = () => {
            setAchievements(prev =>
              prev.map(item =>
                item.id === achievementId
                  ? {
                      ...item,
                      eventsAttendedData: {
                        ...eventData,
                        [field]: value,
                        [field === 'certificateProof' ? 'certificatePreview' : 'geotagPreview']: reader.result as string,
                      },
                    }
                  : item
              )
            )
          }
          reader.readAsDataURL(value)
          return a
        }

        return {
          ...a,
          eventsAttendedData: { ...eventData, [field]: value },
        }
      }
      return a
    }))
  }

  const handleEventsOrganisedChange = (
    achievementId: string,
    field: string,
    value: string | File
  ) => {
    setAchievements(achievements.map(a => {
      if (a.id === achievementId) {
        const eventData = a.eventsOrganisedData || {
          taskId: '',
          facultyName: '',
          facultyRole: '',
          claimedDepartment: '',
          specialLabsInvolved: '',
          iicEvent: '',
          iicEventUpload: '',
          iicBipId: '',
          deptAssociation: '',
          rAndD: '',
          technicalSociety: '',
          mouOutcome: '',
          mouBipId: '',
          irpOutcome: '',
          irpBipId: '',
          coeOrganized: '',
          coeBipId: '',
          islOrganized: '',
          islBipId: '',
          internalFaculty: [],
          students: [],
          eventName: '',
          eventType: '',
          eventCategory: '',
          programType: '',
          eventMode: '',
          startDate: '',
          endDate: '',
          eventDuration: '',
          eventLevel: '',
          jointlyOrganizedWith: '',
          internalStudentParticipants: '',
          internalFacultyParticipants: '',
          externalStudentParticipants: '',
          externalFacultyParticipants: '',
          guestSpeakerType: '',
          alumniGuestSpeaker: '',
          guestSpeakers: [],
          registrationAmount: '',
          sponsorshipAmount: '',
          managementAmount: '',
          fundingAgency: '',
          totalRevenue: '',
          proofFiles: [],
          proofFilePreviews: [],
        }

        if (field === 'proofFiles' && value instanceof File) {
          const reader = new FileReader()
          reader.onloadend = () => {
            setAchievements(prev =>
              prev.map(item =>
                item.id === achievementId
                  ? {
                      ...item,
                      eventsOrganisedData: {
                        ...eventData,
                        proofFiles: [...(eventData.proofFiles || []), value],
                        proofFilePreviews: [...(eventData.proofFilePreviews || []), reader.result as string],
                      },
                    }
                  : item
              )
            )
          }
          reader.readAsDataURL(value)
          return a
        }

        return {
          ...a,
          eventsOrganisedData: { ...eventData, [field]: value },
        }
      }
      return a
    }))
  }

  const addInternalFacultyMember = (achievementId: string) => {
    setAchievements(achievements.map(a => {
      if (a.id === achievementId) {
        const eventData = a.eventsOrganisedData
        if (!eventData) return a
        return {
          ...a,
          eventsOrganisedData: {
            ...eventData,
            internalFaculty: [...eventData.internalFaculty, { id: Date.now().toString(), name: '', role: '' }],
          },
        }
      }
      return a
    }))
  }

  const removeInternalFacultyMember = (achievementId: string, memberId: string) => {
    setAchievements(achievements.map(a => {
      if (a.id === achievementId) {
        const eventData = a.eventsOrganisedData
        if (!eventData) return a
        return {
          ...a,
          eventsOrganisedData: {
            ...eventData,
            internalFaculty: eventData.internalFaculty.filter(f => f.id !== memberId),
          },
        }
      }
      return a
    }))
  }

  const updateInternalFacultyMember = (achievementId: string, memberId: string, field: string, value: string) => {
    setAchievements(achievements.map(a => {
      if (a.id === achievementId) {
        const eventData = a.eventsOrganisedData
        if (!eventData) return a
        return {
          ...a,
          eventsOrganisedData: {
            ...eventData,
            internalFaculty: eventData.internalFaculty.map(f =>
              f.id === memberId ? { ...f, [field]: value } : f
            ),
          },
        }
      }
      return a
    }))
  }

  const addStudentMember = (achievementId: string) => {
    setAchievements(achievements.map(a => {
      if (a.id === achievementId) {
        const eventData = a.eventsOrganisedData
        if (!eventData) return a
        return {
          ...a,
          eventsOrganisedData: {
            ...eventData,
            students: [...eventData.students, { id: Date.now().toString(), name: '' }],
          },
        }
      }
      return a
    }))
  }

  const removeStudentMember = (achievementId: string, studentId: string) => {
    setAchievements(achievements.map(a => {
      if (a.id === achievementId) {
        const eventData = a.eventsOrganisedData
        if (!eventData) return a
        return {
          ...a,
          eventsOrganisedData: {
            ...eventData,
            students: eventData.students.filter(s => s.id !== studentId),
          },
        }
      }
      return a
    }))
  }

  const updateStudentMember = (achievementId: string, studentId: string, name: string) => {
    setAchievements(achievements.map(a => {
      if (a.id === achievementId) {
        const eventData = a.eventsOrganisedData
        if (!eventData) return a
        return {
          ...a,
          eventsOrganisedData: {
            ...eventData,
            students: eventData.students.map(s =>
              s.id === studentId ? { ...s, name } : s
            ),
          },
        }
      }
      return a
    }))
  }

  const addGuestSpeaker = (achievementId: string) => {
    setAchievements(achievements.map(a => {
      if (a.id === achievementId) {
        const eventData = a.eventsOrganisedData
        if (!eventData) return a
        return {
          ...a,
          eventsOrganisedData: {
            ...eventData,
            guestSpeakers: [...eventData.guestSpeakers, {
              id: Date.now().toString(),
              type: '',
              name: '',
              designation: '',
              email: '',
              contact: '',
              organization: '',
            }],
          },
        }
      }
      return a
    }))
  }

  const removeGuestSpeaker = (achievementId: string, speakerId: string) => {
    setAchievements(achievements.map(a => {
      if (a.id === achievementId) {
        const eventData = a.eventsOrganisedData
        if (!eventData) return a
        return {
          ...a,
          eventsOrganisedData: {
            ...eventData,
            guestSpeakers: eventData.guestSpeakers.filter(g => g.id !== speakerId),
          },
        }
      }
      return a
    }))
  }

  const updateGuestSpeaker = (achievementId: string, speakerId: string, field: string, value: string) => {
    setAchievements(achievements.map(a => {
      if (a.id === achievementId) {
        const eventData = a.eventsOrganisedData
        if (!eventData) return a
        return {
          ...a,
          eventsOrganisedData: {
            ...eventData,
            guestSpeakers: eventData.guestSpeakers.map(g =>
              g.id === speakerId ? { ...g, [field]: value } : g
            ),
          },
        }
      }
      return a
    }))
  }

  const removeProofFile = (achievementId: string, index: number) => {
    setAchievements(achievements.map(a => {
      if (a.id === achievementId) {
        const eventData = a.eventsOrganisedData
        if (!eventData) return a
        return {
          ...a,
          eventsOrganisedData: {
            ...eventData,
            proofFiles: eventData.proofFiles?.filter((_, i) => i !== index) || [],
            proofFilePreviews: eventData.proofFilePreviews?.filter((_, i) => i !== index) || [],
          },
        }
      }
      return a
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    for (const achievement of achievements) {
      if (!achievement.category || !achievement.title || !achievement.date) {
        toast.error('Please fill in all required basic fields')
        return
      }

      if (achievement.category === 'Events Attended') {
        const data = achievement.eventsAttendedData
        if (!data || !data.taskId || !data.eventType || !data.organizerType || !data.eventLevel ||
          !data.eventTitle || !data.organizationSector || !data.eventOrganizer || !data.eventMode ||
          !data.eventDuration || !data.eventDurationValue || !data.eventDate || !data.endDate ||
          !data.durationInDays || !data.sponsorshipType || !data.eventOutcome ||
          !data.certificateProof || !data.geotagPhotos) {
          toast.error('Please fill in all required fields for Events Attended')
          return
        }
      }

      if (achievement.category === 'Events Organized') {
        const data = achievement.eventsOrganisedData
        if (!data || !data.taskId || !data.facultyName || !data.facultyRole || !data.claimedDepartment ||
          !data.eventName || !data.eventType || !data.eventCategory || !data.programType ||
          !data.eventMode || !data.startDate || !data.endDate || !data.eventLevel) {
          toast.error('Please fill in all required fields for Events Organized')
          return
        }
      }
    }

    setIsSubmitting(true)
    await new Promise(r => setTimeout(r, 1200))
    toast.success('Achievements submitted for verification!')
    setIsSubmitting(false)
    router.push('/dashboard')
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Submit Achievements</h1>
        <p className="text-sm text-slate-500 mt-1">Add your achievements with supporting evidence. You can add multiple achievements in different categories.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {achievements.map((achievement, idx) => (
          <div key={achievement.id} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-800">Achievement #{idx + 1}</h2>
              {achievements.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemove(achievement.id)}
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
                value={achievement.category}
                onChange={(e) => handleAchievementChange(achievement.id, 'category', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
              >
                <option value="">Select a category…</option>
                {ACHIEVEMENT_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.label}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Events Attended Form */}
            {achievement.category === 'Events Attended' && (
              <div className="space-y-5 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-slate-800">Event Details</h3>

                {/* Task ID */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Task ID *</label>
                  <input
                    type="text"
                    value={achievement.eventsAttendedData?.taskId || ''}
                    onChange={(e) => handleEventDataChange(achievement.id, 'taskId', e.target.value)}
                    placeholder="Enter task ID"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                {/* Special Labs Involved */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Special Labs Involved *</label>
                    <select
                      value={achievement.eventsAttendedData?.specialLabsInvolved || ''}
                      onChange={(e) => handleEventDataChange(achievement.id, 'specialLabsInvolved', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      required
                    >
                      <option value="">Choose an option</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  {achievement.eventsAttendedData?.specialLabsInvolved === 'Yes' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Special Lab Name *</label>
                      <select
                        value={achievement.eventsAttendedData?.specialLabName || ''}
                        onChange={(e) => handleEventDataChange(achievement.id, 'specialLabName', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      >
                        <option value="">Choose lab</option>
                        {SPECIAL_LAB_NAMES.map(lab => (
                          <option key={lab} value={lab}>{lab}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Event Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Event Type *</label>
                  <select
                    value={achievement.eventsAttendedData?.eventType || ''}
                    onChange={(e) => handleEventDataChange(achievement.id, 'eventType', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    required
                  >
                    <option value="">Click to choose</option>
                    {EVENT_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Organizer Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Organizer Type *</label>
                  <select
                    value={achievement.eventsAttendedData?.organizerType || ''}
                    onChange={(e) => handleEventDataChange(achievement.id, 'organizerType', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    required
                  >
                    <option value="">Choose an option</option>
                    {ORGANIZER_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Event Level */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Event Level *</label>
                  <select
                    value={achievement.eventsAttendedData?.eventLevel || ''}
                    onChange={(e) => handleEventDataChange(achievement.id, 'eventLevel', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    required
                  >
                    <option value="">Choose an option</option>
                    {EVENT_LEVELS.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                {/* Event Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Event Title *</label>
                  <input
                    type="text"
                    value={achievement.eventsAttendedData?.eventTitle || ''}
                    onChange={(e) => handleEventDataChange(achievement.id, 'eventTitle', e.target.value)}
                    placeholder="Enter event title"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                {/* Organization Sector */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Organization Sector *</label>
                  <select
                    value={achievement.eventsAttendedData?.organizationSector || ''}
                    onChange={(e) => handleEventDataChange(achievement.id, 'organizationSector', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    required
                  >
                    <option value="">Choose an option</option>
                    {SECTORS.map(sector => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                </div>

                {/* Event Organizer */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Event Organizer *</label>
                  <input
                    type="text"
                    value={achievement.eventsAttendedData?.eventOrganizer || ''}
                    onChange={(e) => handleEventDataChange(achievement.id, 'eventOrganizer', e.target.value)}
                    placeholder="Enter event organizer name"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                {/* Event Mode */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Event Mode *</label>
                  <select
                    value={achievement.eventsAttendedData?.eventMode || ''}
                    onChange={(e) => handleEventDataChange(achievement.id, 'eventMode', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    required
                  >
                    <option value="">Choose an option</option>
                    {EVENT_MODES.map(mode => (
                      <option key={mode} value={mode}>{mode}</option>
                    ))}
                  </select>
                </div>

                {/* Event Duration */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Event Duration Unit *</label>
                    <select
                      value={achievement.eventsAttendedData?.eventDuration || ''}
                      onChange={(e) => handleEventDataChange(achievement.id, 'eventDuration', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      required
                    >
                      <option value="">Choose an option</option>
                      {DURATION_UNITS.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Duration Value *</label>
                    <input
                      type="number"
                      value={achievement.eventsAttendedData?.eventDurationValue || ''}
                      onChange={(e) => handleEventDataChange(achievement.id, 'eventDurationValue', e.target.value)}
                      placeholder="e.g., 5"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Event Date & End Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Event Date *</label>
                    <input
                      type="date"
                      value={achievement.eventsAttendedData?.eventDate || ''}
                      onChange={(e) => handleEventDataChange(achievement.id, 'eventDate', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">End Date *</label>
                    <input
                      type="date"
                      value={achievement.eventsAttendedData?.endDate || ''}
                      onChange={(e) => handleEventDataChange(achievement.id, 'endDate', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Duration in Days */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Duration (in days) *</label>
                  <input
                    type="number"
                    value={achievement.eventsAttendedData?.durationInDays || ''}
                    onChange={(e) => handleEventDataChange(achievement.id, 'durationInDays', e.target.value)}
                    placeholder="e.g., 3"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                {/* Other Organizer Name */}
                {achievement.eventsAttendedData?.organizerType === 'Others' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Other Organizer Name *</label>
                    <input
                      type="text"
                      value={achievement.eventsAttendedData?.otherOrganizerName || ''}
                      onChange={(e) => handleEventDataChange(achievement.id, 'otherOrganizerName', e.target.value)}
                      placeholder="Specify other organizer"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                )}

                {/* Sponsorship Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Type of Sponsorship *</label>
                  <select
                    value={achievement.eventsAttendedData?.sponsorshipType || ''}
                    onChange={(e) => handleEventDataChange(achievement.id, 'sponsorshipType', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    required
                  >
                    <option value="">Click to choose</option>
                    {SPONSORSHIP_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Event Outcome */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Outcome of the attended event *</label>
                  <select
                    value={achievement.eventsAttendedData?.eventOutcome || ''}
                    onChange={(e) => handleEventDataChange(achievement.id, 'eventOutcome', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    required
                  >
                    <option value="">Click to choose</option>
                    {EVENT_OUTCOMES.map(outcome => (
                      <option key={outcome} value={outcome}>{outcome}</option>
                    ))}
                  </select>
                </div>

                {/* Certificate Proof */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Certificate Proof *</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleEventDataChange(achievement.id, 'certificateProof', e.target.files[0])
                        }
                      }}
                      className="hidden"
                      id={`cert-${achievement.id}`}
                      required
                    />
                    <label
                      htmlFor={`cert-${achievement.id}`}
                      className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      {achievement.eventsAttendedData?.certificatePreview ? (
                        <div className="text-center">
                          <p className="text-sm text-slate-600">{achievement.eventsAttendedData.certificateProof?.name}</p>
                          <p className="text-xs text-slate-500 mt-1">Click to change</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                          <p className="text-sm font-medium text-slate-600">Choose File</p>
                          <p className="text-xs text-slate-500 mt-1">Drop file or click to choose</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Geotag Photos */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Upload Geotag Photos *</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleEventDataChange(achievement.id, 'geotagPhotos', e.target.files[0])
                        }
                      }}
                      className="hidden"
                      id={`geotag-${achievement.id}`}
                      required
                    />
                    <label
                      htmlFor={`geotag-${achievement.id}`}
                      className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      {achievement.eventsAttendedData?.geotagPreview ? (
                        <div className="text-center">
                          <img src={achievement.eventsAttendedData.geotagPreview} alt="Geotag" className="max-h-24 mx-auto mb-2 rounded" />
                          <p className="text-sm text-slate-600">{achievement.eventsAttendedData.geotagPhotos?.name}</p>
                          <p className="text-xs text-slate-500 mt-1">Click to change</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                          <p className="text-sm font-medium text-slate-600">Choose File</p>
                          <p className="text-xs text-slate-500 mt-1">Drop file or click to choose</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Events Organized Form */}
            {achievement.category === 'Events Organized' && (
              <div className="space-y-5 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-slate-800">Events Organized Details</h3>

                {/* Faculty Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Task ID *</label>
                    <input type="text" value={achievement.eventsOrganisedData?.taskId || ''} onChange={(e) => handleEventsOrganisedChange(achievement.id, 'taskId', e.target.value)} placeholder="Enter task ID" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Name of the Faculty *</label>
                    <input type="text" value={achievement.eventsOrganisedData?.facultyName || ''} onChange={(e) => handleEventsOrganisedChange(achievement.id, 'facultyName', e.target.value)} placeholder="Enter faculty name" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Role *</label>
                    <select value={achievement.eventsOrganisedData?.facultyRole || ''} onChange={(e) => handleEventsOrganisedChange(achievement.id, 'facultyRole', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" required>
                      <option value="">Choose an option</option>
                      {ROLES.map(role => (<option key={role} value={role}>{role}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Claimed Department *</label>
                    <select value={achievement.eventsOrganisedData?.claimedDepartment || ''} onChange={(e) => handleEventsOrganisedChange(achievement.id, 'claimedDepartment', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" required>
                      <option value="">—</option>
                      {DEPARTMENTS.map(dept => (<option key={dept} value={dept}>{dept}</option>))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Special Labs Involved</label>
                  <select value={achievement.eventsOrganisedData?.specialLabsInvolved || ''} onChange={(e) => handleEventsOrganisedChange(achievement.id, 'specialLabsInvolved', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
                    <option value="">Choose an option</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                {/* Event Classifications */}
                <div className="pt-4 border-t border-blue-300">
                  <h4 className="font-medium text-slate-800 mb-4">Event Classifications</h4>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Whether this event comes under IIC</label>
                      <select value={achievement.eventsOrganisedData?.iicEvent || ''} onChange={(e) => handleEventsOrganisedChange(achievement.id, 'iicEvent', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
                        <option value="">Choose an option</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    {achievement.eventsOrganisedData?.iicEvent === 'Yes' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Is this event upload under IIC</label>
                        <select value={achievement.eventsOrganisedData?.iicEventUpload || ''} onChange={(e) => handleEventsOrganisedChange(achievement.id, 'iicEventUpload', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
                          <option value="">Choose an option</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {achievement.eventsOrganisedData?.iicEventUpload === 'Yes' && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-700 mb-2">IIC BIP ID</label>
                      <input type="text" value={achievement.eventsOrganisedData?.iicBipId || ''} onChange={(e) => handleEventsOrganisedChange(achievement.id, 'iicBipId', e.target.value)} placeholder="Enter BIP ID" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Is this event belongs to Department Association</label>
                      <select value={achievement.eventsOrganisedData?.deptAssociation || ''} onChange={(e) => handleEventsOrganisedChange(achievement.id, 'deptAssociation', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
                        <option value="">Choose an option</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Is this event organized by R & D</label>
                      <select value={achievement.eventsOrganisedData?.rAndD || ''} onChange={(e) => handleEventsOrganisedChange(achievement.id, 'rAndD', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
                        <option value="">Choose an option</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Is this event involved under Technical Society</label>
                    <select value={achievement.eventsOrganisedData?.technicalSociety || ''} onChange={(e) => handleEventsOrganisedChange(achievement.id, 'technicalSociety', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all mb-4">
                      <option value="">Choose an option</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Is this event an outcome of MoU</label>
                      <select value={achievement.eventsOrganisedData?.mouOutcome || ''} onChange={(e) => handleEventsOrganisedChange(achievement.id, 'mouOutcome', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
                        <option value="">Choose an option</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    {achievement.eventsOrganisedData?.mouOutcome === 'Yes' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">BIP ID of MoU entry</label>
                        <input type="text" value={achievement.eventsOrganisedData?.mouBipId || ''} onChange={(e) => handleEventsOrganisedChange(achievement.id, 'mouBipId', e.target.value)} placeholder="Enter BIP ID" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Is this event an outcome of an IRP visit</label>
                      <select value={achievement.eventsOrganisedData?.irpOutcome || ''} onChange={(e) => handleEventsOrganisedChange(achievement.id, 'irpOutcome', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
                        <option value="">Choose an option</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    {achievement.eventsOrganisedData?.irpOutcome === 'Yes' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">BIP ID of IRP Visits</label>
                        <input type="text" value={achievement.eventsOrganisedData?.irpBipId || ''} onChange={(e) => handleEventsOrganisedChange(achievement.id, 'irpBipId', e.target.value)} placeholder="Enter BIP ID" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Is this event organized through the Centre of Excellence</label>
                      <select value={achievement.eventsOrganisedData?.coeOrganized || ''} onChange={(e) => handleEventsOrganisedChange(achievement.id, 'coeOrganized', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
                        <option value="">Choose an option</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    {achievement.eventsOrganisedData?.coeOrganized === 'Yes' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">OWI Centre Of Excellence BIP ID</label>
                        <input type="text" value={achievement.eventsOrganisedData?.coeBipId || ''} onChange={(e) => handleEventsOrganisedChange(achievement.id, 'coeBipId', e.target.value)} placeholder="Enter BIP ID" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Is this event organized through Industry Supported Laboratories</label>
                      <select value={achievement.eventsOrganisedData?.islOrganized || ''} onChange={(e) => handleEventsOrganisedChange(achievement.id, 'islOrganized', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
                        <option value="">Choose an option</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    {achievement.eventsOrganisedData?.islOrganized === 'Yes' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">BIP ID of CoE entry</label>
                        <input type="text" value={achievement.eventsOrganisedData?.islBipId || ''} onChange={(e) => handleEventsOrganisedChange(achievement.id, 'islBipId', e.target.value)} placeholder="Enter BIP ID" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Internal Faculty Members */}
                <div className="pt-4 border-t border-blue-300">
                  <h4 className="font-medium text-slate-800 mb-3">Internal Faculty Members</h4>
                  <div className="space-y-3">
                    {achievement.eventsOrganisedData?.internalFaculty.map((faculty, idx) => (
                      <div key={faculty.id} className="p-3 bg-white rounded border border-slate-300 grid grid-cols-3 gap-2">
                        <input type="text" value={faculty.name} onChange={(e) => updateInternalFacultyMember(achievement.id, faculty.id, 'name', e.target.value)} placeholder="Faculty name" className="px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        <select value={faculty.role} onChange={(e) => updateInternalFacultyMember(achievement.id, faculty.id, 'role', e.target.value)} className="px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                          <option value="">Role</option>
                          {ROLES.map(role => (<option key={role} value={role}>{role}</option>))}
                        </select>
                        <button type="button" onClick={() => removeInternalFacultyMember(achievement.id, faculty.id)} className="p-2 hover:bg-red-50 rounded text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => addInternalFacultyMember(achievement.id)} className="mt-2 flex items-center gap-2 px-3 py-2 border border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium">
                    <Plus className="w-4 h-4" />
                    Add Faculty Member
                  </button>
                </div>

                {/* Student Members */}
                <div className="pt-4 border-t border-blue-300">
                  <h4 className="font-medium text-slate-800 mb-3">Student Members</h4>
                  <div className="space-y-2">
                    {achievement.eventsOrganisedData?.students.map((student, idx) => (
                      <div key={student.id} className="flex items-center gap-2">
                        <input type="text" value={student.name} onChange={(e) => updateStudentMember(achievement.id, student.id, e.target.value)} placeholder={`Student ${idx + 1} name`} className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        <button type="button" onClick={() => removeStudentMember(achievement.id, student.id)} className="p-2 hover:bg-red-50 rounded text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => addStudentMember(achievement.id)} className="mt-2 flex items-center gap-2 px-3 py-2 border border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium">
                    <Plus className="w-4 h-4" />
                    Add Student Member
                  </button>
                </div>

                {/* Event Details */}
                <div className="pt-4 border-t border-blue-300">
                  <h4 className="font-medium text-slate-800 mb-4">Event Details</h4>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Event Name *</label>
                    <input type="text" value={achievement.eventsOrganisedData?.eventName || ''} onChange={(e) => handleEventsOrganisedChange(achievement.id, 'eventName', e.target.value)} placeholder="Enter event name" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" required />
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Type of Program *</label>
                      <select value={achievement.eventsOrganisedData?.programType || ''} onChange={(e) => handleEventsOrganisedChange(achievement.id, 'programType', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" required>
                        <option value="">Choose an option</option>
                        <option value="Academic">Academic</option>
                        <option value="Non academic">Non academic</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Event Type *</label>
                      <select value={achievement.eventsOrganisedData?.eventType || ''} onChange={(e) => handleEventsOrganisedChange(achievement.id, 'eventType', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" required>
                        <option value="">Click to choose</option>
                        {EVENT_TYPES.map(type => (<option key={type} value={type}>{type}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Event Category *</label>
                      <select value={achievement.eventsOrganisedData?.eventCategory || ''} onChange={(e) => handleEventsOrganisedChange(achievement.id, 'eventCategory', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" required>
                        <option value="">Choose an option</option>
                        {EVENT_CATEGORIES.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Event Mode *</label>
                      <select value={achievement.eventsOrganisedData?.eventMode || ''} onChange={(e) => handleEventsOrganisedChange(achievement.id, 'eventMode', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" required>
                        <option value="">Choose an option</option>
                        {EVENT_MODES.map(mode => (<option key={mode} value={mode}>{mode}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Event Level *</label>
                      <select value={achievement.eventsOrganisedData?.eventLevel || ''} onChange={(e) => handleEventsOrganisedChange(achievement.id, 'eventLevel', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" required>
                        <option value="">Choose an option</option>
                        <option value="International">International</option>
                        <option value="National">National</option>
                        <option value="State">State</option>
                        <option value="Institute (BIT)">Institute (BIT)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Jointly organized with</label>
                      <select value={achievement.eventsOrganisedData?.jointlyOrganizedWith || ''} onChange={(e) => handleEventsOrganisedChange(achievement.id, 'jointlyOrganizedWith', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
                        <option value="">Choose an option</option>
                        {JOINTLY_ORGANIZED.map(org => (<option key={org} value={org}>{org}</option>))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Start Date *</label>
                      <input type="date" value={achievement.eventsOrganisedData?.startDate || ''} onChange={(e) => handleEventsOrganisedChange(achievement.id, 'startDate', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">End Date *</label>
                      <input type="date" value={achievement.eventsOrganisedData?.endDate || ''} onChange={(e) => handleEventsOrganisedChange(achievement.id, 'endDate', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Event Duration (In Days)</label>
                      <input type="number" value={achievement.eventsOrganisedData?.eventDuration || ''} onChange={(e) => handleEventsOrganisedChange(achievement.id, 'eventDuration', e.target.value)} placeholder="e.g., 3" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Internal Participants (Student)</label>
                      <input type="number" value={achievement.eventsOrganisedData?.internalStudentParticipants || ''} onChange={(e) => handleEventsOrganisedChange(achievement.id, 'internalStudentParticipants', e.target.value)} placeholder="0" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Internal Participants (Faculty)</label>
                      <input type="number" value={achievement.eventsOrganisedData?.internalFacultyParticipants || ''} onChange={(e) => handleEventsOrganisedChange(achievement.id, 'internalFacultyParticipants', e.target.value)} placeholder="0" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">External Participants (Student)</label>
                      <input type="number" value={achievement.eventsOrganisedData?.externalStudentParticipants || ''} onChange={(e) => handleEventsOrganisedChange(achievement.id, 'externalStudentParticipants', e.target.value)} placeholder="0" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">External Participants (Faculty)</label>
                      <input type="number" value={achievement.eventsOrganisedData?.externalFacultyParticipants || ''} onChange={(e) => handleEventsOrganisedChange(achievement.id, 'externalFacultyParticipants', e.target.value)} placeholder="0" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                    </div>
                  </div>
                </div>

                {/* Guest Speakers */}
                <div className="pt-4 border-t border-blue-300">
                  <h4 className="font-medium text-slate-800 mb-4">Guest Speakers</h4>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Invited Guest or Notable Speaker</label>
                      <select value={achievement.eventsOrganisedData?.guestSpeakerType || ''} onChange={(e) => handleEventsOrganisedChange(achievement.id, 'guestSpeakerType', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
                        <option value="">Choose an option</option>
                        <option value="Academic">Academic</option>
                        <option value="Industry">Industry</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Whether the resource person, an alumni of BIT</label>
                      <select value={achievement.eventsOrganisedData?.alumniGuestSpeaker || ''} onChange={(e) => handleEventsOrganisedChange(achievement.id, 'alumniGuestSpeaker', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
                        <option value="">Choose an option</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {achievement.eventsOrganisedData?.guestSpeakers.map((guest, idx) => (
                      <div key={guest.id} className="p-3 bg-white rounded border border-slate-300 space-y-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-700">Guest Speaker {idx + 1}</span>
                          <button type="button" onClick={() => removeGuestSpeaker(achievement.id, guest.id)} className="p-1 hover:bg-red-50 rounded text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <select value={guest.type} onChange={(e) => updateGuestSpeaker(achievement.id, guest.id, 'type', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                          <option value="">Type of Institution</option>
                          {GUEST_INSTITUTION_TYPES.map(type => (<option key={type} value={type}>{type}</option>))}
                        </select>
                        <input type="text" value={guest.name} onChange={(e) => updateGuestSpeaker(achievement.id, guest.id, 'name', e.target.value)} placeholder="Guest name" className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        <input type="text" value={guest.designation} onChange={(e) => updateGuestSpeaker(achievement.id, guest.id, 'designation', e.target.value)} placeholder="Designation" className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        <input type="email" value={guest.email} onChange={(e) => updateGuestSpeaker(achievement.id, guest.id, 'email', e.target.value)} placeholder="Email ID" className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        <input type="tel" value={guest.contact} onChange={(e) => updateGuestSpeaker(achievement.id, guest.id, 'contact', e.target.value)} placeholder="Contact No" className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        <input type="text" value={guest.organization} onChange={(e) => updateGuestSpeaker(achievement.id, guest.id, 'organization', e.target.value)} placeholder="Organization Details" className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                    ))}
                  </div>
                  
                  {achievement.eventsOrganisedData && achievement.eventsOrganisedData.guestSpeakers.length < 5 && (
                    <button type="button" onClick={() => addGuestSpeaker(achievement.id)} className="mt-2 flex items-center gap-2 px-3 py-2 border border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium">
                      <Plus className="w-4 h-4" />
                      Add Guest Speaker
                    </button>
                  )}
                </div>

                {/* Financial Information */}
                <div className="pt-4 border-t border-blue-300">
                  <h4 className="font-medium text-slate-800 mb-4">Financial Information</h4>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Registration Amount</label>
                      <input type="number" value={achievement.eventsOrganisedData?.registrationAmount || ''} onChange={(e) => handleEventsOrganisedChange(achievement.id, 'registrationAmount', e.target.value)} placeholder="0" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Total Sponsored Amount</label>
                      <input type="number" value={achievement.eventsOrganisedData?.sponsorshipAmount || ''} onChange={(e) => handleEventsOrganisedChange(achievement.id, 'sponsorshipAmount', e.target.value)} placeholder="0" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Amount Received From Management</label>
                      <select value={achievement.eventsOrganisedData?.managementAmount || ''} onChange={(e) => handleEventsOrganisedChange(achievement.id, 'managementAmount', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
                        <option value="">Choose an option</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Sponsorship from Funding agency</label>
                      <select value={achievement.eventsOrganisedData?.fundingAgency || ''} onChange={(e) => handleEventsOrganisedChange(achievement.id, 'fundingAgency', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
                        <option value="">Choose an option</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Total Revenue Generated</label>
                    <input type="number" value={achievement.eventsOrganisedData?.totalRevenue || ''} onChange={(e) => handleEventsOrganisedChange(achievement.id, 'totalRevenue', e.target.value)} placeholder="0" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                  </div>
                </div>

                {/* Document Upload */}
                <div className="pt-4 border-t border-blue-300">
                  <h4 className="font-medium text-slate-800 mb-3">Supporting Documents</h4>
                  <p className="text-xs text-slate-600 mb-3">Upload: 1.Approval letter, 2.Brochure/Poster/Invitation, 3.Attendance sheet, 4.Photos (atleast 3), 5.Feedback</p>
                  
                  <div>
                    <input type="file" multiple accept="image/*,.pdf,.doc,.docx" onChange={(e) => { if (e.target.files) Array.from(e.target.files).forEach(file => handleEventsOrganisedChange(achievement.id, 'proofFiles', file)) }} className="hidden" id={`proof-${achievement.id}`} />
                    <label htmlFor={`proof-${achievement.id}`} className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer">
                      <div className="text-center">
                        <Upload className="w-6 h-6 mx-auto text-slate-400 mb-2" />
                        <p className="text-sm font-medium text-slate-600">Drop file or click to choose</p>
                        <p className="text-xs text-slate-500 mt-1">Images, PDF, Word Documents</p>
                      </div>
                    </label>
                  </div>

                  {achievement.eventsOrganisedData?.proofFilePreviews && achievement.eventsOrganisedData.proofFilePreviews.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {achievement.eventsOrganisedData.proofFilePreviews.map((_, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                          <span className="text-sm text-slate-700">{achievement.eventsOrganisedData?.proofFiles?.[idx]?.name}</span>
                          <button type="button" onClick={() => removeProofFile(achievement.id, idx)} className="p-1 hover:bg-red-50 rounded text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Generic Fields (for non-Events Attended and non-Events Organized) */}
            {achievement.category !== 'Events Attended' && achievement.category !== 'Events Organized' && (
              <>
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={achievement.title}
                    onChange={(e) => handleAchievementChange(achievement.id, 'title', e.target.value)}
                    placeholder="Enter achievement title"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea
                    value={achievement.description}
                    onChange={(e) => handleAchievementChange(achievement.id, 'description', e.target.value)}
                    placeholder="Add any additional details about this achievement"
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Date *</label>
                  <input
                    type="date"
                    value={achievement.date}
                    onChange={(e) => handleAchievementChange(achievement.id, 'date', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Evidence Image *</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleAchievementChange(achievement.id, 'image', e.target.files[0])
                        }
                      }}
                      className="hidden"
                      id={`file-${achievement.id}`}
                      required
                    />
                    <label
                      htmlFor={`file-${achievement.id}`}
                      className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      {achievement.imagePreview ? (
                        <div className="text-center">
                          <img src={achievement.imagePreview} alt="Preview" className="max-h-32 mx-auto mb-2 rounded" />
                          <p className="text-sm text-slate-600">Click to change image</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                          <p className="text-sm font-medium text-slate-600">Click to upload or drag and drop</p>
                          <p className="text-xs text-slate-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}

        {/* Add More Button */}
        <button
          type="button"
          onClick={handleAddMore}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Another Achievement
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
                Submit Achievements
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
