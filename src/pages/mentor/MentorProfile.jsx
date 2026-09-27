import { useEffect, useState } from "react";
import {
  UserCircle,
  Mail,
  BriefcaseBusiness,
  Building2,
  ShieldCheck,
  Save,
  RefreshCw,
  Camera,
  Pencil,
  CheckCircle2,
  CircleAlert,
} from "lucide-react";

import DashboardLayout from "../../components/common/Sidebar";
import {
  apiGet,
  apiPatch,
  getUser,
  saveAuth,
} from "../../services/api";

function MentorProfile() {
  const [user, setUser] = useState(
    getUser()
  );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    designation: "",
    profilePhoto: "",
  });

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
     LOAD PROFILE
  ========================== */

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await apiGet("/auth/profile");

      const profile =
        response.user ||
        response.data ||
        response;

      setUser(profile);

      setForm({
        name:
          profile.name ||
          profile.fullName ||
          "",
        email:
          profile.email ||
          "",
        department:
          profile.department ||
          "",
        designation:
          profile.designation ||
          "",
        profilePhoto:
          profile.profilePhoto ||
          profile.photo ||
          profile.profileImage ||
          "",
      });

      saveAuth(
        sessionStorage.getItem(
          "token"
        ),
        profile
      );
    } catch (err) {
      /*
       * If the backend does not expose a
       * profile endpoint, use the already
       * authenticated user stored locally.
       */
      const storedUser = getUser();

      if (storedUser) {
        setUser(storedUser);

        setForm({
          name:
            storedUser.name ||
            storedUser.fullName ||
            "",
          email:
            storedUser.email ||
            "",
          department:
            storedUser.department ||
            "",
          designation:
            storedUser.designation ||
            "",
          profilePhoto:
            storedUser.profilePhoto ||
            storedUser.photo ||
            storedUser.profileImage ||
            "",
        });
      } else {
        setError(
          err.message ||
            "Unable to load profile."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  /* =========================
     FORM CHANGE
  ========================== */

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  /* =========================
     SAVE PROFILE
  ========================== */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!form.name.trim()) {
      setError(
        "Name cannot be empty."
      );
      return;
    }

    try {
      setSaving(true);

      const response =
        await apiPatch(
          "/auth/profile",
          {
            name:
              form.name.trim(),
            department:
              form.department.trim(),
            designation:
              form.designation.trim(),
            profilePhoto:
              form.profilePhoto.trim(),
          }
        );

      const updatedUser =
        response.user ||
        response.data ||
        {
          ...user,
          name:
            form.name.trim(),
          department:
            form.department.trim(),
          designation:
            form.designation.trim(),
          profilePhoto:
            form.profilePhoto.trim(),
        };

      setUser(updatedUser);

      saveAuth(
        sessionStorage.getItem(
          "token"
        ),
        updatedUser
      );

      setMessage(
        "Profile updated successfully."
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const displayName =
    form.name ||
    user?.name ||
    user?.fullName ||
    "Mentor";

  const profilePhoto =
    form.profilePhoto ||
    user?.profilePhoto ||
    user?.photo ||
    user?.profileImage ||
    "";

  return (
    <DashboardLayout
      role="Mentor"
      title="Profile"
      menuItems={menuItems}
    >
      {/* =========================
          HEADER
      ========================== */}

      <div className="mb-8">
        <p className="text-sm text-slate-500">
          Mentor Portal
        </p>

        <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
          My Profile
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Manage your mentor information and profile details.
        </p>
      </div>

      {/* =========================
          ALERTS
      ========================== */}

      {message && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          {message}
        </div>
      )}

      {error && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
          <CircleAlert className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50">
          <RefreshCw className="h-6 w-6 animate-spin text-cyan-400" />
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          {/* =========================
              PROFILE CARD
          ========================== */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt={displayName}
                    className="h-28 w-28 rounded-full border-4 border-slate-800 object-cover"
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-slate-800 bg-cyan-400/10 text-cyan-400">
                    <UserCircle className="h-16 w-16" />
                  </div>
                )}

                <div className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-slate-900 bg-cyan-400 text-slate-950">
                  <Camera className="h-3.5 w-3.5" />
                </div>
              </div>

              <h2 className="mt-5 text-xl font-bold text-white">
                {displayName}
              </h2>

              <p className="mt-1 text-sm text-cyan-400">
                {form.designation ||
                  "Mentor"}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {form.department ||
                  "Department not specified"}
              </p>
            </div>

            <div className="mt-7 space-y-3 border-t border-slate-800 pt-5">
              <InfoRow
                icon={Mail}
                label="Email"
                value={
                  form.email ||
                  "Not available"
                }
              />

              <InfoRow
                icon={BriefcaseBusiness}
                label="Designation"
                value={
                  form.designation ||
                  "Not specified"
                }
              />

              <InfoRow
                icon={Building2}
                label="Department"
                value={
                  form.department ||
                  "Not specified"
                }
              />

              <InfoRow
                icon={ShieldCheck}
                label="Role"
                value="Mentor"
              />
            </div>
          </section>

          {/* =========================
              EDIT FORM
          ========================== */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900/50">
            <div className="border-b border-slate-800 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
                  <Pencil className="h-4 w-4" />
                </div>

                <div>
                  <h2 className="font-bold text-white">
                    Personal Information
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Update your professional profile.
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6 p-6"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={
                      handleChange
                    }
                    required
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Email
                  </label>

                  <input
                    type="email"
                    value={form.email}
                    disabled
                    className="w-full cursor-not-allowed rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-500 outline-none"
                  />

                  <p className="mt-2 text-xs text-slate-600">
                    Email is linked to your account and cannot be changed here.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Department
                  </label>

                  <input
                    type="text"
                    name="department"
                    value={
                      form.department
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. Computer Science"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Designation
                  </label>

                  <input
                    type="text"
                    name="designation"
                    value={
                      form.designation
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. Assistant Professor"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Profile Photo URL
                </label>

                <input
                  type="url"
                  name="profilePhoto"
                  value={
                    form.profilePhoto
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="https://example.com/profile-photo.jpg"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
                />

                <p className="mt-2 text-xs text-slate-600">
                  Add an image URL to display your profile photo.
                </p>
              </div>

              {profilePhoto && (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Photo Preview
                  </p>

                  <img
                    src={profilePhoto}
                    alt="Profile preview"
                    className="h-20 w-20 rounded-xl border border-slate-800 object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display =
                        "none";
                    }}
                  />
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() =>
                    loadProfile()
                  }
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-800 px-5 py-3 text-sm font-semibold text-slate-400 transition hover:bg-slate-900 hover:text-white disabled:opacity-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}

                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </DashboardLayout>
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
    <div className="flex items-center gap-3 rounded-xl bg-slate-950/70 p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-500">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
          {label}
        </p>

        <p className="mt-0.5 truncate text-sm text-slate-300">
          {value}
        </p>
      </div>
    </div>
  );
}

export default MentorProfile;