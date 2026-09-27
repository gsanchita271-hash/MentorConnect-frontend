import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Plus,
  Search,
  RefreshCw,
  Trash2,
  Pencil,
  X,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Eye,
} from "lucide-react";

import DashboardLayout from "../../components/common/Sidebar";
import {
  apiGet,
  apiPost,
  apiPatch,
  apiDelete,
  getUser,
  getToken,
} from "../../services/api";

function MentorAcademic() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    mentee: "",
    semester: "",
    sgpa: "",
    cgpa: "",
    grandTotal: "",
    maximumMarks: "",
    result: "",
    overallGrade: "",
    resultDeclaredOn: "",
    remarks: "",
  });

  const [subjects, setSubjects] = useState([
    {
      subjectName: "",
      code: "",
      internalMarks: "",
      seeMarks: "",
      totalMarks: "",
      grade: "",
      gradePoint: "",
      credits: 2,
    },
  ]);

  const [uploadFile, setUploadFile] = useState(null);
  const [ocrData, setOcrData] = useState(null);
  const [ocrSubjects, setOcrSubjects] = useState([]);
  const [ocrMentee, setOcrMentee] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [savingOCR, setSavingOCR] = useState(false);

  const fileInputRef = useRef(null);

  const user = getUser();

  /* =========================================================
     FETCH ACADEMIC RECORDS
  ========================================================= */

  const fetchRecords = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);

      setError("");

      const response = await apiGet("/academic/my-academic");

      setRecords(response.records || []);
    } catch (err) {
      setError(err.message || "Failed to fetch academic records.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredRecords = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return records;

    return records.filter((record) => {
      const mentee = record.mentee || {};

      return (
        String(mentee.name || "")
          .toLowerCase()
          .includes(value) ||
        String(mentee.ern || "")
          .toLowerCase()
          .includes(value) ||
        String(mentee.rollNumber || "")
          .toLowerCase()
          .includes(value) ||
        String(record.semester || "")
          .toLowerCase()
          .includes(value) ||
        String(record.result || "")
          .toLowerCase()
          .includes(value)
      );
    });
  }, [records, search]);

  /* =========================================================
     FORM HELPERS
  ========================================================= */

  const resetForm = () => {
    setForm({
      mentee: "",
      semester: "",
      sgpa: "",
      cgpa: "",
      grandTotal: "",
      maximumMarks: "",
      result: "",
      overallGrade: "",
      resultDeclaredOn: "",
      remarks: "",
    });

    setSubjects([
      {
        subjectName: "",
        code: "",
        internalMarks: "",
        seeMarks: "",
        totalMarks: "",
        grade: "",
        gradePoint: "",
        credits: 2,
      },
    ]);

    setEditingRecord(null);
    setError("");
    setMessage("");
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (record) => {
    setEditingRecord(record);

    setForm({
      mentee: record.mentee?._id || record.mentee || "",
      semester: record.semester || "",
      sgpa: record.sgpa ?? "",
      cgpa: record.cgpa ?? "",
      grandTotal: record.grandTotal ?? "",
      maximumMarks: record.maximumMarks ?? "",
      result: record.result || "",
      overallGrade: record.overallGrade || "",
      resultDeclaredOn: record.resultDeclaredOn
        ? String(record.resultDeclaredOn).slice(0, 10)
        : "",
      remarks: record.remarks || "",
    });

    setSubjects(
      Array.isArray(record.subjects) && record.subjects.length > 0
        ? record.subjects
        : [
            {
              subjectName: "",
              code: "",
              internalMarks: "",
              seeMarks: "",
              totalMarks: "",
              grade: "",
              gradePoint: "",
              credits: 2,
            },
          ]
    );

    setError("");
    setMessage("");
    setShowForm(true);
  };

  const updateForm = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateSubject = (index, field, value) => {
    setSubjects((previous) =>
      previous.map((subject, subjectIndex) =>
        subjectIndex === index
          ? {
              ...subject,
              [field]: value,
            }
          : subject
      )
    );
  };

  const addSubject = () => {
    setSubjects((previous) => [
      ...previous,
      {
        subjectName: "",
        code: "",
        internalMarks: "",
        seeMarks: "",
        totalMarks: "",
        grade: "",
        gradePoint: "",
        credits: 2,
      },
    ]);
  };

  const removeSubject = (index) => {
    setSubjects((previous) =>
      previous.filter((_, subjectIndex) => subjectIndex !== index)
    );
  };

  /* =========================================================
     CREATE / UPDATE
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError("");
      setMessage("");

      if (!form.mentee) {
        setError("Mentee is required.");
        return;
      }

      if (!form.semester) {
        setError("Semester is required.");
        return;
      }

      const cleanedSubjects = subjects
        .filter((subject) => subject.subjectName.trim())
        .map((subject) => ({
          ...subject,
          internalMarks:
            subject.internalMarks === ""
              ? null
              : Number(subject.internalMarks),
          seeMarks:
            subject.seeMarks === ""
              ? null
              : Number(subject.seeMarks),
          totalMarks:
            subject.totalMarks === ""
              ? null
              : Number(subject.totalMarks),
          gradePoint:
            subject.gradePoint === ""
              ? null
              : Number(subject.gradePoint),
          credits:
            subject.credits === ""
              ? 2
              : Number(subject.credits),
        }));

      const payload = {
        mentee: form.mentee,
        semester: Number(form.semester),
        subjects: cleanedSubjects,
        sgpa: form.sgpa === "" ? null : Number(form.sgpa),
        cgpa: form.cgpa === "" ? null : Number(form.cgpa),
        grandTotal:
          form.grandTotal === "" ? null : Number(form.grandTotal),
        maximumMarks:
          form.maximumMarks === ""
            ? null
            : Number(form.maximumMarks),
        result: form.result,
        overallGrade: form.overallGrade,
        resultDeclaredOn: form.resultDeclaredOn || null,
        remarks: form.remarks,
      };

      if (editingRecord) {
        await apiPatch(`/academic/${editingRecord._id}`, payload);
        setMessage("Academic record updated successfully.");
      } else {
        await apiPost("/academic/", payload);
        setMessage("Academic record created successfully.");
      }

      setShowForm(false);
      resetForm();

      await fetchRecords(false);
    } catch (err) {
      setError(err.message || "Failed to save academic record.");
    }
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this academic record?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await apiDelete(`/academic/${id}`);

      setMessage("Academic record deleted successfully.");

      await fetchRecords(false);
    } catch (err) {
      setError(err.message || "Failed to delete academic record.");
    }
  };

  /* =========================================================
     DETAILS
  ========================================================= */

  const openDetails = async (record) => {
    try {
      setError("");

      const menteeId =
        record.mentee?._id || record.mentee;

      if (!menteeId) {
        setSelectedRecord(record);
        setShowDetails(true);
        return;
      }

      const response = await apiGet(
        `/academic/mentee/${menteeId}`
      );

      const matchingRecord = (response.records || []).find(
        (item) => item._id === record._id
      );

      setSelectedRecord(matchingRecord || record);
      setShowDetails(true);
    } catch (err) {
      setSelectedRecord(record);
      setShowDetails(true);
      setError(err.message || "Failed to fetch record details.");
    }
  };

  /* =========================================================
     OCR UPLOAD
  ========================================================= */

  const resetUpload = () => {
    setUploadFile(null);
    setOcrData(null);
    setOcrSubjects([]);
    setOcrMentee(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadOCR = async () => {
    if (!uploadFile) {
      setError("Please select a JPG or PNG result card.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setMessage("");

      const formData = new FormData();
      formData.append("result", uploadFile);

      const token = getToken();

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL ||
          "https://mentorconnect-a7c8.onrender.com/api"
        }/academic/upload-result`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "OCR processing failed."
        );
      }

      setOcrData(data.extractedData || {});
      setOcrSubjects(data.subjects || []);
      setOcrMentee(data.matchedMentee || null);

      setShowUpload(true);
    } catch (err) {
      setError(err.message || "Failed to process result card.");
    } finally {
      setUploading(false);
    }
  };

  /* =========================================================
     OCR FIELD UPDATE
  ========================================================= */

  const updateOCRData = (field, value) => {
    setOcrData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateOCRSubject = (index, field, value) => {
    setOcrSubjects((previous) =>
      previous.map((subject, subjectIndex) =>
        subjectIndex === index
          ? {
              ...subject,
              [field]: value,
            }
          : subject
      )
    );
  };

  /* =========================================================
     CONFIRM OCR
  ========================================================= */

  const confirmOCR = async () => {
    try {
      setSavingOCR(true);
      setError("");
      setMessage("");

      if (!ocrMentee?._id) {
        setError("Mentee could not be identified.");
        return;
      }

      if (!ocrData?.semester) {
        setError("Semester could not be detected.");
        return;
      }

      if (!ocrSubjects.length) {
        setError("No subjects found.");
        return;
      }

      const payload = {
        mentee: ocrMentee._id,
        semester: Number(ocrData.semester),
        subjects: ocrSubjects,
        sgpa:
          ocrData.sgpa === "" || ocrData.sgpa == null
            ? null
            : Number(ocrData.sgpa),
        cgpa:
          ocrData.cgpa === "" || ocrData.cgpa == null
            ? null
            : Number(ocrData.cgpa),
        grandTotal:
          ocrData.grandTotal === "" ||
          ocrData.grandTotal == null
            ? null
            : Number(ocrData.grandTotal),
        maximumMarks:
          ocrData.maximumMarks === "" ||
          ocrData.maximumMarks == null
            ? null
            : Number(ocrData.maximumMarks),
        result: ocrData.result || "",
        overallGrade: ocrData.overallGrade || "",
        resultDeclaredOn:
          ocrData.resultDeclaredOn || null,
        remarks: "",
      };

      await apiPost("/academic/confirm-result", payload);

      setMessage(
        "OCR academic result saved successfully."
      );

      setShowUpload(false);
      resetUpload();

      await fetchRecords(false);
    } catch (err) {
      setError(
        err.message || "Failed to save OCR result."
      );
    } finally {
      setSavingOCR(false);
    }
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">

          {/* HEADER */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10">
                  <BookOpen className="h-6 w-6 text-cyan-400" />
                </div>

                <div>
                  <h1 className="text-2xl font-bold sm:text-3xl">
                    Academic Records
                  </h1>

                  <p className="text-sm text-slate-400">
                    Manage academic performance of your mentees
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  resetUpload();
                  setShowUpload(true);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
              >
                <Upload className="h-4 w-4" />
                Upload Result
              </button>

              <button
                type="button"
                onClick={openCreate}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                <Plus className="h-4 w-4" />
                Add Academic Record
              </button>
            </div>
          </div>

          {/* ALERTS */}
          {message && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              {message}
            </div>
          )}

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

          {/* SEARCH / REFRESH */}
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search mentee, ERN, roll number, semester..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
              />
            </div>

            <button
              type="button"
              onClick={() => fetchRecords(false)}
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

          {/* TABLE */}
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full">
                <thead className="border-b border-slate-800 bg-slate-900">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Mentee
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      ERN
                    </th>

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
                      Result
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Actions
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
                          No academic records found
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          Add a record or upload a university result.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record) => {
                      const mentee = record.mentee || {};

                      return (
                        <tr
                          key={record._id}
                          className="transition hover:bg-slate-800/40"
                        >
                          <td className="px-5 py-4">
                            <div className="font-medium text-white">
                              {mentee.name || "Unknown"}
                            </div>

                            <div className="mt-1 text-xs text-slate-500">
                              {mentee.email || "-"}
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-300">
                            {mentee.ern || "-"}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-300">
                            Semester {record.semester}
                          </td>

                          <td className="px-5 py-4 text-sm font-semibold text-cyan-300">
                            {record.sgpa ?? "-"}
                          </td>

                          <td className="px-5 py-4 text-sm font-semibold text-cyan-300">
                            {record.cgpa ?? "-"}
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

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  openDetails(record)
                                }
                                title="View"
                                className="rounded-lg border border-slate-700 p-2 text-slate-300 transition hover:border-cyan-500/40 hover:bg-cyan-500/10 hover:text-cyan-300"
                              >
                                <Eye className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openEdit(record)
                                }
                                title="Edit"
                                className="rounded-lg border border-slate-700 p-2 text-slate-300 transition hover:border-cyan-500/40 hover:bg-cyan-500/10 hover:text-cyan-300"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(record._id)
                                }
                                title="Delete"
                                className="rounded-lg border border-red-500/20 p-2 text-red-400 transition hover:bg-red-500/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* RECORD COUNT */}
          <div className="text-xs text-slate-600">
            Showing {filteredRecords.length} of {records.length} academic records
            {user?.name ? ` • Mentor: ${user.name}` : ""}
          </div>
        </div>

        {/* =====================================================
            ADD / EDIT MODAL
        ===================================================== */}

        {showForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
            <div className="mx-auto my-8 max-w-5xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-900 p-5">
                <div>
                  <h2 className="text-xl font-bold">
                    {editingRecord
                      ? "Edit Academic Record"
                      : "Add Academic Record"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Enter semester and subject performance.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-6 p-5"
              >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="lg:col-span-2">
                    <label className="mb-2 block text-sm text-slate-300">
                      Mentee ID
                    </label>

                    <input
                      required
                      value={form.mentee}
                      onChange={(event) =>
                        updateForm(
                          "mentee",
                          event.target.value
                        )
                      }
                      placeholder="Enter mentee ObjectId"
                      disabled={!!editingRecord}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500 disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Semester
                    </label>

                    <select
                      required
                      value={form.semester}
                      onChange={(event) =>
                        updateForm(
                          "semester",
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                    >
                      <option value="">Select</option>
                      {[1,2,3,4,5,6,7,8].map((semester) => (
                        <option
                          key={semester}
                          value={semester}
                        >
                          Semester {semester}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Result
                    </label>

                    <select
                      value={form.result}
                      onChange={(event) =>
                        updateForm(
                          "result",
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                    >
                      <option value="">Select</option>
                      <option value="PASS">PASS</option>
                      <option value="FAIL">FAIL</option>
                      <option value="ATKT">ATKT</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      SGPA
                    </label>

                    <input
                      type="number"
                      step="0.01"
                      value={form.sgpa}
                      onChange={(event) =>
                        updateForm(
                          "sgpa",
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      CGPA
                    </label>

                    <input
                      type="number"
                      step="0.01"
                      value={form.cgpa}
                      onChange={(event) =>
                        updateForm(
                          "cgpa",
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Grand Total
                    </label>

                    <input
                      type="number"
                      value={form.grandTotal}
                      onChange={(event) =>
                        updateForm(
                          "grandTotal",
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Maximum Marks
                    </label>

                    <input
                      type="number"
                      value={form.maximumMarks}
                      onChange={(event) =>
                        updateForm(
                          "maximumMarks",
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Overall Grade
                    </label>

                    <input
                      value={form.overallGrade}
                      onChange={(event) =>
                        updateForm(
                          "overallGrade",
                          event.target.value
                        )
                      }
                      placeholder="A+"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Result Date
                    </label>

                    <input
                      type="date"
                      value={form.resultDeclaredOn}
                      onChange={(event) =>
                        updateForm(
                          "resultDeclaredOn",
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* SUBJECTS */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-semibold">
                        Subjects
                      </h3>

                      <p className="text-xs text-slate-500">
                        Add marks, grade and grade point.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={addSubject}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-500/30 px-3 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/10"
                    >
                      <Plus className="h-4 w-4" />
                      Add Subject
                    </button>
                  </div>

                  <div className="space-y-4">
                    {subjects.map((subject, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-slate-800 bg-slate-900 p-4"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Subject {index + 1}
                          </span>

                          {subjects.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                removeSubject(index)
                              }
                              className="text-xs text-red-400 hover:text-red-300"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          {[
                            ["subjectName", "Subject Name"],
                            ["code", "Code"],
                            ["internalMarks", "Internal"],
                            ["seeMarks", "SEE"],
                            ["totalMarks", "Total"],
                            ["grade", "Grade"],
                            ["gradePoint", "Grade Point"],
                            ["credits", "Credits"],
                          ].map(([field, label]) => (
                            <div
                              key={field}
                              className={
                                field === "subjectName"
                                  ? "sm:col-span-2"
                                  : ""
                              }
                            >
                              <label className="mb-1.5 block text-xs text-slate-500">
                                {label}
                              </label>

                              <input
                                type={
                                  [
                                    "internalMarks",
                                    "seeMarks",
                                    "totalMarks",
                                    "gradePoint",
                                    "credits",
                                  ].includes(field)
                                    ? "number"
                                    : "text"
                                }
                                step={
                                  field === "gradePoint"
                                    ? "0.1"
                                    : undefined
                                }
                                value={
                                  subject[field] ?? ""
                                }
                                onChange={(event) =>
                                  updateSubject(
                                    index,
                                    field,
                                    event.target.value
                                  )
                                }
                                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Remarks
                  </label>

                  <textarea
                    rows="3"
                    value={form.remarks}
                    onChange={(event) =>
                      updateForm(
                        "remarks",
                        event.target.value
                      )
                    }
                    placeholder="Optional remarks..."
                    className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-xl border border-slate-700 px-5 py-3 text-sm text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
                  >
                    {editingRecord
                      ? "Update Record"
                      : "Save Record"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =====================================================
            OCR UPLOAD MODAL
        ===================================================== */}

        {showUpload && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
            <div className="mx-auto my-8 max-w-6xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 p-5">
                <div>
                  <h2 className="text-xl font-bold">
                    Upload University Result
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Upload JPG/PNG and review OCR data before saving.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowUpload(false);
                    resetUpload();
                  }}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6 p-5">
                {!ocrData ? (
                  <>
                    <div
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950/60 p-10 text-center transition hover:border-cyan-500/50"
                    >
                      <Upload className="mx-auto h-10 w-10 text-cyan-400" />

                      <p className="mt-4 font-semibold">
                        Select result card
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        JPG or PNG only
                      </p>

                      {uploadFile && (
                        <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-300">
                          <FileText className="h-4 w-4" />
                          {uploadFile.name}
                        </div>
                      )}

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png"
                        className="hidden"
                        onChange={(event) =>
                          setUploadFile(
                            event.target.files?.[0] || null
                          )
                        }
                      />
                    </div>

                    <button
                      type="button"
                      disabled={uploading || !uploadFile}
                      onClick={handleUploadOCR}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {uploading ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Processing OCR...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Process Result
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    {/* OCR SUMMARY */}
                    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
                      <div className="mb-4 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-cyan-400" />
                        <h3 className="font-semibold">
                          OCR Result — Review Before Saving
                        </h3>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <p className="text-xs text-slate-500">
                            Name
                          </p>
                          <p className="mt-1 text-sm">
                            {ocrData.name || ocrMentee?.name || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            ERN
                          </p>
                          <p className="mt-1 text-sm">
                            {ocrData.ern || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Semester
                          </p>
                          <input
                            type="number"
                            value={ocrData.semester || ""}
                            onChange={(event) =>
                              updateOCRData(
                                "semester",
                                event.target.value
                              )
                            }
                            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                          />
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Mentee
                          </p>
                          <p className="mt-1 text-sm">
                            {ocrMentee?.name || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            SGPA
                          </p>
                          <input
                            type="number"
                            step="0.01"
                            value={ocrData.sgpa ?? ""}
                            onChange={(event) =>
                              updateOCRData(
                                "sgpa",
                                event.target.value
                              )
                            }
                            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                          />
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            CGPA
                          </p>
                          <input
                            type="number"
                            step="0.01"
                            value={ocrData.cgpa ?? ""}
                            onChange={(event) =>
                              updateOCRData(
                                "cgpa",
                                event.target.value
                              )
                            }
                            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                          />
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Grand Total
                          </p>
                          <input
                            type="number"
                            value={ocrData.grandTotal ?? ""}
                            onChange={(event) =>
                              updateOCRData(
                                "grandTotal",
                                event.target.value
                              )
                            }
                            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                          />
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Maximum Marks
                          </p>
                          <input
                            type="number"
                            value={ocrData.maximumMarks ?? ""}
                            onChange={(event) =>
                              updateOCRData(
                                "maximumMarks",
                                event.target.value
                              )
                            }
                            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                          />
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Result
                          </p>
                          <input
                            value={ocrData.result || ""}
                            onChange={(event) =>
                              updateOCRData(
                                "result",
                                event.target.value
                              )
                            }
                            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                          />
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Overall Grade
                          </p>
                          <input
                            value={ocrData.overallGrade || ""}
                            onChange={(event) =>
                              updateOCRData(
                                "overallGrade",
                                event.target.value
                              )
                            }
                            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                          />
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Result Declared
                          </p>
                          <input
                            type="date"
                            value={
                              ocrData.resultDeclaredOn
                                ? String(
                                    ocrData.resultDeclaredOn
                                  ).slice(0, 10)
                                : ""
                            }
                            onChange={(event) =>
                              updateOCRData(
                                "resultDeclaredOn",
                                event.target.value
                              )
                            }
                            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* OCR SUBJECTS */}
                    <div className="overflow-x-auto rounded-2xl border border-slate-800">
                      <table className="min-w-[1100px] w-full">
                        <thead className="bg-slate-950">
                          <tr>
                            {[
                              "Subject",
                              "Code",
                              "Internal",
                              "SEE",
                              "Total",
                              "Grade",
                              "GP",
                              "Credits",
                            ].map((heading) => (
                              <th
                                key={heading}
                                className="px-3 py-3 text-left text-xs font-semibold text-slate-500"
                              >
                                {heading}
                              </th>
                            ))}
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-800">
                          {ocrSubjects.map(
                            (subject, index) => (
                              <tr key={index}>
                                <td className="px-3 py-3">
                                  <input
                                    value={
                                      subject.subjectName || ""
                                    }
                                    onChange={(event) =>
                                      updateOCRSubject(
                                        index,
                                        "subjectName",
                                        event.target.value
                                      )
                                    }
                                    className="w-64 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                                  />
                                </td>

                                {[
                                  "code",
                                  "internalMarks",
                                  "seeMarks",
                                  "totalMarks",
                                  "grade",
                                  "gradePoint",
                                  "credits",
                                ].map((field) => (
                                  <td
                                    key={field}
                                    className="px-3 py-3"
                                  >
                                    <input
                                      type={
                                        [
                                          "internalMarks",
                                          "seeMarks",
                                          "totalMarks",
                                          "gradePoint",
                                          "credits",
                                        ].includes(field)
                                          ? "number"
                                          : "text"
                                      }
                                      value={
                                        subject[field] ?? ""
                                      }
                                      onChange={(event) =>
                                        updateOCRSubject(
                                          index,
                                          field,
                                          event.target.value
                                        )
                                      }
                                      className="w-24 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                                    />
                                  </td>
                                ))}
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setShowUpload(false);
                          resetUpload();
                        }}
                        className="rounded-xl border border-slate-700 px-5 py-3 text-sm text-slate-300 hover:bg-slate-800"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        disabled={savingOCR}
                        onClick={confirmOCR}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-50"
                      >
                        {savingOCR ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            Confirm & Save Result
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            DETAILS MODAL
        ===================================================== */}

        {showDetails && selectedRecord && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
            <div className="mx-auto my-8 max-w-5xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 p-5">
                <div>
                  <h2 className="text-xl font-bold">
                    Academic Details
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedRecord.mentee?.name || "Mentee"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowDetails(false)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6 p-5">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <p className="text-xs text-slate-500">
                      Semester
                    </p>
                    <p className="mt-1 font-semibold">
                      {selectedRecord.semester}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <p className="text-xs text-slate-500">
                      SGPA
                    </p>
                    <p className="mt-1 font-semibold text-cyan-300">
                      {selectedRecord.sgpa ?? "-"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <p className="text-xs text-slate-500">
                      CGPA
                    </p>
                    <p className="mt-1 font-semibold text-cyan-300">
                      {selectedRecord.cgpa ?? "-"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <p className="text-xs text-slate-500">
                      Grade
                    </p>
                    <p className="mt-1 font-semibold">
                      {selectedRecord.overallGrade || "-"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <p className="text-xs text-slate-500">
                      Result
                    </p>
                    <p className="mt-1 font-semibold text-emerald-300">
                      {selectedRecord.result || "-"}
                    </p>
                  </div>
                </div>

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
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default MentorAcademic;