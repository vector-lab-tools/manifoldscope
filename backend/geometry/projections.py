"""
Extra 3D projections for Manifoldscope: UMAP, t-SNE, PaCMAP, Isomap.

PCA lives in geometry/projection.py. The Projection-Distortion Meter uses
all five methods side by side with stress and trustworthiness scores so
that the non-neutrality of projection is itself visible.

PaCMAP is optional: if the package is not installed the function raises
RuntimeError with a clear message; the caller should fall back to the
remaining methods and flag the absence in the response.
"""

from __future__ import annotations

from typing import Tuple

import numpy as np


def pca_project(vectors: np.ndarray) -> Tuple[np.ndarray, float]:
    """3D PCA projection. Returns (coords, total_explained_variance)."""
    from sklearn.decomposition import PCA

    n_components = min(3, vectors.shape[0], vectors.shape[1])
    pca = PCA(n_components=n_components)
    coords = pca.fit_transform(vectors)
    if coords.shape[1] < 3:
        padded = np.zeros((coords.shape[0], 3), dtype=np.float32)
        padded[:, : coords.shape[1]] = coords
        coords = padded
    return coords.astype(np.float32), float(pca.explained_variance_ratio_.sum())


def umap_project(
    vectors: np.ndarray,
    n_neighbors: int = 15,
    min_dist: float = 0.1,
    seed: int = 0,
) -> np.ndarray:
    """3D UMAP projection."""
    import umap

    reducer = umap.UMAP(
        n_components=3,
        n_neighbors=min(n_neighbors, max(2, vectors.shape[0] - 1)),
        min_dist=min_dist,
        random_state=seed,
    )
    return reducer.fit_transform(vectors).astype(np.float32)


def tsne_project(
    vectors: np.ndarray,
    perplexity: float = 30.0,
    seed: int = 0,
) -> np.ndarray:
    """3D t-SNE projection."""
    from sklearn.manifold import TSNE

    n = vectors.shape[0]
    effective_perp = max(5.0, min(perplexity, (n - 1) / 3.0))
    tsne = TSNE(
        n_components=3,
        perplexity=effective_perp,
        random_state=seed,
        init="pca",
    )
    return tsne.fit_transform(vectors).astype(np.float32)


def isomap_project(
    vectors: np.ndarray,
    n_neighbors: int = 10,
) -> np.ndarray:
    """3D Isomap projection via shortest-path geodesics on k-NN graph."""
    from sklearn.manifold import Isomap

    n = vectors.shape[0]
    effective_k = min(n_neighbors, max(2, n - 1))
    iso = Isomap(n_components=3, n_neighbors=effective_k)
    return iso.fit_transform(vectors).astype(np.float32)


def pacmap_project(
    vectors: np.ndarray,
    n_neighbors: int = 10,
    seed: int = 0,
) -> np.ndarray:
    """3D PaCMAP projection. Raises RuntimeError if pacmap is unavailable."""
    try:
        import pacmap
    except ImportError as exc:
        raise RuntimeError(
            "pacmap is not installed. Add `pip install pacmap` and rerun."
        ) from exc

    reducer = pacmap.PaCMAP(
        n_components=3,
        n_neighbors=min(n_neighbors, max(2, vectors.shape[0] - 1)),
        random_state=seed,
    )
    return reducer.fit_transform(vectors, init="pca").astype(np.float32)
