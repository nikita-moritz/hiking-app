"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, Menu, X, Sun, Moon, Monitor, User, Map, List } from "lucide-react";

const MountainFilled = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary" fill="currentColor">
    <path d="m8 3 4 8 5-5 5 15H2L8 3z"/>
  </svg>
);
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
    const sync = () => setUser(getAuth());
    window.addEventListener("auth-change", sync);
    return () => window.removeEventListener("auth-change", sync);
  }, []);

  async function logout() {
    clearAuth();
    supabase.auth.signOut().catch(() => {});
    router.push("/");
  }

  const { t } = useT();

  const [activeTab, setActiveTab] = useState<string | null>(null);

  useEffect(() => {
    const onTab = (e: Event) => setActiveTab((e as CustomEvent).detail);
    window.addEventListener("tab-change", onTab);
    return () => window.removeEventListener("tab-change", onTab);
  }, []);

  function goTab(tab: string) {
    if (pathname === "/") {
      window.dispatchEvent(new CustomEvent("tab-change", { detail: tab }));
    } else {
      router.push(`/?tab=${tab}`);
    }
  }

  const links: { key?: string; href?: string; label: string; icon: React.ElementType; onClick?: () => void }[] = [
    { key: "map",  label: t.events.tabMap,  icon: Map,  onClick: () => goTab("map")  },
    { key: "list", label: t.events.tabList, icon: List, onClick: () => goTab("list") },
  ];

  const themeIcon = !mounted ? <Monitor className="h-4 w-4" /> : theme === "dark" ? <Sun className="h-4 w-4" /> : theme === "light" ? <Moon className="h-4 w-4" /> : <Monitor className="h-4 w-4" />;
  const nextTheme = theme === "dark" ? "light" : theme === "light" ? "system" : "dark";

  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <button onClick={() => router.push("/")} className="flex items-center gap-2 font-bold text-base shrink-0">
          <MountainFilled />
          <span className="hidden sm:inline">HikingApp</span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {links.map(({ key, label, icon: Icon, onClick }) => {
            const active = pathname === "/" && activeTab === key;
            return (
              <button
                key={key}
                onClick={onClick}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            );
          })}
          {user && (
            <Button variant="ghost" size="sm" onClick={() => router.push("/profile")} className="gap-1.5">
              <User className="h-4 w-4" />
              <span className="max-w-[120px] truncate">{user.username}</span>
            </Button>
          )}
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-2">
          <select
            value={lang}
            onChange={e => setLang(e.target.value as Language)}
            className="text-xs font-medium border rounded-md px-2 py-1 bg-card text-foreground cursor-pointer focus:outline-none hover:bg-muted transition-colors"
          >
            <option value="ru">RU</option>
            <option value="en">EN</option>
            <option value="de">DE</option>
          </select>
          <button onClick={() => setTheme(nextTheme)} className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            {themeIcon}
          </button>
          {user ? (
            <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground">
              <LogOut className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="sm" onClick={() => router.push("/auth")}>{t.events.loginBtn}</Button>
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
          {links.map(({ key, label, icon: Icon, onClick }) => {
            const active = pathname === "/" && activeTab === key;
            return (
              <button
                key={key}
                onClick={() => { onClick?.(); setOpen(false); }}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left ${
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            );
          })}
          <div className="border-t my-1" />
          <div className="flex items-center justify-between px-3 py-2">
            <select
              value={lang}
              onChange={e => setLang(e.target.value as Language)}
              className="text-xs font-medium border rounded-md px-2 py-1 bg-card text-foreground cursor-pointer focus:outline-none hover:bg-muted transition-colors"
            >
              <option value="ru">RU</option>
              <option value="en">EN</option>
              <option value="de">DE</option>
            </select>
            <button onClick={() => setTheme(nextTheme)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground">
              {themeIcon}
            </button>
          </div>
          {!user && (
            <Button onClick={() => { router.push("/auth"); setOpen(false); }} className="mt-1">{t.events.loginBtn}</Button>
          )}
          {user && (
            <button onClick={logout} className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm text-left text-destructive hover:bg-muted">
              <LogOut className="h-4 w-4" /> {t.nav.logout}
            </button>
          )}
        </div>
      )}
    </header>
  );
}
