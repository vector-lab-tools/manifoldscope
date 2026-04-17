"""Normative Transition Probe (Critique register, Phase 1b).

Measures the geometric boundary between is-vocabulary and ought-vocabulary
across the sample. For each sample point, the normative gradient is the
difference between its cosine similarity to the ought-centroid and its
cosine similarity to the is-centroid. The global **is/ought cosine**
between the two centroids reports how close the two registers sit in the
manifold (vector theory predicts they are close; this number tests it).
Binds a Measure attestation.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict

import numpy as np

from embed.sentence_transformers import embed, DEFAULT_MODEL_ID
from geometry.axis_projection import similarity_to_centroid
from geometry.intrinsic_dimension import summary_statistics, twonn_local
from geometry.projection import pca_3d
from probes.loader import load_named_blocks
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

PROBE_FILE = Path(__file__).parent.parent / "probes" / "normative-transition.md"


def _cosine(a: np.ndarray, b: np.ndarray) -> float:
    an = float(np.linalg.norm(a))
    bn = float(np.linalg.norm(b))
    if an == 0 or bn == 0:
        return 0.0
    return float(np.dot(a, b) / (an * bn))


def compute_normative_transition(
    sample_name: str = "philosophy-of-technology-v1",
    k: int = 20,
    model_id: str = DEFAULT_MODEL_ID,
) -> Dict[str, Any]:
    items, partiality = load_sample(sample_name)
    sample_result = embed(items, model_id=model_id)
    coords_3d, evr = pca_3d(sample_result.vectors)

    blocks, probe_partiality = load_named_blocks(PROBE_FILE, ["is", "ought"])
    is_items = blocks["is"]
    ought_items = blocks["ought"]

    is_vecs = embed(is_items, model_id=model_id).vectors
    ought_vecs = embed(ought_items, model_id=model_id).vectors

    sim_is, is_centroid = similarity_to_centroid(sample_result.vectors, is_vecs)
    sim_ought, ought_centroid = similarity_to_centroid(
        sample_result.vectors, ought_vecs,
    )
    gradient = (sim_ought - sim_is).astype(np.float32)

    is_ought_cos = _cosine(is_centroid, ought_centroid)

    order = np.argsort(-gradient)
    top_ought = [
        {
            "item": items[int(i)],
            "gradient": float(gradient[int(i)]),
            "is_sim": float(sim_is[int(i)]),
            "ought_sim": float(sim_ought[int(i)]),
        }
        for i in order[: min(12, len(items))]
    ]
    top_is = [
        {
            "item": items[int(i)],
            "gradient": float(gradient[int(i)]),
            "is_sim": float(sim_is[int(i)]),
            "ought_sim": float(sim_ought[int(i)]),
        }
        for i in order[-min(12, len(items)) :][::-1]
    ]

    # Measure attestation.
    local_id = twonn_local(sample_result.vectors, k=k)
    measure_stats = summary_statistics(local_id)

    all_probe_items = is_items + ought_items

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
        operation="normative_transition",
        probe=ProbeSpec(
            name="normative-transition",
            list_hash=hash_probe(all_probe_items),
            partiality_note=probe_partiality,
            item_count=len(all_probe_items),
        ),
        ingestion_timestamp=now_utc_iso(),
        stability_score=None,
        notes=partiality,
    )

    return {
        "operation": "normative_transition",
        "items": items,
        "coords_3d": coords_3d.tolist(),
        "explained_variance_ratio": evr.tolist(),
        "is_similarity": sim_is.tolist(),
        "ought_similarity": sim_ought.tolist(),
        "normative_gradient": gradient.tolist(),
        "is_ought_centroid_cosine": is_ought_cos,
        "top_toward_ought": top_ought,
        "top_toward_is": top_is,
        "is_items": is_items,
        "ought_items": ought_items,
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
