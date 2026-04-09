"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Mountain, LogOut, Menu, X, Sun, Moon, Monitor, User } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { getAuth, clearAuth, type AuthUser } from "@/lib/auth";
import { useT, type Language } from "@/lib/i18n";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { lang, setLang } = useT();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUser(getAuth());
  }, []);

  async function logout() {
    clearAuth();
    await supabase.auth.signOut();
    router.push("/");
  }

  const links: { href: string; label: string; icon: React.ElementType }[] = [];

  const themeIcon = !mounted ? <Monitor className="h-4 w-4" /> : theme === "dark" ? <Sun className="h-4 w-4" /> : theme === "light" ? <Moon className="h-4 w-4" /> : <Monitor className="h-4 w-4" />;
  const nextTheme = theme === "dark" ? "light" : theme === "light" ? "system" : "dark";

  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <button onClick={() => router.push("/")} className="flex items-center gap-2 font-bold text-base shrink-0">
          <Mountain className="h-5 w-5 text-primary" />
          <span className="hidden sm:inline">HikingApp</span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {links.map(({ href, label, icon: Icon }) => (
            <button
              key={href}
              onClick={() => router.push(href)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname === href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-2">
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
          <button onClick={() => setTheme(nextTheme)} className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            {themeIcon}
          </button>
          {user ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => router.push("/profile")} className="gap-1.5">
                <User className="h-4 w-4" />
                <span className="max-w-[120px] truncate">{user.username}</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => router.push("/auth")}>Войти</Button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 text-muted-foreground hover:text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t bg-card px-4 py-3 flex flex-col gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <button
              key={href}
              onClick={() => { router.push(href); setOpen(false); }}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left ${
                pathname === href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
          <div className="border-t my-1" />
          <div className="flex items-center justify-between px-3 py-2">
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
            <button onClick={() => setTheme(nextTheme)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground">
              {themeIcon}
            </button>
          </div>
          {user ? (
            <>
              <button onClick={() => { router.push("/profile"); setOpen(false); }} className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm text-left hover:bg-muted">
                <User className="h-4 w-4" /> Профиль
              </button>
              <button onClick={logout} className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm text-left text-destructive hover:bg-muted">
                <LogOut className="h-4 w-4" /> Выйти
              </button>
            </>
          ) : (
            <Button onClick={() => { router.push("/auth"); setOpen(false); }} className="mt-1">Войти</Button>
          )}
        </div>
      )}
    </header>
  );
}
