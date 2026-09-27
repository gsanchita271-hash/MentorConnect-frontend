import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  GraduationCap,
  User,
  Mail,
  Lock,
  BookOpen,
  Hash,
  Building2,
  BriefcaseBusiness,
  BadgeCheck,
  Award,
  Clock3,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { apiPost } from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [role, setRole] = useState("Mentee");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",

    course: "",
    division: "",
    semester: "",
    rollNumber: "",
    ern: "",

    department: "",
    designation: "",
    employeeId: "",
    qualification: "",
    experience: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) setError("");
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError("");
    setSuccess("");
  };

  const validateForm = () => {
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password
    ) {
      return "Name, email and password are required.";
    }

    if (formData.password.length < 6) {
      return "Password must contain at least 6 characters.";
    }

    if (role === "Mentee") {
      if (
        !formData.course.trim() ||
        !formData.division.trim() ||
        !formData.semester ||
        !formData.rollNumber.trim() ||
        !formData.ern.trim()
      ) {
        return "Please fill all required mentee details.";
      }

      const semester = Number(formData.semester);

      if (
        Number.isNaN(semester) ||
        semester < 1
      ) {
        return "Please enter a valid semester.";
      }
    }

    if (role === "Mentor") {
      if (
        !formData.department.trim() ||
        !formData.designation.trim() ||
        !formData.employeeId.trim()
      ) {
        return "Please fill all required mentor details.";
      }
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role,
      };

      if (role === "Mentee") {
        payload.course = formData.course.trim();
        payload.division = formData.division.trim();
        payload.semester = Number(formData.semester);
        payload.rollNumber = formData.rollNumber.trim();
        payload.ern = formData.ern.trim().toUpperCase();
      }

      if (role === "Mentor") {
        payload.department = formData.department.trim();
        payload.designation = formData.designation.trim();
        payload.employeeId = formData.employeeId.trim();

        payload.qualification =
          formData.qualification.trim();

        payload.experience =
          formData.experience.trim();
      }

      const response = await apiPost(
        "/auth/register",
        payload
      );

      setSuccess(
        response?.message ||
          "Registration successful. Waiting for admin approval."
      );

      setFormData({
        name: "",
        email: "",
        password: "",

        course: "",
        division: "",
        semester: "",
        rollNumber: "",
        ern: "",

        department: "",
        designation: "",
        employeeId: "",
        qualification: "",
        experience: "",
      });
    } catch (err) {
      setError(
        err?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-2xl">
        {/* Back */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Card */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/20 sm:mt-8">
          {/* Header */}
          <div className="border-b border-slate-800 p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10">
                <GraduationCap className="h-6 w-6 text-cyan-400" />
              </div>

              <div>
                <h1 className="text-xl font-bold">
                  Mentor
                  <span className="text-cyan-400">
                    Connect
                  </span>
                </h1>

                <p className="text-sm text-slate-500">
                  College Mentor-Mentee Management System
                </p>
              </div>
            </div>

            <h2 className="mt-7 text-2xl font-bold sm:text-3xl">
              Create your account
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Register as a Mentor or Mentee. Your account
              will be reviewed by the administrator before
              you can log in.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-8"
          >
            {/* Messages */}
            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <div className="flex items-start gap-3 text-sm text-emerald-300">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

                  <p>{success}</p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="mt-4 rounded-lg bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
                >
                  Go to Login
                </button>
              </div>
            )}

            {/* Role */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-slate-300">
                Register as
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    handleRoleChange("Mentee")
                  }
                  className={`rounded-xl border p-4 text-left transition ${
                    role === "Mentee"
                      ? "border-cyan-400/50 bg-cyan-400/10"
                      : "border-slate-800 bg-slate-950 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        role === "Mentee"
                          ? "bg-cyan-400/15 text-cyan-400"
                          : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      <GraduationCap className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="font-semibold text-white">
                        Mentee
                      </p>

                      <p className="text-xs text-slate-500">
                        Student
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleRoleChange("Mentor")
                  }
                  className={`rounded-xl border p-4 text-left transition ${
                    role === "Mentor"
                      ? "border-cyan-400/50 bg-cyan-400/10"
                      : "border-slate-800 bg-slate-950 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        role === "Mentor"
                          ? "bg-cyan-400/15 text-cyan-400"
                          : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      <BriefcaseBusiness className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="font-semibold text-white">
                        Mentor
                      </p>

                      <p className="text-xs text-slate-500">
                        Faculty
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Basic Information */}
            <div className="mt-7">
              <div className="mb-4">
                <h3 className="font-semibold text-white">
                  Basic Information
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Enter your personal account details.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Full Name
                  </label>

                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      autoComplete="name"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Email
                  </label>

                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      autoComplete="email"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Password
                  </label>

                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimum 6 characters"
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-11 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (previous) => !previous
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mentee Fields */}
            {role === "Mentee" && (
              <div className="mt-8 border-t border-slate-800 pt-7">
                <div className="mb-4">
                  <h3 className="font-semibold text-white">
                    Student Information
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    These details are required for your
                    mentee profile.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Course */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Course
                    </label>

                    <div className="relative">
                      <BookOpen className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                      <input
                        type="text"
                        name="course"
                        value={formData.course}
                        onChange={handleChange}
                        placeholder="e.g. B.Sc. IT"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
                      />
                    </div>
                  </div>

                  {/* Division */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Division
                    </label>

                    <div className="relative">
                      <BadgeCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                      <input
                        type="text"
                        name="division"
                        value={formData.division}
                        onChange={handleChange}
                        placeholder="e.g. A"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
                      />
                    </div>
                  </div>

                  {/* Semester */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Semester
                    </label>

                    <input
                      type="number"
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      min="1"
                      placeholder="e.g. 5"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
                    />
                  </div>

                  {/* Roll Number */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Roll Number
                    </label>

                    <div className="relative">
                      <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                      <input
                        type="text"
                        name="rollNumber"
                        value={formData.rollNumber}
                        onChange={handleChange}
                        placeholder="Enter roll number"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
                      />
                    </div>
                  </div>

                  {/* ERN */}
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      ERN
                    </label>

                    <input
                      type="text"
                      name="ern"
                      value={formData.ern}
                      onChange={handleChange}
                      placeholder="Enter your ERN"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm uppercase text-white outline-none placeholder:normal-case placeholder:text-slate-600 focus:border-cyan-400/50"
                    />

                    <p className="mt-1.5 text-xs text-slate-600">
                      ERN must be unique.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Mentor Fields */}
            {role === "Mentor" && (
              <div className="mt-8 border-t border-slate-800 pt-7">
                <div className="mb-4">
                  <h3 className="font-semibold text-white">
                    Mentor Information
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Enter your faculty and professional details.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Department */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Department
                    </label>

                    <div className="relative">
                      <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        placeholder="e.g. Information Technology"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
                      />
                    </div>
                  </div>

                  {/* Designation */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Designation
                    </label>

                    <div className="relative">
                      <BriefcaseBusiness className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                      <input
                        type="text"
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        placeholder="e.g. Assistant Professor"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
                      />
                    </div>
                  </div>

                  {/* Employee ID */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Employee ID
                    </label>

                    <div className="relative">
                      <BadgeCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                      <input
                        type="text"
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleChange}
                        placeholder="Enter employee ID"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
                      />
                    </div>
                  </div>

                  {/* Qualification */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Qualification
                      <span className="ml-1 text-xs text-slate-600">
                        (Optional)
                      </span>
                    </label>

                    <div className="relative">
                      <Award className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                      <input
                        type="text"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleChange}
                        placeholder="e.g. MCA, M.Tech"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
                      />
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Experience
                      <span className="ml-1 text-xs text-slate-600">
                        (Optional)
                      </span>
                    </label>

                    <div className="relative">
                      <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                      <input
                        type="text"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        placeholder="e.g. 5 years"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Approval Notice */}
            <div className="mt-8 flex items-start gap-3 rounded-xl border border-cyan-400/10 bg-cyan-400/5 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />

              <div>
                <p className="text-sm font-semibold text-cyan-300">
                  Admin approval required
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  After registration, your account will
                  remain pending until an administrator
                  approves it. You will be able to log in
                  after approval.
                </p>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !!success}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>

            {/* Login */}
            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-cyan-400 hover:text-cyan-300"
              >
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;