"use client";

import { useState } from "react";

export default function QueueExplainer() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-5 border-t border-border pt-4">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="queue-explainer"
        className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm font-semibold text-accent shadow-[0_0_0_rgba(59,130,246,0)] transition-all duration-300 hover:border-accent/60 hover:bg-accent/20 hover:shadow-[0_0_24px_rgba(59,130,246,0.25)] active:scale-[0.98]"
      >
        <span className="transition-transform duration-300 group-hover:-translate-y-0.5">
          What queue?
        </span>
        <span
          className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent transition-transform duration-500 ${
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

            <div className="mt-3 space-y-1.5 rounded-xl border border-border bg-background p-3 font-mono text-xs">
              <p className="flex items-center justify-between gap-3">
                <span>Person A · showed interest on 20 Aug</span>
                <span className="font-bold text-accent">#1</span>
              </p>
              <p className="flex items-center justify-between gap-3">
                <span>Person B · showed interest on 22 Aug</span>
                <span className="font-bold text-accent">#2</span>
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
