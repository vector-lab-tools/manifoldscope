import type { ProvenanceRecord } from "@/lib/provenance";

export type TabGroup = "measure" | "critique" | "atlas";

export type MeasureOperation = "intrinsic_dimension_field";
export type CritiqueOperation = "market_colonisation_index";

export type SummaryStatistics = {
  mean: number | null;
  median: number | null;
  std: number | null;
  min: number | null;
  max: number | null;
  n_valid: number;
};

export type IntrinsicDimensionResult = {
  operation: "intrinsic_dimension_field";
  items: string[];
  coords_3d: number[][];
  explained_variance_ratio: number[];
  local_intrinsic_dimension: (number | null)[];
  global_intrinsic_dimension: number | null;
  summary_statistics: SummaryStatistics;
  parameters: { k: number; estimator: string };
  provenance: ProvenanceRecord;
};

export type MarketColonisationResult = {
  operation: "market_colonisation_index";
  items: string[];
  coords_3d: number[][];
  explained_variance_ratio: number[];
  colonisation_index: number[];
  top_regions: { item: string; score: number }[];
  bottom_regions: { item: string; score: number }[];
  probe_items: string[];
  measure_attestation: {
    local_intrinsic_dimension: (number | null)[];
    summary_statistics: SummaryStatistics;
    estimator: string;
    k: number;
  };
  provenance: ProvenanceRecord;
};

export type BackendStatus = {
  status: string;
  tool: string;
  version: string;
  phase: string;
  samples_available: string[];
  operations_available: {
    measure: string[];
    critique: string[];
  };
};
