import fs from 'fs/promises'
import path from 'path'
import type { OkPacket, RowDataPacket } from 'mysql2'
import getMysqlPool from '../database/mysql'

export interface RoleResource {
  id: string
  label: string
  icon: string
  href: string
  group: string
}

export interface RoleRecord {
  id: number
  name: string
  description: string
  passwordPrefix: string
  editAccess: boolean
  deleteAccess: boolean
  status: boolean
  resources: string[]
  isSystem: boolean
  createdAt: string
  usersCount: number
}

export interface RoleUpsertInput {
  name: string
  description: string
  passwordPrefix?: string
  editAccess: boolean
  deleteAccess: boolean
  status: boolean
  resources: string[]
  isSystem?: boolean
}

export interface RoleAccessSummary {
  resources: RoleResource[]
  routePaths: string[]
}

export interface AppPageRecord {
  id: number
  pageKey: string
  pageName: string
  routePath: string
  createdAt: string
}

export interface AppPageCreateInput {
  pageKey?: string
  pageName: string
  routePath: string
}

export interface AppPageUpdateInput {
  pageKey?: string
  pageName: string
  routePath: string
}

class RoleInUseError extends Error {
  constructor(public readonly usersCount: number) {
    super(`Role is assigned to ${usersCount} users and cannot be deleted`)
    this.name = 'RoleInUseError'
  }
}

class AppPageConflictError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AppPageConflictError'
  }
}

type AppPageRow = RowDataPacket & {
  id: number
  page_key: string
  page_name: string
  route_path: string
  created_at?: string | Date | null
}

const CORE_RESOURCE_CATALOG: RoleResource[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', href: '/dashboard', group: 'Overview' },
  { id: 'student-dashboard', label: 'Student Dashboard', icon: 'LayoutDashboard', href: '/student/dashboard', group: 'Overview' },
  { id: 'student-overview', label: 'Student Overview', icon: 'FileText', href: '/student/overview', group: 'Overview' },
  { id: 'student-activity-master', label: 'Student Activity Master', icon: 'Clipboard', href: '/student/activity/master', group: 'Student' },
  { id: 'student-activity-logger', label: 'Student Activity Logger', icon: 'Clipboard', href: '/student/activity/logger', group: 'Student' },
  { id: 'my-activities', label: 'My Activities', icon: 'FileText', href: '/activities', group: 'Faculty' },
  { id: 'submit-achievements', label: 'Submit Achievements', icon: 'Award', href: '/achievements/submit', group: 'Faculty' },
  { id: 'submit-action-plan', label: 'Submit Action Plan', icon: 'Clipboard', href: '/action-plan/submit', group: 'Faculty' },
  { id: 'department', label: 'Department', icon: 'Building2', href: '/department', group: 'Department' },
  { id: 'leaderboard', label: 'Leaderboard', icon: 'Trophy', href: '/leaderboard', group: 'Department' },
  { id: 'college-overview', label: 'College Overview', icon: 'GraduationCap', href: '/college', group: 'College' },
  { id: 'verification-queue', label: 'Verification Queue', icon: 'ShieldCheck', href: '/verification', group: 'Management' },
  { id: 'verification-panel', label: 'Verification Panel', icon: 'ShieldCheck', href: '/verification-panel', group: 'Management' },
  { id: 'user-management', label: 'User Management', icon: 'Users', href: '/users', group: 'Management' },
  { id: 'role-management', label: 'Role Management', icon: 'Shield', href: '/roles', group: 'Management' },
  { id: 'page-management', label: 'Page Management', icon: 'Settings', href: '/roles/pages', group: 'Management' },
  { id: 'workflow-deadlines', label: 'Workflow Deadlines', icon: 'Calendar', href: '/activities/admin', group: 'Management' },
  { id: 'college-task-compliance', label: 'Task Compliance Analytics', icon: 'Users', href: '/college/task-compliance', group: 'College' },
  { id: 'student-activity-create-event', label: 'Create Event', icon: 'Clipboard', href: '/student/activity/create-event', group: 'Student' },
  { id: 'email-templates', label: 'Email Templates', icon: 'Mail', href: '/activities/admin/mail-alerts', group: 'Management' },
]

