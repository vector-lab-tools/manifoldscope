import type { ProvenanceRecord } from "@/lib/provenance";

export type TabGroup = "measure" | "critique" | "atlas";

export type MeasureOperation =
  | "intrinsic_dimension_field"
  | "curvature_estimation"
  | "density_gradient_field"
  | "geodesic_map"
  | "sampling_bias_diagnostic"
  | "void_atlas"
  | "projection_distortion";
export type CritiqueOperation =
  | "market_colonisation_index"
  | "ideological_topography"
  | "hegemonic_gravity_map"
  | "normative_transition"
  | "dissensus_detector"
  | "grammatical_ideology_probe"
  | "training_data_fingerprint"
  | "temporal_sedimentation"
  | "synonymic_erosion"
  | "metric_archaeology";

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

export type PersistencePair = {
  birth: number;
  death: number | null;
  lifetime: number | null;
};

export type VoidAtlasResult = {
  operation: "void_atlas";
  items: string[];
  coords_3d: number[][];
  explained_variance_ratio: number[];
  h0: PersistencePair[];
  h1: PersistencePair[];
  sampled_indices: number[];
  summary: {
    n_points_used: number;
    n_points_original: number;
    downsampled: boolean;
    max_edge_length: number | null;
    h0_count: number;
    h1_count: number;
    h1_mean_lifetime: number | null;
    h1_median_lifetime: number | null;
    h1_max_lifetime: number | null;
  };
  parameters: {
    max_dim: number;
    max_points: number;
    filtration: string;
  };
  provenance: ProvenanceRecord;
};

export type ProjectionEntry = {
  method: "pca" | "umap" | "tsne" | "pacmap" | "isomap";
  coords_3d: number[][];
  stress: number | null;
  trustworthiness: number | null;
  notes: string;
  available: boolean;
};

export type ProjectionDistortionResult = {
  operation: "projection_distortion";
  items: string[];
  projections: ProjectionEntry[];
  summary: {
    n_methods_available: number;
    n_methods_total: number;
    best_trustworthiness_method: string | null;
    best_trustworthiness_score: number | null;
    lowest_stress_method: string | null;
    lowest_stress_score: number | null;
    highest_stress_method: string | null;
    highest_stress_score: number | null;
  };
  parameters: { n_neighbors: number; metric: string };
  provenance: ProvenanceRecord;
};

export type IdeologicalAxisResult = {
  name: string;
  pole_a_items: string[];
  pole_b_items: string[];
  positions: number[];
  top_toward_a: { item: string; position: number }[];
  top_toward_b: { item: string; position: number }[];
  mean_position: number;
  std_position: number;
  fraction_toward_a: number;
};

export type IdeologicalTopographyResult = {
  operation: "ideological_topography";
  items: string[];
  coords_3d: number[][];
  explained_variance_ratio: number[];
  axes: IdeologicalAxisResult[];
  measure_attestation: {
    local_intrinsic_dimension: (number | null)[];
    summary_statistics: SummaryStatistics;
    estimator: string;
    k: number;
  };
  provenance: ProvenanceRecord;
};

export type HegemonicGravityResult = {
  operation: "hegemonic_gravity_map";
  items: string[];
  coords_3d: number[][];
  explained_variance_ratio: number[];
  gravity_field: number[];
  attractors: { item: string; score: number }[];
  peripheral: { item: string; score: number }[];
  summary: {
    n: number;
    k: number;
    max_score: number;
    mean_score: number;
    median_score: number;
    std_score: number;
  };
  parameters: { k: number; method: string };
  measure_attestation: {
    local_intrinsic_dimension: (number | null)[];
    summary_statistics: SummaryStatistics;
    estimator: string;
    k: number;
  };
  provenance: ProvenanceRecord;
};

export type NormativeTransitionResult = {
  operation: "normative_transition";
  items: string[];
  coords_3d: number[][];
  explained_variance_ratio: number[];
  is_similarity: number[];
  ought_similarity: number[];
  normative_gradient: number[];
  is_ought_centroid_cosine: number;
  top_toward_ought: {
    item: string;
    gradient: number;
    is_sim: number;
    ought_sim: number;
  }[];
  top_toward_is: {
    item: string;
    gradient: number;
    is_sim: number;
    ought_sim: number;
  }[];
  is_items: string[];
  ought_items: string[];
  measure_attestation: {
    local_intrinsic_dimension: (number | null)[];
    summary_statistics: SummaryStatistics;
    estimator: string;
    k: number;
  };
  provenance: ProvenanceRecord;
};

