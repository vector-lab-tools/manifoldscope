"""Synonymic Erosion (Critique register, Phase 2a).

For each curated pair of distinction-bearing terms, embed both and
measure the cosine distance. Small distances indicate that the manifold
has collapsed a distinction that critical theory treats as substantive;
larger distances indicate the distinction is preserved. The sample-level
**erosion score** is the mean cosine similarity across pairs.
"""

from __future__ import annotations

import re
from pathlib import Path
from typing import Any, Dict, List, Tuple

import numpy as np

from embed.sentence_transformers import embed, DEFAULT_MODEL_ID
from geometry.intrinsic_dimension import summary_statistics, twonn_local
from geometry.projection import pca_3d
from probes.loader import partiality as _partiality
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

PROBE_FILE = Path(__file__).parent.parent / "probes" / "synonymic-pairs.md"


def _load_pairs(path: Path) -> Tuple[List[Tuple[str, str]], str]:
    text = path.read_text(encoding="utf-8")
    match = re.search(r"```pairs\s*\n(.*?)\n```", text, re.S)
    if not match:
        raise ValueError(f"No ```pairs block in {path}")
    pairs: List[Tuple[str, str]] = []
    for line in match.group(1).splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "::" not in line:
            continue
        a, b = line.split("::", 1)
        pairs.append((a.strip(), b.strip()))
    if not pairs:
        raise ValueError(f"No pairs parsed from {path}")
    return pairs, _partiality(text)


def _cosine(a: np.ndarray, b: np.ndarray) -> float:
    an = float(np.linalg.norm(a))
    bn = float(np.linalg.norm(b))
    if an == 0 or bn == 0:
        return 0.0
    return float(np.dot(a, b) / (an * bn))


def compute_synonymic_erosion(
    sample_name: str = "philosophy-of-technology-v1",
    k: int = 20,
    model_id: str = DEFAULT_MODEL_ID,
) -> Dict[str, Any]:
    items, partiality = load_sample(sample_name)
    sample_result = embed(items, model_id=model_id)
    coords_3d, evr = pca_3d(sample_result.vectors)

    pairs, probe_partiality = _load_pairs(PROBE_FILE)
    lefts = [p[0] for p in pairs]
    rights = [p[1] for p in pairs]
    all_terms = lefts + rights
    pair_vectors = embed(all_terms, model_id=model_id).vectors
    left_vecs = pair_vectors[: len(pairs)]
    right_vecs = pair_vectors[len(pairs) :]

    per_pair = []
    cosines: list[float] = []
    for i, (a, b) in enumerate(pairs):
        cos = _cosine(left_vecs[i], right_vecs[i])
        per_pair.append(
            {
                "term_a": a,
                "term_b": b,
                "cosine": float(cos),
                "distance": float(1.0 - cos),
            }
        )
        cosines.append(cos)

    cos_arr = np.asarray(cosines, dtype=np.float32)

    # Sample colour: cosine similarity to the mean of all term_a vectors.
    left_centroid = left_vecs.mean(axis=0)
    cnorm = float(np.linalg.norm(left_centroid))
    if cnorm == 0:
        sample_left_sim = np.zeros((len(items),), dtype=np.float32)
    else:
        vnorms = np.linalg.norm(sample_result.vectors, axis=1, keepdims=True)
        vnorms = np.where(vnorms > 0, vnorms, 1.0)
        sample_left_sim = (
            (sample_result.vectors / vnorms) @ (left_centroid / cnorm)
        ).astype(np.float32)

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
        operation="synonymic_erosion",
        probe=ProbeSpec(
            name="synonymic-pairs",
            list_hash=hash_probe(all_terms),
            partiality_note=probe_partiality,
            item_count=len(all_terms),
        ),
        ingestion_timestamp=now_utc_iso(),
        stability_score=None,
        notes=partiality,
    )

    return {
        "operation": "synonymic_erosion",
        "items": items,
        "coords_3d": coords_3d.tolist(),
        "explained_variance_ratio": evr.tolist(),
        "per_pair": per_pair,
        "sample_left_similarity": sample_left_sim.tolist(),
        "summary": {
            "n_pairs": len(pairs),
            "erosion_score": float(np.mean(cos_arr)),
            "mean_distance": float(np.mean(1.0 - cos_arr)),
            "median_distance": float(np.median(1.0 - cos_arr)),
            "max_cosine": float(np.max(cos_arr)),
            "min_cosine": float(np.min(cos_arr)),
        },
        "parameters": {"k": k},
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
