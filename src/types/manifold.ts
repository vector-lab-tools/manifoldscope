import type { ProvenanceRecord } from "@/lib/provenance";

export type TabGroup = "measure" | "critique" | "atlas";

export type MeasureOperation =
  | "intrinsic_dimension_field"
  | "curvature_estimation"
  | "density_gradient_field"
  | "geodesic_map"
  | "sampling_bias_diagnostic";
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

export type CurvatureResult = {
  operation: "curvature_estimation";
  items: string[];
  coords_3d: number[][];
  explained_variance_ratio: number[];
  curvature_field: (number | null)[];
  summary: {
    n_edges: number;
    mean_edge_curvature: number;
    min_edge_curvature: number;
    max_edge_curvature: number;
    fraction_negative: number;
    fraction_positive: number;
  };
  parameters: { k: number; estimator: string };
  provenance: ProvenanceRecord;
};

export type DensityGradientResult = {
  operation: "density_gradient_field";
  items: string[];
  coords_3d: number[][];
  explained_variance_ratio: number[];
  density_field: number[];
  summary: {
    k: number;
    mean_density: number;
    median_density: number;
    min_density: number;
    max_density: number;
    mean_knn_distance: number;
    median_knn_distance: number;
  };
  parameters: { k: number; estimator: string };
  provenance: ProvenanceRecord;
};

export type GeodesicMapResult = {
  operation: "geodesic_map";
  items: string[];
  coords_3d: number[][];
  explained_variance_ratio: number[];
  geodesic_cosine_delta: (number | null)[];
  summary: {
    k: number;
    geodesic_cosine_correlation: number;
    mean_delta: number;
    median_delta: number;
    max_delta: number;
    disconnected_pairs: number;
    total_pairs: number;
  };
  parameters: { k: number; method: string };
  provenance: ProvenanceRecord;
};

export type SamplingBiasResult = {
  operation: "sampling_bias_diagnostic";
  items: string[];
  coords_3d: number[][];
  explained_variance_ratio: number[];
  bootstrap_mean_id: (number | null)[];
  bootstrap_std_id: (number | null)[];
  summary: {
    n_bootstrap: number;
    seed: number;
    mean_coverage: number;
    median_std: number | null;
    mean_std: number | null;
    max_std: number | null;
    n_valid_points: number;
  };
  parameters: { k: number; n_bootstrap: number; seed: number; estimator: string };
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
