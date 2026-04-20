import getMysqlPool from '../database/mysql';
import { logger } from '../utils/logger';
const mapRoleNameToUiRole = (roleName) => {
    const normalized = (roleName || '').toUpperCase();
    if (normalized === 'IQAC')
        return 'verification';
    if (normalized === 'ADMIN')
        return 'maintenance';
    return normalized.toLowerCase() || 'faculty';
};
const mapUiRoleToDbRole = (uiRole) => {
    const normalized = uiRole.trim().toLowerCase();
    if (normalized === 'verification')
        return 'IQAC';
    if (normalized === 'maintenance')
        return 'ADMIN';
    return normalized.toUpperCase();
};
const toIsoDate = (value) => {
    if (!value)
        return new Date().toISOString().split('T')[0];
    return new Date(value).toISOString().split('T')[0];
};
class UsersService {
    async getNextUserId(db = getMysqlPool()) {
        const [rows] = await db.query(`SELECT MAX(id) AS max_id FROM users`);
        return Number(rows[0]?.max_id || 0) + 1;
    }
    normalizeFacultyName(name) {
        return name.trim().replace(/\s+/g, ' ');
    }
    removeLeadingSalutation(name) {
        const withoutSalutation = name.replace(/^(Mr|Mrs|Ms|Dr)\.?\s+/i, '');
        return this.normalizeFacultyName(withoutSalutation);
    }
    async getDepartmentIdByCode(db, departmentCode) {
        const [rows] = await db.query(`SELECT id
       FROM departments
       WHERE UPPER(dept_code) = UPPER(?)
       LIMIT 1`, [departmentCode]);
        return rows[0]?.id ?? null;
    }
    async getDesignationIdByName(db, designationName) {
        const [rows] = await db.query(`SELECT id
       FROM designation
       WHERE UPPER(designation_name) = UPPER(?)
       LIMIT 1`, [designationName]);
        const designationId = rows[0]?.id;
        if (!designationId) {
            throw new Error(`Designation not found: ${designationName}`);
        }
        return String(designationId);
    }
    async upsertFacultyRecord(db, input) {
        const facultyId = input.facultyId.trim();
        if (!facultyId) {
            throw new Error('Faculty ID is required to write faculty record');
        }
        const normalizedName = this.normalizeFacultyName(input.name);
        if (!normalizedName) {
            throw new Error('Faculty name is required to write faculty record');
        }
        const facultyName = this.removeLeadingSalutation(normalizedName);
        if (!facultyName) {
            throw new Error('Faculty name is required');
        }
        const departmentId = await this.getDepartmentIdByCode(db, input.department);
        const designationId = await this.getDesignationIdByName(db, input.designation);
        const [existingRows] = await db.query(`SELECT id FROM faculty WHERE id = ? LIMIT 1`, [facultyId]);
        if (existingRows.length > 0) {
            await db.query(`UPDATE faculty
         SET salutation = ?,
             name = ?,
             designation_id = ?,
             department_id = ?,
             email = ?
         WHERE id = ?`, ['', facultyName, designationId, departmentId, input.email, facultyId]);
            return;
        }
        await db.query(`INSERT INTO faculty (id, salutation, name, designation_id, department_id, email, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`, [facultyId, '', facultyName, designationId, departmentId, input.email]);
    }
    mapDbRowToUser(row) {
        return {
            id: row.id,
            facultyId: row.user_id || '',
            username: row.username,
            email: row.email,
            name: row.name || row.username,
            department: row.department_code || 'Admin',
            designation: row.designation_name || '',
            role: mapRoleNameToUiRole(row.role_name),
            status: row.is_active ? 'active' : 'inactive',
            joinedDate: toIsoDate(row.created_at),
        };
    }
    async getRoleId(role) {
        const pool = getMysqlPool();
        const dbRoleName = mapUiRoleToDbRole(role);
        const [rows] = await pool.query(`SELECT id FROM roles WHERE UPPER(name) = ? LIMIT 1`, [dbRoleName]);
        return rows[0]?.id ?? 2; // Default FACULTY
    }
    async getAllUsers() {
        try {
            const pool = getMysqlPool();
            const [rows] = await pool.query(`SELECT
            u.id,
          u.user_id,
            u.username,
            u.email,
            COALESCE(
              NULLIF(TRIM(f.name), ''),
              NULLIF(TRIM(fe.name), ''),
              u.username
            ) AS name,
          d.dept_code AS department_code,
          des.designation_name AS designation_name,
            r.name AS role_name,
            u.is_active,
            u.created_at
         FROM users u
         LEFT JOIN roles r ON u.role_id = r.id
        LEFT JOIN faculty f ON f.id = u.user_id
        LEFT JOIN faculty fe ON LOWER(fe.email) = LOWER(u.email)
         LEFT JOIN departments d ON d.id = COALESCE(f.department_id, fe.department_id)
         LEFT JOIN designation des ON des.id = CAST(COALESCE(f.designation_id, fe.designation_id) AS UNSIGNED)
         ORDER BY u.created_at DESC`);
            return rows.map((row) => this.mapDbRowToUser(row));
        }
        catch (error) {
            logger.error('Error fetching users:', error);
            throw error;
        }
    }
    async getUserById(id) {
        try {
            const pool = getMysqlPool();
            const [rows] = await pool.query(`SELECT
            u.id,
          u.user_id,
            u.username,
            u.email,
            COALESCE(
              NULLIF(TRIM(f.name), ''),
              NULLIF(TRIM(fe.name), ''),
              u.username
            ) AS name,
          d.dept_code AS department_code,
          des.designation_name AS designation_name,
            r.name AS role_name,
            u.is_active,
            u.created_at
         FROM users u
         LEFT JOIN roles r ON u.role_id = r.id
        LEFT JOIN faculty f ON f.id = u.user_id
        LEFT JOIN faculty fe ON LOWER(fe.email) = LOWER(u.email)
         LEFT JOIN departments d ON d.id = COALESCE(f.department_id, fe.department_id)
         LEFT JOIN designation des ON des.id = CAST(COALESCE(f.designation_id, fe.designation_id) AS UNSIGNED)
         WHERE u.id = ? LIMIT 1`, [id]);
            if (rows.length === 0)
                return null;
            return this.mapDbRowToUser(rows[0]);
        }
        catch (error) {
            logger.error('Error fetching user by ID:', error);
            throw error;
        }
    }
    async createUser(input) {
        try {
            const pool = getMysqlPool();
            const connection = await pool.getConnection();
            const roleId = await this.getRoleId(input.role);
            const username = input.username?.trim() || input.email.split('@')[0].toLowerCase();
            const isActive = input.status === 'active' ? 1 : 0;
            const facultyId = input.facultyId?.trim();
            const facultyName = this.normalizeFacultyName(input.name);
            if (!facultyId) {
                throw new Error('Faculty ID is required');
            }
            if (!facultyName) {
                throw new Error('Name is required');
            }
            let insertId = 0;
            let lastError = null;
            try {
                await connection.beginTransaction();
                await this.upsertFacultyRecord(connection, {
                    facultyId,
                    name: facultyName,
                    department: input.department,
                    designation: input.designation,
                    email: input.email,
                });
                // TiDB allocates auto ids in large chunks; assign next id explicitly for cleaner sequencing.
                for (let attempt = 0; attempt < 5; attempt += 1) {
                    try {
                        const nextId = await this.getNextUserId(connection);
                        const [result] = await connection.query(`INSERT INTO users (id, username, email, password_hash, user_id, role_id, is_active, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`, [nextId, username, input.email, '', facultyId, roleId, isActive]);
                        insertId = result.insertId || nextId;
                        lastError = null;
                        break;
                    }
                    catch (error) {
                        const sqlError = error;
                        if (sqlError.code === 'ER_DUP_ENTRY') {
                            lastError = error;
                            continue;
                        }
                        throw error;
                    }
                }
                if (!insertId) {
                    throw (lastError instanceof Error ? lastError : new Error('Failed to allocate sequential user id'));
                }
                await connection.commit();
            }
            catch (error) {
                try {
                    await connection.rollback();
                }
                catch (error) {
                    logger.error('Error rolling back create user transaction:', error);
                }
                throw error;
            }
            finally {
                connection.release();
            }
            const user = await this.getUserById(insertId);
            if (!user)
                throw new Error('Failed to retrieve created user');
            return user;
        }
        catch (error) {
            logger.error('Error creating user:', error);
            throw error;
        }
    }
    async updateUser(id, input) {
        try {
            const pool = getMysqlPool();
            const updates = [];
            const values = [];
            if (input.facultyId !== undefined) {
                updates.push('user_id = ?');
                values.push(input.facultyId.trim() || null);
            }
            if (input.email !== undefined) {
                updates.push('email = ?');
                values.push(input.email);
            }
            if (input.status !== undefined) {
                updates.push('is_active = ?');
                values.push(input.status === 'active' ? 1 : 0);
            }
            if (input.role !== undefined) {
                const roleId = await this.getRoleId(input.role);
                updates.push('role_id = ?');
                values.push(roleId);
            }
            if (updates.length > 0) {
                values.push(id);
                await pool.query(`UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`, values);
            }
            // Keep faculty master in sync when update payload includes full faculty details.
            if (input.facultyId && input.email && input.name && input.department && input.designation) {
                await this.upsertFacultyRecord(pool, {
                    facultyId: input.facultyId,
                    email: input.email,
                    name: input.name,
                    department: input.department,
                    designation: input.designation,
                });
            }
            const user = await this.getUserById(id);
            if (!user)
                throw new Error('Failed to retrieve updated user');
            return user;
        }
        catch (error) {
            logger.error('Error updating user:', error);
            throw error;
        }
    }
    async deleteUser(id) {
        try {
            const pool = getMysqlPool();
            await pool.query('DELETE FROM users WHERE id = ?', [id]);
        }
        catch (error) {
            logger.error('Error deleting user:', error);
            throw error;
        }
    }
    async importUsers(users) {
        try {
            const createdUsers = [];
            for (const user of users) {
                const created = await this.createUser(user);
                createdUsers.push(created);
            }
            return createdUsers;
        }
        catch (error) {
            logger.error('Error importing users:', error);
            throw error;
        }
    }
    async getUserByEmail(email) {
        try {
            const pool = getMysqlPool();
            const [rows] = await pool.query(`SELECT
            u.id,
          u.user_id,
            u.username,
            u.email,
            COALESCE(
              NULLIF(TRIM(f.name), ''),
              NULLIF(TRIM(fe.name), ''),
              u.username
            ) AS name,
          d.dept_code AS department_code,
          des.designation_name AS designation_name,
            r.name AS role_name,
            u.is_active,
            u.created_at
         FROM users u
         LEFT JOIN roles r ON u.role_id = r.id
        LEFT JOIN faculty f ON f.id = u.user_id
        LEFT JOIN faculty fe ON LOWER(fe.email) = LOWER(u.email)
         LEFT JOIN departments d ON d.id = COALESCE(f.department_id, fe.department_id)
         LEFT JOIN designation des ON des.id = CAST(COALESCE(f.designation_id, fe.designation_id) AS UNSIGNED)
         WHERE LOWER(u.email) = LOWER(?) LIMIT 1`, [email]);
            if (rows.length === 0)
                return null;
            return this.mapDbRowToUser(rows[0]);
        }
        catch (error) {
            logger.error('Error fetching user by email:', error);
            throw error;
        }
    }
    async getLookupMetadata() {
        try {
            const pool = getMysqlPool();
            const [departmentRows] = await pool.query(`SELECT id, dept_code, dept_name, status
         FROM departments
         WHERE status = 1
         ORDER BY dept_code ASC`);
            const [roleRows] = await pool.query(`SELECT id, name, is_active
         FROM roles
         WHERE is_active = 1
         ORDER BY name ASC`);
            const [designationRows] = await pool.query(`SELECT id, designation_name
         FROM designation
         ORDER BY designation_name ASC`);
            return {
                departments: departmentRows.map((row) => ({
                    id: row.id,
                    code: row.dept_code,
                    name: row.dept_name,
                })),
                roles: roleRows.map((row) => {
                    const value = mapRoleNameToUiRole(row.name);
                    return {
                        id: row.id,
                        value,
                        label: row.name,
                        dbName: row.name,
                    };
                }),
                designations: designationRows
                    .filter((row) => row.designation_name?.trim().length > 0)
                    .map((row) => ({
                    id: row.id,
                    name: row.designation_name,
                })),
            };
        }
        catch (error) {
            logger.error('Error fetching user lookup metadata:', error);
            throw error;
        }
    }
    async checkDuplicates(facultyId, email) {
        try {
            const pool = getMysqlPool();
            const [rows] = await pool.query(`SELECT id, email, user_id FROM users WHERE user_id = ? OR LOWER(email) = LOWER(?) LIMIT 1`, [facultyId || null, email]);
            if (rows.length > 0) {
                const duplicate = rows[0];
                if (duplicate.user_id && facultyId && duplicate.user_id === facultyId) {
                    return { isDuplicate: true, reason: 'Faculty ID already exists' };
                }
                if (duplicate.email.toLowerCase() === email.toLowerCase()) {
                    return { isDuplicate: true, reason: 'Email already exists' };
                }
                return { isDuplicate: true, reason: 'Faculty ID or Email already exists' };
            }
            return { isDuplicate: false };
        }
        catch (error) {
            logger.error('Error checking duplicates:', error);
            throw error;
        }
    }
}
export default new UsersService();
