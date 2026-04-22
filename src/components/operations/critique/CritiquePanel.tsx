"use client";

import { useState } from "react";
import { SubNav } from "@/components/layout/SubNav";
import { MarketColonisationIndex } from "./MarketColonisationIndex";
import { IdeologicalTopography } from "./IdeologicalTopography";
import { HegemonicGravityMap } from "./HegemonicGravityMap";
import { NormativeTransitionProbe } from "./NormativeTransitionProbe";
import { DissensusDetector } from "./DissensusDetector";
import { GrammaticalIdeologyProbe } from "./GrammaticalIdeologyProbe";
import { TrainingDataFingerprint } from "./TrainingDataFingerprint";
import { TemporalSedimentation } from "./TemporalSedimentation";
import { SynonymicErosion } from "./SynonymicErosion";
import { MetricArchaeology } from "./MetricArchaeology";
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
  {
    id: "dissensus_detector",
    label: "Dissensus Detector",
    description: "Per-concept contextual volatility",
  },
  {
    id: "grammatical_ideology_probe",
    label: "Grammatical Ideology",
    description: "Active vs passive cosine gap on curated pairs",
  },
  {
    id: "training_data_fingerprint",
    label: "Training-Data Fingerprint",
    description: "Per-concept genre distribution over marker probes",
  },
  {
    id: "temporal_sedimentation",
    label: "Temporal Sedimentation",
    description: "Per-concept period distribution over marker probes",
  },
  {
    id: "synonymic_erosion",
    label: "Synonymic Erosion",
    description: "Distinction-collapse diagnostic on curated pairs",
  },
  {
    id: "metric_archaeology",
    label: "Metric Archaeology",
    description: "Two-embedder Procrustes + kNN deformation",
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
      {active === "dissensus_detector" && <DissensusDetector />}
      {active === "grammatical_ideology_probe" && <GrammaticalIdeologyProbe />}
      {active === "training_data_fingerprint" && <TrainingDataFingerprint />}
      {active === "temporal_sedimentation" && <TemporalSedimentation />}
      {active === "synonymic_erosion" && <SynonymicErosion />}
      {active === "metric_archaeology" && <MetricArchaeology />}
    </div>
  );
}
