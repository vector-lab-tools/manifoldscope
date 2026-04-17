"use client";

import { cn } from "@/lib/utils";
import type { TabGroup } from "@/types/manifold";

type Tab = { id: TabGroup; label: string; description: string };

const TABS: Tab[] = [
  {
    id: "measure",
    label: "Measure",
    description: "Intrinsic geometry, descriptive, geometric in output.",
  },
  {
    id: "critique",
    label: "Critique",
    description:
      "Ideological investigation, interpretive, backed by geometric evidence.",
  },
  {
    id: "atlas",
    label: "Atlas",
    description: "Curated pre-run analyses on named samples.",
  },
];

export function TabNav({
  active,
  onChange,
}: {
  active: TabGroup;
  onChange: (tab: TabGroup) => void;
}) {
  return (
    <nav className="border-b border-parchment bg-cream">
      <div className="mx-auto flex max-w-6xl gap-1 px-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "group relative px-4 py-3 font-sans text-body-sm font-medium transition-colors",
              active === tab.id
                ? "text-burgundy"
                : "text-slate hover:text-ink",
            )}
            title={tab.description}
          >
            {tab.label}
            <span
              className={cn(
                "absolute bottom-[-1px] left-0 right-0 h-[2px] bg-burgundy transition-opacity",
                active === tab.id ? "opacity-100" : "opacity-0",
              )}
            />
          </button>
        ))}
      </div>
    </nav>
  );
}
