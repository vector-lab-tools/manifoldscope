"""
Density gradient field for Manifoldscope.

For each sampled point we estimate the local density via k-nearest-neighbour
distance statistics in the ambient (embedding) space, then render the
continuous field on the 3D projection. A point with small mean kNN distance
sits in a dense core; a point with large mean kNN distance sits on a sparse
shell. The field is the critical object: where the manifold is dense, the
model has allocated representational space; where it is sparse, distinctions
collapse.

Later phases will add kernel density estimation on the projection, gradient
vector fields, and contour isolines.
"""

from __future__ import annotations

from typing import Tuple

import numpy as np
from sklearn.neighbors import NearestNeighbors


def knn_density_field(
    vectors: np.ndarray,
    k: int = 10,
) -> Tuple[np.ndarray, dict]:
    """Inverse-mean-kNN-distance density estimate per point.

    Returns (density_field, summary). Higher values indicate denser regions.
    """
    n = vectors.shape[0]
    if n < 2:
        return np.zeros((n,), dtype=np.float32), {"n": n}

    effective_k = min(k, n - 1)
    nn = NearestNeighbors(n_neighbors=effective_k + 1, metric="euclidean")
    nn.fit(vectors)
    distances, _ = nn.kneighbors(vectors)
    # distances[:, 0] is self (zero). Mean over the k real neighbours.
    mean_knn = distances[:, 1:].mean(axis=1)
    # Avoid divide-by-zero: add a tiny epsilon relative to the global scale.
    eps = float(mean_knn[mean_knn > 0].min()) * 1e-3 if np.any(mean_knn > 0) else 1e-6
    density = 1.0 / (mean_knn + eps)

    summary = {
        "k": effective_k,
        "mean_density": float(np.mean(density)),
        "median_density": float(np.median(density)),
        "min_density": float(np.min(density)),
        "max_density": float(np.max(density)),
        "mean_knn_distance": float(np.mean(mean_knn)),
        "median_knn_distance": float(np.median(mean_knn)),
    }
    return density.astype(np.float32), summary
