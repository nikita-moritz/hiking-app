"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { login, register, loginWithSupabase, saveAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useT } from "@/lib/i18n";

const GOOGLE_SVG = (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

interface AuthFormProps {
  onSuccess?: () => void;
}

export default function AuthForm({ onSuccess }: AuthFormProps) {
  const router = useRouter();
  const { t } = useT();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        const auth = await login(username, password);
        saveAuth(auth);
      } else {
        await register(username, email, password);
        const auth = await login(username, password);
        saveAuth(auth);
      }
      onSuccess ? onSuccess() : router.replace("/");
    } catch (err: any) {
      setError(err.message ?? t.auth.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Google */}
      <Button variant="outline" className="w-full gap-2 opacity-50 cursor-not-allowed" disabled>
        {GOOGLE_SVG}
        {t.auth.loginWithGoogleSoon}
      </Button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
        <div className="relative flex justify-center">
          <span className="bg-card px-3 text-xs text-muted-foreground">{t.events.orDivider}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border rounded-lg overflow-hidden">
        <button
          onClick={() => { setMode("login"); setError(""); }}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === "login" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
        >
          {t.auth.loginTab}
        </button>
        <button
          onClick={() => { setMode("register"); setError(""); }}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === "register" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
        >
          {t.auth.registerTab}
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <Label htmlFor="af-username">{t.auth.username ?? "Логин"}</Label>
          <Input
            id="af-username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            placeholder="username"
            autoComplete="username"
          />
        </div>

        {mode === "register" && (
          <div>
            <Label htmlFor="af-email">Email</Label>
            <Input
              id="af-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
        )}

        <div>
          <Label htmlFor="af-password">{t.auth.password}</Label>
          <div className="relative">
            <Input
              id="af-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              minLength={6}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : mode === "login" ? t.auth.loginBtn : t.auth.registerSubmitBtn}
        </Button>
      </form>
    </div>
  );
}
