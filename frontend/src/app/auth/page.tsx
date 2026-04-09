"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { loginWithSupabase, saveAuth, getAuth } from "@/lib/auth";
import { useT } from "@/lib/i18n";
import AuthForm from "@/components/AuthForm";

const MountainFilled = () => (
  <svg viewBox="0 0 24 24" className="h-7 w-7 text-primary" fill="currentColor">
    <path d="m8 3 4 8 5-5 5 15H2L8 3z"/>
  </svg>
);

export default function AuthPage() {
  const router = useRouter();
  const { t } = useT();

  useEffect(() => {
    if (getAuth()) { router.replace("/"); return; }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session?.access_token) {
        try {
          const auth = await loginWithSupabase(session.access_token);
          saveAuth(auth);
          router.replace("/");
        } catch {}
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <MountainFilled />
          <span className="text-2xl font-bold">HikingApp</span>
        </div>

        <AuthForm onSuccess={() => router.replace("/")} />

        <p className="text-center text-xs text-muted-foreground mt-4">
          {t.auth.justLooking}{" "}
          <button onClick={() => router.push("/")} className="text-primary hover:underline">{t.auth.toHome}</button>
        </p>
      </div>
    </div>
  );
}
