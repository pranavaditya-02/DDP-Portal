'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { useRoles } from '@/hooks/useRoles';
import { RoleGuard } from './RoleGuard';
import { motion } from 'framer-motion';
import { LogOut, Menu, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export const Navigation: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { isFaculty, isHod, isDean, isVerification, isMaintenance } = useRoles();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) {
    return null;
  }

  const navItems = [
    // Faculty items
    {
      label: 'Dashboard',
      href: '/dashboard',
      show: true, // All roles see dashboard
    },
    {
      label: 'My Activities',
      href: '/activities',
      show: isFaculty(),
    },
    {
      label: 'Submit Activity',
      href: '/activities/submit',
      show: isFaculty(),
    },
    {
      label: 'Submit Achievements',
      href: '/achievements/submit',
      show: isFaculty(),
    },
    {
      label: 'Submit Action Plan',
      href: '/action-plan/submit',
      show: isFaculty(),
    },
    {
      label: 'Department',
      href: '/department',
      show: isHod(),
    },
    {
      label: 'Faculty Leaderboard',
      href: '/leaderboard',
      show: isHod(),
    },
    {
      label: 'College Dashboard',
      href: '/college',
      show: isDean(),
    },
    {
      label: 'Verification Queue',
      href: '/verification',
      show: isVerification(),
    },
    {
      label: 'User Management',
      href: '/users',
      show: isMaintenance(),
    },
  ];

  const visibleNavItems = navItems.filter((item) => item.show);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
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
              <motion.div key={idx} whileHover={{ y: -2 }}>
                <Link
                  href={item.href}
                  className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  {item.label}
                </Link>
              </motion.div>
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
            <motion.button
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut className="w-5 h-5 text-red-600" />
            </motion.button>

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
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden pb-4 space-y-1"
          >
            {visibleNavItems.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
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
          </motion.div>
        )}
      </div>
    </nav>
  );
};
