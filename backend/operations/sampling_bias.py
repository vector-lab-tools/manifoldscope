"""Sampling-Bias Diagnostic (Measure register, Phase 1a)."""

from __future__ import annotations

from typing import Any, Dict

import numpy as np

from embed.sentence_transformers import embed, DEFAULT_MODEL_ID
from geometry.bootstrap import bootstrap_local_id
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


def compute_sampling_bias_diagnostic(
    sample_name: str = "philosophy-of-technology-v1",
    k: int = 20,
    n_bootstrap: int = 50,
    seed: int = 0,
    model_id: str = DEFAULT_MODEL_ID,
) -> Dict[str, Any]:
    items, partiality = load_sample(sample_name)
    result = embed(items, model_id=model_id)
    coords_3d, evr = pca_3d(result.vectors)
    mean_field, std_field, summary = bootstrap_local_id(
        result.vectors,
        k=k,
        n_bootstrap=n_bootstrap,
        seed=seed,
    )

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
        operation="sampling_bias_diagnostic",
        probe=None,
        ingestion_timestamp=now_utc_iso(),
        stability_score=(
            None
            if summary.get("mean_std") is None
            else float(1.0 / (1.0 + summary["mean_std"]))
        ),
        notes=partiality,
    )

    return {
        "operation": "sampling_bias_diagnostic",
        "items": items,
        "coords_3d": coords_3d.tolist(),
        "explained_variance_ratio": evr.tolist(),
        "bootstrap_mean_id": [
            (None if not np.isfinite(v) else float(v)) for v in mean_field
        ],
        "bootstrap_std_id": [
            (None if not np.isfinite(v) else float(v)) for v in std_field
        ],
        "summary": summary,
        "parameters": {
            "k": k,
            "n_bootstrap": n_bootstrap,
            "seed": seed,
            "estimator": "TwoNN local, bootstrapped over sample indices",
        },
        "provenance": provenance.to_dict(),
    }
