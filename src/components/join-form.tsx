"use client";

import { useRef, useState } from "react";
import DuplicateNotice from "@/components/duplicate-notice";
import Confetti, { centerOf } from "@/components/forms/confetti";
import FieldError from "@/components/forms/field-error";
import { redditUsernameError, whatsappError } from "@/components/forms/field-rules";
import SubmitButton from "@/components/forms/submit-button";
import type { DuplicateEntryMatch } from "@/lib/types";

interface JoinFormProps {
  queueName?: string;
  /** Lets the notice jump to the Check position tab with the number prefilled. */
  onCheckPosition?: (whatsapp: string) => void;
}

export default function JoinForm({
  queueName = "Amazfit Helios Strap",
  onCheckPosition,
}: JoinFormProps) {
  const [redditUsername, setRedditUsername] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateEntryMatch[] | null>(
    null,
  );
  // Inline errors show once a field is left, or for every field after a submit.
  const [touched, setTouched] = useState({ reddit: false, whatsapp: false });
  const [confettiOrigin, setConfettiOrigin] = useState<{ x: number; y: number } | null>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const redditRef = useRef<HTMLInputElement>(null);
  const whatsappRef = useRef<HTMLInputElement>(null);

  const redditError = touched.reddit ? redditUsernameError(redditUsername) : null;
  const phoneError = touched.whatsapp ? whatsappError(whatsapp) : null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setTouched({ reddit: true, whatsapp: true });
    if (redditUsernameError(redditUsername)) {
      redditRef.current?.focus();
      return;
    }
    if (whatsappError(whatsapp)) {
      whatsappRef.current?.focus();
      return;
    }

    setError(null);
    setDuplicates(null);
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

      setConfettiOrigin(centerOf(submitRef.current));
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (duplicates) {
    return (
      <DuplicateNotice
        matches={duplicates}
        whatsapp={whatsapp}
        onCheckPosition={onCheckPosition}
      />
    );
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
            See you at the next drop
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            We&apos;ll message you on WhatsApp in queue order when the {queueName}{" "}
            straps arrive. You can check your current position anytime using the
            Check position tab above.
          </p>
        </div>
      </>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[10px] border border-line bg-background p-5 sm:p-7"
      noValidate
    >
      <div className="space-y-5">
        <div>
          <label
            htmlFor="reddit-username"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Reddit username
          </label>
          <input
            ref={redditRef}
            id="reddit-username"
            name="redditUsername"
            type="text"
            autoComplete="nickname"
            required
            maxLength={50}
            value={redditUsername}
            onChange={(e) => setRedditUsername(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, reddit: true }))}
            aria-invalid={redditError ? true : undefined}
            aria-describedby={redditError ? "reddit-username-error" : "reddit-username-hint"}
            placeholder="u/yourname"
            className="field"
          />
          {redditError ? (
            <FieldError id="reddit-username-error" message={redditError} />
          ) : (
            <p id="reddit-username-hint" className="mt-1.5 text-xs text-muted-foreground">
              u/ is optional. Just your username is fine.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="whatsapp"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            WhatsApp number
          </label>
          <input
            ref={whatsappRef}
            id="whatsapp"
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
            aria-describedby={phoneError ? "whatsapp-error" : undefined}
            placeholder="98765 43210"
            className="field font-mono"
          />
          <FieldError id="whatsapp-error" message={phoneError} />
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
            placeholder="Something you may want us to know"
            className="field resize-none"
          />
        </div>

        {error ? (
          <div
            role="alert"
            className="rounded-[8px] border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-warn"
          >
            {error}
          </div>
        ) : null}

        <SubmitButton ref={submitRef} busy={submitting} busyLabel="Joining the queue">
          Join the queue
        </SubmitButton>

        <p className="text-center text-xs leading-5 text-muted-foreground">
          First come, first served. We reply in queue order when stock arrives.
        </p>
      </div>
    </form>
  );
}
