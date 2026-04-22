"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { TabNav } from "@/components/layout/TabNav";
import { MeasurePanel } from "@/components/operations/measure/MeasurePanel";
import { CritiquePanel } from "@/components/operations/critique/CritiquePanel";
import { AtlasStub } from "@/components/operations/atlas/AtlasStub";
import Providers from "./providers";
import type { TabGroup } from "@/types/manifold";

export default function HomePage() {
  return (
    <Providers>
      <Shell />
    </Providers>
  );
}

function Shell() {
  const [tab, setTab] = useState<TabGroup>("measure");

  return (
    <main className="min-h-screen bg-ivory">
      <Header />
      <TabNav active={tab} onChange={setTab} />

      <div className="mx-auto max-w-6xl px-6 py-8">
        {tab === "measure" && (
          <div className="space-y-6">
            <Intro
              title="Measure"
              text="Intrinsic geometry, descriptive, geometric in output. What shape is this manifold? Phases 1a and 1a.2 ship seven operations: Intrinsic Dimension Field, Curvature Estimation, Density Gradient Field, Geodesic Map, Sampling-Bias Diagnostic, Void Atlas, and Projection-Distortion Meter."
            />
            <MeasurePanel />
          </div>
        )}

        {tab === "critique" && (
          <div className="space-y-6">
            <Intro
              title="Critique"
              text="Ideological investigation, interpretive, readings backed by geometric evidence. Phase 1b ships six operations: Ideological Topography, Hegemonic Gravity Map, Market-Colonisation Index, Normative Transition Probe, Dissensus Detector, and Grammatical Ideology Probe. Every Critique finding renders alongside an independent Measure attestation on the same sample."
            />
            <CritiquePanel />
          </div>
        )}

        {tab === "atlas" && (
          <div className="space-y-6">
            <Intro
              title="Atlas"
              text="Curated pre-run analyses on named samples, bundled with provenance and David's critical annotations. Lands in Phase 4."
            />
            <AtlasStub />
          </div>
        )}
      </div>

      <footer className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-8 font-sans text-caption uppercase tracking-widest text-slate">
        <span>
          Manifoldscope · Concept and Design: David M. Berry, University of
          Sussex
        </span>
        <a
          href="https://vector-lab-tools.github.io"
          target="_blank"
          rel="noreferrer noopener"
          className="flex items-center gap-2 hover:text-ink"
          title="Part of the Vector Lab"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/logo-mark.svg"
            alt="Vector Lab"
            width={20}
            height={20}
            className="opacity-70"
          />
          <span>Vector Lab</span>
        </a>
      </footer>
    </main>
  );
}

function Intro({ title, text }: { title: string; text: string }) {
  return (
    <div className="max-w-3xl">
      <h2 className="font-display text-display-xl text-ink">{title}</h2>
      <p className="font-body text-body-lg text-charcoal">{text}</p>
    </div>
  );
}
