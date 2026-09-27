import { Navigate } from "react-router-dom";
import { getToken, getUser } from "../../services/api";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const token = getToken();
  const user = getUser();

  // Not logged in
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Role checking
  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    if (user.role === "Admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    if (user.role === "Mentor") {
      return <Navigate to="/mentor/dashboard" replace />;
    }

    if (user.role === "Mentee") {
      return <Navigate to="/mentee/dashboard" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;