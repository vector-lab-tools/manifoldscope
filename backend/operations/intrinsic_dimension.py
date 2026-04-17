"""
Intrinsic Dimension Field (Measure register, Phase 0).

Loads a sample, embeds it with the default open-weight embedder, computes the
per-point TwoNN intrinsic dimension field, projects to 3D via PCA, and returns
the full result with its provenance record.
"""

from __future__ import annotations

from typing import Any, Dict

import numpy as np

from embed.sentence_transformers import embed, DEFAULT_MODEL_ID
from geometry.intrinsic_dimension import (
    summary_statistics,
    twonn_global,
    twonn_local,
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


def compute_intrinsic_dimension_field(
    sample_name: str = "philosophy-of-technology-v1",
    k: int = 20,
    model_id: str = DEFAULT_MODEL_ID,
) -> Dict[str, Any]:
    items, partiality = load_sample(sample_name)
    result = embed(items, model_id=model_id)
    coords_3d, evr = pca_3d(result.vectors)
    local_id = twonn_local(result.vectors, k=k)
    global_id = twonn_global(result.vectors)
    stats = summary_statistics(local_id)

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
        metric=MetricSpec(method="cosine", params={}),
        operation="intrinsic_dimension_field",
        probe=None,
        ingestion_timestamp=now_utc_iso(),
        stability_score=None,
        notes=partiality,
    )

    return {
        "operation": "intrinsic_dimension_field",
        "items": items,
        "coords_3d": coords_3d.tolist(),
        "explained_variance_ratio": evr.tolist(),
        "local_intrinsic_dimension": [
            (None if not np.isfinite(v) else float(v)) for v in local_id
        ],
        "global_intrinsic_dimension": (
            None if not np.isfinite(global_id) else float(global_id)
        ),
        "summary_statistics": stats,
        "parameters": {"k": k, "estimator": "TwoNN (Facco et al. 2017)"},
        "provenance": provenance.to_dict(),
    }
