"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Mountain, MapPin, Users, Shield, ChevronRight, Star } from "lucide-react";

const features = [
  {
    icon: Mountain,
    title: "Тысячи маршрутов",
    description: "Исследуй горные тропы, лесные дорожки и побережья по всему миру.",
  },
  {
    icon: MapPin,
    title: "Точная навигация",
    description: "Подробные карты, высотные профили и GPS-треки для каждого маршрута.",
  },
  {
    icon: Users,
    title: "Сообщество",
    description: "Участвуй в групповых походах, делись опытом и находи попутчиков.",
  },
  {
    icon: Shield,
    title: "Безопасность",
    description: "Проверенные маршруты, актуальные условия и экстренные контакты.",
  },
];

const stats = [
  { value: "2400+", label: "Маршрутов" },
  { value: "18K+", label: "Участников" },
  { value: "142", label: "Регионов" },
  { value: "4.9", label: "Рейтинг", icon: Star },
];

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!getAuth());
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Navbar */}
      <header className="border-b sticky top-0 z-10 bg-background/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mountain className="text-primary h-6 w-6" />
            <span className="font-bold text-lg">HikingApp</span>
          </div>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Button onClick={() => router.push("/trails")}>
                Перейти в приложение
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => router.push("/auth?tab=login")}>
                  Войти
                </Button>
                <Button onClick={() => router.push("/auth?tab=register")}>
                  Регистрация
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 bg-gradient-to-b from-primary/5 to-background">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <Mountain className="h-4 w-4" />
          Приложение для любителей природы
        </div>

        <h1 className="text-5xl font-extrabold tracking-tight max-w-2xl leading-tight mb-4">
          Открой мир{" "}
          <span className="text-primary">пешего туризма</span>
        </h1>

        <p className="text-muted-foreground text-lg max-w-xl mb-10">
          Находи маршруты, организуй походы и присоединяйся к сообществу
          единомышленников. От новичков до опытных туристов — для каждого.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          {isLoggedIn ? (
            <Button size="lg" onClick={() => router.push("/trails")}>
              Открыть маршруты
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <>
              <Button size="lg" onClick={() => router.push("/auth?tab=register")}>
                Начать бесплатно
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => router.push("/auth?tab=login")}>
                Войти в аккаунт
              </Button>
            </>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/30">
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="flex items-center justify-center gap-1">
                <span className="text-3xl font-bold text-primary">{s.value}</span>
                {s.icon && <s.icon className="h-5 w-5 text-yellow-500 fill-yellow-500" />}
              </div>
              <p className="text-muted-foreground text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-20 w-full">
        <h2 className="text-3xl font-bold text-center mb-2">Всё для твоего похода</h2>
        <p className="text-muted-foreground text-center mb-12">
          Инструменты и сообщество, которые сделают каждый поход незабываемым
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border bg-card p-6 flex gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary/10 rounded-lg p-3 h-fit">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-primary text-primary-foreground">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-bold mb-3">Готов к первому походу?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">
            Присоединяйся к тысячам туристов. Регистрация занимает меньше минуты.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => router.push("/auth?tab=register")}
          >
            Создать аккаунт
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t text-center text-sm text-muted-foreground py-6">
        © 2026 HikingApp. Все права защищены.
      </footer>
    </div>
  );
}
