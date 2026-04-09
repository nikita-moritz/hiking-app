"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { getAuth, login, loginWithSupabase, saveAuth, clearAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Mountain, LogIn, LogOut, Sun, Moon, Monitor,
  X, Calendar, MapPin, Map, List, Lock, Loader2, User, Eye, EyeOff,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useT, type Language } from "@/lib/i18n";

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

const GOOGLE_SVG = (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export default function LandingPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useT();
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tab, setTab] = useState<"map" | "list">("map");
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const [loginModal, setLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsLoggedIn(!!getAuth());
    fetchPublicEvents();

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

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const auth = await login(loginEmail, loginPassword);
      saveAuth(auth);
      setLoginModal(false);
      setIsLoggedIn(true);
    } catch (err: any) {
      setLoginError(err.message ?? t.events.loginError);
    } finally {
      setLoginLoading(false);
    }
  }

  const themeIcon = !mounted
    ? <Monitor className="h-4 w-4" />
    : theme === "dark" ? <Sun className="h-4 w-4" />
    : theme === "light" ? <Moon className="h-4 w-4" />
    : <Monitor className="h-4 w-4" />;
  const nextTheme = theme === "dark" ? "light" : theme === "light" ? "system" : "dark";

  function eventTitle(e: PublicEvent) {
    if (lang === "en") return e.titleEn || e.title;
    if (lang === "de") return e.titleDe || e.title;
    return e.titleRu || e.title;
  }

  const mapMarkers = events
    .filter(e => e.latitude != null && e.longitude != null)
    .map(e => ({ id: e.id, lat: e.latitude!, lng: e.longitude!, title: eventTitle(e), eventDate: e.eventDate }));

  const selectedEvent = events.find(e => e.id === selectedId);

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">

      {/* ── Header ── */}
      <header className="border-b bg-card/80 backdrop-blur shrink-0 z-[500] relative">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Mountain className="h-5 w-5 text-primary" />
            HikingApp
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border overflow-hidden text-xs font-medium">
              {(["ru", "en", "de"] as Language[]).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2 py-1 transition-colors ${lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <button
              onClick={() => setTheme(nextTheme)}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {themeIcon}
            </button>
            {isLoggedIn ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => router.push("/profile")} className="gap-1.5">
                  <User className="h-4 w-4" />
                  <span className="max-w-[120px] truncate">{getAuth()?.username}</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => { clearAuth(); setIsLoggedIn(false); }} className="text-muted-foreground">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => { setLoginModal(true); setLoginError(""); }} className="gap-2">
                <LogIn className="h-4 w-4" />
                {t.events.loginBtn}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* ── Tabs ── */}
      <div className="border-b bg-card shrink-0 z-[400] relative">
        <div className="max-w-6xl mx-auto px-4 flex">
          {([
            { key: "map",  label: t.events.tabMap,  Icon: Map  },
            { key: "list", label: t.events.tabList, Icon: List },
          ] as const).map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
          <span className="ml-auto self-center text-xs text-muted-foreground pr-1">
            {t.events.eventCount(events.length)}
          </span>
        </div>
      </div>

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

        {/* ── Login prompt (shared between tabs) ── */}
        {loginPrompt && selectedEvent && (
          <div
            className="absolute inset-0 flex items-end sm:items-center justify-center z-[1000] bg-black/40"
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

              <Button onClick={signInWithGoogle} className="w-full gap-2">
                {GOOGLE_SVG}
                {t.events.loginWithGoogle}
              </Button>
            </div>
          </div>
        )}
      </div>
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

            <Button variant="outline" className="w-full gap-2 mb-4" onClick={signInWithGoogle}>
              {GOOGLE_SVG}
              {t.events.loginWithGoogle}
            </Button>

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
              <div className="relative flex justify-center"><span className="bg-card px-3 text-xs text-muted-foreground">{t.events.orDivider}</span></div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-3">
              <Input
                type="text"
                placeholder={t.events.emailPlaceholder}
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                required
                autoComplete="username"
              />
              <div className="relative">
                <Input
                  type={showLoginPassword ? "text" : "password"}
                  placeholder={t.events.passwordPlaceholder}
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {loginError && <p className="text-sm text-destructive">{loginError}</p>}
              <Button type="submit" className="w-full" disabled={loginLoading}>
                {loginLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.events.loginBtn}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
