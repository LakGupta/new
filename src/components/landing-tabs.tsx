"use client";

import { useState } from "react";
import JoinForm from "@/components/join-form";
import PositionLookup from "@/components/position-lookup";

type TabId = "join" | "position";

const TABS: {
  id: TabId;
  label: string;
  caption: string;
}[] = [
  {
    id: "join",
    label: "Join queue",
    caption: "New here? Get in line for the next drop.",
  },
  {
    id: "position",
    label: "Check position",
    caption: "Enter your WhatsApp number to see where you stand.",
  },
];

export default function LandingTabs({
  defaultTab = "join",
  queueName = "Amazfit Helio Strap",
}: {
  defaultTab?: TabId;
  queueName?: string;
}) {
  const [activeTab, setActiveTab] = useState<TabId>(defaultTab);
  const active = TABS.find((tab) => tab.id === activeTab) ?? TABS[0];

  return (
    <div>
      {/* Tab bar */}
      <div
        role="tablist"
        aria-label="Queue options"
        className="mb-5 grid gap-2 sm:grid-cols-2"
      >
        {TABS.map((tab) => {
          const selected = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              id={`waitlist-tab-${tab.id}`}
              role="tab"
              aria-selected={selected}
              aria-controls={`waitlist-panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer rounded-xl border px-4 py-3 text-left transition ${
                selected
                  ? "border-accent/60 bg-accent/15 text-accent shadow-[0_0_24px_rgba(59,130,246,0.15)]"
                  : "border-border bg-card text-muted-foreground hover:border-accent/40 hover:text-foreground"
              }`}
            >
              <span className="block font-mono text-[10px] uppercase tracking-[0.25em] opacity-70">
                0{TABS.findIndex((item) => item.id === tab.id) + 1}
              </span>
              <span className="mt-1 block text-sm font-semibold">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mb-4 px-1 text-center text-xs leading-5 text-muted-foreground sm:text-sm">
        {active.caption}
      </p>

      <div
        key={activeTab}
        className="animate-fade-in"
        role="tabpanel"
        id={`waitlist-panel-${activeTab}`}
        aria-labelledby={`waitlist-tab-${activeTab}`}
      >
        {activeTab === "join" ? <JoinForm queueName={queueName} /> : null}
        {activeTab === "position" ? (
          <PositionLookup queueName={queueName} />
        ) : null}
      </div>
    </div>
  );
}
