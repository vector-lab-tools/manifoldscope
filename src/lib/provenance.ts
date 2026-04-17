/**
 * Frontend provenance types. Mirrors backend/provenance.py.
 *
 * Every Manifoldscope operation result carries a ProvenanceRecord so that
 * findings can be reproduced and cited. The record is the binding commitment
 * made concrete: manifold source, sample, metric, projection, probe list, and
 * parameters all travel with the result rather than separately from it.
 */

export type ProviderKind =
  | "sentence-transformers"
  | "openai"
  | "voyage"
  | "google"
  | "cohere"
  | "huggingface"
  | "ollama"
  | "vectorscope-export"
  | "theoryscope-corpus-map";

export type ManifoldSource = {
  provider: ProviderKind;
  model_id: string;
  model_revision: string;
  dimension: number;
};

export type SampleSpec = {
  kind: "concept-list" | "zotero" | "file" | "import";
  identifier: string;
  item_count: number;
  filters: Record<string, unknown>;
};

export type ProjectionSpec = {
  method: "pca" | "umap" | "tsne" | "pacmap" | "isomap";
  params: Record<string, unknown>;
};

export type MetricSpec = {
  method: "cosine" | "euclidean" | "geodesic" | "diffusion";
  params: Record<string, unknown>;
};

export type ProbeSpec = {
  name: string;
  list_hash: string;
  partiality_note: string;
  item_count: number;
};

export type ProvenanceRecord = {
  manifold: ManifoldSource;
  sample: SampleSpec;
  sample_hash: string;
  projection: ProjectionSpec;
  metric: MetricSpec;
  operation: string;
  probe: ProbeSpec | null;
  ingestion_timestamp: string;
  stability_score: number | null;
  notes: string;
};
