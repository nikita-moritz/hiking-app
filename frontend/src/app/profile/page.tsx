"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, type AuthUser } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, User, KeyRound, Loader2, CheckCircle } from "lucide-react";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
}

interface EventItem {
  id: number;
  title: string;
  trailName: string | null;
  eventDate: string;
  confirmedCount: number;
  maxParticipants: number;
  status: string;
}

const roleVariant: Record<string, "default" | "warning" | "success" | "outline"> = {
  SUPERUSER: "default",
  ADMIN:     "warning",
  USER:      "outline",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser]         = useState<AuthUser | null>(null);
  const [profile, setProfile]   = useState<UserProfile | null>(null);
  const [events, setEvents]     = useState<EventItem[]>([]);
  const [loading, setLoading]   = useState(true);

  // password form
  const [pwForm, setPwForm]     = useState({ current: "", next: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError]   = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    if (!auth) { router.push("/auth"); return; }
    setUser(auth);

    Promise.all([
      apiFetch<UserProfile>("/profile"),
      apiFetch<EventItem[]>("/profile/events"),
    ])
      .then(([p, ev]) => { setProfile(p); setEvents(ev); })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);

    if (pwForm.next !== pwForm.confirm) {
      setPwError("Новые пароли не совпадают");
      return;
    }
    if (pwForm.next.length < 6) {
      setPwError("Пароль должен быть не менее 6 символов");
      return;
    }

    setPwLoading(true);
    try {
      await apiFetch<string>("/profile/password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
      });
      setPwSuccess(true);
      setPwForm({ current: "", next: "", confirm: "" });
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setPwLoading(false);
    }
  }

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar user={user} />

      <main className="max-w-4xl mx-auto px-6 py-10 w-full flex-1">
        <h1 className="text-2xl font-bold mb-8">Мой профиль</h1>

        <div className="grid md:grid-cols-2 gap-6">

          {/* ── Profile info ─────────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Данные аккаунта
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Имя пользователя</span>
                <span className="font-medium">{profile?.username}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="font-medium">{profile?.email}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Роль</span>
                <Badge variant={roleVariant[profile?.role ?? "USER"] ?? "outline"}>
                  {profile?.role}
                </Badge>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Статус</span>
                <Badge variant={profile?.active ? "success" : "destructive"}>
                  {profile?.active ? "Активен" : "Заблокирован"}
                </Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Дата регистрации</span>
                <span className="text-sm">{profile ? fmtDate(profile.createdAt) : "—"}</span>
              </div>
            </CardContent>
          </Card>

          {/* ── Change password ───────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" />
                Сменить пароль
              </CardTitle>
              <CardDescription>Минимум 6 символов</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current">Текущий пароль</Label>
                  <Input
                    id="current"
                    type="password"
                    placeholder="••••••••"
                    value={pwForm.current}
                    onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="next">Новый пароль</Label>
                  <Input
                    id="next"
                    type="password"
                    placeholder="••••••••"
                    value={pwForm.next}
                    onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Повторите новый пароль</Label>
                  <Input
                    id="confirm"
                    type="password"
                    placeholder="••••••••"
                    value={pwForm.confirm}
                    onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                    required
                  />
                </div>

                {pwError && <p className="text-sm text-destructive">{pwError}</p>}
                {pwSuccess && (
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <CheckCircle className="h-4 w-4" />
                    Пароль успешно изменён
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={pwLoading}>
                  {pwLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {pwLoading ? "Сохранение..." : "Изменить пароль"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* ── My events ──────────────────────────────────────────────────── */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Мои события</h2>

          {events.length === 0 ? (
            <div className="rounded-xl border bg-card p-10 text-center text-muted-foreground">
              <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>Вы ещё не записались ни на одно событие</p>
              <Button variant="outline" className="mt-4" onClick={() => router.push("/events")}>
                Посмотреть события
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => router.push(`/events/${ev.id}`)}
                  className="rounded-xl border bg-card p-4 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-medium">{ev.title}</h3>
                    <Badge variant={ev.status === "UPCOMING" ? "success" : "outline"} className="shrink-0">
                      {ev.status === "UPCOMING" ? "Скоро" : ev.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span className="capitalize">{fmtDateTime(ev.eventDate)}</span>
                    </div>
                    {ev.trailName && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span>{ev.trailName}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
