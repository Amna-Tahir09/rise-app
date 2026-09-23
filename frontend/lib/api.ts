const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getAuthHeaders(): Record<string, string> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("rise_access_token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function isLoggedIn(): boolean {
  return typeof window !== "undefined" && !!localStorage.getItem("rise_access_token");
}

export async function apiPost(path: string, body: unknown) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || `Request failed (${res.status})`);
  }
  return data;
}

export async function apiGet(path: string) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || `Request failed (${res.status})`);
  }
  return data;
}