export const AUTH_COOKIE_NAME = 'ddp_auth_token'

export interface AuthUser {
  id: number
  username: string
  name: string
  email: string
  roleId: number
  roleName: string
  roles: string[]
  facultyId?: string | null
}

interface AuthTokenPayload {
  id?: number | string
  username?: string
  name?: string
  email?: string
  roleId?: number | string
  roleName?: string
  roles?: string[]
  facultyId?: string | null
  exp?: number
}

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')

  if (typeof atob === 'function') {
    return atob(padded)
  }

  return Buffer.from(padded, 'base64').toString('utf8')
}

const normalizeRoles = (roles: unknown, roleName?: string) => {
  const list = Array.isArray(roles) ? roles : []
  const normalized = list.map((role) => String(role).trim().toLowerCase()).filter(Boolean)
  if (normalized.length > 0) return normalized

  const fallback = String(roleName || '').trim().toLowerCase()
  return fallback ? [fallback] : []
}

export const decodeAuthToken = (token: string): AuthUser | null => {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null

    const payload = JSON.parse(decodeBase64Url(parts[1])) as AuthTokenPayload
    if (payload.exp && payload.exp * 1000 <= Date.now()) return null

    const username = String(payload.username || payload.name || payload.email || '').trim()
    const email = String(payload.email || '').trim()
    if (!email) return null

    const roleName = String(payload.roleName || '').trim().toLowerCase()
    const roles = normalizeRoles(payload.roles, roleName)

    return {
      id: Number(payload.id || 0),
      username: username || email.split('@')[0] || email,
      name: username || email.split('@')[0] || email,
      email,
      roleId: Number(payload.roleId || 0),
      roleName: roleName || roles[0] || 'faculty',
      roles,
      facultyId: payload.facultyId ?? null,
    }
  } catch {
    return null
  }
}

export const getPostLoginRoute = (roles: string[] = []) => {
  const normalizedRoles = roles.map((role) => role.toLowerCase())

  if (normalizedRoles.includes('dean')) return '/college'
  if (normalizedRoles.includes('student')) return '/student/dashboard'
  return '/dashboard'
}
