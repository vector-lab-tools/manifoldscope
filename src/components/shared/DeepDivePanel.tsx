"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Deep Dive panel: collapsible container holding the detailed quantitative
 * data for any operation. Convention across the Vector Lab: every operation
 * has one, located at the bottom of its view.
 */
export function DeepDivePanel({
  title = "Deep Dive",
  defaultOpen = false,
  children,
}: {
  title?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="mt-6 border-t border-parchment-dark">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center justify-between py-3 font-sans text-caption uppercase tracking-widest text-slate",
          "transition-colors hover:text-ink",
        )}
      >
        <span>{title}</span>
        <span className="font-body text-body-sm">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="animate-fade-in pb-6 font-sans text-body-sm text-charcoal">
          {children}
        </div>
      )}
    </section>
  );
}
