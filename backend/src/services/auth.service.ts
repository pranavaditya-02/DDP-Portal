import { generateToken } from '../middleware/auth';
import { logger } from '../utils/logger';

export class AuthService {
  private isBypassEnabled(): boolean {
    return (process.env.AUTH_BYPASS ?? 'false').toLowerCase() === 'true';
  }

  private prismaDisabledError(): Error {
    return new Error('Auth data operations are disabled because Prisma is not in use. Enable AUTH_BYPASS=true for development login.');
  }

  async register(email: string, password: string, name: string, employeeId: string) {
    logger.warn(`Register requested for ${email} but Prisma is disabled.`);
    void password;
    void name;
    void employeeId;
    throw this.prismaDisabledError();
  }

  async login(email: string, password: string) {
    try {
      if (!this.isBypassEnabled()) {
        throw this.prismaDisabledError();
      }

      const roleCsv = process.env.AUTH_BYPASS_ROLES || 'admin,faculty,verification,hod,dean';
      const roles = roleCsv
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);

      const token = generateToken({
        id: 1,
        email,
        roles,
      });

      logger.warn(`AUTH_BYPASS login used for ${email}`);

      return {
        token,
        user: {
          id: 1,
          email,
          name: 'Bypass User',
          roles,
          departmentId: null,
        },
      };
    } catch (error) {
      logger.error('Login error:', error);
      void password;
      throw error;
    }
  }

  async getUserWithRoles(userId: number) {
    if (!this.isBypassEnabled()) {
      logger.warn(`getUserWithRoles(${userId}) requested but Prisma is disabled.`);
      return null;
    }

    const roleCsv = process.env.AUTH_BYPASS_ROLES || 'admin,faculty,verification,hod,dean';
    const roles = roleCsv
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);

    return {
      id: userId,
      email: 'bypass@local.dev',
      name: 'Bypass User',
      roles,
      departmentId: null,
      userRoles: [],
    };
  }

  async verifyTokenAndGetUser(token: string) {
    void token;
    return null;
  }
}

export default new AuthService();
