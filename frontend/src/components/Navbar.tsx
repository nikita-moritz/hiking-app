"use client";

import { useRouter, usePathname } from "next/navigation";
import { Mountain, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearAuth, type AuthUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

const baseLinks = [
  { href: "/trails", label: "Маршруты" },
  { href: "/events", label: "События" },
];

export default function Navbar({ user }: { user: AuthUser }) {
  const router = useRouter();
  const pathname = usePathname();

  const links = [
    ...baseLinks,
    ...(user.role === "SUPERUSER" ? [{ href: "/admin", label: "Админ" }] : []),
  ];

  function logout() {
    clearAuth();
    router.push("/");
  }

  return (
    <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={() => router.push("/")} className="flex items-center gap-2 font-bold text-lg">
            <Mountain className="h-5 w-5 text-primary" />
            HikingApp
          </button>
          <nav className="flex gap-1">
            {links.map((l) => (
              <button
                key={l.href}
                onClick={() => router.push(l.href)}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-md transition-colors",
                  pathname === l.href
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {l.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:block">
            {user.username}
            <span className="ml-2 text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {user.role}
            </span>
          </span>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4 mr-1" />
            Выйти
          </Button>
        </div>
      </div>
    </header>
  );
}
