"use client";

import { useMemo, useRef, useState } from "react";
import SubmitButton from "@/components/forms/submit-button";
import DuplicateNotice from "@/components/duplicate-notice";
import Confetti, { centerOf } from "@/components/forms/confetti";
import FieldError from "@/components/forms/field-error";
import { redditUsernameError, whatsappError } from "@/components/forms/field-rules";
import type { DuplicateEntryMatch } from "@/lib/types";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export default function HistoricalJoinForm() {
  const [redditUsername, setRedditUsername] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [monthValue, setMonthValue] = useState("");
  const [dayValue, setDayValue] = useState("");
  const [timeValue, setTimeValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateEntryMatch[] | null>(
    null,
  );
  // Inline errors show once a field is left, or for every field after a submit.
  const [touched, setTouched] = useState({ reddit: false, whatsapp: false, when: false });
  const [confettiOrigin, setConfettiOrigin] = useState<{ x: number; y: number } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const redditError = touched.reddit ? redditUsernameError(redditUsername) : null;
  const phoneError = touched.whatsapp ? whatsappError(whatsapp) : null;
  const whenError =
    touched.when && (!monthValue || !dayValue || !timeValue)
      ? "Select the exact date and time you messaged us."
      : null;

  const monthOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;

    for (let month = 1; month <= 12; month += 1) {
      const value = `2026-${pad(month)}`;
      if (value > currentMonth) break;
      const label = new Date(2026, month - 1, 1).toLocaleString(undefined, {
        month: "long",
        year: "numeric",
      });
      options.push({ value, label });
    }
    return options;
  }, []);

  const dayOptions = useMemo(() => {
    if (!monthValue) return [];
    const [year, month] = monthValue.split("-").map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const now = new Date();
    const isCurrentMonth =
      now.getFullYear() === year && now.getMonth() + 1 === month;
    const maxDay = isCurrentMonth ? now.getDate() : daysInMonth;

    const days: string[] = [];
    for (let day = 1; day <= maxDay; day += 1) {
      days.push(pad(day));
    }
    return days;
  }, [monthValue]);

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
    setDuplicates(null);

    setTouched({ reddit: true, whatsapp: true, when: true });
    if (redditUsernameError(redditUsername)) {
      document.getElementById("historical-reddit")?.focus();
      return;
    }
    if (whatsappError(whatsapp)) {
      document.getElementById("historical-whatsapp")?.focus();
      return;
    }
    if (!monthValue || !dayValue || !timeValue) {
      document.getElementById("historical-month")?.focus();
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
          messagedAt: `${monthValue}-${dayValue}T${timeValue}`,
          note: "",
        }),
      });

      const data = await response.json();

      // Already on the list: show where they stand instead of adding them again.
      if (
        response.status === 409 &&
        Array.isArray(data.duplicates) &&
        data.duplicates.length > 0
      ) {
        setDuplicates(data.duplicates as DuplicateEntryMatch[]);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setConfettiOrigin(
        centerOf(formRef.current?.querySelector<HTMLElement>('button[type="submit"]') ?? null),
      );
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (duplicates) {
    return <DuplicateNotice matches={duplicates} whatsapp={whatsapp} />;
  }

  if (submitted) {
    // Confetti sits outside the pop-in: a transformed parent would offset its
    // fixed positioning.
    return (
      <>
        <Confetti origin={confettiOrigin} />
        <div className="animate-pop-in rounded-[10px] border border-charge/50 bg-background p-8 text-center">
          <p className="label-mono text-charge">You&apos;re in</p>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-[-0.03em] text-foreground">
            You&apos;re on the list
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            We&apos;ll verify the date &amp; time you gave us, then contact you in
            the order of your original message when stock arrives.
          </p>
        </div>
      </>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="rounded-[10px] border border-line bg-background p-5 sm:p-7"
      noValidate
    >
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
            onBlur={() => setTouched((t) => ({ ...t, reddit: true }))}
            aria-invalid={redditError ? true : undefined}
            aria-describedby={redditError ? "historical-reddit-error" : "historical-reddit-hint"}
            placeholder="u/yourname"
            className="field"
          />
          {redditError ? (
            <FieldError id="historical-reddit-error" message={redditError} />
          ) : (
            <p id="historical-reddit-hint" className="mt-1.5 text-xs text-muted-foreground">
              u/ is optional. Just your username is fine.
            </p>
          )}
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
            onBlur={() => setTouched((t) => ({ ...t, whatsapp: true }))}
            aria-invalid={phoneError ? true : undefined}
            aria-describedby={phoneError ? "historical-whatsapp-error" : undefined}
            placeholder="98765 43210"
            className="field font-mono"
          />
          <FieldError id="historical-whatsapp-error" message={phoneError} />
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-foreground">
            Exact date &amp; time you messaged us
          </span>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div>
              <label
                htmlFor="historical-month"
                className="mb-1 block text-xs font-medium text-muted-foreground"
              >
                Month
              </label>
              <select
                id="historical-month"
                name="month"
                required
                value={monthValue}
                onChange={(e) => {
                  setMonthValue(e.target.value);
                  setDayValue("");
                }}
                className="field cursor-pointer px-3"
              >
                <option value="">Select month</option>
                {monthOptions.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="historical-day"
                className="mb-1 block text-xs font-medium text-muted-foreground"
              >
                Date
              </label>
              <select
                id="historical-day"
                name="day"
                required
                value={dayValue}
                onChange={(e) => setDayValue(e.target.value)}
                disabled={!monthValue}
                className="field cursor-pointer px-3 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select day</option>
                {dayOptions.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2 sm:col-span-1">
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
                className="field cursor-pointer px-3"
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
          <FieldError id="historical-when-error" message={whenError} />
          <p className="mt-2 rounded-[6px] border border-line bg-surface px-3 py-2 text-xs leading-5 text-muted-foreground">
            The exact date &amp; time you provide will be verified before your
            queue position is confirmed.
          </p>
        </div>

        {error ? (
          <div
            role="alert"
            className="rounded-[8px] border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-warn"
          >
            {error}
          </div>
        ) : null}

        <SubmitButton busy={submitting} busyLabel="Submitting historical queue entry">
          Submit my place
        </SubmitButton>

        <p className="text-center text-xs leading-5 text-muted-foreground">
          This is only for people who messaged us before the waitlist webapp
          existed.
        </p>
      </div>
    </form>
  );
}
