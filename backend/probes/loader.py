"""
Probe-file loaders.

Every probe is an editable Markdown file under `backend/probes/`. The shape
depends on the probe kind:

- **Flat list.** A single fenced code block listing the probe items, one per
  line. Used by the market-colonisation probe.
- **Axes.** A fenced `axes` code block with repeated `axis: name / A: .../
  B: ...` blocks. Used by the ideological-axes probe.
- **Two-list.** Two fenced code blocks named `is` and `ought` (or similar).
  Used by the normative-transition probe.

All loaders extract the ## Partiality note stanza too so the note travels
with the probe into the provenance record.
"""

from __future__ import annotations

import re
from pathlib import Path
from typing import Dict, List, Tuple


def _partiality(text: str) -> str:
    match = re.search(r"##\s*Partiality note\s*\n(.*?)(?=\n##\s|\Z)", text, re.S)
    return match.group(1).strip() if match else ""


def load_flat_list(path: Path) -> Tuple[List[str], str]:
    """Read a flat-list probe file. Looks for the last fenced code block."""
    text = path.read_text(encoding="utf-8")
    blocks = re.findall(r"```[^\n]*\n(.*?)\n```", text, re.S)
    if not blocks:
        raise ValueError(f"No fenced code block in {path}")
    items = [
        line.strip()
        for line in blocks[-1].splitlines()
        if line.strip() and not line.strip().startswith("#")
    ]
    return items, _partiality(text)


def load_axes(path: Path) -> Tuple[Dict[str, Tuple[List[str], List[str]]], str]:
    """Read an ideological-axes probe file.

    Returns (axes, partiality). The axes dict maps axis name to
    (pole_A_items, pole_B_items).
    """
    text = path.read_text(encoding="utf-8")
    match = re.search(r"```axes\s*\n(.*?)\n```", text, re.S)
    if not match:
        raise ValueError(f"No ```axes block in {path}")
    body = match.group(1)

    axes: Dict[str, Tuple[List[str], List[str]]] = {}
    current_axis: str | None = None
    pole_a: List[str] = []
    pole_b: List[str] = []

    def _split_items(line: str) -> List[str]:
        # Split on commas, strip whitespace, drop empties.
        return [part.strip() for part in line.split(",") if part.strip()]

    for raw in body.splitlines():
        line = raw.rstrip()
        if not line.strip():
            continue
        m_axis = re.match(r"\s*axis:\s*(\S+)\s*$", line)
        if m_axis:
            if current_axis is not None:
                axes[current_axis] = (pole_a, pole_b)
            current_axis = m_axis.group(1)
            pole_a, pole_b = [], []
            continue
        m_a = re.match(r"\s*A:\s*(.+)$", line)
        if m_a:
            pole_a = _split_items(m_a.group(1))
            continue
        m_b = re.match(r"\s*B:\s*(.+)$", line)
        if m_b:
            pole_b = _split_items(m_b.group(1))
            continue
    if current_axis is not None:
        axes[current_axis] = (pole_a, pole_b)

    if not axes:
        raise ValueError(f"No axes parsed from {path}")
    return axes, _partiality(text)


def load_named_blocks(path: Path, names: List[str]) -> Tuple[Dict[str, List[str]], str]:
    """Read a probe file with several named fenced blocks.

    The fence syntax is ```name on a line by itself. Returns (blocks,
    partiality), where blocks maps each requested name to its item list.
    """
    text = path.read_text(encoding="utf-8")
    blocks: Dict[str, List[str]] = {}
    for name in names:
        pattern = rf"```{re.escape(name)}\s*\n(.*?)\n```"
        match = re.search(pattern, text, re.S)
        if not match:
            raise ValueError(f"No ```{name} block in {path}")
        blocks[name] = [
            line.strip()
            for line in match.group(1).splitlines()
            if line.strip() and not line.strip().startswith("#")
        ]
    return blocks, _partiality(text)
