/**
 * Events Organized Form Component
 * Handles events organized achievement submissions with complex nested data
 */

import React from 'react'
import { Achievement } from '../../types'
import { TextInput, SelectInput, FileUpload, DateInput } from '../FormFields'
import {
  EVENTS_ORGANIZED_OPTIONS,
  COMMON_OPTIONS,
} from '../../constants'
import { Trash2, Plus } from 'lucide-react'

interface EventsOrganisedFormProps {
  achievement: Achievement
  onChange: (field: string, value: string | File) => void
  onAddInternalFaculty: () => void
  onRemoveInternalFaculty: (memberId: string) => void
  onUpdateInternalFaculty: (memberId: string, field: string, value: string) => void
  onAddStudent: () => void
  onRemoveStudent: (studentId: string) => void
  onUpdateStudent: (studentId: string, name: string) => void
  onAddGuestSpeaker: () => void
  onRemoveGuestSpeaker: (speakerId: string) => void
  onUpdateGuestSpeaker: (speakerId: string, field: string, value: string) => void
  onRemoveProofFile: (index: number) => void
}

export const EventsOrganisedForm: React.FC<EventsOrganisedFormProps> = ({
  achievement,
  onChange,
  onAddInternalFaculty,
  onRemoveInternalFaculty,
  onUpdateInternalFaculty,
  onAddStudent,
  onRemoveStudent,
  onUpdateStudent,
  onAddGuestSpeaker,
  onRemoveGuestSpeaker,
  onUpdateGuestSpeaker,
  onRemoveProofFile,
}) => {
  const data = achievement.eventsOrganisedData || {
    title: '',
    description: '',
    date: '',
    taskId: '',
    facultyName: '',
    facultyRole: '',
    claimedDepartment: '',
    specialLabsInvolved: '',
    specialLabName: '',
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
    registrationAmount: '',
    sponsorshipAmount: '',
    managementAmount: '',
    fundingAgency: '',
    totalRevenue: '',
    internalFaculty: [],
    students: [],
    guestSpeakers: [],
    proofFiles: [],
    proofFilePreviews: [],
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    onChange(name, value)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onChange('proofFiles', e.target.files[0])
    }
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="form-section-primary">
        <h3 className="text-lg font-bold text-blue-900">Events Organized</h3>
        <p className="text-sm text-gray-600 mt-1">Provide comprehensive details about the event you organized</p>
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

        <SelectInput
          label="Special Labs Involved"
          name="specialLabsInvolved"
          value={data.specialLabsInvolved || ''}
          onChange={handleChange}
          options={[{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }]}
        />

        {data.specialLabsInvolved === 'Yes' && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <SelectInput
              label="Special Lab Name"
              name="specialLabName"
              value={data.specialLabName || ''}
              onChange={handleChange}
              options={EVENTS_ORGANIZED_OPTIONS.SPECIAL_LAB_NAMES}
              required
            />
          </div>
        )}

        <TextInput
          label="Event Name"
          name="eventName"
          value={data.eventName}
          onChange={handleChange}
          placeholder="Enter event name"
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectInput
            label="Event Type"
            name="eventType"
            value={data.eventType}
            onChange={handleChange}
            options={EVENTS_ORGANIZED_OPTIONS.EVENT_CATEGORIES}
            placeholder="Select event type"
            required
          />
          <SelectInput
            label="Event Category"
            name="eventCategory"
            value={data.eventCategory}
            onChange={handleChange}
            options={COMMON_OPTIONS.YES_NO}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectInput
            label="Program Type"
            name="programType"
            value={data.programType}
            onChange={handleChange}
            options={['Symposium', 'Workshop', 'Seminar', 'Conference', 'Training']}
          />
          <SelectInput
            label="Event Mode"
            name="eventMode"
            value={data.eventMode}
            onChange={handleChange}
            options={['Online', 'Offline', 'Hybrid']}
            required
          />
        </div>
      </div>

      {/* Dates and Duration */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DateInput
            label="Start Date"
            name="startDate"
            value={data.startDate}
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
          <TextInput
            label="Duration (Days)"
            name="eventDuration"
            type="number"
            value={data.eventDuration}
            onChange={handleChange}
            placeholder="0"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectInput
            label="Event Level"
            name="eventLevel"
            value={data.eventLevel}
            onChange={handleChange}
            options={['International', 'National', 'State', 'Local']}
            required
          />
          <SelectInput
            label="Jointly Organized With"
            name="jointlyOrganizedWith"
            value={data.jointlyOrganizedWith}
            onChange={handleChange}
            options={EVENTS_ORGANIZED_OPTIONS.JOINTLY_ORGANIZED}
          />
        </div>
      </div>

      {/* Participation Numbers */}
      <div className="space-y-4 border-t pt-6">
        <h4 className="font-semibold text-gray-700">Participation Details</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput
            label="Internal Student Participants"
            name="internalStudentParticipants"
            type="number"
            value={data.internalStudentParticipants}
            onChange={handleChange}
            placeholder="0"
          />
          <TextInput
            label="Internal Faculty Participants"
            name="internalFacultyParticipants"
            type="number"
            value={data.internalFacultyParticipants}
            onChange={handleChange}
            placeholder="0"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput
            label="External Student Participants"
            name="externalStudentParticipants"
            type="number"
            value={data.externalStudentParticipants}
            onChange={handleChange}
            placeholder="0"
          />
          <TextInput
            label="External Faculty Participants"
            name="externalFacultyParticipants"
            type="number"
            value={data.externalFacultyParticipants}
            onChange={handleChange}
            placeholder="0"
          />
        </div>
      </div>

      {/* Internal Faculty Members */}
      <div className="space-y-4 border-t pt-6">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-700">Internal Faculty Members</h4>
          <button
            type="button"
            onClick={onAddInternalFaculty}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Faculty
          </button>
        </div>

        <div className="space-y-3">
          {data.internalFaculty?.map((faculty, index) => (
            <div key={faculty.id} className="flex gap-2">
              <input
                type="text"
                placeholder="Faculty Name"
                value={faculty.name}
                onChange={(e) => onUpdateInternalFaculty(faculty.id, 'name', e.target.value)}
                className="form-input flex-1"
              />
              <input
                type="text"
                placeholder="Role"
                value={faculty.role}
                onChange={(e) => onUpdateInternalFaculty(faculty.id, 'role', e.target.value)}
                className="form-input flex-1"
              />
              <button
                type="button"
                onClick={() => onRemoveInternalFaculty(faculty.id)}
                className="btn-icon bg-red-100 text-red-500 hover:bg-red-200"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Students */}
      <div className="space-y-4 border-t pt-6">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-700">Students</h4>
          <button
            type="button"
            onClick={onAddStudent}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </button>
        </div>

        <div className="space-y-2">
          {data.students?.map((student) => (
            <div key={student.id} className="flex gap-2">
              <input
                type="text"
                placeholder="Student Name"
                value={student.name}
                onChange={(e) => onUpdateStudent(student.id, e.target.value)}
                className="form-input flex-1"
              />
              <button
                type="button"
                onClick={() => onRemoveStudent(student.id)}
                className="btn-icon bg-red-100 text-red-500 hover:bg-red-200"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Guest Speakers */}
      <div className="space-y-4 border-t pt-6">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-700">Guest Speakers</h4>
          <button
            type="button"
            onClick={onAddGuestSpeaker}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Speaker
          </button>
        </div>

        <div className="space-y-4">
          {data.guestSpeakers?.map((speaker) => (
            <div key={speaker.id} className="border rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Speaker Name"
                  value={speaker.name}
                  onChange={(e) => onUpdateGuestSpeaker(speaker.id, 'name', e.target.value)}
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder="Designation"
                  value={speaker.designation}
                  onChange={(e) => onUpdateGuestSpeaker(speaker.id, 'designation', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="email"
                  placeholder="Email"
                  value={speaker.email}
                  onChange={(e) => onUpdateGuestSpeaker(speaker.id, 'email', e.target.value)}
                  className="form-input"
                />
                <input
                  type="tel"
                  placeholder="Contact"
                  value={speaker.contact}
                  onChange={(e) => onUpdateGuestSpeaker(speaker.id, 'contact', e.target.value)}
                  className="form-input"
                />
              </div>
              <input
                type="text"
                placeholder="Organization"
                value={speaker.organization}
                onChange={(e) => onUpdateGuestSpeaker(speaker.id, 'organization', e.target.value)}
                className="form-input"
              />
              <button
                type="button"
                onClick={() => onRemoveGuestSpeaker(speaker.id)}
                className="btn-secondary text-red-500 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Remove Speaker
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Details */}
      <div className="space-y-4 border-t pt-6">
        <h4 className="font-semibold text-gray-700">Financial Details</h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextInput
            label="Registration Amount"
            name="registrationAmount"
            type="number"
            value={data.registrationAmount}
            onChange={handleChange}
            placeholder="0"
          />
          <TextInput
            label="Sponsorship Amount"
            name="sponsorshipAmount"
            type="number"
            value={data.sponsorshipAmount}
            onChange={handleChange}
            placeholder="0"
          />
          <TextInput
            label="Management Amount"
            name="managementAmount"
            type="number"
            value={data.managementAmount}
            onChange={handleChange}
            placeholder="0"
          />
        </div>

        <TextInput
          label="Total Revenue"
          name="totalRevenue"
          type="number"
          value={data.totalRevenue}
          onChange={handleChange}
          placeholder="0"
        />

        <TextInput
          label="Funding Agency"
          name="fundingAgency"
          value={data.fundingAgency}
          onChange={handleChange}
          placeholder="If applicable"
        />
      </div>

      {/* Proof Files */}
      <div className="space-y-4 border-t pt-6">
        <h4 className="font-semibold text-gray-700">Supporting Documents</h4>

        <FileUpload
          label="Proof Files"
          name="proofFiles"
          onChange={handleFileChange}
          accept="application/pdf,image/*"
          multiple
          required
        />

        {data.proofFilePreviews && data.proofFilePreviews.length > 0 && (
          <div className="space-y-2">
            {data.proofFilePreviews.map((preview, index) => (
              <div key={index} className="flex items-center justify-between border rounded p-2">
                <span className="text-sm text-gray-600">File {index + 1}</span>
                <button
                  type="button"
                  onClick={() => onRemoveProofFile(index)}
                  className="btn-icon bg-red-100 text-red-500 hover:bg-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
