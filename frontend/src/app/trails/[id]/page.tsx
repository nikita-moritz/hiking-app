"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getAuth, type AuthUser } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, ArrowLeft, Loader2, Mountain, ChevronRight } from "lucide-react";

interface TrailDetail {
  id: number;
  name: string;
  location: string;
  distanceKm: number;
  difficulty: string;
  upcomingEvents: EventItem[];
}

interface EventItem {
  id: number;
  title: string;
  eventDate: string;
  maxParticipants: number;
  confirmedCount: number;
  joined: boolean;
  status: string;
  organizerUsername: string;
}

const difficultyInfo: Record<string, { color: string; label: string; desc: string }> = {
  Easy:   { color: "bg-green-100 text-green-800",   label: "Лёгкий",   desc: "Подходит для новичков" },
  Medium: { color: "bg-yellow-100 text-yellow-800", label: "Средний",  desc: "Требует базовой подготовки" },
  Hard:   { color: "bg-red-100 text-red-800",       label: "Сложный",  desc: "Для опытных туристов" },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function TrailDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [user, setUser]     = useState<AuthUser | null>(null);
  const [trail, setTrail]   = useState<TrailDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);

  useEffect(() => {
    const auth = getAuth();
    if (!auth) { router.push("/auth"); return; }
    setUser(auth);
    apiFetch<TrailDetail>(`/trails/${id}`)
      .then(setTrail)
      .finally(() => setLoading(false));
  }, [id, router]);

  async function toggleJoin(ev: EventItem) {
    setActionId(ev.id);
    try {
      const updated = await apiFetch<EventItem>(
        `/events/${ev.id}/${ev.joined ? "leave" : "join"}`,
        { method: ev.joined ? "DELETE" : "POST" }
      );
      setTrail((prev) => prev ? {
        ...prev,
        upcomingEvents: prev.upcomingEvents.map((e) => e.id === updated.id ? { ...e, ...updated } : e),
      } : prev);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setActionId(null);
    }
  }

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!trail) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Маршрут не найден
      </div>
    );
  }

  const diff = difficultyInfo[trail.difficulty] ?? { color: "bg-gray-100 text-gray-800", label: trail.difficulty, desc: "" };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar user={user} />

      <main className="max-w-4xl mx-auto px-6 py-10 w-full flex-1">

        {/* Back */}
        <button
          onClick={() => router.push("/trails")}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Все маршруты
        </button>

        {/* Hero */}
        <div className="rounded-2xl border bg-card p-8 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          <div className="relative">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-3xl font-bold">{trail.name}</h1>
              <span className={`text-sm font-medium px-3 py-1 rounded-full shrink-0 ${diff.color}`}>
                {diff.label}
              </span>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 bg-background/60 rounded-xl p-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Локация</p>
                  <p className="font-semibold">{trail.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-background/60 rounded-xl p-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <Mountain className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Расстояние</p>
                  <p className="font-semibold">{trail.distanceKm} km</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-background/60 rounded-xl p-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Сложность</p>
                  <p className="font-semibold">{diff.label}</p>
                </div>
              </div>
            </div>

            {diff.desc && (
              <p className="mt-4 text-sm text-muted-foreground">{diff.desc}</p>
            )}
          </div>
        </div>

        {/* Upcoming events */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Ближайшие события</h2>
            <Button variant="outline" size="sm" onClick={() => router.push("/events")}>
              Все события <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {trail.upcomingEvents.length === 0 ? (
            <div className="rounded-xl border bg-card p-10 text-center text-muted-foreground">
              <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>Нет запланированных событий на этом маршруте</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {trail.upcomingEvents.map((ev) => {
                const spotsLeft = ev.maxParticipants - ev.confirmedCount;
                const isFull = spotsLeft <= 0;
                return (
                  <div key={ev.id} className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3
                        className="font-semibold cursor-pointer hover:text-primary transition-colors"
                        onClick={() => router.push(`/events/${ev.id}`)}
                      >
                        {ev.title}
                      </h3>
                      {ev.joined && (
                        <Badge variant="success" className="shrink-0">Записан</Badge>
                      )}
                    </div>

                    <div className="space-y-1.5 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span className="capitalize">{fmtDate(ev.eventDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          {ev.confirmedCount}/{ev.maxParticipants} участников
                          {isFull
                            ? <span className="ml-2 text-destructive font-medium">· Мест нет</span>
                            : <span className="ml-2 text-primary font-medium">· Свободно {spotsLeft}</span>
                          }
                        </span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant={ev.joined ? "outline" : "default"}
                      disabled={(!ev.joined && isFull) || actionId === ev.id}
                      onClick={() => toggleJoin(ev)}
                      className="w-full"
                    >
                      {actionId === ev.id
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : ev.joined ? "Отменить участие" : "Записаться"}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
