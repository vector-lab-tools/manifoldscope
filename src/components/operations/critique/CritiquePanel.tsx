"use client";

import { useState } from "react";
import { SubNav } from "@/components/layout/SubNav";
import { MarketColonisationIndex } from "./MarketColonisationIndex";
import { IdeologicalTopography } from "./IdeologicalTopography";
import { HegemonicGravityMap } from "./HegemonicGravityMap";
import { NormativeTransitionProbe } from "./NormativeTransitionProbe";
import type { CritiqueOperation } from "@/types/manifold";

const ITEMS: readonly { id: CritiqueOperation; label: string; description: string }[] = [
  {
    id: "ideological_topography",
    label: "Ideological Topography",
    description: "5 contested axes projected onto the sample",
  },
  {
    id: "hegemonic_gravity_map",
    label: "Hegemonic Gravity",
    description: "Incoming k-NN attractor score per concept",
  },
  {
    id: "market_colonisation_index",
    label: "Market-Colonisation",
    description: "Gradient of market vocabulary across the sample",
  },
  {
    id: "normative_transition",
    label: "Normative Transition",
    description: "is/ought gradient + centroid cosine",
  },
];

export function CritiquePanel() {
  const [active, setActive] = useState<CritiqueOperation>(
    "ideological_topography",
  );

  return (
    <div className="space-y-4">
      <SubNav items={ITEMS} active={active} onChange={setActive} />

      {active === "ideological_topography" && <IdeologicalTopography />}
      {active === "hegemonic_gravity_map" && <HegemonicGravityMap />}
      {active === "market_colonisation_index" && <MarketColonisationIndex />}
      {active === "normative_transition" && <NormativeTransitionProbe />}
    </div>
  );
}
