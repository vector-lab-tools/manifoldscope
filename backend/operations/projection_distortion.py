"""Projection-Distortion Meter (Measure register, Phase 1a.2).

Five projections side by side: PCA, UMAP, t-SNE, PaCMAP, Isomap. Each
renders the same manifold differently. For each, we compute a normalised
stress (global-distance preservation) and a trustworthiness score
(local-neighbour preservation). The diagnostic value is the delta between
projections: no single projection is neutral, and the instrument makes the
non-neutrality visible.

If pacmap is not installed, it is skipped with a flag; the remaining four
are always returned.
"""

from __future__ import annotations

from typing import Any, Dict, List

import numpy as np

from embed.sentence_transformers import embed, DEFAULT_MODEL_ID
from geometry.distortion import score_projection
from geometry.projections import (
    isomap_project,
    pacmap_project,
    pca_project,
    tsne_project,
    umap_project,
)
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


def compute_projection_distortion(
    sample_name: str = "philosophy-of-technology-v1",
    n_neighbors: int = 10,
    model_id: str = DEFAULT_MODEL_ID,
) -> Dict[str, Any]:
    items, partiality = load_sample(sample_name)
    sample_result = embed(items, model_id=model_id)

    entries: List[Dict[str, Any]] = []

    # PCA (always runs; records total explained variance for context).
    pca_coords, explained = pca_project(sample_result.vectors)
    pca_scores = score_projection(
        sample_result.vectors, pca_coords, n_neighbors=n_neighbors
    )
    entries.append(
        {
            "method": "pca",
            "coords_3d": pca_coords.tolist(),
            "stress": pca_scores["stress"],
            "trustworthiness": pca_scores["trustworthiness"],
            "notes": f"total explained variance: {explained:.3f}",
            "available": True,
        }
    )

    # UMAP.
    try:
        umap_coords = umap_project(sample_result.vectors, n_neighbors=n_neighbors)
        scores = score_projection(
            sample_result.vectors, umap_coords, n_neighbors=n_neighbors
        )
        entries.append(
            {
                "method": "umap",
                "coords_3d": umap_coords.tolist(),
                "stress": scores["stress"],
                "trustworthiness": scores["trustworthiness"],
                "notes": f"n_neighbors = {n_neighbors}, min_dist = 0.1",
                "available": True,
            }
        )
    except Exception as exc:  # noqa: BLE001
        entries.append(
            {
                "method": "umap",
                "coords_3d": [],
                "stress": None,
                "trustworthiness": None,
                "notes": f"unavailable: {exc}",
                "available": False,
            }
        )

    # t-SNE.
    try:
        tsne_coords = tsne_project(sample_result.vectors)
        scores = score_projection(
            sample_result.vectors, tsne_coords, n_neighbors=n_neighbors
        )
        entries.append(
            {
                "method": "tsne",
                "coords_3d": tsne_coords.tolist(),
                "stress": scores["stress"],
                "trustworthiness": scores["trustworthiness"],
                "notes": "perplexity auto-scaled to sample size",
                "available": True,
            }
        )
    except Exception as exc:  # noqa: BLE001
        entries.append(
            {
                "method": "tsne",
                "coords_3d": [],
                "stress": None,
                "trustworthiness": None,
                "notes": f"unavailable: {exc}",
                "available": False,
            }
        )

    # PaCMAP (optional).
    try:
        pacmap_coords = pacmap_project(sample_result.vectors, n_neighbors=n_neighbors)
        scores = score_projection(
            sample_result.vectors, pacmap_coords, n_neighbors=n_neighbors
        )
        entries.append(
            {
                "method": "pacmap",
                "coords_3d": pacmap_coords.tolist(),
                "stress": scores["stress"],
                "trustworthiness": scores["trustworthiness"],
                "notes": f"n_neighbors = {n_neighbors}",
                "available": True,
            }
        )
    except Exception as exc:  # noqa: BLE001
        entries.append(
            {
                "method": "pacmap",
                "coords_3d": [],
                "stress": None,
                "trustworthiness": None,
                "notes": f"unavailable: {exc}",
                "available": False,
            }
        )

    # Isomap.
    try:
        iso_coords = isomap_project(sample_result.vectors, n_neighbors=n_neighbors)
        scores = score_projection(
            sample_result.vectors, iso_coords, n_neighbors=n_neighbors
        )
        entries.append(
            {
                "method": "isomap",
                "coords_3d": iso_coords.tolist(),
                "stress": scores["stress"],
                "trustworthiness": scores["trustworthiness"],
                "notes": f"n_neighbors = {n_neighbors}",
                "available": True,
            }
        )
    except Exception as exc:  # noqa: BLE001
        entries.append(
            {
                "method": "isomap",
                "coords_3d": [],
                "stress": None,
                "trustworthiness": None,
                "notes": f"unavailable: {exc}",
                "available": False,
            }
        )

    # Summary: available methods, best trustworthiness, worst stress.
    available = [e for e in entries if e["available"]]
    best_trust = max(available, key=lambda e: e["trustworthiness"]) if available else None
    worst_stress = max(available, key=lambda e: e["stress"]) if available else None
    best_stress = min(available, key=lambda e: e["stress"]) if available else None

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
        projection=ProjectionSpec(
            method="pca,umap,tsne,pacmap,isomap",
            params={"n_neighbors": n_neighbors},
        ),
        metric=MetricSpec(method="euclidean", params={}),
        operation="projection_distortion",
        probe=None,
        ingestion_timestamp=now_utc_iso(),
        stability_score=None,
        notes=partiality,
    )

    return {
        "operation": "projection_distortion",
        "items": items,
        "projections": entries,
        "summary": {
            "n_methods_available": len(available),
            "n_methods_total": len(entries),
            "best_trustworthiness_method": best_trust["method"] if best_trust else None,
            "best_trustworthiness_score": best_trust["trustworthiness"] if best_trust else None,
            "lowest_stress_method": best_stress["method"] if best_stress else None,
            "lowest_stress_score": best_stress["stress"] if best_stress else None,
            "highest_stress_method": worst_stress["method"] if worst_stress else None,
            "highest_stress_score": worst_stress["stress"] if worst_stress else None,
        },
        "parameters": {
            "n_neighbors": n_neighbors,
            "metric": "euclidean",
        },
        "provenance": provenance.to_dict(),
    }
