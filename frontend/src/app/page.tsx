"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { getAuth, loginWithSupabase, saveAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { X, Calendar, MapPin, Lock } from "lucide-react";
import AuthForm from "@/components/AuthForm";
import { useT } from "@/lib/i18n";
import Navbar from "@/components/Navbar";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

interface PublicEvent {
  id: number;
  title: string;
  titleEn: string | null;
  titleRu: string | null;
  titleDe: string | null;
  eventDate: string;
  latitude: number | null;
  longitude: number | null;
  locationName: string | null;
}

export default function LandingPage() {
  const router = useRouter();
  const { lang, t } = useT();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tab, setTab] = useState<"map" | "list">("map");
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const [loginModal, setLoginModal] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!getAuth());
    fetchPublicEvents();
    const tabParam = new URLSearchParams(window.location.search).get("tab");
    if (tabParam === "list" || tabParam === "map") setTab(tabParam);

    const onTab = (e: Event) => {
      const t = (e as CustomEvent).detail;
      if (t === "map" || t === "list") setTab(t);
    };
    window.addEventListener("tab-change", onTab);
    return () => window.removeEventListener("tab-change", onTab);

    supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session?.access_token) {
        try {
          const auth = await loginWithSupabase(session.access_token);
          saveAuth(auth);
          setIsLoggedIn(true);
          setLoginPrompt(false);
        } catch {}
      }
    });
  }, []);

  async function fetchPublicEvents() {
    try {
      const data = await apiFetch<PublicEvent[]>("/events");
      setEvents(data);
    } catch {}
  }

  function openEvent(id: number) {
    setSelectedId(id);
    if (!getAuth()) {
      setLoginPrompt(true);
    } else {
      router.push(`/events/${id}`);
    }
  }

  function eventTitle(e: PublicEvent) {
    if (lang === "en") return e.titleEn || e.title;
    if (lang === "de") return e.titleDe || e.title;
    return e.titleRu || e.title;
  }

  const mapMarkers = events
    .filter(e => e.latitude != null && e.longitude != null)
    .map(e => ({ id: e.id, lat: e.latitude!, lng: e.longitude!, title: eventTitle(e), eventDate: e.eventDate }));

  const selectedEvent = events.find(e => e.id === selectedId);

  const isModalOpen = loginModal || (loginPrompt && !!selectedEvent);

  return (
    <>
    <div className="h-screen bg-background flex flex-col overflow-hidden transition-all duration-300" style={isModalOpen ? { filter: "blur(2px)" } : undefined}>

      <Navbar />

      {/* ── Content ── */}
      <div className="flex-1 relative overflow-hidden">

        {/* MAP TAB */}
        {tab === "map" && (
          <div className="absolute inset-0">
            <MapView
              markers={mapMarkers}
              selectedId={selectedId}
              onMarkerClick={openEvent}
              centerLat={50.55}
              centerLng={6.4}
              radiusKm={null}
            />
          </div>
        )}

        {/* LIST TAB */}
        {tab === "list" && (
          <div className="absolute inset-0 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-4 py-4 flex flex-col gap-3">
              {events.length === 0 && (
                <p className="text-center text-muted-foreground py-16 text-sm">
                  {t.events.noEvents}
                </p>
              )}
              {events.map(e => (
                <button
                  key={e.id}
                  onClick={() => openEvent(e.id)}
                  className="w-full text-left bg-card border rounded-xl px-4 py-3 hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{eventTitle(e)}</h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(e.eventDate).toLocaleDateString(t.events.dateLocale, {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </span>
                        {e.locationName && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {e.locationName}
                          </span>
                        )}
                      </div>
                    </div>
                    {!isLoggedIn && (
                      <Lock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>

    {/* ── Login prompt — fixed sibling so blur on parent doesn't affect it ── */}
    {loginPrompt && selectedEvent && (
      <div
        className="fixed inset-0 flex items-end sm:items-center justify-center z-[1000] bg-black/40"
        onClick={e => { if (e.target === e.currentTarget) setLoginPrompt(false); }}
      >
        <div className="bg-card rounded-t-2xl sm:rounded-xl w-full sm:max-w-sm shadow-2xl p-6 relative">
          <button
            onClick={() => setLoginPrompt(false)}
            className="absolute top-4 right-4 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <h3 className="font-semibold text-base pr-6 mb-3">{eventTitle(selectedEvent)}</h3>

          <div className="flex flex-col gap-1.5 mb-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0" />
              {new Date(selectedEvent.eventDate).toLocaleDateString(t.events.dateLocale, {
                day: "numeric", month: "long", year: "numeric",
              })}
            </div>
            {selectedEvent.locationName && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                {selectedEvent.locationName}
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            {t.events.loginPrompt}
          </p>

          <Button onClick={() => { setLoginPrompt(false); setLoginModal(true); }} className="w-full">
            {t.events.loginBtn}
          </Button>
        </div>
      </div>
    )}

    {/* ── Login modal ── */}
    {loginModal && (
      <div
        className="fixed inset-0 flex items-end sm:items-center justify-center z-[2000] bg-black/50"
        onClick={e => { if (e.target === e.currentTarget) setLoginModal(false); }}
      >
        <div className="bg-card rounded-t-2xl sm:rounded-xl w-full sm:max-w-sm shadow-2xl p-6 relative">
          <button
            onClick={() => setLoginModal(false)}
            className="absolute top-4 right-4 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <h3 className="font-semibold text-lg mb-5">{t.events.loginModalTitle}</h3>
          <AuthForm onSuccess={() => { setLoginModal(false); setIsLoggedIn(true); }} />
        </div>
      </div>
    )}
    </>
  );
}
