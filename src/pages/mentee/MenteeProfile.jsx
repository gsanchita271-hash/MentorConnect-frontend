import { useEffect, useState } from "react";
import {
  UserCircle,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  Hash,
  CalendarDays,
  Camera,
  Save,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";

import DashboardLayout from "../../components/common/Sidebar";
import {
  apiGet,
  apiPatch,
  getUser,
} from "../../services/api";

function MenteeProfile() {
  const storedUser = getUser();

  const [profile, setProfile] = useState(
    storedUser || {}
  );

  const [form, setForm] = useState({
    name: storedUser?.name || "",
    email: storedUser?.email || "",
    phone: storedUser?.phone || "",
    course: storedUser?.course || "",
    semester: storedUser?.semester || "",
    rollNumber: storedUser?.rollNumber || "",
    department: storedUser?.department || "",
    profilePhoto: storedUser?.profilePhoto || "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [photoPreview, setPhotoPreview] = useState(
    storedUser?.profilePhoto || ""
  );

  const menuItems = [
    {
      label: "Dashboard",
      path: "/mentee/dashboard",
      icon: "dashboard",
    },
    {
      label: "My Mentor",
      path: "/mentee/mentor",
      icon: "mentor",
    },
    {
      label: "Meetings",
      path: "/mentee/meetings",
      icon: "meetings",
    },
    {
      label: "Attendance",
      path: "/mentee/attendance",
      icon: "attendance",
    },
    {
      label: "Tasks",
      path: "/mentee/tasks",
      icon: "tasks",
    },
    {
      label: "Concerns",
      path: "/mentee/concerns",
      icon: "concerns",
    },
    {
      label: "Announcements",
      path: "/mentee/announcements",
      icon: "announcements",
    },
    {
      label: "Academic",
      path: "/mentee/academic",
      icon: "academic",
    },
    {
      label: "Profile",
      path: "/mentee/profile",
      icon: "profile",
    },
  ];

  /* =========================
     LOAD PROFILE
  ========================= */

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // Correct backend route:
      // GET /api/auth/me
      const response = await apiGet("/auth/me");

      const user =
        response.user ||
        response.data ||
        response;

      if (user && typeof user === "object") {
        setProfile(user);

        setForm({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          course: user.course || "",
          semester: user.semester || "",
          rollNumber: user.rollNumber || "",
          department: user.department || "",
          profilePhoto: user.profilePhoto || "",
        });

        setPhotoPreview(
          user.profilePhoto || ""
        );
      }
    } catch (err) {
      console.error("Unable to load profile:", err);

      // Keep locally stored authenticated user
      // if the profile request fails.
      setProfile(storedUser || {});

      const message = err.message || "";

      if (
        !message.toLowerCase().includes("not found")
      ) {
        setError(
          message ||
            "Unable to load profile information."
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
     INPUT CHANGE
  ========================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSuccess("");

    if (error) {
      setError("");
    }
  };

  /* =========================
     PHOTO CHANGE
  ========================= */

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(
        "Please select a valid image file."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Profile photo must be smaller than 5 MB."
      );
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result || "";

      setPhotoPreview(result);

      setForm((previous) => ({
        ...previous,
        profilePhoto: result,
      }));

      setSuccess("");
      setError("");
    };

    reader.readAsDataURL(file);
  };

  /* =========================
     REMOVE PHOTO
  ========================= */

  const removePhoto = () => {
    setPhotoPreview("");

    setForm((previous) => ({
      ...previous,
      profilePhoto: "",
    }));

    setSuccess("");
  };

  /* =========================
     SAVE PROFILE
  ========================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // Correct backend route:
      // PATCH /api/auth/me
      const response = await apiPatch(
        "/auth/me",
        form
      );

      const updatedUser =
        response.user ||
        response.data ||
        {
          ...profile,
          ...form,
        };

      /*
       * Keep the latest user data in sessionStorage
       * so the sidebar/header can immediately use it.
       */
      sessionStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setProfile(updatedUser);

      setForm({
        name: updatedUser.name || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
        course: updatedUser.course || "",
        semester: updatedUser.semester || "",
        rollNumber:
          updatedUser.rollNumber || "",
        department:
          updatedUser.department || "",
        profilePhoto:
          updatedUser.profilePhoto || "",
      });

      setPhotoPreview(
        updatedUser.profilePhoto || ""
      );

      setSuccess(
        "Profile updated successfully."
      );
    } catch (err) {
      console.error(
        "Unable to update profile:",
        err
      );

      setError(
        err.message ||
          "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     INITIALS
  ========================= */

  const initials = (form.name || "M")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <DashboardLayout
      role="Mentee"
      title="Profile"
      menuItems={menuItems}
    >
      {/* =========================
          HEADER
      ========================= */}

      <div className="mb-8">
        <p className="text-sm text-slate-500">
          Mentee Portal
        </p>

        <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
          My Profile
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          View and update your personal and academic information.
        </p>
      </div>

      {/* =========================
          STATUS
      ========================= */}

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
          <X className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-300">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {loading ? (
        <LoadingState />
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* =========================
              PROFILE HEADER
          ========================= */}

          <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">
            <div className="h-28 bg-gradient-to-r from-cyan-400/10 via-blue-500/10 to-violet-500/10 sm:h-36" />

            <div className="-mt-12 px-5 pb-6 sm:-mt-16 sm:px-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
                  {/* AVATAR */}

                  <div className="relative">
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-slate-900 bg-slate-800 text-2xl font-bold text-cyan-400 shadow-xl sm:h-32 sm:w-32">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </div>

                    <label
                      htmlFor="profilePhoto"
                      className="absolute bottom-1 right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-slate-900 bg-cyan-400 text-slate-950 shadow-lg transition hover:bg-cyan-300"
                    >
                      <Camera className="h-4 w-4" />

                      <input
                        id="profilePhoto"
                        type="file"
                        accept="image/*"
                        onChange={
                          handlePhotoChange
                        }
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* PROFILE BASIC INFO */}

                  <div className="pb-1">
                    <h2 className="text-xl font-bold text-white">
                      {form.name || "Mentee"}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {form.course || "Student"}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-bold text-cyan-300">
                        MENTEE
                      </span>

                      {profile.isApproved !==
                        false && (
                        <span className="flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-bold text-emerald-300">
                          <ShieldCheck className="h-3 w-3" />
                          Approved
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* REMOVE PHOTO */}

                {photoPreview && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="w-fit rounded-lg border border-slate-800 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:border-red-400/20 hover:text-red-400"
                  >
                    Remove Photo
                  </button>
                )}
              </div>

              <p className="mt-5 text-xs text-slate-600">
                Recommended profile photo: square image,
                maximum 5 MB.
              </p>
            </div>
          </section>

          {/* =========================
              PERSONAL INFORMATION
          ========================= */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
                <UserCircle className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-bold text-white">
                  Personal Information
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Keep your basic information up to date.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <InputField
                label="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                icon={UserCircle}
                placeholder="Enter your full name"
              />

              <InputField
                label="Email Address"
                name="email"
                value={form.email}
                onChange={handleChange}
                icon={Mail}
                type="email"
                placeholder="Enter your email"
              />

              <InputField
                label="Phone Number"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                icon={Phone}
                placeholder="Enter your phone number"
              />

              <InputField
                label="Department"
                name="department"
                value={form.department}
                onChange={handleChange}
                icon={Building2}
                placeholder="Enter your department"
              />
            </div>
          </section>

          {/* =========================
              ACADEMIC INFORMATION
          ========================= */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400/10 text-violet-400">
                <GraduationCap className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-bold text-white">
                  Academic Information
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Your course and college details.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <InputField
                label="Course"
                name="course"
                value={form.course}
                onChange={handleChange}
                icon={GraduationCap}
                placeholder="e.g. B.Sc. IT"
              />

              <InputField
                label="Semester"
                name="semester"
                value={form.semester}
                onChange={handleChange}
                icon={CalendarDays}
                placeholder="e.g. 5"
              />

              <InputField
                label="Roll Number"
                name="rollNumber"
                value={form.rollNumber}
                onChange={handleChange}
                icon={Hash}
                placeholder="Enter roll number"
              />
            </div>
          </section>

          {/* =========================
              ACCOUNT INFORMATION
          ========================= */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-bold text-white">
                  Account Information
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Your role and account status.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <InfoBox
                label="Role"
                value={profile.role || "Mentee"}
              />

              <InfoBox
                label="Account Status"
                value={
                  profile.isApproved === false
                    ? "Pending Approval"
                    : "Approved"
                }
              />

              <InfoBox
                label="Email"
                value={
                  profile.email ||
                  form.email ||
                  "Not available"
                }
              />
            </div>
          </section>

          {/* =========================
              SAVE BUTTONS
          ========================= */}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={loadProfile}
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-400 transition hover:border-slate-700 hover:text-white disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
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
      )}
    </DashboardLayout>
  );
}

/* =========================
   INPUT FIELD
========================= */

function InputField({
  label,
  name,
  value,
  onChange,
  icon: Icon,
  type = "text",
  placeholder,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-xs font-semibold text-slate-400"
      >
        {label}
      </label>

      <div className="relative">
        <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
        />
      </div>
    </div>
  );
}

/* =========================
   INFO BOX
========================= */

function InfoBox({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">
        {label}
      </p>

      <p className="mt-2 truncate text-sm font-semibold text-slate-300">
        {value}
      </p>
    </div>
  );
}

/* =========================
   LOADING
========================= */

function LoadingState() {
  return (
    <div className="flex min-h-96 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50">
      <RefreshCw className="h-7 w-7 animate-spin text-cyan-400" />
    </div>
  );
}

export default MenteeProfile;