"use client";

import { useState } from "react";
import { VERSION } from "@/lib/version";
import { useManifold } from "@/context/ManifoldContext";
import { HelpDialog } from "./HelpDialog";

const FAMILY_URL = "https://vector-lab-tools.github.io";

export function Header() {
  const { backendReachable, backendStatus } = useManifold();
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <>
      <header className="border-b border-parchment bg-ivory">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-3">
            <a
              href={FAMILY_URL}
              target="_blank"
              rel="noreferrer noopener"
              title="Part of the Vector Lab"
              className="shrink-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/vector-lab.svg"
                alt="Manifoldscope — a Vector Lab instrument"
                width={32}
                height={32}
              />
            </a>
            <div>
              <h1 className="font-display text-display-lg text-ink leading-none">
                Manifoldscope
              </h1>
              <p className="font-body text-body-sm italic text-slate">
                Intensive reading of a single manifold, in two registers.
              </p>
            </div>
          </div>
          <div className="flex items-baseline gap-4 font-sans text-caption uppercase tracking-wide text-slate">
            <span>v{VERSION}</span>
            <span
              className={
                backendReachable ? "text-success-600" : "text-error-600"
              }
              title={
                backendStatus
                  ? `Backend ${backendStatus.tool} ${backendStatus.version} (phase ${backendStatus.phase})`
                  : "Backend unreachable on :8000"
              }
            >
              ● backend {backendReachable ? "ready" : "offline"}
            </span>
            <button
              onClick={() => setHelpOpen(true)}
              className="hover:text-ink"
              title="About Manifoldscope and the Vector Lab"
            >
              Help
            </button>
          </div>
        </div>
      </header>
      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}
