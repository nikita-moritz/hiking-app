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
import { Loader2, ArrowLeft } from "lucide-react";

interface Trail { id: number; name: string; location: string; }

export default function NewEventPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [trails, setTrails] = useState<Trail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    trailId: "",
    eventDate: "",
    maxParticipants: "10",
  });

  useEffect(() => {
    const auth = getAuth();
    if (!auth) { router.push("/auth"); return; }
    if (auth.role === "USER") { router.push("/events"); return; }
    setUser(auth);
    apiFetch<Trail[]>("/trails").then(setTrails);
  }, [router]);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiFetch("/events", {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          trailId: form.trailId ? Number(form.trailId) : null,
          eventDate: new Date(form.eventDate).toISOString().replace("Z", ""),
          maxParticipants: Number(form.maxParticipants),
        }),
      });
      router.push("/events");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar user={user} />

      <main className="max-w-xl mx-auto px-6 py-10 w-full">
        <button
          onClick={() => router.push("/events")}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад
        </button>

        <Card>
          <CardHeader>
            <CardTitle>Новое событие</CardTitle>
            <CardDescription>Заполните данные группового похода</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Название *</Label>
                <Input
                  id="title"
                  placeholder="Весенний поход по горам"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <textarea
                  id="description"
                  rows={3}
                  placeholder="Расскажите подробнее о маршруте и требованиях..."
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trail">Маршрут</Label>
                <select
                  id="trail"
                  value={form.trailId}
                  onChange={(e) => set("trailId", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">— выберите маршрут —</option>
                  {trails.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.location})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventDate">Дата и время *</Label>
                <Input
                  id="eventDate"
                  type="datetime-local"
                  value={form.eventDate}
                  onChange={(e) => set("eventDate", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Максимум участников *</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  min={1}
                  max={200}
                  value={form.maxParticipants}
                  onChange={(e) => set("maxParticipants", e.target.value)}
                  required
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {loading ? "Создание..." : "Создать событие"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
