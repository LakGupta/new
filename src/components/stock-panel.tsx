"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MAX_STOCK_QUANTITY, type StockLevel } from "@/lib/types";
import { SaveStatus, type LoadState, type SaveState } from "./save-status";

/** Pause after the last keystroke or step before saving. */
const AUTOSAVE_DELAY_MS = 700;

function clamp(value: number): number {
  return Math.min(Math.max(value, 0), MAX_STOCK_QUANTITY);
}

/**
 * Straps left to sell, counted by hand.
 *
 * Deliberately not derived from the queue: marking someone sold must not move
 * this number on its own, because stock and queue statuses disagree all the
 * time (a strap can be sold off-Reddit, returned, or damaged). The panel says
 * so, rather than letting the admin assume it tracks sales.
 */
export default function StockPanel({
  onUnauthorized,
}: {
  onUnauthorized: () => void;
}) {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const onUnauthorizedRef = useRef(onUnauthorized);
  useEffect(() => {
    onUnauthorizedRef.current = onUnauthorized;
  }, [onUnauthorized]);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const cancelScheduled = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /**
   * Free of synchronous state writes so it can be started straight from an
   * effect; the caller owns the "loading" state.
   */
  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/stock");
      if (response.status === 401) {
        onUnauthorizedRef.current();
        return;
      }
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || "Couldn't load the stock count.");
      }
      const stock = data?.stock as StockLevel | undefined;
      const value = stock?.remaining ?? null;
      setRemaining(value);
      setDraft(value === null ? "" : String(value));
      setLastSavedAt(stock?.updatedAt ?? null);
      setSaveState("idle");
      setLoadState("ready");
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Couldn't load the stock count.",
      );
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    async function start() {
      await load();
    }
    void start();
  }, [load]);

  function handleRetryLoad() {
    setLoadError(null);
    setLoadState("loading");
    void load();
  }

  const persist = useCallback(async (next: number | null) => {
    const requestId = ++requestIdRef.current;
    setSaveState("saving");
    setSaveError(null);
    try {
      const response = await fetch("/api/stock", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remaining: next }),
      });
      if (response.status === 401) {
        onUnauthorizedRef.current();
        return;
      }
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || "Couldn't save the stock count.");
      }
      // A newer save already started; let that one own the status line.
      if (requestId !== requestIdRef.current) return;
      const stock = data?.stock as StockLevel | undefined;
      setRemaining(stock?.remaining ?? null);
      setLastSavedAt(stock?.updatedAt ?? new Date().toISOString());
      setSaveState("saved");
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setSaveError(
        err instanceof Error ? err.message : "Couldn't save the stock count.",
      );
      setSaveState("error");
    }
  }, []);

  function scheduleSave(next: number | null) {
    cancelScheduled();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      void persist(next);
    }, AUTOSAVE_DELAY_MS);
  }

  const parsed = draft === "" ? null : Number(draft);
  const dirty = parsed !== remaining;

  /** Digits only: the field is a count, and the steppers already do the maths. */
  function handleChange(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, String(MAX_STOCK_QUANTITY).length);
    const next = digits === "" ? null : clamp(Number(digits));
    setDraft(next === null ? "" : String(next));
    if (loadState === "ready") scheduleSave(next);
  }

  function step(by: 1 | -1) {
    if (loadState !== "ready") return;
    const base = parsed ?? 0;
    const next = clamp(base + by);
    if (next === parsed) return;
    setDraft(String(next));
    cancelScheduled();
    void persist(next);
  }

  function handleBlur() {
    if (loadState !== "ready" || !dirty) return;
    cancelScheduled();
    void persist(parsed);
  }

  useEffect(() => cancelScheduled, [cancelScheduled]);

  const unset = draft === "" && remaining === null;

  return (
    <section
      aria-labelledby="stock-panel-heading"
      className="rounded-[10px] border border-border bg-card p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <h2
          id="stock-panel-heading"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight"
        >
          <BoxIcon />
          Amazfit stock
        </h2>
        <SaveStatus
          loadState={loadState}
          saveState={saveState}
          dirty={dirty}
          lastSavedAt={lastSavedAt}
        />
      </div>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        Counted by hand — marking someone sold won&rsquo;t change it.
      </p>

      {loadState === "loading" ? (
        <div className="mt-3 space-y-2" aria-hidden="true">
          <div className="mx-auto h-10 w-28 animate-pulse rounded-[6px] bg-muted" />
          <div className="mx-auto h-3 w-32 animate-pulse rounded-full bg-muted" />
        </div>
      ) : loadState === "error" ? (
        <div className="mt-3 rounded-[8px] border border-destructive/40 bg-destructive/10 px-3.5 py-3">
          <p role="alert" className="text-sm text-destructive">
            {loadError}
          </p>
          <button
            type="button"
            onClick={handleRetryLoad}
            className="mt-2.5 cursor-pointer rounded-[6px] border border-destructive/40 px-3 py-1.5 text-xs font-medium text-destructive transition hover:bg-destructive/10"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="mt-3 flex items-center justify-center gap-2">
            <StepButton
              label="One less"
              onClick={() => step(-1)}
              disabled={parsed === null || parsed <= 0}
            >
              <MinusIcon />
            </StepButton>

            <label htmlFor="stock-remaining" className="sr-only">
              Straps left
            </label>
            <input
              id="stock-remaining"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={draft}
              onChange={(event) => handleChange(event.target.value)}
              onBlur={handleBlur}
              onFocus={(event) => event.target.select()}
              placeholder="—"
              className="w-24 rounded-[8px] border border-border bg-background py-2 text-center font-mono text-3xl font-bold tabular-nums text-foreground placeholder:text-muted-foreground/70 focus:border-signal"
            />

            <StepButton
              label="One more"
              onClick={() => step(1)}
              disabled={parsed !== null && parsed >= MAX_STOCK_QUANTITY}
            >
              <PlusIcon />
            </StepButton>
          </div>

          <p className="mt-2 text-center text-xs text-muted-foreground">
            {unset ? "Nothing counted yet" : "straps left to sell"}
          </p>

          {saveState === "error" ? (
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-[8px] border border-destructive/40 bg-destructive/10 px-3.5 py-2.5">
              <p role="alert" className="text-xs text-destructive">
                {saveError}
              </p>
              <button
                type="button"
                onClick={() => void persist(parsed)}
                className="cursor-pointer rounded-[6px] border border-destructive/40 px-3 py-1.5 text-xs font-medium text-destructive transition hover:bg-destructive/10"
              >
                Try again
              </button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}

function StepButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[8px] border border-border bg-background text-muted-foreground transition hover:border-accent/50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-muted-foreground"
    >
      {children}
    </button>
  );
}

function MinusIcon() {
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
      <path d="M5 12h14" />
    </svg>
  );
}

function PlusIcon() {
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
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-accent"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m21 8-9-5-9 5 9 5 9-5Z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </svg>
  );
}
