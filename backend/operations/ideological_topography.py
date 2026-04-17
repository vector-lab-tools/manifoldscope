"""Ideological Topography (Critique register, Phase 1b).

Projects a basis of contested axes onto the sample manifold. For each axis
the probe defines two poles; the axis vector is the difference of their
centroids; each sample point's position on the axis is its cosine to the
unit axis vector. The operation returns a per-axis heatmap plus a combined
profile per sample point, and binds a Measure attestation (local TwoNN ID
on the same sample) so the political topography rides on its geometric
provenance.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict

import numpy as np

from embed.sentence_transformers import embed, DEFAULT_MODEL_ID
from geometry.axis_projection import axis_vector, project_onto_axis
from geometry.intrinsic_dimension import summary_statistics, twonn_local
from geometry.projection import pca_3d
from probes.loader import load_axes
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

PROBE_FILE = Path(__file__).parent.parent / "probes" / "ideological-axes.md"


def compute_ideological_topography(
    sample_name: str = "philosophy-of-technology-v1",
    k: int = 20,
    model_id: str = DEFAULT_MODEL_ID,
) -> Dict[str, Any]:
    items, partiality = load_sample(sample_name)
    sample_result = embed(items, model_id=model_id)
    coords_3d, evr = pca_3d(sample_result.vectors)

    axes_dict, probe_partiality = load_axes(PROBE_FILE)

    # For every axis, embed both poles and compute the projection.
    per_axis: Dict[str, Dict[str, Any]] = {}
    all_probe_items: list[str] = []
    for axis_name, (pole_a, pole_b) in axes_dict.items():
        pole_a_vecs = embed(pole_a, model_id=model_id).vectors
        pole_b_vecs = embed(pole_b, model_id=model_id).vectors
        av = axis_vector(pole_a_vecs, pole_b_vecs)
        positions = project_onto_axis(sample_result.vectors, av)

        order = np.argsort(-positions)
        top_a = [
            {"item": items[int(i)], "position": float(positions[int(i)])}
            for i in order[: min(10, len(items))]
        ]
        top_b = [
            {"item": items[int(i)], "position": float(positions[int(i)])}
            for i in order[-min(10, len(items)) :][::-1]
        ]

        per_axis[axis_name] = {
            "pole_a_items": pole_a,
            "pole_b_items": pole_b,
            "positions": positions.tolist(),
            "top_toward_a": top_a,
            "top_toward_b": top_b,
            "mean_position": float(np.mean(positions)),
            "std_position": float(np.std(positions)),
            "fraction_toward_a": float(np.mean(positions > 0)),
        }
        all_probe_items.extend(pole_a + pole_b)

    # Measure attestation on the same sample.
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
        metric=MetricSpec(method="cosine", params={}),
        operation="ideological_topography",
        probe=ProbeSpec(
            name="ideological-axes",
            list_hash=hash_probe(all_probe_items),
            partiality_note=probe_partiality,
            item_count=len(all_probe_items),
        ),
        ingestion_timestamp=now_utc_iso(),
        stability_score=None,
        notes=partiality,
    )

    return {
        "operation": "ideological_topography",
        "items": items,
        "coords_3d": coords_3d.tolist(),
        "explained_variance_ratio": evr.tolist(),
        "axes": [
            {"name": name, **data} for name, data in per_axis.items()
        ],
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
