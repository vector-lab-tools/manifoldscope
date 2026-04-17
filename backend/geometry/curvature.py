"""
Discrete curvature estimators for Manifoldscope.

Phase 1a ships **Forman-Ricci curvature** on the k-nearest-neighbour graph.
Forman's discrete curvature is simpler and cheaper to compute than
Ollivier-Ricci (which requires optimal transport) and gives a fast readable
signal: positive Forman-Ricci on an edge indicates the edge sits in a
well-connected region with many shared neighbours; negative values mark
bridges across sparser territory. Per-point curvature is the mean curvature
of incident edges.

Forman (2003), Sreejith et al. (2016) for the simplified formulation used here.

Phase 1a.2 will add Ollivier-Ricci (via Wasserstein-1 between neighbour
distributions) for comparison. The two give complementary readings.
"""

from __future__ import annotations

from typing import Dict, Tuple

import numpy as np
from sklearn.neighbors import NearestNeighbors


def _knn_graph(vectors: np.ndarray, k: int = 10) -> Dict[int, set[int]]:
    """Undirected k-NN graph as adjacency set. Self-loops excluded."""
    n = vectors.shape[0]
    effective_k = min(k, n - 1)
    nn = NearestNeighbors(n_neighbors=effective_k + 1, metric="euclidean")
    nn.fit(vectors)
    _, indices = nn.kneighbors(vectors)

    adj: Dict[int, set[int]] = {i: set() for i in range(n)}
    for i in range(n):
        for j in indices[i][1:]:  # skip self
            adj[i].add(int(j))
            adj[int(j)].add(i)  # symmetrise
    return adj


def forman_ricci_field(
    vectors: np.ndarray,
    k: int = 10,
) -> Tuple[np.ndarray, dict]:
    """Per-point Forman-Ricci curvature from the k-NN graph.

    For each undirected edge (u, v) we compute the simplified Forman-Ricci
    curvature

        F(u,v) = w(u) + w(v) - sum over shared neighbours n of
                 [ w(u)/sqrt(w_uv * w_un) + w(v)/sqrt(w_uv * w_vn) ]

    with unit node/edge weights. Positive F indicates well-connected regions;
    negative F marks bridges. Per-point curvature is the mean of incident
    edges.
    """
    n = vectors.shape[0]
    if n < 3:
        return np.zeros((n,), dtype=np.float32), {"n_edges": 0}

    adj = _knn_graph(vectors, k=k)

    # Accumulate mean edge-curvature at each node.
    per_node_sum = np.zeros((n,), dtype=np.float64)
    per_node_count = np.zeros((n,), dtype=np.int32)

    seen_edges: set[tuple[int, int]] = set()
    edge_curvatures: list[float] = []

    for u in range(n):
        for v in adj[u]:
            key = (u, v) if u < v else (v, u)
            if key in seen_edges:
                continue
            seen_edges.add(key)

            shared = adj[u] & adj[v]
            # Unit weights: w(u) = w(v) = 1, w_uv = w_un = w_vn = 1.
            # F(u,v) = 1 + 1 - |shared| * (1/sqrt(1) + 1/sqrt(1))
            # which collapses to 2 - 2|shared|.
            f = 2.0 - 2.0 * len(shared)
            edge_curvatures.append(f)

            per_node_sum[u] += f
            per_node_sum[v] += f
            per_node_count[u] += 1
            per_node_count[v] += 1

    mean_field = np.divide(
        per_node_sum,
        per_node_count,
        out=np.full_like(per_node_sum, np.nan),
        where=per_node_count > 0,
    ).astype(np.float32)

    edge_arr = np.asarray(edge_curvatures, dtype=np.float32) if edge_curvatures else np.asarray([])
    summary = {
        "n_edges": len(edge_curvatures),
        "mean_edge_curvature": float(np.mean(edge_arr)) if edge_arr.size else 0.0,
        "min_edge_curvature": float(np.min(edge_arr)) if edge_arr.size else 0.0,
        "max_edge_curvature": float(np.max(edge_arr)) if edge_arr.size else 0.0,
        "fraction_negative": float(np.mean(edge_arr < 0)) if edge_arr.size else 0.0,
        "fraction_positive": float(np.mean(edge_arr > 0)) if edge_arr.size else 0.0,
    }
    return mean_field, summary
