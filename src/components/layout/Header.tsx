"use client";

import { useState } from "react";
import { VERSION } from "@/lib/version";
import { useManifold } from "@/context/ManifoldContext";
import { HelpDialog } from "./HelpDialog";
import type { TabGroup } from "@/types/manifold";

const FAMILY_URL = "https://vector-lab-tools.github.io";

const TAB_LABELS: Record<TabGroup, string> = {
  measure: "Measure",
  critique: "Critique",
  atlas: "Atlas",
};

/**
 * Editorial header following the Vector Lab family pattern (LLMbench):
 *
 *   [VL mark] Vector Lab │ [tool icon] Manifoldscope │ active tab  …  v0.x · ● backend · Help
 */
export function Header({ activeTab }: { activeTab: TabGroup }) {
  const { backendReachable, backendStatus } = useManifold();
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <>
      <header className="flex items-center gap-3 border-b border-parchment bg-cream/30 px-4 py-2">
        {/* Vector Lab family mark (muted, hover-brightens) */}
        <a
          href={FAMILY_URL}
          target="_blank"
          rel="noreferrer noopener"
          title="Vector Lab — research instruments for critical vector theory"
          className="flex shrink-0 items-center gap-1.5 opacity-70 transition-opacity hover:opacity-100"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/logo-mark.svg"
            alt="Vector Lab"
            width={20}
            height={20}
            className="h-5 w-5"
          />
          <span className="hidden text-[10px] font-medium uppercase tracking-widest text-slate sm:inline">
            Vector Lab
          </span>
        </a>

        <div className="h-4 w-px bg-parchment-dark/60" aria-hidden="true" />

        {/* Manifoldscope identity */}
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/vector-lab.svg"
            alt=""
            width={18}
            height={18}
            className="h-[18px] w-[18px]"
            aria-hidden="true"
          />
          <h1 className="font-display text-body-sm font-bold text-ink">
            Manifoldscope
          </h1>
        </div>

        <div className="h-4 w-px bg-parchment-dark/60" aria-hidden="true" />

        {/* Sub-label: current tab */}
        <span className="text-caption uppercase tracking-wide text-slate">
          {TAB_LABELS[activeTab]}
        </span>

        <div className="flex-1" />

        {/* Right-hand controls */}
        <div className="flex items-center gap-4 font-sans text-caption uppercase tracking-wide text-slate">
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
            className="transition-colors hover:text-ink"
            title="About Manifoldscope and the Vector Lab"
          >
            Help
          </button>
        </div>
      </header>
      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}
