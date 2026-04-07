"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getAuth, type AuthUser } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, SlidersHorizontal, X, Loader2 } from "lucide-react";

interface Trail {
  id: number;
  name: string;
  location: string;
  distanceKm: number;
  difficulty: string;
}

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

const difficultyColor: Record<string, string> = {
  Easy:   "bg-green-100 text-green-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Hard:   "bg-red-100 text-red-800",
};

export default function TrailsPage() {
  const router = useRouter();
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [trails, setTrails]   = useState<Trail[]>([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [query,      setQuery]      = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [maxKm,      setMaxKm]      = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = difficulty !== "" || maxKm !== "";

  const load = useCallback(async (q: string, diff: string, km: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q)    params.set("query", q);
    if (diff) params.set("difficulty", diff);
    if (km)   params.set("maxKm", km);
    const qs = params.toString();
    try {
      setTrails(await apiFetch<Trail[]>(`/trails${qs ? "?" + qs : ""}`));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const auth = getAuth();
    if (!auth) { router.push("/auth"); return; }
    setUser(auth);
    load("", "", "");
  }, [router, load]);

  // search on Enter or 400ms debounce
  useEffect(() => {
    const t = setTimeout(() => load(query, difficulty, maxKm), 400);
    return () => clearTimeout(t);
  }, [query, difficulty, maxKm, load]);

  function clearFilters() {
    setQuery("");
    setDifficulty("");
    setMaxKm("");
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar user={user} />

      <main className="max-w-5xl mx-auto px-6 py-10 w-full flex-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Маршруты</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {loading ? "Загрузка..." : `Найдено: ${trails.length}`}
            </p>
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Фильтры
            {hasActiveFilters && (
              <span className="ml-2 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                {[difficulty, maxKm].filter(Boolean).length}
              </span>
            )}
          </Button>
        </div>

        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Поиск по названию или месту..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="rounded-xl border bg-card p-4 mb-6 flex flex-wrap gap-4 items-end">
            {/* Difficulty */}
            <div className="flex-1 min-w-[160px]">
              <p className="text-sm font-medium mb-2">Сложность</p>
              <div className="flex gap-2 flex-wrap">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(difficulty === d ? "" : d)}
                    className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                      difficulty === d
                        ? difficultyColor[d]
                        : "bg-background hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Max distance */}
            <div className="flex-1 min-w-[160px]">
              <p className="text-sm font-medium mb-2">Макс. расстояние (km)</p>
              <div className="flex gap-2 flex-wrap">
                {["5", "10", "15", "25"].map((km) => (
                  <button
                    key={km}
                    onClick={() => setMaxKm(maxKm === km ? "" : km)}
                    className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                      maxKm === km
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    до {km} km
                  </button>
                ))}
                <Input
                  type="number"
                  placeholder="Своё..."
                  value={maxKm}
                  onChange={(e) => setMaxKm(e.target.value)}
                  className="h-8 w-24 text-xs"
                  min={1}
                />
              </div>
            </div>

            {/* Clear */}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                <X className="h-4 w-4 mr-1" />
                Сбросить
              </Button>
            )}
          </div>
        )}

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex gap-2 flex-wrap mb-4">
            {difficulty && (
              <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${difficultyColor[difficulty]}`}>
                {difficulty}
                <button onClick={() => setDifficulty("")}><X className="h-3 w-3" /></button>
              </span>
            )}
            {maxKm && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-primary/10 text-primary">
                до {maxKm} km
                <button onClick={() => setMaxKm("")}><X className="h-3 w-3" /></button>
              </span>
            )}
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : trails.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Ничего не найдено</p>
            <p className="text-sm mt-1">Попробуйте изменить фильтры или поисковый запрос</p>
            {(query || hasActiveFilters) && (
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Сбросить всё
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {trails.map((trail) => (
              <div
                key={trail.id}
                onClick={() => router.push(`/trails/${trail.id}`)}
                className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold hover:text-primary transition-colors">{trail.name}</h3>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0 ml-2 ${
                    difficultyColor[trail.difficulty] ?? "bg-gray-100 text-gray-800"
                  }`}>
                    {trail.difficulty}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span>{trail.location}</span>
                  <span className="mx-1">·</span>
                  <span className="font-medium text-foreground">{trail.distanceKm} km</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
