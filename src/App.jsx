import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

// Common
import ProtectedRoute from "./components/common/ProtectedRoute";

// Public
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";

// Mentor
import MentorDashboard from "./pages/mentor/MentorDashboard";
import MentorMentees from "./pages/mentor/MentorMentees";
import MentorMeetings from "./pages/mentor/MentorMeetings";
import MentorAttendance from "./pages/mentor/MentorAttendance";
import MentorTasks from "./pages/mentor/MentorTasks";
import MentorConcerns from "./pages/mentor/MentorConcerns";
import MentorAnnouncements from "./pages/mentor/MentorAnnouncements";
import MentorAcademic from "./pages/mentor/MentorAcademic";
import MentorProfile from "./pages/mentor/MentorProfile";

// Mentee
import MenteeDashboard from "./pages/mentee/MenteeDashboard";
import MyMentor from "./pages/mentee/MyMentor";
import MenteeMeetings from "./pages/mentee/MenteeMeetings";
import MenteeAttendance from "./pages/mentee/MenteeAttendance";
import MenteeTasks from "./pages/mentee/MenteeTasks";
import MenteeConcerns from "./pages/mentee/MenteeConcerns";
import MenteeAnnouncements from "./pages/mentee/MenteeAnnouncements";
import MenteeAcademic from "./pages/mentee/MenteeAcademic";
import MenteeProfile from "./pages/mentee/MenteeProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =========================
            PUBLIC ROUTES
        ========================= */}

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        {/* =========================
            ADMIN ROUTES
        ========================= */}

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* =========================
            MENTOR ROUTES
        ========================= */}

        <Route
          path="/mentor/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Mentor"]}>
              <MentorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentor/mentees"
          element={
            <ProtectedRoute allowedRoles={["Mentor"]}>
              <MentorMentees />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentor/meetings"
          element={
            <ProtectedRoute allowedRoles={["Mentor"]}>
              <MentorMeetings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentor/attendance"
          element={
            <ProtectedRoute allowedRoles={["Mentor"]}>
              <MentorAttendance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentor/tasks"
          element={
            <ProtectedRoute allowedRoles={["Mentor"]}>
              <MentorTasks />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentor/concerns"
          element={
            <ProtectedRoute allowedRoles={["Mentor"]}>
              <MentorConcerns />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentor/announcements"
          element={
            <ProtectedRoute allowedRoles={["Mentor"]}>
              <MentorAnnouncements />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentor/academic"
          element={
            <ProtectedRoute allowedRoles={["Mentor"]}>
              <MentorAcademic />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentor/profile"
          element={
            <ProtectedRoute allowedRoles={["Mentor"]}>
              <MentorProfile />
            </ProtectedRoute>
          }
        />

        {/* =========================
            MENTEE ROUTES
        ========================= */}

        <Route
          path="/mentee/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Mentee"]}>
              <MenteeDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentee/mentor"
          element={
            <ProtectedRoute allowedRoles={["Mentee"]}>
              <MyMentor />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentee/meetings"
          element={
            <ProtectedRoute allowedRoles={["Mentee"]}>
              <MenteeMeetings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentee/attendance"
          element={
            <ProtectedRoute allowedRoles={["Mentee"]}>
              <MenteeAttendance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentee/tasks"
          element={
            <ProtectedRoute allowedRoles={["Mentee"]}>
              <MenteeTasks />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentee/concerns"
          element={
            <ProtectedRoute allowedRoles={["Mentee"]}>
              <MenteeConcerns />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentee/announcements"
          element={
            <ProtectedRoute allowedRoles={["Mentee"]}>
              <MenteeAnnouncements />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentee/academic"
          element={
            <ProtectedRoute allowedRoles={["Mentee"]}>
              <MenteeAcademic />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentee/profile"
          element={
            <ProtectedRoute allowedRoles={["Mentee"]}>
              <MenteeProfile />
            </ProtectedRoute>
          }
        />

        {/* =========================
            FALLBACK
        ========================= */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;