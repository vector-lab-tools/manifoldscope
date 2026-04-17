"""
Axis projection onto the manifold.

For a pair of pole vocabularies (A, B), the axis vector is the difference of
their centroids in the ambient embedding space. Each sample point's position
on the axis is the cosine similarity to the unit axis vector. The per-point
position is a scalar in roughly [-1, +1]; positive leans toward pole A,
negative toward pole B. Used by the Ideological Topography and Normative
Transition operations.
"""

from __future__ import annotations

from typing import Tuple

import numpy as np


def axis_vector(pole_a: np.ndarray, pole_b: np.ndarray) -> np.ndarray:
    """Axis vector = centroid(A) − centroid(B), L2-normalised."""
    a = pole_a.mean(axis=0)
    b = pole_b.mean(axis=0)
    v = a - b
    n = float(np.linalg.norm(v))
    if n == 0:
        return np.zeros_like(v)
    return v / n


def project_onto_axis(
    vectors: np.ndarray,
    axis: np.ndarray,
) -> np.ndarray:
    """Per-point cosine with a unit axis vector."""
    if np.linalg.norm(axis) == 0:
        return np.zeros((vectors.shape[0],), dtype=np.float32)
    norms = np.linalg.norm(vectors, axis=1, keepdims=True)
    norms = np.where(norms > 0, norms, 1.0)
    unit = vectors / norms
    return (unit @ axis).astype(np.float32)


def similarity_to_centroid(
    vectors: np.ndarray,
    pole: np.ndarray,
) -> Tuple[np.ndarray, np.ndarray]:
    """Per-point cosine to a pole centroid. Returns (sim, centroid)."""
    centroid = pole.mean(axis=0)
    cnorm = float(np.linalg.norm(centroid))
    if cnorm == 0:
        return np.zeros((vectors.shape[0],), dtype=np.float32), centroid
    vnorms = np.linalg.norm(vectors, axis=1, keepdims=True)
    vnorms = np.where(vnorms > 0, vnorms, 1.0)
    unit = vectors / vnorms
    sim = (unit @ (centroid / cnorm)).astype(np.float32)
    return sim, centroid