const CORE_BY_KEY = new Map(CORE_RESOURCE_CATALOG.map((resource) => [resource.id, resource]))
const CORE_BY_ROUTE = new Map(CORE_RESOURCE_CATALOG.map((resource) => [resource.href, resource]))

type DefaultRoleProfile = {
  passwordPrefix: string
  editAccess: boolean
  deleteAccess: boolean
  resources: string[]
}

const DEFAULT_ROLE_PROFILES: Record<string, DefaultRoleProfile> = {
  FACULTY: {
    passwordPrefix: 'fc',
    editAccess: true,
    deleteAccess: false,
    resources: ['dashboard', 'my-activities', 'submit-achievements', 'submit-action-plan'],
  },
  HOD: {
    passwordPrefix: 'hd',
    editAccess: true,
    deleteAccess: true,
    resources: ['dashboard', 'my-activities', 'submit-achievements', 'submit-action-plan', 'department', 'leaderboard', 'student-activity-logger'],
  },
  DEAN: {
    passwordPrefix: 'dn',
    editAccess: true,
    deleteAccess: true,
    resources: ['dashboard', 'my-activities', 'submit-achievements', 'submit-action-plan', 'department', 'leaderboard', 'college-overview', 'college-task-compliance', 'student-activity-logger'],
  },
  IQAC: {
    passwordPrefix: 'vc',
    editAccess: true,
    deleteAccess: false,
    resources: ['dashboard', 'verification-queue', 'verification-panel', 'student-activity-logger'],
  },
  ADMIN: {
    passwordPrefix: 'ad',
    editAccess: true,
    deleteAccess: true,
    resources: CORE_RESOURCE_CATALOG.map((resource) => resource.id),
  },
  STUDENT: {
    passwordPrefix: 'st',
    editAccess: true,
    deleteAccess: false,
    resources: ['student-dashboard', 'student-overview', 'student-activity-master', 'student-activity-logger'],
  },
}

const normalizeDbRoleName = (value: string) => value.trim().toUpperCase()

const normalizeUiRoleName = (value: string) => {
  return value.trim()
}

const normalizeDate = (value: string | Date | undefined | null) => {
  if (!value) return new Date().toISOString().split('T')[0]
  return new Date(value).toISOString().split('T')[0]
}

const normalizeRoute = (route: string) => {
  if (!route || route === '/') return '/'
  return route.replace(/\/+$/, '')
}

