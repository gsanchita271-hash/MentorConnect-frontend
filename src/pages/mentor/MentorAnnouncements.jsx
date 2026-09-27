import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  Check,
  Edit3,
  Loader2,
  Megaphone,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import DashboardLayout from "../../components/common/Sidebar";
import {
  apiGet,
  apiPost,
  apiPatch,
  apiDelete,
} from "../../services/api";

/* ----------------------------- Helpers ----------------------------- */

const safeArray = (value) =>
  Array.isArray(value) ? value : [];

const getId = (item) => {
  if (!item) return "";
  return item._id || item.id || "";
};

const getName = (item) => {
  if (!item) return "Unknown mentee";

  if (typeof item === "string") {
    return "Unknown mentee";
  }

  return item.name || "Unknown mentee";
};

const extractMentees = (response) => {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.mentees)) {
    return response.mentees;
  }

  if (Array.isArray(response?.users)) {
    return response.users;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

const extractAnnouncements = (response) => {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.announcements)) {
    return response.announcements;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const toDateInput = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().split("T")[0];
};

const emptyForm = {
  mentees: [],
  title: "",
  message: "",
  priority: "Normal",
  publishDate: "",
};

/* -------------------------- Main Component ------------------------- */

function MentorAnnouncements() {
  const [announcements, setAnnouncements] =
    useState([]);

  const [mentees, setMentees] = useState([]);

  const [form, setForm] = useState(emptyForm);

  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] =
    useState("All");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] =
    useState(null);

  const [showForm, setShowForm] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* --------------------------- Load Data --------------------------- */

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        announcementsResponse,
        menteesResponse,
      ] = await Promise.all([
        apiGet(
          "/announcements/my-announcements"
        ),
        apiGet("/auth/my-mentees"),
      ]);

      setAnnouncements(
        extractAnnouncements(
          announcementsResponse
        )
      );

      setMentees(
        extractMentees(menteesResponse)
      );
    } catch (err) {
      console.error(
        "Announcements load error:",
        err
      );

      setAnnouncements([]);
      setMentees([]);

      setError(
        err?.message ||
          "Unable to load announcements."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ---------------------------- Filtering --------------------------- */

  const filteredAnnouncements = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();

    return safeArray(announcements).filter(
      (announcement) => {
        const title =
          announcement?.title
            ?.toLowerCase() || "";

        const announcementMessage =
          announcement?.message
            ?.toLowerCase() || "";

        const priority =
          announcement?.priority || "";

        const matchesSearch =
          !value ||
          title.includes(value) ||
          announcementMessage.includes(value);

        const matchesPriority =
          priorityFilter === "All" ||
          priority === priorityFilter;

        return (
          matchesSearch &&
          matchesPriority
        );
      }
    );
  }, [
    announcements,
    search,
    priorityFilter,
  ]);

  /* -------------------------- Form Handlers ------------------------- */

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const openCreateForm = () => {
    setMessage("");
    setError("");

    setForm({
      ...emptyForm,
      publishDate: new Date()
        .toISOString()
        .split("T")[0],
    });

    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (announcement) => {
    setMessage("");
    setError("");

    const selectedMentees = safeArray(
      announcement?.mentees
    )
      .map((mentee) => getId(mentee))
      .filter(Boolean);

    setForm({
      mentees: selectedMentees,
      title: announcement?.title || "",
      message: announcement?.message || "",
      priority:
        announcement?.priority || "Normal",
      publishDate: toDateInput(
        announcement?.publishDate
      ),
    });

    setEditingId(
      getId(announcement) || null
    );

    setShowForm(true);
  };

  const handleInputChange = (
    event
  ) => {
    const { name, value } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const toggleMentee = (menteeId) => {
    if (!menteeId) return;

    setForm((previous) => {
      const exists =
        previous.mentees.includes(
          menteeId
        );

      return {
        ...previous,
        mentees: exists
          ? previous.mentees.filter(
              (id) => id !== menteeId
            )
          : [
              ...previous.mentees,
              menteeId,
            ],
      };
    });
  };

  const selectAllMentees = () => {
    const ids = safeArray(mentees)
      .map(getId)
      .filter(Boolean);

    setForm((previous) => ({
      ...previous,
      mentees: ids,
    }));
  };

  const clearAllMentees = () => {
    setForm((previous) => ({
      ...previous,
      mentees: [],
    }));
  };

  /* ----------------------------- Save ----------------------------- */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    const title = form.title.trim();
    const announcementMessage =
      form.message.trim();

    if (!title) {
      setError("Title is required.");
      return;
    }

    if (!announcementMessage) {
      setError("Message is required.");
      return;
    }

    if (form.mentees.length === 0) {
      setError(
        "Please select at least one mentee."
      );
      return;
    }

    if (
      ![
        "Normal",
        "Important",
        "Urgent",
      ].includes(form.priority)
    ) {
      setError("Invalid priority.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        mentees: form.mentees,
        title,
        message: announcementMessage,
        priority: form.priority,
        publishDate:
          form.publishDate ||
          new Date().toISOString(),
      };

      if (editingId) {
        const response =
          await apiPatch(
            `/announcements/${editingId}`,
            payload
          );

        const updated =
          response?.announcement;

        if (updated) {
          setAnnouncements((previous) =>
            safeArray(previous).map(
              (item) =>
                getId(item) === editingId
                  ? updated
                  : item
            )
          );
        } else {
          await loadData();
        }

        setMessage(
          response?.message ||
            "Announcement updated successfully."
        );
      } else {
        const response =
          await apiPost(
            "/announcements",
            payload
          );

        const created =
          response?.announcement;

        if (created) {
          setAnnouncements((previous) => [
            created,
            ...safeArray(previous),
          ]);
        } else {
          await loadData();
        }

        setMessage(
          response?.message ||
            "Announcement created successfully."
        );
      }

      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      console.error(
        "Save announcement error:",
        err
      );

      setError(
        err?.message ||
          "Failed to save announcement."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ----------------------------- Delete ----------------------------- */

  const handleDelete = async (
    announcementId
  ) => {
    if (!announcementId) {
      setError(
        "Announcement ID is missing."
      );
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this announcement?"
      );

    if (!confirmed) return;

    try {
      setDeletingId(announcementId);
      setError("");
      setMessage("");

      const response =
        await apiDelete(
          `/announcements/${announcementId}`
        );

      setAnnouncements((previous) =>
        safeArray(previous).filter(
          (item) =>
            getId(item) !==
            announcementId
        )
      );

      setMessage(
        response?.message ||
          "Announcement deleted successfully."
      );
    } catch (err) {
      console.error(
        "Delete announcement error:",
        err
      );

      setError(
        err?.message ||
          "Failed to delete announcement."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* ------------------------------ UI ------------------------------ */

  return (
    <DashboardLayout
      title="Announcements"
      subtitle="Create and manage announcements for your mentees"
    >
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10">
              <Megaphone className="h-6 w-6 text-cyan-400" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white">
                Announcements
              </h1>

              <p className="text-sm text-slate-400">
                Send important updates to your
                mentees.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            <Plus className="h-4 w-4" />
            New Announcement
          </button>
        </div>

        {/* ALERTS */}
        {message && (
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* FORM */}
        {showForm && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl sm:p-6">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {editingId
                    ? "Edit Announcement"
                    : "Create Announcement"}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Select mentees who should receive
                  this announcement.
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* MENTEES */}
              <div>
                <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <label className="text-sm font-medium text-slate-300">
                    Select Mentees
                  </label>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={selectAllMentees}
                      className="text-xs text-cyan-400 hover:text-cyan-300"
                    >
                      Select All
                    </button>

                    <button
                      type="button"
                      onClick={clearAllMentees}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-700 bg-slate-950 p-3">
                  {mentees.length === 0 ? (
                    <p className="py-6 text-center text-sm text-slate-500">
                      No assigned mentees found.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {mentees.map(
                        (mentee) => {
                          const id =
                            getId(mentee);

                          if (!id) return null;

                          const selected =
                            form.mentees.includes(
                              id
                            );

                          return (
                            <button
                              type="button"
                              key={id}
                              onClick={() =>
                                toggleMentee(
                                  id
                                )
                              }
                              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                                selected
                                  ? "border-cyan-400/40 bg-cyan-400/10"
                                  : "border-slate-800 bg-slate-900 hover:border-slate-700"
                              }`}
                            >
                              <div
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                                  selected
                                    ? "border-cyan-400 bg-cyan-400 text-slate-950"
                                    : "border-slate-600"
                                }`}
                              >
                                {selected && (
                                  <Check className="h-3.5 w-3.5" />
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-white">
                                  {getName(
                                    mentee
                                  )}
                                </p>

                                <p className="truncate text-xs text-slate-500">
                                  {mentee?.email ||
                                    mentee?.rollNumber ||
                                    "Mentee"}
                                </p>
                              </div>
                            </button>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  {form.mentees.length} mentee
                  {form.mentees.length === 1
                    ? ""
                    : "s"} selected
                </p>
              </div>

              {/* TITLE */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleInputChange}
                  placeholder="Enter announcement title"
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 disabled:opacity-60"
                />
              </div>

              {/* MESSAGE */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Message
                </label>

                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleInputChange}
                  placeholder="Write your announcement..."
                  rows={5}
                  disabled={saving}
                  className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 disabled:opacity-60"
                />
              </div>

              {/* PRIORITY + DATE */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Priority
                  </label>

                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleInputChange}
                    disabled={saving}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400 disabled:opacity-60"
                  >
                    <option value="Normal">
                      Normal
                    </option>

                    <option value="Important">
                      Important
                    </option>

                    <option value="Urgent">
                      Urgent
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Publish Date
                  </label>

                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                    <input
                      type="date"
                      name="publishDate"
                      value={form.publishDate}
                      onChange={handleInputChange}
                      disabled={saving}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-cyan-400 disabled:opacity-60"
                    />
                  </div>
                </div>
              </div>

              {/* BUTTONS */}
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="rounded-xl border border-slate-700 px-5 py-3 font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      {editingId
                        ? "Update Announcement"
                        : "Publish Announcement"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* SEARCH + FILTER */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search announcements..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-9 pr-4 text-sm text-white outline-none focus:border-cyan-400"
              />
            </div>

            <select
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(
                  event.target.value
                )
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400 lg:w-44"
            >
              <option value="All">
                All Priorities
              </option>

              <option value="Normal">
                Normal
              </option>

              <option value="Important">
                Important
              </option>

              <option value="Urgent">
                Urgent
              </option>
            </select>
          </div>
        </section>

        {/* LIST */}
        {loading ? (
          <div className="flex min-h-60 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900">
            <Loader2 className="h-7 w-7 animate-spin text-cyan-400" />
          </div>
        ) : filteredAnnouncements.length ===
          0 ? (
          <div className="flex min-h-60 flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 px-5 text-center">
            <Bell className="mb-3 h-10 w-10 text-slate-600" />

            <p className="font-medium text-slate-300">
              No announcements found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Create an announcement to keep your
              mentees informed.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {filteredAnnouncements.map(
              (announcement, index) => {
                const id =
                  getId(announcement) ||
                  `announcement-${index}`;

                return (
                  <AnnouncementCard
                    key={id}
                    announcement={announcement}
                    deleting={
                      deletingId === id
                    }
                    onEdit={() =>
                      openEditForm(
                        announcement
                      )
                    }
                    onDelete={() =>
                      handleDelete(id)
                    }
                  />
                );
              }
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

/* --------------------------- Card --------------------------- */

function AnnouncementCard({
  announcement,
  deleting,
  onEdit,
  onDelete,
}) {
  const priority =
    announcement?.priority || "Normal";

  const priorityClass =
    priority === "Urgent"
      ? "bg-red-400/10 text-red-300 border-red-400/20"
      : priority === "Important"
      ? "bg-amber-400/10 text-amber-300 border-amber-400/20"
      : "bg-cyan-400/10 text-cyan-300 border-cyan-400/20";

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl transition hover:border-slate-700">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10">
            <Megaphone className="h-5 w-5 text-cyan-400" />
          </div>

          <div className="min-w-0">
            <h3 className="break-words font-semibold text-white">
              {announcement?.title ||
                "Untitled announcement"}
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              {formatDate(
                announcement?.publishDate
              )}
            </p>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityClass}`}
        >
          {priority}
        </span>
      </div>

      <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">
        {announcement?.message ||
          "No message available."}
      </p>

      <div className="mt-5 border-t border-slate-800 pt-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <UserRound className="h-4 w-4" />

          <span>
            Sent to{" "}
            {safeArray(
              announcement?.mentees
            ).length}{" "}
            mentee
            {safeArray(
              announcement?.mentees
            ).length === 1
              ? ""
              : "s"}
          </span>
        </div>

        {safeArray(
          announcement?.mentees
        ).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {safeArray(
              announcement.mentees
            )
              .slice(0, 5)
              .map((mentee, index) => (
                <span
                  key={
                    getId(mentee) ||
                    index
                  }
                  className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-300"
                >
                  {getName(mentee)}
                </span>
              ))}

            {safeArray(
              announcement.mentees
            ).length > 5 && (
              <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-500">
                +
                {safeArray(
                  announcement.mentees
                ).length - 5}{" "}
                more
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <Edit3 className="h-4 w-4" />
          Edit
        </button>

        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-400/20 px-4 py-2.5 text-sm font-medium text-red-300 hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}

          Delete
        </button>
      </div>
    </article>
  );
}

export default MentorAnnouncements;