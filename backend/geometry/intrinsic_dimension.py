"""
Intrinsic-dimension estimators for Manifoldscope.

Phase 0 ships TwoNN (Facco, d'Errico, Rodriguez & Laio, 2017). The global
TwoNN estimator gives a single scalar characterising the manifold's intrinsic
dimension; the local variant gives a per-point field by restricting the
estimation to each point's k-nearest-neighbour ball. The per-point field is
what the Intrinsic Dimension Field operation visualises.

Reference:
    Facco, E., d'Errico, M., Rodriguez, A., Laio, A. (2017).
    Estimating the intrinsic dimension of datasets by a minimal neighbourhood
    information. Scientific Reports, 7, 12140.
"""

from __future__ import annotations

from typing import Tuple

import numpy as np
from sklearn.neighbors import NearestNeighbors


def twonn_global(vectors: np.ndarray, discard_fraction: float = 0.1) -> float:
    """Global TwoNN intrinsic-dimension estimate.

    Uses the ratio mu_i = r2_i / r1_i of each point's second-nearest-neighbour
    distance to its first-nearest-neighbour distance. Under the TwoNN model,
    log(1 - F(mu)) is linear in log(mu) with slope -d, where d is the intrinsic
    dimension.
    """
    if vectors.shape[0] < 3:
        return float("nan")

    nn = NearestNeighbors(n_neighbors=3, algorithm="auto", metric="euclidean")
    nn.fit(vectors)
    distances, _ = nn.kneighbors(vectors)
    # distances[:, 0] is zero (self); columns 1 and 2 are r1 and r2.
    r1 = distances[:, 1]
    r2 = distances[:, 2]
    valid = (r1 > 0) & (r2 > 0) & (r2 >= r1)
    mu = r2[valid] / r1[valid]

    mu_sorted = np.sort(mu)
    # Discard the upper tail for stability against outliers, per Facco et al.
    keep = int((1 - discard_fraction) * len(mu_sorted))
    if keep < 10:
        keep = len(mu_sorted)
    mu_sorted = mu_sorted[:keep]

    n = len(mu_sorted)
    f_emp = np.arange(1, n + 1) / (n + 1)
    y = -np.log(1 - f_emp)
    x = np.log(mu_sorted)
    # Least squares through the origin: d = sum(xy) / sum(x^2)
    denom = float(np.sum(x * x))
    if denom <= 0:
        return float("nan")
    d = float(np.sum(x * y) / denom)
    return d


def twonn_local(
    vectors: np.ndarray,
    k: int = 20,
    discard_fraction: float = 0.1,
) -> np.ndarray:
    """Per-point TwoNN field.

    For each point, computes the global TwoNN estimate restricted to its k
    nearest neighbours. Returns an array of length n with the local intrinsic
    dimension at each point. NaNs where estimation fails.
    """
    n = vectors.shape[0]
    if n < 3:
        return np.full((n,), float("nan"), dtype=np.float32)

    effective_k = min(k, n - 1)
    nn = NearestNeighbors(
        n_neighbors=effective_k + 1, algorithm="auto", metric="euclidean"
    )
    nn.fit(vectors)
    _, indices = nn.kneighbors(vectors)

    local = np.full((n,), float("nan"), dtype=np.float32)
    for i in range(n):
        neighbourhood = vectors[indices[i]]
        local[i] = twonn_global(neighbourhood, discard_fraction=discard_fraction)
    return local


def summary_statistics(field: np.ndarray) -> dict:
    """Summary stats for a per-point intrinsic-dimension field."""
    finite = field[np.isfinite(field)]
    if finite.size == 0:
        return {"mean": None, "median": None, "std": None, "min": None, "max": None, "n_valid": 0}
    return {
        "mean": float(np.mean(finite)),
        "median": float(np.median(finite)),
        "std": float(np.std(finite)),
        "min": float(np.min(finite)),
        "max": float(np.max(finite)),
        "n_valid": int(finite.size),
    }
