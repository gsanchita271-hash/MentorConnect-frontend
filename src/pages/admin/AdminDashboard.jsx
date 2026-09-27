import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
  UserPlus,
  ChevronDown,
  Check,
  X,
  Loader2,
} from "lucide-react";

import DashboardLayout from "../../components/common/Sidebar";
import {
  apiGet,
  apiPost,
  apiPatch,
  apiDelete,
} from "../../services/api";

function getArray(data, keys = []) {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  return [];
}

function getUserId(user) {
  return user?._id || user?.id || user?.userId;
}

function getDisplayName(user) {
  return (
    user?.name ||
    user?.fullName ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    "Unknown User"
  );
}

function getRole(user) {
  return user?.role || "User";
}

function getInitials(user) {
  const name = getDisplayName(user);

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
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

function normalizeGroup(group, index) {
  return {
    ...group,
    id:
      group?._id ||
      group?.id ||
      `${group?.course || "group"}-${group?.division || ""}-${index}`,
    course:
      group?.course ||
      group?.courseName ||
      group?.program ||
      group?.name ||
      "Unknown Course",
    division:
      group?.division ||
      group?.divisionName ||
      group?.section ||
      "All",
    mentees:
      group?.mentees ||
      group?.students ||
      group?.users ||
      [],
  };
}

function StatCard({ icon: Icon, title, value, description }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>

          <h3 className="mt-2 text-3xl font-bold text-white">
            {value}
          </h3>

          {description && (
            <p className="mt-1 text-xs text-slate-500">
              {description}
            </p>
          )}
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10">
          <Icon className="h-5 w-5 text-cyan-400" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center">
      <Users className="mx-auto h-10 w-10 text-slate-600" />

      <p className="mt-3 text-sm text-slate-400">
        {message}
      </p>
    </div>
  );
}

function UserAvatar({ user }) {
  const photo =
    user?.profilePhoto ||
    user?.photo ||
    user?.profileImage ||
    user?.avatar;

  if (photo) {
    return (
      <img
        src={photo}
        alt={getDisplayName(user)}
        className="h-11 w-11 rounded-xl object-cover ring-1 ring-slate-700"
      />
    );
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-sm font-bold text-cyan-400 ring-1 ring-cyan-400/20">
      {getInitials(user) || "U"}
    </div>
  );
}

