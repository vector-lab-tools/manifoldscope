"""
Persistent homology for Manifoldscope's Void Atlas.

Computes H0 (connected components) and H1 (loops) persistence pairs over a
Vietoris-Rips filtration of the sample. The H1 class is the critical object
for the Void Atlas: each H1 pair corresponds to a loop, and a loop is the
boundary of a void in the manifold. High-persistence H1 pairs mark the
most structurally robust voids.

Uses the `ripser` package. For samples larger than ~2000 points the full
H1 computation becomes expensive; an upper bound on the filtration radius
is exposed as `max_edge_length`, and the routine will down-sample
transparently beyond a soft cap.
"""

from __future__ import annotations

from typing import Any, Dict, List, Tuple

import numpy as np


def compute_persistence(
    vectors: np.ndarray,
    max_dim: int = 1,
    max_edge_length: float | None = None,
    max_points: int = 1000,
    seed: int = 0,
) -> Dict[str, Any]:
    """Vietoris-Rips persistence via ripser.

    Returns a dict with H0 and H1 persistence pair arrays (birth, death, lifetime)
    and a compact summary. If the sample exceeds max_points, a random subset
    is used and the down-sampled indices are returned so the caller can
    relate persistence pairs back to original indices.
    """
    try:
        from ripser import ripser
    except ImportError as exc:
        raise RuntimeError(
            "ripser is not installed. Add `pip install ripser` and rerun."
        ) from exc

    n = vectors.shape[0]
    rng = np.random.default_rng(seed)
    if n > max_points:
        sampled_idx = np.sort(rng.choice(n, size=max_points, replace=False))
        subset = vectors[sampled_idx]
    else:
        sampled_idx = np.arange(n)
        subset = vectors

    kwargs: Dict[str, Any] = {"maxdim": max_dim}
    if max_edge_length is not None:
        kwargs["thresh"] = float(max_edge_length)

    result = ripser(subset, **kwargs)
    dgms = result.get("dgms", [])

    def _format(dgm: np.ndarray) -> List[Dict[str, float]]:
        out: List[Dict[str, float]] = []
        for birth, death in dgm:
            lifetime = float("inf") if not np.isfinite(death) else float(death - birth)
            out.append(
                {
                    "birth": float(birth),
                    "death": None if not np.isfinite(death) else float(death),
                    "lifetime": lifetime if lifetime != float("inf") else None,
                }
            )
        return out

    h0 = _format(dgms[0]) if len(dgms) > 0 else []
    h1 = _format(dgms[1]) if len(dgms) > 1 else []

    # Sort H1 by lifetime descending so the most persistent voids are first.
    def _sort_key(pair: Dict[str, float]) -> float:
        return pair["lifetime"] if pair["lifetime"] is not None else float("inf")

    h1_sorted = sorted(h1, key=_sort_key, reverse=True)

    h1_lifetimes = [
        p["lifetime"] for p in h1 if p["lifetime"] is not None and p["lifetime"] > 0
    ]

    summary = {
        "n_points_used": int(subset.shape[0]),
        "n_points_original": int(n),
        "downsampled": int(n) != int(subset.shape[0]),
        "max_edge_length": max_edge_length,
        "h0_count": len(h0),
        "h1_count": len(h1),
        "h1_mean_lifetime": float(np.mean(h1_lifetimes)) if h1_lifetimes else None,
        "h1_median_lifetime": float(np.median(h1_lifetimes)) if h1_lifetimes else None,
        "h1_max_lifetime": float(np.max(h1_lifetimes)) if h1_lifetimes else None,
    }

    return {
        "h0": h0,
        "h1": h1_sorted,
        "summary": summary,
        "sampled_indices": sampled_idx.tolist(),
    }
