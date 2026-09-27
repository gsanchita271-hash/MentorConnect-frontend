import { Link } from "react-router-dom";
import {
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  Users,
  CalendarCheck,
  ClipboardCheck,
  MessageSquare,
  BarChart3,
  CheckCircle2,
  Sparkles,
  UserRoundCheck,
  BookOpen,
  ChevronRight,
} from "lucide-react";

function Home() {
  const features = [
    {
      icon: Users,
      title: "Mentor–Mentee Management",
      description:
        "Manage mentor and mentee relationships through one organized platform.",
    },
    {
      icon: CalendarCheck,
      title: "Meetings & Follow-ups",
      description:
        "Schedule mentor meetings, track discussions and maintain follow-ups.",
    },
    {
      icon: ClipboardCheck,
      title: "Attendance Tracking",
      description:
        "Monitor attendance and identify students who need attention.",
    },
    {
      icon: BarChart3,
      title: "Academic Progress",
      description:
        "Keep academic performance, subjects, marks and progress organized.",
    },
    {
      icon: MessageSquare,
      title: "Concerns & Feedback",
      description:
        "Students can raise concerns and communicate with their mentors.",
    },
    {
      icon: ShieldCheck,
      title: "Role-based Access",
      description:
        "Admin, Mentor and Mentee accounts get access to their relevant features.",
    },
  ];

  const benefits = [
    "Centralized student information",
    "Mentor meeting and task tracking",
    "Academic and attendance monitoring",
    "Admin approval workflow",
    "Announcements and communication",
    "Mobile responsive dashboard",
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-white">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      {/* Navbar */}
      <header className="relative z-20 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 ring-1 ring-cyan-400/20">
              <GraduationCap className="h-6 w-6 text-cyan-400" />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                Mentor<span className="text-cyan-400">Connect</span>
              </h1>

              <p className="hidden text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 sm:block">
                College Mentorship Platform
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-3 sm:flex">
            <Link
              to="/login"
              className="rounded-xl px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/10 transition hover:bg-cyan-300"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10">
        {/* Hero */}
        <section className="mx-auto max-w-7xl px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
          <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Hero text */}
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-xs font-semibold text-cyan-300">
                <Sparkles className="h-4 w-4" />
                Smart College Mentorship
              </div>

              <h2 className="max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Connecting
                <span className="text-cyan-400"> Mentors </span>
                and
                <span className="text-cyan-400"> Mentees </span>
                for Better Growth.
              </h2>

              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
                MentorConnect is a centralized college mentor–mentee
                management system designed to simplify student guidance,
                academic tracking, meetings, attendance and communication.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="group flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-500/10 transition hover:bg-cyan-300"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-6 py-3.5 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/40 hover:bg-slate-900"
                >
                  Sign In
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Trust points */}
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  Role-based access
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  Centralized management
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  Responsive design
                </div>
              </div>
            </div>

            {/* Hero dashboard visual */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-cyan-400/5 blur-2xl" />

              <div className="relative rounded-3xl border border-slate-800 bg-slate-900/90 p-4 shadow-2xl shadow-black/30 sm:p-5">
                {/* fake browser top */}
                <div className="mb-5 flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                  </div>

                  <div className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-1.5 text-[10px] text-slate-500">
                    mentorconnect.app
                  </div>

                  <div className="h-2 w-2 rounded-full bg-cyan-400" />
                </div>

                {/* Dashboard preview */}
                <div className="grid gap-4 sm:grid-cols-[100px_1fr]">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
                    <div className="mb-5 flex justify-center">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10">
                        <GraduationCap className="h-5 w-5 text-cyan-400" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="h-2 rounded-full bg-cyan-400/50" />
                      <div className="h-2 rounded-full bg-slate-800" />
                      <div className="h-2 rounded-full bg-slate-800" />
                      <div className="h-2 rounded-full bg-slate-800" />
                      <div className="h-2 rounded-full bg-slate-800" />
                    </div>
                  </div>

                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <div className="h-3 w-28 rounded bg-slate-700" />
                        <div className="mt-2 h-2 w-20 rounded bg-slate-800" />
                      </div>

                      <div className="h-8 w-8 rounded-full bg-cyan-400/10" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                        <Users className="h-5 w-5 text-cyan-400" />
                        <div className="mt-3 h-5 w-12 rounded bg-slate-700" />
                        <div className="mt-2 h-2 w-20 rounded bg-slate-800" />
                      </div>

                      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                        <CalendarCheck className="h-5 w-5 text-cyan-400" />
                        <div className="mt-3 h-5 w-12 rounded bg-slate-700" />
                        <div className="mt-2 h-2 w-20 rounded bg-slate-800" />
                      </div>

                      <div className="col-span-2 rounded-2xl border border-slate-800 bg-slate-950 p-4">
                        <div className="mb-4 flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-cyan-400" />
                          <div className="h-2 w-24 rounded bg-slate-700" />
                        </div>

                        <div className="flex h-24 items-end gap-2">
                          <div className="h-[35%] flex-1 rounded-t bg-cyan-400/20" />
                          <div className="h-[55%] flex-1 rounded-t bg-cyan-400/30" />
                          <div className="h-[45%] flex-1 rounded-t bg-cyan-400/20" />
                          <div className="h-[75%] flex-1 rounded-t bg-cyan-400/50" />
                          <div className="h-[65%] flex-1 rounded-t bg-cyan-400/40" />
                          <div className="h-[90%] flex-1 rounded-t bg-cyan-400/70" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y border-slate-800/80 bg-slate-900/30">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-slate-800/80 px-5 sm:grid-cols-4 sm:px-8">
            <div className="px-4 py-7 text-center sm:py-9">
              <p className="text-2xl font-black text-white sm:text-3xl">
                3
              </p>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                User Roles
              </p>
            </div>

            <div className="px-4 py-7 text-center sm:py-9">
              <p className="text-2xl font-black text-white sm:text-3xl">
                8+
              </p>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Management Modules
              </p>
            </div>

            <div className="border-t border-slate-800/80 px-4 py-7 text-center sm:border-t-0 sm:py-9">
              <p className="text-2xl font-black text-white sm:text-3xl">
                24/7
              </p>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Accessible
              </p>
            </div>

            <div className="border-t border-slate-800/80 px-4 py-7 text-center sm:border-t-0 sm:py-9">
              <p className="text-2xl font-black text-white sm:text-3xl">
                100%
              </p>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Centralized
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
              Platform Features
            </span>

            <h3 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Everything needed for
              <span className="text-cyan-400"> student mentorship</span>
            </h3>

            <p className="mt-4 text-sm leading-6 text-slate-400 sm:text-base">
              One platform to organize mentorship activities, academic
              progress and student communication.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-slate-900"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400 ring-1 ring-cyan-400/10">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h4 className="mt-5 text-base font-bold text-white">
                    {feature.title}
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* How it works */}
        <section className="border-y border-slate-800/80 bg-slate-900/20">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                  Simple Workflow
                </span>

                <h3 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                  From registration to
                  <span className="text-cyan-400"> mentorship</span>
                </h3>

                <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                  MentorConnect provides a structured workflow where
                  administrators manage users while mentors and mentees
                  collaborate through their respective dashboards.
                </p>

                <div className="mt-8 space-y-4">
                  {benefits.map((benefit) => (
                    <div
                      key={benefit}
                      className="flex items-center gap-3"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-400/10">
                        <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                      </div>

                      <span className="text-sm text-slate-300">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10">
                      <UserRoundCheck className="h-6 w-6 text-cyan-400" />
                    </div>

                    <div>
                      <p className="font-bold text-white">
                        01. Register
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Create your Mentor or Mentee account.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10">
                      <ShieldCheck className="h-6 w-6 text-cyan-400" />
                    </div>

                    <div>
                      <p className="font-bold text-white">
                        02. Approval
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Admin reviews and approves accounts.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10">
                      <BookOpen className="h-6 w-6 text-cyan-400" />
                    </div>

                    <div>
                      <p className="font-bold text-white">
                        03. Connect
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Start managing mentorship activities.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <div className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 via-slate-900 to-slate-950 p-8 text-center sm:p-12">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 ring-1 ring-cyan-400/20">
                <GraduationCap className="h-7 w-7 text-cyan-400" />
              </div>

              <h3 className="mt-6 text-3xl font-black sm:text-4xl">
                Ready to simplify mentorship?
              </h3>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
                Join MentorConnect and bring student mentorship,
                academic tracking and communication together.
              </p>

              <Link
                to="/register"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
              >
                Create Account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-7 text-center sm:flex-row sm:px-8 sm:text-left">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-cyan-400" />

            <span className="text-sm font-semibold text-slate-300">
              MentorConnect
            </span>
          </div>

          <p className="text-xs text-slate-600">
            College Mentor–Mentee Management System
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;