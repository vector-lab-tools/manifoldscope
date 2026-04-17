"""Hegemonic Gravity Map (Critique register, Phase 1b).

Compute per-point attractor scores (number of other concepts that list this
one among their k nearest neighbours). High scores are centres of mass on
the manifold, loci of hegemonic attraction. Low scores are peripheral.
Binds a Measure attestation (local TwoNN ID on the same sample).
"""

from __future__ import annotations

from typing import Any, Dict

import numpy as np

from embed.sentence_transformers import embed, DEFAULT_MODEL_ID
from geometry.gravity import gravity_field
from geometry.intrinsic_dimension import summary_statistics, twonn_local
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


def compute_hegemonic_gravity_map(
    sample_name: str = "philosophy-of-technology-v1",
    k: int = 10,
    model_id: str = DEFAULT_MODEL_ID,
) -> Dict[str, Any]:
    items, partiality = load_sample(sample_name)
    sample_result = embed(items, model_id=model_id)
    coords_3d, evr = pca_3d(sample_result.vectors)
    gravity, summary = gravity_field(sample_result.vectors, k=k)

    order = np.argsort(-gravity)
    attractors = [
        {"item": items[int(i)], "score": float(gravity[int(i)])}
        for i in order[: min(15, len(items))]
    ]
    peripheral = [
        {"item": items[int(i)], "score": float(gravity[int(i)])}
        for i in order[-min(15, len(items)) :][::-1]
    ]

    # Measure attestation on the same sample.
    local_id = twonn_local(sample_result.vectors, k=max(k, 20))
    measure_stats = summary_statistics(local_id)

    provenance = ProvenanceRecord(
        manifold=ManifoldSource(
            provider="sentence-transformers",
            model_id=model_id,
            model_revision="",
            dimension=sample_result.dimension,
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
        operation="hegemonic_gravity_map",
        probe=None,
        ingestion_timestamp=now_utc_iso(),
        stability_score=None,
        notes=partiality,
    )

    return {
        "operation": "hegemonic_gravity_map",
        "items": items,
        "coords_3d": coords_3d.tolist(),
        "explained_variance_ratio": evr.tolist(),
        "gravity_field": gravity.tolist(),
        "attractors": attractors,
        "peripheral": peripheral,
        "summary": summary,
        "parameters": {
            "k": k,
            "method": "incoming k-NN edge count, normalised by k",
        },
        "measure_attestation": {
            "local_intrinsic_dimension": [
                (None if not np.isfinite(v) else float(v)) for v in local_id
            ],
            "summary_statistics": measure_stats,
            "estimator": "TwoNN (Facco et al. 2017)",
            "k": max(k, 20),
        },
        "provenance": provenance.to_dict(),
    }
