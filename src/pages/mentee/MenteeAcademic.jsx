import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Search,
  RefreshCw,
  Eye,
  X,
  GraduationCap,
  Award,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import DashboardLayout from "../../components/common/Sidebar";
import { apiGet } from "../../services/api";

function MenteeAcademic() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [error, setError] = useState("");

  const fetchAcademic = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const response = await apiGet(
        "/academic/mentee-academic"
      );

      setRecords(response.records || []);
    } catch (err) {
      setError(
        err.message ||
          "Failed to fetch academic records."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAcademic();
  }, []);

  const filteredRecords = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return records;

    return records.filter((record) => {
      return (
        String(record.semester || "")
          .toLowerCase()
          .includes(value) ||
        String(record.result || "")
          .toLowerCase()
          .includes(value) ||
        String(record.overallGrade || "")
          .toLowerCase()
          .includes(value) ||
        String(record.sgpa || "")
          .toLowerCase()
          .includes(value) ||
        String(record.cgpa || "")
          .toLowerCase()
          .includes(value)
      );
    });
  }, [records, search]);

  const latestRecord =
    records.length > 0
      ? [...records].sort(
          (a, b) =>
            Number(b.semester || 0) -
            Number(a.semester || 0)
        )[0]
      : null;

  const highestSGPA =
    records.length > 0
      ? Math.max(
          ...records
            .map((record) => Number(record.sgpa))
            .filter((value) => Number.isFinite(value))
        )
      : null;

  const passedRecords = records.filter(
    (record) => record.result === "PASS"
  ).length;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">

          {/* HEADER */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10">
                <BookOpen className="h-6 w-6 text-cyan-400" />
              </div>

              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">
                  My Academic Records
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                  View your semester-wise academic performance
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => fetchAcademic(false)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-800"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>
          </div>

          {/* ERROR */}
          {error && (
            <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              <AlertCircle className="h-5 w-5 shrink-0" />
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

          {/* STAT CARDS */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Semesters
                  </p>

                  <p className="mt-2 text-2xl font-bold">
                    {records.length}
                  </p>
                </div>

                <div className="rounded-xl bg-cyan-500/10 p-3">
                  <GraduationCap className="h-5 w-5 text-cyan-400" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Latest SGPA
                  </p>

                  <p className="mt-2 text-2xl font-bold text-cyan-300">
                    {latestRecord?.sgpa ?? "-"}
                  </p>
                </div>

                <div className="rounded-xl bg-cyan-500/10 p-3">
                  <Award className="h-5 w-5 text-cyan-400" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Highest SGPA
                  </p>

                  <p className="mt-2 text-2xl font-bold text-cyan-300">
                    {highestSGPA !== null
                      ? highestSGPA
                      : "-"}
                  </p>
                </div>

                <div className="rounded-xl bg-emerald-500/10 p-3">
                  <Award className="h-5 w-5 text-emerald-400" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Passed
                  </p>

                  <p className="mt-2 text-2xl font-bold text-emerald-300">
                    {passedRecords}
                  </p>
                </div>

                <div className="rounded-xl bg-emerald-500/10 p-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>
              </div>
            </div>
          </div>

          {/* SEARCH */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search semester, result, grade, SGPA..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500"
            />
          </div>

          {/* RECORDS */}
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
            <div className="overflow-x-auto">
              <table className="min-w-[800px] w-full">
                <thead className="border-b border-slate-800 bg-slate-900">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Semester
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      SGPA
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      CGPA
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Grade
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Result
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Subjects
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      View
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">
                  {loading ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-5 py-16 text-center text-sm text-slate-500"
                      >
                        Loading academic records...
                      </td>
                    </tr>
                  ) : filteredRecords.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-5 py-16 text-center"
                      >
                        <BookOpen className="mx-auto h-10 w-10 text-slate-700" />

                        <p className="mt-3 text-sm font-medium text-slate-400">
                          No academic records available
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          Your mentor has not added any academic result yet.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record) => (
                      <tr
                        key={record._id}
                        className="transition hover:bg-slate-800/40"
                      >
                        <td className="px-5 py-4 text-sm font-semibold">
                          Semester {record.semester}
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-cyan-300">
                          {record.sgpa ?? "-"}
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-cyan-300">
                          {record.cgpa ?? "-"}
                        </td>

                        <td className="px-5 py-4 text-sm">
                          {record.overallGrade || "-"}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              record.result === "PASS"
                                ? "bg-emerald-500/10 text-emerald-300"
                                : record.result === "FAIL"
                                ? "bg-red-500/10 text-red-300"
                                : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            {record.result || "N/A"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-400">
                          {record.subjects?.length || 0}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedRecord(record)
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:border-cyan-500/40 hover:bg-cyan-500/10 hover:text-cyan-300"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE CARD VIEW */}
          {!loading && filteredRecords.length > 0 && (
            <div className="grid gap-4 md:hidden">
              {filteredRecords.map((record) => (
                <div
                  key={`mobile-${record._id}`}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">
                        Semester {record.semester}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {record.subjects?.length || 0} subjects
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        record.result === "PASS"
                          ? "bg-emerald-500/10 text-emerald-300"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {record.result || "N/A"}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-950 p-3">
                      <p className="text-xs text-slate-500">
                        SGPA
                      </p>
                      <p className="mt-1 font-semibold text-cyan-300">
                        {record.sgpa ?? "-"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-950 p-3">
                      <p className="text-xs text-slate-500">
                        CGPA
                      </p>
                      <p className="mt-1 font-semibold text-cyan-300">
                        {record.cgpa ?? "-"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedRecord(record)
                    }
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* =====================================================
            DETAILS MODAL
        ===================================================== */}

        {selectedRecord && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
            <div className="mx-auto my-8 max-w-5xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 p-5">
                <div>
                  <h2 className="text-xl font-bold">
                    Semester {selectedRecord.semester}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Academic performance details
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedRecord(null)
                  }
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6 p-5">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <p className="text-xs text-slate-500">
                      SGPA
                    </p>
                    <p className="mt-1 text-xl font-bold text-cyan-300">
                      {selectedRecord.sgpa ?? "-"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <p className="text-xs text-slate-500">
                      CGPA
                    </p>
                    <p className="mt-1 text-xl font-bold text-cyan-300">
                      {selectedRecord.cgpa ?? "-"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <p className="text-xs text-slate-500">
                      Grade
                    </p>
                    <p className="mt-1 text-xl font-bold">
                      {selectedRecord.overallGrade || "-"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <p className="text-xs text-slate-500">
                      Total
                    </p>
                    <p className="mt-1 text-xl font-bold">
                      {selectedRecord.grandTotal ?? "-"}
                      {selectedRecord.maximumMarks
                        ? ` / ${selectedRecord.maximumMarks}`
                        : ""}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <p className="text-xs text-slate-500">
                      Result
                    </p>
                    <p className="mt-1 text-xl font-bold text-emerald-300">
                      {selectedRecord.result || "-"}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 font-semibold">
                    Subject Performance
                  </h3>

                  <div className="overflow-x-auto rounded-xl border border-slate-800">
                    <table className="min-w-[900px] w-full">
                      <thead className="bg-slate-950">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs text-slate-500">
                            Subject
                          </th>
                          <th className="px-4 py-3 text-left text-xs text-slate-500">
                            Code
                          </th>
                          <th className="px-4 py-3 text-left text-xs text-slate-500">
                            Internal
                          </th>
                          <th className="px-4 py-3 text-left text-xs text-slate-500">
                            SEE
                          </th>
                          <th className="px-4 py-3 text-left text-xs text-slate-500">
                            Total
                          </th>
                          <th className="px-4 py-3 text-left text-xs text-slate-500">
                            Grade
                          </th>
                          <th className="px-4 py-3 text-left text-xs text-slate-500">
                            GP
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-800">
                        {(selectedRecord.subjects || []).map(
                          (subject, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3 text-sm">
                                {subject.subjectName}
                              </td>

                              <td className="px-4 py-3 text-sm text-slate-400">
                                {subject.code || "-"}
                              </td>

                              <td className="px-4 py-3 text-sm">
                                {subject.internalMarks ?? "-"}
                              </td>

                              <td className="px-4 py-3 text-sm">
                                {subject.seeMarks ?? "-"}
                              </td>

                              <td className="px-4 py-3 text-sm">
                                {subject.totalMarks ?? "-"}
                              </td>

                              <td className="px-4 py-3 text-sm font-semibold">
                                {subject.grade || "-"}
                              </td>

                              <td className="px-4 py-3 text-sm">
                                {subject.gradePoint ?? "-"}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {selectedRecord.remarks && (
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <p className="text-xs text-slate-500">
                      Remarks
                    </p>

                    <p className="mt-2 text-sm text-slate-300">
                      {selectedRecord.remarks}
                    </p>
                  </div>
                )}

                {selectedRecord.resultDeclaredOn && (
                  <p className="text-xs text-slate-500">
                    Result declared on:{" "}
                    {new Date(
                      selectedRecord.resultDeclaredOn
                    ).toLocaleDateString("en-IN")}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default MenteeAcademic;