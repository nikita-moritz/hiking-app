"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getAuth, type AuthUser } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Calendar, Users, MapPin, ArrowLeft, Loader2, UserCheck } from "lucide-react";

interface EventDetail {
  id: number;
  title: string;
  description: string;
  trailName: string | null;
  organizerUsername: string;
  eventDate: string;
  maxParticipants: number;
  confirmedCount: number;
  joined: boolean;
  status: string;
}

interface Participant {
  userId: number;
  username: string;
  status: string;
  joinedAt: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function EventDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const canManage = user?.role === "ADMIN" || user?.role === "SUPERUSER";

  useEffect(() => {
    const auth = getAuth();
    if (!auth) { router.push("/auth"); return; }
    setUser(auth);

    Promise.all([
      apiFetch<EventDetail>(`/events/${id}`),
      canManage ? apiFetch<Participant[]>(`/events/${id}/participants`) : Promise.resolve([]),
    ])
      .then(([ev, parts]) => { setEvent(ev); setParticipants(parts); })
      .finally(() => setLoading(false));
  }, [id, router]);

  async function toggleJoin() {
    if (!event) return;
    setActionLoading(true);
    try {
      const updated = await apiFetch<EventDetail>(
        `/events/${event.id}/${event.joined ? "leave" : "join"}`,
        { method: event.joined ? "DELETE" : "POST" }
      );
      setEvent(updated);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setActionLoading(false);
    }
  }

  async function cancelEvent() {
    if (!event || !confirm("Отменить событие?")) return;
    await apiFetch(`/events/${event.id}`, { method: "DELETE" });
    router.push("/events");
  }

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!event) return null;

  const spotsLeft = event.maxParticipants - event.confirmedCount;
  const isFull = spotsLeft <= 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar user={user} />

      <main className="max-w-3xl mx-auto px-6 py-10 w-full flex-1">
        <button
          onClick={() => router.push("/events")}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Все события
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="text-3xl font-bold">{event.title}</h1>
            <span className={`text-xs font-medium px-3 py-1 rounded-full shrink-0 ${
              event.status === "UPCOMING" ? "bg-green-100 text-green-800" :
              event.status === "CANCELLED" ? "bg-red-100 text-red-800" :
              "bg-gray-100 text-gray-800"
            }`}>
              {event.status === "UPCOMING" ? "Скоро" : event.status === "CANCELLED" ? "Отменено" : event.status}
            </span>
          </div>
          {event.description && (
            <p className="text-muted-foreground leading-relaxed">{event.description}</p>
          )}
        </div>

        {/* Details card */}
        <div className="rounded-xl border bg-card p-6 mb-6 grid gap-4">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="font-medium">Дата и время</p>
              <p className="text-muted-foreground capitalize">{formatDate(event.eventDate)}</p>
            </div>
          </div>
          {event.trailName && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="font-medium">Маршрут</p>
                <p className="text-muted-foreground">{event.trailName}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 text-sm">
            <Users className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="font-medium">Участники</p>
              <p className="text-muted-foreground">
                {event.confirmedCount} из {event.maxParticipants}
                {isFull
                  ? <span className="ml-2 text-destructive font-medium">— мест нет</span>
                  : <span className="ml-2 text-primary font-medium">— свободно {spotsLeft}</span>
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <UserCheck className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="font-medium">Организатор</p>
              <p className="text-muted-foreground">{event.organizerUsername}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        {event.status === "UPCOMING" && (
          <div className="flex gap-3 mb-8">
            <Button
              className="flex-1"
              variant={event.joined ? "outline" : "default"}
              disabled={(!event.joined && isFull) || actionLoading}
              onClick={toggleJoin}
            >
              {actionLoading
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : event.joined ? "Отменить участие" : "Записаться на поход"}
            </Button>
            {canManage && (
              <>
                <Button variant="outline" onClick={() => router.push(`/events/${event.id}/edit`)}>
                  Редактировать
                </Button>
                <Button variant="destructive" onClick={cancelEvent}>
                  Отменить событие
                </Button>
              </>
            )}
          </div>
        )}

        {/* Participants (admin only) */}
        {canManage && participants.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Список участников</h2>
            <div className="rounded-xl border overflow-hidden">
              {participants.filter(p => p.status === "CONFIRMED").map((p, i) => (
                <div
                  key={p.userId}
                  className={`flex items-center justify-between px-4 py-3 text-sm ${
                    i !== 0 ? "border-t" : ""
                  }`}
                >
                  <span className="font-medium">{p.username}</span>
                  <span className="text-muted-foreground">
                    {new Date(p.joinedAt).toLocaleDateString("ru-RU")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
