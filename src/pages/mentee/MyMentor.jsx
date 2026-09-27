import { useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  Building2,
  BriefcaseBusiness,
  RefreshCw,
  MessageSquare,
  CalendarDays,
  ShieldCheck,
  UserCircle,
} from "lucide-react";

import DashboardLayout from "../../components/common/Sidebar";
import { apiGet } from "../../services/api";

function MyMentor() {
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const menuItems = [
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
  ];

  const loadMentor = async () => {
    try {
      setLoading(true);
      setError("");

      // Correct backend route:
      // GET /api/auth/my-mentor
      const response = await apiGet("/auth/my-mentor");

      const data =
        response.mentor ||
        response.data ||
        response.user ||
        null;

      setMentor(data);
    } catch (err) {
      console.error("Unable to load mentor:", err);

      setMentor(null);

      setError(
        err.message ||
          "Unable to load mentor information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMentor();
  }, []);

  const initials = mentor?.name
    ? mentor.name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "M";

  return (
    <DashboardLayout
      role="Mentee"
      title="My Mentor"
      menuItems={menuItems}
    >
      {/* =========================
          HEADER
      ========================= */}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            Mentee Portal
          </p>

          <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
            My Mentor
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            View your assigned mentor and their contact information.
          </p>
        </div>

        <button
          type="button"
          onClick={loadMentor}
          disabled={loading}
          className="flex w-fit items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-cyan-400/30 hover:text-cyan-400 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              loading ? "animate-spin" : ""
            }`}
          />

          Refresh
        </button>
      </div>

      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* =========================
          LOADING
      ========================= */}

      {loading ? (
        <LoadingState />
      ) : mentor ? (
        <div className="space-y-6">
          {/* =========================
              MAIN MENTOR CARD
          ========================= */}

          <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">
            <div className="h-32 bg-gradient-to-r from-cyan-400/10 via-blue-500/10 to-violet-500/10 sm:h-40" />

            <div className="-mt-16 px-5 pb-7 sm:-mt-20 sm:px-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
                  {/* PHOTO */}

                  <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border-4 border-slate-900 bg-slate-800 text-2xl font-bold text-cyan-400 shadow-xl sm:h-36 sm:w-36">
                    {mentor.profilePhoto ? (
                      <img
                        src={mentor.profilePhoto}
                        alt={mentor.name || "Mentor"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>

                  {/* BASIC INFO */}

                  <div className="pb-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-bold text-white">
                        {mentor.name || "Mentor"}
                      </h2>

                      <span className="flex items-center gap-1 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-bold text-cyan-300">
                        <ShieldCheck className="h-3 w-3" />
                        MENTOR
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-400">
                      {mentor.designation || "College Mentor"}
                    </p>

                    {mentor.department && (
                      <p className="mt-1 text-xs text-slate-600">
                        {mentor.department}
                      </p>
                    )}
                  </div>
                </div>

                {/* CONTACT BUTTONS */}

                <div className="flex flex-wrap gap-2">
                  {mentor.email && (
                    <a
                      href={`mailto:${mentor.email}`}
                      className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs font-semibold text-slate-300 transition hover:border-cyan-400/30 hover:text-cyan-400"
                    >
                      <Mail className="h-4 w-4" />
                      Email
                    </a>
                  )}

                  {mentor.phone && (
                    <a
                      href={`tel:${mentor.phone}`}
                      className="flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-xs font-bold text-slate-950 transition hover:bg-cyan-300"
                    >
                      <Phone className="h-4 w-4" />
                      Call
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* =========================
              INFORMATION
          ========================= */}

          <div className="grid gap-6 lg:grid-cols-2">
            <InfoSection
              title="Professional Information"
              icon={BriefcaseBusiness}
            >
              <InfoRow
                icon={UserCircle}
                label="Name"
                value={mentor.name}
              />

              <InfoRow
                icon={BriefcaseBusiness}
                label="Designation"
                value={
                  mentor.designation || "Not provided"
                }
              />

              <InfoRow
                icon={Building2}
                label="Department"
                value={
                  mentor.department || "Not provided"
                }
              />
            </InfoSection>

            <InfoSection
              title="Contact Information"
              icon={MessageSquare}
            >
              <InfoRow
                icon={Mail}
                label="Email"
                value={
                  mentor.email || "Not provided"
                }
              />

              <InfoRow
                icon={Phone}
                label="Phone"
                value={
                  mentor.phone || "Not provided"
                }
              />
            </InfoSection>
          </div>

          {/* =========================
              QUICK ACTIONS
          ========================= */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-7">
            <div className="mb-5">
              <h2 className="font-bold text-white">
                Quick Actions
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Quickly access features related to your mentor.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <a
                href="/mentee/meetings"
                className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-950 p-4 transition hover:border-cyan-400/20 hover:bg-slate-900"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
                  <CalendarDays className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    View Meetings
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    Check upcoming mentor meetings
                  </p>
                </div>
              </a>

              <a
                href="/mentee/concerns"
                className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-950 p-4 transition hover:border-violet-400/20 hover:bg-slate-900"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400/10 text-violet-400">
                  <MessageSquare className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Raise a Concern
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    Share an issue with your mentor
                  </p>
                </div>
              </a>
            </div>
          </section>

          {/* =========================
              MENTOR NOTE
          ========================= */}

          <section className="rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-5 sm:p-6">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
                <UserRound className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  Your Mentor
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Your mentor can help you with academic
                  progress, attendance, meetings, tasks and
                  other college-related concerns.
                </p>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <NoMentorState onRefresh={loadMentor} />
      )}
    </DashboardLayout>
  );
}

/* =========================
   INFO SECTION
========================= */

function InfoSection({
  title,
  icon: Icon,
  children,
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-7">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
          <Icon className="h-5 w-5" />
        </div>

        <h2 className="font-bold text-white">
          {title}
        </h2>
      </div>

      <div className="space-y-1">
        {children}
      </div>
    </section>
  );
}

/* =========================
   INFO ROW
========================= */

function InfoRow({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl p-3 transition hover:bg-slate-950">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-slate-500">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-medium text-slate-300">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}

/* =========================
   LOADING
========================= */

function LoadingState() {
  return (
    <div className="flex min-h-96 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50">
      <RefreshCw className="h-7 w-7 animate-spin text-cyan-400" />
    </div>
  );
}

/* =========================
   NO MENTOR
========================= */

function NoMentorState({ onRefresh }) {
  return (
    <div className="flex min-h-96 flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-slate-600">
        <UserRound className="h-7 w-7" />
      </div>

      <h2 className="mt-5 text-lg font-bold text-white">
        No Mentor Assigned
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        You have not been assigned a mentor yet.
        Please contact the administrator if you
        think this is incorrect.
      </p>

      <button
        type="button"
        onClick={onRefresh}
        className="mt-6 flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
      >
        <RefreshCw className="h-4 w-4" />
        Check Again
      </button>
    </div>
  );
}

export default MyMentor;
