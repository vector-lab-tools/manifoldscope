"""
Procrustes alignment and neighbourhood deformation for Metric Archaeology.

Given two embeddings X and Y of the same sample from different embedding
models (e.g., base vs instruct, v1 vs v2, or simply two different
open-weight embedders), compute:

- Procrustes rotation and scale that best maps Y onto X (orthogonal
  Procrustes), and the residual sum-of-squares after alignment.
- Per-point neighbourhood deformation: how much does each point's
  k-NN neighbourhood change between X and Y? Measured as the Jaccard
  distance between its k-NN set in X and its k-NN set in Y. Points
  with high neighbourhood deformation are in regions where the two
  manifolds disagree most about what sits close.

Phase 2a ships the Jaccard-based deformation field and the overall
Procrustes residual. Phase 2a.2 will add per-axis deformation vectors
and a projection of the two aligned manifolds overlaid.
"""

from __future__ import annotations

from typing import Dict, Tuple

import numpy as np
from sklearn.neighbors import NearestNeighbors


def procrustes_align(
    x: np.ndarray,
    y: np.ndarray,
) -> Tuple[np.ndarray, Dict[str, float]]:
    """Orthogonal Procrustes of y onto x.

    Returns (y_aligned, summary) where summary includes the residual
    sum-of-squares and the scale factor.
    """
    if x.shape[0] != y.shape[0]:
        raise ValueError("x and y must have the same number of rows")

    # Centre both.
    mx = x.mean(axis=0, keepdims=True)
    my = y.mean(axis=0, keepdims=True)
    xc = x - mx
    yc = y - my

    # If dimensions differ, pad the smaller one with zeros to match.
    dx = xc.shape[1]
    dy = yc.shape[1]
    if dx != dy:
        d = max(dx, dy)
        if dx < d:
            xc = np.concatenate(
                [xc, np.zeros((xc.shape[0], d - dx), dtype=xc.dtype)], axis=1,
            )
        if dy < d:
            yc = np.concatenate(
                [yc, np.zeros((yc.shape[0], d - dy), dtype=yc.dtype)], axis=1,
            )

    u, s, vt = np.linalg.svd(yc.T @ xc, full_matrices=False)
    r = u @ vt
    scale = float(s.sum() / (np.sum(yc * yc) + 1e-12))
    y_aligned = (yc @ r) * scale

    residual = float(np.sum((xc - y_aligned) ** 2))
    denom = float(np.sum(xc * xc)) + 1e-12
    summary = {
        "residual": residual,
        "normalised_residual": residual / denom,
        "scale": scale,
    }
    return y_aligned, summary


def jaccard_neighbourhood_deformation(
    x: np.ndarray,
    y: np.ndarray,
    k: int = 10,
) -> Tuple[np.ndarray, Dict[str, float]]:
    """Per-point 1 − Jaccard(kNN_x, kNN_y).

    1.0 means the point has zero shared neighbours between x and y; 0.0
    means identical neighbourhoods. Fast, interpretable, and robust to
    projection axes (since it reads the neighbour sets, not the
    coordinates).
    """
    if x.shape[0] != y.shape[0]:
        raise ValueError("x and y must have the same number of rows")
    n = x.shape[0]
    if n < 3:
        return np.zeros((n,), dtype=np.float32), {"k": 0}

    effective_k = min(k, n - 1)

    def _knn_sets(m: np.ndarray) -> list[frozenset[int]]:
        nn = NearestNeighbors(n_neighbors=effective_k + 1, metric="euclidean")
        nn.fit(m)
        _, indices = nn.kneighbors(m)
        # skip self
        return [frozenset(int(j) for j in indices[i][1:]) for i in range(n)]

    x_sets = _knn_sets(x)
    y_sets = _knn_sets(y)

    deformation = np.zeros((n,), dtype=np.float32)
    for i in range(n):
        intersect = len(x_sets[i] & y_sets[i])
        union = len(x_sets[i] | y_sets[i])
        jaccard = (intersect / union) if union > 0 else 1.0
        deformation[i] = 1.0 - jaccard

    summary = {
        "k": effective_k,
        "mean_deformation": float(np.mean(deformation)),
        "median_deformation": float(np.median(deformation)),
        "max_deformation": float(np.max(deformation)),
        "min_deformation": float(np.min(deformation)),
        "fraction_fully_preserved": float(np.mean(deformation == 0.0)),
        "fraction_fully_deformed": float(np.mean(deformation == 1.0)),
    }
    return deformation, summary
