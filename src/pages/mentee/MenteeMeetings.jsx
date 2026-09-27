import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CalendarDays,
  Clock3,
  ExternalLink,
  Search,
  Video,
  X,
  ClipboardList,
  UserCircle,
} from "lucide-react";

import DashboardLayout from "../../components/common/Sidebar";
import { apiGet } from "../../services/api";

function getId(item) {
  if (!item) return "";
  return String(item._id || item.id || "");
}

function formatDate(date) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(date) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateTime(date) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isUpcoming(meeting) {
  if (!meeting?.date) return false;

  const date = new Date(meeting.date);

  if (Number.isNaN(date.getTime())) return false;

  return date >= new Date();
}

function isToday(meeting) {
  if (!meeting?.date) return false;

  const date = new Date(meeting.date);
  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function getMentorName(meeting) {
  if (!meeting?.mentor) return "Mentor";

  if (typeof meeting.mentor === "string") {
    return meeting.mentor;
  }

  return (
    meeting.mentor.name ||
    meeting.mentor.email ||
    "Mentor"
  );
}

function getMentorDetails(meeting) {
  const mentor = meeting?.mentor;

  if (!mentor || typeof mentor === "string") {
    return "";
  }

  return [
    mentor.department,
    mentor.designation,
  ]
    .filter(Boolean)
    .join(" • ");
}

/*
 * Keeps keyboard focus inside an open dialog.
 */
function useModalAccessibility(
  isOpen,
  onClose,
  modalRef,
  initialFocusRef
) {
  const previousActiveElementRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    previousActiveElementRef.current =
      document.activeElement;

    const timer = window.setTimeout(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else {
        modalRef.current?.focus();
      }
    }, 0);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const dialog = modalRef.current;

      if (!dialog) return;

      const focusableElements = Array.from(
        dialog.querySelectorAll(
          [
            "a[href]",
            "button:not([disabled])",
            "input:not([disabled])",
            "select:not([disabled])",
            "textarea:not([disabled])",
            "[tabindex]:not([tabindex='-1'])",
          ].join(",")
        )
      ).filter(
        (element) =>
          !element.hasAttribute("aria-hidden") &&
          element.offsetParent !== null
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstElement =
        focusableElements[0];

      const lastElement =
        focusableElements[
          focusableElements.length - 1
        ];

      if (
        event.shiftKey &&
        document.activeElement === firstElement
      ) {
        event.preventDefault();
        lastElement.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === lastElement
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.clearTimeout(timer);

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    isOpen,
    onClose,
    modalRef,
    initialFocusRef,
  ]);

  useEffect(() => {
    if (isOpen) return;

    const previous =
      previousActiveElementRef.current;

    if (
      previous &&
      typeof previous.focus === "function"
    ) {
      window.setTimeout(() => {
        previous.focus();
      }, 0);
    }
  }, [isOpen]);
}

