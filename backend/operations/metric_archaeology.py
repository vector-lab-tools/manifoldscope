"""Metric Archaeology (Critique register, Phase 2a).

Loads the sample under two different open-weight embedders and reports:

- The orthogonal-Procrustes residual between the two embeddings (a global
  measure of how much the two manifolds disagree after optimal rotation
  and scale).
- The per-point Jaccard-based neighbourhood deformation (how much each
  concept's k-nearest-neighbour set changes between the two embedders).

Points with high neighbourhood deformation are in regions where the two
manifolds disagree most about what sits close. The critical reading:
geometry is not a given; different embedders encode different manifolds,
and the deformation field is the political archaeology of that
difference.
"""

from __future__ import annotations

from typing import Any, Dict

import numpy as np

from embed.sentence_transformers import embed, DEFAULT_MODEL_ID
from geometry.intrinsic_dimension import summary_statistics, twonn_local
from geometry.procrustes import (
    jaccard_neighbourhood_deformation,
    procrustes_align,
)
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


DEFAULT_COMPARISON_MODEL = "sentence-transformers/all-mpnet-base-v2"


def compute_metric_archaeology(
    sample_name: str = "philosophy-of-technology-v1",
    k: int = 10,
    model_id: str = DEFAULT_MODEL_ID,
    comparison_model_id: str = DEFAULT_COMPARISON_MODEL,
) -> Dict[str, Any]:
    items, partiality = load_sample(sample_name)

    # Two embedders on the same sample.
    primary = embed(items, model_id=model_id)
    secondary = embed(items, model_id=comparison_model_id)

    coords_3d, evr = pca_3d(primary.vectors)

    # Procrustes alignment of the secondary onto the primary.
    _, procrustes_summary = procrustes_align(primary.vectors, secondary.vectors)

    # Per-point Jaccard neighbourhood deformation.
    deformation, deformation_summary = jaccard_neighbourhood_deformation(
        primary.vectors, secondary.vectors, k=k,
    )

    order = np.argsort(-deformation)
    most_deformed = [
        {"item": items[int(i)], "deformation": float(deformation[int(i)])}
        for i in order[: min(15, len(items))]
    ]
    most_preserved = [
        {"item": items[int(i)], "deformation": float(deformation[int(i)])}
        for i in order[-min(15, len(items)) :][::-1]
    ]

    # Measure attestation on the primary sample.
    local_id = twonn_local(primary.vectors, k=k)
    measure_stats = summary_statistics(local_id)

    provenance = ProvenanceRecord(
        manifold=ManifoldSource(
            provider="sentence-transformers",
            model_id=model_id,
            model_revision="",
            dimension=primary.dimension,
        ),
        sample=SampleSpec(
            kind="concept-list",
            identifier=sample_name,
            item_count=len(items),
            filters={},
        ),
        sample_hash=hash_sample(items),
        projection=ProjectionSpec(method="pca", params={"n_components": 3}),
        metric=MetricSpec(
            method="jaccard-knn",
            params={
                "k": k,
                "primary_model": model_id,
                "comparison_model": comparison_model_id,
                "comparison_dimension": secondary.dimension,
            },
        ),
        operation="metric_archaeology",
        probe=None,
        ingestion_timestamp=now_utc_iso(),
        stability_score=None,
        notes=partiality,
    )

    return {
        "operation": "metric_archaeology",
        "items": items,
        "coords_3d": coords_3d.tolist(),
        "explained_variance_ratio": evr.tolist(),
        "deformation_field": deformation.tolist(),
        "most_deformed": most_deformed,
        "most_preserved": most_preserved,
        "procrustes": procrustes_summary,
        "deformation_summary": deformation_summary,
        "parameters": {
            "k": k,
            "primary_model": model_id,
            "comparison_model": comparison_model_id,
        },
        "measure_attestation": {
            "local_intrinsic_dimension": [
                (None if not np.isfinite(v) else float(v)) for v in local_id
            ],
            "summary_statistics": measure_stats,
            "estimator": "TwoNN (Facco et al. 2017)",
            "k": k,
        },
        "provenance": provenance.to_dict(),
    }
