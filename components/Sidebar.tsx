"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { useRoles } from "@/hooks/useRoles";
import { studentNavItems } from "@/lib/student-navigation";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
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
  Newspaper,
  Monitor,
  Calendar,
  ClipboardCheck,
  PenTool,
  Mic,
  Plane,
  Video,
  UserCheck,
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  show: boolean;
  badge?: number;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { isFaculty, isHod, isDean, isStudent, isVerification, isMaintenance } =
    useRoles();
  const [profileOpen, setProfileOpen] = useState(false);
  const [achievementsExpanded, setAchievementsExpanded] = useState(false);
  const [owiExpanded, setOwiExpanded] = useState(false);
  const [rndExpanded, setRndExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!user) return null;

  const navGroups: NavGroup[] = [
    {
      title: "Overview",
      items: [
        {
          label: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
          show: !isDean() && !isStudent(),
        },
      ],
    },
    {
      title: "Student",
      items: [
        {
          label: "Dashboard",
          href: "/student/dashboard",
          icon: LayoutDashboard,
          show: isStudent(),
        },
        {
          label: "Overview",
          href: "/student/overview",
          icon: FileText,
          show: isStudent(),
        },
        ...studentNavItems.map((item) => ({
          label: item.label,
          href: `/student/${item.slug}`,
          icon: FileText,
          show: isStudent(),
        })),
      ],
    },
    {
      title: "Faculty",
      items: [
        {
          label: "My Activities",
          href: "/activities",
          icon: FileText,
          show: isFaculty() && !isDean(),
        },
        {
          label: "Submit Achievements",
          href: "/achievements/submit",
          icon: Award,
          show: isFaculty() && !isDean(),
        },
        {
          label: "Submit Action Plan",
          href: "/action-plan/submit",
          icon: Clipboard,
          show: isFaculty() && !isDean(),
        },
      ],
    },
    {
      title: "Department",
      items: [
        {
          label: "Department",
          href: "/department",
          icon: Building2,
          show: isHod(),
        },
        {
          label: "Leaderboard",
          href: "/leaderboard",
          icon: Trophy,
          show: isHod(),
        },
      ],
    },
    {
      title: "College",
      items: [
        {
          label: "College Overview",
          href: "/college",
          icon: GraduationCap,
          show: isDean(),
        },
        {
          label: "Department",
          href: "/department",
          icon: Building2,
          show: isDean(),
        },
        {
          label: "Leaderboard",
          href: "/leaderboard",
          icon: Trophy,
          show: isDean(),
        },
      ],
    },
    {
      title: "Management",
      items: [
        {
          label: "Verification Queue",
          href: "/verification",
          icon: ShieldCheck,
          show: isVerification(),
          badge: 7,
        },
        {
          label: "User Management",
          href: "/users",
          icon: Users,
          show: isMaintenance(),
        },
        {
          label: "Role Management",
          href: "/roles",
          icon: Shield,
          show: isMaintenance(),
        },
      ],
    },
  ];

  const achievementItems = [
    { id: "awards", label: "Notable Achievements and Awards", icon: Trophy },
    { id: "econtent", label: "E-Content Developed", icon: Monitor },
    { id: "eventAttended", label: "Events Attended", icon: Users },
    { id: "eventOrganized", label: "Events Organized", icon: Calendar },
    { id: "examiner", label: "External Examiner", icon: ClipboardCheck },
    { id: "guestLecture", label: "Guest Lecture Delivered", icon: Mic },
    { id: "internationalVisit", label: "International Visit", icon: Plane },
    { id: "reviewer", label: "Journal Reviewer", icon: PenTool },
    { id: "newsletter", label: "Newsletter", icon: Newspaper },
    { id: "onlineCourse", label: "Online Courses", icon: Video },
    { id: "papers", label: "Paper Presentation", icon: FileText },
    { id: "resourcePerson", label: "Resource Person", icon: UserCheck },
  ];

  const owiItems = [
    { label: "COE", slug: "coe" },
    { label: "External VIP Visit", slug: "external-vip-visit" },
    { label: "Faculty Industry Projects", slug: "faculty-industry-projects" },
    {
      label: "Faculty Trained by Industry",
      slug: "faculty-trained-by-industry",
    },
    { label: "Industry Advisors", slug: "industry-advisors" },
    { label: "IRP Visit", slug: "irp-visit" },
    { label: "Laboratory by Industry", slug: "laboratory-by-industry" },
    { label: "MoU", slug: "mou" },
    { label: "Professional Membership", slug: "professional-membership" },
    { label: "Students Industrial Visit", slug: "students-industrial-visit" },
    { label: "Technical Societies", slug: "technical-societies" },
    { label: "Training to Industry", slug: "training-to-industry" },
  ];

  const rndItems = [
    {
      label: "Journal Publications - Applied",
      slug: "journal-publications-applied",
    },
    {
      label: "Journal Publications - Published",
      slug: "journal-publications-published",
    },
    {
      label: "Book Publications Proposal Applied Proposal Sanctionaed",
      slug: "book-publications-proposal-applied-proposal-sanctionaed",
    },
  ];

  // Filter groups: only show groups that have at least one visible item
  const visibleGroups = navGroups
    .map((g) => ({ ...g, items: g.items.filter((i) => i.show) }))
    .filter((g) => g.items.length > 0);

  const isActive = (href: string) => pathname === href;

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      faculty: "bg-purple-100 text-purple-700",
      hod: "bg-emerald-500/20 text-emerald-300",
      dean: "bg-violet-100 text-violet-700",
      student: "bg-indigo-100 text-indigo-700",
      verification: "bg-amber-500/20 text-amber-300",
      maintenance: "bg-red-500/20 text-red-300",
    };
    return colors[role] || "bg-slate-100 text-slate-600";
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white text-slate-800 flex flex-col z-50 border-r border-slate-200 shadow-sm
        transition-all duration-300 ease-in-out w-[260px]
        ${collapsed ? "md:w-[72px]" : "md:w-[260px]"}
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0`}
    >
      {/* Header / Logo */}
      <div
        className={`flex items-center h-16 border-b border-slate-200 ${collapsed ? "justify-center px-2" : "justify-between px-4"}`}
      >
        <Link
          href="/dashboard"
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
        {/* Desktop collapse toggle */}
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
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 rounded-md hover:bg-purple-50 transition-colors text-slate-400 hover:text-[#7D53F6]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin">
        {visibleGroups.map((group) => (
          <div key={group.title}>
            {!collapsed && (
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2 px-3">
                {group.title}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`group flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative ${
                      collapsed ? "justify-center px-2" : "px-3"
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
                    {!collapsed && item.badge && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {collapsed && item.badge && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 text-[9px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Faculty Achievements Section */}
        {isFaculty() && !isDean() && !collapsed && (
          <div>
            <button
              onClick={() => setAchievementsExpanded(!achievementsExpanded)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-purple-50 hover:text-[#7D53F6] transition-all duration-150"
            >
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 flex-shrink-0" />
                <span>Faculty Achievements</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${achievementsExpanded ? "rotate-180" : ""}`}
              />
            </button>
            {achievementsExpanded && (
              <div className="space-y-1 mt-2 ml-2">
                {achievementItems.map((item) => {
                  const Icon = item.icon;
                  const href =
                    item.id === "awards"
                      ? "/achievements/notable-achievements-and-awards"
                      : item.id === "econtent"
                        ? "/achievements/e-content-developed"
                        : item.id === "eventAttended"
                          ? "/achievements/events-attended"
                          : item.id === "eventOrganized"
                            ? "/achievements/events-organized"
                            : item.id === "examiner"
                              ? "/achievements/external-examiner"
                              : item.id === "guestLecture"
                                ? "/achievements/guest-lecture-delivered"
                                : item.id === "internationalVisit"
                                  ? "/achievements/international-visit"
                                  : item.id === "newsletter"
                                    ? "/achievements/newsletter"
                                    : item.id === "reviewer"
                                      ? "/achievements/journal-reviewer"
                                      : item.id === "onlineCourse"
                                        ? "/achievements/online-course"
                                        : item.id === "papers"
                                          ? "/achievements/paper-presentation"
                                          : item.id === "resourcePerson"
                                            ? "/achievements/resource-person"
                                            : null;

                  if (href) {
                    return (
                      <Link
                        key={item.id}
                        href={href}
                        onClick={() => setMobileOpen(false)}
                        className={`w-full flex items-center gap-3 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-150 ${
                          pathname === href
                            ? "bg-purple-100 text-purple-700"
                            : "text-slate-500 hover:bg-purple-50 hover:text-[#7D53F6]"
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="flex-1 text-left truncate">
                          {item.label}
                        </span>
                      </Link>
                    );
                  }

                  return (
                    <button
                      key={item.id}
                      onClick={() => setMobileOpen(false)}
                      className="w-full flex items-center gap-3 py-2 px-3 rounded-lg text-xs text-slate-500 hover:bg-purple-50 hover:text-[#7D53F6] transition-colors"
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1 text-left truncate">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* OWI (Outside World Interaction) Section */}
        {isFaculty() && !isDean() && !collapsed && (
          <div>
            <button
              onClick={() => setOwiExpanded(!owiExpanded)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-purple-50 hover:text-[#7D53F6] transition-all duration-150"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 flex-shrink-0" />
                <span>OWI</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${owiExpanded ? "rotate-180" : ""}`}
              />
            </button>
            {owiExpanded && (
              <div className="space-y-1 mt-2 ml-2">
                {owiItems.map((item) => {
                  const href = `/faculty/outside-world/${item.slug}`;
                  const active = isActive(href);
                  return (
                    <Link
                      key={item.slug}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-150 relative ${
                        active
                          ? "bg-purple-100 text-purple-700"
                          : "text-slate-500 hover:bg-purple-50 hover:text-[#7D53F6]"
                      }`}
                    >
                      {active && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-[#7D53F6] rounded-r-full" />
                      )}
                      <span className="flex-1 truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* R&D Section */}
        {isFaculty() && !isDean() && !collapsed && (
          <div>
            <button
              onClick={() => setRndExpanded(!rndExpanded)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-150"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 flex-shrink-0" />
                <span>R&amp;D</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${rndExpanded ? "rotate-180" : ""}`}
              />
            </button>
            {rndExpanded && (
              <div className="space-y-1 mt-2 ml-2">
                {rndItems.map((item) => {
                  const href = `/faculty/r-and-d/${item.slug}`;
                  const active = isActive(href);
                  return (
                    <Link
                      key={item.slug}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-150 relative ${
                        active
                          ? "bg-blue-600/20 text-blue-400"
                          : "text-slate-400 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      {active && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-blue-500 rounded-r-full" />
                      )}
                      <span className="flex-1 truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* User Profile Section */}
      <div className="border-t border-slate-200 p-3">
        {/* Roles */}
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

        {/* User Info */}
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

        {/* Profile dropdown */}
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

        {/* Collapsed logout */}
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
