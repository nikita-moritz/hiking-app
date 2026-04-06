"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, type AuthUser } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Calendar, Users, MapPin, Plus, Loader2 } from "lucide-react";

interface EventItem {
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function EventsPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);

  useEffect(() => {
    const auth = getAuth();
    if (!auth) { router.push("/auth"); return; }
    setUser(auth);
    apiFetch<EventItem[]>("/events")
      .then(setEvents)
      .finally(() => setLoading(false));
  }, [router]);

  async function toggleJoin(event: EventItem) {
    setActionId(event.id);
    try {
      const updated = await apiFetch<EventItem>(
        `/events/${event.id}/${event.joined ? "leave" : "join"}`,
        { method: event.joined ? "DELETE" : "POST" }
      );
      setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setActionId(null);
    }
  }

  if (!user) return null;
  const canCreate = user.role === "ADMIN" || user.role === "SUPERUSER";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar user={user} />

      <main className="max-w-5xl mx-auto px-6 py-10 w-full flex-1">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">События</h1>
            <p className="text-muted-foreground mt-1">Ближайшие групповые походы</p>
          </div>
          {canCreate && (
            <Button onClick={() => router.push("/events/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Создать событие
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Нет предстоящих событий</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {events.map((event) => {
              const spotsLeft = event.maxParticipants - event.confirmedCount;
              const isFull = spotsLeft <= 0;

              return (
                <div
                  key={event.id}
                  className="rounded-xl border bg-card p-5 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3
                        className="font-semibold text-lg cursor-pointer hover:text-primary transition-colors"
                        onClick={() => router.push(`/events/${event.id}`)}
                      >
                        {event.title}
                      </h3>
                      {event.joined && (
                        <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full shrink-0">
                          Записан
                        </span>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>{formatDate(event.eventDate)}</span>
                    </div>
                    {event.trailName && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span>{event.trailName}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 shrink-0" />
                      <span>
                        {event.confirmedCount} / {event.maxParticipants} участников
                        {isFull && <span className="ml-2 text-destructive font-medium">· Мест нет</span>}
                        {!isFull && <span className="ml-2 text-primary font-medium">· Свободно {spotsLeft}</span>}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant={event.joined ? "outline" : "default"}
                    size="sm"
                    disabled={(!event.joined && isFull) || actionId === event.id}
                    onClick={() => toggleJoin(event)}
                    className="w-full mt-auto"
                  >
                    {actionId === event.id
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : event.joined ? "Отменить участие" : "Записаться"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
