"""Temporal Sedimentation (Critique register, Phase 2a).

For each sample point, compute cosine similarity to each period&apos;s marker
centroid and softmax into a distribution over periods. The per-concept
period fingerprint reveals which era of Anglophone technical / media
discourse the concept sits closest to.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict

import numpy as np

from embed.sentence_transformers import embed, DEFAULT_MODEL_ID
from geometry.intrinsic_dimension import summary_statistics, twonn_local
from geometry.markers import category_distribution
from geometry.projection import pca_3d
from probes.loader import load_categories
from provenance import (
    ManifoldSource,
    MetricSpec,
    ProbeSpec,
    ProjectionSpec,
    ProvenanceRecord,
    SampleSpec,
    hash_probe,
    hash_sample,
    now_utc_iso,
)
from sample.loader import load_sample

PROBE_FILE = Path(__file__).parent.parent / "probes" / "periods.md"


def compute_temporal_sedimentation(
    sample_name: str = "philosophy-of-technology-v1",
    k: int = 20,
    temperature: float = 0.1,
    model_id: str = DEFAULT_MODEL_ID,
) -> Dict[str, Any]:
    items, partiality = load_sample(sample_name)
    sample_result = embed(items, model_id=model_id)
    coords_3d, evr = pca_3d(sample_result.vectors)

    categories, probe_partiality = load_categories(
        PROBE_FILE, block_name="periods", category_prefix="period",
    )

    centroids: Dict[str, np.ndarray] = {}
    all_markers: list[str] = []
    for name, markers in categories.items():
        vecs = embed(markers, model_id=model_id).vectors
        centroids[name] = vecs.mean(axis=0)
        all_markers.extend(markers)

    names, sims, dist = category_distribution(
        sample_result.vectors, centroids, temperature=temperature,
    )

    dominant_idx = np.argmax(dist, axis=1)
    dominant_period = [names[int(i)] for i in dominant_idx]

    aggregate = dist.mean(axis=0).tolist()

    per_point = []
    for i, concept in enumerate(items):
        per_point.append(
            {
                "item": concept,
                "dominant_period": dominant_period[i],
                "distribution": dist[i].tolist(),
            }
        )

    # Measure attestation.
    local_id = twonn_local(sample_result.vectors, k=k)
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
        metric=MetricSpec(method="cosine", params={"temperature": temperature}),
        operation="temporal_sedimentation",
        probe=ProbeSpec(
            name="periods",
            list_hash=hash_probe(all_markers),
            partiality_note=probe_partiality,
            item_count=len(all_markers),
        ),
        ingestion_timestamp=now_utc_iso(),
        stability_score=None,
        notes=partiality,
    )

    return {
        "operation": "temporal_sedimentation",
        "items": items,
        "coords_3d": coords_3d.tolist(),
        "explained_variance_ratio": evr.tolist(),
        "periods": names,
        "raw_similarities": sims.tolist(),
        "distribution": dist.tolist(),
        "aggregate_distribution": aggregate,
        "dominant_period": dominant_period,
        "per_point": per_point,
        "parameters": {"k": k, "temperature": temperature},
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
