"""Void Atlas (Measure register, Phase 1a.2).

Persistent homology over a Vietoris-Rips filtration of the sample.
Returns H0 and H1 persistence pairs; the H1 pairs are the voids. The
critical reading: high-persistence H1 features mark robust voids in the
manifold, regions the embedding space encloses but leaves empty.
"""

from __future__ import annotations

from typing import Any, Dict

from embed.sentence_transformers import embed, DEFAULT_MODEL_ID
from geometry.persistent_homology import compute_persistence
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


def compute_void_atlas(
    sample_name: str = "philosophy-of-technology-v1",
    max_dim: int = 1,
    max_points: int = 1000,
    model_id: str = DEFAULT_MODEL_ID,
) -> Dict[str, Any]:
    items, partiality = load_sample(sample_name)
    sample_result = embed(items, model_id=model_id)
    coords_3d, evr = pca_3d(sample_result.vectors)

    persistence = compute_persistence(
        sample_result.vectors,
        max_dim=max_dim,
        max_points=max_points,
    )

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
        metric=MetricSpec(method="euclidean", params={}),
        operation="void_atlas",
        probe=None,
        ingestion_timestamp=now_utc_iso(),
        stability_score=None,
        notes=partiality,
    )

    return {
        "operation": "void_atlas",
        "items": items,
        "coords_3d": coords_3d.tolist(),
        "explained_variance_ratio": evr.tolist(),
        "h0": persistence["h0"],
        "h1": persistence["h1"],
        "sampled_indices": persistence["sampled_indices"],
        "summary": persistence["summary"],
        "parameters": {
            "max_dim": max_dim,
            "max_points": max_points,
            "filtration": "Vietoris-Rips (euclidean) via ripser",
        },
        "provenance": provenance.to_dict(),
    }