const toTitleCase = (value: string) =>
  value
    .split(/[-_.\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const buildPageKeyFromRoute = (route: string) => {
  if (route === '/') return 'home'
  return route
    .slice(1)
    .replace(/\//g, '.')
    .replace(/\[(\.\.\.)?([^\]]+)\]/g, '$2')
    .replace(/[^a-zA-Z0-9.]+/g, '-')
    .replace(/\.{2,}/g, '.')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

const normalizePageKey = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')

const getGroupForRoute = (route: string) => {
  if (route.startsWith('/student')) return 'Student'
  if (route.startsWith('/achievements') || route.startsWith('/faculty') || route.startsWith('/activities') || route.startsWith('/action-plan')) return 'Faculty'
  if (route.startsWith('/department') || route.startsWith('/leaderboard')) return 'Department'
  if (route.startsWith('/college')) return 'College'
  if (route.startsWith('/roles') || route.startsWith('/users') || route.startsWith('/verification')) return 'Management'
  return 'Other'
}

const getIconForRoute = (route: string) => {
  if (route.startsWith('/dashboard') || route.startsWith('/student/dashboard')) return 'LayoutDashboard'
  if (route.startsWith('/achievements')) return 'Award'
  if (route.startsWith('/action-plan')) return 'Clipboard'
  if (route.startsWith('/department')) return 'Building2'
  if (route.startsWith('/leaderboard')) return 'Trophy'
  if (route.startsWith('/college')) return 'GraduationCap'
  if (route.startsWith('/verification')) return 'ShieldCheck'
  if (route.startsWith('/users')) return 'Users'
  if (route.startsWith('/roles')) return 'Shield'
  if (route.startsWith('/student/activity')) return 'Clipboard'
  if (route.startsWith('/student')) return 'FileText'
  return 'FileText'
}

const getLabelFromRoute = (route: string) => {
  if (route === '/') return 'Home'
  const parts = route.split('/').filter(Boolean)
  const last = parts[parts.length - 1]
  if (!last) return 'Page'
  if (last.startsWith('[') && last.endsWith(']')) return `${toTitleCase(parts[parts.length - 2] || 'Dynamic')} Detail`
  return toTitleCase(last)
}

const fileExists = async (filePath: string) => {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

class RolesService {
  private bootstrapPromise: Promise<void> | null = null
  private readonly roleAccessCache = new Map<number, { value: RoleAccessSummary; expiresAt: number }>()

  private getRoleAccessCacheTtlMs() {
    const configured = Number(process.env.ROLE_ACCESS_CACHE_TTL_MS || 30_000)
    if (!Number.isFinite(configured) || configured < 1_000) {
      return 30_000
    }
    return configured
  }

  private getCachedRoleAccess(roleId: number): RoleAccessSummary | null {
    const cached = this.roleAccessCache.get(roleId)
    if (!cached) return null

    if (cached.expiresAt <= Date.now()) {
      this.roleAccessCache.delete(roleId)
      return null
    }

    return cached.value
  }

  private setCachedRoleAccess(roleId: number, value: RoleAccessSummary) {
    this.roleAccessCache.set(roleId, {
      value,
      expiresAt: Date.now() + this.getRoleAccessCacheTtlMs(),
    })
  }

  private invalidateRoleAccessCache(roleId?: number) {
    if (typeof roleId === 'number') {
      this.roleAccessCache.delete(roleId)
      return
    }

    this.roleAccessCache.clear()
  }

  private async resolveAppDirectory() {
    const candidates = [
      path.resolve(process.cwd(), '../app'),
      path.resolve(process.cwd(), 'app'),
    ]

    for (const candidate of candidates) {
      if (await fileExists(candidate)) return candidate
    }

    return null
  }

  private async collectPageFiles(directory: string): Promise<string[]> {
    const entries = await fs.readdir(directory, { withFileTypes: true })
    const files: string[] = []

    for (const entry of entries) {
      if (entry.name === 'api') continue

      const fullPath = path.join(directory, entry.name)
      if (entry.isDirectory()) {
        files.push(...(await this.collectPageFiles(fullPath)))
      } else if (entry.isFile() && entry.name === 'page.tsx') {
        files.push(fullPath)
      }
    }

    return files
  }

  private async discoverAppPages(): Promise<RoleResource[]> {
    const appDir = await this.resolveAppDirectory()
    if (!appDir) return []

    const files = await this.collectPageFiles(appDir)
    const resources: RoleResource[] = []

    for (const file of files) {
      const relative = path.relative(appDir, file).replace(/\\/g, '/')
      const route = normalizeRoute(relative === 'page.tsx' ? '/' : `/${relative.replace(/\/page\.tsx$/, '')}`)

      if (['/', '/login', '/register'].includes(route)) {
        continue
      }

      const core = CORE_BY_ROUTE.get(route)
      if (core) {
        resources.push(core)
        continue
      }

      resources.push({
        id: buildPageKeyFromRoute(route),
        label: getLabelFromRoute(route),
        href: route,
        icon: getIconForRoute(route),
        group: getGroupForRoute(route),
      })
    }

    return resources
  }

  private mergeCatalogResources(resources: RoleResource[]) {
    const mergedByRoute = new Map<string, RoleResource>()

    for (const core of CORE_RESOURCE_CATALOG) {
      mergedByRoute.set(core.href, core)
    }

    for (const resource of resources) {
      const normalizedRoute = normalizeRoute(resource.href)
      if (mergedByRoute.has(normalizedRoute)) continue
      mergedByRoute.set(normalizedRoute, { ...resource, href: normalizedRoute })
    }

    return Array.from(mergedByRoute.values()).sort((a, b) => a.href.localeCompare(b.href))
  }

  private mapPageRowToResource(row: AppPageRow): RoleResource {
    const route = normalizeRoute(row.route_path)
    const coreByKey = CORE_BY_KEY.get(row.page_key)
    const coreByRoute = CORE_BY_ROUTE.get(route)
    const core = coreByKey || coreByRoute

    if (core) {
      return {
        id: row.page_key,
        label: row.page_name || core.label,
        href: route,
        icon: core.icon,
        group: core.group,
      }
    }

    return {
      id: row.page_key,
      label: row.page_name,
      href: route,
      icon: getIconForRoute(route),
      group: getGroupForRoute(route),
    }
  }

  private async syncAppPages(resources: RoleResource[]) {
    const pool = getMysqlPool()

    if (resources.length === 0) {
      return
    }

    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      for (const resource of resources) {
        await connection.query(
          `INSERT INTO app_pages (page_key, page_name, route_path)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE
           page_name = VALUES(page_name),
           route_path = VALUES(route_path)`,
          [resource.id, resource.label, normalizeRoute(resource.href)],
        )
      }

      await connection.commit()
    } catch (error) {
      try {
        await connection.rollback()
      } catch {
        // Ignore rollback failures so the original sync error can surface.
      }
      throw error
    } finally {
      connection.release()
    }
  }

  async listAppPages(): Promise<AppPageRecord[]> {
    await this.ensureTables()
    const pool = getMysqlPool()

    const [rows] = await pool.query<AppPageRow[]>(
      `SELECT id, page_key, page_name, route_path, created_at
       FROM app_pages
       ORDER BY route_path ASC`,
    )

    return rows.map((row) => ({
      id: Number(row.id),
      pageKey: row.page_key,
      pageName: row.page_name,
      routePath: normalizeRoute(row.route_path),
      createdAt: normalizeDate(row.created_at),
    }))
  }

  async createAppPage(input: AppPageCreateInput): Promise<AppPageRecord> {
    await this.ensureTables()
    const pool = getMysqlPool()

    const routePath = normalizeRoute(input.routePath)
    const pageName = input.pageName.trim()
    const pageKey = normalizePageKey(input.pageKey?.trim() || buildPageKeyFromRoute(routePath))

    if (!pageName) {
      throw new Error('Page name is required')
    }

    if (!routePath.startsWith('/')) {
      throw new Error('Route path must start with "/"')
    }

    if (!pageKey) {
      throw new Error('Page key is invalid')
    }

    try {
      const [result] = await pool.query<OkPacket>(
        `INSERT INTO app_pages (page_key, page_name, route_path)
         VALUES (?, ?, ?)`,
        [pageKey, pageName, routePath],
      )

      const pageId = Number(result.insertId)
      const pages = await this.listAppPages()
      const page = pages.find((item) => item.id === pageId)
      if (!page) {
        throw new Error('Failed to load created page')
      }

      this.invalidateRoleAccessCache()
      return page
    } catch (error) {
      const sqlCode = (error as { code?: string })?.code
      if (sqlCode === 'ER_DUP_ENTRY') {
        throw new AppPageConflictError('Page key or route path already exists')
      }
      throw error
    }
  }

  async deleteAppPage(pageId: number) {
    await this.ensureTables()
    const pool = getMysqlPool()
    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      const [rows] = await connection.query<AppPageRow[]>(
        `SELECT id, page_key, route_path
         FROM app_pages
         WHERE id = ?
         LIMIT 1`,
        [pageId],
      )

      if (rows.length === 0) {
        await connection.rollback()
        return false
      }

      const row = rows[0]
      const isProtected = CORE_BY_KEY.has(row.page_key) || CORE_BY_ROUTE.has(normalizeRoute(row.route_path))
      if (isProtected) {
        throw new AppPageConflictError('Core pages cannot be deleted')
      }

      await connection.query(`DELETE FROM role_page_access WHERE page_id = ?`, [pageId])
      await connection.query(`DELETE FROM app_pages WHERE id = ?`, [pageId])

      await connection.commit()
      this.invalidateRoleAccessCache()
      return true
    } catch (error) {
      try {
        await connection.rollback()
      } catch {
        // Ignore rollback failures and rethrow original error.
      }
      throw error
    } finally {
      connection.release()
    }
  }

  private async ensureTables() {
    if (this.bootstrapPromise) {
      await this.bootstrapPromise
      return
    }

    this.bootstrapPromise = (async () => {
      const pool = getMysqlPool()

      await pool.query(
        `CREATE TABLE IF NOT EXISTS app_pages (
          id INT NOT NULL AUTO_INCREMENT,
          page_key VARCHAR(120) NOT NULL,
          page_name VARCHAR(150) NOT NULL,
          route_path VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          UNIQUE KEY app_pages_page_key (page_key),
          UNIQUE KEY app_pages_route_path (route_path)
        )`,
      )

      await pool.query(
        `CREATE TABLE IF NOT EXISTS role_page_access (
          id INT NOT NULL AUTO_INCREMENT,
          role_id INT NOT NULL,
          page_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          UNIQUE KEY role_page_access_unique (role_id, page_id),
          KEY role_page_access_page_idx (page_id)
        )`,
      )

      const discovered = await this.discoverAppPages()
      const merged = this.mergeCatalogResources(discovered)
      await this.syncAppPages(merged)
    })()

    try {
      await this.bootstrapPromise
    } catch (error) {
      this.bootstrapPromise = null
      throw error
    }
  }

  async getResources(): Promise<RoleResource[]> {
    await this.ensureTables()
    const pool = getMysqlPool()

    const [rows] = await pool.query<AppPageRow[]>(
      `SELECT id, page_key, page_name, route_path
       FROM app_pages
       ORDER BY route_path ASC`,
    )

    return rows.map((row) => this.mapPageRowToResource(row))
  }

  private async getRoleResourcesByRoleId(roleId: number): Promise<RoleResource[]> {
    await this.ensureTables()
    const pool = getMysqlPool()

    const [rows] = await pool.query<AppPageRow[]>(
      `SELECT ap.id, ap.page_key, ap.page_name, ap.route_path
       FROM role_page_access rpa
       INNER JOIN app_pages ap ON ap.id = rpa.page_id
       WHERE rpa.role_id = ?
       ORDER BY ap.route_path ASC`,
      [roleId],
    )

    return rows.map((row) => this.mapPageRowToResource(row))
  }

  async getRoleAccessByRoleId(roleId: number): Promise<RoleAccessSummary> {
    await this.ensureTables()

    const cached = this.getCachedRoleAccess(roleId)
    if (cached) {
      return cached
    }

    const pool = getMysqlPool()

    const [roleRows] = await pool.query<Array<RowDataPacket & { id: number; name: string }>>(
      `SELECT id, name FROM roles WHERE id = ? LIMIT 1`,
      [roleId],
    )

    if (roleRows.length === 0) {
      const emptyAccess = { resources: [], routePaths: [] }
      this.setCachedRoleAccess(roleId, emptyAccess)
      return emptyAccess
    }

    const resources = await this.getRoleResourcesByRoleId(roleId)

    const routePaths = Array.from(new Set(resources.map((resource) => normalizeRoute(resource.href))))
    const access = { resources, routePaths }
    this.setCachedRoleAccess(roleId, access)
    return access
  }

  async listRoles(): Promise<RoleRecord[]> {
    await this.ensureTables()
    const pool = getMysqlPool()

    const [roleRows] = await pool.query<Array<RowDataPacket & { id: number; name: string; is_active: number; created_at: string | null }>>(
      `SELECT id, name, is_active, created_at FROM roles ORDER BY id ASC`,
    )

    const [accessRows] = await pool.query<Array<RowDataPacket & { role_id: number; page_key: string }>>(
      `SELECT rpa.role_id, ap.page_key
       FROM role_page_access rpa
       INNER JOIN app_pages ap ON ap.id = rpa.page_id`,
    )

    const [countRows] = await pool.query<Array<RowDataPacket & { role_id: number; users_count: number }>>(
      `SELECT role_id, COUNT(*) AS users_count FROM users GROUP BY role_id`,
    )

    const resourcesByRoleId = new Map<number, string[]>()
    for (const row of accessRows) {
      const roleId = Number(row.role_id)
      const existing = resourcesByRoleId.get(roleId) || []
      existing.push(row.page_key)
      resourcesByRoleId.set(roleId, existing)
    }

    const countsByRoleId = new Map(countRows.map((row) => [Number(row.role_id), Number(row.users_count)]))

    return roleRows.map((row) => {
      const dbRoleName = normalizeDbRoleName(row.name)
      const configured = resourcesByRoleId.get(Number(row.id)) || []

      return {
        id: Number(row.id),
        name: row.name,
        description: '',
        passwordPrefix: DEFAULT_ROLE_PROFILES[dbRoleName]?.passwordPrefix || '',
        editAccess: DEFAULT_ROLE_PROFILES[dbRoleName]?.editAccess ?? true,
        deleteAccess: DEFAULT_ROLE_PROFILES[dbRoleName]?.deleteAccess ?? false,
        status: Number(row.is_active) === 1,
        resources: configured,
        isSystem: false,
        createdAt: normalizeDate(row.created_at),
        usersCount: countsByRoleId.get(Number(row.id)) || 0,
      }
    })
  }

  private async resolvePageIds(resourceIds: string[]) {
    if (resourceIds.length === 0) return new Map<string, number>()

    const pool = getMysqlPool()
    const [rows] = await pool.query<Array<RowDataPacket & { id: number; page_key: string }>>(
      `SELECT id, page_key
       FROM app_pages
       WHERE page_key IN (${resourceIds.map(() => '?').join(', ')})`,
      resourceIds,
    )

    return new Map(rows.map((row) => [row.page_key, Number(row.id)]))
  }

  async createRole(input: RoleUpsertInput): Promise<RoleRecord> {
    await this.ensureTables()
    const pool = getMysqlPool()

    const dbRoleName = normalizeUiRoleName(input.name)
    const [insertResult] = await pool.query<OkPacket>(
      `INSERT INTO roles (name, is_active) VALUES (?, ?)`,
      [dbRoleName, input.status ? 1 : 0],
    )

    const roleId = Number(insertResult.insertId)
    const resourceIds = Array.from(new Set(input.resources.map((resource) => resource.trim()).filter(Boolean)))
    const pageIdByKey = await this.resolvePageIds(resourceIds)

    const values: number[] = []
    for (const resourceId of resourceIds) {
      const pageId = pageIdByKey.get(resourceId)
      if (pageId) values.push(roleId, pageId)
    }

    if (values.length > 0) {
      await pool.query(
        `INSERT IGNORE INTO role_page_access (role_id, page_id)
         VALUES ${new Array(values.length / 2).fill('(?, ?)').join(', ')}`,
        values,
      )
    }

    const roles = await this.listRoles()
    const createdRole = roles.find((role) => role.id === roleId)
    if (!createdRole) throw new Error('Failed to fetch created role')
    this.invalidateRoleAccessCache(roleId)
    return createdRole
  }

  async updateRole(roleId: number, input: RoleUpsertInput): Promise<RoleRecord> {
    await this.ensureTables()
    const pool = getMysqlPool()

    const dbRoleName = normalizeUiRoleName(input.name)
    await pool.query(`UPDATE roles SET name = ?, is_active = ? WHERE id = ?`, [dbRoleName, input.status ? 1 : 0, roleId])

    await pool.query(`DELETE FROM role_page_access WHERE role_id = ?`, [roleId])

    const resourceIds = Array.from(new Set(input.resources.map((resource) => resource.trim()).filter(Boolean)))
    const pageIdByKey = await this.resolvePageIds(resourceIds)

    const values: number[] = []
    for (const resourceId of resourceIds) {
      const pageId = pageIdByKey.get(resourceId)
      if (pageId) values.push(roleId, pageId)
    }

    if (values.length > 0) {
      await pool.query(
        `INSERT IGNORE INTO role_page_access (role_id, page_id)
         VALUES ${new Array(values.length / 2).fill('(?, ?)').join(', ')}`,
        values,
      )
    }

    const roles = await this.listRoles()
    const updatedRole = roles.find((role) => role.id === roleId)
    if (!updatedRole) throw new Error('Role not found after update')
    this.invalidateRoleAccessCache(roleId)
    return updatedRole
  }

  async deleteRole(roleId: number) {
    await this.ensureTables()
    const pool = getMysqlPool()
    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      const [roleRows] = await connection.query<Array<RowDataPacket & { id: number; name: string }>>(
        `SELECT id, name FROM roles WHERE id = ? LIMIT 1`,
        [roleId],
      )

      if (roleRows.length === 0) {
        await connection.rollback()
        return false
      }

      const [countRows] = await connection.query<Array<RowDataPacket & { users_count: number }>>(
        `SELECT COUNT(*) AS users_count FROM users WHERE role_id = ?`,
        [roleId],
      )

      const usersCount = Number(countRows[0]?.users_count || 0)
      if (usersCount > 0) {
        throw new RoleInUseError(usersCount)
      }

      await connection.query(`DELETE FROM role_page_access WHERE role_id = ?`, [roleId])
      await connection.query(`DELETE FROM roles WHERE id = ?`, [roleId])

      await connection.commit()
      this.invalidateRoleAccessCache(roleId)
      return true
    } catch (error) {
      try {
        await connection.rollback()
      } catch {
        // Ignore rollback failures and rethrow original error.
      }
      throw error
    } finally {
      connection.release()
    }
  }

  async updateAppPage(pageId: number, input: AppPageUpdateInput): Promise<AppPageRecord> {
    await this.ensureTables()
    const pool = getMysqlPool()
    const connection = await pool.getConnection()

    const routePath = normalizeRoute(input.routePath)
    const pageName = input.pageName.trim()
    const pageKey = normalizePageKey(input.pageKey?.trim() || buildPageKeyFromRoute(routePath))

    if (!pageName) {
      throw new Error('Page name is required')
    }

    if (!routePath.startsWith('/')) {
      throw new Error('Route path must start with "/"')
    }

    if (!pageKey) {
      throw new Error('Page key is invalid')
    }

    try {
      await connection.beginTransaction()

      const [rows] = await connection.query<AppPageRow[]>(
        `SELECT id, page_key, route_path
         FROM app_pages
         WHERE id = ?
         LIMIT 1`,
        [pageId],
      )

      if (rows.length === 0) {
        await connection.rollback()
        throw new Error('Page not found')
      }

      const row = rows[0]
      const isProtected = CORE_BY_KEY.has(row.page_key) || CORE_BY_ROUTE.has(normalizeRoute(row.route_path))
      if (isProtected) {
        throw new AppPageConflictError('Core pages cannot be edited')
      }

      await connection.query(
        `UPDATE app_pages
         SET page_key = ?, page_name = ?, route_path = ?
         WHERE id = ?`,
        [pageKey, pageName, routePath, pageId],
      )

      await connection.commit()
      this.invalidateRoleAccessCache()

      const pages = await this.listAppPages()
      const page = pages.find((item) => item.id === pageId)
      if (!page) {
        throw new Error('Failed to load updated page')
      }

      return page
    } catch (error) {
      try {
        await connection.rollback()
      } catch {
        // Ignore rollback failures and rethrow original error.
      }

      const sqlCode = (error as { code?: string })?.code
      if (sqlCode === 'ER_DUP_ENTRY') {
        throw new AppPageConflictError('Page key or route path already exists')
      }

      throw error
    } finally {
      connection.release()
    }
  }
}

export { RoleInUseError }
export { AppPageConflictError }
export default new RolesService()
