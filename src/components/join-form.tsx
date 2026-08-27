"use client";

import { useState } from "react";

interface JoinFormProps {
  queueName?: string;
}

export default function JoinForm({ queueName = "Amazfit Helios Strap" }: JoinFormProps) {
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

        <p className="text-center text-xs leading-5 text-muted-foreground">
          First come, first served. We reply in queue order when stock arrives.
        </p>
      </div>
    </form>
  );
}
