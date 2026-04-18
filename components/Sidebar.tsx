"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { apiClient } from "@/lib/api";
import { useRoles } from "@/hooks/useRoles";
import { studentNavItems } from "@/lib/student-navigation";
import { AUTH_COOKIE_NAME } from "@/lib/auth-session";
import { clearAuthCookie } from "@/app/actions";
import { getDisplayGroupName, getGroupSortRank, pickFirstAccessibleRoute, shouldHideInNavigation } from "@/lib/route-access";
import {
  LayoutDashboard,
  FileText,
  Building2,
  Trophy,
  GraduationCap,
  ShieldCheck,
  Shield,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  User,
  ChevronDown,
  Award,
  Clipboard,
  X,
  Calendar,
  Settings,
  Mail,
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

type DynamicNavItem = {
  id: string;
  label: string;
  href: string;
  group: string;
  icon: React.ElementType;
  badge?: number;
};

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  FileText,
  Award,
  Clipboard,
  Building2,
  Trophy,
  GraduationCap,
  ShieldCheck,
  Users,
  Shield,
  Settings,
  Calendar,
  Mail,
};

const VERIFICATION_REFRESH_INTERVAL_MS = 120000;
const MIN_MANUAL_REFRESH_GAP_MS = 10000;

const normalizePath = (value: string) => {
  if (!value || value === "/") return "/";
  return value.replace(/\/+$/, "");
};

const isDynamicPatternRoute = (value: string) => /\[[^\]]+\]/.test(value);

const routeToLabel = (route: string) => {
  const parts = route.split("/").filter(Boolean);
  const tail = parts[parts.length - 1] || "dashboard";
  return tail
    .replace(/\[(\.\.\.)?([^\]]+)\]/g, "$2")
    .split(/[-_.]/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
};

const routeToGroup = (route: string) => {
  if (route.startsWith("/student")) return "Student";
  if (route.startsWith("/achievements") || route.startsWith("/activities") || route.startsWith("/action-plan") || route.startsWith("/faculty")) return "Faculty";
  if (route.startsWith("/department") || route.startsWith("/leaderboard")) return "Department";
  if (route.startsWith("/college")) return "College";
  if (route.startsWith("/verification") || route.startsWith("/roles") || route.startsWith("/users")) return "Management";
  return "Other";
};

