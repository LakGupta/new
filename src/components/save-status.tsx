"use client";

/**
 * The save-state vocabulary shared by the admin's own panels (notes, stock).
 * Kept in one place so "Saved 19:42" means the same thing everywhere, rather
 * than each panel inventing its own wording and colours.
 */
export type LoadState = "loading" | "ready" | "error";
export type SaveState = "idle" | "saving" | "saved" | "error";

function formatClock(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatFull(value: string | null): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function SaveStatus({
  loadState,
  saveState,
  dirty,
  lastSavedAt,
}: {
  loadState: LoadState;
  saveState: SaveState;
  dirty: boolean;
  lastSavedAt: string | null;
}) {
  if (loadState === "loading") return null;

  let dot: string;
  let label: string;

  if (saveState === "error") {
    dot = "bg-rose-400";
    label = "Not saved";
  } else if (saveState === "saving") {
    dot = "animate-pulse bg-accent";
    label = "Saving…";
  } else if (dirty) {
    dot = "bg-amber-400";
    label = "Unsaved changes";
  } else if (lastSavedAt) {
    const clock = formatClock(lastSavedAt);
    dot = "bg-emerald-400";
    label = clock ? `Saved ${clock}` : "Saved";
  } else {
    dot = "bg-zinc-500";
    label = "Nothing saved yet";
  }

  return (
    <p
      role="status"
      aria-live="polite"
      title={formatFull(lastSavedAt)}
      className="flex items-center gap-1.5 text-xs text-muted-foreground"
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden="true" />
      {label}
    </p>
  );
}
