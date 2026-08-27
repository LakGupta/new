"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ACTIVE_STATUSES,
  STATUSES,
  STATUS_COLORS,
  STATUS_LABELS,
  type EntryStatus,
  type EntryWithPositions,
} from "@/lib/types";
import { whatsAppLink } from "@/lib/validation";

type AuthState = "checking" | "logged-out" | "logged-in";
type Filter = EntryStatus | "all";

const EMPTY_FORM = { redditUsername: "", whatsapp: "", note: "" };

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}

function StatusPill({ status }: { status: EntryStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${STATUS_COLORS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export default function AdminApp() {
  const [authState, setAuthState] = useState<AuthState>("checking");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  const [entries, setEntries] = useState<EntryWithPositions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [addError, setAddError] = useState<string | null>(null);
  const [addBusy, setAddBusy] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editError, setEditError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/entries");
      if (response.status === 401) {
        setAuthState("logged-out");
        return;
      }
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load the queue.");
      }
      setEntries(data.entries as EntryWithPositions[]);
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
      const response = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
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
    id: number,
    patch: Record<string, unknown>,
    nextEditingId: number | null = null,
  ) {
    setBusyId(id);
    setError(null);
    try {
      const response = await fetch(`/api/entries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update entry.");
      }
      if (nextEditingId !== null) {
        setEditingId(nextEditingId);
      }
      await loadEntries();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update entry.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this person from the queue?")) return;
    setBusyId(id);
    setError(null);
    try {
      const response = await fetch(`/api/entries/${id}`, { method: "DELETE" });
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

  function startEdit(entry: EntryWithPositions) {
    setEditingId(entry.id);
    setEditError(null);
    setEditForm({
      redditUsername: entry.redditUsername,
      whatsapp: entry.whatsapp,
      note: entry.note ?? "",
    });
  }

  async function handleEditSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (editingId === null) return;
    setEditError(null);
    setBusyId(editingId);
    try {
      const response = await fetch(`/api/entries/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save changes.");
      }
      setEditingId(null);
      await loadEntries();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to save changes.");
    } finally {
      setBusyId(null);
    }
  }

  const filteredEntries = useMemo(() => {
    const query = search.trim().toLowerCase();
    return entries.filter((entry) => {
      if (filter !== "all" && entry.status !== filter) return false;
      if (!query) return true;
      return (
        entry.redditUsername.toLowerCase().includes(query) ||
        entry.whatsapp.includes(query) ||
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
              Enter the admin password to manage the waitlist.
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <label
              htmlFor="admin-password"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Password
            </label>
            <input
              id="admin-password"
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
            {entries.length} total · {stats.active} active
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
          <div className="space-y-4">
            <div>
              <label
                htmlFor="add-reddit"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Reddit username
              </label>
              <input
                id="add-reddit"
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
                htmlFor="add-whatsapp"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                WhatsApp number
              </label>
              <input
                id="add-whatsapp"
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
            <div>
              <label
                htmlFor="add-note"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Note <span className="text-muted-foreground">(optional)</span>
              </label>
              <textarea
                id="add-note"
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
          filteredEntries.map((entry) => (
            <QueueCard
              key={entry.id}
              entry={entry}
              busy={busyId === entry.id}
              editing={editingId === entry.id}
              editForm={editForm}
              editError={editError}
              onEditFormChange={setEditForm}
              onEditSubmit={handleEditSubmit}
              onCancelEdit={() => setEditingId(null)}
              onStartEdit={() => startEdit(entry)}
              onStatusChange={(status) => updateEntry(entry.id, { status })}
              onSkip={() => updateEntry(entry.id, { status: "skipped" })}
              onRestore={() => updateEntry(entry.id, { status: "waiting" })}
              onDelete={() => handleDelete(entry.id)}
            />
          ))
        )}
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        highlight
          ? "border-accent/40 bg-accent/10"
          : "border-border bg-card"
      }`}
    >
      <p className="font-mono text-2xl font-bold">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function QueueCard({
  entry,
  busy,
  editing,
  editForm,
  editError,
  onEditFormChange,
  onEditSubmit,
  onCancelEdit,
  onStartEdit,
  onStatusChange,
  onSkip,
  onRestore,
  onDelete,
}: {
  entry: EntryWithPositions;
  busy: boolean;
  editing: boolean;
  editForm: typeof EMPTY_FORM;
  editError: string | null;
  onEditFormChange: (form: typeof EMPTY_FORM) => void;
  onEditSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancelEdit: () => void;
  onStartEdit: () => void;
  onStatusChange: (status: EntryStatus) => void;
  onSkip: () => void;
  onRestore: () => void;
  onDelete: () => void;
}) {
  const isActive = ACTIVE_STATUSES.includes(entry.status);
  const waLink = whatsAppLink(
    entry.whatsapp,
    `Hi u/${entry.redditUsername}, your Amazfit Helios strap is ready!`,
  );

  return (
    <article
      className={`rounded-2xl border bg-card p-4 ${
        isActive ? "border-border" : "border-border/60 opacity-80"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border ${
            isActive
              ? "border-accent/50 bg-accent/15 text-accent"
              : "border-border bg-muted text-muted-foreground"
          }`}
        >
          <span className="font-mono text-lg font-bold leading-none">
            {entry.activePosition ?? entry.position}
          </span>
          <span className="mt-0.5 text-[9px] uppercase tracking-wider opacity-80">
            {isActive ? "active" : "orig"}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-semibold">u/{entry.redditUsername}</h3>
            <StatusPill status={entry.status} />
          </div>
          <p className="mt-0.5 font-mono text-sm text-muted-foreground">
            +{entry.whatsapp}
          </p>
          {entry.note ? (
            <p className="mt-1 text-sm leading-5 text-foreground/80">
              {entry.note}
            </p>
          ) : null}
          <p className="mt-1 text-xs text-muted-foreground/80">
            Joined {formatDate(entry.createdAt)}
            {entry.activePosition !== entry.position ? (
              <span className="ml-2">· original #{entry.position}</span>
            ) : null}
          </p>
        </div>
      </div>

      {editing ? (
        <form onSubmit={onEditSubmit} className="mt-4 space-y-3 border-t border-border pt-4">
          <div>
            <label
              htmlFor={`edit-reddit-${entry.id}`}
              className="mb-1 block text-xs font-medium text-muted-foreground"
            >
              Reddit username
            </label>
            <input
              id={`edit-reddit-${entry.id}`}
              type="text"
              required
              value={editForm.redditUsername}
              onChange={(e) =>
                onEditFormChange({ ...editForm, redditUsername: e.target.value })
              }
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-base text-foreground focus:border-accent"
            />
          </div>
          <div>
            <label
              htmlFor={`edit-whatsapp-${entry.id}`}
              className="mb-1 block text-xs font-medium text-muted-foreground"
            >
              WhatsApp number
            </label>
            <input
              id={`edit-whatsapp-${entry.id}`}
              type="tel"
              required
              value={editForm.whatsapp}
              onChange={(e) =>
                onEditFormChange({ ...editForm, whatsapp: e.target.value })
              }
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-base text-foreground focus:border-accent"
            />
          </div>
          <div>
            <label
              htmlFor={`edit-note-${entry.id}`}
              className="mb-1 block text-xs font-medium text-muted-foreground"
            >
              Note
            </label>
            <textarea
              id={`edit-note-${entry.id}`}
              rows={2}
              value={editForm.note}
              onChange={(e) =>
                onEditFormChange({ ...editForm, note: e.target.value })
              }
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-base text-foreground focus:border-accent"
            />
          </div>

          {editError ? (
            <div
              role="alert"
              className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {editError}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={busy}
              className="cursor-pointer rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:bg-blue-400 disabled:opacity-60"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              className="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-2 text-sm font-medium text-emerald-300 ring-1 ring-emerald-400/30 transition hover:bg-emerald-500/25"
          >
            <MessageIcon />
            WhatsApp
          </a>

          <label className="sr-only" htmlFor={`status-${entry.id}`}>
            Change status
          </label>
          <select
            id={`status-${entry.id}`}
            value={entry.status}
            onChange={(e) => onStatusChange(e.target.value as EntryStatus)}
            disabled={busy}
            className="cursor-pointer rounded-lg border border-border bg-background px-2.5 py-2 text-sm text-foreground focus:border-accent disabled:opacity-60"
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>

          {isActive ? (
            <button
              onClick={onSkip}
              disabled={busy}
              className="cursor-pointer rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition hover:border-amber-400/40 hover:text-amber-300 disabled:opacity-60"
            >
              Skip
            </button>
          ) : (
            <button
              onClick={onRestore}
              disabled={busy}
              className="cursor-pointer rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground disabled:opacity-60"
            >
              Restore
            </button>
          )}

          <button
            onClick={onStartEdit}
            disabled={busy}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground disabled:opacity-60"
          >
            <EditIcon />
            Edit
          </button>

          <button
            onClick={onDelete}
            disabled={busy}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition hover:border-destructive/40 hover:text-destructive disabled:opacity-60"
          >
            <TrashIcon />
            Delete
          </button>
        </div>
      )}
    </article>
  );
}

function MessageIcon() {
  return (
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
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}
