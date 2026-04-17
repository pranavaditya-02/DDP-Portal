/**
 * Guest Lecture Delivered Form Component
 * Handles guest lecture achievement submissions
 */

import React from 'react'
import { Achievement } from '../../types'
import { TextInput, SelectInput, FileUpload, TextArea, DateInput } from '../FormFields'
import {
  GUEST_LECTURE_OPTIONS,
  COMMON_OPTIONS,
} from '../../constants'

interface GuestLectureFormProps {
  achievement: Achievement
  onChange: (field: string, value: string | File) => void
}

export const GuestLectureForm: React.FC<GuestLectureFormProps> = ({ achievement, onChange }) => {
  const data = achievement.guestLectureDeliveredData || {
    title: '',
    description: '',
    date: '',
    taskId: '',
    faculty: '',
    specialLabsInvolved: '',
    specialLabName: '',
    eventType: '',
    topic: '',
    modeOfConduct: '',
    eventLevel: '',
    eventName: '',
    fromDate: '',
    toDate: '',
    noOfDays: '',
    typeOfOrganization: '',
    noOfParticipants: '',
    typeOfAudienceCovered: '',
    iqacVerification: 'Initiated',
    documentProofPreview: '',
    apexProofPreview: '',
    samplePhotographsPreview: '',
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
        <h3 className="text-lg font-bold text-blue-900">Guest Lecture Delivered</h3>
        <p className="text-sm text-gray-600 mt-1">Fill in details about the guest lecture you delivered</p>
      </div>

      {/* Basic Information */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput
            label="Task ID"
            name="taskId"
            value={data.taskId}
            onChange={handleChange}
            placeholder="Enter task ID"
            required
          />
          <SelectInput
            label="Faculty"
            name="faculty"
            value={data.faculty}
            onChange={handleChange}
            options={['Select Faculty']}
            required
          />
        </div>

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
            options={GUEST_LECTURE_OPTIONS.EVENT_TYPES}
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
            options={GUEST_LECTURE_OPTIONS.SPECIAL_LAB_NAMES}
            required
          />
        </div>
      )}

      {/* Event Details */}
      <div className="space-y-4">
        <TextInput
          label="Topic/Subject"
          name="topic"
          value={data.topic}
          onChange={handleChange}
          placeholder="Enter lecture topic"
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectInput
            label="Mode of Conduct"
            name="modeOfConduct"
            value={data.modeOfConduct}
            onChange={handleChange}
            options={['Online', 'Offline', 'Hybrid']}
            required
          />
          <SelectInput
            label="Event Level"
            name="eventLevel"
            value={data.eventLevel}
            onChange={handleChange}
            options={GUEST_LECTURE_OPTIONS.EVENT_LEVELS}
            required
          />
        </div>

        <TextInput
          label="Event Name/Institution"
          name="eventName"
          value={data.eventName}
          onChange={handleChange}
          placeholder="Enter event name"
          required
        />
      </div>

      {/* Duration and Participation */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DateInput
            label="From Date"
            name="fromDate"
            value={data.fromDate}
            onChange={handleChange}
            required
          />
          <DateInput
            label="To Date"
            name="toDate"
            value={data.toDate}
            onChange={handleChange}
            required
          />
          <TextInput
            label="Number of Days"
            name="noOfDays"
            type="number"
            value={data.noOfDays}
            onChange={handleChange}
            placeholder="0"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectInput
            label="Type of Organization"
            name="typeOfOrganization"
            value={data.typeOfOrganization}
            onChange={handleChange}
            options={GUEST_LECTURE_OPTIONS.ORG_TYPES}
            required
          />
          <TextInput
            label="Number of Participants"
            name="noOfParticipants"
            type="number"
            value={data.noOfParticipants}
            onChange={handleChange}
            placeholder="0"
          />
        </div>

        <SelectInput
          label="Type of Audience Covered"
          name="typeOfAudienceCovered"
          value={data.typeOfAudienceCovered}
          onChange={handleChange}
          options={GUEST_LECTURE_OPTIONS.AUDIENCE_TYPES}
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

        <FileUpload
          label="Apex/IQAC Proof"
          name="apexProof"
          onChange={handleFileChange('apexProof')}
          preview={data.apexProofPreview}
          accept="application/pdf,image/*"
        />

        <FileUpload
          label="Sample Photographs"
          name="samplePhotographs"
          onChange={handleFileChange('samplePhotographs')}
          preview={data.samplePhotographsPreview}
          accept="image/*"
        />
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
