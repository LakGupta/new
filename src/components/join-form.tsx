"use client";

import { useState } from "react";

interface JoinFormProps {
  queueName?: string;
  whatsappGroupUrl?: string;
}

export default function JoinForm({
  queueName = "Amazfit Helios Strap",
  whatsappGroupUrl,
}: JoinFormProps) {
  const [redditUsername, setRedditUsername] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          redditUsername,
          whatsapp,
          note,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="animate-pop-in rounded-2xl border border-border bg-card p-8 text-center shadow-[0_0_60px_rgba(59,130,246,0.10)]">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
          You&apos;re in the queue
        </p>
        <h2 className="mt-5 text-2xl font-semibold text-foreground">
          See you at the next drop
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
          We&apos;ll message you on WhatsApp in queue order when the {queueName}{" "}
          straps arrive.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-card p-5 shadow-[0_0_60px_rgba(59,130,246,0.08)] sm:p-7"
      noValidate
    >
      <div className="mb-6 h-1 w-14 rounded-full bg-accent" />

      <div className="space-y-5">
        <div>
          <label
            htmlFor="reddit-username"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Reddit username
          </label>
          <input
            id="reddit-username"
            name="redditUsername"
            type="text"
            autoComplete="nickname"
            required
            maxLength={50}
            value={redditUsername}
            onChange={(e) => setRedditUsername(e.target.value)}
            placeholder="u/yourname"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-accent"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            u/ is optional. Just your username is fine.
          </p>
        </div>

        <div>
          <label
            htmlFor="whatsapp"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            WhatsApp number
          </label>
          <input
            id="whatsapp"
            name="whatsapp"
            type="tel"
            autoComplete="tel"
            required
            inputMode="tel"
            maxLength={20}
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-accent"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Include your country code so we can message you.
          </p>
        </div>

        <div>
          <label
            htmlFor="note"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Note <span className="text-muted-foreground">(optional)</span>
          </label>
          <textarea
            id="note"
            name="note"
            rows={3}
            maxLength={500}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Colour preference, size, anything you want us to know."
            className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-accent"
          />
        </div>

        {error ? (
          <div
            role="alert"
            className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </div>
        ) : null}

        {submitting ? (
          <div
            role="progressbar"
            aria-label="Joining the queue"
            aria-valuetext="Processing"
            className="h-1.5 w-full overflow-hidden rounded-full bg-accent/20"
          >
            <div className="loading-bar-indeterminate h-full w-1/3 rounded-full bg-accent" />
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full cursor-pointer rounded-xl bg-accent py-3.5 text-base font-semibold text-accent-foreground transition hover:bg-blue-400 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Joining queue…" : "Join the queue"}
        </button>

        {whatsappGroupUrl ? (
          <a
            href={whatsappGroupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-base font-semibold text-emerald-300 transition hover:bg-emerald-500/20 active:scale-[0.99]"
          >
            <WhatsAppIcon />
            Join WhatsApp group
          </a>
        ) : null}

        <p className="text-center text-xs leading-5 text-muted-foreground">
          First come, first served. We reply in queue order when stock arrives.
        </p>
      </div>
    </form>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.23 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.17.24-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29Z" />
    </svg>
  );
}
