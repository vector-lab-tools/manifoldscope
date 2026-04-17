"use client";

import { cn } from "@/lib/utils";

export type SubNavItem = {
  id: string;
  label: string;
  description?: string;
};

export function SubNav<T extends string>({
  items,
  active,
  onChange,
}: {
  items: readonly { id: T; label: string; description?: string }[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <nav className="flex flex-wrap gap-2 border-b border-parchment pb-3">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className={cn(
            "font-sans text-body-sm px-3 py-1.5 border rounded-sm transition-colors",
            active === item.id
              ? "bg-burgundy text-primary-foreground border-burgundy"
              : "bg-transparent text-slate border-parchment-dark hover:text-ink hover:bg-cream",
          )}
          title={item.description}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
