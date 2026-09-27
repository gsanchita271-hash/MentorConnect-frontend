import { useEffect, useMemo, useState } from "react";
import {
CalendarDays,
Check,
Clock3,
Edit3,
History,
Search,
UserCheck,
Users,
X,
XCircle,
} from "lucide-react";

import DashboardLayout from "../../components/common/Sidebar";
import {
apiGet,
apiPatch,
apiPost,
} from "../../services/api";

// ==================================================
// Helpers
// ==================================================

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

function getId(value) {
if (!value) return "";

if (typeof value === "string") {
return value;
}

if (typeof value === "object") {
return String(
value._id ||
value.id ||
value.$oid ||
""
);
}

return "";
}

function getMenteeInfo(record, mentees = []) {
if (!record) {
return {
id: "",
name: "Unknown mentee",
email: "",
course: "",
division: "",
semester: "",
rollNumber: "",
};
}

const mentee = record.mentee;

// ----------------------------------------------
// Populated mentee object
// ----------------------------------------------

if (
mentee &&
typeof mentee === "object" &&
!Array.isArray(mentee)
) {
const id =
getId(mentee) ||
getId(record.menteeId);

return {
  id,
  name:
    mentee.name ||
    mentee.fullName ||
    mentee.username ||
    "Unknown mentee",
  email: mentee.email || "",
  course: mentee.course || "",
  division: mentee.division || "",
  semester: mentee.semester ?? "",
  rollNumber:
    mentee.rollNumber ||
    mentee.rollNo ||
    "",
};

}

// ----------------------------------------------
// Get mentee ID from record
// ----------------------------------------------

const menteeId =
getId(mentee) ||
getId(record.menteeId);

// ----------------------------------------------
// If backend didn't populate, find same mentee
// from /auth/my-mentees
// ----------------------------------------------

if (menteeId && mentees.length > 0) {
const matchedMentee = mentees.find(
(item) =>
getId(item) === String(menteeId)
);

if (matchedMentee) {
  return {
    id: menteeId,
    name:
      matchedMentee.name ||
      "Unknown mentee",
    email: matchedMentee.email || "",
    course: matchedMentee.course || "",
    division: matchedMentee.division || "",
    semester:
      matchedMentee.semester ?? "",
    rollNumber:
      matchedMentee.rollNumber ||
      matchedMentee.rollNo ||
      "",
  };
}

}

// ----------------------------------------------
// No matching mentee
// ----------------------------------------------

return {
id: menteeId,
name: "Unknown mentee",
email: "",
course: "",
division: "",
semester: "",
rollNumber: "",
};
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

// ==================================================
// Component
// ==================================================

export default function MentorAttendance() {
const [mentees, setMentees] = useState([]);
const [attendance, setAttendance] = useState([]);

const [loading, setLoading] = useState(true);
const [submitting, setSubmitting] = useState(false);

const [search, setSearch] = useState("");

const [selectedMentee, setSelectedMentee] =
useState("");

const [selectedDate, setSelectedDate] =
useState("");

const [selectedStatus, setSelectedStatus] =
useState("Present");

const [editingId, setEditingId] =
useState(null);

const [historyOpen, setHistoryOpen] =
useState(false);

const [historyLoading, setHistoryLoading] =
useState(false);

const [history, setHistory] = useState([]);

const [historyMentee, setHistoryMentee] =
useState(null);

const [message, setMessage] = useState("");
const [error, setError] = useState("");

// ==================================================
// Load data
// ==================================================

const loadData = async () => {
try {
setLoading(true);
setError("");

  const [
    menteesResponse,
    attendanceResponse,
  ] = await Promise.all([
    apiGet("/auth/my-mentees"),
    apiGet("/attendance/my-attendance"),
  ]);

  const menteeList = extractArray(
    menteesResponse,
    "mentees"
  );

  const attendanceList = extractArray(
    attendanceResponse,
    "attendance"
  );

  setMentees(menteeList);
  setAttendance(attendanceList);
} catch (err) {
  console.error(
    "Failed to load attendance:",
    err
  );

  setError(
    err?.message ||
      "Failed to load attendance data."
  );
} finally {
  setLoading(false);
}

};

useEffect(() => {
loadData();
}, []);

// ==================================================
// Summary
// ==================================================

const summary = useMemo(() => {
const total = attendance.length;

const present = attendance.filter(
  (record) =>
    record?.status === "Present"
).length;

const absent = attendance.filter(
  (record) =>
    record?.status === "Absent"
).length;

const percentage =
  total === 0
    ? "0.0"
    : ((present / total) * 100).toFixed(1);

return {
  total,
  present,
  absent,
  percentage,
};

}, [attendance]);

// ==================================================
// Search
// ==================================================

const filteredAttendance = useMemo(() => {
const query = search
.trim()
.toLowerCase();

if (!query) {
  return attendance;
}

return attendance.filter((record) => {
  const mentee = getMenteeInfo(
    record,
    mentees
  );

  return (
    mentee.name
      .toLowerCase()
      .includes(query) ||
    mentee.email
      .toLowerCase()
      .includes(query) ||
    mentee.course
      .toLowerCase()
      .includes(query) ||
    mentee.division
      .toLowerCase()
      .includes(query) ||
    mentee.rollNumber
      .toLowerCase()
      .includes(query) ||
    String(mentee.id)
      .toLowerCase()
      .includes(query) ||
    String(record?.status || "")
      .toLowerCase()
      .includes(query)
  );
});

}, [attendance, mentees, search]);

// ==================================================
// Reset form
// ==================================================

const resetForm = () => {
setSelectedMentee("");
setSelectedDate("");
setSelectedStatus("Present");
setEditingId(null);
};

// ==================================================
// Submit attendance
// ==================================================

const handleSubmit = async (event) => {
event.preventDefault();

setMessage("");
setError("");

if (!selectedMentee) {
  setError("Please select a mentee.");
  return;
}

if (!selectedDate) {
  setError("Please select a date.");
  return;
}

try {
  setSubmitting(true);

  // ----------------------------------------------
  // Update existing attendance
  // ----------------------------------------------

  if (editingId) {
    const response = await apiPatch(
      `/attendance/${editingId}`,
      {
        status: selectedStatus,
      }
    );

    const updated =
      response?.attendance ||
      response?.data?.attendance ||
      null;

    if (updated) {
      setAttendance((current) =>
        current.map((record) =>
          String(record?._id) ===
          String(editingId)
            ? updated
            : record
        )
      );
    } else {
      await loadData();
    }

    setMessage(
      "Attendance updated successfully."
    );
  }

  // ----------------------------------------------
  // Create new attendance
  // ----------------------------------------------

  else {
    const response = await apiPost(
      "/attendance",
      {
        menteeId: selectedMentee,
        date: selectedDate,
        status: selectedStatus,
      }
    );

    const created =
      response?.attendance ||
      response?.data?.attendance ||
      null;

    if (created) {
      setAttendance((current) => [
        created,
        ...current,
      ]);
    } else {
      await loadData();
    }

    setMessage(
      "Attendance marked successfully."
    );
  }

  resetForm();
} catch (err) {
  console.error(
    "Attendance submit error:",
    err
  );

  setError(
    err?.message ||
      "Failed to save attendance."
  );
} finally {
  setSubmitting(false);
}

};

// ==================================================
// Edit record
// ==================================================

const handleEdit = (record) => {
const mentee = getMenteeInfo(
record,
mentees
);

setEditingId(record?._id || null);
setSelectedMentee(mentee.id || "");
setSelectedStatus(
  record?.status || "Present"
);

if (record?.date) {
  const date = new Date(record.date);

  if (!Number.isNaN(date.getTime())) {
    const year =
      date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    setSelectedDate(
      `${year}-${month}-${day}`
    );
  }
}

window.scrollTo({
  top: 0,
  behavior: "smooth",
});

};

// ==================================================
// Change status
// ==================================================

const handleStatusUpdate = async (
record,
newStatus
) => {
if (!record?._id) return;

if (record.status === newStatus) {
  return;
}

try {
  setError("");
  setMessage("");

  const response = await apiPatch(
    `/attendance/${record._id}`,
    {
      status: newStatus,
    }
  );

  const updated =
    response?.attendance ||
    response?.data?.attendance ||
    null;

  if (updated) {
    setAttendance((current) =>
      current.map((item) =>
        String(item?._id) ===
        String(record?._id)
          ? updated
          : item
      )
    );
  } else {
    await loadData();
  }

  setMessage(
    `Attendance marked ${newStatus.toLowerCase()}.`
  );
} catch (err) {
  console.error(
    "Status update error:",
    err
  );

  setError(
    err?.message ||
      "Failed to update attendance."
  );
}

};

// ==================================================
// History
// ==================================================

const loadHistory = async (record) => {
const mentee = getMenteeInfo(
record,
mentees
);

if (!mentee.id) {
  setError(
    "Mentee information is not available for this record."
  );
  return;
}

try {
  setHistoryOpen(true);
  setHistoryLoading(true);
  setHistory([]);
  setHistoryMentee(mentee);
  setError("");

  const response = await apiGet(
    `/attendance/history/${mentee.id}`
  );

  const historyList = extractArray(
    response,
    "history"
  );

  const returnedMentee =
    response?.mentee ||
    response?.data?.mentee ||
    null;

  setHistory(historyList);

  if (returnedMentee) {
    setHistoryMentee({
      ...mentee,
      ...returnedMentee,
      id:
        getId(returnedMentee) ||
        mentee.id,
    });
  }
} catch (err) {
  console.error(
    "History error:",
    err
  );

  setError(
    err?.message ||
      "Failed to load attendance history."
  );
} finally {
  setHistoryLoading(false);
}

};

const closeHistory = () => {
setHistoryOpen(false);
setHistory([]);
setHistoryMentee(null);
};

// ==================================================
// Loading
// ==================================================

if (loading) {
return (
<DashboardLayout role="Mentor">
<div className="flex min-h-[60vh] items-center justify-center bg-slate-950">
<div className="text-center">
<div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />

        <p className="text-sm text-slate-400">
          Loading attendance...
        </p>
      </div>
    </div>
  </DashboardLayout>
);

}

// ==================================================
// UI
// ==================================================

return (
<DashboardLayout role="Mentor">
<div className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">

    {/* ==========================================
        HEADER
    ========================================== */}

    <div className="mb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            Attendance
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Manage attendance for your assigned mentees.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-cyan-500 hover:text-cyan-400 sm:w-auto"
        >
          Refresh
        </button>
      </div>
    </div>


    {/* ==========================================
        ALERTS
    ========================================== */}

    {error && (
      <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        <XCircle className="mt-0.5 h-5 w-5 shrink-0" />

        <span>{error}</span>

        <button
          type="button"
          onClick={() => setError("")}
          className="ml-auto"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )}

    {message && (
      <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
        <Check className="mt-0.5 h-5 w-5 shrink-0" />

        <span>{message}</span>

        <button
          type="button"
          onClick={() => setMessage("")}
          className="ml-auto"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )}


    {/* ==========================================
        SUMMARY
    ========================================== */}

    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
          <CalendarDays className="h-5 w-5" />
        </div>

        <p className="text-sm text-slate-400">
          Total Records
        </p>

        <p className="mt-1 text-2xl font-bold">
          {summary.total}
        </p>
      </div>


      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
          <Check className="h-5 w-5" />
        </div>

        <p className="text-sm text-slate-400">
          Present
        </p>

        <p className="mt-1 text-2xl font-bold text-emerald-400">
          {summary.present}
        </p>
      </div>


      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
          <XCircle className="h-5 w-5" />
        </div>

        <p className="text-sm text-slate-400">
          Absent
        </p>

        <p className="mt-1 text-2xl font-bold text-red-400">
          {summary.absent}
        </p>
      </div>


      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
          <UserCheck className="h-5 w-5" />
        </div>

        <p className="text-sm text-slate-400">
          Presence
        </p>

        <p className="mt-1 text-2xl font-bold text-blue-400">
          {summary.percentage}%
        </p>
      </div>
    </div>


    {/* ==========================================
        MARK ATTENDANCE
    ========================================== */}

    <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">

      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
          <UserCheck className="h-5 w-5" />
        </div>

        <div>
          <h2 className="font-semibold">
            {editingId
              ? "Update Attendance"
              : "Mark Attendance"}
          </h2>

          <p className="text-sm text-slate-400">
            {editingId
              ? "Update the selected attendance record."
              : "Select a mentee, date and attendance status."}
          </p>
        </div>
      </div>


      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4 md:grid-cols-4"
      >

        {/* Mentee */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Mentee
          </label>

          <select
            value={selectedMentee}
            onChange={(event) =>
              setSelectedMentee(
                event.target.value
              )
            }
            disabled={!!editingId}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="">
              Select mentee
            </option>

            {mentees.map((mentee) => {
              const id = getId(mentee);

              return (
                <option
                  key={id}
                  value={id}
                >
                  {mentee?.name ||
                    "Unknown mentee"}
                </option>
              );
            })}
          </select>
        </div>


        {/* Date */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Date
          </label>

          <input
            type="date"
            value={selectedDate}
            onChange={(event) =>
              setSelectedDate(
                event.target.value
              )
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500"
          />
        </div>


        {/* Status */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Status
          </label>

          <select
            value={selectedStatus}
            onChange={(event) =>
              setSelectedStatus(
                event.target.value
              )
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500"
          >
            <option value="Present">
              Present
            </option>

            <option value="Absent">
              Absent
            </option>
          </select>
        </div>


        {/* Submit */}
        <div className="flex items-end gap-2">

          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "Saving..."
              : editingId
              ? "Update Attendance"
              : "Mark Attendance"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>


    {/* ==========================================
        ATTENDANCE RECORDS
    ========================================== */}

    <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">

      {/* Header */}
      <div className="border-b border-slate-800 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <h2 className="font-semibold">
              Attendance Records
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              View attendance and change the status when required.
            </p>
          </div>

          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search mentee..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500"
            />
          </div>
        </div>
      </div>


      {/* Empty */}
      {filteredAttendance.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <Users className="mx-auto mb-4 h-10 w-10 text-slate-600" />

          <h3 className="font-medium text-slate-300">
            No attendance records found
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {search
              ? "Try a different search."
              : "Attendance records will appear here."}
          </p>
        </div>
      ) : (
        <>
          {/* ======================================
              MOBILE
          ====================================== */}

          <div className="space-y-3 p-4 md:hidden">

            {filteredAttendance.map(
              (record) => {
                const mentee =
                  getMenteeInfo(
                    record,
                    mentees
                  );

                const isPresent =
                  record?.status ===
                  "Present";

                return (
                  <div
                    key={record?._id}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">
                          {mentee.name}
                        </p>

                        {mentee.email && (
                          <p className="mt-1 truncate text-xs text-slate-500">
                            {mentee.email}
                          </p>
                        )}

                        {mentee.rollNumber && (
                          <p className="mt-1 text-xs text-slate-500">
                            Roll No:{" "}
                            {mentee.rollNumber}
                          </p>
                        )}
                      </div>


                      {/* CURRENT STATUS */}
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                          isPresent
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {isPresent
                          ? "Present"
                          : "Absent"}
                      </span>
                    </div>


                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">

                      <div>
                        <p className="text-xs text-slate-500">
                          Date
                        </p>

                        <p className="mt-1 text-slate-300">
                          {formatDate(
                            record?.date
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Course
                        </p>

                        <p className="mt-1 text-slate-300">
                          {mentee.course ||
                            "—"}
                        </p>
                      </div>
                    </div>


                    {/* ACTIONS */}
                    <div className="mt-4 flex flex-wrap gap-2">

                      {!isPresent && (
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusUpdate(
                              record,
                              "Present"
                            )
                          }
                          className="rounded-lg border border-emerald-500/30 px-3 py-2 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/10"
                        >
                          Mark Present
                        </button>
                      )}

                      {isPresent && (
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusUpdate(
                              record,
                              "Absent"
                            )
                          }
                          className="rounded-lg border border-red-500/30 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/10"
                        >
                          Mark Absent
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(record)
                        }
                        className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400"
                      >
                        <span className="flex items-center gap-1.5">
                          <Edit3 className="h-3.5 w-3.5" />
                          Edit
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          loadHistory(record)
                        }
                        className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400"
                      >
                        <span className="flex items-center gap-1.5">
                          <History className="h-3.5 w-3.5" />
                          History
                        </span>
                      </button>
                    </div>
                  </div>
                );
              }
            )}
          </div>


          {/* ======================================
              DESKTOP
          ====================================== */}

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[850px]">

              <thead>
                <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-500">

                  <th className="px-5 py-4 font-medium">
                    Mentee
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Course
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Date
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right font-medium">
                    Actions
                  </th>

                </tr>
              </thead>


              <tbody>
                {filteredAttendance.map(
                  (record) => {
                    const mentee =
                      getMenteeInfo(
                        record,
                        mentees
                      );

                    const isPresent =
                      record?.status ===
                      "Present";

                    return (
                      <tr
                        key={record?._id}
                        className="border-b border-slate-800/70 transition hover:bg-slate-800/30"
                      >

                        <td className="px-5 py-4">
                          <div>
                            <p className="font-medium text-white">
                              {mentee.name}
                            </p>

                            {mentee.email && (
                              <p className="mt-1 text-xs text-slate-500">
                                {mentee.email}
                              </p>
                            )}
                          </div>
                        </td>


                        <td className="px-5 py-4 text-sm text-slate-300">
                          {mentee.course ||
                            "—"}
                        </td>


                        <td className="px-5 py-4 text-sm text-slate-300">
                          {formatDate(
                            record?.date
                          )}
                        </td>


                        {/* CURRENT STATUS */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              isPresent
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-red-500/10 text-red-400"
                            }`}
                          >
                            {isPresent
                              ? "Present"
                              : "Absent"}
                          </span>
                        </td>


                        {/* ACTIONS */}
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">

                            {!isPresent && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleStatusUpdate(
                                    record,
                                    "Present"
                                  )
                                }
                                className="rounded-lg border border-emerald-500/30 px-3 py-1.5 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/10"
                              >
                                Mark Present
                              </button>
                            )}

                            {isPresent && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleStatusUpdate(
                                    record,
                                    "Absent"
                                  )
                                }
                                className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/10"
                              >
                                Mark Absent
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(record)
                              }
                              className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:border-cyan-500 hover:text-cyan-400"
                              title="Edit attendance"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                loadHistory(record)
                              }
                              className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:border-cyan-500 hover:text-cyan-400"
                              title="View history"
                            >
                              <History className="h-4 w-4" />
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  </div>


  {/* ==================================================
      HISTORY MODAL
  ================================================== */}

  {historyOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

      <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 p-5">

          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-white">
              Attendance History
            </h2>

            <p className="mt-1 truncate text-sm text-slate-400">
              {historyMentee?.name ||
                "Unknown mentee"}
            </p>
          </div>

          <button
            type="button"
            onClick={closeHistory}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>


        {/* Body */}
        <div className="max-h-[65vh] overflow-y-auto p-5">

          {historyLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center">
              <Clock3 className="mx-auto mb-3 h-9 w-9 text-slate-600" />

              <p className="text-sm text-slate-400">
                No attendance history found.
              </p>
            </div>
          ) : (
            <div className="space-y-3">

              {history.map((record) => {
                const isPresent =
                  record?.status ===
                  "Present";

                return (
                  <div
                    key={
                      record?._id ||
                      `${record?.date}-${record?.status}`
                    }
                    className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >

                    <div>
                      <p className="font-medium text-white">
                        {formatDate(
                          record?.date
                        )}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Updated:{" "}
                        {formatDateTime(
                          record?.updatedAt ||
                            record?.createdAt
                        )}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                        isPresent
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {isPresent
                        ? "Present"
                        : "Absent"}
                    </span>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )}
</DashboardLayout>

);
}