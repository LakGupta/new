"use client";

import { useMemo, useState } from "react";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export default function HistoricalJoinForm() {
  const [redditUsername, setRedditUsername] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [dateValue, setDateValue] = useState("");
  const [timeValue, setTimeValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const dateOptions = useMemo(() => {
    const options: string[] = [];
    const start = new Date("2026-01-01T00:00:00");
    const end = new Date();
    end.setHours(0, 0, 0, 0);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      options.push(
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      );
    }
    return options.reverse();
  }, []);

  const timeOptions = useMemo(() => {
    const options: string[] = [];
    for (let hour = 0; hour < 24; hour += 1) {
      for (let minute = 0; minute < 60; minute += 15) {
        options.push(`${pad(hour)}:${pad(minute)}`);
      }
    }
    return options;
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!dateValue || !timeValue) {
      setError("Select the exact date and time you messaged us.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/historical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          redditUsername,
          whatsapp,
          messagedAt: `${dateValue}T${timeValue}`,
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
          We&apos;ll verify the date &amp; time you gave us, then contact you in
          the order of your original message when stock arrives.
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
          <span className="mb-1.5 block text-sm font-medium text-foreground">
            Exact date &amp; time you messaged us
          </span>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="historical-date"
                className="mb-1 block text-xs font-medium text-muted-foreground"
              >
                Date
              </label>
              <select
                id="historical-date"
                name="date"
                required
                value={dateValue}
                onChange={(e) => setDateValue(e.target.value)}
                className="w-full cursor-pointer rounded-xl border border-border bg-background px-3 py-3 text-base text-foreground focus:border-accent"
              >
                <option value="">Select date</option>
                {dateOptions.map((date) => (
                  <option key={date} value={date}>
                    {date}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="historical-time"
                className="mb-1 block text-xs font-medium text-muted-foreground"
              >
                Time
              </label>
              <select
                id="historical-time"
                name="time"
                required
                value={timeValue}
                onChange={(e) => setTimeValue(e.target.value)}
                className="w-full cursor-pointer rounded-xl border border-border bg-background px-3 py-3 text-base text-foreground focus:border-accent"
              >
                <option value="">Select time</option>
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="mt-2 rounded-lg border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-xs leading-5 text-amber-200/80">
            The exact date &amp; time you provide will be verified before your
            queue position is confirmed.
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
