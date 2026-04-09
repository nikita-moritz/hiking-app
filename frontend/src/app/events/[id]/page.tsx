"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { getAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { useT } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Calendar, MapPin, Users, ArrowLeft, User,
  CheckCircle, Loader2, AlertCircle,
} from "lucide-react";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

interface EventDetail {
  id: number;
  title: string;
  titleEn: string | null;
  titleRu: string | null;
  titleDe: string | null;
  description: string | null;
  organizerName: string | null;
  eventDate: string;
  maxParticipants: number;
  participantCount: number;
  status: string;
  latitude: number | null;
  longitude: number | null;
  locationName: string | null;
}

export default function EventPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { lang, t } = useT();

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [joined, setJoined] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState("");

  const auth = getAuth();

  useEffect(() => {
    apiFetch<EventDetail>(`/events/${id}`)
      .then(data => { setEvent(data); setLoading(false); })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [id]);

  function eventTitle(e: EventDetail) {
    if (lang === "en") return e.titleEn || e.title;
    if (lang === "de") return e.titleDe || e.title;
    return e.titleRu || e.title;
  }

  async function handleJoin() {
    if (!auth) { router.push("/auth"); return; }
    setJoinLoading(true);
    setJoinError("");
    try {
      if (joined) {
        await apiFetch(`/events/${id}/join`, { method: "DELETE" });
        setJoined(false);
        setEvent(e => e ? { ...e, participantCount: e.participantCount - 1 } : e);
      } else {
        await apiFetch(`/events/${id}/join`, { method: "POST" });
        setJoined(true);
        setEvent(e => e ? { ...e, participantCount: e.participantCount + 1 } : e);
      }
    } catch (err: any) {
      setJoinError(err.message ?? "Ошибка");
    } finally {
      setJoinLoading(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    </div>
  );

  if (notFound || !event) return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <AlertCircle className="h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground">{t.event.notFound}</p>
        <Button variant="outline" onClick={() => router.push("/")}>{t.event.back}</Button>
      </div>
    </div>
  );

  const spotsLeft = event.maxParticipants - event.participantCount;
  const isFull = spotsLeft <= 0;
  const dateStr = new Date(event.eventDate).toLocaleDateString(t.events.dateLocale, {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const timeStr = new Date(event.eventDate).toLocaleTimeString(t.events.dateLocale, {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="max-w-2xl mx-auto w-full px-4 py-6 flex flex-col gap-6">

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.event.back}
        </button>

        {/* Title + status */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold leading-tight">{eventTitle(event)}</h1>
            {joined && (
              <span className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full shrink-0 mt-1">
                <CheckCircle className="h-3.5 w-3.5" />
                {t.event.joined}
              </span>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="bg-card border rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="font-medium capitalize">{dateStr}</p>
              <p className="text-muted-foreground">{timeStr}</p>
            </div>
          </div>

          {event.locationName && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <p className="font-medium">{event.locationName}</p>
            </div>
          )}

          {event.organizerName && (
            <div className="flex items-center gap-3 text-sm">
              <User className="h-4 w-4 text-muted-foreground shrink-0" />
              <p><span className="text-muted-foreground">{t.event.organizer}: </span>{event.organizerName}</p>
            </div>
          )}

          <div className="flex items-center gap-3 text-sm">
            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex items-center gap-2 flex-1">
              <span>{event.participantCount} {t.event.spotsOf} {event.maxParticipants}</span>
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${Math.min(100, (event.participantCount / event.maxParticipants) * 100)}%` }}
                />
              </div>
              <span className={`text-xs font-medium ${isFull ? "text-destructive" : "text-primary"}`}>
                {isFull ? t.event.full : `${spotsLeft} ${t.event.free}`}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div className="flex flex-col gap-2">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{t.event.description}</h2>
            <p className="text-sm leading-relaxed whitespace-pre-line">{event.description}</p>
          </div>
        )}

        {/* Map */}
        {event.latitude != null && event.longitude != null && (
          <div className="rounded-xl overflow-hidden border h-56">
            <MapView
              markers={[{ id: event.id, lat: event.latitude, lng: event.longitude, title: eventTitle(event), eventDate: event.eventDate }]}
              selectedId={event.id}
              onMarkerClick={() => {}}
              centerLat={event.latitude}
              centerLng={event.longitude}
              radiusKm={null}
            />
          </div>
        )}

        {/* Join / Leave */}
        <div className="flex flex-col gap-2">
          {joinError && <p className="text-sm text-destructive">{joinError}</p>}
          {auth ? (
            <Button
              onClick={handleJoin}
              disabled={joinLoading || (!joined && isFull)}
              variant={joined ? "outline" : "default"}
              className="w-full"
            >
              {joinLoading
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : joined ? t.event.leave : t.event.join}
            </Button>
          ) : (
            <Button onClick={() => router.push("/auth")} className="w-full">
              {t.event.loginToJoin}
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}
