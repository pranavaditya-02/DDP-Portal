import { useAuthStore } from '@/lib/store';

export const useRoles = () => {
  const user = useAuthStore((state) => state.user);
  const normalizedRoles = (user?.roles ?? []).map((role) => role.toLowerCase());

  return {
    // Check single role
    hasRole: (role: string): boolean => {
      return normalizedRoles.includes(role.toLowerCase());
    },

    // Check multiple roles (ANY)
    hasAnyRole: (roles: string[]): boolean => {
      return roles.map((role) => role.toLowerCase()).some((role) => normalizedRoles.includes(role));
    },

    // Check multiple roles (ALL)
    hasAllRoles: (roles: string[]): boolean => {
      return roles.map((role) => role.toLowerCase()).every((role) => normalizedRoles.includes(role));
    },

    // Role shortcuts
    isFaculty: (): boolean => normalizedRoles.includes('faculty'),
    isHod: (): boolean => normalizedRoles.includes('hod'),
    isDean: (): boolean => normalizedRoles.includes('dean'),
    isStudent: (): boolean => normalizedRoles.includes('student'),
    isVerification: (): boolean => normalizedRoles.includes('verification'),
    isMaintenance: (): boolean => normalizedRoles.includes('maintenance') || normalizedRoles.includes('admin'),

    // Combined checks
    isAdmin: (): boolean => normalizedRoles.includes('maintenance') || normalizedRoles.includes('admin'),
    isLeadership: (): boolean => {
      return normalizedRoles.some((role) => ['hod', 'dean', 'maintenance', 'admin'].includes(role));
    },
    canApprove: (): boolean => {
      return normalizedRoles.includes('verification');
    },
    canManageUsers: (): boolean => {
      return normalizedRoles.includes('maintenance') || normalizedRoles.includes('admin');
    },

    // Get user roles
    roles: normalizedRoles,
    hasMultipleRoles: (): boolean => normalizedRoles.length > 1,
  };
};
