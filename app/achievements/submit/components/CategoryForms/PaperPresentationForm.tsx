/**
 * Paper Presentation Form Component
 * Handles paper presentation achievement submissions
 */

import React from 'react'
import { Achievement } from '../../types'
import { TextInput, SelectInput, FileUpload, DateInput } from '../FormFields'
import {
  PAPER_PRESENTATION_OPTIONS,
  COMMON_OPTIONS,
  FACULTY_LIST,
} from '../../constants'

interface PaperPresentationFormProps {
  achievement: Achievement
  onChange: (field: string, value: string | File) => void
}

export const PaperPresentationForm: React.FC<PaperPresentationFormProps> = ({ achievement, onChange }) => {
  const data = achievement.paperPresentationData || {
    title: '',
    description: '',
    date: '',
    faculty: '',
    taskId: '',
    specialLabsInvolved: '',
    specialLabName: '',
    otherAuthorsFromBIT: '',
    externalFacultyInvolved: '',
    industrialPersonInvolved: '',
    internationalCollaboration: '',
    conferenceTitle: '',
    eventMode: '',
    eventOrganizer: '',
    eventLevel: '',
    paperTitle: '',
    eventStartDate: '',
    eventEndDate: '',
    eventDurationDays: '',
    paperPublishedInProceedings: '',
    typeOfSponsorship: '',
    studentsInvolved: '',
    registrationAmount: '',
    awardPrizeReceived: '',
    iqacVerification: 'Initiated',
    documentProofPreview: '',
    awardProofPreview: '',
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
        <h3 className="text-lg font-bold text-blue-900">Paper Presentation</h3>
        <p className="text-sm text-gray-600 mt-1">Provide details about the paper you presented</p>
      </div>

      {/* Basic Information */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectInput
            label="Faculty"
            name="faculty"
            value={data.faculty}
            onChange={handleChange}
            options={FACULTY_LIST}
            placeholder="Select faculty member"
            required
          />
          <TextInput
            label="Task ID"
            name="taskId"
            value={data.taskId}
            onChange={handleChange}
            placeholder="Enter task ID"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectInput
            label="Special Labs Involved"
            name="specialLabsInvolved"
            value={data.specialLabsInvolved}
            onChange={handleChange}
            options={COMMON_OPTIONS.YES_NO}
          />
          <SelectInput
            label="Other Authors from BIT"
            name="otherAuthorsFromBIT"
            value={data.otherAuthorsFromBIT}
            onChange={handleChange}
            options={COMMON_OPTIONS.YES_NO}
          />
        </div>

      {data.specialLabsInvolved === 'Yes' && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <SelectInput
            label="Special Lab Name"
            name="specialLabName"
            value={data.specialLabName || ''}
            onChange={handleChange}
            options={PAPER_PRESENTATION_OPTIONS.SPECIAL_LAB_NAMES}
            required
          />
        </div>
      )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectInput
            label="External Faculty Involved"
            name="externalFacultyInvolved"
            value={data.externalFacultyInvolved}
            onChange={handleChange}
            options={COMMON_OPTIONS.YES_NO}
          />
          <SelectInput
            label="Industrial Person Involved"
            name="industrialPersonInvolved"
            value={data.industrialPersonInvolved}
            onChange={handleChange}
            options={COMMON_OPTIONS.YES_NO}
          />
        </div>

        <SelectInput
          label="International Collaboration"
          name="internationalCollaboration"
          value={data.internationalCollaboration}
          onChange={handleChange}
          options={COMMON_OPTIONS.YES_NO}
        />
      </div>

      {/* Paper Details */}
      <div className="space-y-4 border-t pt-6">
        <TextInput
          label="Paper Title"
          name="paperTitle"
          value={data.paperTitle}
          onChange={handleChange}
          placeholder="Enter paper title"
          required
        />

        <TextInput
          label="Conference/Event Title"
          name="conferenceTitle"
          value={data.conferenceTitle}
          onChange={handleChange}
          placeholder="Enter conference name"
          required
        />

        <SelectInput
          label="Paper Published in Proceedings"
          name="paperPublishedInProceedings"
          value={data.paperPublishedInProceedings}
          onChange={handleChange}
          options={COMMON_OPTIONS.YES_NO}
        />
      </div>

      {/* Event Details */}
      <div className="space-y-4 border-t pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectInput
            label="Event Mode"
            name="eventMode"
            value={data.eventMode}
            onChange={handleChange}
            options={PAPER_PRESENTATION_OPTIONS.EVENT_MODES}
            required
          />
          <SelectInput
            label="Event Organizer"
            name="eventOrganizer"
            value={data.eventOrganizer}
            onChange={handleChange}
            options={PAPER_PRESENTATION_OPTIONS.ORGANIZERS}
            required
          />
        </div>

        <SelectInput
          label="Event Level"
          name="eventLevel"
          value={data.eventLevel}
          onChange={handleChange}
          options={PAPER_PRESENTATION_OPTIONS.LEVELS}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DateInput
            label="Event Start Date"
            name="eventStartDate"
            value={data.eventStartDate}
            onChange={handleChange}
            required
          />
          <DateInput
            label="Event End Date"
            name="eventEndDate"
            value={data.eventEndDate}
            onChange={handleChange}
            required
          />
          <TextInput
            label="Duration (Days)"
            name="eventDurationDays"
            type="number"
            value={data.eventDurationDays}
            onChange={handleChange}
            placeholder="0"
          />
        </div>
      </div>

      {/* Participation and Awards */}
      <div className="space-y-4 border-t pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectInput
            label="Students Involved"
            name="studentsInvolved"
            value={data.studentsInvolved}
            onChange={handleChange}
            options={COMMON_OPTIONS.YES_NO}
          />
          <TextInput
            label="Registration Amount"
            name="registrationAmount"
            type="number"
            value={data.registrationAmount}
            onChange={handleChange}
            placeholder="0"
          />
        </div>

        <SelectInput
          label="Award/Prize Received"
          name="awardPrizeReceived"
          value={data.awardPrizeReceived}
          onChange={handleChange}
          options={COMMON_OPTIONS.YES_NO}
        />

        <SelectInput
          label="Type of Sponsorship"
          name="typeOfSponsorship"
          value={data.typeOfSponsorship}
          onChange={handleChange}
          options={PAPER_PRESENTATION_OPTIONS.SPONSORSHIP}
          required
        />
      </div>

      {/* File Uploads */}
      <div className="space-y-4 border-t pt-6">
        <h4 className="font-semibold text-gray-700">Supporting Documents</h4>

        <FileUpload
          label="Document Proof (Certificate/Letter)"
          name="documentProof"
          onChange={handleFileChange('documentProof')}
          preview={data.documentProofPreview}
          accept="application/pdf,image/*"
          required
        />

        {data.awardPrizeReceived === 'Yes' && (
          <FileUpload
            label="Award/Prize Proof"
            name="awardProof"
            onChange={handleFileChange('awardProof')}
            preview={data.awardProofPreview}
            accept="application/pdf,image/*"
          />
        )}
      </div>

      {/* IQAC Verification */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-slate-900">IQAC Verification *</label>
          <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 text-sm font-semibold rounded-lg border border-blue-300 shadow-sm">
            ◐ Initiated
          </span>
        </div>
      </div>
    </div>
  )
}
