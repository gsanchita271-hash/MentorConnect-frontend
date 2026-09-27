import { useEffect, useMemo, useState } from "react";
import {
  Users,
  CalendarDays,
  ClipboardCheck,
  CheckSquare,
  Clock3,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  UserCheck,
  UserX,
  Activity,
} from "lucide-react";

import DashboardLayout from "../../components/common/Sidebar";
import { apiGet } from "../../services/api";

const menuItems = [
  {
    label: "Dashboard",
    path: "/mentor/dashboard",
  },
  {
    label: "My Mentees",
    path: "/mentor/mentees",
  },
  {
    label: "Meetings",
    path: "/mentor/meetings",
  },
  {
    label: "Attendance",
    path: "/mentor/attendance",
  },
  {
    label: "Tasks",
    path: "/mentor/tasks",
  },
  {
    label: "Concerns",
    path: "/mentor/concerns",
  },
  {
    label: "Announcements",
    path: "/mentor/announcements",
  },
  {
    label: "Academic",
    path: "/mentor/academic",
  },
  {
    label: "Profile",
    path: "/mentor/profile",
  },
];

/* -------------------------------------------------------------------------- */
/* Response helpers                                                           */
/* -------------------------------------------------------------------------- */

const extractArray = (response, key) => {
  if (Array.isArray(response?.[key])) {
    return response[key];
  }

  if (Array.isArray(response?.data?.[key])) {
    return response.data[key];
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response)) {
    return response;
  }

  return [];
};

const getSettledArray = (result, key) => {
  if (result?.status !== "fulfilled") {
    return [];
  }

  return extractArray(result.value, key);
};

/* -------------------------------------------------------------------------- */
/* Utility helpers                                                            */
/* -------------------------------------------------------------------------- */

const formatDate = (date) => {
  if (!date) return "No date";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Invalid date";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (date) => {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const isToday = (date) => {
  if (!date) return false;

  const target = new Date(date);

  if (Number.isNaN(target.getTime())) {
    return false;
  }

  const today = new Date();

  return (
    target.getDate() === today.getDate() &&
    target.getMonth() === today.getMonth() &&
    target.getFullYear() === today.getFullYear()
  );
};

const getMenteeName = (mentee) => {
  if (!mentee) return "Unknown Mentee";

  if (typeof mentee === "string") {
    return "Mentee";
  }

  return mentee.name || mentee.fullName || mentee.email || "Unknown Mentee";
};

const getMeetingMentees = (meeting) => {
  if (Array.isArray(meeting?.mentees)) {
    return meeting.mentees;
  }

  if (meeting?.mentee) {
    return [meeting.mentee];
  }

  return [];
};

const getAttendancePercentage = (record) => {
  const possibleValues = [
    record?.percentage,
    record?.attendancePercentage,
    record?.attendancePercent,
  ];

  for (const value of possibleValues) {
    const number = Number(value);

    if (Number.isFinite(number)) {
      return number;
    }
  }

  return null;
};

