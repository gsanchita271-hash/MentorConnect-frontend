import { useEffect, useMemo, useState } from "react";
import {
Search,
RefreshCw,
UserCircle,
Mail,
BookOpen,
GraduationCap,
CalendarDays,
ArrowRight,
Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import DashboardLayout from "../../components/common/Sidebar";
import { apiGet } from "../../services/api";

/* =========================
RESPONSE HELPER
========================= */

function extractArray(response, key) {
if (Array.isArray(response?.[key])) return response[key];
if (Array.isArray(response?.data?.[key])) return response.data[key];
if (Array.isArray(response?.data)) return response.data;
if (Array.isArray(response)) return response;

return [];
}

/* =========================
MENTOR MENTEES
========================= */

function MentorMentees() {
const [mentees, setMentees] = useState([]);
const [search, setSearch] = useState("");
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const menuItems = [
{
label: "Dashboard",
path: "/mentor/dashboard",
icon: "dashboard",
},
{
label: "My Mentees",
path: "/mentor/mentees",
icon: "users",
},
{
label: "Meetings",
path: "/mentor/meetings",
icon: "meetings",
},
{
label: "Attendance",
path: "/mentor/attendance",
icon: "attendance",
},
{
label: "Tasks",
path: "/mentor/tasks",
icon: "tasks",
},
{
label: "Concerns",
path: "/mentor/concerns",
icon: "concerns",
},
{
label: "Announcements",
path: "/mentor/announcements",
icon: "announcements",
},
{
label: "Academic",
path: "/mentor/academic",
icon: "academic",
},
{
label: "Profile",
path: "/mentor/profile",
icon: "profile",
},
];

/* =========================
LOAD MENTEES
========================= */

const loadMentees = async () => {
try {
setLoading(true);
setError("");

  // Correct backend route:
  // GET /api/auth/my-mentees
  const response = await apiGet("/auth/my-mentees");

  setMentees(extractArray(response, "mentees"));
} catch (err) {
  setMentees([]);
  setError(err.message || "Unable to load mentees.");
} finally {
  setLoading(false);
}

};

useEffect(() => {
loadMentees();
}, []);

/* =========================
SEARCH
========================= */

const filteredMentees = useMemo(() => {
const value = search.trim().toLowerCase();

if (!value) return mentees;

return mentees.filter((mentee) => {
  return (
    mentee.name?.toLowerCase().includes(value) ||
    mentee.email?.toLowerCase().includes(value) ||
    mentee.course?.toLowerCase().includes(value) ||
    mentee.rollNumber
      ?.toString()
      .toLowerCase()
      .includes(value) ||
    mentee.semester
      ?.toString()
      .toLowerCase()
      .includes(value)
  );
});

}, [mentees, search]);

return (
<DashboardLayout
role="Mentor"
title="My Mentees"
menuItems={menuItems}
>
{/* HEADER */}
<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
<div>
<p className="text-sm text-slate-500">
Mentor Portal
</p>

      <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
        My Mentees
      </h1>

      <p className="mt-2 text-sm text-slate-400">
        View the students assigned to you and
        access their mentoring information.
      </p>
    </div>

    <button
      type="button"
      onClick={loadMentees}
      disabled={loading}
      className="flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-cyan-400/30 hover:text-cyan-400 disabled:opacity-50"
    >
      <RefreshCw
        className={`h-4 w-4 ${
          loading ? "animate-spin" : ""
        }`}
      />

      Refresh
    </button>
  </div>

  {/* ERROR */}
  {error && (
    <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
      {error}
    </div>
  )}

  {/* TOP INFO */}
  <div className="mb-6 grid gap-4 sm:grid-cols-2">
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
          <Users className="h-5 w-5" />
        </div>

        <div>
          <p className="text-xs text-slate-500">
            Assigned Mentees
          </p>

          <p className="mt-1 text-2xl font-bold text-white">
            {mentees.length}
          </p>
        </div>
      </div>
    </div>

    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
          <GraduationCap className="h-5 w-5" />
        </div>

        <div>
          <p className="text-xs text-slate-500">
            Student Management
          </p>

          <p className="mt-1 text-sm font-semibold text-white">
            Academic & Mentoring
          </p>
        </div>
      </div>
    </div>
  </div>

  {/* SEARCH */}
  <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

      <input
        type="text"
        value={search}
        onChange={(event) =>
          setSearch(event.target.value)
        }
        placeholder="Search by name, email, course, semester or roll number..."
        className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
      />
    </div>
  </div>

  {/* CONTENT */}
  {loading ? (
    <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50">
      <RefreshCw className="h-6 w-6 animate-spin text-cyan-400" />
    </div>
  ) : filteredMentees.length === 0 ? (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-800">
        <Users className="h-6 w-6 text-slate-600" />
      </div>

      <h2 className="mt-4 font-semibold text-white">
        {search
          ? "No mentees found"
          : "No mentees assigned"}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        {search
          ? "Try a different search term."
          : "Students assigned to you will appear here."}
      </p>
    </div>
  ) : (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {filteredMentees.map((mentee) => (
        <MenteeCard
          key={mentee._id || mentee.id}
          mentee={mentee}
        />
      ))}
    </div>
  )}
</DashboardLayout>

);
}

/* =========================
MENTEE CARD
========================= */

function MenteeCard({ mentee }) {
const name = mentee.name || "Unnamed Student";

const initials = name
.split(" ")
.map((word) => word.charAt(0))
.join("")
.slice(0, 2)
.toUpperCase();

return (
<div className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 transition hover:border-cyan-400/20 hover:bg-slate-900">
{/* CARD HEADER */}
<div className="border-b border-slate-800 p-5">
<div className="flex items-start justify-between gap-4">
<div className="flex items-center gap-3">
<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 font-bold text-cyan-400 ring-1 ring-cyan-400/20">
{initials || "U"}
</div>

        <div className="min-w-0">
          <h2 className="truncate font-bold text-white">
            {name}
          </h2>

          <p className="mt-1 truncate text-xs text-slate-500">
            Mentee
          </p>
        </div>
      </div>

      <UserCircle className="h-5 w-5 shrink-0 text-slate-700" />
    </div>
  </div>

  {/* DETAILS */}
  <div className="space-y-3 p-5">
    {mentee.email && (
      <InfoRow
        icon={Mail}
        label="Email"
        value={mentee.email}
      />
    )}

    {mentee.course && (
      <InfoRow
        icon={BookOpen}
        label="Course"
        value={mentee.course}
      />
    )}

    {mentee.semester && (
      <InfoRow
        icon={GraduationCap}
        label="Semester"
        value={`Semester ${mentee.semester}`}
      />
    )}

    {mentee.rollNumber && (
      <InfoRow
        icon={UserCircle}
        label="Roll Number"
        value={mentee.rollNumber}
      />
    )}

    {mentee.department && (
      <InfoRow
        icon={BookOpen}
        label="Department"
        value={mentee.department}
      />
    )}
  </div>

  {/* ACTIONS */}
  <div className="grid grid-cols-2 gap-2 border-t border-slate-800 p-4">
    <Link
      to="/mentor/meetings"
      className="flex items-center justify-center gap-2 rounded-xl border border-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-cyan-400/20 hover:text-cyan-400"
    >
      <CalendarDays className="h-4 w-4" />
      Meeting
    </Link>

    <Link
      to="/mentor/academic"
      className="flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-3 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-300"
    >
      Details
      <ArrowRight className="h-4 w-4" />
    </Link>
  </div>
</div>

);
}

/* =========================
INFO ROW
========================= */

function InfoRow({
icon: Icon,
label,
value,
}) {
return (
<div className="flex items-start gap-3">
<div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-slate-500">
<Icon className="h-4 w-4" />
</div>

  <div className="min-w-0">
    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
      {label}
    </p>

    <p className="mt-0.5 break-words text-sm text-slate-300">
      {value}
    </p>
  </div>
</div>

);
}

export default MentorMentees;