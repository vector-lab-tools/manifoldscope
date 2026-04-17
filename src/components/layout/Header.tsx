"use client";

import { VERSION } from "@/lib/version";
import { useManifold } from "@/context/ManifoldContext";

export function Header() {
  const { backendReachable, backendStatus } = useManifold();

  return (
    <header className="border-b border-parchment bg-ivory">
      <div className="mx-auto flex max-w-6xl items-baseline justify-between px-6 py-5">
        <div>
          <h1 className="font-display text-display-lg text-ink">
            Manifoldscope
          </h1>
          <p className="font-body text-body-sm italic text-slate">
            Intensive reading of a single manifold, in two registers.
          </p>
        </div>
        <div className="flex items-baseline gap-4 font-sans text-caption uppercase tracking-wide text-slate">
          <span>v{VERSION}</span>
          <span
            className={
              backendReachable
                ? "text-success-600"
                : "text-error-600"
            }
            title={
              backendStatus
                ? `Backend ${backendStatus.tool} ${backendStatus.version} (phase ${backendStatus.phase})`
                : "Backend unreachable on :8000"
            }
          >
            ● backend {backendReachable ? "ready" : "offline"}
          </span>
        </div>
      </div>
    </header>
  );
}
