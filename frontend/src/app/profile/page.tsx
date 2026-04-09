"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, type AuthUser } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { useT } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, KeyRound, Loader2, CheckCircle } from "lucide-react";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
}

const roleVariant: Record<string, "default" | "warning" | "success" | "outline"> = {
  SUPERUSER: "default",
  USER:      "outline",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useT();
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [pwForm, setPwForm]       = useState({ current: "", next: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError]     = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    if (!auth) { router.push("/auth"); return; }
    setUser(auth);

    apiFetch<UserProfile>("/profile")
      .then(p => setProfile(p))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);

    if (pwForm.next !== pwForm.confirm) { setPwError(t.profile.pwMismatch); return; }
    if (pwForm.next.length < 6)         { setPwError(t.profile.pwTooShort); return; }

    setPwLoading(true);
    try {
      await apiFetch<string>("/profile/password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
      });
      setPwSuccess(true);
      setPwForm({ current: "", next: "", confirm: "" });
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : t.common.error);
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
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 w-full flex-1">
        <h1 className="text-2xl font-bold mb-8">{t.profile.title}</h1>

        <div className="grid sm:grid-cols-2 gap-6">

          {/* Profile info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                {t.profile.accountData}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">{t.profile.username}</span>
                <span className="font-medium">{profile?.username}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">{t.profile.email}</span>
                <span className="font-medium text-sm break-all text-right ml-2">{profile?.email}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">{t.profile.role}</span>
                <Badge variant={roleVariant[profile?.role ?? "USER"] ?? "outline"}>
                  {profile?.role}
                </Badge>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">{t.profile.status}</span>
                <Badge variant={profile?.active ? "success" : "destructive"}>
                  {profile?.active ? t.profile.active : t.profile.blocked}
                </Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">{t.profile.registeredAt}</span>
                <span className="text-sm">{profile ? fmtDate(profile.createdAt) : "—"}</span>
              </div>
            </CardContent>
          </Card>

          {/* Change password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" />
                {t.profile.changePassword}
              </CardTitle>
              <CardDescription>{t.profile.minLength}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current">{t.profile.currentPw}</Label>
                  <Input
                    id="current" type="password" placeholder="••••••••"
                    value={pwForm.current}
                    onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="next">{t.profile.newPw}</Label>
                  <Input
                    id="next" type="password" placeholder="••••••••"
                    value={pwForm.next}
                    onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">{t.profile.confirmPw}</Label>
                  <Input
                    id="confirm" type="password" placeholder="••••••••"
                    value={pwForm.confirm}
                    onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                    required
                  />
                </div>

                {pwError && <p className="text-sm text-destructive">{pwError}</p>}
                {pwSuccess && (
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <CheckCircle className="h-4 w-4" />
                    {t.profile.pwSuccess}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={pwLoading}>
                  {pwLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {pwLoading ? t.profile.saving : t.profile.savePw}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
