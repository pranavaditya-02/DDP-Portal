'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { apiClient, getApiErrorMessage, type RoleRecord, type RoleResourceRecord, type UpsertRolePayload } from '@/lib/api'
import toast from 'react-hot-toast'
import {
  FileText, Award, Clipboard, Building2, GraduationCap, ShieldCheck,
  Users, Shield, Settings, LayoutDashboard, Trophy,
  Search, Plus, Edit3, Trash2, X, Check,
  ChevronDown, ChevronRight, Copy, CheckSquare, Square, MinusSquare, Info,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/* ROLES MANAGEMENT HELPERS                                            */
/* ------------------------------------------------------------------ */
const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, FileText, Award, Clipboard, Building2,
  Trophy, GraduationCap, ShieldCheck, Users, Shield, Settings,
}

function groupResources(resources: Resource[]) {
  const groups: Record<string, Resource[]> = {}
  resources.forEach(r => {
    if (!groups[r.group]) groups[r.group] = []
    groups[r.group].push(r)
  })
  return groups
}

type Resource = RoleResourceRecord
type Role = RoleRecord

const groupIcons: Record<string, React.ElementType> = {
  Overview: LayoutDashboard, Faculty: FileText, Department: Building2,
  College: GraduationCap, Management: Shield,
}
const groupColors: Record<string, string> = {
  Overview: 'text-blue-600 bg-blue-50', Faculty: 'text-emerald-600 bg-emerald-50',
  Department: 'text-purple-600 bg-purple-50', College: 'text-amber-600 bg-amber-50',
  Management: 'text-red-600 bg-red-50',
}

