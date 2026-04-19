import fs from 'fs/promises';
import path from 'path';
import getMysqlPool from '../database/mysql';
class RoleInUseError extends Error {
    constructor(usersCount) {
        super(`Role is assigned to ${usersCount} users and cannot be deleted`);
        this.usersCount = usersCount;
        this.name = 'RoleInUseError';
    }
}
const CORE_RESOURCE_CATALOG = [
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
    { id: 'workflow-deadlines', label: 'Workflow Deadlines', icon: 'Calendar', href: '/activities/admin', group: 'Management' },
    { id: 'email-templates', label: 'Email Templates', icon: 'Mail', href: '/activities/admin/mail-alerts', group: 'Management' },
];
const CORE_BY_KEY = new Map(CORE_RESOURCE_CATALOG.map((resource) => [resource.id, resource]));
const CORE_BY_ROUTE = new Map(CORE_RESOURCE_CATALOG.map((resource) => [resource.href, resource]));
const DEFAULT_ROLE_PROFILES = {
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
        resources: ['dashboard', 'my-activities', 'submit-achievements', 'submit-action-plan', 'department', 'leaderboard'],
    },
    DEAN: {
        passwordPrefix: 'dn',
        editAccess: true,
        deleteAccess: true,
        resources: ['dashboard', 'my-activities', 'submit-achievements', 'submit-action-plan', 'department', 'leaderboard', 'college-overview'],
    },
    IQAC: {
        passwordPrefix: 'vc',
        editAccess: true,
        deleteAccess: false,
        resources: ['dashboard', 'verification-queue', 'verification-panel'],
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
};
const normalizeDbRoleName = (value) => value.trim().toUpperCase();
const normalizeUiRoleName = (value) => {
    return value.trim();
};
const normalizeDate = (value) => {
    if (!value)
        return new Date().toISOString().split('T')[0];
    return new Date(value).toISOString().split('T')[0];
};
const normalizeRoute = (route) => {
    if (!route || route === '/')
        return '/';
    return route.replace(/\/+$/, '');
};
const toTitleCase = (value) => value
    .split(/[-_.\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
const buildPageKeyFromRoute = (route) => {
    if (route === '/')
        return 'home';
    return route
        .slice(1)
        .replace(/\//g, '.')
        .replace(/\[(\.\.\.)?([^\]]+)\]/g, '$2')
        .replace(/[^a-zA-Z0-9.]+/g, '-')
        .replace(/\.{2,}/g, '.')
        .replace(/^-+|-+$/g, '')
        .toLowerCase();
};
const getGroupForRoute = (route) => {
    if (route.startsWith('/student'))
        return 'Student';
    if (route.startsWith('/achievements') || route.startsWith('/faculty') || route.startsWith('/activities') || route.startsWith('/action-plan'))
        return 'Faculty';
    if (route.startsWith('/department') || route.startsWith('/leaderboard'))
        return 'Department';
    if (route.startsWith('/college'))
        return 'College';
    if (route.startsWith('/roles') || route.startsWith('/users') || route.startsWith('/verification'))
        return 'Management';
    return 'Other';
};
const getIconForRoute = (route) => {
    if (route.startsWith('/dashboard') || route.startsWith('/student/dashboard'))
        return 'LayoutDashboard';
    if (route.startsWith('/achievements'))
        return 'Award';
    if (route.startsWith('/action-plan'))
        return 'Clipboard';
    if (route.startsWith('/department'))
        return 'Building2';
    if (route.startsWith('/leaderboard'))
        return 'Trophy';
    if (route.startsWith('/college'))
        return 'GraduationCap';
    if (route.startsWith('/verification'))
        return 'ShieldCheck';
    if (route.startsWith('/users'))
        return 'Users';
    if (route.startsWith('/roles'))
        return 'Shield';
    if (route.startsWith('/student/activity'))
        return 'Clipboard';
    if (route.startsWith('/student'))
        return 'FileText';
    return 'FileText';
};
const getLabelFromRoute = (route) => {
    if (route === '/')
        return 'Home';
    const parts = route.split('/').filter(Boolean);
    const last = parts[parts.length - 1];
    if (!last)
        return 'Page';
    if (last.startsWith('[') && last.endsWith(']'))
        return `${toTitleCase(parts[parts.length - 2] || 'Dynamic')} Detail`;
    return toTitleCase(last);
};
const fileExists = async (filePath) => {
    try {
        await fs.access(filePath);
        return true;
    }
    catch {
        return false;
    }
};
class RolesService {
    constructor() {
        this.bootstrapPromise = null;
        this.roleAccessCache = new Map();
    }
    getRoleAccessCacheTtlMs() {
        const configured = Number(process.env.ROLE_ACCESS_CACHE_TTL_MS || 30000);
        if (!Number.isFinite(configured) || configured < 1000) {
            return 30000;
        }
        return configured;
    }
    getCachedRoleAccess(roleId) {
        const cached = this.roleAccessCache.get(roleId);
        if (!cached)
            return null;
        if (cached.expiresAt <= Date.now()) {
            this.roleAccessCache.delete(roleId);
            return null;
        }
        return cached.value;
    }
    setCachedRoleAccess(roleId, value) {
        this.roleAccessCache.set(roleId, {
            value,
            expiresAt: Date.now() + this.getRoleAccessCacheTtlMs(),
        });
    }
    invalidateRoleAccessCache(roleId) {
        if (typeof roleId === 'number') {
            this.roleAccessCache.delete(roleId);
            return;
        }
        this.roleAccessCache.clear();
    }
    async resolveAppDirectory() {
        const candidates = [
            path.resolve(process.cwd(), '../app'),
            path.resolve(process.cwd(), 'app'),
        ];
        for (const candidate of candidates) {
            if (await fileExists(candidate))
                return candidate;
        }
        return null;
    }
    async collectPageFiles(directory) {
        const entries = await fs.readdir(directory, { withFileTypes: true });
        const files = [];
        for (const entry of entries) {
            if (entry.name === 'api')
                continue;
            const fullPath = path.join(directory, entry.name);
            if (entry.isDirectory()) {
                files.push(...(await this.collectPageFiles(fullPath)));
            }
            else if (entry.isFile() && entry.name === 'page.tsx') {
                files.push(fullPath);
            }
        }
        return files;
    }
    async discoverAppPages() {
        const appDir = await this.resolveAppDirectory();
        if (!appDir)
            return [];
        const files = await this.collectPageFiles(appDir);
        const resources = [];
        for (const file of files) {
            const relative = path.relative(appDir, file).replace(/\\/g, '/');
            const route = normalizeRoute(relative === 'page.tsx' ? '/' : `/${relative.replace(/\/page\.tsx$/, '')}`);
            if (['/', '/login', '/register'].includes(route)) {
                continue;
            }
            const core = CORE_BY_ROUTE.get(route);
            if (core) {
                resources.push(core);
                continue;
            }
            resources.push({
                id: buildPageKeyFromRoute(route),
                label: getLabelFromRoute(route),
                href: route,
                icon: getIconForRoute(route),
                group: getGroupForRoute(route),
            });
        }
        return resources;
    }
    mergeCatalogResources(resources) {
        const mergedByRoute = new Map();
        for (const core of CORE_RESOURCE_CATALOG) {
            mergedByRoute.set(core.href, core);
        }
        for (const resource of resources) {
            const normalizedRoute = normalizeRoute(resource.href);
            if (mergedByRoute.has(normalizedRoute))
                continue;
            mergedByRoute.set(normalizedRoute, { ...resource, href: normalizedRoute });
        }
        return Array.from(mergedByRoute.values()).sort((a, b) => a.href.localeCompare(b.href));
    }
    mapPageRowToResource(row) {
        const route = normalizeRoute(row.route_path);
        const coreByKey = CORE_BY_KEY.get(row.page_key);
        const coreByRoute = CORE_BY_ROUTE.get(route);
        const core = coreByKey || coreByRoute;
        if (core) {
            return {
                id: row.page_key,
                label: row.page_name || core.label,
                href: route,
                icon: core.icon,
                group: core.group,
            };
        }
        return {
            id: row.page_key,
            label: row.page_name,
            href: route,
            icon: getIconForRoute(route),
            group: getGroupForRoute(route),
        };
    }
    async syncAppPages(resources) {
        const pool = getMysqlPool();
        if (resources.length === 0) {
            return;
        }
        const normalizedRoutes = resources.map((resource) => normalizeRoute(resource.href));
        const routePlaceholders = normalizedRoutes.map(() => '?').join(', ');
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const [stalePages] = await connection.query(`SELECT id
         FROM app_pages
         WHERE route_path NOT IN (${routePlaceholders})`, normalizedRoutes);
            const stalePageIds = stalePages.map((row) => row.id);
            if (stalePageIds.length > 0) {
                const staleIdPlaceholders = stalePageIds.map(() => '?').join(', ');
                await connection.query(`DELETE FROM role_page_access
           WHERE page_id IN (${staleIdPlaceholders})`, stalePageIds);
            }
            await connection.query(`DELETE FROM app_pages
         WHERE route_path NOT IN (${routePlaceholders})`, normalizedRoutes);
            for (const resource of resources) {
                await connection.query(`INSERT INTO app_pages (page_key, page_name, route_path)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE
           page_name = VALUES(page_name),
           route_path = VALUES(route_path)`, [resource.id, resource.label, normalizeRoute(resource.href)]);
            }
            await connection.commit();
        }
        catch (error) {
            try {
                await connection.rollback();
            }
            catch {
                // Ignore rollback failures so the original sync error can surface.
            }
            throw error;
        }
        finally {
            connection.release();
        }
    }
    async ensureTables() {
        if (this.bootstrapPromise) {
            await this.bootstrapPromise;
            return;
        }
        this.bootstrapPromise = (async () => {
            const pool = getMysqlPool();
            await pool.query(`CREATE TABLE IF NOT EXISTS app_pages (
          id INT NOT NULL AUTO_INCREMENT,
          page_key VARCHAR(120) NOT NULL,
          page_name VARCHAR(150) NOT NULL,
          route_path VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          UNIQUE KEY app_pages_page_key (page_key),
          UNIQUE KEY app_pages_route_path (route_path)
        )`);
            await pool.query(`CREATE TABLE IF NOT EXISTS role_page_access (
          id INT NOT NULL AUTO_INCREMENT,
          role_id INT NOT NULL,
          page_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          UNIQUE KEY role_page_access_unique (role_id, page_id),
          KEY role_page_access_page_idx (page_id)
        )`);
            const discovered = await this.discoverAppPages();
            const merged = this.mergeCatalogResources(discovered);
            await this.syncAppPages(merged);
        })();
        try {
            await this.bootstrapPromise;
        }
        catch (error) {
            this.bootstrapPromise = null;
            throw error;
        }
    }
    async getResources() {
        await this.ensureTables();
        const pool = getMysqlPool();
        const [rows] = await pool.query(`SELECT id, page_key, page_name, route_path
       FROM app_pages
       ORDER BY route_path ASC`);
        return rows.map((row) => this.mapPageRowToResource(row));
    }
    async getRoleResourcesByRoleId(roleId) {
        await this.ensureTables();
        const pool = getMysqlPool();
        const [rows] = await pool.query(`SELECT ap.id, ap.page_key, ap.page_name, ap.route_path
       FROM role_page_access rpa
       INNER JOIN app_pages ap ON ap.id = rpa.page_id
       WHERE rpa.role_id = ?
       ORDER BY ap.route_path ASC`, [roleId]);
        return rows.map((row) => this.mapPageRowToResource(row));
    }
    async getRoleAccessByRoleId(roleId) {
        await this.ensureTables();
        const cached = this.getCachedRoleAccess(roleId);
        if (cached) {
            return cached;
        }
        const pool = getMysqlPool();
        const [roleRows] = await pool.query(`SELECT id, name FROM roles WHERE id = ? LIMIT 1`, [roleId]);
        if (roleRows.length === 0) {
            const emptyAccess = { resources: [], routePaths: [] };
            this.setCachedRoleAccess(roleId, emptyAccess);
            return emptyAccess;
        }
        const resources = await this.getRoleResourcesByRoleId(roleId);
        const routePaths = Array.from(new Set(resources.map((resource) => normalizeRoute(resource.href))));
        const access = { resources, routePaths };
        this.setCachedRoleAccess(roleId, access);
        return access;
    }
    async listRoles() {
        await this.ensureTables();
        const pool = getMysqlPool();
        const [roleRows] = await pool.query(`SELECT id, name, is_active, created_at FROM roles ORDER BY id ASC`);
        const [accessRows] = await pool.query(`SELECT rpa.role_id, ap.page_key
       FROM role_page_access rpa
       INNER JOIN app_pages ap ON ap.id = rpa.page_id`);
        const [countRows] = await pool.query(`SELECT role_id, COUNT(*) AS users_count FROM users GROUP BY role_id`);
        const resourcesByRoleId = new Map();
        for (const row of accessRows) {
            const roleId = Number(row.role_id);
            const existing = resourcesByRoleId.get(roleId) || [];
            existing.push(row.page_key);
            resourcesByRoleId.set(roleId, existing);
        }
        const countsByRoleId = new Map(countRows.map((row) => [Number(row.role_id), Number(row.users_count)]));
        return roleRows.map((row) => {
            const dbRoleName = normalizeDbRoleName(row.name);
            const configured = resourcesByRoleId.get(Number(row.id)) || [];
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
            };
        });
    }
    async resolvePageIds(resourceIds) {
        if (resourceIds.length === 0)
            return new Map();
        const pool = getMysqlPool();
        const [rows] = await pool.query(`SELECT id, page_key
       FROM app_pages
       WHERE page_key IN (${resourceIds.map(() => '?').join(', ')})`, resourceIds);
        return new Map(rows.map((row) => [row.page_key, Number(row.id)]));
    }
    async createRole(input) {
        await this.ensureTables();
        const pool = getMysqlPool();
        const dbRoleName = normalizeUiRoleName(input.name);
        const [insertResult] = await pool.query(`INSERT INTO roles (name, is_active) VALUES (?, ?)`, [dbRoleName, input.status ? 1 : 0]);
        const roleId = Number(insertResult.insertId);
        const resourceIds = Array.from(new Set(input.resources.map((resource) => resource.trim()).filter(Boolean)));
        const pageIdByKey = await this.resolvePageIds(resourceIds);
        const values = [];
        for (const resourceId of resourceIds) {
            const pageId = pageIdByKey.get(resourceId);
            if (pageId)
                values.push(roleId, pageId);
        }
        if (values.length > 0) {
            await pool.query(`INSERT IGNORE INTO role_page_access (role_id, page_id)
         VALUES ${new Array(values.length / 2).fill('(?, ?)').join(', ')}`, values);
        }
        const roles = await this.listRoles();
        const createdRole = roles.find((role) => role.id === roleId);
        if (!createdRole)
            throw new Error('Failed to fetch created role');
        this.invalidateRoleAccessCache(roleId);
        return createdRole;
    }
    async updateRole(roleId, input) {
        await this.ensureTables();
        const pool = getMysqlPool();
        const dbRoleName = normalizeUiRoleName(input.name);
        await pool.query(`UPDATE roles SET name = ?, is_active = ? WHERE id = ?`, [dbRoleName, input.status ? 1 : 0, roleId]);
        await pool.query(`DELETE FROM role_page_access WHERE role_id = ?`, [roleId]);
        const resourceIds = Array.from(new Set(input.resources.map((resource) => resource.trim()).filter(Boolean)));
        const pageIdByKey = await this.resolvePageIds(resourceIds);
        const values = [];
        for (const resourceId of resourceIds) {
            const pageId = pageIdByKey.get(resourceId);
            if (pageId)
                values.push(roleId, pageId);
        }
        if (values.length > 0) {
            await pool.query(`INSERT IGNORE INTO role_page_access (role_id, page_id)
         VALUES ${new Array(values.length / 2).fill('(?, ?)').join(', ')}`, values);
        }
        const roles = await this.listRoles();
        const updatedRole = roles.find((role) => role.id === roleId);
        if (!updatedRole)
            throw new Error('Role not found after update');
        this.invalidateRoleAccessCache(roleId);
        return updatedRole;
    }
    async deleteRole(roleId) {
        await this.ensureTables();
        const pool = getMysqlPool();
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const [roleRows] = await connection.query(`SELECT id, name FROM roles WHERE id = ? LIMIT 1`, [roleId]);
            if (roleRows.length === 0) {
                await connection.rollback();
                return false;
            }
            const [countRows] = await connection.query(`SELECT COUNT(*) AS users_count FROM users WHERE role_id = ?`, [roleId]);
            const usersCount = Number(countRows[0]?.users_count || 0);
            if (usersCount > 0) {
                throw new RoleInUseError(usersCount);
            }
            await connection.query(`DELETE FROM role_page_access WHERE role_id = ?`, [roleId]);
            await connection.query(`DELETE FROM roles WHERE id = ?`, [roleId]);
            await connection.commit();
            this.invalidateRoleAccessCache(roleId);
            return true;
        }
        catch (error) {
            try {
                await connection.rollback();
            }
            catch {
                // Ignore rollback failures and rethrow original error.
            }
            throw error;
        }
        finally {
            connection.release();
        }
    }
}
export { RoleInUseError };
export default new RolesService();
