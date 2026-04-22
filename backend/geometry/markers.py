"""
Per-concept distribution over marker categories.

Used by the Training-Data Fingerprinting and Temporal Sedimentation
operations. Both read a probe file of the shape:

    category: name_a
      markers: term_1, term_2, ...
    category: name_b
      markers: ...

For each sample point, compute cosine similarity to each category
centroid and softmax the similarities into a distribution. The softmax
temperature is exposed as a parameter so that the distribution can be
tightened or loosened for display.
"""

from __future__ import annotations

from typing import Dict, List, Tuple

import numpy as np


def _normalise_similarities(sims: np.ndarray, temperature: float = 1.0) -> np.ndarray:
    """Softmax over categories with a temperature in (0, ∞)."""
    if temperature <= 0:
        temperature = 1.0
    scaled = sims / temperature
    scaled = scaled - scaled.max(axis=1, keepdims=True)
    exp = np.exp(scaled)
    denom = exp.sum(axis=1, keepdims=True)
    denom = np.where(denom > 0, denom, 1.0)
    return exp / denom


def category_similarities(
    sample_vectors: np.ndarray,
    category_centroids: Dict[str, np.ndarray],
) -> Tuple[List[str], np.ndarray]:
    """Return (category_names, raw_similarity_matrix).

    Shape: (n_points, n_categories). Each entry is cosine similarity.
    """
    names = list(category_centroids.keys())
    if not names:
        return [], np.zeros((sample_vectors.shape[0], 0), dtype=np.float32)

    centroids = np.stack([category_centroids[n] for n in names], axis=0)
    # Normalise both sides.
    s_norm = np.linalg.norm(sample_vectors, axis=1, keepdims=True)
    s_norm = np.where(s_norm > 0, s_norm, 1.0)
    s_unit = sample_vectors / s_norm

    c_norm = np.linalg.norm(centroids, axis=1, keepdims=True)
    c_norm = np.where(c_norm > 0, c_norm, 1.0)
    c_unit = centroids / c_norm

    sims = (s_unit @ c_unit.T).astype(np.float32)
    return names, sims


def category_distribution(
    sample_vectors: np.ndarray,
    category_centroids: Dict[str, np.ndarray],
    temperature: float = 0.1,
) -> Tuple[List[str], np.ndarray, np.ndarray]:
    """Return (category_names, similarities, distribution).

    `similarities` is the raw cosine similarity matrix.
    `distribution` is the softmax over categories per point.
    """
    names, sims = category_similarities(sample_vectors, category_centroids)
    if not names:
        return names, sims, np.zeros_like(sims)
    dist = _normalise_similarities(sims, temperature=temperature)
    return names, sims, dist.astype(np.float32)
