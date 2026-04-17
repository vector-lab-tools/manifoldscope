"""
Sample loaders for Manifoldscope.

A sample is the finite, explicitly defined set of points that realises the
manifold for inspection. In Phase 0 the only loader supports the Philosophy of
Technology default; later phases will add Zotero, file import, Vectorscope
hidden-state export, and Theoryscope corpus-map import.
"""

from __future__ import annotations

from typing import List, Tuple

from sample.phil_of_tech import (
    SAMPLE_NAME as POT_NAME,
    PARTIALITY_NOTE as POT_PARTIALITY,
    get_sample as get_pot_sample,
)


def load_sample(name: str) -> Tuple[List[str], str]:
    """Return (items, partiality_note) for a named sample.

    Raises ValueError on unknown sample names.
    """
    if name in (POT_NAME, "pot", "philosophy-of-technology"):
        return get_pot_sample(), POT_PARTIALITY
    raise ValueError(f"Unknown sample: {name}")


AVAILABLE = [POT_NAME]
