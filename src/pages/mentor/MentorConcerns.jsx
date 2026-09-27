import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Edit3,
  Eye,
  Loader2,
  MessageSquareWarning,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import DashboardLayout from "../../components/common/Sidebar";
import {
  apiGet,
  apiPatch,
  apiDelete,
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

const getMenteeName = (mentee) => {
  if (!mentee) return "Unknown mentee";

  if (typeof mentee === "string") {
    return "Unknown mentee";
  }

  return mentee.name || "Unknown mentee";
};

const getMenteeEmail = (mentee) => {
  if (!mentee || typeof mentee === "string") {
    return "";
  }

  return mentee.email || "";
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
  status: "Pending",
  priority: "Medium",
  mentorResponse: "",
};

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

function MentorConcerns() {
  const [concerns, setConcerns] = useState([]);

  const [selectedConcern, setSelectedConcern] =
    useState(null);

  const [form, setForm] = useState(emptyForm);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");
  const [priorityFilter, setPriorityFilter] =
    useState("All");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] =
    useState(null);

  const [showDetails, setShowDetails] =
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
        "/concerns/mentor-concerns"
      );

      setConcerns(
        extractConcerns(response)
      );
    } catch (err) {
      console.error(
        "Mentor concerns load error:",
        err
      );

      setConcerns([]);

      setError(
        err?.message ||
          "Unable to load concerns."
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

        const menteeName =
          concern?.mentee?.name
            ?.toLowerCase() || "";

        const menteeEmail =
          concern?.mentee?.email
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
          menteeName.includes(value) ||
          menteeEmail.includes(value) ||
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
  /* Open details                                                           */
  /* ---------------------------------------------------------------------- */

  const openDetails = async (concern) => {
    const concernId = getId(concern);

    setMessage("");
    setError("");

    if (!concernId) {
      setSelectedConcern(concern);
      setForm({
        status:
          concern?.status || "Pending",
        priority:
          concern?.priority || "Medium",
        mentorResponse:
          concern?.mentorResponse || "",
      });
      setShowDetails(true);
      return;
    }

    try {
      const response = await apiGet(
        `/concerns/${concernId}`
      );

      const detailedConcern =
        response?.concern || concern;

      setSelectedConcern(
        detailedConcern
      );

      setForm({
        status:
          detailedConcern?.status ||
          "Pending",
        priority:
          detailedConcern?.priority ||
          "Medium",
        mentorResponse:
          detailedConcern?.mentorResponse ||
          "",
      });

      setShowDetails(true);
    } catch (err) {
      console.error(
        "Get concern details error:",
        err
      );

      setSelectedConcern(concern);

      setForm({
        status:
          concern?.status || "Pending",
        priority:
          concern?.priority || "Medium",
        mentorResponse:
          concern?.mentorResponse || "",
      });

      setShowDetails(true);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Update                                                                 */
  /* ---------------------------------------------------------------------- */

  const handleUpdate = async (event) => {
    event.preventDefault();

    const concernId =
      getId(selectedConcern);

    if (!concernId) {
      setError("Concern ID is missing.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await apiPatch(
        `/concerns/${concernId}`,
        {
          status: form.status,
          priority: form.priority,
          mentorResponse:
            form.mentorResponse.trim(),
        }
      );

      const updatedConcern =
        response?.concern;

      if (updatedConcern) {
        setConcerns((previous) =>
          safeArray(previous).map(
            (item) =>
              getId(item) === concernId
                ? updatedConcern
                : item
          )
        );

        setSelectedConcern(
          updatedConcern
        );
      } else {
        await loadConcerns();
      }

      setMessage(
        response?.message ||
          "Concern updated successfully."
      );
    } catch (err) {
      console.error(
        "Update concern error:",
        err
      );

      setError(
        err?.message ||
          "Failed to update concern."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Delete                                                                 */
  /* ---------------------------------------------------------------------- */

  const handleDelete = async (
    concernId
  ) => {
    if (!concernId) {
      setError("Concern ID is missing.");
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this concern?"
      );

    if (!confirmed) return;

    try {
      setDeletingId(concernId);
      setError("");
      setMessage("");

      const response =
        await apiDelete(
          `/concerns/${concernId}`
        );

      setConcerns((previous) =>
        safeArray(previous).filter(
          (item) =>
            getId(item) !== concernId
        )
      );

      if (
        getId(selectedConcern) ===
        concernId
      ) {
        setSelectedConcern(null);
        setShowDetails(false);
      }

      setMessage(
        response?.message ||
          "Concern deleted successfully."
      );
    } catch (err) {
      console.error(
        "Delete concern error:",
        err
      );

      setError(
        err?.message ||
          "Failed to delete concern."
      );
    } finally {
      setDeletingId(null);
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
      title="Concerns"
      subtitle="Review and manage concerns submitted by your mentees"
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
                Mentee Concerns
              </h1>

              <p className="text-sm text-slate-400">
                Review concerns and provide responses.
              </p>
            </div>
          </div>
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
                placeholder="Search by title, mentee, category..."
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

        {/* CONTENT */}
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
              Concerns submitted by your mentees
              will appear here.
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
                    deleting={
                      deletingId === id
                    }
                    onView={() =>
                      openDetails(
                        concern
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

        {/* DETAILS MODAL */}
        {showDetails &&
          selectedConcern && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
              <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
                {/* MODAL HEADER */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-5 py-4 sm:px-6">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      Concern Details
                    </h2>

                    <p className="text-xs text-slate-500">
                      Review and update this concern.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowDetails(false)
                    }
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* MODAL BODY */}
                <div className="space-y-5 p-5 sm:p-6">
                  {/* TITLE */}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Title
                    </p>

                    <p className="mt-1 break-words text-lg font-semibold text-white">
                      {selectedConcern?.title ||
                        "Untitled concern"}
                    </p>
                  </div>

                  {/* MENTEE */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400/10">
                        <UserRound className="h-5 w-5 text-cyan-400" />
                      </div>

                      <div className="min-w-0">
                        <p className="font-medium text-white">
                          {getMenteeName(
                            selectedConcern?.mentee
                          )}
                        </p>

                        <p className="truncate text-xs text-slate-500">
                          {getMenteeEmail(
                            selectedConcern?.mentee
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* DESCRIPTION */}
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                      Description
                    </p>

                    <div className="rounded-xl bg-slate-950 p-4">
                      <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">
                        {selectedConcern?.description ||
                          "No description provided."}
                      </p>
                    </div>
                  </div>

                  {/* CATEGORY */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <InfoBox
                      label="Category"
                      value={
                        selectedConcern?.category ||
                        "Other"
                      }
                    />

                    <InfoBox
                      label="Created"
                      value={formatDate(
                        selectedConcern?.createdAt
                      )}
                    />

                    <InfoBox
                      label="Updated"
                      value={formatDate(
                        selectedConcern?.updatedAt
                      )}
                    />
                  </div>

                  {/* UPDATE FORM */}
                  <form
                    onSubmit={handleUpdate}
                    className="space-y-4 border-t border-slate-800 pt-5"
                  >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300">
                          Status
                        </label>

                        <select
                          value={form.status}
                          onChange={(event) =>
                            setForm(
                              (previous) => ({
                                ...previous,
                                status:
                                  event.target
                                    .value,
                              })
                            )
                          }
                          disabled={saving}
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400 disabled:opacity-60"
                        >
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
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300">
                          Priority
                        </label>

                        <select
                          value={form.priority}
                          onChange={(event) =>
                            setForm(
                              (previous) => ({
                                ...previous,
                                priority:
                                  event.target
                                    .value,
                              })
                            )
                          }
                          disabled={saving}
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

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Mentor Response
                      </label>

                      <textarea
                        value={
                          form.mentorResponse
                        }
                        onChange={(event) =>
                          setForm(
                            (previous) => ({
                              ...previous,
                              mentorResponse:
                                event.target
                                  .value,
                            })
                          )
                        }
                        rows={5}
                        placeholder="Write your response to the mentee..."
                        disabled={saving}
                        className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400 disabled:opacity-60"
                      />
                    </div>

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          setShowDetails(
                            false
                          )
                        }
                        disabled={saving}
                        className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-50"
                      >
                        Close
                      </button>

                      <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
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
/* Info Box                                                                   */
/* -------------------------------------------------------------------------- */

function InfoBox({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-medium text-slate-200">
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Concern Card                                                               */
/* -------------------------------------------------------------------------- */

function ConcernCard({
  concern,
  deleting,
  onView,
  onDelete,
}) {
  const status =
    concern?.status || "Pending";

  const priority =
    concern?.priority || "Medium";

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl transition hover:border-slate-700">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="break-words font-semibold text-white">
            {concern?.title ||
              "Untitled concern"}
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            {formatDate(
              concern?.createdAt
            )}
          </p>
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

      {/* MENTEE */}
      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-400/10">
          <UserRound className="h-4 w-4 text-cyan-400" />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">
            {getMenteeName(
              concern?.mentee
            )}
          </p>

          <p className="truncate text-xs text-slate-500">
            {getMenteeEmail(
              concern?.mentee
            ) ||
              concern?.category ||
              "Mentee concern"}
          </p>
        </div>
      </div>

      {/* DESCRIPTION */}
      <p className="mt-4 line-clamp-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-400">
        {concern?.description ||
          "No description provided."}
      </p>

      {/* CATEGORY */}
      <div className="mt-4">
        <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-400">
          {concern?.category ||
            "Other"}
        </span>
      </div>

      {/* RESPONSE */}
      {concern?.mentorResponse && (
        <div className="mt-4 rounded-xl border border-cyan-400/10 bg-cyan-400/5 p-3">
          <p className="text-xs font-medium text-cyan-400">
            Your Response
          </p>

          <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-xs leading-5 text-slate-400">
            {concern.mentorResponse}
          </p>
        </div>
      )}

      {/* ACTIONS */}
      <div className="mt-5 flex gap-2 border-t border-slate-800 pt-4">
        <button
          type="button"
          onClick={onView}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <Eye className="h-4 w-4" />
          Review
        </button>

        <button
          type="button"
          onClick={onView}
          className="flex items-center justify-center rounded-xl border border-slate-700 px-3 py-2.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          title="Edit concern"
        >
          <Edit3 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="flex items-center justify-center rounded-xl border border-red-400/20 px-3 py-2.5 text-red-300 hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
          title="Delete concern"
        >
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      </div>
    </article>
  );
}

export default MentorConcerns;