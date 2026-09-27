import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  ClipboardList,
  Flag,
  Search,
  Target,
  Users,
  X,
} from "lucide-react";

import DashboardLayout from "../../components/common/Sidebar";
import { apiGet } from "../../services/api";

const STATUSES = [
  "Pending",
  "In Progress",
  "Completed",
];

const PRIORITIES = [
  "Low",
  "Medium",
  "High",
];

function getId(item) {
  if (!item) return "";
  return String(item._id || item.id || "");
}

function formatDate(date) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusClasses(status) {
  if (status === "Completed") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
  }

  if (status === "In Progress") {
    return "border-cyan-500/20 bg-cyan-500/10 text-cyan-400";
  }

  return "border-amber-500/20 bg-amber-500/10 text-amber-400";
}

function getPriorityClasses(priority) {
  if (priority === "High") {
    return "border-red-500/20 bg-red-500/10 text-red-400";
  }

  if (priority === "Low") {
    return "border-slate-600 bg-slate-800/60 text-slate-300";
  }

  return "border-blue-500/20 bg-blue-500/10 text-blue-400";
}

function isOverdue(task) {
  if (!task?.dueDate || task.status === "Completed") {
    return false;
  }

  const due = new Date(task.dueDate);
  const today = new Date();

  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return due < today;
}

function getDaysRemaining(task) {
  if (!task?.dueDate || task.status === "Completed") {
    return null;
  }

  const due = new Date(task.dueDate);
  const today = new Date();

  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const difference =
    due.getTime() - today.getTime();

  return Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );
}