export type DissensusDetectorResult = {
  operation: "dissensus_detector";
  items: string[];
  coords_3d: number[][];
  explained_variance_ratio: number[];
  dissensus_field: number[];
  most_volatile: { item: string; score: number }[];
  most_stable: { item: string; score: number }[];
  templates: string[];
  summary: {
    n_templates: number;
    mean_dissensus: number;
    median_dissensus: number;
    max_dissensus: number;
    min_dissensus: number;
  };
  measure_attestation: {
    local_intrinsic_dimension: (number | null)[];
    summary_statistics: SummaryStatistics;
    estimator: string;
    k: number;
  };
  provenance: ProvenanceRecord;
};

export type GrammaticalIdeologyPair = {
  active: string;
  passive: string;
  cosine: number;
  distance: number;
};

export type GrammaticalIdeologyResult = {
  operation: "grammatical_ideology_probe";
  items: string[];
  coords_3d: number[][];
  explained_variance_ratio: number[];
  sample_active_similarity: number[];
  per_pair: GrammaticalIdeologyPair[];
  summary: {
    n_pairs: number;
    mean_distance: number;
    median_distance: number;
    max_distance: number;
    min_distance: number;
    mean_cosine: number;
  };
  measure_attestation: {
    local_intrinsic_dimension: (number | null)[];
    summary_statistics: SummaryStatistics;
    estimator: string;
    k: number;
  };
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

/* ────────────────────────────────────────────────────────────
 *  Phase 2a — Archaeological and forensic
 * ──────────────────────────────────────────────────────────── */

export type MeasureAttestation = {
  local_intrinsic_dimension: (number | null)[];
  summary_statistics: SummaryStatistics;
  estimator: string;
  k: number;
};

export type TrainingDataFingerprintResult = {
  operation: "training_data_fingerprint";
  items: string[];
  coords_3d: number[][];
  explained_variance_ratio: number[];
  genres: string[];
  raw_similarities: number[][];
  distribution: number[][];
  aggregate_distribution: number[];
  dominant_genre: string[];
  per_point: { item: string; dominant_genre: string; distribution: number[] }[];
  parameters: { k: number; temperature: number };
  measure_attestation: MeasureAttestation;
  provenance: ProvenanceRecord;
};

export type TemporalSedimentationResult = {
  operation: "temporal_sedimentation";
  items: string[];
  coords_3d: number[][];
  explained_variance_ratio: number[];
  periods: string[];
  raw_similarities: number[][];
  distribution: number[][];
  aggregate_distribution: number[];
  dominant_period: string[];
  per_point: { item: string; dominant_period: string; distribution: number[] }[];
  parameters: { k: number; temperature: number };
  measure_attestation: MeasureAttestation;
  provenance: ProvenanceRecord;
};

export type SynonymicErosionPair = {
  term_a: string;
  term_b: string;
  cosine: number;
  distance: number;
};

export type SynonymicErosionResult = {
  operation: "synonymic_erosion";
  items: string[];
  coords_3d: number[][];
  explained_variance_ratio: number[];
  per_pair: SynonymicErosionPair[];
  sample_left_similarity: number[];
  summary: {
    n_pairs: number;
    erosion_score: number;
    mean_distance: number;
    median_distance: number;
    max_cosine: number;
    min_cosine: number;
  };
  parameters: { k: number };
  measure_attestation: MeasureAttestation;
  provenance: ProvenanceRecord;
};

export type MetricArchaeologyResult = {
  operation: "metric_archaeology";
  items: string[];
  coords_3d: number[][];
  explained_variance_ratio: number[];
  deformation_field: number[];
  most_deformed: { item: string; deformation: number }[];
  most_preserved: { item: string; deformation: number }[];
  procrustes: {
    residual: number;
    normalised_residual: number;
    scale: number;
  };
  deformation_summary: {
    k: number;
    mean_deformation: number;
    median_deformation: number;
    max_deformation: number;
    min_deformation: number;
    fraction_fully_preserved: number;
    fraction_fully_deformed: number;
  };
  parameters: {
    k: number;
    primary_model: string;
    comparison_model: string;
  };
  measure_attestation: MeasureAttestation;
  provenance: ProvenanceRecord;
};
