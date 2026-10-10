"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MAX_ADMIN_NOTES_LENGTH, type AdminNotes } from "@/lib/types";
import { SaveStatus, type LoadState, type SaveState } from "./save-status";

/** How long typing has to pause before the scratchpad saves itself. */
const AUTOSAVE_DELAY_MS = 800;
/** Only start nagging about length once the notes get genuinely close. */
const LENGTH_WARNING_AT = Math.floor(MAX_ADMIN_NOTES_LENGTH * 0.8);

/**
 * A single free-form scratchpad the admin keeps for themselves: stock counts,
 * prices, who to message next, reminders. It saves on its own, so there is no
 * save button to remember — the panel only reports what it is doing.
 */
export default function AdminNotesPanel({
  onUnauthorized,
}: {
  onUnauthorized: () => void;
}) {
  const [content, setContent] = useState("");
  const [savedContent, setSavedContent] = useState("");
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // Read through refs so the flush handlers stay stable and never close over
  // stale text when the tab is hidden or a save is retried.
  const latestRef = useRef({ content: "", savedContent: "", loadState: "loading" as LoadState });
  useEffect(() => {
    latestRef.current = { content, savedContent, loadState };
  }, [content, savedContent, loadState]);

  const onUnauthorizedRef = useRef(onUnauthorized);
  useEffect(() => {
    onUnauthorizedRef.current = onUnauthorized;
  }, [onUnauthorized]);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const cancelScheduled = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const persist = useCallback(
    async (next: string, keepalive = false) => {
      const requestId = ++requestIdRef.current;
      setSaveState("saving");
      setSaveError(null);
      try {
        const response = await fetch("/api/notes", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: next }),
          keepalive,
        });
        if (response.status === 401) {
          onUnauthorizedRef.current();
          return;
        }
        const data = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(data?.error || "Couldn't save your notes.");
        }
        // A newer save already started; let that one own the status line.
        if (requestId !== requestIdRef.current) return;
        const notes = data?.notes as AdminNotes | undefined;
        setSavedContent(notes?.content ?? next);
        setLastSavedAt(notes?.updatedAt ?? new Date().toISOString());
        setSaveState("saved");
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setSaveError(
          err instanceof Error ? err.message : "Couldn't save your notes.",
        );
        setSaveState("error");
      }
    },
    [],
  );

  /**
   * Fetches the scratchpad. Deliberately free of synchronous state writes so it
   * can be kicked off straight from an effect; the caller owns the "loading"
   * state because the initial render already starts in it.
   */
  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/notes");
      if (response.status === 401) {
        onUnauthorizedRef.current();
        return;
      }
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || "Couldn't load your notes.");
      }
      const notes = data?.notes as AdminNotes | undefined;
      const loaded = notes?.content ?? "";
      setContent(loaded);
      setSavedContent(loaded);
      setLastSavedAt(notes?.updatedAt ?? null);
      setSaveState("idle");
      setLoadState("ready");
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Couldn't load your notes.",
      );
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    // Started from an inner async function, so the first fetch is not a
    // synchronous state write in the effect body.
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

  /**
   * Grow the field to fit the notes rather than hiding them behind a scrollbar,
   * so a long thought is never cut off mid-line. Past the cap it scrolls.
   */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el || loadState !== "ready") return;
    const fit = () => {
      el.style.height = "auto";
      // Add the borders back: scrollHeight excludes them, and a 2px shortfall
      // leaves a phantom scrollbar.
      el.style.height = `${el.scrollHeight + el.offsetHeight - el.clientHeight}px`;
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [content, loadState]);

  function scheduleSave(next: string) {
    cancelScheduled();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      void persist(next);
    }, AUTOSAVE_DELAY_MS);
  }

  function handleChange(next: string) {
    setContent(next);
    if (loadState === "ready") scheduleSave(next);
  }

  /** Leaving the field is the strongest signal the thought is finished. */
  function handleBlur() {
    const { content: current, savedContent: saved, loadState: state } =
      latestRef.current;
    if (state !== "ready" || current === saved) return;
    cancelScheduled();
    void persist(current);
  }

  /** Closing the tab, switching apps, or locking the phone still saves. */
  useEffect(() => {
    function flush() {
      const { content: current, savedContent: saved, loadState: state } =
        latestRef.current;
      if (state !== "ready" || current === saved) return;
      cancelScheduled();
      void persist(current, true);
    }
    function handleVisibility() {
      if (document.visibilityState === "hidden") flush();
    }
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [cancelScheduled, persist]);

  useEffect(() => cancelScheduled, [cancelScheduled]);

  const dirty = content !== savedContent;
  const remaining = MAX_ADMIN_NOTES_LENGTH - content.length;
  const showCounter = content.length >= LENGTH_WARNING_AT;

  function handleClear() {
    if (!window.confirm("Clear your notes? This saves immediately and can't be undone.")) {
      return;
    }
    cancelScheduled();
    setContent("");
    void persist("");
  }

  return (
    <section
      aria-labelledby="admin-notes-heading"
      className="rounded-2xl border border-border bg-card p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <h2
          id="admin-notes-heading"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight"
        >
          <NoteIcon />
          Your notes
        </h2>
        <SaveStatus
          loadState={loadState}
          saveState={saveState}
          dirty={dirty}
          lastSavedAt={lastSavedAt}
        />
      </div>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        Just for you — stock, prices, who&rsquo;s next, reminders. Saves as you
        type.
      </p>

      {loadState === "loading" ? (
        <div className="mt-3 space-y-2" aria-hidden="true">
          <div className="h-3 w-4/5 animate-pulse rounded-full bg-muted" />
          <div className="h-3 w-3/5 animate-pulse rounded-full bg-muted" />
          <div className="h-32 animate-pulse rounded-xl bg-muted lg:h-52" />
        </div>
      ) : loadState === "error" ? (
        <div className="mt-3 rounded-xl border border-destructive/40 bg-destructive/10 px-3.5 py-3">
          <p role="alert" className="text-sm text-destructive">
            {loadError}
          </p>
          <button
            type="button"
            onClick={handleRetryLoad}
            className="mt-2.5 cursor-pointer rounded-lg border border-destructive/40 px-3 py-1.5 text-xs font-medium text-destructive transition hover:bg-destructive/10"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          <label htmlFor="admin-notes" className="sr-only">
            Your notes
          </label>
          <textarea
            id="admin-notes"
            ref={textareaRef}
            value={content}
            maxLength={MAX_ADMIN_NOTES_LENGTH}
            onChange={(event) => handleChange(event.target.value)}
            onBlur={handleBlur}
            placeholder={
              "e.g. 12 straps left · ₹12,600 each · message u/arjun next · 4 people waiting on COD"
            }
            className="panel-scroll mt-3 min-h-36 w-full max-h-[40vh] resize-none overscroll-contain rounded-xl border border-border bg-background px-3.5 py-3 text-base leading-6 text-foreground placeholder:text-muted-foreground/80 focus:border-accent lg:min-h-88 lg:max-h-104"
          />

          {saveState === "error" ? (
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-3.5 py-2.5">
              <p role="alert" className="text-xs text-destructive">
                {saveError} Your text is still here.
              </p>
              <button
                type="button"
                onClick={() => void persist(content)}
                className="cursor-pointer rounded-lg border border-destructive/40 px-3 py-1.5 text-xs font-medium text-destructive transition hover:bg-destructive/10"
              >
                Try again
              </button>
            </div>
          ) : null}

          <div className="mt-2 flex items-center justify-between gap-3">
            {showCounter ? (
              <p
                className={`text-xs ${
                  remaining <= 0 ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                {content.length.toLocaleString()} /{" "}
                {MAX_ADMIN_NOTES_LENGTH.toLocaleString()} characters
              </p>
            ) : (
              <span />
            )}
            {content.length > 0 ? (
              <button
                type="button"
                onClick={handleClear}
                className="cursor-pointer rounded-lg px-2 py-1 text-xs text-muted-foreground transition hover:text-destructive"
              >
                Clear notes
              </button>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}

function NoteIcon() {
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
      <path d="M15 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M15 3v5h5" />
      <path d="M8 13h8" />
      <path d="M8 17h5" />
    </svg>
  );
}
