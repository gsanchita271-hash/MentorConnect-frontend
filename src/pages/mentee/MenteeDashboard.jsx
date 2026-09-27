import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ClipboardCheck,
  CheckSquare,
  MessageSquareWarning,
  Megaphone,
  BookOpen,
  Clock3,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  UserCircle,
} from "lucide-react";

import DashboardLayout from "../../components/common/Sidebar";
import {
  apiGet,
  getUser,
} from "../../services/api";

function MenteeDashboard() {
  const [user] = useState(
    getUser()
  );

  const [meetings, setMeetings] =
    useState([]);

  const [attendance, setAttendance] =
    useState([]);

  const [tasks, setTasks] =
    useState([]);

  const [concerns, setConcerns] =
    useState([]);

  const [announcements, setAnnouncements] =
    useState([]);

  const [academic, setAcademic] =
    useState([]);

  const [mentor, setMentor] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

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

  /* =========================
     LOAD DASHBOARD
  ========================== */

  const loadDashboard =
    async () => {
      try {
        setLoading(true);
        setError("");

        const results =
          await Promise.allSettled([
            apiGet("/meetings"),
            apiGet("/attendance"),
            apiGet("/tasks"),
            apiGet("/concerns"),
            apiGet("/announcements"),
            apiGet("/academic"),
            apiGet("/auth/mentor"),
          ]);

        const [
          meetingsResult,
          attendanceResult,
          tasksResult,
          concernsResult,
          announcementsResult,
          academicResult,
          mentorResult,
        ] = results;

        if (
          meetingsResult.status ===
          "fulfilled"
        ) {
          const data =
            meetingsResult.value;

          setMeetings(
            data.meetings ||
              data.data ||
              []
          );
        }

        if (
          attendanceResult.status ===
          "fulfilled"
        ) {
          const data =
            attendanceResult.value;

          setAttendance(
            data.attendance ||
              data.records ||
              data.data ||
              []
          );
        }

        if (
          tasksResult.status ===
          "fulfilled"
        ) {
          const data =
            tasksResult.value;

          setTasks(
            data.tasks ||
              data.data ||
              []
          );
        }

        if (
          concernsResult.status ===
          "fulfilled"
        ) {
          const data =
            concernsResult.value;

          setConcerns(
            data.concerns ||
              data.data ||
              []
          );
        }

        if (
          announcementsResult.status ===
          "fulfilled"
        ) {
          const data =
            announcementsResult.value;

          setAnnouncements(
            data.announcements ||
              data.data ||
              []
          );
        }

        if (
          academicResult.status ===
          "fulfilled"
        ) {
          const data =
            academicResult.value;

          setAcademic(
            data.academic ||
              data.records ||
              data.data ||
              []
          );
        }

        if (
          mentorResult.status ===
          "fulfilled"
        ) {
          const data =
            mentorResult.value;

          setMentor(
            data.mentor ||
              data.user ||
              data.data ||
              null
          );
        }
      } catch (err) {
        setError(
          err.message ||
            "Unable to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadDashboard();
  }, []);

  /* =========================
     NORMALIZED DATA
  ========================== */

  const normalizedMeetings =
    useMemo(() => {
      return meetings.map(
        (meeting) => ({
          ...meeting,
          title:
            meeting.title ||
            meeting.subject ||
            "Mentor Meeting",
          date:
            meeting.date ||
            meeting.meetingDate ||
            meeting.scheduledDate,
          time:
            meeting.time ||
            meeting.meetingTime ||
            "",
          mode:
            meeting.mode ||
            "Offline",
          status:
            meeting.status ||
            "Scheduled",
        })
      );
    }, [meetings]);

  const normalizedTasks =
    useMemo(() => {
      return tasks.map(
        (task) => ({
          ...task,
          title:
            task.title ||
            task.name ||
            "Task",
          status:
            task.status ||
            "Pending",
          priority:
            task.priority ||
            "Normal",
          dueDate:
            task.dueDate ||
            task.deadline,
        })
      );
    }, [tasks]);

  /* =========================
     STATS
  ========================== */

  const upcomingMeetings =
    normalizedMeetings.filter(
      (meeting) => {
        if (!meeting.date) {
          return (
            String(
              meeting.status
            ).toLowerCase() ===
              "scheduled" ||
            String(
              meeting.status
            ).toLowerCase() ===
              "upcoming"
          );
        }

        const meetingDate =
          new Date(
            meeting.date
          );

        return (
          meetingDate >=
            new Date() &&
          ![
            "completed",
            "cancelled",
          ].includes(
            String(
              meeting.status
            ).toLowerCase()
          )
        );
      }
    );

  const pendingTasks =
    normalizedTasks.filter(
      (task) =>
        ![
          "completed",
          "done",
        ].includes(
          String(
            task.status
          ).toLowerCase()
        )
    );

  const openConcerns =
    concerns.filter(
      (concern) =>
        ![
          "resolved",
          "closed",
        ].includes(
          String(
            concern.status ||
              "Open"
          ).toLowerCase()
        )
    );

  const averageAcademic =
    academic.length
      ? academic.reduce(
          (sum, record) => {
            const marks =
              Number(
                record.marks ??
                  record.score ??
                  0
              );

            const max =
              Number(
                record.maxMarks ??
                  record.totalMarks ??
                  100
              );

            return (
              sum +
              (max > 0
                ? (marks / max) *
                  100
                : 0)
            );
          },
          0
        ) / academic.length
      : 0;

  const attendancePercentage =
    calculateAttendance(
      attendance
    );

  const recentAnnouncements =
    [...announcements]
      .sort(
        (a, b) =>
          new Date(
            b.createdAt ||
              b.date ||
              0
          ) -
          new Date(
            a.createdAt ||
              a.date ||
              0
          )
      )
      .slice(0, 3);

  const recentMeetings =
    [...normalizedMeetings]
      .sort(
        (a, b) =>
          new Date(
            a.date || 0
          ) -
          new Date(
            b.date || 0
          )
      )
      .slice(0, 4);

  const displayName =
    user?.name ||
    user?.fullName ||
    "Mentee";

  return (
    <DashboardLayout
      role="Mentee"
      title="Dashboard"
      menuItems={menuItems}
    >
      {/* =========================
          HEADER
      ========================== */}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            Mentee Portal
          </p>

          <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
            Welcome, {displayName.split(" ")[0]}
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Here is your academic and mentoring overview.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          disabled={loading}
          className="flex w-fit items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-cyan-400/30 hover:text-cyan-400 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              loading
                ? "animate-spin"
                : ""
            }`}
          />
          Refresh
        </button>
      </div>

      {/* =========================
          ERROR
      ========================== */}

      {error && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {/* =========================
          STAT CARDS
      ========================== */}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={CalendarDays}
          label="Upcoming Meetings"
          value={
            upcomingMeetings.length
          }
          description="Scheduled sessions"
        />

        <StatCard
          icon={CheckSquare}
          label="Pending Tasks"
          value={
            pendingTasks.length
          }
          description="Tasks to complete"
          iconClass="text-amber-400"
          bgClass="bg-amber-400/10"
        />

        <StatCard
          icon={ClipboardCheck}
          label="Attendance"
          value={`${attendancePercentage.toFixed(
            1
          )}%`}
          description="Overall attendance"
          iconClass={
            attendancePercentage >=
            75
              ? "text-emerald-400"
              : "text-red-400"
          }
          bgClass={
            attendancePercentage >=
            75
              ? "bg-emerald-400/10"
              : "bg-red-400/10"
          }
        />

        <StatCard
          icon={TrendingUp}
          label="Academic"
          value={`${averageAcademic.toFixed(
            1
          )}%`}
          description="Average performance"
          iconClass="text-cyan-400"
          bgClass="bg-cyan-400/10"
        />
      </div>

      {/* =========================
          MAIN GRID
      ========================== */}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.8fr)]">
        {/* LEFT */}
        <div className="space-y-6">
          {/* =========================
              UPCOMING MEETINGS
          ========================== */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900/50">
            <SectionHeader
              icon={CalendarDays}
              title="Upcoming Meetings"
              subtitle="Your scheduled mentor sessions"
              link="/mentee/meetings"
              linkText="View all"
            />

            <div className="p-5">
              {loading ? (
                <LoadingRow />
              ) : recentMeetings.length ===
                0 ? (
                <EmptySection
                  icon={CalendarDays}
                  text="No upcoming meetings."
                />
              ) : (
                <div className="space-y-3">
                  {recentMeetings.map(
                    (meeting) => (
                      <MeetingRow
                        key={
                          meeting._id ||
                          meeting.id ||
                          `${meeting.title}-${meeting.date}`
                        }
                        meeting={
                          meeting
                        }
                      />
                    )
                  )}
                </div>
              )}
            </div>
          </section>

          {/* =========================
              TASKS
          ========================== */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900/50">
            <SectionHeader
              icon={CheckSquare}
              title="My Tasks"
              subtitle="Tasks assigned by your mentor"
              link="/mentee/tasks"
              linkText="View tasks"
            />

            <div className="p-5">
              {pendingTasks.length ===
              0 ? (
                <EmptySection
                  icon={CheckCircle2}
                  text="You have no pending tasks."
                  success
                />
              ) : (
                <div className="space-y-3">
                  {pendingTasks
                    .slice(0, 4)
                    .map((task) => (
                      <TaskRow
                        key={
                          task._id ||
                          task.id
                        }
                        task={task}
                      />
                    ))}
                </div>
              )}
            </div>
          </section>

          {/* =========================
              ANNOUNCEMENTS
          ========================== */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900/50">
            <SectionHeader
              icon={Megaphone}
              title="Latest Announcements"
              subtitle="Important updates from your mentor"
              link="/mentee/announcements"
              linkText="View all"
            />

            <div className="p-5">
              {recentAnnouncements.length ===
              0 ? (
                <EmptySection
                  icon={Megaphone}
                  text="No announcements available."
                />
              ) : (
                <div className="space-y-3">
                  {recentAnnouncements.map(
                    (announcement) => (
                      <AnnouncementRow
                        key={
                          announcement._id ||
                          announcement.id
                        }
                        announcement={
                          announcement
                        }
                      />
                    )
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          {/* =========================
              MENTOR CARD
          ========================== */}

          <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">
            <div className="h-20 bg-gradient-to-r from-cyan-400/20 via-cyan-400/5 to-transparent" />

            <div className="-mt-10 px-5 pb-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-slate-900 bg-slate-800 text-cyan-400">
                {mentor?.profilePhoto ||
                mentor?.photo ? (
                  <img
                    src={
                      mentor.profilePhoto ||
                      mentor.photo
                    }
                    alt="Mentor"
                    className="h-full w-full rounded-xl object-cover"
                  />
                ) : (
                  <UserCircle className="h-12 w-12" />
                )}
              </div>

              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-cyan-400">
                My Mentor
              </p>

              <h2 className="mt-1 text-lg font-bold text-white">
                {mentor?.name ||
                  mentor?.fullName ||
                  "Mentor not assigned"}
              </h2>

              {mentor?.designation && (
                <p className="mt-1 text-sm text-slate-400">
                  {mentor.designation}
                </p>
              )}

              {mentor?.department && (
                <p className="mt-1 text-xs text-slate-600">
                  {mentor.department}
                </p>
              )}

              <a
                href="/mentee/mentor"
                className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-cyan-400/30 hover:text-cyan-400"
              >
                View Mentor
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </section>

          {/* =========================
              ATTENDANCE
          ========================== */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-white">
                  Attendance
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Your current attendance
                </p>
              </div>

              <ClipboardCheck className="h-5 w-5 text-cyan-400" />
            </div>

            <div className="mt-5">
              <div className="flex items-end justify-between">
                <span
                  className={`text-3xl font-bold ${
                    attendancePercentage >=
                    75
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {attendancePercentage.toFixed(
                    1
                  )}
                  %
                </span>

                <span className="text-xs text-slate-600">
                  Required: 75%
                </span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full rounded-full ${
                    attendancePercentage >=
                    75
                      ? "bg-emerald-400"
                      : "bg-red-400"
                  }`}
                  style={{
                    width: `${Math.min(
                      attendancePercentage,
                      100
                    )}%`,
                  }}
                />
              </div>

              <p className="mt-3 text-xs text-slate-500">
                {attendancePercentage >=
                75
                  ? "You are currently meeting the attendance requirement."
                  : "Your attendance is below the required 75%."}
              </p>

              <a
                href="/mentee/attendance"
                className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-semibold text-slate-400 transition hover:text-cyan-400"
              >
                View Attendance
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </section>

          {/* =========================
              CONCERNS
          ========================== */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-white">
                  Concerns
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Open concerns and support requests
                </p>
              </div>

              <MessageSquareWarning className="h-5 w-5 text-amber-400" />
            </div>

            <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-950 p-4">
              <div>
                <p className="text-xs text-slate-600">
                  Open concerns
                </p>

                <p className="mt-1 text-2xl font-bold text-white">
                  {openConcerns.length}
                </p>
              </div>

              <a
                href="/mentee/concerns"
                className="flex items-center gap-2 rounded-lg bg-amber-400/10 px-3 py-2 text-xs font-bold text-amber-400 transition hover:bg-amber-400 hover:text-slate-950"
              >
                View
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}

/* =========================
   STAT CARD
========================= */

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  iconClass = "text-cyan-400",
  bgClass = "bg-cyan-400/10",
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition hover:border-slate-700">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {value}
          </p>

          <p className="mt-1 text-[11px] text-slate-600">
            {description}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bgClass} ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

/* =========================
   SECTION HEADER
========================= */

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  link,
  linkText,
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-800 p-5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-400">
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <h2 className="truncate font-bold text-white">
            {title}
          </h2>

          <p className="mt-0.5 truncate text-xs text-slate-600">
            {subtitle}
          </p>
        </div>
      </div>

      {link && (
        <a
          href={link}
          className="flex shrink-0 items-center gap-1 text-xs font-semibold text-cyan-400 transition hover:text-cyan-300"
        >
          {linkText}
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  );
}

/* =========================
   MEETING ROW
========================= */

function MeetingRow({
  meeting,
}) {
  const date =
    meeting.date
      ? new Date(meeting.date)
      : null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4 sm:flex-row sm:items-center">
      <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-400">
        {date &&
        !Number.isNaN(
          date.getTime()
        ) ? (
          <>
            <span className="text-[9px] font-bold uppercase">
              {date.toLocaleDateString(
                [],
                {
                  month: "short",
                }
              )}
            </span>

            <span className="text-lg font-bold leading-none">
              {date.getDate()}
            </span>
          </>
        ) : (
          <CalendarDays className="h-5 w-5" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">
          {meeting.title}
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-600">
          <span className="flex items-center gap-1">
            <Clock3 className="h-3 w-3" />
            {meeting.time ||
              "Time not set"}
          </span>

          <span>
            {meeting.mode}
          </span>
        </div>
      </div>

      <span className="w-fit rounded-full bg-cyan-400/10 px-2.5 py-1 text-[10px] font-bold text-cyan-300">
        {meeting.status}
      </span>
    </div>
  );
}

/* =========================
   TASK ROW
========================= */

function TaskRow({
  task,
}) {
  const priority =
    String(
      task.priority ||
        "Normal"
    ).toLowerCase();

  let priorityClass =
    "text-slate-400 bg-slate-800";

  if (
    priority === "high"
  ) {
    priorityClass =
      "text-amber-300 bg-amber-400/10";
  }

  if (
    priority === "urgent"
  ) {
    priorityClass =
      "text-red-300 bg-red-400/10";
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400">
        <CheckSquare className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">
          {task.title}
        </p>

        {task.dueDate && (
          <p className="mt-1 text-xs text-slate-600">
            Due{" "}
            {formatDate(
              task.dueDate
            )}
          </p>
        )}
      </div>

      <span
        className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${priorityClass}`}
      >
        {task.priority}
      </span>
    </div>
  );
}

