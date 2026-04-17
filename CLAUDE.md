# Manifoldscope — Agent notes

This file gives Claude Code sessions operating inside the Manifoldscope repo the context they need. Follow the conventions below.

## The instrument, in one paragraph

Manifoldscope reads a single manifold intensively, in two registers. **Measure** characterises the manifold as an intrinsic geometric object (intrinsic dimension, curvature, geodesic structure, density field, topology, projection distortion, sampling bias). **Critique** reads the same manifold as an ideological object through manifold-wide probes (ideological topography, hegemonic gravity, market colonisation, colonial geometry, archaeology of absence, dead zones, grammatical ideology, dissensus). The binding commitment is that every Critique finding renders alongside a Measure attestation for the same region. Without it, cosine differences of small magnitude cannot be reliably distinguished from projection artefacts.

## Phase 0 — what ships now

- One Measure op: **Intrinsic Dimension Field** (TwoNN estimator, Facco et al. 2017).
- One Critique op: **Market-Colonisation Index** (probe list + centroid cosine, with a Measure-attestation card bound to it).
- Default sample: Philosophy of Technology concept list (shared with Theoryscope's Phase 0 corpus).
- Default embedder: `sentence-transformers/all-MiniLM-L6-v2` (open-weight, local).
- Tab shell: Measure / Critique / Atlas (Atlas is a stub).

## Conventions

### Provenance is non-negotiable

Every operation result must carry a `ProvenanceRecord`. The record is defined in `backend/provenance.py` and mirrored in `src/lib/provenance.ts`; keep the two in sync. Fields: `manifold` (provider + model + dimension), `sample` + `sample_hash`, `projection`, `metric`, `operation`, optional `probe`, `ingestion_timestamp`, `stability_score`, `notes` (sample partiality). If you are writing a new operation, the provenance record ships with the response — never as a separate endpoint.

### Declared sampling

The sample is part of the manifold, not its preamble. Every view renders the sample size, hash, and partiality note. When adding a new sample loader, include a partiality note. When adding a new probe, include a partiality note.

### Two-register binding

A Critique operation must expose a Measure attestation for the same region it reports on. See `backend/operations/market_colonisation.py` for the pattern: it computes the local TwoNN ID on the same sample and embeds the summary statistics in the response. The frontend renders the attestation via `components/binding/ProvenanceBindingCard`.

### Deep Dive

Every operation component has a collapsible `DeepDivePanel` at the bottom with the full quantitative breakdown. Convention shared with the rest of the Vector Lab. Mandatory.

### Versioning

Subminor patch bumps on each shipped operation (e.g. `0.0.1` → `0.0.2`). Version sourced from `package.json` only, mirrored via `src/lib/version.ts`. The backend `/status` endpoint reports its own version string; keep the two aligned at release.

### Probe lists are editable Markdown

Probes live in `backend/probes/*.md`. Each file has: a name, a register, a curator, a date, a version, a short description of what the probe measures, a partiality note, and the probe list as a fenced code block. Parse with the helper in `backend/operations/market_colonisation.py::_parse_probe_file`.

## Architecture in brief

```
backend/
  main.py                          FastAPI app, routes, CORS
  provenance.py                    ProvenanceRecord and friends
  sample/                          Sample loaders (PoT default)
  embed/                           Embedding pipelines (sentence-transformers default)
  geometry/                        Intrinsic dimension, projection, curvature (Phase 1a+)
  operations/                      One module per operation
  probes/                          Editable Markdown probe lists

src/
  app/                             Next.js App Router
    api/backend/[...path]/route.ts NDJSON-aware proxy to FastAPI
  components/
    layout/                        Header, TabNav
    operations/measure/            Measure-register op views
    operations/critique/           Critique-register op views
    operations/atlas/              Atlas views (stub in Phase 0)
    binding/                       ProvenanceBindingCard
    shared/                        DeepDivePanel, ProvenanceBadge
    viz/                           Plot3DWrapper
  context/                         ManifoldContext
  lib/                             provenance, streaming, utils, version
  types/                           Frontend types mirroring backend
```

## How to run, from scratch

```bash
# terminal 1 — backend
cd backend
./setup.sh
source .venv/bin/activate
uvicorn main:app --reload --port 8000

# terminal 2 — frontend
npm install
npm run dev
```

Open http://localhost:3000. Backend status shows green in the header when both are up.

## When adding a new operation

1. Add a backend module under `backend/operations/` that returns a dict with `provenance` filled in.
2. Register a route in `backend/main.py` with an `asyncio.to_thread` wrapper.
3. Add a result type in `src/types/manifold.ts`.
4. Add a view component in `src/components/operations/{measure,critique,atlas}/`.
5. If Critique, bind a Measure attestation by computing the local intrinsic-dimension stats on the same sample and embedding them in the response; render with `ProvenanceBindingCard`.
6. Ensure a Deep Dive panel is present with per-point quantitative data.

## Things not to do

- Do not use em dashes in text. Use commas or restructure. Matches David's style.
- Do not ship an operation without a provenance record.
- Do not ship a Critique operation without a Measure attestation in its response.
- Do not replace the sample display with a hidden constant. The sample is part of the manifold.
- Do not rely on cloud LLMs for core Measure numerics. Open-weight backbones are the default for operations whose claims touch training provenance.
- Do not attribute the open-weight / commercial-API-critique position to Castelle in drafts or docs; make the methodological point in David's own voice.

## Sibling instruments (in the Vector Lab)

- [Manifold Atlas](https://github.com/vector-lab-tools/manifold-atlas) — comparative, between models
- [Vectorscope](https://github.com/vector-lab-tools/vectorscope) — forensic, within a single open-weight model
- [Theoryscope](https://github.com/vector-lab-tools/theoryscope) — corpus geometry with RG method
- [LLMbench](https://github.com/vector-lab-tools/LLMbench) — close reading of model outputs as prose
