"use client";

import { useState } from "react";
import { SubNav } from "@/components/layout/SubNav";
import { IntrinsicDimensionField } from "./IntrinsicDimensionField";
import { CurvatureEstimation } from "./CurvatureEstimation";
import { DensityGradientField } from "./DensityGradientField";
import { GeodesicMap } from "./GeodesicMap";
import { SamplingBiasDiagnostic } from "./SamplingBiasDiagnostic";
import { VoidAtlas } from "./VoidAtlas";
import { ProjectionDistortionMeter } from "./ProjectionDistortionMeter";
import type { MeasureOperation } from "@/types/manifold";

const ITEMS: readonly { id: MeasureOperation; label: string; description: string }[] = [
  {
    id: "intrinsic_dimension_field",
    label: "Intrinsic Dimension",
    description: "TwoNN per-point local ID",
  },
  {
    id: "curvature_estimation",
    label: "Curvature",
    description: "Forman-Ricci on k-NN graph",
  },
  {
    id: "density_gradient_field",
    label: "Density",
    description: "Inverse-kNN density field",
  },
  {
    id: "geodesic_map",
    label: "Geodesic Map",
    description: "Isomap vs cosine delta",
  },
  {
    id: "sampling_bias_diagnostic",
    label: "Sampling Bias",
    description: "Bootstrap over TwoNN",
  },
  {
    id: "void_atlas",
    label: "Void Atlas",
    description: "H0/H1 persistent homology",
  },
  {
    id: "projection_distortion",
    label: "Projection Distortion",
    description: "5-way projection grid + stress/trust",
  },
];

export function MeasurePanel() {
  const [active, setActive] = useState<MeasureOperation>(
    "intrinsic_dimension_field",
  );

  return (
    <div className="space-y-4">
      <SubNav items={ITEMS} active={active} onChange={setActive} />

      {active === "intrinsic_dimension_field" && <IntrinsicDimensionField />}
      {active === "curvature_estimation" && <CurvatureEstimation />}
      {active === "density_gradient_field" && <DensityGradientField />}
      {active === "geodesic_map" && <GeodesicMap />}
      {active === "sampling_bias_diagnostic" && <SamplingBiasDiagnostic />}
      {active === "void_atlas" && <VoidAtlas />}
      {active === "projection_distortion" && <ProjectionDistortionMeter />}
    </div>
  );
}
