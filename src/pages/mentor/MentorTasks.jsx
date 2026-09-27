import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Edit3,
  Plus,
  Search,
  Trash2,
  Users,
  X,
  Target,
  CalendarDays,
  Flag,
  ClipboardList,
} from "lucide-react";

import DashboardLayout from "../../components/common/Sidebar";
import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "../../services/api";

const PRIORITIES = ["Low", "Medium", "High"];

const STATUSES = [
  "Pending",
  "In Progress",
  "Completed",
];

const EMPTY_FORM = {
  menteeIds: [],
  title: "",
  description: "",
  goal: "",
  priority: "Medium",
  startDate: "",
  dueDate: "",
};

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

function toInputDate(date) {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getStatusClasses(status) {
  if (status === "Completed") {
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  }

  if (status === "In Progress") {
    return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
  }

  return "bg-amber-500/10 text-amber-400 border-amber-500/20";
}

function getPriorityClasses(priority) {
  if (priority === "High") {
    return "bg-red-500/10 text-red-400 border-red-500/20";
  }

  if (priority === "Low") {
    return "bg-slate-500/10 text-slate-300 border-slate-500/20";
  }

  return "bg-blue-500/10 text-blue-400 border-blue-500/20";
}

function isOverdue(task) {
  if (!task?.dueDate || task.status === "Completed") {
    return false;
  }

  const due = new Date(task.dueDate);
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  return due < today;
}

export default function MentorTasks() {
  const [tasks, setTasks] = useState([]);
  const [mentees, setMentees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingMentees, setLoadingMentees] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiGet("/tasks/my-tasks");

      setTasks(
        Array.isArray(response?.tasks)
          ? response.tasks
          : []
      );
    } catch (err) {
      setError(err.message || "Failed to load tasks.");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMentees = async () => {
    try {
      setLoadingMentees(true);

      const response = await apiGet("/auth/my-mentees");

      const list = Array.isArray(response?.mentees)
        ? response.mentees
        : Array.isArray(response)
        ? response
        : [];

      setMentees(list);
    } catch (err) {
      setError(
        err.message ||
          "Failed to load your assigned mentees."
      );
      setMentees([]);
    } finally {
      setLoadingMentees(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchMentees();
  }, []);

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      setSuccess("");
    }, 3500);

    return () => clearTimeout(timer);
  }, [success]);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tasks.filter((task) => {
      const menteeNames = Array.isArray(task?.mentees)
        ? task.mentees
            .map((mentee) =>
              typeof mentee === "string"
                ? mentee
                : mentee?.name || ""
            )
            .join(" ")
        : "";

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
        menteeNames.toLowerCase().includes(query);

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

  const openCreateModal = () => {
    setEditingTask(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowModal(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);

    setForm({
      menteeIds: Array.isArray(task?.mentees)
        ? task.mentees
            .map((mentee) => getId(mentee))
            .filter(Boolean)
        : [],
      title: task?.title || "",
      description: task?.description || "",
      goal: task?.goal || "",
      priority: task?.priority || "Medium",
      startDate: toInputDate(task?.startDate),
      dueDate: toInputDate(task?.dueDate),
    });

    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingTask(null);
    setForm(EMPTY_FORM);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const toggleMentee = (menteeId) => {
    setForm((previous) => {
      const alreadySelected =
        previous.menteeIds.includes(menteeId);

      return {
        ...previous,
        menteeIds: alreadySelected
          ? previous.menteeIds.filter(
              (id) => id !== menteeId
            )
          : [...previous.menteeIds, menteeId],
      };
    });
  };

  const selectAllMentees = () => {
    setForm((previous) => ({
      ...previous,
      menteeIds: mentees
        .map(getId)
        .filter(Boolean),
    }));
  };

  const clearAllMentees = () => {
    setForm((previous) => ({
      ...previous,
      menteeIds: [],
    }));
  };

  const validateForm = () => {
    if (form.menteeIds.length === 0) {
      return "Please select at least one mentee.";
    }

    if (!form.title.trim()) {
      return "Task title is required.";
    }

    if (!form.startDate) {
      return "Start date is required.";
    }

    if (!form.dueDate) {
      return "Due date is required.";
    }

    if (
      new Date(form.dueDate) <
      new Date(form.startDate)
    ) {
      return "Due date cannot be before start date.";
    }

    if (!PRIORITIES.includes(form.priority)) {
      return "Please select a valid priority.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        menteeIds: form.menteeIds,
        title: form.title.trim(),
        description: form.description.trim(),
        goal: form.goal.trim(),
        priority: form.priority,
        startDate: form.startDate,
        dueDate: form.dueDate,
      };

      if (editingTask) {
        const response = await apiPatch(
          `/tasks/${getId(editingTask)}`,
          payload
        );

        const updatedTask = response?.task;

        setTasks((previous) =>
          previous.map((task) =>
            getId(task) === getId(editingTask)
              ? updatedTask || {
                  ...task,
                  ...payload,
                }
              : task
          )
        );

        setSuccess("Task updated successfully.");
      } else {
        const response = await apiPost(
          "/tasks/",
          payload
        );

        if (response?.task) {
          setTasks((previous) => [
            ...previous,
            response.task,
          ]);
        } else {
          await fetchTasks();
        }

        setSuccess("Task created successfully.");
      }

      closeModal();
    } catch (err) {
      setError(
        err.message ||
          "Something went wrong while saving the task."
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTaskId) return;

    try {
      setDeleting(true);
      setError("");

      await apiDelete(
        `/tasks/${deleteTaskId}`
      );

      setTasks((previous) =>
        previous.filter(
          (task) => getId(task) !== deleteTaskId
        )
      );

      if (
        selectedTask &&
        getId(selectedTask) === deleteTaskId
      ) {
        setSelectedTask(null);
        setShowDetails(false);
      }

      setDeleteTaskId(null);
      setSuccess("Task deleted successfully.");
    } catch (err) {
      setError(
        err.message ||
          "Failed to delete the task."
      );
    } finally {
      setDeleting(false);
    }
  };

  const openDetails = async (task) => {
    try {
      setSelectedTask(task);
      setShowDetails(true);

      const response = await apiGet(
        `/tasks/${getId(task)}`
      );

      if (response?.task) {
        setSelectedTask(response.task);
      }
    } catch {
      // Keep the already loaded task visible.
    }
  };

  const getMenteeNames = (task) => {
    if (!Array.isArray(task?.mentees)) {
      return "No mentees";
    }

    const names = task.mentees
      .map((mentee) =>
        typeof mentee === "string"
          ? mentee
          : mentee?.name
      )
      .filter(Boolean);

    return names.length
      ? names.join(", ")
      : "No mentees";
  };

  return (
    <DashboardLayout>
      <div className="min-h-full bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">

          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-cyan-400">
                <ClipboardList size={20} />
                <span className="text-sm font-medium">
                  Mentor Workspace
                </span>
              </div>

              <h1 className="text-2xl font-bold sm:text-3xl">
                Tasks
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Create, assign and manage tasks for your mentees.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              <Plus size={18} />
              Create Task
            </button>
          </div>

          {/* Alerts */}
          {error && (
            <div className="flex items-start justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <span>{error}</span>

              <button
                type="button"
                onClick={() => setError("")}
                className="shrink-0 text-red-300 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {success && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              <span>{success}</span>

              <button
                type="button"
                onClick={() => setSuccess("")}
                className="text-emerald-300 hover:text-white"
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
                  placeholder="Search tasks, goals or mentees..."
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

          {/* Task list */}
          {loading ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-10 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />

              <p className="mt-4 text-sm text-slate-400">
                Loading tasks...
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
                  ? "Create your first task and assign it to one or more mentees."
                  : "Try changing your search or filters."}
              </p>

              {tasks.length === 0 && (
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
                >
                  <Plus size={17} />
                  Create Task
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={getId(task)}
                  task={task}
                  menteeNames={getMenteeNames(task)}
                  onView={() => openDetails(task)}
                  onEdit={() => openEditModal(task)}
                  onDelete={() =>
                    setDeleteTaskId(getId(task))
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-5">
            <div className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4 sm:px-6">
                <div>
                  <h2 className="text-lg font-bold sm:text-xl">
                    {editingTask
                      ? "Edit Task"
                      : "Create Task"}
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Assign a task to one or more of your mentees.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="overflow-y-auto p-5 sm:p-6"
              >
                {/* Mentees */}
                <div>
                  <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <label className="text-sm font-medium text-slate-200">
                      Assign Mentees
                      <span className="ml-1 text-red-400">
                        *
                      </span>
                    </label>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={selectAllMentees}
                        disabled={loadingMentees}
                        className="text-xs font-medium text-cyan-400 hover:text-cyan-300 disabled:opacity-50"
                      >
                        Select All
                      </button>

                      <span className="text-slate-700">
                        |
                      </span>

                      <button
                        type="button"
                        onClick={clearAllMentees}
                        className="text-xs font-medium text-slate-400 hover:text-white"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-700 bg-slate-950 p-2">
                    {loadingMentees ? (
                      <p className="p-4 text-center text-sm text-slate-500">
                        Loading mentees...
                      </p>
                    ) : mentees.length === 0 ? (
                      <p className="p-4 text-center text-sm text-slate-500">
                        No approved mentees are assigned to you.
                      </p>
                    ) : (
                      <div className="space-y-1">
                        {mentees.map((mentee) => {
                          const id = getId(mentee);
                          const selected =
                            form.menteeIds.includes(id);

                          return (
                            <button
                              type="button"
                              key={id}
                              onClick={() =>
                                toggleMentee(id)
                              }
                              className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition ${
                                selected
                                  ? "bg-cyan-500/10 ring-1 ring-cyan-500/30"
                                  : "hover:bg-slate-800"
                              }`}
                            >
                              <span
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                                  selected
                                    ? "border-cyan-400 bg-cyan-500 text-slate-950"
                                    : "border-slate-600 bg-slate-900"
                                }`}
                              >
                                {selected && (
                                  <CheckCircle2
                                    size={14}
                                  />
                                )}
                              </span>

                              <span className="min-w-0">
                                <span className="block truncate text-sm font-medium text-white">
                                  {mentee.name ||
                                    "Unnamed mentee"}
                                </span>

                                <span className="block truncate text-xs text-slate-500">
                                  {mentee.email || "No email"}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {form.menteeIds.length > 0 && (
                    <p className="mt-2 text-xs text-cyan-400">
                      {form.menteeIds.length} mentee
                      {form.menteeIds.length !== 1
                        ? "s"
                        : ""}{" "}
                      selected
                    </p>
                  )}
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  {/* Title */}
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-200">
                      Task Title
                      <span className="ml-1 text-red-400">
                        *
                      </span>
                    </label>

                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="e.g. Complete React assignment"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500"
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-200">
                      Description
                    </label>

                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Describe what the mentee needs to do..."
                      className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500"
                    />
                  </div>

                  {/* Goal */}
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-200">
                      Goal
                    </label>

                    <input
                      type="text"
                      name="goal"
                      value={form.goal}
                      onChange={handleChange}
                      placeholder="e.g. Improve JavaScript fundamentals"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500"
                    />
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-200">
                      Priority
                    </label>

                    <select
                      name="priority"
                      value={form.priority}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                    >
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

                  {/* Start */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-200">
                      Start Date
                      <span className="ml-1 text-red-400">
                        *
                      </span>
                    </label>

                    <input
                      type="date"
                      name="startDate"
                      value={form.startDate}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Due */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-200">
                      Due Date
                      <span className="ml-1 text-red-400">
                        *
                      </span>
                    </label>

                    <input
                      type="date"
                      name="dueDate"
                      value={form.dueDate}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {error && (
                  <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                    className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving && (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                    )}

                    {editingTask
                      ? "Update Task"
                      : "Create Task"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
                      {selectedTask.priority || "Medium"}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-white">
                    {selectedTask.title}
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
                <DetailRow
                  icon={<Users size={18} />}
                  label="Assigned Mentees"
                  value={getMenteeNames(selectedTask)}
                />

                <DetailRow
                  icon={<Target size={18} />}
                  label="Goal"
                  value={
                    selectedTask.goal ||
                    "No goal added."
                  }
                />

                <DetailRow
                  icon={<ClipboardList size={18} />}
                  label="Description"
                  value={
                    selectedTask.description ||
                    "No description added."
                  }
                />

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

                {isOverdue(selectedTask) && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    This task is overdue.
                  </div>
                )}

                <div className="flex flex-col gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDetails(false);
                      openEditModal(selectedTask);
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-slate-800"
                  >
                    <Edit3 size={16} />
                    Edit Task
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowDetails(false);
                      setDeleteTaskId(
                        getId(selectedTask)
                      );
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {deleteTaskId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                <Trash2 size={22} />
              </div>

              <h2 className="mt-4 text-center text-lg font-bold">
                Delete Task?
              </h2>

              <p className="mt-2 text-center text-sm leading-6 text-slate-400">
                This task will be permanently deleted.
                This action cannot be undone.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setDeleteTaskId(null)}
                  disabled={deleting}
                  className="flex-1 rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white hover:bg-red-400 disabled:opacity-60"
                >
                  {deleting && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  )}

                  Delete
                </button>
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
  menteeNames,
  onView,
  onEdit,
  onDelete,
}) {
  const overdue = isOverdue(task);

  return (
    <div className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-slate-700">
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

      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-400">
        {task.description ||
          "No description provided."}
      </p>

      <div className="mt-4 space-y-3">
        <div className="flex items-start gap-3 text-sm">
          <Users
            size={17}
            className="mt-0.5 shrink-0 text-cyan-400"
          />

          <span className="line-clamp-2 text-slate-300">
            {menteeNames}
          </span>
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={14} />
            Start: {formatDate(task.startDate)}
          </span>

          <span
            className={`inline-flex items-center gap-1.5 ${
              overdue ? "text-red-400" : ""
            }`}
          >
            <CalendarDays size={14} />
            Due: {formatDate(task.dueDate)}
          </span>
        </div>
      </div>

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

      <div className="mt-5 flex flex-col gap-2 border-t border-slate-800 pt-4 sm:flex-row">
        <button
          type="button"
          onClick={onView}
          className="flex-1 rounded-xl border border-slate-700 px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          View
        </button>

        <button
          type="button"
          onClick={onEdit}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-cyan-500/20 px-3 py-2.5 text-sm font-medium text-cyan-400 hover:bg-cyan-500/10"
        >
          <Edit3 size={15} />
          Edit
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/20 px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10"
        >
          <Trash2 size={15} />
          Delete
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

