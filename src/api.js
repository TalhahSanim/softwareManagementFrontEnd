const API = import.meta.env.VITE_API_URL || "";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function api(path, { method = "GET", body, token } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers["x-auth-token"] = token;

  let res;
  try {
    res = await fetch(`${API}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      "Cannot reach the API. Start the backend with npm start in the project root.",
      0,
    );
  }

  const raw = await res.text();
  let data = raw;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw;
  }

  if (!res.ok) {
    const message =
      typeof data === "string" && data.trim()
        ? data
        : `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }

  return { data, headers: res.headers };
}

export function loginRequest({ email, username, password }) {
  const body = { password };
  if (email) body.email = email;
  if (username) body.username = username;
  return api("/api/login", { method: "POST", body });
}

export async function registerRequest(payload) {
  const { data, headers } = await api("/api/users", {
    method: "POST",
    body: payload,
  });
  return { user: data, token: headers.get("x-auth-token") || data?.token };
}

export function getSoftware() {
  return api("/api/software");
}

export function getSoftwareById(id, token) {
  return api(`/api/software/${id}`, { token });
}

export function createSoftware(payload, token) {
  return api("/api/software", { method: "POST", body: payload, token });
}

export function updateSoftware(id, payload, token) {
  return api(`/api/software/${id}`, { method: "PUT", body: payload, token });
}

export function deleteSoftware(id, token) {
  return api(`/api/software/${id}`, { method: "DELETE", token });
}

export function getCategories() {
  return api("/api/softwareCategory");
}

export function getCategoryById(id, token) {
  return api(`/api/softwareCategory/${id}`, { token });
}

export function createCategory(payload, token) {
  return api("/api/softwareCategory", { method: "POST", body: payload, token });
}

export function updateCategory(id, payload, token) {
  return api(`/api/softwareCategory/${id}`, {
    method: "PUT",
    body: payload,
    token,
  });
}

export function deleteCategory(id, token) {
  return api(`/api/softwareCategory/${id}`, { method: "DELETE", token });
}

export function getUserById(id, token) {
  return api(`/api/users/${id}`, { token });
}

export function updateUser(id, payload, token) {
  return api(`/api/users/${id}`, { method: "PUT", body: payload, token });
}

export function deleteUser(id, token) {
  return api(`/api/users/${id}`, { method: "DELETE", token });
}