export default function AdminDashboard() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [groups, setGroups] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [activeSection, setActiveSection] = useState("overview");

  const [selectedMentor, setSelectedMentor] = useState("");
  const [selectedMentees, setSelectedMentees] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");

  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    department: "",
    designation: "",
    course: "",
    semester: "",
    rollNumber: "",
    division: "",
  });

  const [confirmDelete, setConfirmDelete] = useState(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [pendingResponse, usersResponse, groupsResponse] =
        await Promise.all([
          apiGet("/auth/pending"),
          apiGet("/auth/users"),
          apiGet("/auth/mentee-groups"),
        ]);

      setPendingUsers(
        getArray(pendingResponse, [
          "users",
          "pendingUsers",
          "data",
        ])
      );

      setAllUsers(
        getArray(usersResponse, [
          "users",
          "allUsers",
          "data",
        ])
      );

      const rawGroups = getArray(groupsResponse, [
        "groups",
        "data",
      ]);

      setGroups(rawGroups.map(normalizeGroup));
    } catch (err) {
      setError(
        err?.message ||
          "Unable to load admin dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      setSuccess("");
    }, 3500);

    return () => clearTimeout(timer);
  }, [success]);

  const mentors = useMemo(() => {
    return allUsers.filter(
      (user) => getRole(user).toLowerCase() === "mentor"
    );
  }, [allUsers]);

  const mentees = useMemo(() => {
    return allUsers.filter(
      (user) => getRole(user).toLowerCase() === "mentee"
    );
  }, [allUsers]);

  const filteredPendingUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return pendingUsers;

    return pendingUsers.filter((user) => {
      const text = [
        getDisplayName(user),
        user?.email,
        user?.department,
        user?.course,
        user?.rollNumber,
        user?.division,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(query);
    });
  }, [pendingUsers, search]);

  const filteredMentors = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return mentors;

    return mentors.filter((mentor) => {
      const text = [
        getDisplayName(mentor),
        mentor?.email,
        mentor?.department,
        mentor?.designation,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(query);
    });
  }, [mentors, search]);

  const filteredMentees = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return mentees;

    return mentees.filter((mentee) => {
      const text = [
        getDisplayName(mentee),
        mentee?.email,
        mentee?.course,
        mentee?.department,
        mentee?.rollNumber,
        mentee?.division,
        mentee?.semester,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(query);
    });
  }, [mentees, search]);

  const selectedGroupData = useMemo(() => {
    return groups.find(
      (group) => String(group.id) === String(selectedGroup)
    );
  }, [groups, selectedGroup]);

  const assignableMentees = useMemo(() => {
    if (!selectedGroupData) return mentees;

    const groupMenteeIds = new Set(
      (selectedGroupData.mentees || []).map(
        (mentee) =>
          String(
            mentee?._id ||
              mentee?.id ||
              mentee?.userId ||
              mentee
          )
      )
    );

    const filtered = mentees.filter((mentee) =>
      groupMenteeIds.has(String(getUserId(mentee)))
    );

    return filtered.length > 0 ? filtered : mentees;
  }, [selectedGroupData, mentees]);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleApprove = async (id) => {
    if (!id) return;

    try {
      setActionLoading(true);
      clearMessages();

      await apiPatch(`/auth/approve/${id}`);

      setSuccess("User approved successfully.");
      await loadDashboard();
    } catch (err) {
      setError(
        err?.message || "Unable to approve user."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    if (!id) return;

    try {
      setActionLoading(true);
      clearMessages();

      await apiPatch(`/auth/reject/${id}`);

      setSuccess("User rejected successfully.");
      await loadDashboard();
    } catch (err) {
      setError(
        err?.message || "Unable to reject user."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async () => {
    const id = getUserId(confirmDelete);

    if (!id) return;

    try {
      setActionLoading(true);
      clearMessages();

      await apiDelete(`/auth/users/${id}`);

      setSuccess("User removed successfully.");
      setConfirmDelete(null);

      await loadDashboard();
    } catch (err) {
      setError(
        err?.message || "Unable to remove user."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);

    setEditForm({
      name: user?.name || user?.fullName || "",
      email: user?.email || "",
      department: user?.department || "",
      designation: user?.designation || "",
      course: user?.course || "",
      semester: user?.semester || "",
      rollNumber: user?.rollNumber || "",
      division: user?.division || "",
    });
  };

  const closeEditModal = () => {
    if (actionLoading) return;

    setEditingUser(null);

    setEditForm({
      name: "",
      email: "",
      department: "",
      designation: "",
      course: "",
      semester: "",
      rollNumber: "",
      division: "",
    });
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleUpdateUser = async (event) => {
    event.preventDefault();

    const id = getUserId(editingUser);

    if (!id) {
      setError("User ID not found.");
      return;
    }

    try {
      setActionLoading(true);
      clearMessages();

      await apiPatch(`/auth/users/${id}`, {
        name: editForm.name,
        email: editForm.email,
        department: editForm.department,
        designation: editForm.designation,
        course: editForm.course,
        semester: editForm.semester,
        rollNumber: editForm.rollNumber,
        division: editForm.division,
      });

      setSuccess("User updated successfully.");
      closeEditModal();

      await loadDashboard();
    } catch (err) {
      setError(
        err?.message || "Unable to update user."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const toggleMentee = (menteeId) => {
    if (!menteeId) return;

    setSelectedMentees((previous) => {
      const exists = previous.includes(menteeId);

      if (exists) {
        return previous.filter((id) => id !== menteeId);
      }

      return [...previous, menteeId];
    });
  };

  const selectAllMentees = () => {
    const ids = assignableMentees
      .map(getUserId)
      .filter(Boolean)
      .map(String);

    setSelectedMentees(ids);
  };

  const clearSelectedMentees = () => {
    setSelectedMentees([]);
  };

  const handleAssignMentees = async () => {
    if (!selectedMentor) {
      setError("Please select a mentor.");
      return;
    }

    if (selectedMentees.length === 0) {
      setError("Please select at least one mentee.");
      return;
    }

    try {
      setActionLoading(true);
      clearMessages();

      // Backend route:
      // PATCH /api/auth/assign-mentees
      await apiPatch("/auth/assign-mentees", {
        mentorId: selectedMentor,
        menteeIds: selectedMentees,
      });

      setSuccess(
        `${selectedMentees.length} mentee${
          selectedMentees.length > 1 ? "s" : ""
        } assigned successfully.`
      );

      setSelectedMentees([]);
      setSelectedMentor("");
      setSelectedGroup("");

      await loadDashboard();
    } catch (err) {
      setError(
        err?.message || "Unable to assign mentees."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const scrollToSection = (id) => {
    setActiveSection(id);

    setTimeout(() => {
      document
        .getElementById(id)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  };

  const totalUsers = allUsers.length;

  return (
    <DashboardLayout role="Admin">
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium text-cyan-400">
                Administration
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Admin Dashboard
              </h1>

              <p className="mt-1 max-w-2xl text-sm text-slate-400">
                Manage users, approvals and mentor–mentee
                assignments from one place.
              </p>
            </div>

            <button
              type="button"
              onClick={loadDashboard}
              disabled={loading || actionLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/40 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0" />

              <div className="flex-1">
                <p className="font-semibold">Something went wrong</p>
                <p className="mt-1 text-red-300/80">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setError("")}
                className="text-red-300 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {success && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

              <div className="flex-1">
                <p className="font-semibold">
                  Success
                </p>
                <p className="mt-1 text-emerald-300/80">
                  {success}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSuccess("")}
                className="text-emerald-300 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Search */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search users, email, course, department..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
              />
            </div>
          </div>

          {/* Stats */}
          <section
            id="overview"
            className="scroll-mt-24"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={Users}
                title="Total Users"
                value={totalUsers}
                description="Approved mentors and mentees"
              />

              <StatCard
                icon={ShieldCheck}
                title="Pending Approvals"
                value={pendingUsers.length}
                description="Accounts waiting for review"
              />

              <StatCard
                icon={UserCheck}
                title="Mentors"
                value={mentors.length}
                description="Active mentor accounts"
              />

              <StatCard
                icon={UserPlus}
                title="Mentees"
                value={mentees.length}
                description="Active mentee accounts"
              />
            </div>
          </section>

          {/* Quick Navigation */}
          <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
            {[
              ["approvals", "Approvals"],
              ["assign", "Assign Mentees"],
              ["mentors", "Mentors"],
              ["mentees", "Mentees"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => scrollToSection(id)}
                className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  activeSection === id
                    ? "bg-cyan-400 text-slate-950"
                    : "border border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Pending Approvals */}
          <section
            id="approvals"
            className="mt-8 scroll-mt-24"
          >
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Pending Approvals
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Review new Mentor and Mentee registrations.
                </p>
              </div>

              <span className="w-fit rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
                {filteredPendingUsers.length} pending
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50 p-10">
                <Loader2 className="h-7 w-7 animate-spin text-cyan-400" />
              </div>
            ) : filteredPendingUsers.length === 0 ? (
              <EmptyState message="No pending registrations found." />
            ) : (
              <div className="space-y-3">
                {filteredPendingUsers.map((user) => {
                  const id = getUserId(user);

                  return (
                    <div
                      key={id}
                      className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 transition hover:border-slate-700"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                          <UserAvatar user={user} />

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-white">
                                {getDisplayName(user)}
                              </h3>

                              <span className="rounded-full bg-cyan-400/10 px-2 py-0.5 text-[11px] font-semibold text-cyan-300">
                                {getRole(user)}
                              </span>
                            </div>

                            <p className="mt-1 truncate text-sm text-slate-400">
                              {user?.email || "No email"}
                            </p>

                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                              {user?.department && (
                                <span>
                                  {user.department}
                                </span>
                              )}

                              {user?.course && (
                                <span>
                                  {user.course}
                                </span>
                              )}

                              {user?.rollNumber && (
                                <span>
                                  Roll: {user.rollNumber}
                                </span>
                              )}

                              {user?.createdAt && (
                                <span>
                                  Applied:{" "}
                                  {formatDate(
                                    user.createdAt
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex w-full gap-2 lg:w-auto">
                          <button
                            type="button"
                            disabled={
                              actionLoading || !id
                            }
                            onClick={() =>
                              handleApprove(id)
                            }
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-50 lg:flex-none"
                          >
                            <Check className="h-4 w-4" />
                            Approve
                          </button>

                          <button
                            type="button"
                            disabled={
                              actionLoading || !id
                            }
                            onClick={() =>
                              handleReject(id)
                            }
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50 lg:flex-none"
                          >
                            <X className="h-4 w-4" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Assign Mentees */}
          <section
            id="assign"
            className="mt-10 scroll-mt-24"
          >
            <div className="mb-4">
              <h2 className="text-xl font-bold text-white">
                Assign Mentees
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select a mentor and assign one or multiple mentees.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-6">
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {/* Mentor */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">
                    Select Mentor
                  </label>

                  <div className="relative">
                    <select
                      value={selectedMentor}
                      onChange={(event) =>
                        setSelectedMentor(
                          event.target.value
                        )
                      }
                      className="w-full appearance-none rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 pr-10 text-sm text-white outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
                    >
                      <option value="">
                        Choose a mentor
                      </option>

                      {mentors.map((mentor) => (
                        <option
                          key={getUserId(mentor)}
                          value={getUserId(mentor)}
                        >
                          {getDisplayName(mentor)}
                          {mentor?.department
                            ? ` — ${mentor.department}`
                            : ""}
                        </option>
                      ))}
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  </div>
                </div>

                {/* Group */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">
                    Filter by Course / Division
                  </label>

                  <div className="relative">
                    <select
                      value={selectedGroup}
                      onChange={(event) => {
                        setSelectedGroup(
                          event.target.value
                        );
                        setSelectedMentees([]);
                      }}
                      className="w-full appearance-none rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 pr-10 text-sm text-white outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
                    >
                      <option value="">
                        All mentees
                      </option>

                      {groups.map((group) => (
                        <option
                          key={group.id}
                          value={group.id}
                        >
                          {group.course}
                          {group.division &&
                          group.division !== "All"
                            ? ` — Division ${group.division}`
                            : ""}
                        </option>
                      ))}
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  </div>
                </div>
              </div>

              {/* Selection toolbar */}
              <div className="mt-6 flex flex-col gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Select Mentees
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {selectedMentees.length} selected
                    {" · "}
                    {assignableMentees.length} available
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selectAllMentees}
                    disabled={
                      assignableMentees.length === 0
                    }
                    className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-300 disabled:opacity-40"
                  >
                    Select All
                  </button>

                  <button
                    type="button"
                    onClick={clearSelectedMentees}
                    disabled={
                      selectedMentees.length === 0
                    }
                    className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-red-400/40 hover:text-red-300 disabled:opacity-40"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Mentee list */}
              <div className="mt-4 grid max-h-[420px] grid-cols-1 gap-3 overflow-y-auto pr-1 md:grid-cols-2">
                {assignableMentees.length === 0 ? (
                  <div className="md:col-span-2">
                    <EmptyState message="No mentees available for assignment." />
                  </div>
                ) : (
                  assignableMentees.map((mentee) => {
                    const id = String(
                      getUserId(mentee)
                    );

                    const checked =
                      selectedMentees.includes(id);

                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() =>
                          toggleMentee(id)
                        }
                        className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                          checked
                            ? "border-cyan-400/40 bg-cyan-400/10"
                            : "border-slate-800 bg-slate-950/70 hover:border-slate-700"
                        }`}
                      >
                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                            checked
                              ? "border-cyan-400 bg-cyan-400 text-slate-950"
                              : "border-slate-600 bg-transparent"
                          }`}
                        >
                          {checked && (
                            <Check className="h-3.5 w-3.5" />
                          )}
                        </div>

                        <UserAvatar user={mentee} />

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-white">
                            {getDisplayName(mentee)}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {mentee?.course ||
                              mentee?.department ||
                              "Mentee"}
                            {mentee?.division
                              ? ` · Div ${mentee.division}`
                              : ""}
                          </p>

                          {mentee?.rollNumber && (
                            <p className="mt-0.5 text-[11px] text-slate-600">
                              Roll: {mentee.rollNumber}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Assign button */}
              <div className="mt-5 flex flex-col gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">
                  Assigning selected mentees to the selected mentor.
                </p>

                <button
                  type="button"
                  onClick={handleAssignMentees}
                  disabled={
                    actionLoading ||
                    !selectedMentor ||
                    selectedMentees.length === 0
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}

                  Assign{" "}
                  {selectedMentees.length > 0
                    ? `(${selectedMentees.length})`
                    : ""}
                </button>
              </div>
            </div>
          </section>

          {/* Mentors */}
          <section
            id="mentors"
            className="mt-10 scroll-mt-24"
          >
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  All Mentors
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Manage approved mentor accounts.
                </p>
              </div>

              <span className="w-fit rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                {filteredMentors.length} mentors
              </span>
            </div>

            {filteredMentors.length === 0 ? (
              <EmptyState message="No mentors found." />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredMentors.map((mentor) => {
                  const id = getUserId(mentor);

                  return (
                    <div
                      key={id}
                      className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <UserAvatar user={mentor} />

                          <div className="min-w-0">
                            <h3 className="truncate font-semibold text-white">
                              {getDisplayName(mentor)}
                            </h3>

                            <p className="mt-0.5 truncate text-xs text-slate-500">
                              {mentor?.email ||
                                "No email"}
                            </p>
                          </div>
                        </div>

                        <span className="shrink-0 rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-300">
                          Mentor
                        </span>
                      </div>

                      <div className="mt-4 space-y-2 text-sm">
                        <div className="flex justify-between gap-3">
                          <span className="text-slate-500">
                            Department
                          </span>

                          <span className="text-right text-slate-300">
                            {mentor?.department || "—"}
                          </span>
                        </div>

                        <div className="flex justify-between gap-3">
                          <span className="text-slate-500">
                            Designation
                          </span>

                          <span className="text-right text-slate-300">
                            {mentor?.designation || "—"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 flex gap-2 border-t border-slate-800 pt-4">
                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(mentor)
                          }
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-300"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setConfirmDelete(mentor)
                          }
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-500/20 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Mentees */}
          <section
            id="mentees"
            className="mt-10 scroll-mt-24"
          >
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  All Mentees
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Manage approved mentee accounts.
                </p>
              </div>

              <span className="w-fit rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-semibold text-violet-300">
                {filteredMentees.length} mentees
              </span>
            </div>

            {filteredMentees.length === 0 ? (
              <EmptyState message="No mentees found." />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredMentees.map((mentee) => {
                  const id = getUserId(mentee);

                  return (
                    <div
                      key={id}
                      className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <UserAvatar user={mentee} />

                          <div className="min-w-0">
                            <h3 className="truncate font-semibold text-white">
                              {getDisplayName(mentee)}
                            </h3>

                            <p className="mt-0.5 truncate text-xs text-slate-500">
                              {mentee?.email ||
                                "No email"}
                            </p>
                          </div>
                        </div>

                        <span className="shrink-0 rounded-full bg-violet-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-violet-300">
                          Mentee
                        </span>
                      </div>

                      <div className="mt-4 space-y-2 text-sm">
                        <div className="flex justify-between gap-3">
                          <span className="text-slate-500">
                            Course
                          </span>

                          <span className="text-right text-slate-300">
                            {mentee?.course || "—"}
                          </span>
                        </div>

                        <div className="flex justify-between gap-3">
                          <span className="text-slate-500">
                            Semester
                          </span>

                          <span className="text-right text-slate-300">
                            {mentee?.semester || "—"}
                          </span>
                        </div>

                        <div className="flex justify-between gap-3">
                          <span className="text-slate-500">
                            Roll Number
                          </span>

                          <span className="text-right text-slate-300">
                            {mentee?.rollNumber || "—"}
                          </span>
                        </div>

                        <div className="flex justify-between gap-3">
                          <span className="text-slate-500">
                            Division
                          </span>

                          <span className="text-right text-slate-300">
                            {mentee?.division || "—"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 flex gap-2 border-t border-slate-800 pt-4">
                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(mentee)
                          }
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-300"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setConfirmDelete(mentee)
                          }
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-500/20 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Edit Modal */}
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
              <div className="sticky top-0 flex items-center justify-between border-b border-slate-800 bg-slate-950 px-5 py-4">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Edit User
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Update account information.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-900 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form
                onSubmit={handleUpdateUser}
                className="space-y-5 p-5"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleEditChange}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Email
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleEditChange}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Department
                    </label>

                    <input
                      type="text"
                      name="department"
                      value={editForm.department}
                      onChange={handleEditChange}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Designation
                    </label>

                    <input
                      type="text"
                      name="designation"
                      value={editForm.designation}
                      onChange={handleEditChange}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Course
                    </label>

                    <input
                      type="text"
                      name="course"
                      value={editForm.course}
                      onChange={handleEditChange}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Semester
                    </label>

                    <input
                      type="text"
                      name="semester"
                      value={editForm.semester}
                      onChange={handleEditChange}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Roll Number
                    </label>

                    <input
                      type="text"
                      name="rollNumber"
                      value={editForm.rollNumber}
                      onChange={handleEditChange}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Division
                    </label>

                    <input
                      type="text"
                      name="division"
                      value={editForm.division}
                      onChange={handleEditChange}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
                    />
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    disabled={actionLoading}
                    className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-900 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
                  >
                    {actionLoading && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}

                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {confirmDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>

              <h2 className="mt-4 text-lg font-bold text-white">
                Remove User?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Are you sure you want to remove{" "}
                <span className="font-semibold text-white">
                  {getDisplayName(confirmDelete)}
                </span>
                ? This action cannot be undone from this dashboard.
              </p>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(null)}
                  disabled={actionLoading}
                  className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-900 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={actionLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-400 disabled:opacity-50"
                >
                  {actionLoading && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  Remove User
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}