/* ====== Resource Tree Component ====== */
function ResourceTree({ selected, onToggle, resources }: { selected: Set<string>; onToggle: (id: string) => void; resources: Resource[] }) {
  const grouped = groupResources(resources)
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(Object.keys(grouped).map(g => [g, true]))
  )
  const toggleGroup = (group: string) => setExpanded(prev => ({ ...prev, [group]: !prev[group] }))
  const toggleAllInGroup = (group: string) => {
    const items = grouped[group]
    const allSelected = items.every(r => selected.has(r.id))
    items.forEach(r => {
      if (allSelected && selected.has(r.id)) onToggle(r.id)
      if (!allSelected && !selected.has(r.id)) onToggle(r.id)
    })
  }
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Assign Resources</span>
        <span className="text-[11px] text-slate-400">Selected: {selected.size} of {resources.length}</span>
      </div>
      <div className="max-h-[320px] overflow-y-auto">
        {Object.entries(grouped).map(([group, resources]) => {
          const selectedInGroup = resources.filter(r => selected.has(r.id)).length
          const allSelected = selectedInGroup === resources.length
          const someSelected = selectedInGroup > 0 && !allSelected
          const GroupIcon = groupIcons[group] || Shield
          const isExpanded = expanded[group]
          const color = groupColors[group] || 'text-slate-600 bg-slate-50'
          return (
            <div key={group} className="border-b border-slate-100 last:border-0">
              <div className="flex items-center gap-2 px-3 py-2.5 hover:bg-slate-50 cursor-pointer select-none" onClick={() => toggleGroup(group)}>
                <button onClick={(e) => { e.stopPropagation(); toggleAllInGroup(group) }} className="text-slate-400 hover:text-blue-600 transition-colors">
                  {allSelected ? <CheckSquare className="w-4 h-4 text-blue-600" /> : someSelected ? <MinusSquare className="w-4 h-4 text-blue-400" /> : <Square className="w-4 h-4" />}
                </button>
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                <div className={`w-5 h-5 rounded flex items-center justify-center ${color}`}><GroupIcon className="w-3 h-3" /></div>
                <span className="text-xs font-semibold text-slate-700 flex-1">{group}</span>
                <span className="text-[10px] text-slate-400 font-mono">{selectedInGroup}/{resources.length}</span>
              </div>
              {isExpanded && (
                <div className="pb-1">
                  {resources.map(r => {
                    const Icon = iconMap[r.icon] || FileText
                    const isSelected = selected.has(r.id)
                    return (
                      <label key={r.id} className={`flex items-center gap-2.5 px-3 py-2 ml-6 mr-2 rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-50'}`}>
                        <input type="checkbox" checked={isSelected} onChange={() => onToggle(r.id)} className="sr-only" />
                        {isSelected ? <CheckSquare className="w-4 h-4 text-blue-600 flex-shrink-0" /> : <Square className="w-4 h-4 text-slate-300 flex-shrink-0" />}
                        <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-blue-500' : 'text-slate-400'}`} />
                        <span className={`text-xs ${isSelected ? 'text-slate-800 font-medium' : 'text-slate-600'}`}>{r.label}</span>
                        <span className="text-[10px] text-slate-300 ml-auto font-mono">{r.href}</span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ====== Add/Edit Role Modal ====== */
function RoleModal({ role, resources, onClose, onSave }: {
  role: Role | null
  resources: Resource[]
  onClose: () => void
  onSave: (role: UpsertRolePayload & { id?: number }) => void
}) {
  const [name, setName] = useState(role?.name || '')
  const [selectedResources, setSelectedResources] = useState<Set<string>>(new Set(role?.resources || []))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const handleToggle = (id: string) => {
    setSelectedResources(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }
  const validate = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Role name is required'
    if (selectedResources.size === 0) errs.resources = 'Select at least one resource'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }
  const handleSubmit = () => {
    if (!validate()) return
    onSave({ id: role?.id, name: name.trim(), description: '', passwordPrefix: role?.passwordPrefix || '', editAccess: role?.editAccess ?? true, deleteAccess: role?.deleteAccess ?? false, status: role?.status ?? true, resources: Array.from(selectedResources), isSystem: role?.isSystem || false })
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{role ? 'Edit Role' : 'Add New Role'}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{role ? `Editing "${role.name}" role configuration` : 'Create a new role and assign resources'}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Role Name <span className="text-red-500">*</span></label>
            <input type="text" value={name} onChange={(e) => { setName(e.target.value); setErrors(prev => ({ ...prev, name: '' })) }} placeholder="Enter role name" className={`input-base ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''}`} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            {errors.resources && <p className="text-xs text-red-500 mb-2 flex items-center gap-1"><Info className="w-3 h-3" /> {errors.resources}</p>}
            <ResourceTree selected={selectedResources} onToggle={handleToggle} resources={resources} />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-end gap-3">
          <button onClick={onClose} className="btn-outline">Cancel</button>
          <button onClick={handleSubmit} className="btn-primary"><Check className="w-4 h-4" />{role ? 'Save Changes' : 'Add Role'}</button>
        </div>
      </div>
    </div>
  )
}

/* ====== Delete Confirmation Modal ====== */
function DeleteConfirm({ role, onClose, onConfirm }: { role: Role; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0"><Trash2 className="w-5 h-5 text-red-600" /></div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Delete Role</h3>
            <p className="text-xs text-slate-500">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 mb-1">Are you sure you want to delete the <span className="font-bold">&quot;{role.name}&quot;</span> role?</p>
        {role.usersCount > 0 && (
          <div className="flex items-center gap-2 mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-700"><span className="font-bold">{role.usersCount} users</span> are currently assigned this role. They&apos;ll lose these permissions.</p>
          </div>
        )}
        <div className="flex items-center justify-end gap-3 mt-5">
          <button onClick={onClose} className="btn-outline">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2"><Trash2 className="w-3.5 h-3.5" />Delete Role</button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* ROLES PAGE                                                          */
/* ------------------------------------------------------------------ */
export default function RolesPage() {
  const [rolesList, setRolesList] = useState<Role[]>([])
  const [resourcesList, setResourcesList] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
    const loadRolesData = async () => {
      try {
        setIsLoading(true)
        const [rolesResponse, resourcesResponse] = await Promise.all([
          apiClient.getRoles(),
          apiClient.getRoleResources(),
        ])

        setRolesList(rolesResponse.roles || [])
        setResourcesList(resourcesResponse.resources || [])
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to load roles'))
      } finally {
        setIsLoading(false)
      }
    }

    useEffect(() => {
      void loadRolesData()
    }, [])

  const [showAddModal, setShowAddModal] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [deletingRole, setDeletingRole] = useState<Role | null>(null)
  const [expandedRow, setExpandedRow] = useState<number | null>(null)

  const filtered = useMemo(() => {
    if (!search) return rolesList
    const q = search.toLowerCase()
    return rolesList.filter(r => r.name.toLowerCase().includes(q))
  }, [rolesList, search])

  const handleSave = async (data: UpsertRolePayload & { id?: number }) => {
    try {
      if (data.id) {
        await apiClient.updateRole(data.id, data)
        toast.success(`Role "${data.name}" updated successfully`)
      } else {
        await apiClient.createRole(data)
        toast.success(`Role "${data.name}" created successfully`)
      }

      await loadRolesData()
      setShowAddModal(false)
      setEditingRole(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to save role'))
    }
  }

  const handleDelete = async () => {
    if (!deletingRole) return
    try {
      await apiClient.deleteRole(deletingRole.id)
      toast.success(`Role "${deletingRole.name}" deleted`)
      await loadRolesData()
      setDeletingRole(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete role'))
    }
  }

  const handleDuplicate = async (role: Role) => {
    try {
      await apiClient.createRole({
        name: `${role.name} (Copy)`,
        description: '',
        passwordPrefix: role.passwordPrefix,
        editAccess: role.editAccess,
        deleteAccess: role.deleteAccess,
        status: role.status,
        resources: role.resources,
        isSystem: false,
      })
      toast.success(`Role duplicated as "${role.name} (Copy)"`)
      await loadRolesData()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to duplicate role'))
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Page header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-600" />
          Roles Management
        </h1>
        <p className="text-sm text-slate-500 mt-1">Create and manage user roles with specific resource access</p>
      </div>

      <div className="space-y-6 animate-fade-in">


        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search roles..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-base pl-10" />
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn-primary w-fit">
            <Plus className="w-4 h-4" /> Add Role
          </button>
        </div>

        {/* Roles Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">S.No</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Role Name</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Resources</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={4} className="text-center py-12 text-slate-400"><p className="text-sm">Loading roles...</p></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-12 text-slate-400"><Shield className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-sm">No roles found</p></td></tr>
                ) : (
                  filtered.map((role, idx) => (
                    <React.Fragment key={role.id}>
                      <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4 text-sm text-slate-500">{idx + 1}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                              role.name === 'Faculty' ? 'bg-blue-50 text-blue-600' :
                              role.name === 'HOD' ? 'bg-emerald-50 text-emerald-600' :
                              role.name === 'Dean' ? 'bg-purple-50 text-purple-600' :
                              role.name === 'Verification' ? 'bg-amber-50 text-amber-600' :
                              'bg-slate-100 text-slate-600'
                            }`}>{role.name.charAt(0)}</div>
                            <span className="text-sm font-medium text-slate-800">{role.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button onClick={() => setExpandedRow(expandedRow === role.id ? null : role.id)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                            {role.resources.length} pages
                            {expandedRow === role.id ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          </button>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => setEditingRole(role)} title="Edit role" className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><Edit3 className="w-4 h-4" /></button>
                            <button onClick={() => handleDuplicate(role)} title="Duplicate role" className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><Copy className="w-4 h-4" /></button>
                            <button onClick={() => setDeletingRole(role)} title="Delete role" className="p-2 rounded-lg transition-colors hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                      {expandedRow === role.id && (
                        <tr><td colSpan={4} className="px-5 py-3 bg-slate-50/80">
                          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Assigned Resources ({role.resources.length})</p>
                          <div className="flex flex-wrap gap-2">
                            {role.resources.map(resId => {
                              const res = resourcesList.find(r => r.id === resId)
                              if (!res) return null
                              const Icon = iconMap[res.icon] || FileText
                              return (
                                <span key={resId} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700">
                                  <Icon className="w-3 h-3 text-slate-400" />{res.label}
                                  <span className="text-[10px] text-slate-300 font-mono">{res.href}</span>
                                </span>
                              )
                            })}
                          </div>
                        </td></tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <p className="text-xs text-slate-500">Showing {filtered.length} of {rolesList.length} roles</p>
            <p className="text-[10px] text-slate-400">Roles and page access are loaded from backend database</p>
          </div>
        </div>
      </div>

      {/* Modals */}
      {(showAddModal || editingRole) && (
        <RoleModal role={editingRole} resources={resourcesList} onClose={() => { setShowAddModal(false); setEditingRole(null) }} onSave={handleSave} />
      )}
      {deletingRole && (
        <DeleteConfirm role={deletingRole} onClose={() => setDeletingRole(null)} onConfirm={handleDelete} />
      )}
    </div>
  )
}