/* =========================
   ANNOUNCEMENT ROW
========================= */

function AnnouncementRow({
  announcement,
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-400">
          <Megaphone className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-white">
              {announcement.title ||
                "Announcement"}
            </p>

            {announcement.pinned && (
              <span className="rounded-full bg-cyan-400/10 px-2 py-0.5 text-[9px] font-bold text-cyan-300">
                PINNED
              </span>
            )}
          </div>

          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
            {announcement.message ||
              announcement.description ||
              "No details available."}
          </p>

          {(announcement.createdAt ||
            announcement.date) && (
            <p className="mt-2 text-[10px] text-slate-700">
              {formatDate(
                announcement.createdAt ||
                  announcement.date
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================
   EMPTY
========================= */

function EmptySection({
  icon: Icon,
  text,
  success = false,
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-800 bg-slate-950 p-5">
      <Icon
        className={`h-5 w-5 ${
          success
            ? "text-emerald-400"
            : "text-slate-600"
        }`}
      />

      <p className="text-sm text-slate-600">
        {text}
      </p>
    </div>
  );
}

/* =========================
   LOADING
========================= */

function LoadingRow() {
  return (
    <div className="flex min-h-24 items-center justify-center">
      <RefreshCw className="h-5 w-5 animate-spin text-cyan-400" />
    </div>
  );
}

/* =========================
   ATTENDANCE CALCULATION
========================= */

function calculateAttendance(
  records
) {
  if (!records.length) {
    return 0;
  }

  let present = 0;
  let total = 0;

  records.forEach(
    (record) => {
      const status =
        String(
          record.status ||
            ""
        ).toLowerCase();

      if (
        status === "present" ||
        status === "p"
      ) {
        present += 1;
        total += 1;
      } else if (
        status === "absent" ||
        status === "a"
      ) {
        total += 1;
      } else if (
        record.present !==
        undefined
      ) {
        total += 1;

        if (record.present) {
          present += 1;
        }
      }
    }
  );

  return total > 0
    ? (present / total) *
        100
    : 0;
}

/* =========================
   DATE
========================= */

function formatDate(value) {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Unknown date";
  }

  return date.toLocaleDateString(
    [],
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

export default MenteeDashboard;