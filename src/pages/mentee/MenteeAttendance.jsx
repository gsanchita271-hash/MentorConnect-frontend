import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  UserRound,
  XCircle,
} from "lucide-react";

import DashboardLayout from "../../components/common/Sidebar";
import { apiGet } from "../../services/api";

/* ----------------------------- Helpers ----------------------------- */

const safeArray = (value) => {
  return Array.isArray(value) ? value : [];
};

const safeString = (value, fallback = "") => {
  return typeof value === "string" ? value : fallback;
};

const normalizeStatus = (status) => {
  return status === "Absent" ? "Absent" : "Present";
};

const getRecordId = (record) => {
  if (!record) return "";
  return record._id || record.id || "";
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

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const extractAttendance = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.attendance)) {
    return response.attendance;
  }

  if (Array.isArray(response?.records)) {
    return response.records;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

const extractSummary = (response, attendance) => {
  const backendSummary = response?.summary;

  if (
    backendSummary &&
    typeof backendSummary === "object"
  ) {
    const total = Number(backendSummary.total);
    const present = Number(backendSummary.present);
    const absent = Number(backendSummary.absent);
    const percentage = Number(
      backendSummary.percentage
    );

    return {
      total: Number.isFinite(total)
        ? total
        : attendance.length,

      present: Number.isFinite(present)
        ? present
        : attendance.filter(
            (item) => item?.status === "Present"
          ).length,

      absent: Number.isFinite(absent)
        ? absent
        : attendance.filter(
            (item) => item?.status === "Absent"
          ).length,

      percentage: Number.isFinite(percentage)
        ? percentage
        : calculatePercentage(attendance),
    };
  }

  const present = attendance.filter(
    (item) => item?.status === "Present"
  ).length;

  const absent = attendance.filter(
    (item) => item?.status === "Absent"
  ).length;

  return {
    total: attendance.length,
    present,
    absent,
    percentage: calculatePercentage(attendance),
  };
};

const calculatePercentage = (attendance) => {
  const records = safeArray(attendance);

  if (records.length === 0) {
    return 0;
  }

  const present = records.filter(
    (item) => item?.status === "Present"
  ).length;

  return Number(
    ((present / records.length) * 100).toFixed(1)
  );
};

/* -------------------------- Main Component ------------------------- */

function MenteeAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    present: 0,
    absent: 0,
    percentage: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState("All");

  /* ---------------------------- Load Data ---------------------------- */

  const loadAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiGet(
        "/attendance/mentee-attendance"
      );

      const records = extractAttendance(response);

      setAttendance(records);
      setSummary(
        extractSummary(response, records)
      );
    } catch (err) {
      console.error(
        "Mentee attendance load error:",
        err
      );

      setAttendance([]);

      setSummary({
        total: 0,
        present: 0,
        absent: 0,
        percentage: 0,
      });

      setError(
        err?.message ||
          "Unable to load attendance."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  /* ----------------------------- Filter ----------------------------- */

  const filteredAttendance = useMemo(() => {
    const records = safeArray(attendance);

    if (filter === "Present") {
      return records.filter(
        (record) => record?.status === "Present"
      );
    }

    if (filter === "Absent") {
      return records.filter(
        (record) => record?.status === "Absent"
      );
    }

    return records;
  }, [attendance, filter]);

  /* ------------------------------ UI ------------------------------ */

  return (
    <DashboardLayout
      title="My Attendance"
      subtitle="View your attendance records and attendance percentage"
    >
      <div className="space-y-6">
        {/* HEADER */}
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10">
              <ClipboardCheck className="h-6 w-6 text-cyan-400" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white">
                My Attendance
              </h1>

              <p className="text-sm text-slate-400">
                Track your attendance records and
                overall attendance percentage.
              </p>
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* SUMMARY */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={<ClipboardCheck />}
            label="Total Classes"
            value={summary.total}
          />

          <SummaryCard
            icon={<CheckCircle2 />}
            label="Present"
            value={summary.present}
          />

          <SummaryCard
            icon={<XCircle />}
            label="Absent"
            value={summary.absent}
          />

          <SummaryCard
            icon={<CalendarDays />}
            label="Attendance"
            value={`${summary.percentage}%`}
            highlight
          />
        </div>

        {/* ATTENDANCE STATUS */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Attendance Overview
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Your current attendance percentage.
              </p>
            </div>

            <AttendanceProgress
              percentage={summary.percentage}
            />
          </div>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-cyan-400 transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(
                    0,
                    Number(summary.percentage) || 0
                  )
                )}%`,
              }}
            />
          </div>

          <div className="mt-3 flex justify-between text-xs text-slate-500">
            <span>0%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </section>

        {/* RECORDS */}
        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
          <div className="flex flex-col gap-4 border-b border-slate-800 p-5 sm:p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Attendance History
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                View your daily attendance records.
              </p>
            </div>

            <div className="flex w-full gap-2 md:w-auto">
              <FilterButton
                active={filter === "All"}
                onClick={() => setFilter("All")}
              >
                All
              </FilterButton>

              <FilterButton
                active={filter === "Present"}
                onClick={() =>
                  setFilter("Present")
                }
              >
                Present
              </FilterButton>

              <FilterButton
                active={filter === "Absent"}
                onClick={() =>
                  setFilter("Absent")
                }
              >
                Absent
              </FilterButton>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-60 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-cyan-400" />
            </div>
          ) : filteredAttendance.length === 0 ? (
            <EmptyState filter={filter} />
          ) : (
            <>
              {/* MOBILE CARDS */}
              <div className="space-y-3 p-4 md:hidden">
                {filteredAttendance.map(
                  (record, index) => {
                    const recordId =
                      getRecordId(record) ||
                      `attendance-${index}`;

                    return (
                      <div
                        key={recordId}
                        className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-400/10">
                              <UserRound className="h-5 w-5 text-cyan-400" />
                            </div>

                            <div>
                              <p className="text-sm font-medium text-white">
                                Attendance
                              </p>

                              <p className="text-xs text-slate-500">
                                {formatDate(
                                  record?.date
                                )}
                              </p>
                            </div>
                          </div>

                          <StatusBadge
                            status={normalizeStatus(
                              record?.status
                            )}
                          />
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <InfoItem
                            label="Date"
                            value={formatDate(
                              record?.date
                            )}
                          />

                          <InfoItem
                            label="Status"
                            value={normalizeStatus(
                              record?.status
                            )}
                          />
                        </div>

                        {record?.updatedAt && (
                          <p className="mt-4 text-xs text-slate-500">
                            Updated{" "}
                            {formatDateTime(
                              record.updatedAt
                            )}
                          </p>
                        )}
                      </div>
                    );
                  }
                )}
              </div>

              {/* DESKTOP TABLE */}
              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full text-left">
                  <thead className="border-b border-slate-800 bg-slate-950/50">
                    <tr>
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Date
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Day
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Status
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Last Updated
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800">
                    {filteredAttendance.map(
                      (record, index) => {
                        const recordId =
                          getRecordId(record) ||
                          `attendance-${index}`;

                        return (
                          <tr
                            key={recordId}
                            className="transition hover:bg-slate-800/30"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400/10">
                                  <CalendarDays className="h-4 w-4 text-cyan-400" />
                                </div>

                                <span className="text-sm font-medium text-white">
                                  {formatDate(
                                    record?.date
                                  )}
                                </span>
                              </div>
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-300">
                              {getDayName(
                                record?.date
                              )}
                            </td>

                            <td className="px-5 py-4">
                              <StatusBadge
                                status={normalizeStatus(
                                  record?.status
                                )}
                              />
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-400">
                              {formatDateTime(
                                record?.updatedAt
                              )}
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
        </section>
      </div>
    </DashboardLayout>
  );
}

/* --------------------------- Components --------------------------- */

function SummaryCard({
  icon,
  label,
  value,
  highlight = false,
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
          <span className="h-5 w-5 [&>svg]:h-5 [&>svg]:w-5">
            {icon}
          </span>
        </div>

        <span
          className={`text-2xl font-bold ${
            highlight
              ? "text-cyan-400"
              : "text-white"
          }`}
        >
          {value}
        </span>
      </div>

      <p className="mt-4 text-sm text-slate-400">
        {label}
      </p>
    </div>
  );
}

function AttendanceProgress({ percentage }) {
  const numericPercentage = Number(percentage) || 0;

  let label = "Attendance";

  if (numericPercentage >= 75) {
    label = "75%+ attendance";
  } else {
    label = "Below 75%";
  }

  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className="text-2xl font-bold text-white">
          {numericPercentage}%
        </p>

        <p
          className={`text-xs ${
            numericPercentage >= 75
              ? "text-emerald-400"
              : "text-amber-400"
          }`}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const safeStatus =
    status === "Absent"
      ? "Absent"
      : "Present";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        safeStatus === "Present"
          ? "bg-emerald-400/10 text-emerald-300"
          : "bg-red-400/10 text-red-300"
      }`}
    >
      {safeStatus}
    </span>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition md:flex-none ${
        active
          ? "bg-cyan-500 text-slate-950"
          : "border border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-600 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm text-slate-300">
        {value || "—"}
      </p>
    </div>
  );
}

function EmptyState({ filter }) {
  return (
    <div className="flex min-h-60 flex-col items-center justify-center px-5 text-center">
      <ClipboardCheck className="mb-3 h-10 w-10 text-slate-600" />

      <p className="font-medium text-slate-300">
        {filter === "All"
          ? "No attendance records found"
          : `No ${filter.toLowerCase()} records found`}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        Your attendance records will appear here.
      </p>
    </div>
  );
}

function getDayName(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    weekday: "long",
  });
}

export default MenteeAttendance;