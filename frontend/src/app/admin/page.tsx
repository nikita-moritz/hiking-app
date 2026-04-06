"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, type AuthUser } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users, ShieldCheck, User, Trash2, PowerOff, Power,
  Loader2, ScrollText, RefreshCw,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface UserItem {
  id: number;
  username: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
}

interface AuditItem {
  id: number;
  username: string;
  action: string;
  ipAddress: string;
  createdAt: string;
}

interface AuditPage {
  content: AuditItem[];
  totalElements: number;
  totalPages: number;
  number: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const roleVariant: Record<string, "default" | "warning" | "success" | "outline"> = {
  SUPERUSER: "default",
  ADMIN:     "warning",
  USER:      "outline",
};

function RoleBadge({ role }: { role: string }) {
  return <Badge variant={roleVariant[role] ?? "outline"}>{role}</Badge>;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  // users tab
  const [users, setUsers]       = useState<UserItem[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);

  // audit tab
  const [audit, setAudit]           = useState<AuditPage | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditPage, setAuditPage]   = useState(0);

  useEffect(() => {
    const auth = getAuth();
    if (!auth) { router.push("/auth"); return; }
    if (auth.role !== "SUPERUSER") { router.push("/"); return; }
    setUser(auth);
    loadUsers();
  }, [router]);

  async function loadUsers() {
    setUsersLoading(true);
    try { setUsers(await apiFetch<UserItem[]>("/users")); }
    finally { setUsersLoading(false); }
  }

  async function loadAudit(page = 0) {
    setAuditLoading(true);
    try {
      setAudit(await apiFetch<AuditPage>(`/audit?page=${page}&size=15&sort=createdAt,desc`));
      setAuditPage(page);
    } finally { setAuditLoading(false); }
  }

  async function changeRole(id: number, role: string) {
    setActionId(id);
    try {
      const updated = await apiFetch<UserItem>(`/users/${id}/role`, {
        method: "PUT",
        body: JSON.stringify({ role }),
      });
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Ошибка");
    } finally { setActionId(null); }
  }

  async function toggleActive(id: number) {
    setActionId(id);
    try {
      const updated = await apiFetch<UserItem>(`/users/${id}/toggle`, { method: "PUT" });
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Ошибка");
    } finally { setActionId(null); }
  }

  async function deleteUser(id: number, username: string) {
    if (!confirm(`Удалить пользователя «${username}»?`)) return;
    setActionId(id);
    try {
      await apiFetch(`/users/${id}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Ошибка");
    } finally { setActionId(null); }
  }

  if (!user) return null;

  const superusers = users.filter((u) => u.role === "SUPERUSER").length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar user={user} />

      <main className="max-w-5xl mx-auto px-6 py-10 w-full flex-1">
        <div className="flex items-center gap-3 mb-8">
          <ShieldCheck className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Панель администратора</h1>
            <p className="text-muted-foreground text-sm">Управление пользователями и мониторинг активности</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Всего пользователей", value: users.length, icon: Users },
            { label: "Суперюзеров",         value: superusers,   icon: ShieldCheck },
            { label: "Активных",            value: users.filter((u) => u.active).length, icon: User },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border bg-card p-4 flex items-center gap-4">
              <div className="bg-primary/10 rounded-lg p-2.5">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <Tabs defaultValue="users">
          <TabsList className="mb-6">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Пользователи
            </TabsTrigger>
            <TabsTrigger
              value="audit"
              className="flex items-center gap-2"
              onClick={() => { if (!audit) loadAudit(0); }}
            >
              <ScrollText className="h-4 w-4" /> Аудит лог
            </TabsTrigger>
          </TabsList>

          {/* ── USERS TAB ──────────────────────────────────────────────────── */}
          <TabsContent value="users">
            <div className="flex justify-end mb-3">
              <Button variant="outline" size="sm" onClick={loadUsers} disabled={usersLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${usersLoading ? "animate-spin" : ""}`} />
                Обновить
              </Button>
            </div>

            {usersLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="rounded-xl border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Пользователь</th>
                      <th className="text-left px-4 py-3 font-medium">Email</th>
                      <th className="text-left px-4 py-3 font-medium">Роль</th>
                      <th className="text-left px-4 py-3 font-medium">Статус</th>
                      <th className="text-left px-4 py-3 font-medium">Дата</th>
                      <th className="px-4 py-3 font-medium">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={u.id} className={`border-t ${!u.active ? "opacity-50" : ""}`}>
                        <td className="px-4 py-3 font-medium">{u.username}</td>
                        <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                        <td className="px-4 py-3">
                          <RoleBadge role={u.role} />
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={u.active ? "success" : "destructive"}>
                            {u.active ? "Активен" : "Заблокирован"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {fmtDate(u.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 justify-end">
                            {/* Role selector */}
                            <select
                              value={u.role}
                              disabled={actionId === u.id || u.id === user.id ? true : undefined}
                              onChange={(e) => changeRole(u.id, e.target.value)}
                              className="text-xs border rounded px-2 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                            >
                              <option value="USER">USER</option>
                              <option value="ADMIN">ADMIN</option>
                              <option value="SUPERUSER">SUPERUSER</option>
                            </select>

                            {/* Toggle active */}
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={actionId === u.id || u.id === user.id ? true : undefined}
                              onClick={() => toggleActive(u.id)}
                              title={u.active ? "Заблокировать" : "Разблокировать"}
                            >
                              {actionId === u.id
                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                : u.active
                                  ? <PowerOff className="h-4 w-4 text-yellow-600" />
                                  : <Power className="h-4 w-4 text-green-600" />
                              }
                            </Button>

                            {/* Delete */}
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={actionId === u.id || u.id === user.id ? true : undefined}
                              onClick={() => deleteUser(u.id, u.username)}
                              title="Удалить"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          {/* ── AUDIT TAB ──────────────────────────────────────────────────── */}
          <TabsContent value="audit">
            <div className="flex justify-end mb-3">
              <Button variant="outline" size="sm" onClick={() => loadAudit(auditPage)} disabled={auditLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${auditLoading ? "animate-spin" : ""}`} />
                Обновить
              </Button>
            </div>

            {auditLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : !audit ? (
              <p className="text-muted-foreground text-center py-16">Нажмите на вкладку для загрузки</p>
            ) : (
              <>
                <div className="rounded-xl border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-muted-foreground">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium">Пользователь</th>
                        <th className="text-left px-4 py-3 font-medium">Действие</th>
                        <th className="text-left px-4 py-3 font-medium">IP</th>
                        <th className="text-left px-4 py-3 font-medium">Время</th>
                      </tr>
                    </thead>
                    <tbody>
                      {audit.content.map((log) => (
                        <tr key={log.id} className="border-t">
                          <td className="px-4 py-2.5 font-medium">{log.username ?? "—"}</td>
                          <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{log.action}</td>
                          <td className="px-4 py-2.5 text-muted-foreground text-xs">{log.ipAddress ?? "—"}</td>
                          <td className="px-4 py-2.5 text-muted-foreground text-xs">{fmtDate(log.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {audit.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Записей: {audit.totalElements} · Страница {audit.number + 1} из {audit.totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline" size="sm"
                        disabled={audit.number === 0}
                        onClick={() => loadAudit(audit.number - 1)}
                      >
                        ← Назад
                      </Button>
                      <Button
                        variant="outline" size="sm"
                        disabled={audit.number >= audit.totalPages - 1}
                        onClick={() => loadAudit(audit.number + 1)}
                      >
                        Вперёд →
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