const routeToIcon = (route: string) => {
  if (route.includes("dashboard")) return LayoutDashboard;
  if (route.startsWith("/achievements")) return Award;
  if (route.startsWith("/action-plan") || route.startsWith("/student/activity")) return Clipboard;
  if (route.startsWith("/department")) return Building2;
  if (route.startsWith("/leaderboard")) return Trophy;
  if (route.startsWith("/college")) return GraduationCap;
  if (route.startsWith("/verification")) return ShieldCheck;
  if (route.startsWith("/users")) return Users;
  if (route.startsWith("/roles")) return Shield;
  return FileText;
};

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, allowedResources, allowedRoutes } = useAuthStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const [expandedNavGroups, setExpandedNavGroups] = useState<Record<string, boolean>>({});
  const [verificationQueuePendingCount, setVerificationQueuePendingCount] = useState(0);
  const [verificationPanelPendingCount, setVerificationPanelPendingCount] = useState(0);
  const pendingCountLastFetchedAtRef = useRef(0);

  const baseItems = useMemo<DynamicNavItem[]>(() => {
    if (allowedResources.length > 0) {
      return allowedResources
        .filter((resource) => Boolean(resource.href))
        .filter((resource) => !isDynamicPatternRoute(resource.href))
        .filter((resource) => !shouldHideInNavigation(resource.href))
        .map((resource) => ({
          id: resource.id,
          label: resource.label,
          href: normalizePath(resource.href),
          group: getDisplayGroupName(resource.href, resource.group || routeToGroup(resource.href)),
          icon: iconMap[resource.icon] || routeToIcon(resource.href),
        }))
        .sort((a, b) => a.href.localeCompare(b.href));
    }

    return Array.from(new Set(allowedRoutes.map((route) => normalizePath(route))))
      .filter((href) => href !== "/" && href !== "/login" && href !== "/register")
      .filter((href) => !isDynamicPatternRoute(href))
      .filter((href) => !shouldHideInNavigation(href))
      .map((href) => ({
        id: href.slice(1).replace(/\//g, ".") || "dashboard",
        label: routeToLabel(href),
        href,
        group: getDisplayGroupName(href, routeToGroup(href)),
        icon: routeToIcon(href),
      }))
      .sort((a, b) => a.href.localeCompare(b.href));
  }, [allowedResources, allowedRoutes]);

  const hasVerificationPages = useMemo(
    () => baseItems.some((item) => item.href === "/verification" || item.href === "/verification-panel"),
    [baseItems],
  );

  const canReadVerificationQueues = useMemo(() => {
    const roles = (user?.roles || []).map((role) => role.toLowerCase());
    return roles.includes("verification") || roles.includes("maintenance") || roles.includes("admin");
  }, [user]);

  useEffect(() => {
    if (!hasVerificationPages || !canReadVerificationQueues) {
      setVerificationQueuePendingCount(0);
      setVerificationPanelPendingCount(0);
      return;
    }

    let active = true;

    const getListCount = (value: unknown) => {
      if (Array.isArray(value)) return value.length;
      if (!value || typeof value !== "object") return 0;

      const maybeObject = value as {
        activities?: unknown;
        registrations?: unknown;
        data?: unknown;
        count?: unknown;
      };

      if (Array.isArray(maybeObject.activities)) return maybeObject.activities.length;
      if (Array.isArray(maybeObject.registrations)) return maybeObject.registrations.length;
      if (Array.isArray(maybeObject.data)) return maybeObject.data.length;
      if (typeof maybeObject.count === "number") return maybeObject.count;

      return 0;
    };

    const loadPendingCount = async (force = false) => {
      if (!force && document.visibilityState !== "visible") {
        return;
      }

      const now = Date.now();
      if (!force && now - pendingCountLastFetchedAtRef.current < MIN_MANUAL_REFRESH_GAP_MS) {
        return;
      }

      try {
        const [queueResponse, panelResponse] = await Promise.all([
          apiClient.getPendingActivities(),
          apiClient.getVerificationRegistrations("pending"),
        ]);

        if (!active) return;

        setVerificationQueuePendingCount(getListCount(queueResponse));
        setVerificationPanelPendingCount(getListCount(panelResponse));
        pendingCountLastFetchedAtRef.current = now;
      } catch {
        if (!active) return;
        setVerificationQueuePendingCount(0);
        setVerificationPanelPendingCount(0);
      }
    };

    void loadPendingCount(true);

    const handlePendingRefresh = () => {
      void loadPendingCount(true);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void loadPendingCount(true);
      }
    };

    window.addEventListener("verification-pending-updated", handlePendingRefresh);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    const timer = window.setInterval(() => {
      void loadPendingCount();
    }, VERIFICATION_REFRESH_INTERVAL_MS);

    return () => {
      active = false;
      window.removeEventListener("verification-pending-updated", handlePendingRefresh);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.clearInterval(timer);
    };
  }, [canReadVerificationQueues, hasVerificationPages]);

  const navItems = useMemo(() => {
    return baseItems.map((item) => {
      if (item.href === "/verification") {
        return { ...item, badge: verificationQueuePendingCount };
      }
      if (item.href === "/verification-panel") {
        return { ...item, badge: verificationPanelPendingCount };
      }
      return item;
    });
  }, [baseItems, verificationQueuePendingCount, verificationPanelPendingCount]);

  const navGroups = useMemo(() => {
    const grouped = new Map<string, DynamicNavItem[]>();

    for (const item of navItems) {
      const groupName = item.group || "Other";
      const list = grouped.get(groupName) || [];
      list.push(item);
      grouped.set(groupName, list);
    }

    return Array.from(grouped.entries())
      .sort((a, b) => {
        const ai = getGroupSortRank(a[0]);
        const bi = getGroupSortRank(b[0]);
        if (ai === bi) return a[0].localeCompare(b[0]);
        return ai - bi;
      })
      .map(([title, items]) => ({
        title,
        items: items.sort((a, b) => a.label.localeCompare(b.label)),
      }));
  }, [navItems]);

  useEffect(() => {
    setExpandedNavGroups((prev) => {
      const next: Record<string, boolean> = {};
      for (const group of navGroups) {
        next[group.title] = prev[group.title] ?? true;
      }
      return next;
    });
  }, [navGroups]);

  const toggleNavGroup = (title: string) => {
    setExpandedNavGroups((prev) => ({
      ...prev,
      [title]: !(prev[title] ?? true),
    }));
  };

  const handleLogout = async () => {
    await apiClient.logout().catch(() => undefined);
    await clearAuthCookie().catch(() => undefined);
    document.cookie = `${AUTH_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    logout();
    router.push("/login");
  };

  if (!user) return null;

  const isActive = (href: string) => {
    const normalizedHref = normalizePath(href);
    const normalizedPathname = normalizePath(pathname);
    return normalizedPathname === normalizedHref;
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      faculty: "bg-purple-100 text-purple-700",
      hod: "bg-emerald-500/20 text-emerald-300",
      dean: "bg-violet-100 text-violet-700",
      student: "bg-indigo-100 text-indigo-700",
      verification: "bg-amber-500/20 text-amber-300",
      maintenance: "bg-red-500/20 text-red-300",
      admin: "bg-red-500/20 text-red-300",
    };
    return colors[role] || "bg-slate-100 text-slate-600";
  };

  const homeHref = pickFirstAccessibleRoute({
    resources: allowedResources,
    routePaths: allowedRoutes,
  }) || "/dashboard";

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white text-slate-800 flex flex-col z-50 border-r border-slate-200 shadow-sm
        transition-all duration-300 ease-in-out w-[260px]
        ${collapsed ? "md:w-[72px]" : "md:w-[260px]"}
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0`}
    >
      <div
        className={`flex items-center h-16 border-b border-slate-200 ${collapsed ? "justify-center px-2" : "justify-between px-4"}`}
      >
        <Link
          href={homeHref}
          prefetch={false}
          className="flex items-center gap-3 overflow-hidden"
        >
          <div className="w-9 h-9 bg-[#7D53F6] rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white font-bold text-lg">I</span>
          </div>
          {!collapsed && (
            <span className="font-semibold text-sm whitespace-nowrap animate-fade-in">
              Information Portal
            </span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex p-1.5 rounded-md hover:bg-purple-50 transition-colors text-slate-400 hover:text-[#7D53F6]"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 rounded-md hover:bg-purple-50 transition-colors text-slate-400 hover:text-[#7D53F6]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4 scrollbar-thin">
        {navGroups.map((group) => {
          const isFacultySubgroup = group.title.startsWith("Faculty / ");
          const groupLabel = isFacultySubgroup ? group.title.replace("Faculty / ", "") : group.title;
          const isExpanded = expandedNavGroups[group.title] ?? true;
          return (
          <div key={group.title}>
            {!collapsed && (
              <button
                type="button"
                onClick={() => toggleNavGroup(group.title)}
                className="w-full flex items-center justify-between mb-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#5F6B85] bg-slate-200/60 hover:bg-purple-50 hover:text-[#7D53F6] transition-colors"
              >
                <span className={`truncate ${isFacultySubgroup ? "pl-0.5" : ""}`}>{groupLabel}</span>
                <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180 text-[#7D53F6]" : "text-slate-400"}`} />
              </button>
            )}
            {(collapsed || isExpanded) && (
              <div className={`space-y-1 transition-all duration-200 ${isFacultySubgroup && !collapsed ? "pl-1" : ""}`}>
                {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    prefetch={false}
                    onClick={() => setMobileOpen(false)}
                    className={`group flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative ${
                      collapsed ? "justify-center px-2" : isFacultySubgroup ? "px-3.5" : "px-3"
                    } ${
                      active
                        ? "bg-[#7D53F6] text-white shadow-sm"
                        : "text-slate-500 hover:bg-purple-50 hover:text-[#7D53F6]"
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#7D53F6] rounded-r-full" />
                    )}
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 ${active ? "text-white" : ""}`}
                    />
                    {!collapsed && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}
                    {!collapsed && typeof item.badge === "number" && item.badge > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {collapsed && typeof item.badge === "number" && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 text-[9px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
                })}
              </div>
            )}
          </div>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3">
        {!collapsed && (
          <div className="flex flex-wrap gap-1 mb-3 px-1">
            {user.roles.map((role) => (
              <span
                key={role}
                className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${getRoleBadgeColor(role)}`}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </span>
            ))}
          </div>
        )}

        <div
          className={`flex items-center gap-3 p-2 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer ${collapsed ? "justify-center" : ""}`}
          onClick={() => setProfileOpen(!profileOpen)}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8D68FA] to-[#6A45D6] flex items-center justify-center flex-shrink-0 text-sm font-bold text-white">
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">
                {user.name}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {user.email}
              </p>
            </div>
          )}
          {!collapsed && (
            <ChevronDown
              className={`w-4 h-4 text-slate-500 transition-transform ${profileOpen ? "rotate-180" : ""}`}
            />
          )}
        </div>

        {profileOpen && !collapsed && (
          <div className="overflow-hidden animate-fade-in">
            <div className="pt-2 space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-purple-50 hover:text-[#7D53F6] transition-colors">
                <User className="w-4 h-4" />
                Profile
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-purple-50 hover:text-[#7D53F6] transition-colors">
                <Bell className="w-4 h-4" />
                Notifications
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}

        {collapsed && (
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="w-full flex items-center justify-center p-2 mt-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </aside>
  );
};
