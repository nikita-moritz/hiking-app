const API = "http://localhost:8080/api";

export interface AuthUser {
  token: string;
  username: string;
  role: string;
}

export async function login(username: string, password: string): Promise<AuthUser> {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error("Неверный логин или пароль");
  return res.json();
}

export async function register(
  username: string,
  email: string,
  password: string
): Promise<void> {
  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password, role: "USER" }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Ошибка регистрации");
  }
}

export function saveAuth(user: AuthUser) {
  localStorage.setItem("auth", JSON.stringify(user));
}

export function getAuth(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("auth");
  return raw ? JSON.parse(raw) : null;
}

export function clearAuth() {
  localStorage.removeItem("auth");
}
