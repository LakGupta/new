"use client";

import { useState } from "react";

export default function HistoricalJoinForm() {
  const [redditUsername, setRedditUsername] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [messagedAt, setMessagedAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/historical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          redditUsername,
          whatsapp,
          messagedAt,
          note: "",
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
          Historical queue updated
        </p>
        <h2 className="mt-5 text-2xl font-semibold text-foreground">
          You&apos;re on the list
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
          We&apos;ll contact you in the order of your original message when stock
          arrives.
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
            htmlFor="historical-reddit"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Reddit username
          </label>
          <input
            id="historical-reddit"
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
            htmlFor="historical-whatsapp"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            WhatsApp number
          </label>
          <input
            id="historical-whatsapp"
            name="whatsapp"
            type="tel"
            autoComplete="tel"
            required
            inputMode="tel"
            maxLength={20}
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="98765 43210"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-accent"
          />
        </div>

        <div>
          <label
            htmlFor="historical-messaged-at"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Exact date &amp; time you messaged us
          </label>
          <input
            id="historical-messaged-at"
            name="messagedAt"
            type="datetime-local"
            required
            value={messagedAt}
            onChange={(e) => setMessagedAt(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground focus:border-accent"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Pick the date and time you originally messaged us. This decides your
            queue position.
          </p>
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
            aria-label="Submitting historical queue entry"
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
          {submitting ? "Submitting…" : "Submit my place"}
        </button>

        <p className="text-center text-xs leading-5 text-muted-foreground">
          This is only for people who messaged us before the waitlist webapp
          existed.
        </p>
      </div>
    </form>
  );
}
