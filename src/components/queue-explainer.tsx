"use client";

import { useState } from "react";

export default function QueueExplainer() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-[10px] border border-line bg-background p-5 sm:p-6">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="queue-explainer"
        className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-2 text-left font-semibold text-foreground transition-colors duration-[120ms] hover:text-charge"
      >
        <span>
          <span className="label-mono block">Example</span>
          What does &ldquo;position&rdquo; mean?
        </span>
        <span
          className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] border border-line text-charge transition-transform duration-500 ${
            open ? "rotate-45" : ""
          }`}
        >
          <PlusIcon />
        </span>
      </button>

      <div
        id="queue-explainer"
        className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="pt-4 text-sm leading-6 text-muted-foreground">
            <p>
              Your queue position is based on{" "}
              <strong className="font-semibold text-foreground">
                when you showed interest
              </strong>
              , not when we reply.
            </p>

            <div className="mt-3 space-y-1.5 rounded-[8px] border border-line bg-surface p-3 font-mono text-xs">
              <p className="flex items-center justify-between gap-3">
                <span>Person A · showed interest on 20 Aug</span>
                <span className="font-bold text-charge">#1</span>
              </p>
              <p className="flex items-center justify-between gap-3">
                <span>Person B · showed interest on 22 Aug</span>
                <span className="font-bold text-charge">#2</span>
              </p>
            </div>

            <p className="mt-3">
              When stock arrives, Person A gets the first chance because they
              have been waiting longer. If they pass or don&apos;t reply, the
              offer moves to Person B.
            </p>

            <p className="mt-3 text-foreground/80">
              <strong className="font-semibold text-foreground">
                Joining earlier is the only way to move up.
              </strong>{" "}
              Your position locks in the moment you submit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}
