"""
Open-weight embedding pipeline for Manifoldscope Phase 0.

Wraps sentence-transformers so that a list of concepts becomes a numpy array of
vectors, along with the model id and its dimensionality. Follows the same
pattern as Theoryscope's embedding module. Later phases will register OpenAI,
Voyage, Google, Cohere, HuggingFace, and Ollama via the frontend embedding
client; the backend will continue to host the default local embedder.
"""

from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
from typing import List, Tuple

import numpy as np


DEFAULT_MODEL_ID = "sentence-transformers/all-MiniLM-L6-v2"


@dataclass
class EmbeddingResult:
    model_id: str
    dimension: int
    vectors: np.ndarray  # shape (n_items, dimension)


@lru_cache(maxsize=2)
def _load_model(model_id: str):
    # Local import keeps module import-time cheap when the backend is only
    # serving cached results.
    from sentence_transformers import SentenceTransformer

    return SentenceTransformer(model_id)


def embed(
    items: List[str],
    model_id: str = DEFAULT_MODEL_ID,
) -> EmbeddingResult:
    """Embed a list of concepts with the specified open-weight model."""
    model = _load_model(model_id)
    vectors = model.encode(
        items,
        show_progress_bar=False,
        convert_to_numpy=True,
        normalize_embeddings=False,
    )
    return EmbeddingResult(
        model_id=model_id,
        dimension=int(vectors.shape[1]),
        vectors=vectors.astype(np.float32),
    )
