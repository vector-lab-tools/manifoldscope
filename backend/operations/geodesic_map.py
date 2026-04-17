"""Geodesic Map: cosine-vs-geodesic delta (Measure register, Phase 1a)."""

from __future__ import annotations

from typing import Any, Dict

import numpy as np

from embed.sentence_transformers import embed, DEFAULT_MODEL_ID
from geometry.geodesic import geodesic_vs_cosine
from geometry.projection import pca_3d
from provenance import (
    ManifoldSource,
    MetricSpec,
    ProjectionSpec,
    ProvenanceRecord,
    SampleSpec,
    hash_sample,
    now_utc_iso,
)
from sample.loader import load_sample


def compute_geodesic_map(
    sample_name: str = "philosophy-of-technology-v1",
    k: int = 10,
    model_id: str = DEFAULT_MODEL_ID,
) -> Dict[str, Any]:
    items, partiality = load_sample(sample_name)
    result = embed(items, model_id=model_id)
    coords_3d, evr = pca_3d(result.vectors)
    delta, summary = geodesic_vs_cosine(result.vectors, k=k)

    provenance = ProvenanceRecord(
        manifold=ManifoldSource(
            provider="sentence-transformers",
            model_id=model_id,
            model_revision="",
            dimension=result.dimension,
        ),
        sample=SampleSpec(
            kind="concept-list",
            identifier=sample_name,
            item_count=len(items),
            filters={},
        ),
        sample_hash=hash_sample(items),
        projection=ProjectionSpec(method="pca", params={"n_components": 3}),
        metric=MetricSpec(method="geodesic", params={"k": k, "edge_metric": "euclidean"}),
        operation="geodesic_map",
        probe=None,
        ingestion_timestamp=now_utc_iso(),
        stability_score=None,
        notes=partiality,
    )

    return {
        "operation": "geodesic_map",
        "items": items,
        "coords_3d": coords_3d.tolist(),
        "explained_variance_ratio": evr.tolist(),
        "geodesic_cosine_delta": [
            (None if not np.isfinite(v) else float(v)) for v in delta
        ],
        "summary": summary,
        "parameters": {
            "k": k,
            "method": "Isomap shortest path on k-NN graph vs normalised cosine distance",
        },
        "provenance": provenance.to_dict(),
    }
