import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";

const API = "https://mentorconnect-a7c8.onrender.com/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const text = await response.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server returned an invalid response.");
      }

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      if (!data.token) {
        throw new Error("Login successful but token was not received.");
      }

      sessionStorage.setItem("token", data.token);

      if (data.user) {
        sessionStorage.setItem("user", JSON.stringify(data.user));
      }

      const role = data.user?.role;

      if (role === "Admin") {
        navigate("/admin/dashboard");
      } else if (role === "Mentor") {
        navigate("/mentor/dashboard");
      } else if (role === "Mentee") {
        navigate("/mentee/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* Left side */}
        <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between bg-slate-900 p-12">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

          <Link
            to="/"
            className="relative z-10 flex w-fit items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 ring-1 ring-cyan-400/20">
              <GraduationCap className="h-6 w-6 text-cyan-400" />
            </div>

            <div>
              <h1 className="font-bold">
                Mentor<span className="text-cyan-400">Connect</span>
              </h1>

              <p className="text-[10px] uppercase tracking-widest text-slate-500">
                College Management
              </p>
            </div>
          </Link>

          <div className="relative z-10 max-w-lg">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-cyan-400">
              Welcome back
            </p>

            <h2 className="text-5xl font-bold leading-tight">
              Manage mentoring.
              <br />
              <span className="text-cyan-400">Grow together.</span>
            </h2>

            <p className="mt-6 leading-7 text-slate-400">
              Access your MentorConnect dashboard and stay connected with
              your mentoring journey.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-sm text-slate-500">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            Secure role-based access
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">

            <Link
              to="/"
              className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10">
                  <GraduationCap className="h-6 w-6 text-cyan-400" />
                </div>

                <h1 className="text-xl font-bold">
                  Mentor<span className="text-cyan-400">Connect</span>
                </h1>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold">Welcome back</h2>

              <p className="mt-2 text-slate-400">
                Login to your MentorConnect account.
              </p>
            </div>

            <form onSubmit={handleLogin} className="mt-8 space-y-5">

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Email
                </label>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3.5 pl-12 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Password
                </label>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3.5 pl-12 pr-12 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3.5 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Login"}

                {!loading && (
                  <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
                )}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-slate-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-cyan-400 hover:text-cyan-300"
              >
                Register
              </Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;