export default function MenteeMeetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [selectedMeeting, setSelectedMeeting] =
    useState(null);

  const [showDetails, setShowDetails] =
    useState(false);

  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiGet(
        "/meetings/mentee-meetings"
      );

      setMeetings(
        Array.isArray(response?.meetings)
          ? response.meetings
          : []
      );
    } catch (err) {
      setError(
        err.message ||
          "Failed to load your meetings."
      );

      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => {
      setError("");
    }, 5000);

    return () => clearTimeout(timer);
  }, [error]);

  const filteredMeetings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return meetings.filter((meeting) => {
      const mentorName =
        getMentorName(meeting).toLowerCase();

      const mentorDetails =
        getMentorDetails(meeting).toLowerCase();

      const title = String(
        meeting?.title || ""
      ).toLowerCase();

      const agenda = String(
        meeting?.agenda || ""
      ).toLowerCase();

      const matchesSearch =
        !query ||
        title.includes(query) ||
        agenda.includes(query) ||
        mentorName.includes(query) ||
        mentorDetails.includes(query);

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
    return {
      total: meetings.length,
      upcoming: meetings.filter(
        isUpcoming
      ).length,
      today: meetings.filter(isToday).length,
      past: meetings.filter(
        (meeting) => !isUpcoming(meeting)
      ).length,
    };
  }, [meetings]);

  const openDetails = useCallback((meeting) => {
    setSelectedMeeting(meeting);
    setShowDetails(true);
  }, []);

  const closeDetails = useCallback(() => {
    setShowDetails(false);
    setSelectedMeeting(null);
  }, []);

  useModalAccessibility(
    showDetails,
    closeDetails,
    modalRef,
    closeButtonRef
  );

  const openMeetingLink = (link) => {
    if (!link) return;

    window.open(
      link,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <DashboardLayout>
      <div
        className="min-h-full bg-slate-950 text-white"
        aria-hidden={showDetails ? "true" : undefined}
      >
        <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">

          {/* Header */}
          <div>
            <div className="mb-2 flex items-center gap-2 text-cyan-400">
              <Video size={20} aria-hidden="true" />

              <span className="text-sm font-medium">
                Mentee Workspace
              </span>
            </div>

            <h1 className="text-2xl font-bold sm:text-3xl">
              My Meetings
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-slate-400">
              View meetings scheduled by your mentor and
              join your upcoming sessions.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="flex items-start justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              <span>{error}</span>

              <button
                type="button"
                onClick={() => setError("")}
                aria-label="Dismiss error"
                className="shrink-0 rounded-lg p-1 hover:bg-red-500/10 hover:text-white"
              >
                <X size={18} aria-hidden="true" />
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

          {/* Search + Filter */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Search
                  size={18}
                  aria-hidden="true"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <label
                  htmlFor="meeting-search"
                  className="sr-only"
                >
                  Search meetings
                </label>

                <input
                  id="meeting-search"
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search meetings or mentor..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              <div>
                <label
                  htmlFor="meeting-filter"
                  className="sr-only"
                >
                  Filter meetings
                </label>

                <select
                  id="meeting-filter"
                  value={filter}
                  onChange={(event) =>
                    setFilter(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 lg:w-auto"
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
          </div>

          {/* Meetings */}
          {loading ? (
            <div
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-10 text-center"
              role="status"
              aria-live="polite"
            >
              <div
                className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400"
                aria-hidden="true"
              />

              <p className="mt-4 text-sm text-slate-400">
                Loading your meetings...
              </p>
            </div>
          ) : filteredMeetings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
                <CalendarDays
                  size={26}
                  aria-hidden="true"
                />
              </div>

              <h3 className="mt-4 text-lg font-semibold">
                No meetings found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
                {meetings.length === 0
                  ? "Your mentor has not scheduled any meetings for you yet."
                  : "Try changing your search or filter."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {filteredMeetings.map((meeting) => (
                <MeetingCard
                  key={
                    getId(meeting) ||
                    `${meeting.title}-${meeting.date}`
                  }
                  meeting={meeting}
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

        {/* Accessible Details Modal */}
        {showDetails && selectedMeeting && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-5"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeDetails();
              }
            }}
          >
            <div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="meeting-modal-title"
              aria-describedby="meeting-modal-description"
              tabIndex={-1}
              className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl outline-none focus:ring-2 focus:ring-cyan-500/50"
              onMouseDown={(event) =>
                event.stopPropagation()
              }
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-800 p-5 sm:p-6">
                <div className="min-w-0 pr-4">
                  <div className="mb-2 flex flex-wrap gap-2">
                    {isToday(
                      selectedMeeting
                    ) && (
                      <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-400">
                        Today
                      </span>
                    )}

                    {isUpcoming(
                      selectedMeeting
                    ) ? (
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                        Upcoming
                      </span>
                    ) : (
                      <span className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-400">
                        Past
                      </span>
                    )}
                  </div>

                  <h2
                    id="meeting-modal-title"
                    className="text-xl font-bold text-white"
                  >
                    {selectedMeeting.title ||
                      "Meeting"}
                  </h2>

                  <p
                    id="meeting-modal-description"
                    className="sr-only"
                  >
                    Meeting details including mentor,
                    date, time, agenda, and meeting link.
                  </p>
                </div>

                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={closeDetails}
                  aria-label="Close meeting details"
                  title="Close"
                  className="shrink-0 rounded-lg p-2 text-slate-400 outline-none hover:bg-slate-800 hover:text-white focus:ring-2 focus:ring-cyan-500"
                >
                  <X
                    size={20}
                    aria-hidden="true"
                  />
                </button>
              </div>

              {/* Modal Content */}
              <div className="space-y-5 p-5 sm:p-6">

                {/* Mentor */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex items-start gap-3">
                    <UserCircle
                      size={20}
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 text-cyan-400"
                    />

                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Mentor
                      </p>

                      <p className="mt-1 text-sm font-semibold text-white">
                        {getMentorName(
                          selectedMeeting
                        )}
                      </p>

                      {getMentorDetails(
                        selectedMeeting
                      ) && (
                        <p className="mt-1 text-xs text-slate-500">
                          {getMentorDetails(
                            selectedMeeting
                          )}
                        </p>
                      )}

                      {selectedMeeting?.mentor
                        ?.email && (
                        <p className="mt-1 break-all text-xs text-slate-500">
                          {
                            selectedMeeting
                              .mentor.email
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Date + Time */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <DetailRow
                    icon={
                      <CalendarDays
                        size={18}
                      />
                    }
                    label="Date"
                    value={formatDate(
                      selectedMeeting.date
                    )}
                  />

                  <DetailRow
                    icon={
                      <Clock3 size={18} />
                    }
                    label="Time"
                    value={formatTime(
                      selectedMeeting.date
                    )}
                  />
                </div>

                {/* Scheduled For */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Scheduled For
                  </p>

                  <p className="mt-1 text-sm text-slate-200">
                    {formatDateTime(
                      selectedMeeting.date
                    )}
                  </p>
                </div>

                {/* Agenda */}
                <DetailRow
                  icon={
                    <ClipboardList
                      size={18}
                    />
                  }
                  label="Agenda"
                  value={
                    selectedMeeting.agenda ||
                    "No agenda provided."
                  }
                />

                {/* Meeting Link */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex items-start gap-3">
                    <Video
                      size={18}
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 text-cyan-400"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Meeting Link
                      </p>

                      {selectedMeeting.meetingLink ? (
                        <>
                          <p className="mt-1 break-all text-sm text-slate-300">
                            {
                              selectedMeeting.meetingLink
                            }
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              openMeetingLink(
                                selectedMeeting.meetingLink
                              )
                            }
                            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 outline-none hover:bg-cyan-400 focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-900"
                          >
                            <ExternalLink
                              size={15}
                              aria-hidden="true"
                            />
                            Join Meeting
                          </button>
                        </>
                      ) : (
                        <p className="mt-1 text-sm text-slate-500">
                          No meeting link available.
                        </p>
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

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400"
          aria-hidden="true"
        >
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
  onView,
  onJoin,
}) {
  const upcoming = isUpcoming(meeting);
  const today = isToday(meeting);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-slate-700">

      {/* Header */}
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
            {meeting.title ||
              "Untitled Meeting"}
          </h3>
        </div>

        <button
          type="button"
          onClick={onView}
          title="View meeting details"
          aria-label={`View details for ${
            meeting.title || "meeting"
          }`}
          className="shrink-0 rounded-lg p-2 text-slate-500 outline-none hover:bg-slate-800 hover:text-cyan-400 focus:ring-2 focus:ring-cyan-500"
        >
          <ClipboardList
            size={18}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Date / Time */}
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CalendarDays
              size={14}
              aria-hidden="true"
            />
            Date
          </div>

          <p className="mt-1 text-sm text-slate-300">
            {formatDate(meeting.date)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock3
              size={14}
              aria-hidden="true"
            />
            Time
          </div>

          <p className="mt-1 text-sm text-slate-300">
            {formatTime(meeting.date)}
          </p>
        </div>
      </div>

      {/* Mentor */}
      <div className="mt-4 flex items-start gap-3">
        <UserCircle
          size={18}
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-cyan-400"
        />

        <div className="min-w-0">
          <p className="text-xs text-slate-500">
            Mentor
          </p>

          <p className="truncate text-sm font-medium text-slate-200">
            {getMentorName(meeting)}
          </p>

          {getMentorDetails(meeting) && (
            <p className="truncate text-xs text-slate-500">
              {getMentorDetails(meeting)}
            </p>
          )}
        </div>
      </div>

      {/* Agenda */}
      <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-400">
        {meeting.agenda ||
          "No agenda provided."}
      </p>

      {/* Actions */}
      <div className="mt-5 flex flex-col gap-2 border-t border-slate-800 pt-4 sm:flex-row">
        <button
          type="button"
          onClick={onView}
          className="flex-1 rounded-xl border border-slate-700 px-3 py-2.5 text-sm font-medium text-slate-300 outline-none hover:bg-slate-800 hover:text-white focus:ring-2 focus:ring-cyan-500"
        >
          View Details
        </button>

        {meeting.meetingLink && (
          <button
            type="button"
            onClick={onJoin}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-3 py-2.5 text-sm font-semibold text-slate-950 outline-none hover:bg-cyan-400 focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            <Video
              size={15}
              aria-hidden="true"
            />
            Join Meeting
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
        <div
          className="mt-0.5 shrink-0 text-cyan-400"
          aria-hidden="true"
        >
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

