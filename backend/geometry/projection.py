"""3D projection helpers. Phase 0 uses PCA only; later phases add UMAP, etc."""

from __future__ import annotations

from typing import Tuple

import numpy as np
from sklearn.decomposition import PCA


def pca_3d(vectors: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
    """Project to 3D via PCA. Returns (coords_3d, explained_variance_ratio)."""
    n_components = min(3, vectors.shape[0], vectors.shape[1])
    pca = PCA(n_components=n_components)
    coords = pca.fit_transform(vectors)
    # Pad to 3D if the sample had fewer than 3 components possible.
    if coords.shape[1] < 3:
        padded = np.zeros((coords.shape[0], 3), dtype=np.float32)
        padded[:, : coords.shape[1]] = coords
        coords = padded
    return coords.astype(np.float32), pca.explained_variance_ratio_.astype(np.float32)
