import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  ExternalLink,
  Plus,
  Search,
  Users,
  X,
  Video,
  ClipboardList,
} from "lucide-react";

import DashboardLayout from "../../components/common/Sidebar";
import { apiGet, apiPost } from "../../services/api";

const EMPTY_FORM = {
  menteeIds: [],
  title: "",
  agenda: "",
  date: "",
  meetingLink: "",
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function extractArray(response, key) {
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
}

function getId(item) {
  if (!item) return "";
  return String(item._id || item.id || "");
}

function formatDateTime(date) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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

function formatTime(date) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isUpcoming(meeting) {
  if (!meeting?.date) return false;

  const meetingDate = new Date(meeting.date);

  if (Number.isNaN(meetingDate.getTime())) {
    return false;
  }

  return meetingDate >= new Date();
}

function isToday(meeting) {
  if (!meeting?.date) return false;

  const date = new Date(meeting.date);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

export default function MentorMeetings() {
  const [meetings, setMeetings] = useState([]);
  const [mentees, setMentees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingMentees, setLoadingMentees] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const [selectedMeeting, setSelectedMeeting] =
    useState(null);
  const [showDetails, setShowDetails] = useState(false);

  /* ------------------------------------------------------------------------ */
  /* API                                                                      */
  /* ------------------------------------------------------------------------ */

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiGet(
        "/meetings/my-meetings"
      );

      setMeetings(
        extractArray(response, "meetings")
      );
    } catch (err) {
      setError(
        err?.message || "Failed to load meetings."
      );
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMentees = async () => {
    try {
      setLoadingMentees(true);

      const response = await apiGet(
        "/auth/my-mentees"
      );

      setMentees(
        extractArray(response, "mentees")
      );
    } catch (err) {
      setError(
        err?.message ||
          "Failed to load your assigned mentees."
      );
      setMentees([]);
    } finally {
      setLoadingMentees(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
    fetchMentees();
  }, []);

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      setSuccess("");
    }, 3500);

    return () => clearTimeout(timer);
  }, [success]);

  /* ------------------------------------------------------------------------ */
  /* Filtering                                                                */
  /* ------------------------------------------------------------------------ */

  const filteredMeetings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return meetings.filter((meeting) => {
      const menteeNames = Array.isArray(
        meeting?.mentees
      )
        ? meeting.mentees
            .map((mentee) =>
              typeof mentee === "string"
                ? mentee
                : mentee?.name || ""
            )
            .join(" ")
        : "";

      const matchesSearch =
        !query ||
        String(meeting?.title || "")
          .toLowerCase()
          .includes(query) ||
        String(meeting?.agenda || "")
          .toLowerCase()
          .includes(query) ||
        menteeNames
          .toLowerCase()
          .includes(query);

      const upcoming = isUpcoming(meeting);
      const today = isToday(meeting);

      const matchesFilter =
        filter === "All" ||
        (filter === "Upcoming" && upcoming) ||
        (filter === "Today" && today) ||
        (filter === "Past" && !upcoming);

      return matchesSearch && matchesFilter;
    });
  }, [meetings, search, filter]);

  const stats = useMemo(() => {
    const total = meetings.length;

    const upcoming = meetings.filter(
      isUpcoming
    ).length;

    const today = meetings.filter(
      isToday
    ).length;

    const past = meetings.filter(
      (meeting) => !isUpcoming(meeting)
    ).length;

    return {
      total,
      upcoming,
      today,
      past,
    };
  }, [meetings]);

  /* ------------------------------------------------------------------------ */
  /* Form                                                                     */
  /* ------------------------------------------------------------------------ */

  const openCreateModal = () => {
    setForm({ ...EMPTY_FORM, menteeIds: [] });
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setForm({ ...EMPTY_FORM, menteeIds: [] });
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
      const selected =
        previous.menteeIds.includes(menteeId);

      return {
        ...previous,
        menteeIds: selected
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
      return "Meeting title is required.";
    }

    if (!form.date) {
      return "Meeting date and time are required.";
    }

    if (!form.meetingLink.trim()) {
      return "Meeting link is required.";
    }

    const meetingDate = new Date(form.date);

    if (Number.isNaN(meetingDate.getTime())) {
      return "Please select a valid date and time.";
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
        agenda: form.agenda.trim(),
        date: form.date,
        meetingLink: form.meetingLink.trim(),
      };

      const response = await apiPost(
        "/meetings/",
        payload
      );

      if (response?.meeting) {
        setMeetings((previous) => [
          ...previous,
          response.meeting,
        ]);
      } else {
        await fetchMeetings();
      }

      setSuccess(
        "Meeting scheduled successfully."
      );

      closeModal();
    } catch (err) {
      setError(
        err?.message ||
          "Failed to schedule the meeting."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Meeting helpers                                                          */
  /* ------------------------------------------------------------------------ */

  const getMenteeNames = (meeting) => {
    if (!Array.isArray(meeting?.mentees)) {
      return "No mentees";
    }

    const names = meeting.mentees
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

  const openDetails = (meeting) => {
    setSelectedMeeting(meeting);
    setShowDetails(true);
  };

  const openMeetingLink = (link) => {
    if (!link) return;

    window.open(
      link,
      "_blank",
      "noopener,noreferrer"
    );
  };

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <DashboardLayout>
      <div className="min-h-full bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">

          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-cyan-400">
                <Video size={20} />

                <span className="text-sm font-medium">
                  Mentor Workspace
                </span>
              </div>

              <h1 className="text-2xl font-bold sm:text-3xl">
                Meetings
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Schedule and manage meetings with your mentees.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              <Plus size={18} />
              Schedule Meeting
            </button>
          </div>

          {/* Alerts */}
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

          {success && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              <span>{success}</span>

              <button
                type="button"
                onClick={() => setSuccess("")}
                className="hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              icon={<CalendarDays size={20} />}
              label="Total"
              value={stats.total}
            />

            <StatCard
              icon={<Clock3 size={20} />}
              label="Upcoming"
              value={stats.upcoming}
            />

            <StatCard
              icon={<Video size={20} />}
              label="Today"
              value={stats.today}
            />

            <StatCard
              icon={<ClipboardList size={20} />}
              label="Past"
              value={stats.past}
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
                  placeholder="Search meetings, agenda or mentees..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-500"
                />
              </div>

              <select
                value={filter}
                onChange={(event) =>
                  setFilter(event.target.value)
                }
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
              >
                <option value="All">
                  All Meetings
                </option>

                <option value="Upcoming">
                  Upcoming
                </option>

                <option value="Today">
                  Today
                </option>

                <option value="Past">
                  Past
                </option>
              </select>
            </div>
          </div>

          {/* Meetings */}
          {loading ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-10 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />

              <p className="mt-4 text-sm text-slate-400">
                Loading meetings...
              </p>
            </div>
          ) : filteredMeetings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
                <Video size={26} />
              </div>

              <h3 className="mt-4 text-lg font-semibold">
                No meetings found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
                {meetings.length === 0
                  ? "Schedule your first meeting with your assigned mentees."
                  : "Try changing your search or filter."}
              </p>

              {meetings.length === 0 && (
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
                >
                  <Plus size={17} />
                  Schedule Meeting
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {filteredMeetings.map((meeting) => (
                <MeetingCard
                  key={
                    getId(meeting) ||
                    `${meeting?.title}-${meeting?.date}`
                  }
                  meeting={meeting}
                  menteeNames={getMenteeNames(
                    meeting
                  )}
                  onView={() =>
                    openDetails(meeting)
                  }
                  onJoin={() =>
                    openMeetingLink(
                      meeting.meetingLink
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Schedule Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-5">
            <div className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">

              <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4 sm:px-6">
                <div>
                  <h2 className="text-lg font-bold sm:text-xl">
                    Schedule Meeting
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Schedule a meeting for one or more assigned mentees.
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
                      Select Mentees
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
                                  <span className="text-xs font-bold">
                                    ✓
                                  </span>
                                )}
                              </span>

                              <span className="min-w-0">
                                <span className="block truncate text-sm font-medium text-white">
                                  {mentee.name ||
                                    "Unnamed mentee"}
                                </span>

                                <span className="block truncate text-xs text-slate-500">
                                  {mentee.email ||
                                    "No email"}
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

                <div className="mt-5 space-y-5">
                  {/* Title */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-200">
                      Meeting Title
                      <span className="ml-1 text-red-400">
                        *
                      </span>
                    </label>

                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="e.g. Monthly Mentoring Session"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500"
                    />
                  </div>

                  {/* Agenda */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-200">
                      Agenda
                    </label>

                    <textarea
                      name="agenda"
                      value={form.agenda}
                      onChange={handleChange}
                      rows={3}
                      placeholder="What will be discussed in this meeting?"
                      className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500"
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-200">
                      Date & Time
                      <span className="ml-1 text-red-400">
                        *
                      </span>
                    </label>

                    <input
                      type="datetime-local"
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Link */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-200">
                      Meeting Link
                      <span className="ml-1 text-red-400">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <Video
                        size={17}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                      />

                      <input
                        type="url"
                        name="meetingLink"
                        value={form.meetingLink}
                        onChange={handleChange}
                        placeholder="https://meet.google.com/..."
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500"
                      />
                    </div>
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

                    Schedule Meeting
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetails && selectedMeeting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-5">
            <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">

              <div className="flex items-start justify-between border-b border-slate-800 p-5 sm:p-6">
                <div className="min-w-0 pr-4">
                  <div className="mb-2 flex flex-wrap gap-2">
                    {isToday(selectedMeeting) && (
                      <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-400">
                        Today
                      </span>
                    )}

                    {isUpcoming(selectedMeeting) ? (
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                        Upcoming
                      </span>
                    ) : (
                      <span className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-400">
                        Past
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl font-bold text-white">
                    {selectedMeeting.title}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowDetails(false)
                  }
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-5 p-5 sm:p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <DetailRow
                    icon={<CalendarDays size={18} />}
                    label="Date"
                    value={formatDate(
                      selectedMeeting.date
                    )}
                  />

                  <DetailRow
                    icon={<Clock3 size={18} />}
                    label="Time"
                    value={formatTime(
                      selectedMeeting.date
                    )}
                  />
                </div>

                <DetailRow
                  icon={<Users size={18} />}
                  label="Mentees"
                  value={getMenteeNames(
                    selectedMeeting
                  )}
                />

                <DetailRow
                  icon={<ClipboardList size={18} />}
                  label="Agenda"
                  value={
                    selectedMeeting.agenda ||
                    "No agenda provided."
                  }
                />

                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex items-start gap-3">
                    <Video
                      size={18}
                      className="mt-0.5 shrink-0 text-cyan-400"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Meeting Link
                      </p>

                      <p className="mt-1 break-all text-sm text-slate-300">
                        {selectedMeeting.meetingLink ||
                          "No meeting link available."}
                      </p>

                      {selectedMeeting.meetingLink && (
                        <button
                          type="button"
                          onClick={() =>
                            openMeetingLink(
                              selectedMeeting.meetingLink
                            )
                          }
                          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
                        >
                          <ExternalLink size={15} />
                          Open Meeting
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

/* -------------------------------------------------------------------------- */
/* UI Components                                                              */
/* -------------------------------------------------------------------------- */

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

function MeetingCard({
  meeting,
  menteeNames,
  onView,
  onJoin,
}) {
  const upcoming = isUpcoming(meeting);
  const today = isToday(meeting);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-slate-700">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap gap-2">
            {today && (
              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-400">
                Today
              </span>
            )}

            {upcoming ? (
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                Upcoming
              </span>
            ) : (
              <span className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-400">
                Past
              </span>
            )}
          </div>

          <h3 className="truncate text-lg font-semibold text-white">
            {meeting.title || "Untitled Meeting"}
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

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CalendarDays size={14} />
            Date
          </div>

          <p className="mt-1 text-sm text-slate-300">
            {formatDate(meeting.date)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock3 size={14} />
            Time
          </div>

          <p className="mt-1 text-sm text-slate-300">
            {formatTime(meeting.date)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-3">
        <Users
          size={17}
          className="mt-0.5 shrink-0 text-cyan-400"
        />

        <p className="line-clamp-2 text-sm text-slate-300">
          {menteeNames}
        </p>
      </div>

      <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-400">
        {meeting.agenda || "No agenda provided."}
      </p>

      <div className="mt-5 flex flex-col gap-2 border-t border-slate-800 pt-4 sm:flex-row">
        <button
          type="button"
          onClick={onView}
          className="flex-1 rounded-xl border border-slate-700 px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          View Details
        </button>

        {meeting.meetingLink && (
          <button
            type="button"
            onClick={onJoin}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-3 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
          >
            <Video size={15} />
            Open Meeting
          </button>
        )}
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
