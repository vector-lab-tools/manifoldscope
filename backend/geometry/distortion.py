"""
Distortion metrics for 3D projections.

Two complementary scores:

- **Normalised stress.** The sum of squared differences between pairwise
  distances in the high-dimensional space and in the 3D projection,
  divided by the sum of squared high-dimensional distances. Zero means the
  projection preserves all distances; larger means more distortion.
- **Trustworthiness.** From Venna and Kaski (2001), via scikit-learn. The
  fraction of k-nearest neighbours in the projection that are also k-NN
  in the high-dimensional space. One means no neighbours are lost in
  projection; smaller means the projection has invented proximity.

Both metrics are useful for the Projection-Distortion Meter: stress tells
you how much global structure is distorted, trustworthiness tells you
whether the local structure is preserved or invented.
"""

from __future__ import annotations

from typing import Dict

import numpy as np
from scipy.spatial.distance import pdist


def normalised_stress(
    high_dim: np.ndarray,
    low_dim: np.ndarray,
) -> float:
    """Kruskal stress-1 (normalised by sum of squared high-D distances)."""
    hi = pdist(high_dim)
    lo = pdist(low_dim)
    denom = float(np.sum(hi * hi))
    if denom <= 0:
        return float("nan")
    num = float(np.sum((hi - lo) ** 2))
    return num / denom


def trustworthiness_score(
    high_dim: np.ndarray,
    low_dim: np.ndarray,
    n_neighbors: int = 10,
) -> float:
    """Trustworthiness via scikit-learn."""
    from sklearn.manifold import trustworthiness

    n = high_dim.shape[0]
    effective_k = min(n_neighbors, max(1, n - 2))
    return float(trustworthiness(high_dim, low_dim, n_neighbors=effective_k))


def score_projection(
    high_dim: np.ndarray,
    low_dim: np.ndarray,
    n_neighbors: int = 10,
) -> Dict[str, float]:
    return {
        "stress": normalised_stress(high_dim, low_dim),
        "trustworthiness": trustworthiness_score(high_dim, low_dim, n_neighbors),
    }
