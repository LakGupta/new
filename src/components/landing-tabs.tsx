"use client";

import { useEffect, useState } from "react";
import JoinForm from "@/components/join-form";
import PositionLookup from "@/components/position-lookup";
import { SHOW_POSITION_EVENT } from "@/components/landing/events";

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
  // Seeded when a duplicate notice sends someone to the position lookup.
  const [lookupSeed, setLookupSeed] = useState("");
  const active = TABS.find((tab) => tab.id === activeTab) ?? TABS[0];

  // "Check my position" CTAs elsewhere on the page open the lookup tab.
  useEffect(() => {
    const showPosition = () => setActiveTab("position");
    window.addEventListener(SHOW_POSITION_EVENT, showPosition);
    return () => window.removeEventListener(SHOW_POSITION_EVENT, showPosition);
  }, []);

  return (
    <div>
      {/* Tab bar: a two-way segmented control */}
      <div
        role="tablist"
        aria-label="Queue options"
        className="mb-4 grid grid-cols-2 gap-1 rounded-[10px] border border-line bg-background p-1"
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
              className={`min-h-11 cursor-pointer rounded-[7px] px-3 text-sm font-semibold transition-colors duration-[120ms] ${
                selected
                  ? "bg-charge text-background"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <p className="mb-4 px-1 text-sm leading-6 text-muted-foreground">
        {active.caption}
      </p>

      <div
        key={activeTab}
        className="animate-fade-in"
        role="tabpanel"
        id={`waitlist-panel-${activeTab}`}
        aria-labelledby={`waitlist-tab-${activeTab}`}
      >
        {activeTab === "join" ? (
          <JoinForm
            queueName={queueName}
            onCheckPosition={(whatsapp) => {
              setLookupSeed(whatsapp);
              setActiveTab("position");
            }}
          />
        ) : null}
        {activeTab === "position" ? (
          <PositionLookup
            key={lookupSeed}
            queueName={queueName}
            initialWhatsapp={lookupSeed}
          />
        ) : null}
      </div>
    </div>
  );
}
