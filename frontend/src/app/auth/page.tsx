"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login, register, saveAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mountain, ArrowLeft } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") === "register" ? "register" : "login";

  const [loginForm, setLoginForm]     = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ username: "", email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => { setError(""); setSuccess(""); }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(loginForm.username, loginForm.password);
      saveAuth(user);
      router.push("/trails");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await register(registerForm.username, registerForm.email, registerForm.password);
      setSuccess("Аккаунт создан! Войдите в систему.");
      setRegisterForm({ username: "", email: "", password: "" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-background p-4">

      {/* Back */}
      <button
        onClick={() => router.push("/")}
        className="self-start mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        На главную
      </button>

      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <Mountain className="h-7 w-7 text-primary" />
        <span className="text-2xl font-bold">HikingApp</span>
      </div>

      <div className="w-full max-w-md">
        <Tabs defaultValue={defaultTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="login" className="flex-1" onClick={() => { setError(""); setSuccess(""); }}>
              Войти
            </TabsTrigger>
            <TabsTrigger value="register" className="flex-1" onClick={() => { setError(""); setSuccess(""); }}>
              Регистрация
            </TabsTrigger>
          </TabsList>

          {/* LOGIN */}
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Добро пожаловать</CardTitle>
                <CardDescription>Введите данные для входа в аккаунт</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">Имя пользователя</Label>
                    <Input
                      id="login-username"
                      placeholder="superuser"
                      value={loginForm.username}
                      onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Пароль</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Вход..." : "Войти"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* REGISTER */}
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Создать аккаунт</CardTitle>
                <CardDescription>Регистрация займёт меньше минуты</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-username">Имя пользователя</Label>
                    <Input
                      id="reg-username"
                      placeholder="john_hiker"
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="john@example.com"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Пароль</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      required
                    />
                  </div>
                  {error   && <p className="text-sm text-destructive">{error}</p>}
                  {success && <p className="text-sm text-primary font-medium">{success}</p>}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Создание..." : "Создать аккаунт"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
