"""
Provenance records for Manifoldscope.

Every Manifoldscope result carries a ProvenanceRecord so that findings can be
reproduced and cited. The binding commitment of the instrument is made concrete
here: manifold source, sample, metric, projection, probe list, and parameters
all travel with the result rather than separately from it. Mirror this schema
in src/lib/provenance.ts on the frontend.
"""

from __future__ import annotations

import hashlib
import json
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


@dataclass
class ManifoldSource:
    """Identifies the manifold being read: provider + model + dimension."""

    provider: str  # "sentence-transformers" | "openai" | "voyage" | "google" | ...
    model_id: str  # e.g. "sentence-transformers/all-MiniLM-L6-v2"
    model_revision: str = ""  # HF commit hash when known
    dimension: int = 0


@dataclass
class SampleSpec:
    """The finite set of points that realises the manifold for inspection."""

    kind: str  # "concept-list" | "zotero" | "file" | "import"
    identifier: str
    item_count: int = 0
    filters: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ProjectionSpec:
    """How the high-dimensional manifold is rendered to 3D for display."""

    method: str = "pca"  # "pca" | "umap" | "tsne" | "pacmap" | "isomap"
    params: Dict[str, Any] = field(default_factory=dict)


@dataclass
class MetricSpec:
    """The distance function used for neighbour computations."""

    method: str = "cosine"  # "cosine" | "euclidean" | "geodesic" | "diffusion"
    params: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ProbeSpec:
    """A curated probe list with explicit partiality. Critique-register only."""

    name: str
    list_hash: str
    partiality_note: str = ""
    item_count: int = 0


@dataclass
class ProvenanceRecord:
    """Binding record carried with every Manifoldscope operation result."""

    manifold: ManifoldSource
    sample: SampleSpec
    sample_hash: str
    projection: ProjectionSpec
    metric: MetricSpec
    operation: str
    probe: Optional[ProbeSpec] = None
    ingestion_timestamp: str = ""
    stability_score: Optional[float] = None
    notes: str = ""

    def to_dict(self) -> Dict[str, Any]:
        out = asdict(self)
        return out


def hash_sample(items: List[str]) -> str:
    """SHA-256 over the sorted sample items. Deterministic for reuse."""
    blob = json.dumps(sorted(items), sort_keys=True).encode("utf-8")
    return hashlib.sha256(blob).hexdigest()


def hash_probe(items: List[str]) -> str:
    """SHA-256 over the sorted probe-list items."""
    blob = json.dumps(sorted(items), sort_keys=True).encode("utf-8")
    return hashlib.sha256(blob).hexdigest()


def now_utc_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")