/* -------------------------------------------------------------------------- */
/* Small UI components                                                        */
/* -------------------------------------------------------------------------- */

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClass = "bg-cyan-500/10 text-cyan-400",
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-black/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>

          <h3 className="mt-2 text-3xl font-bold text-white">
            {value}
          </h3>

          {subtitle && (
            <p className="mt-1 text-xs text-slate-500">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  actionText,
  onAction,
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
          <Icon size={19} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white">
            {title}
          </h2>

          {subtitle && (
            <p className="text-xs text-slate-500">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {actionText && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-cyan-500/40 hover:bg-slate-800 hover:text-cyan-400 sm:self-auto"
        >
          {actionText}
          <ArrowRight size={15} />
        </button>
      )}
    </div>
  );
}

function MeetingRow({ meeting }) {
  const mentees = getMeetingMentees(meeting);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 transition hover:border-slate-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-white">
            {meeting?.title || "Untitled Meeting"}
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            {mentees.length > 0
              ? mentees.map(getMenteeName).join(", ")
              : "No mentee information"}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-1 text-sm sm:items-end">
          <div className="flex items-center gap-2 text-cyan-400">
            <CalendarDays size={15} />
            <span>{formatDate(meeting?.date)}</span>
          </div>

          {formatTime(meeting?.date) && (
            <div className="flex items-center gap-2 text-slate-500">
              <Clock3 size={14} />
              <span>{formatTime(meeting?.date)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task }) {
  const status = task?.status || "Pending";

  const statusClasses = {
    Pending:
      "border-amber-500/20 bg-amber-500/10 text-amber-400",
    "In Progress":
      "border-blue-500/20 bg-blue-500/10 text-blue-400",
    Completed:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 transition hover:border-slate-700">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-white">
            {task?.title || "Untitled Task"}
          </h3>

          {task?.goal && (
            <p className="mt-1 line-clamp-2 text-sm text-slate-400">
              {task.goal}
            </p>
          )}
        </div>

        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${
            statusClasses[status] ||
            "border-slate-700 bg-slate-800 text-slate-300"
          }`}
        >
          {status}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
        {task?.dueDate && (
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={13} />
            Due {formatDate(task.dueDate)}
          </span>
        )}

        {task?.priority && (
          <span>
            Priority:{" "}
            <span className="text-slate-300">
              {task.priority}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, message }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/30 px-5 py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/70 text-slate-500">
        <Icon size={21} />
      </div>

      <h3 className="mt-4 font-medium text-slate-300">
        {title}
      </h3>

      <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
        {message}
      </p>
    </div>
  );
}

function LoadingBlock() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/40 px-5 py-10 text-center">
      <RefreshCw
        size={22}
        className="mx-auto animate-spin text-cyan-400"
      />

      <p className="mt-3 text-sm text-slate-500">
        Loading dashboard...
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main dashboard                                                             */
/* -------------------------------------------------------------------------- */

function MentorDashboard() {
  const [mentees, setMentees] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = async (showRefresh = false) => {
    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const results = await Promise.allSettled([
        apiGet("/auth/my-mentees"),
        apiGet("/meetings/my-meetings"),
        apiGet("/attendance/my-attendance"),
        apiGet("/tasks/my-tasks"),
      ]);

      const menteesData = getSettledArray(results[0], "mentees");
      const meetingsData = getSettledArray(results[1], "meetings");
      const attendanceData = getSettledArray(
        results[2],
        "attendance"
      );
      const tasksData = getSettledArray(results[3], "tasks");

      setMentees(menteesData);
      setMeetings(meetingsData);
      setAttendance(attendanceData);
      setTasks(tasksData);

      const failedRequests = results.filter(
        (result) => result.status === "rejected"
      );

      if (failedRequests.length === results.length) {
        setError(
          "Unable to load dashboard data. Please try again."
        );
      } else if (failedRequests.length > 0) {
        setError(
          "Some dashboard information could not be loaded."
        );
      }
    } catch (err) {
      console.error("Mentor dashboard error:", err);

      setError(
        err?.message ||
          "Something went wrong while loading the dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const todayMeetings = useMemo(() => {
    return meetings
      .filter((meeting) => isToday(meeting?.date))
      .sort(
        (a, b) =>
          new Date(a?.date || 0) - new Date(b?.date || 0)
      );
  }, [meetings]);

  const upcomingMeetings = useMemo(() => {
    const now = new Date();

    return meetings
      .filter((meeting) => {
        if (!meeting?.date) return false;

        const date = new Date(meeting.date);

        return (
          !Number.isNaN(date.getTime()) &&
          date >= now &&
          !isToday(meeting.date)
        );
      })
      .sort(
        (a, b) =>
          new Date(a?.date || 0) - new Date(b?.date || 0)
      )
      .slice(0, 5);
  }, [meetings]);

  const pendingTasks = useMemo(() => {
    return tasks.filter(
      (task) => task?.status !== "Completed"
    );
  }, [tasks]);

  const completedTasks = useMemo(() => {
    return tasks.filter(
      (task) => task?.status === "Completed"
    );
  }, [tasks]);

  const lowAttendance = useMemo(() => {
    return attendance.filter((record) => {
      const percentage = getAttendancePercentage(record);

      return percentage !== null && percentage < 75;
    });
  }, [attendance]);

  const attendancePercentage = useMemo(() => {
    const percentages = attendance
      .map(getAttendancePercentage)
      .filter((value) => value !== null);

    if (!percentages.length) {
      return null;
    }

    const total = percentages.reduce(
      (sum, value) => sum + value,
      0
    );

    return Math.round(total / percentages.length);
  }, [attendance]);

  return (
    <DashboardLayout
      role="Mentor"
      menuItems={menuItems}
      title="Mentor Dashboard"
    >
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Activity
                  size={20}
                  className="text-cyan-400"
                />

                <span className="text-sm font-medium text-cyan-400">
                  Mentor Panel
                </span>
              </div>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Mentor Dashboard
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Manage your mentees, meetings, attendance and tasks.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-cyan-500/40 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <AlertTriangle
                size={19}
                className="mt-0.5 shrink-0 text-amber-400"
              />

              <div>
                <p className="text-sm font-medium text-amber-300">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => loadDashboard()}
                  className="mt-2 text-xs font-medium text-cyan-400 hover:text-cyan-300"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <LoadingBlock />
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  title="My Mentees"
                  value={mentees.length}
                  subtitle="Assigned students"
                  icon={Users}
                />

                <StatCard
                  title="Today's Meetings"
                  value={todayMeetings.length}
                  subtitle="Scheduled today"
                  icon={CalendarDays}
                  iconClass="bg-blue-500/10 text-blue-400"
                />

                <StatCard
                  title="Pending Tasks"
                  value={pendingTasks.length}
                  subtitle={`${completedTasks.length} completed`}
                  icon={CheckSquare}
                  iconClass="bg-violet-500/10 text-violet-400"
                />

                <StatCard
                  title="Attendance"
                  value={
                    attendancePercentage !== null
                      ? `${attendancePercentage}%`
                      : "—"
                  }
                  subtitle={
                    lowAttendance.length > 0
                      ? `${lowAttendance.length} low records`
                      : "No low records detected"
                  }
                  icon={ClipboardCheck}
                  iconClass={
                    lowAttendance.length > 0
                      ? "bg-red-500/10 text-red-400"
                      : "bg-emerald-500/10 text-emerald-400"
                  }
                />
              </div>

              {/* Today's meetings + quick overview */}
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <section className="xl:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-black/10">
                  <SectionHeader
                    icon={CalendarDays}
                    title="Today's Meetings"
                    subtitle="Your meetings scheduled for today"
                    actionText="View all"
                    onAction={() => {
                      window.location.href =
                        "/mentor/meetings";
                    }}
                  />

                  {todayMeetings.length === 0 ? (
                    <EmptyState
                      icon={CalendarDays}
                      title="No meetings today"
                      message="You don't have any meetings scheduled for today."
                    />
                  ) : (
                    <div className="space-y-3">
                      {todayMeetings.slice(0, 5).map((meeting) => (
                        <MeetingRow
                          key={
                            meeting?._id ||
                            meeting?.id ||
                            `${meeting?.title}-${meeting?.date}`
                          }
                          meeting={meeting}
                        />
                      ))}
                    </div>
                  )}
                </section>

                <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-black/10">
                  <SectionHeader
                    icon={Users}
                    title="Mentee Overview"
                    subtitle="Your assigned students"
                    actionText="Manage"
                    onAction={() => {
                      window.location.href =
                        "/mentor/mentees";
                    }}
                  />

                  {mentees.length === 0 ? (
                    <EmptyState
                      icon={Users}
                      title="No mentees assigned"
                      message="Assigned mentees will appear here."
                    />
                  ) : (
                    <div className="space-y-3">
                      {mentees.slice(0, 5).map((mentee) => (
                        <div
                          key={
                            mentee?._id ||
                            mentee?.id ||
                            mentee?.email
                          }
                          className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-sm font-semibold text-cyan-400">
                            {(mentee?.name || "M")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-white">
                              {mentee?.name ||
                                mentee?.fullName ||
                                "Unknown Mentee"}
                            </p>

                            <p className="truncate text-xs text-slate-500">
                              {mentee?.email || "No email"}
                            </p>
                          </div>
                        </div>
                      ))}

                      {mentees.length > 5 && (
                        <p className="pt-1 text-center text-xs text-slate-500">
                          +{mentees.length - 5} more mentees
                        </p>
                      )}
                    </div>
                  )}
                </section>
              </div>

              {/* Upcoming meetings + tasks */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-black/10">
                  <SectionHeader
                    icon={Clock3}
                    title="Upcoming Meetings"
                    subtitle="Next scheduled sessions"
                    actionText="View all"
                    onAction={() => {
                      window.location.href =
                        "/mentor/meetings";
                    }}
                  />

                  {upcomingMeetings.length === 0 ? (
                    <EmptyState
                      icon={Clock3}
                      title="No upcoming meetings"
                      message="Your upcoming meetings will appear here."
                    />
                  ) : (
                    <div className="space-y-3">
                      {upcomingMeetings.map((meeting) => (
                        <MeetingRow
                          key={
                            meeting?._id ||
                            meeting?.id ||
                            `${meeting?.title}-${meeting?.date}`
                          }
                          meeting={meeting}
                        />
                      ))}
                    </div>
                  )}
                </section>

                <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-black/10">
                  <SectionHeader
                    icon={CheckSquare}
                    title="Pending Tasks"
                    subtitle="Tasks that still need attention"
                    actionText="Manage"
                    onAction={() => {
                      window.location.href =
                        "/mentor/tasks";
                    }}
                  />

                  {pendingTasks.length === 0 ? (
                    <EmptyState
                      icon={CheckSquare}
                      title="All tasks completed"
                      message="There are no pending tasks right now."
                    />
                  ) : (
                    <div className="space-y-3">
                      {pendingTasks.slice(0, 5).map((task) => (
                        <TaskCard
                          key={
                            task?._id ||
                            task?.id ||
                            task?.title
                          }
                          task={task}
                        />
                      ))}

                      {pendingTasks.length > 5 && (
                        <p className="pt-1 text-center text-xs text-slate-500">
                          +{pendingTasks.length - 5} more pending tasks
                        </p>
                      )}
                    </div>
                  )}
                </section>
              </div>

              {/* Attendance status */}
              <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-black/10">
                <SectionHeader
                  icon={
                    lowAttendance.length > 0
                      ? UserX
                      : UserCheck
                  }
                  title="Attendance Overview"
                  subtitle="Attendance information available from the backend"
                  actionText="View attendance"
                  onAction={() => {
                    window.location.href =
                      "/mentor/attendance";
                  }}
                />

                {attendance.length === 0 ? (
                  <EmptyState
                    icon={ClipboardCheck}
                    title="No attendance records"
                    message="Attendance records will appear here once they are available."
                  />
                ) : lowAttendance.length === 0 ? (
                  <div className="flex items-center gap-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                      <UserCheck size={20} />
                    </div>

                    <div>
                      <h3 className="font-medium text-emerald-300">
                        No low-attendance records detected
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Records containing an attendance percentage
                        below 75% would be highlighted here.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                      <UserX size={20} />
                    </div>

                    <div>
                      <h3 className="font-medium text-red-300">
                        Low attendance needs attention
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {lowAttendance.length} attendance record
                        {lowAttendance.length !== 1 ? "s" : ""}{" "}
                        is below the 75% threshold.
                      </p>
                    </div>
                  </div>
                )}
              </section>

              {/* Quick actions */}
              <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-black/10">
                <div className="mb-5">
                  <h2 className="text-lg font-semibold text-white">
                    Quick Actions
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Frequently used mentor tools
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href =
                        "/mentor/mentees";
                    }}
                    className="group rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-left transition hover:border-cyan-500/30 hover:bg-slate-800/60"
                  >
                    <Users
                      size={20}
                      className="text-cyan-400"
                    />

                    <p className="mt-3 font-medium text-white">
                      My Mentees
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      View assigned students
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      window.location.href =
                        "/mentor/meetings";
                    }}
                    className="group rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-left transition hover:border-blue-500/30 hover:bg-slate-800/60"
                  >
                    <CalendarDays
                      size={20}
                      className="text-blue-400"
                    />

                    <p className="mt-3 font-medium text-white">
                      Schedule Meeting
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Plan a mentor session
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      window.location.href =
                        "/mentor/attendance";
                    }}
                    className="group rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-left transition hover:border-emerald-500/30 hover:bg-slate-800/60"
                  >
                    <ClipboardCheck
                      size={20}
                      className="text-emerald-400"
                    />

                    <p className="mt-3 font-medium text-white">
                      Attendance
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Manage attendance
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      window.location.href =
                        "/mentor/tasks";
                    }}
                    className="group rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-left transition hover:border-violet-500/30 hover:bg-slate-800/60"
                  >
                    <CheckSquare
                      size={20}
                      className="text-violet-400"
                    />

                    <p className="mt-3 font-medium text-white">
                      Tasks
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Create and manage tasks
                    </p>
                  </button>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default MentorDashboard;

