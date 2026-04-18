'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api';
import { AUTH_COOKIE_NAME } from '@/lib/auth-session';
import { clearAuthCookie } from '@/app/actions';
import { hasRouteAccess, pickFirstAccessibleRoute, routeToLabel, shouldHideInNavigation } from '@/lib/route-access';

export const Navigation: React.FC = () => {
  const router = useRouter();
  const { user, logout, allowedRoutes, allowedResources } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const visibleNavItems = useMemo(() => {
    if (allowedResources.length > 0) {
      return allowedResources
        .filter((item) => item?.href)
        .map((item) => ({ href: item.href, label: item.label || routeToLabel(item.href) }))
        .filter((item) => !shouldHideInNavigation(item.href));
    }

    return allowedRoutes
      .filter((href) => !href.includes('['))
      .map((href) => ({ href, label: routeToLabel(href) }))
      .filter((item) => hasRouteAccess(item.href, allowedRoutes))
      .filter((item) => !shouldHideInNavigation(item.href));
  }, [allowedResources, allowedRoutes]);

  const homeHref = pickFirstAccessibleRoute({
    resources: allowedResources,
    routePaths: allowedRoutes,
  }) || '/dashboard';

  const handleLogout = async () => {
    await apiClient.logout().catch(() => undefined);
    await clearAuthCookie().catch(() => undefined);
    document.cookie = `${AUTH_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    logout();
    router.push('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={homeHref} prefetch className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="text-lg font-semibold text-slate-900 hidden sm:block">
              Faculty Tracking
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {visibleNavItems.map((item, idx) => (
              <div key={idx} className="transition-transform duration-150 hover:-translate-y-0.5">
                <Link
                  href={item.href}
                  prefetch={false}
                  className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Role Badge */}
            <div className="hidden sm:flex items-center space-x-2">
              <div className="flex gap-1 flex-wrap">
                {user.roles.map((role) => (
                  <span
                    key={role}
                    className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

            {/* User Name */}
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 text-red-600" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 hover:bg-slate-100 rounded-lg"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div
            className="md:hidden pb-4 space-y-1"
          >
            {visibleNavItems.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                prefetch={false}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
