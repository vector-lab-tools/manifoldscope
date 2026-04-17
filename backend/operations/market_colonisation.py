"""
Market-Colonisation Index (Critique register, Phase 0).

Embeds the sample and the market-colonisation probe list, computes each sample
point's mean cosine similarity to the probe-list centroid, and returns the
colonisation gradient across the sample along with the Measure attestation
(local intrinsic dimension for the same sample, for the provenance-binding
card on the frontend).
"""

from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path
from typing import Any, Dict, List, Tuple

import numpy as np

from embed.sentence_transformers import embed, DEFAULT_MODEL_ID
from geometry.intrinsic_dimension import summary_statistics, twonn_local
from geometry.projection import pca_3d
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


PROBE_FILE = Path(__file__).parent.parent / "probes" / "market-colonisation.md"


def _parse_probe_file(path: Path) -> Tuple[List[str], str]:
    """Extract (probe_items, partiality_note) from a probe markdown file."""
    text = path.read_text(encoding="utf-8")

    # Partiality note: everything under "## Partiality note" until the next "## " header
    partiality_match = re.search(
        r"##\s*Partiality note\s*\n(.*?)(?=\n##\s|\Z)", text, re.S
    )
    partiality = partiality_match.group(1).strip() if partiality_match else ""

    # Probe list: the fenced code block after "## Probe list"
    list_match = re.search(
        r"##\s*Probe list\s*\n+```\s*\n(.*?)\n```", text, re.S
    )
    if not list_match:
        raise ValueError(f"No probe list found in {path}")
    items = [
        line.strip()
        for line in list_match.group(1).splitlines()
        if line.strip() and not line.strip().startswith("#")
    ]
    return items, partiality


def _cosine_similarity_to_centroid(vectors: np.ndarray, centroid: np.ndarray) -> np.ndarray:
    v_norm = np.linalg.norm(vectors, axis=1, keepdims=True)
    c_norm = float(np.linalg.norm(centroid))
    if c_norm == 0:
        return np.zeros((vectors.shape[0],), dtype=np.float32)
    denom = v_norm.squeeze() * c_norm
    denom = np.where(denom > 0, denom, 1.0)
    sim = (vectors @ centroid) / denom
    return sim.astype(np.float32)


def compute_market_colonisation_index(
    sample_name: str = "philosophy-of-technology-v1",
    k: int = 20,
    model_id: str = DEFAULT_MODEL_ID,
) -> Dict[str, Any]:
    # Sample
    items, partiality = load_sample(sample_name)
    sample_result = embed(items, model_id=model_id)
    coords_3d, evr = pca_3d(sample_result.vectors)

    # Probe list
    probe_items, probe_partiality = _parse_probe_file(PROBE_FILE)
    probe_result = embed(probe_items, model_id=model_id)
    probe_centroid = probe_result.vectors.mean(axis=0)

    # Colonisation gradient
    colonisation = _cosine_similarity_to_centroid(sample_result.vectors, probe_centroid)

    # Top/bottom regions
    order = np.argsort(-colonisation)
    top_idx = order[: min(15, len(items))]
    bottom_idx = order[-min(15, len(items)) :][::-1]
    top = [{"item": items[int(i)], "score": float(colonisation[int(i)])} for i in top_idx]
    bottom = [{"item": items[int(i)], "score": float(colonisation[int(i)])} for i in bottom_idx]

    # Measure attestation bound to this Critique finding: local intrinsic
    # dimension for the same sample, so the reading carries its geometric
    # provenance as a first-class object on the frontend.
    local_id = twonn_local(sample_result.vectors, k=k)
    measure_stats = summary_statistics(local_id)

    probe_list_hash = hash_probe(probe_items)

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
        operation="market_colonisation_index",
        probe=ProbeSpec(
            name="market-colonisation",
            list_hash=probe_list_hash,
            partiality_note=probe_partiality,
            item_count=len(probe_items),
        ),
        ingestion_timestamp=now_utc_iso(),
        stability_score=None,
        notes=partiality,
    )

    return {
        "operation": "market_colonisation_index",
        "items": items,
        "coords_3d": coords_3d.tolist(),
        "explained_variance_ratio": evr.tolist(),
        "colonisation_index": colonisation.tolist(),
        "top_regions": top,
        "bottom_regions": bottom,
        "probe_items": probe_items,
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
