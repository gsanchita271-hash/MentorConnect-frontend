import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  MessageSquareWarning,
  Plus,
  Search,
  Send,
  UserRound,
  X,
} from "lucide-react";

import DashboardLayout from "../../components/common/Sidebar";
import {
  apiGet,
  apiPost,
} from "../../services/api";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const safeArray = (value) =>
  Array.isArray(value) ? value : [];

const getId = (item) => {
  if (!item) return "";
  return item._id || item.id || "";
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

const extractConcerns = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.concerns)) {
    return response.concerns;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

const getStatusClass = (status) => {
  if (status === "Resolved") {
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
  }

  if (status === "In Review") {
    return "border-amber-400/20 bg-amber-400/10 text-amber-300";
  }

  return "border-slate-600 bg-slate-800 text-slate-300";
};

const getPriorityClass = (priority) => {
  if (priority === "High") {
    return "border-red-400/20 bg-red-400/10 text-red-300";
  }

  if (priority === "Medium") {
    return "border-amber-400/20 bg-amber-400/10 text-amber-300";
  }

  return "border-cyan-400/20 bg-cyan-400/10 text-cyan-300";
};

const emptyForm = {
  title: "",
  description: "",
  category: "Other",
  priority: "Medium",
};

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

function MenteeConcerns() {
  const [concerns, setConcerns] = useState([]);

  const [showForm, setShowForm] =
    useState(false);

  const [selectedConcern, setSelectedConcern] =
    useState(null);

  const [form, setForm] =
    useState(emptyForm);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");
  const [priorityFilter, setPriorityFilter] =
    useState("All");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] =
    useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* ---------------------------------------------------------------------- */
  /* Load concerns                                                          */
  /* ---------------------------------------------------------------------- */

  const loadConcerns = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiGet(
        "/concerns/my-concerns"
      );

      setConcerns(
        extractConcerns(response)
      );
    } catch (err) {
      console.error(
        "Mentee concerns load error:",
        err
      );

      setConcerns([]);

      setError(
        err?.message ||
          "Unable to load your concerns."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConcerns();
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Filtering                                                              */
  /* ---------------------------------------------------------------------- */

  const filteredConcerns = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();

    return safeArray(concerns).filter(
      (concern) => {
        const title =
          concern?.title
            ?.toLowerCase() || "";

        const description =
          concern?.description
            ?.toLowerCase() || "";

        const category =
          concern?.category
            ?.toLowerCase() || "";

        const status =
          concern?.status || "";

        const priority =
          concern?.priority || "";

        const matchesSearch =
          !value ||
          title.includes(value) ||
          description.includes(value) ||
          category.includes(value);

        const matchesStatus =
          statusFilter === "All" ||
          status === statusFilter;

        const matchesPriority =
          priorityFilter === "All" ||
          priority === priorityFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesPriority
        );
      }
    );
  }, [
    concerns,
    search,
    statusFilter,
    priorityFilter,
  ]);

  /* ---------------------------------------------------------------------- */
  /* Form                                                                   */
  /* ---------------------------------------------------------------------- */

  const resetForm = () => {
    setForm(emptyForm);
    setShowForm(false);
  };

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* ---------------------------------------------------------------------- */
  /* Submit                                                                 */
  /* ---------------------------------------------------------------------- */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    const title = form.title.trim();
    const description =
      form.description.trim();

    if (!title) {
      setError("Please enter a concern title.");
      return;
    }

    if (!description) {
      setError(
        "Please describe your concern."
      );
      return;
    }

    const validCategories = [
      "Academic",
      "Attendance",
      "Personal",
      "Career",
      "Financial",
      "Other",
    ];

    const validPriorities = [
      "Low",
      "Medium",
      "High",
    ];

    if (
      !validCategories.includes(
        form.category
      )
    ) {
      setError("Invalid concern category.");
      return;
    }

    if (
      !validPriorities.includes(
        form.priority
      )
    ) {
      setError("Invalid priority.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await apiPost(
        "/concerns",
        {
          title,
          description,
          category: form.category,
          priority: form.priority,
        }
      );

      const createdConcern =
        response?.concern;

      if (createdConcern) {
        setConcerns((previous) => [
          createdConcern,
          ...safeArray(previous),
        ]);
      } else {
        await loadConcerns();
      }

      setMessage(
        response?.message ||
          "Concern submitted successfully."
      );

      setForm(emptyForm);
      setShowForm(false);
    } catch (err) {
      console.error(
        "Create concern error:",
        err
      );

      setError(
        err?.message ||
          "Failed to submit concern."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Stats                                                                  */
  /* ---------------------------------------------------------------------- */

  const totalCount =
    safeArray(concerns).length;

  const pendingCount =
    safeArray(concerns).filter(
      (item) =>
        item?.status === "Pending"
    ).length;

  const reviewCount =
    safeArray(concerns).filter(
      (item) =>
        item?.status === "In Review"
    ).length;

  const resolvedCount =
    safeArray(concerns).filter(
      (item) =>
        item?.status === "Resolved"
    ).length;

  /* ---------------------------------------------------------------------- */
  /* UI                                                                     */
  /* ---------------------------------------------------------------------- */

  return (
    <DashboardLayout
      title="My Concerns"
      subtitle="Submit and track your concerns"
    >
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10">
              <MessageSquareWarning className="h-6 w-6 text-cyan-400" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white">
                My Concerns
              </h1>

              <p className="text-sm text-slate-400">
                Raise a concern and track your mentor's
                response.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setMessage("");
              setError("");
              setForm(emptyForm);
              setShowForm(true);
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            <Plus className="h-4 w-4" />
            New Concern
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

        {/* STATS */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            icon={MessageSquareWarning}
            label="Total"
            value={totalCount}
          />

          <StatCard
            icon={Clock3}
            label="Pending"
            value={pendingCount}
          />

          <StatCard
            icon={AlertCircle}
            label="In Review"
            value={reviewCount}
          />

          <StatCard
            icon={CheckCircle2}
            label="Resolved"
            value={resolvedCount}
          />
        </div>

        {/* CREATE FORM */}
        {showForm && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl sm:p-6">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Submit New Concern
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Your concern will be sent to your assigned
                  mentor.
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                disabled={submitting}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* TITLE */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Concern Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Example: Attendance issue"
                  disabled={submitting}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400 disabled:opacity-60"
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Explain your concern clearly..."
                  disabled={submitting}
                  className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400 disabled:opacity-60"
                />
              </div>

              {/* CATEGORY + PRIORITY */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Category
                  </label>

                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    disabled={submitting}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400 disabled:opacity-60"
                  >
                    <option value="Academic">
                      Academic
                    </option>

                    <option value="Attendance">
                      Attendance
                    </option>

                    <option value="Personal">
                      Personal
                    </option>

                    <option value="Career">
                      Career
                    </option>

                    <option value="Financial">
                      Financial
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Priority
                  </label>

                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    disabled={submitting}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400 disabled:opacity-60"
                  >
                    <option value="Low">
                      Low
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="High">
                      High
                    </option>
                  </select>
                </div>
              </div>

              {/* BUTTONS */}
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={submitting}
                  className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Concern
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* FILTERS */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_180px_180px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search your concerns..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-9 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
            >
              <option value="All">
                All Status
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="In Review">
                In Review
              </option>

              <option value="Resolved">
                Resolved
              </option>
            </select>

            <select
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(
                  event.target.value
                )
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
            >
              <option value="All">
                All Priority
              </option>

              <option value="Low">
                Low
              </option>

              <option value="Medium">
                Medium
              </option>

              <option value="High">
                High
              </option>
            </select>
          </div>
        </section>

        {/* LIST */}
        {loading ? (
          <div className="flex min-h-60 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900">
            <Loader2 className="h-7 w-7 animate-spin text-cyan-400" />
          </div>
        ) : filteredConcerns.length ===
          0 ? (
          <div className="flex min-h-60 flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 px-5 text-center">
            <MessageSquareWarning className="mb-3 h-10 w-10 text-slate-600" />

            <p className="font-medium text-slate-300">
              No concerns found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Submit a concern if you need help from
              your mentor.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {filteredConcerns.map(
              (concern, index) => {
                const id =
                  getId(concern) ||
                  `concern-${index}`;

                return (
                  <ConcernCard
                    key={id}
                    concern={concern}
                    onView={() =>
                      setSelectedConcern(
                        concern
                      )
                    }
                  />
                );
              }
            )}
          </div>
        )}

        {/* DETAILS MODAL */}
        {selectedConcern && (
          <ConcernDetails
            concern={selectedConcern}
            onClose={() =>
              setSelectedConcern(null)
            }
          />
        )}
      </div>
    </DashboardLayout>
  );
}

/* -------------------------------------------------------------------------- */
/* Stat Card                                                                  */
/* -------------------------------------------------------------------------- */

function StatCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold text-white">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10">
          <Icon className="h-5 w-5 text-cyan-400" />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Concern Card                                                               */
/* -------------------------------------------------------------------------- */

function ConcernCard({
  concern,
  onView,
}) {
  const status =
    concern?.status || "Pending";

  const priority =
    concern?.priority || "Medium";

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl transition hover:border-slate-700">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="break-words font-semibold text-white">
            {concern?.title ||
              "Untitled concern"}
          </h2>

          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
            <CalendarDays className="h-3.5 w-3.5" />

            <span>
              {formatDate(
                concern?.createdAt
              )}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <span
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(
              status
            )}`}
          >
            {status}
          </span>

          <span
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getPriorityClass(
              priority
            )}`}
          >
            {priority}
          </span>
        </div>
      </div>

      {/* CATEGORY */}
      <div className="mt-4">
        <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-400">
          {concern?.category ||
            "Other"}
        </span>
      </div>

      {/* DESCRIPTION */}
      <p className="mt-4 line-clamp-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-400">
        {concern?.description ||
          "No description provided."}
      </p>

      {/* MENTOR RESPONSE */}
      {concern?.mentorResponse ? (
        <div className="mt-4 rounded-xl border border-cyan-400/10 bg-cyan-400/5 p-4">
          <div className="flex items-center gap-2">
            <UserRound className="h-4 w-4 text-cyan-400" />

            <p className="text-xs font-semibold text-cyan-400">
              Mentor Response
            </p>
          </div>

          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">
            {concern.mentorResponse}
          </p>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-slate-500" />

            <p className="text-xs text-slate-500">
              Waiting for mentor response
            </p>
          </div>
        </div>
      )}

      {/* ACTION */}
      <button
        type="button"
        onClick={onView}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
      >
        <MessageSquareWarning className="h-4 w-4" />
        View Details
      </button>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* Details Modal                                                              */
/* -------------------------------------------------------------------------- */

function ConcernDetails({
  concern,
  onClose,
}) {
  const status =
    concern?.status || "Pending";

  const priority =
    concern?.priority || "Medium";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* HEADER */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Concern Details
            </h2>

            <p className="text-xs text-slate-500">
              Submitted on{" "}
              {formatDate(
                concern?.createdAt
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="space-y-5 p-5 sm:p-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Title
            </p>

            <h3 className="mt-1 break-words text-xl font-semibold text-white">
              {concern?.title ||
                "Untitled concern"}
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
                status
              )}`}
            >
              {status}
            </span>

            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${getPriorityClass(
                priority
              )}`}
            >
              {priority}
            </span>

            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
              {concern?.category ||
                "Other"}
            </span>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              Description
            </p>

            <div className="rounded-xl bg-slate-950 p-4">
              <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">
                {concern?.description ||
                  "No description provided."}
              </p>
            </div>
          </div>

          {/* MENTOR */}
          {concern?.mentor && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400/10">
                  <UserRound className="h-5 w-5 text-cyan-400" />
                </div>

                <div className="min-w-0">
                  <p className="font-medium text-white">
                    {concern.mentor.name ||
                      "Assigned Mentor"}
                  </p>

                  <p className="truncate text-xs text-slate-500">
                    {concern.mentor.designation ||
                      concern.mentor.department ||
                      concern.mentor.email ||
                      ""}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* RESPONSE */}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              Mentor Response
            </p>

            {concern?.mentorResponse ? (
              <div className="rounded-xl border border-cyan-400/10 bg-cyan-400/5 p-4">
                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">
                  {concern.mentorResponse}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-sm text-slate-500">
                  Your mentor has not responded yet.
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default MenteeConcerns;