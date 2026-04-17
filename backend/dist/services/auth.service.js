import getMysqlPool from '../database/mysql';
import { generateToken } from '../middleware/auth';
import { logger } from '../utils/logger';
const ROLE_ALIASES = {
    ADMIN: { roleName: 'maintenance', roles: ['maintenance', 'admin'] },
    FACULTY: { roleName: 'faculty', roles: ['faculty'] },
    HOD: { roleName: 'hod', roles: ['hod'] },
    DEAN: { roleName: 'dean', roles: ['dean'] },
    IQAC: { roleName: 'verification', roles: ['verification'] },
};
export class AuthService {
    isBypassEnabled() {
        return (process.env.AUTH_BYPASS ?? 'false').toLowerCase() === 'true';
    }
    prismaDisabledError() {
        return new Error('Auth data operations are disabled because Prisma is not in use. Enable AUTH_BYPASS=true for development login.');
    }
    async register(email, password, name, employeeId) {
        logger.warn(`Register requested for ${email} but Prisma is disabled.`);
        void password;
        void name;
        void employeeId;
        throw this.prismaDisabledError();
    }
    getGoogleClientId() {
        const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (!clientId) {
            throw new Error('GOOGLE_CLIENT_ID is not configured');
        }
        return clientId;
    }
    mapRole(roleName) {
        return ROLE_ALIASES[roleName.toUpperCase()] || { roleName: roleName.toLowerCase(), roles: [roleName.toLowerCase()] };
    }
    getBypassFallbackUser(email, displayName) {
        const fallbackRoleRaw = (process.env.AUTH_BYPASS_FALLBACK_ROLE || 'faculty').trim().toLowerCase();
        const mappedRole = this.mapRole(fallbackRoleRaw);
        return {
            id: 9999,
            username: email.split('@')[0] || email,
            name: displayName || email.split('@')[0] || email,
            email,
            roleId: 1,
            roleName: mappedRole.roleName,
            roles: mappedRole.roles,
            facultyId: 'TEST-FACULTY',
        };
    }
    async resolveBypassUser(email, displayName) {
        const userRow = await this.findUserByEmail(email);
        if (userRow && userRow.is_active && userRow.role_active) {
            return this.toSessionUser(userRow, displayName);
        }
        return this.getBypassFallbackUser(email, displayName);
    }
    async fetchGoogleTokenInfo(idToken) {
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
        if (!response.ok) {
            throw new Error('Invalid Google token');
        }
        return response.json();
    }
    async findUserByEmail(email) {
        const pool = getMysqlPool();
        const [rows] = await pool.query(`SELECT u.id, u.username, u.email, u.user_id, u.role_id, u.is_active, r.name AS role_name, r.is_active AS role_active
       FROM users u
       INNER JOIN roles r ON r.id = u.role_id
       WHERE LOWER(u.email) = LOWER(?)
       LIMIT 1`, [email]);
        return rows[0] ?? null;
    }
    toSessionUser(row, displayName) {
        const mappedRole = this.mapRole(row.role_name);
        return {
            id: row.id,
            username: row.username,
            name: displayName || row.username,
            email: row.email,
            roleId: row.role_id,
            roleName: mappedRole.roleName,
            roles: mappedRole.roles,
            facultyId: row.user_id,
        };
    }
    async loginWithGoogle(idToken) {
        if (idToken === 'MOCK_TOKEN' && this.isBypassEnabled()) {
            const mockEmail = (process.env.AUTH_BYPASS_EMAIL || 'karshan3110@gmail.com').trim().toLowerCase();
            const bypassUser = await this.resolveBypassUser(mockEmail);
            const token = generateToken(bypassUser);
            logger.info(`Google sign-in BYPASSED for ${bypassUser.email} using role ${bypassUser.roleName}`);
            return { token, user: bypassUser };
        }
        const googleProfile = await this.fetchGoogleTokenInfo(idToken);
        const expectedClientId = this.getGoogleClientId();
        if (googleProfile.aud !== expectedClientId) {
            throw new Error('Google token audience mismatch');
        }
        if (String(googleProfile.email_verified) !== 'true') {
            throw new Error('Google account email is not verified');
        }
        if (!googleProfile.email) {
            throw new Error('Google token does not include an email address');
        }
        if (this.isBypassEnabled()) {
            const bypassUser = await this.resolveBypassUser(googleProfile.email, googleProfile.name);
            const token = generateToken(bypassUser);
            logger.info(`Google sign-in BYPASSED for ${bypassUser.email} using role ${bypassUser.roleName}`);
            return { token, user: bypassUser };
        }
        const userRow = await this.findUserByEmail(googleProfile.email);
        if (!userRow || !userRow.is_active || !userRow.role_active) {
            throw new Error('No active portal account is linked to this Google email');
        }
        const user = this.toSessionUser(userRow, googleProfile.name);
        const token = generateToken(user);
        logger.info(`Google sign-in successful for ${user.email}`);
        return { token, user };
    }
    async getUserWithRoles(userId) {
        const pool = getMysqlPool();
        const [rows] = await pool.query(`SELECT u.id, u.username, u.email, u.user_id, u.role_id, u.is_active, r.name AS role_name, r.is_active AS role_active
       FROM users u
       INNER JOIN roles r ON r.id = u.role_id
       WHERE u.id = ?
       LIMIT 1`, [userId]);
        const userRow = rows[0];
        if (!userRow || !userRow.is_active || !userRow.role_active) {
            return null;
        }
        return this.toSessionUser(userRow);
    }
    async verifyTokenAndGetUser(token) {
        void token;
        return null;
    }
}
export default new AuthService();
