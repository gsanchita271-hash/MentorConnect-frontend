const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://mentorconnect-a7c8.onrender.com/api";

/* =========================
   TOKEN
========================= */

export const getToken = () => {
  return sessionStorage.getItem("token");
};


/* =========================
   USER
========================= */

export const getUser = () => {
  try {
    const user = sessionStorage.getItem("user");

    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Unable to read user:", error);
    return null;
  }
};


/* =========================
   SAVE AUTH
========================= */

export const saveAuth = (token, user) => {
  sessionStorage.setItem("token", token);
  sessionStorage.setItem("user", JSON.stringify(user));
};


/* =========================
   LOGOUT
========================= */

export const logout = () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
};


/* =========================
   API REQUEST
========================= */

export const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const text = await response.text();

    let data = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {
        message: text || "Invalid server response.",
      };
    }

    if (!response.ok) {
      throw new Error(
        data.message ||
          data.error ||
          `Request failed with status ${response.status}`
      );
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);

    throw error;
  }
};


/* =========================
   GET
========================= */

export const apiGet = async (endpoint) => {
  return apiRequest(endpoint, {
    method: "GET",
  });
};


/* =========================
   POST
========================= */

export const apiPost = async (endpoint, body = {}) => {
  return apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });
};


/* =========================
   PATCH
========================= */

export const apiPatch = async (endpoint, body = {}) => {
  return apiRequest(endpoint, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
};


/* =========================
   PUT
========================= */

export const apiPut = async (endpoint, body = {}) => {
  return apiRequest(endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
  });
};


/* =========================
   DELETE
========================= */

export const apiDelete = async (endpoint) => {
  return apiRequest(endpoint, {
    method: "DELETE",
  });
};


/* =========================
   EXPORT API URL
========================= */

export default API_URL;