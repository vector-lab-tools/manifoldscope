"""
Geodesic distance on the manifold, via Isomap shortest-path on the k-NN graph.

The critical finding is the delta between geodesic distance and plain cosine
distance. Where cosine and geodesic agree, the straight-line metric is a
faithful proxy. Where they disagree, cosine is lying about proximity: two
points that look close in the ambient space are far apart on the manifold.
This is the diagnostic that matters for any reading that relies on cosine
similarity as its primary instrument.
"""

from __future__ import annotations

from typing import Tuple

import numpy as np
from scipy.sparse import csr_matrix
from scipy.sparse.csgraph import shortest_path
from sklearn.neighbors import NearestNeighbors


def _cosine_distance_matrix(vectors: np.ndarray) -> np.ndarray:
    """Full pairwise cosine distance. O(n^2) but fine for the sample sizes
    Phase 1a targets (under a few thousand points)."""
    norms = np.linalg.norm(vectors, axis=1, keepdims=True)
    norms = np.where(norms > 0, norms, 1.0)
    normed = vectors / norms
    cos_sim = normed @ normed.T
    cos_sim = np.clip(cos_sim, -1.0, 1.0)
    return 1.0 - cos_sim


def _geodesic_distance_matrix(vectors: np.ndarray, k: int = 10) -> np.ndarray:
    """Shortest-path distance on the k-NN graph, using Euclidean edge weights."""
    n = vectors.shape[0]
    effective_k = min(k, n - 1)
    nn = NearestNeighbors(n_neighbors=effective_k + 1, metric="euclidean")
    nn.fit(vectors)
    distances, indices = nn.kneighbors(vectors)

    # Build sparse adjacency with Euclidean edge weights.
    rows = np.repeat(np.arange(n), effective_k)
    cols = indices[:, 1:].reshape(-1)
    data = distances[:, 1:].reshape(-1)
    graph = csr_matrix((data, (rows, cols)), shape=(n, n))
    # Symmetrise so the graph is undirected.
    graph = graph.maximum(graph.T)

    geo = shortest_path(graph, method="D", directed=False)
    return geo


def geodesic_vs_cosine(
    vectors: np.ndarray,
    k: int = 10,
) -> Tuple[np.ndarray, dict]:
    """Per-point mean |geodesic - cosine| delta.

    For each point, compute the mean absolute difference between its geodesic
    distance to every other point and its cosine distance to the same. The
    per-point value is a local signal of how much cosine misrepresents the
    manifold's distance structure at that point.

    Returns (per_point_delta, summary). Points with large delta sit where
    cosine most misleads; points with small delta sit where the straight-line
    metric is faithful.
    """
    n = vectors.shape[0]
    if n < 3:
        return np.zeros((n,), dtype=np.float32), {"n": n}

    cos_d = _cosine_distance_matrix(vectors)
    geo_d = _geodesic_distance_matrix(vectors, k=k)

    # Normalise both to [0, 1] globally so the comparison is scale-free.
    cos_max = float(cos_d.max()) or 1.0
    geo_max = float(geo_d[np.isfinite(geo_d)].max()) or 1.0
    cos_n = cos_d / cos_max
    geo_n = np.where(np.isfinite(geo_d), geo_d / geo_max, np.nan)

    delta = np.abs(geo_n - cos_n)
    # Per-point mean, ignoring self (diagonal) and disconnected components.
    np.fill_diagonal(delta, np.nan)
    with np.errstate(invalid="ignore"):
        per_point = np.nanmean(delta, axis=1)

    # Global correlation between geodesic and cosine.
    mask = np.isfinite(geo_n) & np.isfinite(cos_n)
    iu = np.triu_indices(n, k=1)
    pairs_mask = mask[iu]
    gvals = geo_n[iu][pairs_mask]
    cvals = cos_n[iu][pairs_mask]
    corr = float(np.corrcoef(gvals, cvals)[0, 1]) if gvals.size > 1 else float("nan")

    # Count disconnected pairs (infinite geodesic distances).
    disconnected_pairs = int(np.sum(~np.isfinite(geo_d[iu])))

    summary = {
        "k": k,
        "geodesic_cosine_correlation": corr,
        "mean_delta": float(np.nanmean(per_point)),
        "median_delta": float(np.nanmedian(per_point)),
        "max_delta": float(np.nanmax(per_point)),
        "disconnected_pairs": disconnected_pairs,
        "total_pairs": int(n * (n - 1) / 2),
    }
    return per_point.astype(np.float32), summary
