"""
Hegemonic gravity: which concepts in a sample act as attractors?

For each point i, the gravity score is the number of other points that have
i among their k nearest neighbours. High scores mark points that many other
concepts sit close to; they are the centres of mass of the manifold.
Low-score points are peripheral. The asymmetry between "near many" and
"near by many" is the critical feature: density alone cannot distinguish a
cluster centre from a cluster member.

The operation reports the per-point gravity field alongside the top and
bottom attractors. The reading: centres of mass are loci of hegemonic
attraction; concepts sit near them because the training data put them
there, not because of any intrinsic gravity the concepts have in the
world.
"""

from __future__ import annotations

from typing import Tuple

import numpy as np
from sklearn.neighbors import NearestNeighbors


def gravity_field(
    vectors: np.ndarray,
    k: int = 10,
) -> Tuple[np.ndarray, dict]:
    """Per-point gravity score = incoming k-NN edge count.

    Returns (gravity, summary). The gravity array sums, for each point i,
    the number of other points that list i in their k nearest neighbours.
    """
    n = vectors.shape[0]
    if n < 2:
        return np.zeros((n,), dtype=np.float32), {"n": n, "k": 0}

    effective_k = min(k, n - 1)
    nn = NearestNeighbors(n_neighbors=effective_k + 1, metric="euclidean")
    nn.fit(vectors)
    _, indices = nn.kneighbors(vectors)

    incoming = np.zeros((n,), dtype=np.float32)
    # Columns 1..effective_k are the real neighbours (column 0 is self).
    for i in range(n):
        for j in indices[i][1:]:
            incoming[int(j)] += 1.0

    # Normalise by k so the scale is interpretable (score ∈ [0, n-1]/k).
    normalised = incoming / float(effective_k)

    summary = {
        "n": n,
        "k": effective_k,
        "max_score": float(normalised.max()),
        "mean_score": float(normalised.mean()),
        "median_score": float(np.median(normalised)),
        "std_score": float(normalised.std()),
    }
    return normalised, summary
