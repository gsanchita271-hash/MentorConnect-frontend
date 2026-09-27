import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  Loader2,
  Megaphone,
  Search,
  UserRound,
} from "lucide-react";

import DashboardLayout from "../../components/common/Sidebar";
import { apiGet } from "../../services/api";

/* ----------------------------- Helpers ----------------------------- */

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

/* -------------------------- Main Component ------------------------- */

function MenteeAnnouncements() {
  const [announcements, setAnnouncements] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] =
    useState("All");

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiGet(
        "/announcements/mentee-announcements"
      );

      setAnnouncements(
        extractAnnouncements(response)
      );
    } catch (err) {
      console.error(
        "Mentee announcements error:",
        err
      );

      setAnnouncements([]);

      setError(
        err?.message ||
          "Unable to load announcements."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const filteredAnnouncements = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();

    return safeArray(announcements).filter(
      (announcement) => {
        const title =
          announcement?.title
            ?.toLowerCase() || "";

        const message =
          announcement?.message
            ?.toLowerCase() || "";

        const priority =
          announcement?.priority || "";

        const mentorName =
          announcement?.mentor?.name
            ?.toLowerCase() || "";

        const matchesSearch =
          !value ||
          title.includes(value) ||
          message.includes(value) ||
          mentorName.includes(value);

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

  return (
    <DashboardLayout
      title="Announcements"
      subtitle="View announcements shared by your mentor"
    >
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10">
            <Megaphone className="h-6 w-6 text-cyan-400" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">
              Announcements
            </h1>

            <p className="text-sm text-slate-400">
              Stay updated with announcements from your
              mentor.
            </p>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
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
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-9 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400"
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

        {/* CONTENT */}
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
              Your mentor's announcements will appear
              here.
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
      {/* CARD HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10">
            <Megaphone className="h-5 w-5 text-cyan-400" />
          </div>

          <div className="min-w-0">
            <h2 className="break-words text-lg font-semibold text-white">
              {announcement?.title ||
                "Untitled announcement"}
            </h2>

            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
              <CalendarDays className="h-3.5 w-3.5" />

              <span>
                {formatDate(
                  announcement?.publishDate
                )}
              </span>
            </div>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityClass}`}
        >
          {priority}
        </span>
      </div>

      {/* MESSAGE */}
      <div className="mt-5 rounded-xl bg-slate-950/70 p-4">
        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">
          {announcement?.message ||
            "No message available."}
        </p>
      </div>

      {/* MENTOR */}
      <div className="mt-5 flex items-center gap-3 border-t border-slate-800 pt-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-400/10">
          <UserRound className="h-4 w-4 text-cyan-400" />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium text-white">
            {announcement?.mentor?.name ||
              "Mentor"}
          </p>

          <p className="truncate text-xs text-slate-500">
            {announcement?.mentor
              ?.designation ||
              announcement?.mentor
                ?.department ||
              announcement?.mentor?.email ||
              "Mentor announcement"}
          </p>
        </div>
      </div>
    </article>
  );
}

export default MenteeAnnouncements;