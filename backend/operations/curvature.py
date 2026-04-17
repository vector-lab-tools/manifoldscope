"""Curvature Estimation (Measure register, Phase 1a)."""

from __future__ import annotations

from typing import Any, Dict

import numpy as np

from embed.sentence_transformers import embed, DEFAULT_MODEL_ID
from geometry.curvature import forman_ricci_field
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


def compute_curvature_estimation(
    sample_name: str = "philosophy-of-technology-v1",
    k: int = 10,
    model_id: str = DEFAULT_MODEL_ID,
) -> Dict[str, Any]:
    items, partiality = load_sample(sample_name)
    result = embed(items, model_id=model_id)
    coords_3d, evr = pca_3d(result.vectors)
    curvature, summary = forman_ricci_field(result.vectors, k=k)

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
        metric=MetricSpec(method="euclidean", params={"k": k}),
        operation="curvature_estimation",
        probe=None,
        ingestion_timestamp=now_utc_iso(),
        stability_score=None,
        notes=partiality,
    )

    return {
        "operation": "curvature_estimation",
        "items": items,
        "coords_3d": coords_3d.tolist(),
        "explained_variance_ratio": evr.tolist(),
        "curvature_field": [
            (None if not np.isfinite(v) else float(v)) for v in curvature
        ],
        "summary": summary,
        "parameters": {
            "k": k,
            "estimator": "Forman-Ricci (unit weights) on k-NN graph",
        },
        "provenance": provenance.to_dict(),
    }
