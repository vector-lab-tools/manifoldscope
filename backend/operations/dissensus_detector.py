"""Dissensus Detector (Critique register, Phase 1b).

For each concept in the sample, embeds the bare concept alongside a battery
of contextual framings (templates with a {} placeholder). The per-concept
dissensus score is the standard deviation of pairwise cosine distances
across the framed embeddings, i.e. a volatility metric. High scores mark
concepts whose meaning shifts under context; low scores mark concepts the
manifold has smoothed into a single region. Binds a Measure attestation
(local TwoNN ID on the same sample).
"""

from __future__ import annotations

import re
from pathlib import Path
from typing import Any, Dict, List

import numpy as np

from embed.sentence_transformers import embed, DEFAULT_MODEL_ID
from geometry.intrinsic_dimension import summary_statistics, twonn_local
from geometry.projection import pca_3d
from probes.loader import _partiality  # re-use private helper
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

PROBE_FILE = Path(__file__).parent.parent / "probes" / "dissensus-contexts.md"


def _load_templates(path: Path) -> tuple[List[str], str]:
    text = path.read_text(encoding="utf-8")
    match = re.search(r"```templates\s*\n(.*?)\n```", text, re.S)
    if not match:
        raise ValueError(f"No ```templates block in {path}")
    templates = [
        line.strip()
        for line in match.group(1).splitlines()
        if line.strip() and not line.strip().startswith("#")
    ]
    if not templates:
        raise ValueError(f"No templates parsed from {path}")
    return templates, _partiality(text)


def _pairwise_cosine_std(vectors: np.ndarray) -> float:
    """Standard deviation of pairwise cosine distances across a small batch."""
    n = vectors.shape[0]
    if n < 2:
        return 0.0
    norms = np.linalg.norm(vectors, axis=1, keepdims=True)
    norms = np.where(norms > 0, norms, 1.0)
    unit = vectors / norms
    sim = np.clip(unit @ unit.T, -1.0, 1.0)
    distances = 1.0 - sim
    iu = np.triu_indices(n, k=1)
    return float(np.std(distances[iu]))


def compute_dissensus_detector(
    sample_name: str = "philosophy-of-technology-v1",
    k: int = 20,
    model_id: str = DEFAULT_MODEL_ID,
) -> Dict[str, Any]:
    items, partiality = load_sample(sample_name)
    sample_result = embed(items, model_id=model_id)
    coords_3d, evr = pca_3d(sample_result.vectors)

    templates, probe_partiality = _load_templates(PROBE_FILE)
    # The bare-concept framing {} must be present; treat it as one of the
    # template slots. Every other template produces a framed variant.
    if "{}" not in templates:
        templates = ["{}"] + templates

    # For efficiency, build one big batch of framed strings and embed once.
    framed: list[str] = []
    for concept in items:
        for tpl in templates:
            framed.append(tpl.replace("{}", concept))
    framed_result = embed(framed, model_id=model_id)
    framed_vectors = framed_result.vectors.reshape(
        len(items), len(templates), -1
    )

    dissensus = np.zeros((len(items),), dtype=np.float32)
    for i in range(len(items)):
        dissensus[i] = _pairwise_cosine_std(framed_vectors[i])

    order = np.argsort(-dissensus)
    most_volatile = [
        {"item": items[int(i)], "score": float(dissensus[int(i)])}
        for i in order[: min(15, len(items))]
    ]
    most_stable = [
        {"item": items[int(i)], "score": float(dissensus[int(i)])}
        for i in order[-min(15, len(items)) :][::-1]
    ]

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
        metric=MetricSpec(method="cosine", params={}),
        operation="dissensus_detector",
        probe=ProbeSpec(
            name="dissensus-contexts",
            list_hash=hash_probe(templates),
            partiality_note=probe_partiality,
            item_count=len(templates),
        ),
        ingestion_timestamp=now_utc_iso(),
        stability_score=None,
        notes=partiality,
    )

    return {
        "operation": "dissensus_detector",
        "items": items,
        "coords_3d": coords_3d.tolist(),
        "explained_variance_ratio": evr.tolist(),
        "dissensus_field": dissensus.tolist(),
        "most_volatile": most_volatile,
        "most_stable": most_stable,
        "templates": templates,
        "summary": {
            "n_templates": len(templates),
            "mean_dissensus": float(np.mean(dissensus)),
            "median_dissensus": float(np.median(dissensus)),
            "max_dissensus": float(np.max(dissensus)),
            "min_dissensus": float(np.min(dissensus)),
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