export default function MenteeTasks() {
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiGet(
        "/tasks/mentee-tasks"
      );

      setTasks(
        Array.isArray(response?.tasks)
          ? response.tasks
          : []
      );
    } catch (err) {
      setError(
        err.message ||
          "Failed to load your tasks."
      );
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tasks.filter((task) => {
      const mentorName =
        typeof task?.mentor === "string"
          ? task.mentor
          : task?.mentor?.name || "";

      const matchesSearch =
        !query ||
        String(task?.title || "")
          .toLowerCase()
          .includes(query) ||
        String(task?.description || "")
          .toLowerCase()
          .includes(query) ||
        String(task?.goal || "")
          .toLowerCase()
          .includes(query) ||
        mentorName.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        task?.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" ||
        task?.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    tasks,
    search,
    statusFilter,
    priorityFilter,
  ]);

  const stats = useMemo(() => {
    const total = tasks.length;

    const pending = tasks.filter(
      (task) => task.status === "Pending"
    ).length;

    const inProgress = tasks.filter(
      (task) => task.status === "In Progress"
    ).length;

    const completed = tasks.filter(
      (task) => task.status === "Completed"
    ).length;

    const overdue = tasks.filter(isOverdue).length;

    return {
      total,
      pending,
      inProgress,
      completed,
      overdue,
    };
  }, [tasks]);

  const openDetails = (task) => {
    setSelectedTask(task);
    setShowDetails(true);
  };

  const getMentorName = (task) => {
    if (!task?.mentor) {
      return "Mentor not available";
    }

    if (typeof task.mentor === "string") {
      return "Mentor";
    }

    return task.mentor.name || "Mentor";
  };

  const getMentorDetails = (task) => {
    if (
      !task?.mentor ||
      typeof task.mentor === "string"
    ) {
      return "";
    }

    const details = [
      task.mentor.designation,
      task.mentor.department,
    ].filter(Boolean);

    return details.join(" • ");
  };

  return (
    <DashboardLayout>
      <div className="min-h-full bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">

          {/* Header */}
          <div>
            <div className="mb-2 flex items-center gap-2 text-cyan-400">
              <ClipboardList size={20} />

              <span className="text-sm font-medium">
                Mentee Workspace
              </span>
            </div>

            <h1 className="text-2xl font-bold sm:text-3xl">
              My Tasks
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              View and keep track of tasks assigned by your mentor.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <span>{error}</span>

              <button
                type="button"
                onClick={() => setError("")}
                className="shrink-0 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard
              icon={<ClipboardList size={20} />}
              label="Total"
              value={stats.total}
            />

            <StatCard
              icon={<Clock3 size={20} />}
              label="Pending"
              value={stats.pending}
            />

            <StatCard
              icon={<Target size={20} />}
              label="In Progress"
              value={stats.inProgress}
            />

            <StatCard
              icon={<CheckCircle2 size={20} />}
              label="Completed"
              value={stats.completed}
            />

            <StatCard
              icon={<CalendarDays size={20} />}
              label="Overdue"
              value={stats.overdue}
            />
          </div>

          {/* Filters */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search tasks, goals or mentor..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
              >
                <option value="All">
                  All Status
                </option>

                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <select
                value={priorityFilter}
                onChange={(event) =>
                  setPriorityFilter(event.target.value)
                }
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
              >
                <option value="All">
                  All Priority
                </option>

                {PRIORITIES.map((priority) => (
                  <option
                    key={priority}
                    value={priority}
                  >
                    {priority}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tasks */}
          {loading ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-10 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />

              <p className="mt-4 text-sm text-slate-400">
                Loading your tasks...
              </p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
                <ClipboardList size={26} />
              </div>

              <h3 className="mt-4 text-lg font-semibold">
                No tasks found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
                {tasks.length === 0
                  ? "Your assigned tasks will appear here when your mentor creates them."
                  : "Try changing your search or filters."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={getId(task)}
                  task={task}
                  mentorName={getMentorName(task)}
                  mentorDetails={getMentorDetails(task)}
                  onView={() => openDetails(task)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Details Modal */}
        {showDetails && selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-5">
            <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">

              <div className="flex items-start justify-between border-b border-slate-800 p-5 sm:p-6">
                <div className="min-w-0 pr-4">
                  <div className="mb-2 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                        selectedTask.status
                      )}`}
                    >
                      {selectedTask.status || "Pending"}
                    </span>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getPriorityClasses(
                        selectedTask.priority
                      )}`}
                    >
                      <span className="inline-flex items-center gap-1">
                        <Flag size={11} />
                        {selectedTask.priority ||
                          "Medium"}
                      </span>
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-white">
                    {selectedTask.title ||
                      "Untitled Task"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setShowDetails(false)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-5 p-5 sm:p-6">

                {/* Mentor */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                      <Users size={19} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Assigned By
                      </p>

                      <p className="mt-1 text-sm font-semibold text-white">
                        {getMentorName(
                          selectedTask
                        )}
                      </p>

                      {getMentorDetails(
                        selectedTask
                      ) && (
                        <p className="mt-1 text-xs text-slate-500">
                          {getMentorDetails(
                            selectedTask
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Goal */}
                <DetailRow
                  icon={<Target size={18} />}
                  label="Goal"
                  value={
                    selectedTask.goal ||
                    "No goal added."
                  }
                />

                {/* Description */}
                <DetailRow
                  icon={<ClipboardList size={18} />}
                  label="Description"
                  value={
                    selectedTask.description ||
                    "No description provided."
                  }
                />

                {/* Dates */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <DetailRow
                    icon={<CalendarDays size={18} />}
                    label="Start Date"
                    value={formatDate(
                      selectedTask.startDate
                    )}
                  />

                  <DetailRow
                    icon={<CalendarDays size={18} />}
                    label="Due Date"
                    value={formatDate(
                      selectedTask.dueDate
                    )}
                  />
                </div>

                {/* Remaining */}
                {selectedTask.status !==
                  "Completed" && (
                  <RemainingMessage
                    task={selectedTask}
                  />
                )}

                <div className="rounded-xl border border-cyan-500/10 bg-cyan-500/5 px-4 py-3 text-sm text-slate-400">
                  <span className="font-medium text-cyan-400">
                    Note:
                  </span>{" "}
                  Task progress can be updated by your mentor.
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="truncate text-xs text-slate-500">
            {label}
          </p>

          <p className="mt-0.5 text-xl font-bold text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function TaskCard({
  task,
  mentorName,
  mentorDetails,
  onView,
}) {
  const overdue = isOverdue(task);
  const daysRemaining = getDaysRemaining(task);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-slate-700">

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap gap-2">
            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                task.status
              )}`}
            >
              {task.status || "Pending"}
            </span>

            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getPriorityClasses(
                task.priority
              )}`}
            >
              <span className="inline-flex items-center gap-1">
                <Flag size={11} />
                {task.priority || "Medium"}
              </span>
            </span>
          </div>

          <h3 className="truncate text-lg font-semibold text-white">
            {task.title || "Untitled Task"}
          </h3>
        </div>

        <button
          type="button"
          onClick={onView}
          className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-cyan-400"
          title="View details"
        >
          <ClipboardList size={18} />
        </button>
      </div>

      {/* Description */}
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-400">
        {task.description ||
          "No description provided."}
      </p>

      {/* Mentor */}
      <div className="mt-4 flex items-start gap-3">
        <Users
          size={17}
          className="mt-0.5 shrink-0 text-cyan-400"
        />

        <div className="min-w-0">
          <p className="text-xs text-slate-500">
            Assigned by
          </p>

          <p className="truncate text-sm font-medium text-slate-200">
            {mentorName}
          </p>

          {mentorDetails && (
            <p className="truncate text-xs text-slate-500">
              {mentorDetails}
            </p>
          )}
        </div>
      </div>

      {/* Dates */}
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CalendarDays size={14} />
            Start Date
          </div>

          <p className="mt-1 text-sm text-slate-300">
            {formatDate(task.startDate)}
          </p>
        </div>

        <div
          className={`rounded-xl border p-3 ${
            overdue
              ? "border-red-500/20 bg-red-500/5"
              : "border-slate-800 bg-slate-950/60"
          }`}
        >
          <div
            className={`flex items-center gap-2 text-xs ${
              overdue
                ? "text-red-400"
                : "text-slate-500"
            }`}
          >
            <CalendarDays size={14} />
            Due Date
          </div>

          <p
            className={`mt-1 text-sm ${
              overdue
                ? "text-red-300"
                : "text-slate-300"
            }`}
          >
            {formatDate(task.dueDate)}
          </p>
        </div>
      </div>

      {/* Goal */}
      {task.goal && (
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2.5">
          <div className="flex items-start gap-2">
            <Target
              size={15}
              className="mt-0.5 shrink-0 text-cyan-400"
            />

            <p className="line-clamp-2 text-xs text-slate-400">
              <span className="font-medium text-slate-300">
                Goal:
              </span>{" "}
              {task.goal}
            </p>
          </div>
        </div>
      )}

      {/* Due message */}
      {task.status !== "Completed" &&
        daysRemaining !== null && (
          <div
            className={`mt-4 text-xs font-medium ${
              overdue
                ? "text-red-400"
                : daysRemaining === 0
                ? "text-amber-400"
                : "text-slate-500"
            }`}
          >
            {overdue
              ? "This task is overdue."
              : daysRemaining === 0
              ? "Due today."
              : daysRemaining === 1
              ? "Due tomorrow."
              : `${daysRemaining} days remaining.`}
          </div>
        )}

      {/* Action */}
      <div className="mt-5 border-t border-slate-800 pt-4">
        <button
          type="button"
          onClick={onView}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <ClipboardList size={16} />
          View Task Details
        </button>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0 text-cyan-400">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {label}
          </p>

          <p className="mt-1 break-words text-sm leading-6 text-slate-200">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function RemainingMessage({ task }) {
  const overdue = isOverdue(task);
  const daysRemaining = getDaysRemaining(task);

  if (overdue) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        This task is overdue. Please discuss the status with your mentor.
      </div>
    );
  }

  if (daysRemaining === 0) {
    return (
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
        This task is due today.
      </div>
    );
  }

  if (daysRemaining === 1) {
    return (
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
        This task is due tomorrow.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-cyan-500/10 bg-cyan-500/5 px-4 py-3 text-sm text-cyan-300">
      {daysRemaining} days remaining until the due date.
    </div>
  );
}

