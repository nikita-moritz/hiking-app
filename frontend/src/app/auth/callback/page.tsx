"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { loginWithSupabase, saveAuth } from "@/lib/auth";
import { Loader2, Mountain, AlertCircle } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { t } = useT();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setStatus(t.auth.callbackStatus);
  }, [t]);

  useEffect(() => {
    let done = false;

    async function finish(accessToken: string) {
      if (done) return;
      done = true;
      try {
        setStatus(t.auth.callbackCreating);
        const auth = await loginWithSupabase(accessToken);
        saveAuth(auth);
        router.replace("/");
      } catch (err: any) {
        setError(err.message ?? t.auth.callbackError);
      }
    }

    // With implicit flow, Supabase reads tokens from URL hash automatically
    // and fires SIGNED_IN. We just listen.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session?.access_token) {
        subscription.unsubscribe();
        finish(session.access_token);
      }
    });

    // Check if session already ready
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.access_token) {
        subscription.unsubscribe();
        finish(data.session.access_token);
      }
    });

    const timeout = setTimeout(() => {
      if (!done) {
        subscription.unsubscribe();
        const url = window.location.href;
        const hash = window.location.hash;
        const search = window.location.search;
        console.error("Auth timeout. URL:", url);
        console.error("Hash:", hash || "(empty)");
        console.error("Search:", search || "(empty)");
        setError(`Timeout. search="${search}" hash="${hash.slice(0,60)}"`);
      }
    }, 15000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-4">
      <AlertCircle className="h-8 w-8 text-destructive" />
      <p className="text-destructive font-medium">{error}</p>
      <button onClick={() => router.push("/auth")} className="text-sm text-primary hover:underline mt-2">
        {t.auth.backToLogin}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Mountain className="h-8 w-8 text-primary" />
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{status ?? t.auth.callbackStatus}</p>
    </div>
  );
}
