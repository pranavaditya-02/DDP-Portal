import { useAuthStore } from '@/lib/store';

export const useRoles = () => {
  const user = useAuthStore((state) => state.user);

  return {
    // Check single role
    hasRole: (role: string): boolean => {
      return user?.roles.includes(role) ?? false;
    },

    // Check multiple roles (ANY)
    hasAnyRole: (roles: string[]): boolean => {
      return user?.roles.some((role) => roles.includes(role)) ?? false;
    },

    // Check multiple roles (ALL)
    hasAllRoles: (roles: string[]): boolean => {
      return roles.every((role) => user?.roles.includes(role)) ?? false;
    },

    // Role shortcuts
    isFaculty: (): boolean => user?.roles.includes('faculty') ?? false,
    isHod: (): boolean => user?.roles.includes('hod') ?? false,
    isDean: (): boolean => user?.roles.includes('dean') ?? false,
    isStudent: (): boolean => user?.roles.includes('student') ?? false,
    isVerification: (): boolean => user?.roles.includes('verification') ?? false,
    isMaintenance: (): boolean => user?.roles.includes('maintenance') ?? false,

    // Combined checks
    isAdmin: (): boolean => user?.roles.includes('maintenance') ?? false,
    isLeadership: (): boolean => {
      return user?.roles.some((role) => ['hod', 'dean', 'maintenance'].includes(role)) ?? false;
    },
    canApprove: (): boolean => {
      return user?.roles.includes('verification') ?? false;
    },
    canManageUsers: (): boolean => {
      return user?.roles.includes('maintenance') ?? false;
    },

    // Get user roles
    roles: user?.roles ?? [],
    hasMultipleRoles: (): boolean => (user?.roles.length ?? 0) > 1,
  };
};
