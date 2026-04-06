import { getAuth } from "./auth";

const BASE = "http://localhost:8080/api";

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const auth = getAuth();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(auth ? { Authorization: `Bearer ${auth.token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Ошибка ${res.status}`);
  }

  if (res.status === 204) return null as T;
  return res.json();
}
