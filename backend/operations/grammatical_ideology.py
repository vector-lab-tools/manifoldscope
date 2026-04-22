"""Grammatical Ideology Probe (Critique register, Phase 1b).

For each curated pair of sentences expressing the same event in active vs
passive voice, the operation embeds both sentences and reports the cosine
distance between them. Small distances indicate that the manifold has
collapsed the grammatical distinction: active and passive renderings of
the same event sit in near-identical regions, and the political difference
the active voice names (who acted on whom) is not preserved by the
geometry. Larger distances indicate that the distinction is preserved.

The 3D scatter colours each sample point by its cosine similarity to the
mean of the active-voice sentences in the probe, so the reading locates
the probe's events relative to the sample. Binds a Measure attestation.
"""

from __future__ import annotations

import re
from pathlib import Path
from typing import Any, Dict, List, Tuple

import numpy as np

from embed.sentence_transformers import embed, DEFAULT_MODEL_ID
from geometry.intrinsic_dimension import summary_statistics, twonn_local
from geometry.projection import pca_3d
from probes.loader import _partiality
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

PROBE_FILE = Path(__file__).parent.parent / "probes" / "grammatical-ideology-pairs.md"


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
        left, right = line.split("::", 1)
        pairs.append((left.strip(), right.strip()))
    if not pairs:
        raise ValueError(f"No pairs parsed from {path}")
    return pairs, _partiality(text)


def _cosine(a: np.ndarray, b: np.ndarray) -> float:
    an = float(np.linalg.norm(a))
    bn = float(np.linalg.norm(b))
    if an == 0 or bn == 0:
        return 0.0
    return float(np.dot(a, b) / (an * bn))


def compute_grammatical_ideology(
    sample_name: str = "philosophy-of-technology-v1",
    k: int = 20,
    model_id: str = DEFAULT_MODEL_ID,
) -> Dict[str, Any]:
    items, partiality = load_sample(sample_name)
    sample_result = embed(items, model_id=model_id)
    coords_3d, evr = pca_3d(sample_result.vectors)

    pairs, probe_partiality = _load_pairs(PROBE_FILE)
    actives = [p[0] for p in pairs]
    passives = [p[1] for p in pairs]
    all_sentences = actives + passives
    pair_embeddings = embed(all_sentences, model_id=model_id).vectors

    active_vecs = pair_embeddings[: len(pairs)]
    passive_vecs = pair_embeddings[len(pairs) :]

    per_pair = []
    distances: list[float] = []
    for i, (active, passive) in enumerate(pairs):
        cos = _cosine(active_vecs[i], passive_vecs[i])
        distance = 1.0 - cos
        distances.append(distance)
        per_pair.append(
            {
                "active": active,
                "passive": passive,
                "cosine": float(cos),
                "distance": float(distance),
            }
        )

    distance_array = np.asarray(distances, dtype=np.float32)

    # Sample-level colouring: cosine similarity of each sample point to the
    # mean of the active-voice sentences. Locates the events relative to the
    # sample's geometry.
    active_centroid = active_vecs.mean(axis=0)
    cnorm = float(np.linalg.norm(active_centroid))
    if cnorm == 0:
        similarity = np.zeros((len(items),), dtype=np.float32)
    else:
        vnorms = np.linalg.norm(sample_result.vectors, axis=1, keepdims=True)
        vnorms = np.where(vnorms > 0, vnorms, 1.0)
        similarity = (
            (sample_result.vectors / vnorms) @ (active_centroid / cnorm)
        ).astype(np.float32)

    # Measure attestation.
    local_id = twonn_local(sample_result.vectors, k=k)
    measure_stats = summary_statistics(local_id)

    all_probe_items = actives + passives

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
        operation="grammatical_ideology_probe",
        probe=ProbeSpec(
            name="grammatical-ideology-pairs",
            list_hash=hash_probe(all_probe_items),
            partiality_note=probe_partiality,
            item_count=len(all_probe_items),
        ),
        ingestion_timestamp=now_utc_iso(),
        stability_score=None,
        notes=partiality,
    )

    return {
        "operation": "grammatical_ideology_probe",
        "items": items,
        "coords_3d": coords_3d.tolist(),
        "explained_variance_ratio": evr.tolist(),
        "sample_active_similarity": similarity.tolist(),
        "per_pair": per_pair,
        "summary": {
            "n_pairs": len(pairs),
            "mean_distance": float(np.mean(distance_array)),
            "median_distance": float(np.median(distance_array)),
            "max_distance": float(np.max(distance_array)),
            "min_distance": float(np.min(distance_array)),
            "mean_cosine": float(1.0 - np.mean(distance_array)),
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
