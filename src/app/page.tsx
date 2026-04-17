"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { TabNav } from "@/components/layout/TabNav";
import { IntrinsicDimensionField } from "@/components/operations/measure/IntrinsicDimensionField";
import { MarketColonisationIndex } from "@/components/operations/critique/MarketColonisationIndex";
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
              text="Intrinsic geometry, descriptive, geometric in output. What shape is this manifold? Phase 0 ships one operation: the Intrinsic Dimension Field, using the TwoNN estimator of Facco et al. (2017)."
            />
            <IntrinsicDimensionField />
          </div>
        )}

        {tab === "critique" && (
          <div className="space-y-6">
            <Intro
              title="Critique"
              text="Ideological investigation, interpretive, readings backed by geometric evidence. Phase 0 ships one operation: the Market-Colonisation Index, whose finding renders alongside an independent Measure attestation on the same sample."
            />
            <MarketColonisationIndex />
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

      <footer className="mx-auto max-w-6xl px-6 py-8 font-sans text-caption uppercase tracking-widest text-slate">
        Manifoldscope · Concept and Design: David M. Berry, University of Sussex ·
        Vector Lab
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
