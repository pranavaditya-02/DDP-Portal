/**
 * Events Attended Form Component
 * Handles events attended achievement submissions
 */

import React from 'react'
import { Achievement } from '../../types'
import { TextInput, SelectInput, FileUpload, DateInput } from '../FormFields'
import {
  EVENTS_ATTENDED_OPTIONS,
  COMMON_OPTIONS,
} from '../../constants'

interface EventsAttendedFormProps {
  achievement: Achievement
  onChange: (field: string, value: string | File) => void
}

export const EventsAttendedForm: React.FC<EventsAttendedFormProps> = ({ achievement, onChange }) => {
  const data = achievement.eventsAttendedData || {
    title: '',
    description: '',
    date: '',
    taskId: '',
    specialLabsInvolved: '',
    specialLabName: '',
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
    certificatePreview: '',
    geotagPreview: '',
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    onChange(name, value)
  }

  const handleFileChange = (fieldName: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onChange(fieldName, e.target.files[0])
    }
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="form-section-primary">
        <h3 className="text-lg font-bold text-blue-900">Events Attended</h3>
        <p className="text-sm text-gray-600 mt-1">Provide details of the events you attended</p>
      </div>

      {/* Basic Information */}
      <div className="space-y-4">
        <TextInput
          label="Task ID"
          name="taskId"
          value={data.taskId}
          onChange={handleChange}
          placeholder="Enter task ID"
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectInput
            label="Special Labs Involved"
            name="specialLabsInvolved"
            value={data.specialLabsInvolved}
            onChange={handleChange}
            options={[{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }]}
          />
          <SelectInput
            label="Event Type"
            name="eventType"
            value={data.eventType}
            onChange={handleChange}
            options={EVENTS_ATTENDED_OPTIONS.EVENT_TYPES}
            required
          />
        </div>
      </div>

      {data.specialLabsInvolved === 'Yes' && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <SelectInput
            label="Special Lab Name"
            name="specialLabName"
            value={data.specialLabName || ''}
            onChange={handleChange}
            options={EVENTS_ATTENDED_OPTIONS.SPECIAL_LAB_NAMES}
            required
          />
        </div>
      )}

      {/* Organizer and Level */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectInput
            label="Organizer Type"
            name="organizerType"
            value={data.organizerType}
            onChange={handleChange}
            options={EVENTS_ATTENDED_OPTIONS.ORGANIZER_TYPES}
            required
          />
          <SelectInput
            label="Event Level"
            name="eventLevel"
            value={data.eventLevel}
            onChange={handleChange}
            options={EVENTS_ATTENDED_OPTIONS.EVENT_LEVELS}
            required
          />
        </div>

        <TextInput
          label="Event Title"
          name="eventTitle"
          value={data.eventTitle}
          onChange={handleChange}
          placeholder="Enter event title"
          required
        />

        <SelectInput
          label="Organization Sector"
          name="organizationSector"
          value={data.organizationSector}
          onChange={handleChange}
          options={EVENTS_ATTENDED_OPTIONS.SECTORS}
          required
        />
      </div>

      {/* Event Organizer and Mode */}
      <div className="space-y-4">
        <TextInput
          label="Event Organizer/Institution"
          name="eventOrganizer"
          value={data.eventOrganizer}
          onChange={handleChange}
          placeholder="Enter organizer name"
          required
        />

        <SelectInput
          label="Event Mode"
          name="eventMode"
          value={data.eventMode}
          onChange={handleChange}
          options={EVENTS_ATTENDED_OPTIONS.EVENT_MODES}
          required
        />
      </div>

      {/* Duration */}
      <div className="space-y-4 border-t pt-6">
        <h4 className="font-semibold text-gray-700">Duration Details</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectInput
            label="Duration Unit"
            name="eventDuration"
            value={data.eventDuration}
            onChange={handleChange}
            options={EVENTS_ATTENDED_OPTIONS.DURATION_UNITS}
            required
          />
          <TextInput
            label="Duration Value"
            name="eventDurationValue"
            type="number"
            value={data.eventDurationValue}
            onChange={handleChange}
            placeholder="Enter duration"
            required
          />
        </div>

        <TextInput
          label="Duration in Days"
          name="durationInDays"
          type="number"
          value={data.durationInDays}
          onChange={handleChange}
          placeholder="0"
          required
        />
      </div>

      {/* Dates */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DateInput
            label="Event Date"
            name="eventDate"
            value={data.eventDate}
            onChange={handleChange}
            required
          />
          <DateInput
            label="End Date"
            name="endDate"
            value={data.endDate}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* Sponsorship and Outcome */}
      <div className="space-y-4 border-t pt-6">
        <SelectInput
          label="Sponsorship Type"
          name="sponsorshipType"
          value={data.sponsorshipType}
          onChange={handleChange}
          options={EVENTS_ATTENDED_OPTIONS.SPONSORSHIP_TYPES}
          required
        />

        <SelectInput
          label="Event Outcome"
          name="eventOutcome"
          value={data.eventOutcome}
          onChange={handleChange}
          options={EVENTS_ATTENDED_OPTIONS.EVENT_OUTCOMES}
          required
        />
      </div>

      {/* File Uploads */}
      <div className="space-y-4 border-t pt-6">
        <h4 className="font-semibold text-gray-700">Supporting Documents</h4>

        <FileUpload
          label="Certificate Proof"
          name="certificateProof"
          onChange={handleFileChange('certificateProof')}
          preview={data.certificatePreview}
          accept="application/pdf,image/*"
          required
        />

        <FileUpload
          label="Geotag Photos"
          name="geotagPhotos"
          onChange={handleFileChange('geotagPhotos')}
          preview={data.geotagPreview}
          accept="image/*"
          required
        />
      </div>
    </div>
  )
}
