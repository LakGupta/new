"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ACTIVE_STATUSES,
  STATUSES,
  STATUS_LABELS,
  type EntryStatus,
  type QueueSource,
  type CombinedEntryWithPositions,
} from "@/lib/types";
import { QueueCard, StatCard } from "./admin-app";

type AuthState = "checking" | "logged-out" | "logged-in";
type Filter = EntryStatus | "all";
type EntryKey = `${QueueSource}-${number}`;

interface AddForm {
  redditUsername: string;
  whatsapp: string;
  note: string;
  messagedAt: string;
}

interface EditForm extends AddForm {
  source: QueueSource;
}

const EMPTY_FORM: AddForm = {
  redditUsername: "",
  whatsapp: "",
  note: "",
  messagedAt: "",
};

function toDatetimeLocal(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function entryKey(entry: CombinedEntryWithPositions): EntryKey {
  return `${entry.source}-${entry.id}`;
}

export default function CombinedAdminApp() {
  const [authState, setAuthState] = useState<AuthState>("checking");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  const [entries, setEntries] = useState<CombinedEntryWithPositions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [addSource, setAddSource] = useState<QueueSource>("regular");
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [addError, setAddError] = useState<string | null>(null);
  const [addBusy, setAddBusy] = useState(false);

  const [editingKey, setEditingKey] = useState<EntryKey | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    ...EMPTY_FORM,
    source: "regular",
  });
  const [editError, setEditError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<EntryKey | null>(null);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/queue");
      if (response.status === 401) {
        setAuthState("logged-out");
        return;
      }
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load the queue.");
      }
      setEntries(data.entries as CombinedEntryWithPositions[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load the queue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/check");
        if (response.ok) {
          setAuthState("logged-in");
          await loadEntries();
        } else {
          setAuthState("logged-out");
          setLoading(false);
        }
      } catch {
        setAuthState("logged-out");
        setLoading(false);
      }
    }
    void checkAuth();
  }, [loadEntries]);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Login failed.");
      }
      setPassword("");
      setAuthState("logged-in");
      await loadEntries();
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Login failed.");
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthState("logged-out");
    setEntries([]);
  }

  async function handleCreateEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAddError(null);
    setAddBusy(true);
    try {
      const endpoint = addSource === "historical" ? "/api/historical" : "/api/entries";
      const body =
        addSource === "historical"
          ? addForm
          : {
              redditUsername: addForm.redditUsername,
              whatsapp: addForm.whatsapp,
              note: addForm.note,
            };
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to add entry.");
      }
      setAddForm(EMPTY_FORM);
      setShowAdd(false);
      await loadEntries();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Failed to add entry.");
    } finally {
      setAddBusy(false);
    }
  }

  async function updateEntry(
    source: QueueSource,
    id: number,
    patch: Record<string, unknown>,
  ) {
    const key = `${source}-${id}` as EntryKey;
    setBusyId(key);
    setError(null);
    try {
      const endpoint =
        source === "historical" ? `/api/historical/${id}` : `/api/entries/${id}`;
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update entry.");
      }
      await loadEntries();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update entry.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(source: QueueSource, id: number) {
    const label = source === "historical" ? "historical queue" : "queue";
    if (!window.confirm(`Delete this person from the ${label}?`)) return;
    const key = `${source}-${id}` as EntryKey;
    setBusyId(key);
    setError(null);
    try {
      const endpoint =
        source === "historical" ? `/api/historical/${id}` : `/api/entries/${id}`;
      const response = await fetch(endpoint, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete entry.");
      }
      await loadEntries();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete entry.");
    } finally {
      setBusyId(null);
    }
  }

  function startEdit(entry: CombinedEntryWithPositions) {
    setEditingKey(entryKey(entry));
    setEditError(null);
    setEditForm({
      source: entry.source,
      redditUsername: entry.redditUsername,
      whatsapp: entry.whatsapp,
      note: entry.note ?? "",
      messagedAt:
        entry.source === "historical" && entry.messagedAt
          ? toDatetimeLocal(entry.messagedAt)
          : "",
    });
  }

  async function handleEditSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingKey) return;
    const [source, idParam] = editingKey.split("-") as [QueueSource, string];
    const id = Number(idParam);
    setEditError(null);
    setBusyId(editingKey);
    try {
      const patch =
        source === "historical"
          ? {
              redditUsername: editForm.redditUsername,
              whatsapp: editForm.whatsapp,
              note: editForm.note,
              messagedAt: editForm.messagedAt,
            }
          : {
              redditUsername: editForm.redditUsername,
              whatsapp: editForm.whatsapp,
              note: editForm.note,
            };
      const endpoint =
        source === "historical" ? `/api/historical/${id}` : `/api/entries/${id}`;
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save changes.");
      }
      setEditingKey(null);
      await loadEntries();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to save changes.");
    } finally {
      setBusyId(null);
    }
  }

  const filteredEntries = useMemo(() => {
    const query = search.trim().toLowerCase();
    // Search by digits so "98765 43210", "+91 98765 43210", or just
    // "9876543210" all find entries stored as "919876543210".
    const queryDigits = query.replace(/\D/g, "");
    return entries.filter((entry) => {
      if (filter !== "all" && entry.status !== filter) return false;
      if (!query) return true;

      const entryDigits = entry.whatsapp;
      const digitsMatch =
        (queryDigits.length > 0 && entryDigits.includes(queryDigits)) ||
        (queryDigits.length >= 10 &&
          entryDigits.slice(-10) === queryDigits.slice(-10));

      return (
        entry.redditUsername.toLowerCase().includes(query) ||
        entryDigits.includes(query) ||
        digitsMatch ||
        (entry.note ?? "").toLowerCase().includes(query)
      );
    });
  }, [entries, search, filter]);

  const stats = useMemo(
    () => ({
      active: entries.filter((e) => ACTIVE_STATUSES.includes(e.status)).length,
      waiting: entries.filter((e) => e.status === "waiting").length,
      contacted: entries.filter((e) => e.status === "contacted").length,
      sold: entries.filter((e) => e.status === "sold").length,
      unresolved: entries.filter(
        (e) => e.status === "no-response" || e.status === "skipped",
      ).length,
      historical: entries.filter((e) => e.source === "historical").length,
      regular: entries.filter((e) => e.source === "regular").length,
    }),
    [entries],
  );

  if (authState === "checking") {
    return (
      <div className="flex flex-1 items-center justify-center px-4">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-muted-foreground">
          Checking…
        </p>
      </div>
    );
  }

  if (authState === "logged-out") {
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-6 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-accent">
              Admin
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">
              Helios Queue
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter the admin password to manage the combined waitlist.
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <label
              htmlFor="admin-password-combined"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Password
            </label>
            <input
              id="admin-password-combined"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-accent"
              placeholder="••••••••"
            />

            {loginError ? (
              <div
                role="alert"
                className="mt-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {loginError}
              </div>
            ) : null}

            <button
              type="submit"
              className="mt-4 w-full cursor-pointer rounded-xl bg-accent py-3 text-base font-semibold text-accent-foreground transition hover:bg-blue-400 active:scale-[0.99]"
            >
              Unlock admin
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-10">
      {/* Header */}
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-accent">
            Admin
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Helios Queue
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {entries.length} total · {stats.active} active · {stats.historical}{" "}
            historical · {stats.regular} website
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="cursor-pointer rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          Log out
        </button>
      </header>

      {error ? (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}

      {/* Stats */}
      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard label="Active" value={stats.active} highlight />
        <StatCard label="Waiting" value={stats.waiting} />
        <StatCard label="Contacted" value={stats.contacted} />
        <StatCard label="Sold" value={stats.sold} />
        <StatCard label="No reply / skipped" value={stats.unresolved} />
      </section>

      {/* Toolbar */}
      <section className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search username, WhatsApp, note…"
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-accent"
          />
        </div>
        <button
          onClick={() => {
            setShowAdd((v) => !v);
            setAddError(null);
          }}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition hover:bg-blue-400 active:scale-[0.98]"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          {showAdd ? "Close" : "Add manually"}
        </button>
      </section>

      {/* Filter chips */}
      <section className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {(["all", ...STATUSES] as Filter[]).map((value) => {
          const label = value === "all" ? "All" : STATUS_LABELS[value];
          const count =
            value === "all"
              ? entries.length
              : entries.filter((e) => e.status === value).length;
          const active = filter === value;
          return (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`shrink-0 cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                active
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {label} · {count}
            </button>
          );
        })}
      </section>

      {/* Add manually */}
      {showAdd ? (
        <form
          onSubmit={handleCreateEntry}
          className="mb-5 rounded-2xl border border-border bg-card p-5"
        >
          <h2 className="mb-4 text-lg font-semibold">Add someone manually</h2>

          <div className="mb-4">
            <span className="mb-1.5 block text-sm font-medium text-foreground">
              Which queue?
            </span>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { value: "regular", label: "Website queue" },
                  { value: "historical", label: "Historical queue" },
                ] as const
              ).map((option) => {
                const selected = addSource === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setAddSource(option.value);
                      setAddForm(EMPTY_FORM);
                    }}
                    className={`cursor-pointer rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                      selected
                        ? "border-accent bg-accent/15 text-accent"
                        : "border-border bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="add-combined-reddit"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Reddit username
              </label>
              <input
                id="add-combined-reddit"
                type="text"
                required
                value={addForm.redditUsername}
                onChange={(e) =>
                  setAddForm({ ...addForm, redditUsername: e.target.value })
                }
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-base text-foreground focus:border-accent"
              />
            </div>
            <div>
              <label
                htmlFor="add-combined-whatsapp"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                WhatsApp number
              </label>
              <input
                id="add-combined-whatsapp"
                type="tel"
                required
                value={addForm.whatsapp}
                onChange={(e) =>
                  setAddForm({ ...addForm, whatsapp: e.target.value })
                }
                placeholder="98765 43210"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-base text-foreground focus:border-accent"
              />
            </div>
            {addSource === "historical" ? (
              <div>
                <label
                  htmlFor="add-combined-messaged-at"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Exact date &amp; time they messaged
                </label>
                <input
                  id="add-combined-messaged-at"
                  type="datetime-local"
                  required
                  value={addForm.messagedAt}
                  onChange={(e) =>
                    setAddForm({ ...addForm, messagedAt: e.target.value })
                  }
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-base text-foreground focus:border-accent"
                />
              </div>
            ) : null}
            <div>
              <label
                htmlFor="add-combined-note"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Note <span className="text-muted-foreground">(optional)</span>
              </label>
              <textarea
                id="add-combined-note"
                rows={2}
                value={addForm.note}
                onChange={(e) =>
                  setAddForm({ ...addForm, note: e.target.value })
                }
                className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-base text-foreground focus:border-accent"
              />
            </div>

            {addError ? (
              <div
                role="alert"
                className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {addError}
              </div>
            ) : null}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={addBusy}
                className="flex-1 cursor-pointer rounded-xl bg-accent py-2.5 text-sm font-semibold text-accent-foreground transition hover:bg-blue-400 disabled:opacity-60"
              >
                {addBusy ? "Adding…" : "Add to queue"}
              </button>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="cursor-pointer rounded-xl border border-border px-4 py-2.5 text-sm text-muted-foreground transition hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      ) : null}

      {/* Queue list */}
      <section className="space-y-3">
        {loading ? (
          <p className="py-10 text-center font-mono text-sm uppercase tracking-[0.3em] text-muted-foreground">
            Loading…
          </p>
        ) : filteredEntries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-14 text-center">
            <p className="text-sm text-muted-foreground">
              {entries.length === 0
                ? "No one has joined the queue yet."
                : "No entries match this filter."}
            </p>
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const key = entryKey(entry);
            const editing = editingKey === key;
            return (
              <QueueCard
                key={key}
                entry={entry}
                busy={busyId === key}
                editing={editing}
                editForm={{
                  redditUsername: editForm.redditUsername,
                  whatsapp: editForm.whatsapp,
                  note: editForm.note,
                  messagedAt: editForm.messagedAt,
                }}
                editError={editError}
                onEditFormChange={(form) =>
                  setEditForm({
                    ...editForm,
                    redditUsername: form.redditUsername,
                    whatsapp: form.whatsapp,
                    note: form.note,
                    messagedAt: form.messagedAt ?? "",
                  })
                }
                onEditSubmit={handleEditSubmit}
                onCancelEdit={() => setEditingKey(null)}
                onStartEdit={() => startEdit(entry)}
                onStatusChange={(status) =>
                  updateEntry(entry.source, entry.id, { status })
                }
                onSkip={() =>
                  updateEntry(entry.source, entry.id, { status: "skipped" })
                }
                onRestore={() =>
                  updateEntry(entry.source, entry.id, { status: "waiting" })
                }
                onDelete={() => handleDelete(entry.source, entry.id)}
                timeLabel={entry.source === "historical" ? "Messaged" : "Joined"}
                timeValue={
                  entry.source === "historical"
                    ? entry.messagedAt ?? entry.createdAt
                    : entry.createdAt
                }
                showMessagedAt={entry.source === "historical"}
                messagedAtValue={editForm.messagedAt}
                onMessagedAtChange={(value) =>
                  setEditForm({ ...editForm, messagedAt: value })
                }
              />
            );
          })
        )}
      </section>
    </main>
  );
}
