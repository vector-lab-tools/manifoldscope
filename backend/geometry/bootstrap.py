"""
Sampling-bias diagnostic for Manifoldscope.

The sample is part of the manifold. Any Measure operation is therefore also
an operation on the sampling. The diagnostic here bootstraps the local
intrinsic-dimension field: it resamples the sample with replacement N times,
recomputes local TwoNN on each bootstrap draw, and reports the per-point
standard deviation as a confidence band. Points with high bootstrap variance
are unstable under resampling; their local ID depends on which neighbours
happened to be in the sample. Points with low variance are robust.

The operation is deliberately simple in Phase 1a: bootstrap over the sample
indices only, reuse the same embedded vectors (so the bootstrap does not
include embedder noise). Phase 1a.2 will add a jackknife variant that drops
one concept at a time, and Phase 1b will add a cross-embedder bootstrap.
"""

from __future__ import annotations

from typing import Tuple

import numpy as np

from geometry.intrinsic_dimension import twonn_local


def bootstrap_local_id(
    vectors: np.ndarray,
    k: int = 20,
    n_bootstrap: int = 50,
    seed: int = 0,
) -> Tuple[np.ndarray, np.ndarray, dict]:
    """Resample with replacement, compute local TwoNN on each draw, report
    per-point standard deviation.

    Returns (mean_per_point, std_per_point, summary). The std per point is
    the headline diagnostic: high values are the unstable regions.
    """
    rng = np.random.default_rng(seed)
    n = vectors.shape[0]
    if n < 3 or n_bootstrap < 2:
        nan = np.full((n,), np.nan, dtype=np.float32)
        return nan, nan, {"n_bootstrap": 0}

    # For each bootstrap draw we record, for each original point that was
    # included, its local ID. Points not sampled in a given draw contribute
    # nothing to that draw's column. At the end, mean / std across the draws
    # they were in.
    sums = np.zeros((n,), dtype=np.float64)
    sumsqs = np.zeros((n,), dtype=np.float64)
    counts = np.zeros((n,), dtype=np.int32)

    effective_k = min(k, n - 1)

    for _ in range(n_bootstrap):
        idx = rng.integers(low=0, high=n, size=n)
        boot_vectors = vectors[idx]
        local = twonn_local(boot_vectors, k=effective_k)
        # Map bootstrap positions back to original indices; if an original
        # index i was drawn multiple times, average its local values on this
        # bootstrap.
        for j, orig in enumerate(idx):
            v = float(local[j]) if np.isfinite(local[j]) else np.nan
            if np.isfinite(v):
                sums[orig] += v
                sumsqs[orig] += v * v
                counts[orig] += 1

    mean = np.divide(
        sums,
        counts,
        out=np.full_like(sums, np.nan),
        where=counts > 0,
    )
    # Unbiased std where counts >= 2.
    with np.errstate(invalid="ignore"):
        variance = np.divide(
            sumsqs,
            counts,
            out=np.full_like(sumsqs, np.nan),
            where=counts > 0,
        ) - mean * mean
        variance = np.where(variance < 0, 0.0, variance)
        std = np.sqrt(variance)
    std = np.where(counts < 2, np.nan, std)

    std_valid = std[np.isfinite(std)]
    summary = {
        "n_bootstrap": int(n_bootstrap),
        "seed": int(seed),
        "mean_coverage": float(np.mean(counts / n_bootstrap)),
        "median_std": float(np.median(std_valid)) if std_valid.size else None,
        "mean_std": float(np.mean(std_valid)) if std_valid.size else None,
        "max_std": float(np.max(std_valid)) if std_valid.size else None,
        "n_valid_points": int(np.sum(np.isfinite(std))),
    }
    return mean.astype(np.float32), std.astype(np.float32), summary
