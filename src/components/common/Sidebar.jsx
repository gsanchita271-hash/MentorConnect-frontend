import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  Users,
  CalendarDays,
  ClipboardCheck,
  CheckSquare,
  MessageSquareWarning,
  Megaphone,
  BookOpen,
  UserCircle,
  UserRound,
  ShieldCheck,
} from "lucide-react";

import { getUser, logout } from "../../services/api";

function DashboardLayout({
  children,
  role,
  menuItems = [],
  title = "Dashboard",
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | GET LOGGED-IN USER
  |--------------------------------------------------------------------------
  */

  const user = getUser();

  /*
  |--------------------------------------------------------------------------
  | AUTOMATIC ROLE DETECTION
  |--------------------------------------------------------------------------
  |
  | If a page passes role="Mentor", we use it.
  | If a page only uses <DashboardLayout>, we automatically get
  | the role from the logged-in user's session.
  |
  */

  const effectiveRole = role || user?.role || "";

  /*
  |--------------------------------------------------------------------------
  | DEFAULT MENUS
  |--------------------------------------------------------------------------
  */

  const defaultMenus = {
    Admin: [
      {
        label: "Dashboard",
        path: "/admin/dashboard",
        icon: "dashboard",
      },
      {
        label: "Approvals",
        path: "/admin/dashboard#approvals",
        icon: "admin",
      },
      {
        label: "Assign Mentees",
        path: "/admin/dashboard#assign",
        icon: "users",
      },
      {
        label: "Mentors",
        path: "/admin/dashboard#mentors",
        icon: "mentor",
      },
      {
        label: "Mentees",
        path: "/admin/dashboard#mentees",
        icon: "users",
      },
    ],

    Mentor: [
      {
        label: "Dashboard",
        path: "/mentor/dashboard",
        icon: "dashboard",
      },
      {
        label: "My Mentees",
        path: "/mentor/mentees",
        icon: "users",
      },
      {
        label: "Meetings",
        path: "/mentor/meetings",
        icon: "meetings",
      },
      {
        label: "Attendance",
        path: "/mentor/attendance",
        icon: "attendance",
      },
      {
        label: "Tasks",
        path: "/mentor/tasks",
        icon: "tasks",
      },
      {
        label: "Concerns",
        path: "/mentor/concerns",
        icon: "concerns",
      },
      {
        label: "Announcements",
        path: "/mentor/announcements",
        icon: "announcements",
      },
      {
        label: "Academic",
        path: "/mentor/academic",
        icon: "academic",
      },
      {
        label: "Profile",
        path: "/mentor/profile",
        icon: "profile",
      },
    ],

    Mentee: [
      {
        label: "Dashboard",
        path: "/mentee/dashboard",
        icon: "dashboard",
      },
      {
        label: "My Mentor",
        path: "/mentee/mentor",
        icon: "mentor",
      },
      {
        label: "Meetings",
        path: "/mentee/meetings",
        icon: "meetings",
      },
      {
        label: "Attendance",
        path: "/mentee/attendance",
        icon: "attendance",
      },
      {
        label: "Tasks",
        path: "/mentee/tasks",
        icon: "tasks",
      },
      {
        label: "Concerns",
        path: "/mentee/concerns",
        icon: "concerns",
      },
      {
        label: "Announcements",
        path: "/mentee/announcements",
        icon: "announcements",
      },
      {
        label: "Academic",
        path: "/mentee/academic",
        icon: "academic",
      },
      {
        label: "Profile",
        path: "/mentee/profile",
        icon: "profile",
      },
    ],
  };

  /*
  |--------------------------------------------------------------------------
  | SELECT NAVIGATION
  |--------------------------------------------------------------------------
  |
  | If a page explicitly provides menuItems, use them.
  | Otherwise use the automatic role-based menu.
  |
  */

  const navigationItems =
    Array.isArray(menuItems) && menuItems.length > 0
      ? menuItems
      : defaultMenus[effectiveRole] || [];

  /*
  |--------------------------------------------------------------------------
  | DASHBOARD PATH
  |--------------------------------------------------------------------------
  */

  const dashboardPath =
    effectiveRole === "Admin"
      ? "/admin/dashboard"
      : effectiveRole === "Mentor"
      ? "/mentor/dashboard"
      : effectiveRole === "Mentee"
      ? "/mentee/dashboard"
      : "/";

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  /*
  |--------------------------------------------------------------------------
  | ICON MAPPING
  |--------------------------------------------------------------------------
  */

  const getIcon = (iconName) => {
    const icons = {
      dashboard: LayoutDashboard,
      users: Users,
      meetings: CalendarDays,
      attendance: ClipboardCheck,
      tasks: CheckSquare,
      concerns: MessageSquareWarning,
      announcements: Megaphone,
      academic: BookOpen,
      profile: UserCircle,
      mentor: UserRound,
      admin: ShieldCheck,
    };

    return icons[iconName] || LayoutDashboard;
  };

  /*
  |--------------------------------------------------------------------------
  | ACTIVE ROUTE
  |--------------------------------------------------------------------------
  */

  const isActive = (path) => {
    /*
     * Admin hash links.
     */
    if (path.includes("#")) {
      const [basePath, hash] = path.split("#");

      return (
        location.pathname === basePath &&
        location.hash === `#${hash}`
      );
    }

    return location.pathname === path;
  };

  /*
  |--------------------------------------------------------------------------
  | NAVIGATION HANDLER
  |--------------------------------------------------------------------------
  */

  const handleNavigation = () => {
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* =========================================================
          MOBILE OVERLAY
      ========================================================== */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* =========================================================
          SIDEBAR
      ========================================================== */}

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen flex-col
          border-r border-slate-800 bg-slate-950
          transition-all duration-300
          ${collapsed ? "w-[78px]" : "w-[260px]"}
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* =====================================================
            LOGO
        ====================================================== */}

        <div
          className={`
            flex h-[72px] shrink-0 items-center
            border-b border-slate-800
            ${
              collapsed
                ? "justify-center px-3"
                : "justify-between px-5"
            }
          `}
        >
          <Link
            to={dashboardPath}
            onClick={handleNavigation}
            className="flex min-w-0 items-center gap-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 ring-1 ring-cyan-400/20">
              <GraduationCap className="h-6 w-6 text-cyan-400" />
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <h1 className="truncate text-base font-bold">
                  Mentor
                  <span className="text-cyan-400">
                    Connect
                  </span>
                </h1>

                <p className="mt-0.5 truncate text-[9px] uppercase tracking-[0.18em] text-slate-500">
                  Mentorship Platform
                </p>
              </div>
            )}
          </Link>

          {/* Mobile close */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* =====================================================
            USER PROFILE
        ====================================================== */}

        <div
          className={`
            border-b border-slate-800
            ${collapsed ? "px-3 py-4" : "px-4 py-4"}
          `}
        >
          <div
            className={`
              flex items-center
              ${collapsed ? "justify-center" : "gap-3"}
            `}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-400 ring-1 ring-cyan-400/20">
              <UserCircle className="h-6 w-6" />
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {user?.name || "User"}
                </p>

                <p className="truncate text-xs text-slate-500">
                  {user?.role || effectiveRole}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* =====================================================
            NAVIGATION
        ====================================================== */}

        <nav
          className="flex-1 overflow-y-auto px-3 py-5"
          aria-label="Main navigation"
        >
          {!collapsed && (
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
              Main Menu
            </p>
          )}

          <div className="space-y-1.5">
            {navigationItems.map((item) => {
              const Icon = getIcon(item.icon);
              const active = isActive(item.path);

              return (
                <Link
                  key={`${item.path}-${item.label}`}
                  to={item.path}
                  onClick={handleNavigation}
                  title={
                    collapsed
                      ? item.label
                      : undefined
                  }
                  className={`
                    group flex items-center rounded-xl
                    py-3 text-sm font-medium transition-all
                    ${
                      collapsed
                        ? "justify-center px-2"
                        : "gap-3 px-3"
                    }
                    ${
                      active
                        ? "bg-cyan-400/10 text-cyan-400 ring-1 ring-cyan-400/10"
                        : "text-slate-400 hover:bg-slate-900 hover:text-white"
                    }
                  `}
                >
                  <Icon
                    className={`
                      h-[18px] w-[18px] shrink-0
                      ${
                        active
                          ? "text-cyan-400"
                          : "text-slate-500 group-hover:text-slate-300"
                      }
                    `}
                  />

                  {!collapsed && (
                    <span className="truncate">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* =====================================================
            SIDEBAR BOTTOM
        ====================================================== */}

        <div className="border-t border-slate-800 p-3">
          {/* Desktop collapse */}
          <button
            type="button"
            onClick={() =>
              setCollapsed((value) => !value)
            }
            aria-label={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
            className="mb-2 hidden w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-500 transition hover:bg-slate-900 hover:text-white lg:flex"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                Collapse Sidebar
              </>
            )}
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            title={
              collapsed ? "Logout" : undefined
            }
            className={`
              flex w-full items-center rounded-xl
              py-3 text-sm font-medium text-red-400
              transition hover:bg-red-500/10 hover:text-red-300
              ${
                collapsed
                  ? "justify-center px-2"
                  : "gap-3 px-3"
              }
            `}
          >
            <LogOut className="h-[18px] w-[18px]" />

            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* =========================================================
          MAIN AREA
      ========================================================== */}

      <div
        className={`
          min-h-screen transition-all duration-300
          ${
            collapsed
              ? "lg:pl-[78px]"
              : "lg:pl-[260px]"
          }
        `}
      >
        {/* =====================================================
            TOP BAR
        ====================================================== */}

        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-slate-800 bg-slate-950/90 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open sidebar"
              className="rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-slate-300 transition hover:border-cyan-400/30 hover:text-cyan-400 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
                {effectiveRole} Portal
              </p>

              <h2 className="text-lg font-bold text-white">
                {title}
              </h2>
            </div>
          </div>

          {/* ===================================================
              TOP RIGHT PROFILE
          ==================================================== */}

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-200">
                {user?.name || "User"}
              </p>

              <p className="text-xs text-slate-500">
                {user?.email || ""}
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-400 ring-1 ring-cyan-400/20">
              <UserCircle className="h-5 w-5" />
            </div>
          </div>
        </header>

        {/* =====================================================
            PAGE CONTENT
        ====================================================== */}

        <main className="min-h-[calc(100vh-72px)] p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;