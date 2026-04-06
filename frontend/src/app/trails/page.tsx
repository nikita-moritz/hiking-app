"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, type AuthUser } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { MapPin, Loader2 } from "lucide-react";

interface Trail {
  id: number;
  name: string;
  location: string;
  distanceKm: number;
  difficulty: string;
}

const difficultyColor: Record<string, string> = {
  Easy:   "bg-green-100 text-green-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Hard:   "bg-red-100 text-red-800",
};

export default function TrailsPage() {
  const router = useRouter();
  const [user, setUser]     = useState<AuthUser | null>(null);
  const [trails, setTrails] = useState<Trail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    if (!auth) { router.push("/auth"); return; }
    setUser(auth);
    apiFetch<Trail[]>("/trails")
      .then(setTrails)
      .finally(() => setLoading(false));
  }, [router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar user={user} />

      <main className="max-w-5xl mx-auto px-6 py-10 w-full flex-1">
        <h2 className="text-2xl font-bold mb-1">Маршруты</h2>
        <p className="text-muted-foreground mb-8">Выбери свой следующий поход</p>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : trails.length === 0 ? (
          <p className="text-muted-foreground">Маршруты не найдены.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {trails.map((trail) => (
              <div
                key={trail.id}
                className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold">{trail.name}</h3>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0 ml-2 ${
                    difficultyColor[trail.difficulty] ?? "bg-gray-100 text-gray-800"
                  }`}>
                    {trail.difficulty}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{trail.location}</span>
                  <span className="mx-1">·</span>
                  <span>{trail.distanceKm} km</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
